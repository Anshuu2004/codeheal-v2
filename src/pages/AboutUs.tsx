import { Code2, Target, Users } from 'lucide-react';

export function AboutUs() {
    const values = [
        { title: 'Developer First', desc: 'Every tool we build is designed to minimize friction and maximize flow state.', icon: Code2 },
        { title: 'Audacious Goals', desc: 'We believe AGI is coming, and coding is the first domain to entirely succumb to it.', icon: Target },
        { title: 'Radical Transparency', desc: 'We are honest when a model hallucinates, and we are working hard to mitigate it.', icon: Users },
    ];

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 py-20 px-4 transition-colors duration-300">
            <div className="max-w-4xl mx-auto space-y-20">
                <div className="text-center space-y-6">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">About CodeHeal</h1>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed text-left md:text-center">
                        Born from frustration. CodeHeal was founded in late 2025 by ex-engineers from Google DeepMind and OpenAI.
                        We spent countless hours debugging race conditions and hunting down missing dependencies.
                        We asked: <em className="text-indigo-600 dark:text-indigo-400 font-semibold text-xl block mt-4">"If an AI can pass algorithmic coding interviews, why can't it just fix our CI pipelines?"</em>
                    </p>
                </div>

                <div className="relative rounded-3xl overflow-hidden h-96 shadow-2xl">
                    <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2670&auto=format&fit=crop" alt="Team collaborating" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-neutral-900/50 flex flex-col justify-end p-8">
                        <h2 className="text-3xl font-bold text-white mb-2">The Team</h2>
                        <p className="text-neutral-200">Building the future of software engineering from San Francisco, CA.</p>
                    </div>
                </div>

                <div className="space-y-12">
                    <h2 className="text-3xl font-extrabold text-center tracking-tight">Our Core Values</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {values.map((v, i) => (
                            <div key={i} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 rounded-2xl text-center">
                                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mx-auto mb-6">
                                    <v.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{v.title}</h3>
                                <p className="text-neutral-600 dark:text-neutral-400 text-sm">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
