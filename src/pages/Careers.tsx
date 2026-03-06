export function Careers() {
    const jobs = [
        { title: 'Senior AI Engineer, Alignment', dept: 'Engineering', loc: 'San Francisco, CA or Remote', type: 'Full-time' },
        { title: 'Staff Software Engineer, Backend', dept: 'Engineering', loc: 'Remote (US Timezones)', type: 'Full-time' },
        { title: 'Developer Advocate', dept: 'Marketing & DevRel', loc: 'London, UK or Remote', type: 'Full-time' },
        { title: 'Product Designer (UI/UX)', dept: 'Design', loc: 'San Francisco, CA', type: 'Full-time' },
    ];

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 py-20 px-4 transition-colors duration-300">
            <div className="max-w-5xl mx-auto space-y-16">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Careers at CodeHeal</h1>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                        Help us build the developer tools of the future. We're hiring ambitious engineers, designers, and thinkers.
                    </p>
                </div>

                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 md:p-12 shadow-sm text-center">
                    <h2 className="text-2xl font-bold mb-4">Why work with us?</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 text-neutral-600 dark:text-neutral-400 font-medium">
                        <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-100 dark:border-neutral-800">Unlimited PTO</div>
                        <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-100 dark:border-neutral-800">100% Health Coverage</div>
                        <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-100 dark:border-neutral-800">Remote First</div>
                        <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-100 dark:border-neutral-800">Top-tier Hardware</div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-extrabold mb-6 flex items-center gap-3">
                        Open Positions <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400 text-xs px-3 py-1 rounded-full font-bold">{jobs.length}</span>
                    </h2>
                    {jobs.map((job, idx) => (
                        <div key={idx} className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-lg transition-all duration-300 cursor-pointer">
                            <div>
                                <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{job.title}</h3>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400 font-medium">
                                    <span className="bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full">{job.dept}</span>
                                    <span className="bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full">{job.loc}</span>
                                    <span className="bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full">{job.type}</span>
                                </div>
                            </div>
                            <button className="whitespace-nowrap bg-neutral-950 dark:bg-white text-white dark:text-black font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity">
                                Apply Now
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
