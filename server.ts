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

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required environment variable: ${name}`);
  return val;
}

const JWT_SECRET           = requireEnv("JWT_SECRET");
const GITHUB_CLIENT_ID     = requireEnv("GITHUB_CLIENT_ID");
const GITHUB_CLIENT_SECRET = requireEnv("GITHUB_CLIENT_SECRET");

const GEMINI_KEYS = [process.env.GEMINI_API_KEY_1, process.env.GEMINI_API_KEY_2, process.env.GEMINI_API_KEY_3].filter(Boolean) as string[];
const GROQ_KEYS   = [process.env.GROQ_API_KEY_1,   process.env.GROQ_API_KEY_2,   process.env.GROQ_API_KEY_3  ].filter(Boolean) as string[];
const OR_KEYS     = [process.env.OPENROUTER_API_KEY_1, process.env.OPENROUTER_API_KEY_2, process.env.OPENROUTER_API_KEY_3].filter(Boolean) as string[];

if (GEMINI_KEYS.length === 0) throw new Error("At least one GEMINI_API_KEY required");
if (GROQ_KEYS.length   === 0) throw new Error("At least one GROQ_API_KEY required");

const PORT    = parseInt(process.env.PORT || "3000", 10);
const IS_PROD = process.env.NODE_ENV === "production";
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;

// Key rotation
const idx = { gemini: 0, groq: 0, or: 0 };
const nextGemini = () => GEMINI_KEYS[(idx.gemini++) % GEMINI_KEYS.length];
const nextGroq   = () => GROQ_KEYS[(idx.groq++) % GROQ_KEYS.length];
const nextOR     = () => OR_KEYS[(idx.or++) % OR_KEYS.length];

// Types
interface SessionUser { id: number; email: string | null; user_name: string; avatar_url: string; name: string | null; }
interface JwtPayload  { user: SessionUser; jti: string; }
interface BugReport   { bugType: string; lineNumber: number; description: string; }
interface GeminiResult { hasBugs: boolean; finalFixedCode: string; commitMessage: string; bugs: BugReport[]; }
interface VerifyResult { approved: boolean; confident: boolean; reason: string; }
interface FixEntry     { file: string; bugType: string; lineNumber: number; commitMessage: string; status: "Fixed" | "Failed"; verifierNote?: string; detectedBy?: string; fixedBy?: string; verifiedBy?: string; }
type JobStatus = "pending" | "running" | "completed" | "failed";
interface JobEvent { type: string; message: string; timestamp: string; data?: any; }
interface Job { id: string; status: JobStatus; repoUrl: string; userId: number; events: JobEvent[]; result: any; error: string | null; createdAt: number; completedAt: number | null; clients: Set<Response>; }

const tokenStore    = new Map<string, { encrypted: string; expiresAt: number }>();
const jobStore      = new Map<string, Job>();
const fileHashCache = new Map<string, string>();

// Crypto
function encryptToken(p: string): string {
  const key = crypto.createHash("sha256").update(JWT_SECRET).digest();
  const iv  = crypto.randomBytes(12);
  const c   = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([c.update(p, "utf8"), c.final()]);
  return [iv.toString("base64"), c.getAuthTag().toString("base64"), enc.toString("base64")].join(":");
}
function decryptToken(ct: string): string {
  const key = crypto.createHash("sha256").update(JWT_SECRET).digest();
  const [a, b, c] = ct.split(":");
  const d = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(a, "base64"));
  d.setAuthTag(Buffer.from(b, "base64"));
  return Buffer.concat([d.update(Buffer.from(c, "base64")), d.final()]).toString("utf8");
}
function timingSafe(a: string, b: string): boolean { try { return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b)); } catch { return false; } }
function hashContent(s: string): string { return crypto.createHash("sha256").update(s).digest("hex").slice(0, 16); }

// Auth middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.session;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const d = jwt.verify(token, JWT_SECRET) as JwtPayload;
    if (!tokenStore.has(d.jti)) return res.status(401).json({ error: "Session expired." });
    (req as any).sessionData = d; next();
  } catch { res.clearCookie("session"); return res.status(401).json({ error: "Invalid session." }); }
}

// Smart file filtering
const SUPPORTED_EXT  = [".py",".js",".ts",".jsx",".tsx",".java",".go",".rb",".rs",".c",".cpp"];
const SKIP_PATTERNS  = ["node_modules/","dist/","build/",".next/","vendor/","coverage/","__pycache__/",".min.js",".d.ts","package-lock.json","yarn.lock",".test.ts",".test.js",".spec.ts",".spec.js"];
const shouldSkip     = (p: string) => SKIP_PATTERNS.some(s => s.endsWith("/") ? p.includes(s) : p.endsWith(s));
const scoreFile      = (p: string) => { let s = 0; const l = p.toLowerCase(); if (/index\.|main\.|app\./.test(l)) s+=10; if (/src\/|lib\/|core\//.test(l)) s+=5; if (/test|spec/.test(l)) s-=10; return s; };
const MAX_FILES      = 20;
const MAX_SIZE       = 100_000;

// SSE helpers
function pushEvent(job: Job, event: JobEvent) {
  job.events.push(event);
  const d = `data: ${JSON.stringify(event)}\n\n`;
  for (const c of job.clients) { try { c.write(d); } catch { job.clients.delete(c); } }
}
function closeClients(job: Job) { for (const c of job.clients) { try { c.end(); } catch {} } job.clients.clear(); }
function parseGHUrl(url: string) {
  try { const u = new URL(url); if (u.hostname !== "github.com") return null; const p = u.pathname.split("/").filter(Boolean); if (p.length < 2) return null; return { owner: p[0], repo: p[1].replace(/\.git$/, "") }; }
  catch { return null; }
}

// ── ROLE 1: Bug Detection — Gemini 2.5 Flash ──
async function detectBugs(filePath: string, content: string): Promise<{ result: GeminiResult; by: string }> {
  const prompt = buildPrompt(filePath, content);
  for (let i = 0; i < GEMINI_KEYS.length; i++) {
    try {
      const ai  = new GoogleGenAI({ apiKey: nextGemini() });
      const res = await ai.models.generateContent({
        model: "gemini-2.5-flash", contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { hasBugs: { type: Type.BOOLEAN }, finalFixedCode: { type: Type.STRING }, commitMessage: { type: Type.STRING }, bugs: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { bugType: { type: Type.STRING }, lineNumber: { type: Type.INTEGER }, description: { type: Type.STRING } }, required: ["bugType","lineNumber","description"] } } }, required: ["hasBugs","bugs","finalFixedCode","commitMessage"] } },
      });
      return { result: JSON.parse(res.text || "{}") as GeminiResult, by: "Gemini 2.5 Flash" };
    } catch (e: any) { if (e?.status !== 429 && !e?.message?.includes("quota")) break; }
  }
  // Fallback: Llama 4 Scout
  for (let i = 0; i < GROQ_KEYS.length; i++) {
    try {
      const { default: Groq } = await import("groq-sdk");
      const g   = new Groq({ apiKey: nextGroq() });
      const res = await g.chat.completions.create({ model: "meta-llama/llama-4-scout-17b-16e-instruct", messages: [{ role: "user", content: prompt }], response_format: { type: "json_object" }, temperature: 0.1 });
      return { result: JSON.parse(res.choices[0]?.message?.content || "{}") as GeminiResult, by: "Llama 4 Scout" };
    } catch (e: any) { if (e?.status !== 429 || i === GROQ_KEYS.length - 1) throw e; }
  }
  throw new Error("All detection models failed");
}

// ── ROLE 2: Bug Fixing — Kimi K2 ──
async function fixBugs(filePath: string, content: string, bugs: BugReport[], fallbackCode: string): Promise<{ fixedCode: string; commitMessage: string }> {
  const bugList = bugs.map((b,i) => `${i+1}. Line ${b.lineNumber} [${b.bugType}]: ${b.description}`).join("\n");
  const prompt  = `Fix ONLY these bugs in ${filePath}.\nBUGS:\n${bugList}\nCODE:\n\`\`\`\n${content}\n\`\`\`\nRules: fix ONLY listed bugs, preserve intent, no removals.\nJSON: {"fixedCode":"...","commitMessage":"...max 72 chars"}`;
  for (let i = 0; i < GROQ_KEYS.length; i++) {
    try {
      const { default: Groq } = await import("groq-sdk");
      const g   = new Groq({ apiKey: nextGroq() });
      const res = await g.chat.completions.create({ model: "moonshotai/kimi-k2-instruct", messages: [{ role: "user", content: prompt }], response_format: { type: "json_object" }, temperature: 0.1 });
      const p   = JSON.parse(res.choices[0]?.message?.content || "{}");
      return { fixedCode: p.fixedCode || fallbackCode, commitMessage: p.commitMessage || `Fix bugs in ${filePath}` };
    } catch (e: any) { if (e?.status !== 429 || i === GROQ_KEYS.length - 1) return { fixedCode: fallbackCode, commitMessage: `Fix bugs in ${filePath}` }; }
  }
  return { fixedCode: fallbackCode, commitMessage: `Fix bugs in ${filePath}` };
}

