# CodeHeal V2 — Project Walkthrough

## 1. Product Overview

CodeHeal V2 is a fully autonomous CI/CD code remediation agent. It connects to your GitHub repositories via OAuth, scans source files across 10+ supported languages, and orchestrates a **multi-model AI pipeline** that detects bugs, generates fixes, verifies them through multiple confidence tiers, and opens a GitHub Pull Request — all without any manual intervention.

The product ships as a full-stack TypeScript application with a React frontend and an Express backend, designed for both local development and cloud deployment.

## 2. Authentication Flow

The authentication system implements a **server-side GitHub OAuth** flow with defense-in-depth security:

- **OAuth Initiation:** The user is redirected to GitHub's authorization page with a CSRF-protected `state` parameter stored in an HttpOnly cookie.
- **Token Exchange:** On callback, the server exchanges the authorization code for a GitHub access token via a secure server-to-server request.
- **Encrypted Storage:** The access token is encrypted using **AES-256-GCM** (with a key derived from `JWT_SECRET`) and stored in an in-memory `tokenStore` Map — it never reaches the client.
- **JWT Session:** A signed JWT cookie (HS256, HttpOnly, 7-day expiry) is issued to the client, containing only the user's public metadata and a unique session ID (`jti`). The `jti` is used to look up the encrypted token on subsequent requests.
- **State Validation:** OAuth `state` parameters are compared using `crypto.timingSafeEqual()` to prevent timing attacks.

## 3. Multi-Model AI Pipeline

The core innovation of CodeHeal V2 is its **5-model pipeline** where each model has a specialized role:

### Role 1 — Bug Detection (Gemini 2.5 Flash)
Files are sent to Google's Gemini 2.5 Flash with a structured JSON schema prompt. The model returns a typed response including whether bugs exist, categorized bug reports (LINTING, SYNTAX, LOGIC, TYPE_ERROR, IMPORT, INDENTATION), and a preliminary fixed version of the code. **Fallback:** If Gemini is rate-limited, detection falls back to **Llama 4 Scout** (17B) via the Groq API.

### Role 2 — Bug Fixing (Kimi K2)
Detected bugs and the original code are forwarded to Moonshotai's **Kimi K2 Instruct** model on Groq. It generates a precise, intent-preserving patch that addresses only the listed bugs without making unrelated changes.

### Role 3 — Fast Verification (Llama 3.1 8B)
A lightweight verification pass using **Llama 3.1 8B Instant** on Groq. It performs a quick safety check and returns a confidence level. If the model is not confident, the fix is escalated.

### Role 4 — Deep Verification (Llama 3.3 70B)
A more thorough review using **Llama 3.3 70B Versatile** on Groq. This acts as a senior engineer review, checking that bugs are addressed, no new bugs are introduced, and original intent is preserved.

### Role 5 — Reasoning Verification (DeepSeek R1)
The final tier uses **DeepSeek R1** via OpenRouter for chain-of-thought reasoning verification. This is only triggered when the previous tiers lack confidence.

### Key Rotation
All API keys support round-robin rotation (up to 3 keys per provider) for load balancing and rate-limit resilience.

## 4. Real-Time Streaming

CodeHeal V2 uses **Server-Sent Events (SSE)** to deliver live pipeline updates to the frontend:

- When a job is created via `POST /api/analyze`, a background `processJob()` function begins execution.
- The client connects to `GET /api/job/:id/stream` to receive typed events (`STARTED`, `FILE_ANALYZING`, `FILE_DONE`, `FILE_REJECTED`, `COMPLETED`, `FAILED`).
- The Dashboard component renders these events in a live log panel with a progress bar, status icons, and the AI pipeline indicator.
- A fallback polling mechanism (`GET /api/job/:id/result`) activates if the SSE connection drops.

## 5. GitHub Integration

- **Repository Scanning:** The agent fetches the Git tree via Octokit and filters for supported extensions (`.py`, `.js`, `.ts`, `.jsx`, `.tsx`, `.java`, `.go`, `.rb`, `.rs`, `.c`, `.cpp`), skipping `node_modules`, `dist`, test files, lock files, and `.d.ts` declarations.
- **Smart File Prioritization:** Files are scored (index/main/app files rank higher; test files rank lower) and capped at 20 files per run.
- **Branch Creation:** A new branch (`codeheal_fix_<timestamp>`) is created from the default branch's HEAD SHA.
- **Automated Commits:** Each verified fix is committed to the branch with a descriptive `[CodeHeal]` prefixed message.
- **Pull Request:** After all files are processed, a PR is opened against the default branch with a detailed body listing all fixes, the models used, and verification status.

## 6. Scoring System

Each analysis run produces a performance score:

| Component | Points | Criteria |
|---|---|---|
| Base Score | 100 | Every run starts here |
| Speed Bonus | 0–20 | < 60s = +20, < 120s = +10 |
| Fix Rate Bonus | 0–30 | Proportional to `fixes / totalBugsDetected` |
| **Max Total** | **150** | — |

## 7. Frontend Architecture

- **Framework:** React 19 SPA with Vite 6 and React Router v7.
- **Styling:** Tailwind CSS v4 with full dark mode support via a custom `ThemeContext`.
- **Dashboard:** Features a live SSE event log, progress bar, PR banner, AI pipeline indicator, and score/timeline visualizations.
- **Static Pages:** 12 fully designed pages (Features, Pricing, Integrations, Changelog, Documentation, API Reference, Blog, Community, About Us, Careers, Privacy Policy, Terms of Service) — all responsive and theme-aware.

## 8. Security Measures

| Measure | Implementation |
|---|---|
| Token Encryption | AES-256-GCM with SHA-256 derived key |
| Session Cookies | HttpOnly, Secure (in prod), SameSite=Lax |
| CSRF Protection | OAuth state stored in HttpOnly cookie, validated with `timingSafeEqual` |
| Rate Limiting | 20 req/15min (auth), 20 req/hr (analyze) via `express-rate-limit` |
| HTTP Headers | `helmet` middleware with CSP in production |
| Memory Cleanup | Background interval clears expired tokens and stale jobs every 6 hours |
