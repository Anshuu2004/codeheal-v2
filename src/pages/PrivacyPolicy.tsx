export function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 py-20 px-4 transition-colors duration-300">
            <div className="max-w-3xl mx-auto space-y-12">
                <div className="space-y-4 border-b border-neutral-200 dark:border-neutral-800 pb-8">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Privacy Policy</h1>
                    <p className="text-neutral-500 dark:text-neutral-400">Last updated: March 1, 2026</p>
                </div>

                <div className="prose dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300">
                    <p>
                        At CodeHeal, we take your privacy incredibly seriously. Because our product interacts with your proprietary source code, we have instituted radical principles to ensure your intelligence property remains yours.
                    </p>

                    <h2>1. Source Code Access</h2>
                    <p>
                        CodeHeal clones your repository strictly into ephemeral, isolated Docker containers upon triggering a job. Once the AI analysis and pull request generation finishes, the container is destroyed. We <strong>do not</strong> persist your source code on our servers, nor do we use it to train our baseline models.
                    </p>

                    <h2>2. Data Collection</h2>
                    <p>
                        We collect the following minimal data to ensure our service functions:
                    </p>
                    <ul>
                        <li>Your GitHub Email address and Username for identity management.</li>
                        <li>Aggregated telemetry on AI performance (e.g., how often Kimi K2 fails verification). This telemetry does <em>not</em> contain any of your source code snippets.</li>
                        <li>Billing information (processed securely through Stripe).</li>
                    </ul>

                    <h2>3. Third-Party LLM Providers</h2>
                    <p>
                        CodeHeal utilizes models from Google (Gemini) and Groq (Llama, Kimi). We have Enterprise agreements with these providers guaranteeing zero data retention (zero-day retention policies) and ensuring payloads are not used for training.
                    </p>

                    <h2>4. Your Rights</h2>
                    <p>
                        Under GDPR and CCPA, you have the right to request full deletion of your account and associated telemetry data. You can delete your account via the Settings panel or by contacting support at <code>privacy@codeheal.ai</code>.
                    </p>
                </div>
            </div>
        </div>
    );
}