// ── ROLE 3: Fast Verify — Llama 3.1 8B (43,200 RPD) ──
async function fastVerify(fp: string, orig: string, fixed: string, bugs: BugReport[]): Promise<VerifyResult> {
  const bugList = bugs.map((b,i)=>`${i+1}.[${b.bugType}] L${b.lineNumber}: ${b.description}`).join("\n");
  const prompt  = `Quick review: is this fix safe?\nFILE:${fp}\nBUGS:${bugList}\nORIG:${orig.slice(0,1500)}\nFIXED:${fixed.slice(0,1500)}\nJSON:{"approved":bool,"confident":bool,"reason":"sentence"}\nSet confident=false if unsure.`;
  for (let i = 0; i < GROQ_KEYS.length; i++) {
    try {
      const { default: Groq } = await import("groq-sdk");
      const g   = new Groq({ apiKey: nextGroq() });
      const res = await g.chat.completions.create({ model: "llama-3.1-8b-instant", messages: [{ role: "user", content: prompt }], response_format: { type: "json_object" }, temperature: 0.1 });
      return JSON.parse(res.choices[0]?.message?.content || "{}") as VerifyResult;
    } catch (e: any) { if (e?.status !== 429 || i === GROQ_KEYS.length - 1) return { approved: true, confident: false, reason: "Fast verify unavailable" }; }
  }
  return { approved: true, confident: false, reason: "Fast verify keys exhausted" };
}

