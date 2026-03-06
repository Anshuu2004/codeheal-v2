import { Check, X, FileText, Hash, MessageSquare } from 'lucide-react';

interface Fix {
  file: string;
  bugType: string;
  lineNumber: number;
  commitMessage: string;
  status: string;
  verifierNote?: string;
}

interface FixesTableProps {
  fixes: Fix[];
}

export function FixesTable({ fixes }: FixesTableProps) {
  const getBugTypeColor = (type: string) => {
    switch (type) {
      case 'LINTING':     return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700';
      case 'SYNTAX':      return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-700';
      case 'LOGIC':       return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-700';
      case 'TYPE_ERROR':  return 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/40 dark:text-pink-300 dark:border-pink-700';
      case 'IMPORT':      return 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/40 dark:text-cyan-300 dark:border-cyan-700';
      case 'INDENTATION': return 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/40 dark:text-teal-300 dark:border-teal-700';
      default:            return 'bg-neutral-100 text-neutral-800 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-600';
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden transition-colors duration-300">
      <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-neutral-900 dark:text-white">
          <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
          Fixes Applied
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800">
              <th className="px-6 py-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">File</th>
              <th className="px-6 py-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Bug Type</th>
              <th className="px-6 py-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Line</th>
              <th className="px-6 py-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Commit Message</th>
              <th className="px-6 py-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {fixes.map((fix, index) => (
              <tr key={index} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    <FileText className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                    {fix.file}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getBugTypeColor(fix.bugType)}`}>
                    {fix.bugType}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400 font-mono">
                    <Hash className="w-3 h-3" />
                    {fix.lineNumber}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300 max-w-xs truncate">
                    <MessageSquare className="w-4 h-4 text-neutral-400 dark:text-neutral-500 mt-0.5 shrink-0" />
                    <span className="truncate" title={fix.commitMessage}>{fix.commitMessage}</span>
                  </div>
                  {fix.verifierNote && (
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1 ml-6 italic">{fix.verifierNote}</p>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {fix.status === 'Fixed' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700">
                      <Check className="w-3.5 h-3.5" /> Fixed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700">
                      <X className="w-3.5 h-3.5" /> Failed
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
