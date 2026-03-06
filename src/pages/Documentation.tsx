export function Documentation() {
    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 py-20 px-4 transition-colors duration-300">
            <div className="max-w-4xl mx-auto space-y-12">
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Documentation</h1>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400">
                        Learn how to integrate CodeHeal with your repositories and customize your AI verification pipeline.
                    </p>
                </div>

                <div className="prose dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300">
                    <h2>Getting Started</h2>
                    <p>
                        Welcome to the official CodeHeal documentation. CodeHeal is an advanced AI agent system that detects, fixes, and verifies code anomalies entirely autonomously.
                    </p>

                    <h3>1. Authentication</h3>
                    <p>
                        To begin, click <strong>Sign In</strong> to authenticate via GitHub. CodeHeal uses an OAuth token exclusively to clone your code into our ephemeral isolated environments. Your code is never stored persistently.
                    </p>

                    <h3>2. Configuration (codeheal.yml)</h3>
                    <p>
                        You can configure CodeHeal's rigorousness on a per-repository basis by adding a <code>codeheal.yml</code> file to the root of your repository:
                    </p>
                    <pre className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-xl overflow-x-auto text-sm">
                        {`version: 1
pipeline:
  detection: ["gemini-2.5-flash", "llama-4-scout"]
  fixing: ["kimi-k2"]
  verify_levels:
    - "llama-3.1-8b"
    - "llama-3.3-70b"
    - "deepseek-r1" # Set to true for deep reasoning
exclude_paths:
  - "node_modules/"
  - "vendor/"
  - "**/*.spec.ts"`}
                    </pre>

                    <h2>Supported Frameworks</h2>
                    <p>
                        CodeHeal inherently understands modern typescript ecosystems (Next.js, Vite, Nest) and python paradigms (FastAPI, Django). Our models are fine-tuned across 400+ distinct tech stacks.
                    </p>
                </div>
            </div>
        </div>
    );
}