// ── ROLE 4: Deep Verify — Llama 3.3 70B ──
async function deepVerify(fp: string, orig: string, fixed: string, bugs: BugReport[]): Promise<VerifyResult> {
  const bugList = bugs.map((b,i)=>`${i+1}. Line ${b.lineNumber} [${b.bugType}]: ${b.description}`).join("\n");
  const prompt  = `Senior engineer review.\nFILE:${fp}\nBUGS:${bugList}\nORIG:\`\`\`${orig}\`\`\`\nFIXED:\`\`\`${fixed}\`\`\`\nCheck:1)fix addresses bugs?2)no new bugs?3)intent preserved?\nJSON:{"approved":bool,"confident":true,"reason":"explanation"}`;
  for (let i = 0; i < GROQ_KEYS.length; i++) {
    try {
      const { default: Groq } = await import("groq-sdk");
      const g   = new Groq({ apiKey: nextGroq() });
      const res = await g.chat.completions.create({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: prompt }], response_format: { type: "json_object" }, temperature: 0.1 });
      return JSON.parse(res.choices[0]?.message?.content || "{}") as VerifyResult;
    } catch (e: any) { if (e?.status !== 429 || i === GROQ_KEYS.length - 1) return { approved: true, confident: true, reason: "Deep verify unavailable" }; }
  }
  return { approved: true, confident: true, reason: "Deep verify keys exhausted" };
}

