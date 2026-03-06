export function Changelog() {
    const versions = [
        {
            version: 'v2.1.0',
            date: 'March 1, 2026',
            badge: 'Latest',
            changes: [
                'Added full support for DeepSeek R1 reasoning verify model.',
                'Revamped dashboard to include live EventSource streaming.',
                'Optimized Gemini 2.5 Flash detection prompts for lower latency.',
                'Fixed a bug where the timeline sometimes failed to auto-scroll.'
            ]
        },
        {
            version: 'v2.0.0',
            date: 'February 15, 2026',
            changes: [
                'Major release: transitioned to a 4-tier model pipeline.',
                'Introduced the fix rate and speed base score breakdown.',
                'Rebuilt the UI utilizing modern Tailwind V4 paradigms and variables.',
                'Removed legacy hardcoded mock endpoints.'
            ]
        },
        {
            version: 'v1.5.0',
            date: 'January 20, 2026',
            changes: [
                'Initial deployment of multi-language support (Java, Go, Rust added).',
                'Implemented GitHub OAuth sign-in flow and JWT stateless tracking.',
                'Improved UI consistency across light and dark modes.'
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 py-20 px-4 transition-colors duration-300">
            <div className="max-w-3xl mx-auto space-y-12">
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Changelog</h1>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400">
                        Keep track of all the new updates, features, and fixes deployed to CodeHeal.
                    </p>
                </div>

                <div className="space-y-12 border-l-2 border-neutral-200 dark:border-neutral-800 ml-3 pl-8">
                    {versions.map((log, idx) => (
                        <div key={idx} className="relative">
                            <div className="absolute -left-[41px] top-1.5 w-5 h-5 rounded-full border-4 border-white dark:border-neutral-950 bg-indigo-500" />
                            <div className="flex items-center gap-4 mb-4">
                                <h2 className="text-2xl font-bold">{log.version}</h2>
                                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{log.date}</span>
                                {log.badge && (
                                    <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                                        {log.badge}
                                    </span>
                                )}
                            </div>
                            <ul className="space-y-3">
                                {log.changes.map((change, i) => (
                                    <li key={i} className="text-neutral-600 dark:text-neutral-300 leading-relaxed text-base">
                                        • {change}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
