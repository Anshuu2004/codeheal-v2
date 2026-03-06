import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Trophy, Zap, CheckCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ScoreBreakdownProps {
  details: {
    baseScore: number;
    speedBonus: number;
    fixRateBonus: number;
    totalScore: number;
  };
}

export function ScoreBreakdown({ details }: ScoreBreakdownProps) {
  const { theme } = useTheme();

  const data = [
    { name: 'Base Score', value: details.baseScore, color: '#4f46e5' },
    { name: 'Speed Bonus', value: details.speedBonus, color: '#10b981' },
    { name: 'Fix Rate Bonus', value: details.fixRateBonus, color: '#f59e0b' },
  ];

  const tooltipStyle = {
    borderRadius: '8px',
    border: 'none',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
    color: theme === 'dark' ? '#f9fafb' : '#111827',
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6 transition-colors duration-300">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-neutral-900 dark:text-white">
        <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
        Score Breakdown
      </h2>
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="relative w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`${value} pts`, '']} contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold text-neutral-900 dark:text-white">{details.totalScore}</span>
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Total</span>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
            <Trophy className="w-4 h-4" />
            <span className="font-medium text-sm">Base Score</span>
          </div>
          <span className="font-bold text-indigo-700 dark:text-indigo-400">{details.baseScore}</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
            <Zap className="w-4 h-4" />
            <span className="font-medium text-sm">Speed Bonus</span>
          </div>
          <span className="font-bold text-emerald-700 dark:text-emerald-400">+{details.speedBonus}</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <CheckCircle className="w-4 h-4" />
            <span className="font-medium text-sm">Fix Rate Bonus</span>
          </div>
          <span className="font-bold text-amber-700 dark:text-amber-400">+{details.fixRateBonus}</span>
        </div>
      </div>
    </div>
  );
}
