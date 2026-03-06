export function APIReference() {
    const endpoints = [
        { method: 'POST', path: '/api/analyze', desc: 'Trigger a new pipeline analysis for a given repository URL.' },
        { method: 'GET', path: '/api/job/:id/stream', desc: 'Connect to an EventSource stream for live pipeline execution logs.' },
        { method: 'GET', path: '/api/job/:id/status', desc: 'Get current high-level status of the job.' },
        { method: 'GET', path: '/api/job/:id/result', desc: 'Retrieve the final analysis payload including fixes and code diffs.' }
    ];

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 py-20 px-4 transition-colors duration-300">
            <div className="max-w-5xl mx-auto space-y-12">
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">API Reference</h1>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400">
                        For advanced enterprise users, interact directly with the CodeHeal execution engine via our REST API.
                    </p>
                </div>

                <div className="space-y-8">
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Authentication</h2>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                            All API requests require a valid Bearer token provided via the <code>Authorization</code> header. You can obtain a Personal Access Token (PAT) from your account settings.
                        </p>
                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 font-mono text-sm text-neutral-300 overflow-x-auto">
                            Authorization: Bearer dev_XXXX...
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold mt-12 mb-4">Endpoints</h2>

                    <div className="grid grid-cols-1 gap-6">
                        {endpoints.map((ep, idx) => (
                            <div key={idx} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 transition-colors duration-300 hover:shadow-md">
                                <div className="flex items-center gap-4 mb-4">
                                    <span className={`px-3 py-1 rounded-md text-sm font-bold tracking-wider ${ep.method === 'POST' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                            : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400'
                                        }`}>
                                        {ep.method}
                                    </span>
                                    <code className="text-lg font-mono font-bold">{ep.path}</code>
                                </div>
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    {ep.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