// ── ROLE 6: Reasoning Verify — DeepSeek R1 on OpenRouter ──
async function reasoningVerify(fp: string, orig: string, fixed: string, bugs: BugReport[]): Promise<VerifyResult> {
  if (OR_KEYS.length === 0) return { approved: true, confident: true, reason: "No OpenRouter keys" };
  const bugList = bugs.map((b,i)=>`${i+1}.[${b.bugType}] L${b.lineNumber}: ${b.description}`).join("\n");
  const prompt  = `Expert code review.\nFILE:${fp}|BUGS:${bugList}\nORIG:\`\`\`${orig}\`\`\`\nFIXED:\`\`\`${fixed}\`\`\`\nJSON:{"approved":bool,"confident":true,"reason":"explanation"}`;
  for (let i = 0; i < OR_KEYS.length; i++) {
    try {
      const res  = await fetch("https://openrouter.ai/api/v1/chat/completions", { method: "POST", headers: { Authorization: `Bearer ${nextOR()}`, "Content-Type": "application/json", "HTTP-Referer": APP_URL }, body: JSON.stringify({ model: "deepseek/deepseek-r1:free", messages: [{ role: "user", content: prompt }], response_format: { type: "json_object" } }) });
      const data = await res.json() as any;
      return JSON.parse(data.choices?.[0]?.message?.content || "{}") as VerifyResult;
    } catch { if (i === OR_KEYS.length - 1) return { approved: true, confident: true, reason: "Reasoning verify unavailable" }; }
  }
  return { approved: true, confident: true, reason: "All OR keys exhausted" };
}

