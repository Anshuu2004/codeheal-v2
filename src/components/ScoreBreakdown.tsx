import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Trophy, Zap, CheckCircle } from 'lucide-react';

interface ScoreBreakdownProps {
  details: {
    baseScore: number;
    speedBonus: number;
    fixRateBonus: number;
    totalScore: number;
  };
}

export function ScoreBreakdown({ details }: ScoreBreakdownProps) {
  const data = [
    { name: 'Base Score', value: details.baseScore, color: '#4f46e5' },
    { name: 'Speed Bonus', value: details.speedBonus, color: '#10b981' },
    { name: 'Fix Rate Bonus', value: details.fixRateBonus, color: '#f59e0b' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 flex flex-col h-full">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
        Score Breakdown
      </h2>

      <div className="flex-1 flex flex-col items-center justify-center mb-6">
        <div className="relative w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value} pts`, '']}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold text-neutral-900">{details.totalScore}</span>
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Total</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50 border border-indigo-100">
          <div className="flex items-center gap-2 text-indigo-700">
            <Trophy className="w-4 h-4" />
            <span className="font-medium text-sm">Base Score</span>
          </div>
          <span className="font-bold text-indigo-700">{details.baseScore}</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100">
          <div className="flex items-center gap-2 text-emerald-700">
            <Zap className="w-4 h-4" />
            <span className="font-medium text-sm">Speed Bonus</span>
          </div>
          <span className="font-bold text-emerald-700">+{details.speedBonus}</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-100">
          <div className="flex items-center gap-2 text-amber-700">
            <CheckCircle className="w-4 h-4" />
            <span className="font-medium text-sm">Fix Rate Bonus</span>
          </div>
          <span className="font-bold text-amber-700">+{details.fixRateBonus}</span>
        </div>
      </div>
    </div>
  );
}
