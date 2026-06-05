<div align="center">

# 🩺 CodeHeal V2 — Autonomous AI Code Remediation

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React%2019-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Multi-LLM](https://img.shields.io/badge/6--Model%20AI%20Pipeline-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)

**An AI agent that finds bugs, fixes them across a 6-model verification pipeline, and opens the pull request for you.**

<!-- Hero image: record a 15-20s screen capture (paste repo URL -> watch the live pipeline -> PR opens), save it as docs/demo.gif, then uncomment the next line: -->
<!-- ![CodeHeal demo](docs/demo.gif) -->

</div>

> **Highlights** — 6-model pipeline (Gemini 2.5 · Llama 4 Scout · Kimi K2 · Llama 3.3 70B · DeepSeek R1) · auto-opens PRs · AES-256-GCM token encryption · live progress over SSE

---

<p align="center">
  <img src="codeheal-logo.png" alt="CodeHeal Logo" width="120" />
</p>

CodeHeal is an autonomous CI/CD agent that uses a **multi-model AI pipeline** to scan, detect, fix, and verify bugs in your GitHub repositories — then opens a Pull Request with the corrections, all without human intervention.

## How It Works

1. **Authenticate via GitHub OAuth** — Sign in securely. Your GitHub token is encrypted with AES-256-GCM and never leaves the server.
2. **Submit a Repository URL** — Paste any public or private GitHub repo URL into the dashboard.
3. **AI Detection (Gemini 2.5 Flash)** — The agent fetches up to 20 eligible source files and sends them to Gemini for structured bug detection (syntax, logic, type errors, imports, etc.). Falls back to **Llama 4 Scout** on Groq if rate-limited.
4. **AI Fixing (Kimi K2)** — Detected bugs are passed to Moonshotai's Kimi K2 model, which generates precise, intent-preserving patches.
5. **Multi-Tier Verification** — Fixes pass through a cascading verification pipeline:
   - **Llama 3.1 8B** (fast verify) →
   - **Llama 3.3 70B** (deep verify, if fast verify is not confident) →
   - **DeepSeek R1 on OpenRouter** (reasoning verify, if deep verify is not confident)
6. **Auto-Commit & PR** — Verified fixes are committed to a new branch and a Pull Request is automatically opened against the default branch.
7. **Live Dashboard** — Track every step in real-time via Server-Sent Events (SSE) with a live progress bar and event log.

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 6, Tailwind CSS v4, Recharts, Lucide React, React Router v7 |
| **Backend** | Node.js, Express 4, TypeScript, `tsx` (dev runner) |
| **AI Models** | Gemini 2.5 Flash, Llama 4 Scout, Kimi K2, Llama 3.1 8B, Llama 3.3 70B, DeepSeek R1 |
| **AI SDKs** | `@google/genai`, `groq-sdk`, OpenRouter REST API |
| **GitHub API** | Octokit v5 |
| **Auth** | GitHub OAuth, JWT (HS256), AES-256-GCM server-side token encryption |
| **Security** | Helmet, `express-rate-limit`, `crypto.timingSafeEqual`, HttpOnly cookies |

## Getting Started

### Prerequisites

- **Node.js** v18+
- A **GitHub OAuth App** ([create one here](https://github.com/settings/developers))
- At least one **Gemini API Key** and one **Groq API Key**

### 1. Clone and Install

```bash
git clone https://github.com/Anshuu2004/codeheal-v2.git
cd codeheal-v2
npm install
```

### 2. Create a GitHub OAuth App

1. Go to [GitHub Developer Settings → OAuth Apps](https://github.com/settings/developers) → **New OAuth App**
2. Set the fields:
   - **Application name:** `CodeHeal`
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `http://localhost:3000/api/auth/github/callback`
3. Copy the **Client ID** and generate a **Client Secret**

### 3. Set Up Environment Variables

Create a `.env` file in the project root (see `.env.example` for reference):

```env
# Required
JWT_SECRET="a_random_secure_string"
GITHUB_CLIENT_ID="your_oauth_client_id"
GITHUB_CLIENT_SECRET="your_oauth_client_secret"

# AI Keys (at least one of each required)
GEMINI_API_KEY_1="your_gemini_key"
GROQ_API_KEY_1="your_groq_key"

# Optional — additional keys for round-robin load balancing
GEMINI_API_KEY_2=""
GEMINI_API_KEY_3=""
GROQ_API_KEY_2=""
GROQ_API_KEY_3=""

# Optional — OpenRouter keys for DeepSeek R1 reasoning verify
OPENROUTER_API_KEY_1=""

# Optional
PORT=3000
APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### 4. Start the Development Server

```bash
npm run dev
```

The app will be available at **http://localhost:3000**.

## Usage

1. Open `http://localhost:3000` in your browser
2. Click **Sign In with GitHub** and authorize the application
3. Navigate to the **Dashboard**
4. Paste a GitHub repository URL and click **Analyze**
5. Watch the live event stream as the multi-model pipeline scans, fixes, and verifies your code
6. When complete, click the PR link to review the automatically generated Pull Request

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server with HMR (via `tsx watch`) |
| `npm run build` | Build the frontend (Vite) and compile `server.ts` for production |
| `npm run start` | Run the compiled production server |
| `npm run lint` | Run TypeScript type checking (`tsc --noEmit`) |
| `npm run clean` | Remove `dist/` and `dist-server/` build artifacts |

## Project Structure

```
├── server.ts              # Express backend — OAuth, API routes, AI pipeline
├── src/
│   ├── App.tsx            # React Router with all page routes
│   ├── main.tsx           # React entry point
│   ├── index.css          # Global styles (Tailwind)
│   ├── components/        # Reusable UI components (Header, Footer, ScoreBreakdown, etc.)
│   ├── context/           # ThemeContext (dark/light mode)
│   ├── hooks/             # useAuth custom hook
│   └── pages/             # All page components (Landing, Dashboard, Features, Pricing, etc.)
├── index.html             # Vite HTML entry
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
```

## License

This project is proprietary software. All rights reserved.
