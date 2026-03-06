import { Calendar, ArrowRight } from 'lucide-react';

export function Blog() {
    const posts = [
        {
            title: 'How we chained four LLMs for 99.9% accurate bug fixing',
            excerpt: 'Read our architectural deep dive on passing context from Gemini to Llama and finally DeepSeek R1 for unparalleled reasoning verification.',
            date: 'March 2, 2026',
            tag: 'Engineering',
            image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2670&auto=format&fit=crop',
        },
        {
            title: 'The Future of CI/CD is Autonomous',
            excerpt: 'Why standard unit testing is no longer enough. The argument for continuous autonomous remediation pipelines.',
            date: 'February 15, 2026',
            tag: 'Opinion',
            image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2670&auto=format&fit=crop',
        },
        {
            title: 'CodeHeal v2 is now universally available',
            excerpt: 'Today we are thrilled to announce CodeHeal v2, bringing faster fixing times, interactive dashboards, and robust Github integrations.',
            date: 'January 20, 2026',
            tag: 'Announcement',
            image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop',
        }
    ];

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 py-20 px-4 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-16">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">CodeHeal Blog</h1>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                        Insights on AI, continuous integration, and engineering culture from the CodeHeal team.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post, idx) => (
                        <div key={idx} className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-sm border border-neutral-200 dark:border-neutral-800 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col">
                            <div className="h-48 overflow-hidden relative">
                                <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                                <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                                    {post.tag}
                                </div>
                            </div>
                            <div className="p-6 flex flex-col flex-1">
                                <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-3">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {post.date}
                                </div>
                                <h3 className="text-xl font-bold mb-3 leading-tight">{post.title}</h3>
                                <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-6 flex-1">
                                    {post.excerpt}
                                </p>
                                <a href="#" className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-sm group">
                                    Read Article
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
