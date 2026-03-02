import { Check, X, FileText, Tag, Hash, MessageSquare, Activity } from 'lucide-react';

interface Fix {
  file: string;
  bugType: string;
  lineNumber: number;
  commitMessage: string;
  status: string;
}

interface FixesTableProps {
  fixes: Fix[];
}

export function FixesTable({ fixes }: FixesTableProps) {
  const getBugTypeColor = (type: string) => {
    switch (type) {
      case 'LINTING': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SYNTAX': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'LOGIC': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'TYPE_ERROR': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'IMPORT': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'INDENTATION': return 'bg-teal-100 text-teal-800 border-teal-200';
      default: return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
      <div className="p-6 border-b border-neutral-200">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
          Fixes Applied
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200">
              <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">File</th>
              <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Bug Type</th>
              <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Line Number</th>
              <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Commit Message</th>
              <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {fixes.map((fix, index) => (
              <tr key={index} className="hover:bg-neutral-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-sm font-medium text-neutral-900">
                    <FileText className="w-4 h-4 text-neutral-400" />
                    {fix.file}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getBugTypeColor(fix.bugType)}`}>
                    {fix.bugType}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1 text-sm text-neutral-500 font-mono">
                    <Hash className="w-3 h-3" />
                    {fix.lineNumber}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-start gap-2 text-sm text-neutral-700 max-w-xs truncate">
                    <MessageSquare className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                    <span className="truncate" title={fix.commitMessage}>{fix.commitMessage}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {fix.status === 'Fixed' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <Check className="w-3.5 h-3.5" /> Fixed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
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
