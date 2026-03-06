import { MessageCircle, Github, Users } from 'lucide-react';

export function Community() {
    const links = [
        {
            title: 'Discord Server',
            desc: 'Join 50,000+ developers talking about AI coding, prompt fine-tuning, and sharing tips.',
            icon: MessageCircle,
            bg: 'bg-[#5865F2] text-white hover:bg-[#4752C4]',
        },
        {
            title: 'GitHub Discussions',
            desc: 'Request features, report persistent bugs in the analyzer, and collaborate on the open-source client.',
            icon: Github,
            bg: 'bg-neutral-900 border border-neutral-800 text-white hover:bg-neutral-800',
        },
        {
            title: 'Community Forums',
            desc: 'A structured space to read guides, share success stories, and participate in our monthly hackathons.',
            icon: Users,
            bg: 'bg-emerald-600 text-white hover:bg-emerald-700',
        }
    ];

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 py-20 px-4 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-16">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">CodeHeal Community</h1>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                        You are not building alone. Connect with other developers, share the AI workflows you've constructed, and get help.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {links.map((item, idx) => (
                        <div key={idx} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 rounded-2xl flex flex-col items-center text-center hover:-translate-y-1 shadow-sm hover:shadow-xl transition-all duration-300">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-md`}>
                                <item.icon className="w-8 h-8 text-neutral-900 dark:text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-sm mb-8 flex-1">
                                {item.desc}
                            </p>
                            <button className={`w-full py-3 rounded-xl font-semibold transition-colors ${item.bg}`}>
                                Join Now
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
