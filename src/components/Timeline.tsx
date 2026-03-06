import { CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface TimelineEvent {
  iteration: number;
  status: string;
  timestamp: string;
}

interface TimelineProps {
  timeline: TimelineEvent[];
  iterationsUsed: number;
  retryLimit: number;
}

export function Timeline({ timeline, iterationsUsed, retryLimit }: TimelineProps) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6 transition-colors duration-300 overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-neutral-900 dark:text-white">
          <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0">5</span>
          CI/CD Timeline
        </h2>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full text-sm font-medium text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 shrink-0">
          <RefreshCw className="w-4 h-4" />
          {iterationsUsed}/{retryLimit}
        </div>
      </div>

      <div className="relative ml-4">
        {/* Vertical line — scoped to content height */}
        <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-neutral-200 dark:bg-neutral-700" />

        <div className="space-y-6">
          {timeline.map((event, index) => {
            const isPassed  = event.status === 'PASSED' || event.status === 'NO_BUGS_FOUND';
            const isStarted = event.status === 'STARTED';
            return (
              <div key={index} className="relative pl-8">
                {/* Dot on the line */}
                <div className={`absolute -left-[9px] top-3 w-5 h-5 rounded-full border-2 bg-white dark:bg-neutral-900 flex items-center justify-center shrink-0 ${
                  isPassed  ? 'border-emerald-500' :
                  isStarted ? 'border-indigo-500'  : 'border-red-500'
                }`}>
                  {isPassed
                    ? <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    : isStarted
                      ? <Clock className="w-3 h-3 text-indigo-500" />
                      : <XCircle className="w-3 h-3 text-red-500" />
                  }
                </div>

                <div className="bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-700 rounded-xl p-4">
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <span className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wide">
                      Iteration {event.iteration}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wide shrink-0 ${
                      isPassed  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' :
                      isStarted ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300' :
                                  'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    {format(new Date(event.timestamp), 'MMM d, yyyy • HH:mm:ss')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}