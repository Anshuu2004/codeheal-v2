import { Shield, Zap, GitPullRequest, Search, CheckCircle, Code } from 'lucide-react';

export function Features() {
    const features = [
        {
            title: 'Automated Bug Detection',
            description: 'Leverage state-of-the-art LLMs to scan your pull requests and commits in real-time, catching bugs before they reach production.',
            icon: Search,
        },
        {
            title: 'One-Click Vulnerability Fixes',
            description: 'Receive highly accurate, context-aware code patches. Simply click to merge the fixes directly into your GitHub branch.',
            icon: Zap,
        },
        {
            title: 'Multi-Model Verification',
            description: 'Our unparalleled verification pipeline uses lightweight to reasoning models ensuring that proposed fixes are safe, accurate, and performant.',
            icon: Shield,
        },
        {
            title: 'Seamless GitHub Integration',
            description: 'Authenticate with GitHub to monitor repositories directly. We create separate branches for fixes and open Pull Requests automatically.',
            icon: GitPullRequest,
        },
        {
            title: 'Comprehensive Dashboards',
            description: 'Monitor your health score, failure frequency, and time taken. View a timeline of operations in an aesthetically pleasing dashboard.',
            icon: CheckCircle,
        },
        {
            title: 'Any Language Support',
            description: 'Whether it is TypeScript, Python, Go, or Rust, our agents understand context across a diverse array of modern programming languages.',
            icon: Code,
        },
    ];

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 py-20 px-4 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-16">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                        Features that Empower Developers
                    </h1>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                        Discover how CodeHeal transforms your workflow by acting as an autonomous senior engineer for your team.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <div key={idx} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-6">
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
