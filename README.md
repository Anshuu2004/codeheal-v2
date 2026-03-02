# CodeHeal - AI-Powered Code Remediation SaaS

CodeHeal is an intelligent, automated code-fixing agent that uses the **Gemini LLM** to scan, analyze, and automatically fix bugs in your GitHub repositories. It detects issues in multiple languages, generates corrected code, and commits fixes directly to a new branch on your repository.

## What It Does

1. **Authenticates via GitHub:** You sign in with your GitHub account. CodeHeal securely stores an encrypted session server-side to read and write to your repositories.
2. **Clones and Analyzes:** You provide a GitHub repository URL. The agent fetches the latest code from the default branch.
3. **AI Bug Detection:** It scans files (e.g., Python, JavaScript, TypeScript, Go, Ruby, Java, C++) and sends them to the Gemini LLM to detect issues including:
   - Syntax Errors
   - Linting Issues
   - Logic Bugs
   - Type Errors
   - Import Typos
   - Indentation Problems
4. **Auto-Fixing:** Gemini generates the corrected code while preserving the original intent.
5. **Parallel Processing:** Analyzes up to 10 files (max 100KB each) concurrently to deliver fast results.
6. **Automated Commits:** The agent creates a new branch and pushes the fixed code directly to your GitHub repository with detailed commit messages.
7. **Dynamic Scoring:** Calculates the real time taken and assigns a dynamic score based on speed and the successful fix rate.

## Tech Stack

- **Frontend:** React 19, Vite 6, TailwindCSS v4, Recharts, Lucide Icons
- **Backend:** Node.js, Express 4, JWT session management
- **AI Integration:** `@google/genai` (Gemini 3 Flash Preview)
- **GitHub API:** Octokit v5 for repository interaction
- **Authentication:** Direct GitHub OAuth with AES-256-GCM encrypted server-side token storage
- **Security:** Helmet, express-rate-limit, timing-safe comparisons

## How to Run Locally

### Prerequisites

- Node.js v18 or higher
- A GitHub OAuth App ([create one here](https://github.com/settings/developers))
- A valid Gemini API Key

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd <your-repo-directory>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create a GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers) and click **OAuth Apps** then **New OAuth App**
2. Fill in the following:
   - **Application name:** CodeHeal
   - **Homepage URL:** http://localhost:3000
   - **Authorization callback URL:** http://localhost:3000/api/auth/github/callback
3. Click **Register application**
4. Copy the **Client ID**
5. Click **Generate a new client secret** and copy it

### 4. Set Up Environment Variables

Create a `.env` file in the root directory and add your keys:

```env
GITHUB_TOKEN="your_github_personal_access_token"
GEMINI_API_KEY="your_gemini_api_key"
GITHUB_CLIENT_ID="your_oauth_app_client_id"
GITHUB_CLIENT_SECRET="your_oauth_app_client_secret"
JWT_SECRET="your_secure_random_string_here"
```

| Variable | Description |
|----------|-------------|
| `GITHUB_TOKEN` | A GitHub Personal Access Token with `repo` permissions. (Fallback if OAuth token is unavailable). |
| `GEMINI_API_KEY` | Your Google Gemini API key for AI-powered code analysis. |
| `GITHUB_CLIENT_ID` | Client ID from your GitHub OAuth App. |
| `GITHUB_CLIENT_SECRET` | Client secret from your GitHub OAuth App. |
| `JWT_SECRET` | A random secure string used to sign JWT cookies and derive encryption keys. |

### 5. Start the Development Server

```bash
npm run dev
```

The application will start on `http://localhost:3000`.

## Usage

1. Open `http://localhost:3000` in your browser
2. Click **Sign In with GitHub** and authorize the application
3. Navigate to the **Dashboard**
4. Paste a GitHub repository URL
5. Click **Run Agent**
6. Wait for the analysis to complete. Results will appear indicating detected bugs, applied fixes, a score breakdown, and a timeline.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server with hot module replacement |
| `npm run build` | Build the production bundle |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run TypeScript type checking |
