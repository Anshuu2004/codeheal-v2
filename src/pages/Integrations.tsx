import { Github, Slack, MessageSquare, Database, Globe, Cloud } from 'lucide-react';

export function Integrations() {
    const integrations = [
        { name: 'GitHub', desc: 'Seamlessly analyze repositories, branch, and open PRs autonomously.', icon: Github, color: 'text-neutral-900 dark:text-white', bg: 'bg-neutral-100 dark:bg-neutral-800' },
        { name: 'Slack', desc: 'Receive real-time notifications about detected vulnerabilities and fixes.', icon: Slack, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
        { name: 'Jira', desc: 'Automatically create issues and link them to generated pull requests.', icon: Database, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { name: 'Discord', desc: 'Ping a specific channel when a deep reasoning verification fails.', icon: MessageSquare, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
        { name: 'Vercel', desc: 'Trigger deployments automatically once the Kimi AI fix has passed tests.', icon: Globe, color: 'text-neutral-900 dark:text-white', bg: 'bg-neutral-100 dark:bg-neutral-800' },
        { name: 'AWS Config', desc: 'Scan infrastructure as code files natively for compliance via API.', icon: Cloud, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    ];

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 py-20 px-4 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-16">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                        Seamless Integrations
                    </h1>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                        Connect CodeHeal with the tools you already use. Enhance your CI/CD pipelines natively.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {integrations.map((item, idx) => (
                        <div key={idx} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl flex items-start gap-4 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.bg}`}>
                                <item.icon className={`w-6 h-6 ${item.color}`} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-1">{item.name}</h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
