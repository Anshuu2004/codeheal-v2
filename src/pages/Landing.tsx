import { Link } from 'react-router-dom';
import { CheckCircle, Zap, Shield, ArrowRight } from 'lucide-react';

export function Landing() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans transition-colors duration-300">
      <main>
        <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-medium text-sm mb-8 border border-indigo-100 dark:border-indigo-800">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse"></span>
            CodeHeal 2.0 is now live
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-8 leading-tight">
            Stop fixing bugs. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
              Let AI do it for you.
            </span>
          </h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            CodeHeal automatically scans your GitHub repositories, detects bugs, and pushes intelligent fixes directly to your codebase.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-lg transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 flex items-center justify-center gap-2">
              Start Healing Code <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#features" className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2">
              View Features
            </a>
          </div>
        </section>

        <section id="features" className="py-24 bg-neutral-50 dark:bg-neutral-900 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white mb-4">Everything you need to ship faster</h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">Our AI-powered engine integrates seamlessly into your workflow.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-neutral-800 p-8 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-700 transition-colors duration-300">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-neutral-900 dark:text-white">Instant Analysis</h3>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">Connect your GitHub repository and get a complete bug report in seconds.</p>
              </div>
              <div className="bg-white dark:bg-neutral-800 p-8 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-700 transition-colors duration-300">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-6">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-neutral-900 dark:text-white">Automated Fixes</h3>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">CodeHeal writes the fix and commits it to a new branch automatically.</p>
              </div>
              <div className="bg-white dark:bg-neutral-800 p-8 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-700 transition-colors duration-300">
                <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 rounded-xl flex items-center justify-center mb-6">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-neutral-900 dark:text-white">Enterprise Security</h3>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">AES-256-GCM encryption with zero-retention policies keeps your code safe.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