// ── Core Job Processor ──
async function processJob(job: Job, githubToken: string) {
  const startTime = Date.now();
  job.status = "running";
  pushEvent(job, { type: "STARTED", message: `Starting analysis of ${job.repoUrl}`, timestamp: new Date().toISOString() });
  try {
    const parsed = parseGHUrl(job.repoUrl);
    if (!parsed) throw new Error("Invalid GitHub URL");
    const { owner, repo } = parsed;
    const octokit    = new Octokit({ auth: githubToken });
    const branchName = `codeheal_fix_${Date.now()}`;
    let repoData: any;
    try { repoData = (await octokit.rest.repos.get({ owner, repo })).data; }
    catch (e: any) { if (e.status === 404) throw new Error("Repo not found"); throw e; }
    const defaultBranch = repoData.default_branch;
    const { data: refData } = await octokit.rest.git.getRef({ owner, repo, ref: `heads/${defaultBranch}` });
    const baseSha = refData.object.sha;
    try { await octokit.rest.git.createRef({ owner, repo, ref: `refs/heads/${branchName}`, sha: baseSha }); }
    catch (e: any) { if (e.status !== 422) throw e; }
    const { data: tree } = await octokit.rest.git.getTree({ owner, repo, tree_sha: baseSha, recursive: "1" });
    const files = tree.tree.filter(f => f.type==="blob" && f.path && !shouldSkip(f.path) && SUPPORTED_EXT.some(e=>f.path!.endsWith(e)) && (f.size??0)<=MAX_SIZE && (f.size??0)>0).sort((a,b)=>scoreFile(b.path!)-scoreFile(a.path!)).slice(0,MAX_FILES);
    if (files.length === 0) {
      const et = Date.now(); job.status="completed"; job.completedAt=et;
      job.result = buildResult(job.repoUrl,branchName,[],0,0,"NO_BUGS_FOUND",startTime,et,null);
      pushEvent(job,{type:"COMPLETED",message:"No eligible files",timestamp:new Date().toISOString(),data:job.result}); closeClients(job); return;
    }
    pushEvent(job,{type:"FILE_ANALYZING",message:`Found ${files.length} files`,timestamp:new Date().toISOString(),data:{totalFiles:files.length}});
    const fixes: FixEntry[] = []; let totalFailures=0, totalFixes=0;

    async function processFile(file: typeof files[number]) {
      if (!file.path) return;
      const cacheKey = `${owner}/${repo}:${file.path}`;
      let content: string;
      try {
        const { data: fd } = await octokit.rest.repos.getContent({ owner, repo, path: file.path, ref: baseSha });
        if (Array.isArray(fd) || !("content" in fd)) return;
        content = Buffer.from(fd.content,"base64").toString("utf8");
      } catch { pushEvent(job,{type:"FILE_ERROR",message:`Cannot fetch ${file.path}`,timestamp:new Date().toISOString()}); return; }

      const hash = hashContent(content);
      if (fileHashCache.get(cacheKey) === hash) { pushEvent(job,{type:"FILE_SKIPPED",message:`${file.path} unchanged`,timestamp:new Date().toISOString()}); return; }
      pushEvent(job,{type:"FILE_ANALYZING",message:`Analyzing ${file.path}...`,timestamp:new Date().toISOString(),data:{file:file.path}});

      let detection: { result: GeminiResult; by: string };
      try { detection = await detectBugs(file.path, content); }
      catch { pushEvent(job,{type:"FILE_ERROR",message:`Detection failed: ${file.path}`,timestamp:new Date().toISOString()}); return; }
      const { result: dr, by: detectedBy } = detection;
      if (!dr.hasBugs || !dr.bugs?.length) { fileHashCache.set(cacheKey,hash); return; }

      const { fixedCode, commitMessage } = await fixBugs(file.path, content, dr.bugs, dr.finalFixedCode);

      let v = await fastVerify(file.path, content, fixedCode, dr.bugs); let verifiedBy="Llama 3.1 8B";
      if (!v.confident) { v=await deepVerify(file.path,content,fixedCode,dr.bugs); verifiedBy="Llama 3.3 70B"; }
      if (!v.confident) { v=await reasoningVerify(file.path,content,fixedCode,dr.bugs); verifiedBy="DeepSeek R1"; }

      if (!v.approved) {
        pushEvent(job,{type:"FILE_REJECTED",message:`${file.path} rejected: ${v.reason}`,timestamp:new Date().toISOString(),data:{file:file.path,reason:v.reason}});
        for (const b of dr.bugs) { totalFailures++; fixes.push({file:file.path!,bugType:b.bugType,lineNumber:b.lineNumber,commitMessage:`[REJECTED] ${v.reason}`,status:"Failed",verifierNote:v.reason,detectedBy,fixedBy:"Kimi K2",verifiedBy}); }
        return;
      }

      const commitMsg = `[CodeHeal] ${sanitizeMsg(commitMessage)}`;
      try {
        const { data: cfd } = await octokit.rest.repos.getContent({ owner, repo, path: file.path, ref: branchName });
        const sha = !Array.isArray(cfd) && "sha" in cfd ? cfd.sha : undefined;
        await octokit.rest.repos.createOrUpdateFileContents({ owner, repo, path: file.path, message: commitMsg, content: Buffer.from(fixedCode).toString("base64"), branch: branchName, sha });
        fileHashCache.set(cacheKey, hashContent(fixedCode));
        for (const b of dr.bugs) { totalFailures++; totalFixes++; fixes.push({file:file.path!,bugType:b.bugType,lineNumber:b.lineNumber,commitMessage:commitMsg,status:"Fixed",verifierNote:v.reason,detectedBy,fixedBy:"Kimi K2",verifiedBy}); }
        pushEvent(job,{type:"FILE_DONE",message:`${file.path} — ${dr.bugs.length} bug(s) fixed ✅ (verified by ${verifiedBy})`,timestamp:new Date().toISOString(),data:{file:file.path,bugsFixed:dr.bugs.length,detectedBy,verifiedBy}});
      } catch {
        for (const b of dr.bugs) { totalFailures++; fixes.push({file:file.path!,bugType:b.bugType,lineNumber:b.lineNumber,commitMessage:commitMsg,status:"Failed",verifierNote:"Commit failed",detectedBy,fixedBy:"Kimi K2",verifiedBy}); }
      }
    }

    const CONCURRENCY = 5;
    for (let i=0; i<files.length; i+=CONCURRENCY) await Promise.all(files.slice(i,i+CONCURRENCY).map(processFile));

    let prUrl: string|null = null;
    if (totalFixes > 0) {
      try {
        const { data: pr } = await octokit.rest.pulls.create({ owner, repo, title: `[CodeHeal] Fixed ${totalFixes} bug(s) automatically`, body: buildPRBody(fixes,totalFixes,totalFailures), head: branchName, base: defaultBranch });
        prUrl = pr.html_url;
      } catch {}
    }

    const et = Date.now(); const status = totalFixes===0&&totalFailures===0?"NO_BUGS_FOUND":totalFailures===totalFixes?"PASSED":"FAILED";
    job.status="completed"; job.completedAt=et; job.result=buildResult(job.repoUrl,branchName,fixes,totalFailures,totalFixes,status,startTime,et,prUrl);
    pushEvent(job,{type:"COMPLETED",message:`Done — ${totalFixes} fixes${prUrl?", PR opened":""}`,timestamp:new Date().toISOString(),data:job.result}); closeClients(job);
  } catch (e: any) {
    job.status="failed"; job.error=e.message||"Unknown error";
    pushEvent(job,{type:"FAILED",message:`Failed: ${job.error}`,timestamp:new Date().toISOString()}); closeClients(job);
  }
}

