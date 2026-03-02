# CodeHeal Project Walkthrough

## 1. Project Overview
CodeHeal is an AI-powered SaaS application that automates code remediation. It integrates seamlessly with GitHub, allowing users to analyze repositories for bugs across multiple languages. Upon detecting issues, it generates corrected code using the Gemini AI model and automatically commits those fixes to a new branch in the user's repository.

## 2. Authentication Flow
The application implements a custom, highly secure server-side GitHub OAuth flow:
*   **Initiation:** The user clicks "Sign In with GitHub", redirecting them to the GitHub OAuth page.
*   **Callback:** GitHub redirects back to the Express server (`/api/auth/github/callback`) with a short-lived code.
*   **Token Exchange:** The server exchanges the code for an access token over a secure server-to-server HTTP request.
*   **Secure Storage:** The GitHub token never leaves the server. It is encrypted using AES-256-GCM and stored in an in-memory `tokenStore` Map.
*   **Session Management:** The client receives a JWT cookie containing only the user metadata and a unique token ID (`jti`). All subsequent authenticated requests use this cookie to verify identity, while the server looks up the decrypted GitHub token internally.

## 3. Analysis Pipeline
The core feature of CodeHeal is the AI-driven repository analysis:
*   **Validation:** The frontend submits a GitHub URL. The backend parses and validates the URL structure before querying the GitHub API.
*   **Tree Traversal:** The server fetches the repository tree for the default branch and filters for supported extensions: `.py`, `.js`, `.ts`, `.jsx`, `.tsx`, `.java`, `.go`, `.rb`, `.rs`, `.c`, and `.cpp` (up to 100KB per file).
*   **Branch Creation:** A new branch (e.g., `codeheal_fix_<timestamp>`) is created branching off the default branch's latest SHA.
*   **Parallel Analysis:** The system processes up to 10 files concurrently (in batches of 3). It sends the file content to the Gemini 3 Flash Preview model with a strict JSON schema prompt for bug detection.
*   **Auto-Commits:** For every file where Gemini detects bugs, the server commits the corrected version directly to the newly created branch.

## 4. Scoring System
CodeHeal assigns a dynamic score based on the analysis outcome:
*   **Base Score:** Every run starts with a 100-point base score.
*   **Speed Bonus:** If the analysis completes quickly (<60s gets +20 pts, <120s gets +10 pts).
*   **Fix Rate:** Rewarded for successfully committing fixes for the detected bugs (up to +30 pts if all fixes are committed successfully).

## 5. Frontend Architecture
The frontend is a React 19 SPA built with Vite and TailwindCSS:
*   **State Management:** Handled largely by custom hooks like `useAuth`, which manages session state and coordinates the redirect OAuth flow.
*   **Components:** Modular components like `ScoreBreakdown` (using Recharts), `FixesTable`, and `Timeline` provide a rich, interactive dashboard.
*   **Routing:** React Router DOM manages navigation between the Landing page and Dashboard, with protected route concepts extending from the auth state.

## 6. Security and Reliability Enhancements
*   **Rate Limiting:** IP-based request limits using `express-rate-limit` protect the authentication routes and the expensive analysis endpoints.
*   **Helmet Headers:** Standard HTTP security headers are injected into Express responses.
*   **Memory Management:** The server-side token store utilizes expiration timers (`expiresAt`) and a background interval to clear out stale sessions every 6 hours, preventing memory leaks.
*   **Timing Attacks:** OAuth state validation uses `crypto.timingSafeEqual()`.
*   **Error Handling:** A global Express error handler catches unhandled rejections, ensuring internal stack traces or API keys are never leaked to the client.
