import dotenv from "dotenv";
dotenv.config({ override: true });

import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { Octokit } from "octokit";
import { GoogleGenAI, Type } from "@google/genai";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

// ─────────────────────────────────────────────
// 1. ENVIRONMENT VALIDATION (fail fast)
// ─────────────────────────────────────────────
function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required environment variable: ${name}`);
  return val;
}

const JWT_SECRET = requireEnv("JWT_SECRET");
const GEMINI_API_KEY = requireEnv("GEMINI_API_KEY");
const GITHUB_CLIENT_ID = requireEnv("GITHUB_CLIENT_ID");
const GITHUB_CLIENT_SECRET = requireEnv("GITHUB_CLIENT_SECRET");

const PORT = parseInt(process.env.PORT || "3000", 10);
const IS_PROD = process.env.NODE_ENV === "production";
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;

// ─────────────────────────────────────────────
// 2. TYPES
// ─────────────────────────────────────────────
interface SessionUser {
  id: number;
  email: string | null;
  user_name: string;
  avatar_url: string;
  name: string | null;
}

interface JwtPayload {
  user: SessionUser;
  jti: string;
}

interface BugReport {
  bugType: "LINTING" | "SYNTAX" | "LOGIC" | "TYPE_ERROR" | "IMPORT" | "INDENTATION";
  lineNumber: number;
  description: string;
}

interface GeminiResult {
  hasBugs: boolean;
  finalFixedCode: string;
  commitMessage: string;
  bugs: BugReport[];
}

interface FixEntry {
  file: string;
  bugType: string;
  lineNumber: number;
  commitMessage: string;
  status: "Fixed" | "Failed";
}

// In-memory token store: jti -> encrypted GitHub access token + expiration
// Replace with Redis in production for multi-instance deployments
const tokenStore = new Map<string, { encrypted: string; expiresAt: number }>();

// ─────────────────────────────────────────────
// 3. CRYPTO HELPERS
// ─────────────────────────────────────────────
function encryptToken(plaintext: string): string {
  const key = crypto.createHash("sha256").update(JWT_SECRET).digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString("base64"), authTag.toString("base64"), encrypted.toString("base64")].join(":");
}

function decryptToken(ciphertext: string): string {
  const key = crypto.createHash("sha256").update(JWT_SECRET).digest();
  const [ivB64, tagB64, dataB64] = ciphertext.split(":");
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(tagB64, "base64");
  const data = Buffer.from(dataB64, "base64");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

function timingSafeStringEqual(a: string, b: string): boolean {
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────
// 4. AUTH MIDDLEWARE
// ─────────────────────────────────────────────
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.session;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    if (!tokenStore.has(decoded.jti)) {
      return res.status(401).json({ error: "Session expired. Please sign in again." });
    }
    (req as any).sessionData = decoded;
    next();
  } catch {
    res.clearCookie("session");
    return res.status(401).json({ error: "Invalid session. Please sign in again." });
  }
}

// ─────────────────────────────────────────────
// 5. VALIDATION HELPERS
// ─────────────────────────────────────────────
function parseGitHubUrl(repoUrl: string): { owner: string; repo: string } | null {
  try {
    const url = new URL(repoUrl);
    if (url.hostname !== "github.com") return null;
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1].replace(/\.git$/, "") };
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// 6. CONSTANTS
// ─────────────────────────────────────────────
const SUPPORTED_EXTENSIONS = [".py", ".js", ".ts", ".jsx", ".tsx", ".java", ".go", ".rb", ".rs", ".c", ".cpp"];
const MAX_FILES_PER_ANALYSIS = 10;
const MAX_FILE_SIZE_BYTES = 100_000; // 100 KB

// ─────────────────────────────────────────────
// 7. SERVER SETUP
// ─────────────────────────────────────────────
async function startServer() {
  const app = express();

  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: IS_PROD ? undefined : false,
    })
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  // Rate limiters
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many auth requests. Please try again later." },
  });

  const analyzeLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Analysis rate limit reached. Maximum 10 per hour." },
  });

  // ─── GitHub OAuth: Start ───
  app.get("/api/auth/github", authLimiter, (_req, res) => {
    const state = crypto.randomUUID();
    res.cookie("oauth_state", state, {
      httpOnly: true,
      secure: IS_PROD,
      maxAge: 10 * 60 * 1000,
      sameSite: "lax",
    });

    const redirectUri = `${APP_URL}/api/auth/github/callback`;
    const url = new URL("https://github.com/login/oauth/authorize");
    url.searchParams.set("client_id", GITHUB_CLIENT_ID);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("scope", "repo read:user user:email");
    url.searchParams.set("state", state);

    res.redirect(url.toString());
  });

  // ─── GitHub OAuth: Callback ───
  app.get("/api/auth/github/callback", authLimiter, async (req, res) => {
    const { code, state } = req.query;
    const storedState = req.cookies?.oauth_state;

    if (
      !code ||
      typeof code !== "string" ||
      typeof state !== "string" ||
      !storedState ||
      !timingSafeStringEqual(state, storedState)
    ) {
      return res.status(400).send("Invalid OAuth callback. Please try signing in again.");
    }

    res.clearCookie("oauth_state");

    try {
      const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: `${APP_URL}/api/auth/github/callback`,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error(`GitHub token exchange failed: ${tokenResponse.statusText}`);
      }

      const tokenData = (await tokenResponse.json()) as any;
      if (tokenData.error) {
        console.error("GitHub token exchange error:", tokenData.error);
        return res.status(400).send("OAuth authentication failed. Please try again.");
      }

      const userResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });

      if (!userResponse.ok) {
        throw new Error("Failed to fetch GitHub user info.");
      }

      const userData = (await userResponse.json()) as any;

      // Store encrypted provider token server-side with expiration tracking
      const jti = crypto.randomUUID();
      tokenStore.set(jti, {
        encrypted: encryptToken(tokenData.access_token),
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      const sessionToken = jwt.sign(
        {
          user: {
            id: userData.id,
            email: userData.email ?? null,
            user_name: userData.login,
            avatar_url: userData.avatar_url,
            name: userData.name ?? null,
          } satisfies SessionUser,
          jti,
        } satisfies JwtPayload,
        JWT_SECRET,
        { expiresIn: "7d", algorithm: "HS256" }
      );

      res.cookie("session", sessionToken, {
        httpOnly: true,
        secure: IS_PROD,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: "lax",
      });

      // Redirect back to the dashboard after successful auth
      res.redirect("/dashboard");
    } catch (error) {
      console.error("OAuth callback error:", error instanceof Error ? error.message : error);
      res.status(500).send("Authentication failed. Please try again.");
    }
  });

  // ─── Get Session ───
  app.get("/api/auth/session", (req, res) => {
    const token = req.cookies?.session;
    if (!token) return res.json({ user: null, session: null });

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      if (!tokenStore.has(decoded.jti)) {
        res.clearCookie("session");
        return res.json({ user: null, session: null });
      }
      // Only return what the frontend needs -- provider_token stays server-side
      res.json({
        user: decoded.user,
        session: { access_token: token },
      });
    } catch {
      res.clearCookie("session");
      res.json({ user: null, session: null });
    }
  });

  // ─── Sign Out ───
  app.post("/api/auth/signout", (req, res) => {
    const token = req.cookies?.session;
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        tokenStore.delete(decoded.jti);
      } catch { /* already invalid */ }
    }
    res.clearCookie("session");
    res.json({ success: true });
  });

  // ─── Analyze Repository ───
  app.post("/api/analyze", analyzeLimiter, requireAuth, async (req: Request, res: Response) => {
    const { repoUrl } = req.body;

    if (!repoUrl || typeof repoUrl !== "string") {
      return res.status(400).json({ error: "repoUrl is required and must be a string." });
    }

    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
      return res.status(400).json({ error: "Invalid GitHub repository URL. Expected: https://github.com/owner/repo" });
    }

    const { owner, repo } = parsed;

    // Retrieve provider token from secure server-side store
    const sessionData = (req as any).sessionData as JwtPayload;
    const tokenEntry = tokenStore.get(sessionData.jti);
    if (!tokenEntry) {
      return res.status(401).json({ error: "Session token not found. Please sign in again." });
    }

    let githubToken: string;
    try {
      githubToken = decryptToken(tokenEntry.encrypted);
    } catch {
      return res.status(500).json({ error: "Failed to retrieve credentials. Please sign in again." });
    }

    const startTime = Date.now();

    try {
      const octokit = new Octokit({ auth: githubToken });
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

      const branchName = `codeheal_fix_${Date.now()}`;

      // 1. Validate repo access and get default branch
      let repoData: any;
      try {
        const result = await octokit.rest.repos.get({ owner, repo });
        repoData = result.data;
      } catch (err: any) {
        if (err.status === 404) {
          return res.status(404).json({ error: "Repository not found or you don't have access to it." });
        }
        throw err;
      }

      const defaultBranch = repoData.default_branch;

      // 2. Get latest commit SHA
      const { data: refData } = await octokit.rest.git.getRef({
        owner,
        repo,
        ref: `heads/${defaultBranch}`,
      });
      const baseSha = refData.object.sha;

      // 3. Create fix branch
      try {
        await octokit.rest.git.createRef({
          owner,
          repo,
          ref: `refs/heads/${branchName}`,
          sha: baseSha,
        });
      } catch (err: any) {
        if (err.status !== 422) throw err;
      }

      // 4. Fetch file tree
      const { data: treeData } = await octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: baseSha,
        recursive: "1",
      });

      const filesToAnalyze = treeData.tree.filter(
        (file) =>
          file.type === "blob" &&
          file.path &&
          SUPPORTED_EXTENSIONS.some((ext) => file.path!.endsWith(ext)) &&
          (file.size ?? 0) <= MAX_FILE_SIZE_BYTES
      );

      if (filesToAnalyze.length === 0) {
        return res.json({
          repoUrl,
          branchName,
          totalFailures: 0,
          totalFixes: 0,
          status: "NO_BUGS_FOUND",
          timeTaken: "0m 0s",
          scoreDetails: { baseScore: 100, speedBonus: 0, fixRateBonus: 0, totalScore: 100 },
          fixes: [],
          timeline: [
            { iteration: 1, status: "STARTED", timestamp: new Date(startTime).toISOString() },
            { iteration: 1, status: "NO_BUGS_FOUND", timestamp: new Date().toISOString() },
          ],
          iterationsUsed: 1,
          retryLimit: 5,
        });
      }

      const fixes: FixEntry[] = [];
      let totalFailures = 0;
      let totalFixes = 0;

      // 5. Analyze files with concurrency control (3 at a time)
      const limited = filesToAnalyze.slice(0, MAX_FILES_PER_ANALYSIS);

      async function analyzeFile(file: (typeof limited)[number]) {
        if (!file.path) return;

        let content: string;
        try {
          const { data: fileData } = await octokit.rest.repos.getContent({
            owner,
            repo,
            path: file.path,
            ref: baseSha,
          });

          if (Array.isArray(fileData) || !("content" in fileData)) return;
          content = Buffer.from(fileData.content, "base64").toString("utf8");
        } catch (err) {
          console.error(`Failed to fetch file ${file.path}:`, err);
          return;
        }

        const prompt = buildAnalysisPrompt(file.path, content);

        let result: GeminiResult;
        try {
          const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  hasBugs: { type: Type.BOOLEAN },
                  finalFixedCode: { type: Type.STRING },
                  commitMessage: { type: Type.STRING },
                  bugs: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        bugType: { type: Type.STRING },
                        lineNumber: { type: Type.INTEGER },
                        description: { type: Type.STRING },
                      },
                      required: ["bugType", "lineNumber", "description"],
                    },
                  },
                },
                required: ["hasBugs", "bugs", "finalFixedCode", "commitMessage"],
              },
            },
          });
          result = JSON.parse(response.text || "{}") as GeminiResult;
        } catch (geminiError) {
          console.error(`Gemini API failed for file ${file.path}:`, geminiError);
          throw new Error(`AI analysis failed for ${file.path}. Please try again later.`);
        }

        if (!result.hasBugs || !result.bugs?.length) return;

        const commitMsg = `[CodeHeal] ${sanitizeCommitMessage(result.commitMessage || `Fix bugs in ${file.path}`)}`;

        try {
          const { data: currentFileData } = await octokit.rest.repos.getContent({
            owner,
            repo,
            path: file.path,
            ref: branchName,
          });

          const fileSha =
            !Array.isArray(currentFileData) && "sha" in currentFileData
              ? currentFileData.sha
              : undefined;

          await octokit.rest.repos.createOrUpdateFileContents({
            owner,
            repo,
            path: file.path,
            message: commitMsg,
            content: Buffer.from(result.finalFixedCode).toString("base64"),
            branch: branchName,
            sha: fileSha,
          });

          for (const bug of result.bugs) {
            totalFailures++;
            totalFixes++;
            fixes.push({
              file: file.path,
              bugType: bug.bugType,
              lineNumber: bug.lineNumber,
              commitMessage: commitMsg,
              status: "Fixed",
            });
          }
        } catch (commitErr) {
          console.error(`Failed to commit fix for ${file.path}:`, commitErr);
          for (const bug of result.bugs) {
            totalFailures++;
            fixes.push({
              file: file.path,
              bugType: bug.bugType,
              lineNumber: bug.lineNumber,
              commitMessage: commitMsg,
              status: "Failed",
            });
          }
        }
      }

      // Run with concurrency limit (3 at a time)
      const CONCURRENCY = 3;
      for (let i = 0; i < limited.length; i += CONCURRENCY) {
        await Promise.all(limited.slice(i, i + CONCURRENCY).map(analyzeFile));
      }

      const endTime = Date.now();
      const timeTakenMs = endTime - startTime;

      const allFixed = totalFailures > 0 && totalFailures === totalFixes;
      const status =
        totalFixes === 0 && totalFailures === 0
          ? "NO_BUGS_FOUND"
          : allFixed
            ? "PASSED"
            : "FAILED";

      const finalResults = {
        repoUrl,
        branchName,
        totalFailures,
        totalFixes,
        status,
        timeTaken: formatDuration(timeTakenMs),
        scoreDetails: computeScore(totalFailures, totalFixes, timeTakenMs),
        fixes,
        timeline: [
          { iteration: 1, status: "STARTED", timestamp: new Date(startTime).toISOString() },
          { iteration: 1, status, timestamp: new Date(endTime).toISOString() },
        ],
        iterationsUsed: 1,
        retryLimit: 5,
      };

      return res.json(finalResults);
    } catch (error) {
      console.error("Agent execution failed:", error instanceof Error ? error.message : error);
      return res.status(500).json({ error: "An error occurred during analysis. Please try again." });
    }
  });

  // ─── Vite / Static ───
  if (!IS_PROD) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  // Global error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Unhandled error:", err.message);
    res.status(500).json({ error: "Internal server error." });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on ${APP_URL}`);
    console.log(`Environment: ${IS_PROD ? "production" : "development"}`);
  });
}