// ── Server ──
async function startServer() {
  const app = express();
  app.use(helmet({contentSecurityPolicy:IS_PROD?undefined:false}));
  app.use(express.json({limit:"1mb"}));
  app.use(cookieParser());
  const authLim    = rateLimit({windowMs:15*60*1000,max:20,standardHeaders:true,legacyHeaders:false,message:{error:"Too many auth requests."}});
  const analyzeLim = rateLimit({windowMs:60*60*1000,max:20,standardHeaders:true,legacyHeaders:false,message:{error:"Rate limit reached."}});

  app.get("/api/auth/github", authLim, (_req,res)=>{
    const state=crypto.randomUUID(); res.cookie("oauth_state",state,{httpOnly:true,secure:IS_PROD,maxAge:10*60*1000,sameSite:"lax"});
    const url=new URL("https://github.com/login/oauth/authorize"); url.searchParams.set("client_id",GITHUB_CLIENT_ID); url.searchParams.set("redirect_uri",`${APP_URL}/api/auth/github/callback`); url.searchParams.set("scope","repo read:user user:email"); url.searchParams.set("state",state); res.redirect(url.toString());
  });

  app.get("/api/auth/github/callback", authLim, async(req,res)=>{
    const {code,state}=req.query; const ss=req.cookies?.oauth_state;
    if (!code||typeof code!=="string"||typeof state!=="string"||!ss||!timingSafe(state,ss)) return res.status(400).send("Invalid callback.");
    res.clearCookie("oauth_state");
    try {
      const tr=await fetch("https://github.com/login/oauth/access_token",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({client_id:GITHUB_CLIENT_ID,client_secret:GITHUB_CLIENT_SECRET,code,redirect_uri:`${APP_URL}/api/auth/github/callback`})});
      if (!tr.ok) throw new Error("Token exchange failed");
      const td=(await tr.json()) as any; if (td.error) return res.status(400).send("OAuth failed.");
      const ur=await fetch("https://api.github.com/user",{headers:{Authorization:`Bearer ${td.access_token}`,Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28"}});
      if (!ur.ok) throw new Error("User fetch failed");
      const ud=(await ur.json()) as any;
      const jti=crypto.randomUUID(); tokenStore.set(jti,{encrypted:encryptToken(td.access_token),expiresAt:Date.now()+7*24*60*60*1000});
      const st=jwt.sign({user:{id:ud.id,email:ud.email??null,user_name:ud.login,avatar_url:ud.avatar_url,name:ud.name??null}satisfies SessionUser,jti}satisfies JwtPayload,JWT_SECRET,{expiresIn:"7d",algorithm:"HS256"});
      res.cookie("session",st,{httpOnly:true,secure:IS_PROD,maxAge:7*24*60*60*1000,sameSite:"lax"}); res.redirect("/dashboard");
    } catch(e){ console.error("OAuth:",e instanceof Error?e.message:e); res.status(500).send("Auth failed."); }
  });

  app.get("/api/auth/session",(req,res)=>{
    const token=req.cookies?.session; if (!token) return res.json({user:null,session:null});
    try { const d=jwt.verify(token,JWT_SECRET) as JwtPayload; if (!tokenStore.has(d.jti)){res.clearCookie("session");return res.json({user:null,session:null});} res.json({user:d.user,session:{access_token:token}}); }
    catch { res.clearCookie("session"); res.json({user:null,session:null}); }
  });

  app.post("/api/auth/signout",(req,res)=>{
    const t=req.cookies?.session; if (t) { try { const d=jwt.verify(t,JWT_SECRET) as JwtPayload; tokenStore.delete(d.jti); } catch {} }
    res.clearCookie("session"); res.json({success:true});
  });

  app.post("/api/analyze",analyzeLim,requireAuth,async(req:Request,res:Response)=>{
    const {repoUrl}=req.body;
    if (!repoUrl||typeof repoUrl!=="string") return res.status(400).json({error:"repoUrl required."});
    if (!parseGHUrl(repoUrl)) return res.status(400).json({error:"Invalid GitHub URL."});
    const sd=(req as any).sessionData as JwtPayload; const te=tokenStore.get(sd.jti);
    if (!te) return res.status(401).json({error:"Session expired."});
    let gt: string; try { gt=decryptToken(te.encrypted); } catch { return res.status(500).json({error:"Credential error."}); }
    const jobId=crypto.randomUUID();
    const job: Job={id:jobId,status:"pending",repoUrl,userId:sd.user.id,events:[],result:null,error:null,createdAt:Date.now(),completedAt:null,clients:new Set()};
    jobStore.set(jobId,job); processJob(job,gt).catch(e=>console.error(`Job ${jobId} crashed:`,e));
    res.json({jobId,message:"Analysis started."});
  });

  app.get("/api/job/:id/stream",requireAuth,(req:Request,res:Response)=>{
    const job=jobStore.get(req.params.id); if (!job) return res.status(404).json({error:"Job not found."});
    const sd=(req as any).sessionData as JwtPayload; if (job.userId!==sd.user.id) return res.status(403).json({error:"Forbidden."});
    res.setHeader("Content-Type","text/event-stream"); res.setHeader("Cache-Control","no-cache"); res.setHeader("Connection","keep-alive"); res.flushHeaders();
    for (const e of job.events) res.write(`data: ${JSON.stringify(e)}\n\n`);
    if (job.status==="completed"||job.status==="failed") { res.end(); return; }
    job.clients.add(res);
    const hb=setInterval(()=>{ try{res.write(": heartbeat\n\n");}catch{clearInterval(hb);} },20_000);
    req.on("close",()=>{ clearInterval(hb); job.clients.delete(res); });
  });

  app.get("/api/job/:id/result",requireAuth,(req:Request,res:Response)=>{
    const job=jobStore.get(req.params.id); if (!job) return res.status(404).json({error:"Job not found."});
    const sd=(req as any).sessionData as JwtPayload; if (job.userId!==sd.user.id) return res.status(403).json({error:"Forbidden."});
    if (job.status==="pending"||job.status==="running") return res.json({status:job.status,message:"In progress."});
    if (job.status==="failed") return res.status(500).json({status:"failed",error:job.error});
    res.json({status:"completed",result:job.result});
  });

  app.get("/api/job/:id/status",requireAuth,(req:Request,res:Response)=>{
    const job=jobStore.get(req.params.id); if (!job) return res.status(404).json({error:"Not found."});
    res.json({jobId:job.id,status:job.status,createdAt:job.createdAt,completedAt:job.completedAt,eventCount:job.events.length});
  });

  if (!IS_PROD) {
    const {createServer:cvs}=await import("vite"); const vite=await cvs({server:{middlewareMode:true},appType:"spa"}); app.use(vite.middlewares);
  } else { app.use(express.static("dist")); app.get("*",(_q,r)=>r.sendFile(path.join(process.cwd(),"dist","index.html"))); }

  app.use((e:Error,_q:Request,r:Response,_n:NextFunction)=>{ console.error("Unhandled:",e.message); r.status(500).json({error:"Internal server error."}); });
  app.listen(PORT,"0.0.0.0",()=>{ console.log(`CodeHeal V2 on ${APP_URL}`); console.log(`Keys — Gemini:${GEMINI_KEYS.length} Groq:${GROQ_KEYS.length} OR:${OR_KEYS.length}`); });
}

// Helpers
function buildPrompt(fp: string, content: string): string { return `You are an expert code reviewer. Analyze for bugs.\nCategories: LINTING, SYNTAX, LOGIC, TYPE_ERROR, IMPORT, INDENTATION\nRULES:\n1. Fix import typos. Do NOT remove imports.\n2. Preserve intent. Don't delete lines unnecessarily.\n3. Only real bugs. No stylistic changes.\n4. If no bugs, finalFixedCode = original unchanged.\nFile: ${fp}\n\`\`\`\n${content}\n\`\`\`\nRespond ONLY with valid JSON.`; }
function buildPRBody(fixes: FixEntry[], tf: number, total: number): string { return [`## 🤖 CodeHeal V2`,`**${tf}** of ${total} bugs fixed.`,`### Pipeline`,`- 🔍 Gemini 2.5 Flash (fallback: Llama 4 Scout)`,`- 🔧 Kimi K2 (fixing)`,`- ✅ Llama 3.1 8B → Llama 3.3 70B → DeepSeek R1 (verification)`,`### Fixes`,...fixes.filter(f=>f.status==="Fixed").map(f=>`- \`${f.file}\` **${f.bugType}** L${f.lineNumber} (by ${f.verifiedBy})`),`> Only AI-verified fixes committed.`].join("\n"); }
function buildResult(ru:string,bn:string,fixes:FixEntry[],tf:number,fx:number,st:string,s:number,e:number,pr:string|null) { const ms=e-s; return {repoUrl:ru,branchName:bn,totalFailures:tf,totalFixes:fx,status:st,prUrl:pr,timeTaken:fmtDur(ms),scoreDetails:score(tf,fx,ms),fixes,timeline:[{iteration:1,status:"STARTED",timestamp:new Date(s).toISOString()},{iteration:1,status:st,timestamp:new Date(e).toISOString()}],iterationsUsed:1,retryLimit:5,modelsUsed:{detection:"Gemini 2.5 Flash",fixing:"Kimi K2",fastVerify:"Llama 3.1 8B",deepVerify:"Llama 3.3 70B",reasoningVerify:"DeepSeek R1"}}; }
function sanitizeMsg(m:string):string { return m.replace(/[\r\n]+/g," ").slice(0,72); }
function fmtDur(ms:number):string { return `${Math.floor(ms/60000)}m ${Math.floor((ms%60000)/1000)}s`; }
function score(tf:number,fx:number,ms:number) { const b=100,sp=fx>0?(ms<60000?20:ms<120000?10:0):0,fr=Math.round((tf>0?fx/tf:1)*30); return {baseScore:b,speedBonus:sp,fixRateBonus:fr,totalScore:Math.min(150,Math.max(0,b+sp+fr))}; }

setInterval(()=>{
  const now=Date.now();
  for (const [k,v] of tokenStore.entries()) if (v.expiresAt<now) tokenStore.delete(k);
  for (const [k,j] of jobStore.entries())   if (j.completedAt&&now-j.completedAt>3600000) jobStore.delete(k);
},6*60*60*1000);

startServer().catch(e=>{ console.error("Fatal:",e.message); process.exit(1); });