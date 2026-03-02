import { CheckCircle, XCircle, GitBranch, Clock, AlertTriangle, CheckSquare } from 'lucide-react';

interface RunSummaryProps {
  results: {
    repoUrl: string;
    branchName: string;
    totalFailures: number;
    totalFixes: number;
    status: string;
    timeTaken: string;
  };
}

export function RunSummary({ results }: RunSummaryProps) {
  const isPassed = results.status === 'PASSED' || results.status === 'NO_BUGS_FOUND';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
          Run Summary
        </h2>
        <div className={`px-4 py-1.5 rounded-full font-bold text-sm tracking-wide flex items-center gap-2 ${
          isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
        }`}>
          {isPassed ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {results.status}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-neutral-500 font-medium">Repository</p>
            <a href={results.repoUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-medium break-all">
              {results.repoUrl}
            </a>
          </div>
          <div>
            <p className="text-sm text-neutral-500 font-medium flex items-center gap-1">
              <GitBranch className="w-4 h-4" /> Generated Branch
            </p>
            <code className="bg-neutral-100 px-2 py-1 rounded text-sm text-neutral-800 font-mono mt-1 inline-block">
              {results.branchName}
            </code>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 flex flex-col items-center justify-center text-center">
            <AlertTriangle className="w-6 h-6 text-amber-500 mb-2" />
            <p className="text-2xl font-bold text-neutral-900">{results.totalFailures}</p>
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Failures Detected</p>
          </div>
          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 flex flex-col items-center justify-center text-center">
            <CheckSquare className="w-6 h-6 text-emerald-500 mb-2" />
            <p className="text-2xl font-bold text-neutral-900">{results.totalFixes}</p>
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Fixes Applied</p>
          </div>
          <div className="col-span-2 bg-neutral-50 p-4 rounded-xl border border-neutral-100 flex items-center justify-center gap-3">
            <Clock className="w-5 h-5 text-indigo-500" />
            <div>
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Total Time Taken</p>
              <p className="text-lg font-bold text-neutral-900">{results.timeTaken}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