// ─────────────────────────────────────────────
// 8. PURE HELPER FUNCTIONS
// ─────────────────────────────────────────────
function buildAnalysisPrompt(filePath: string, content: string): string {
  return `You are an expert code reviewer. Analyze the following code for bugs.

Bug categories: LINTING, SYNTAX, LOGIC, TYPE_ERROR, IMPORT, INDENTATION

RULES:
1. Fix typos in import statements (e.g. 'numppy' -> 'numpy'). Do NOT remove the import.
2. Preserve the original intent of the code. Do not delete lines unless strictly necessary.
3. Only report real bugs. Do not invent issues or make stylistic changes.
4. If hasBugs is false, set finalFixedCode to the original code unchanged.

File: ${filePath}

\`\`\`
${content}
\`\`\`

Respond ONLY with valid JSON matching the schema. No explanation outside the JSON.`;
}

function sanitizeCommitMessage(msg: string): string {
  return msg.replace(/[\r\n]+/g, " ").slice(0, 72);
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  return `${minutes}m ${seconds}s`;
}

function computeScore(
  totalFailures: number,
  totalFixes: number,
  timeTakenMs: number
): { baseScore: number; speedBonus: number; fixRateBonus: number; totalScore: number } {
  const baseScore = 100;
  const speedBonus = totalFixes > 0 ? (timeTakenMs < 60_000 ? 20 : timeTakenMs < 120_000 ? 10 : 0) : 0;
  const fixRate = totalFailures > 0 ? totalFixes / totalFailures : 1;
  const fixRateBonus = Math.round(fixRate * 30);
  const totalScore = Math.min(150, Math.max(0, baseScore + speedBonus + fixRateBonus));
  return { baseScore, speedBonus, fixRateBonus, totalScore };
}

// ─────────────────────────────────────────────
// 9. BOOTSTRAP
// ─────────────────────────────────────────────
// Cleanup expired tokenStore entries every 6 hours to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [jti, entry] of tokenStore.entries()) {
    if (entry.expiresAt < now) {
      tokenStore.delete(jti);
    }
  }
}, 6 * 60 * 60 * 1000);

startServer().catch((err) => {
  console.error("Fatal startup error:", err.message);
  process.exit(1);
});
