import { useState, FormEvent } from 'react';
import { Play } from 'lucide-react';

interface InputSectionProps {
  onAnalyze: (data: { repoUrl: string }) => void;
  loading: boolean;
}

export function InputSection({ onAnalyze, loading }: InputSectionProps) {
  const [repoUrl, setRepoUrl] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (repoUrl) {
      onAnalyze({ repoUrl });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
        Repository Configuration
      </h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-neutral-700">GitHub Repository URL</label>
          <input
            type="url"
            required
            placeholder="https://github.com/user/repo"
            className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="flex justify-end items-end mt-2 md:col-span-1">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing...
              </span>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Agent
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
