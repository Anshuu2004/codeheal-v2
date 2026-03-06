import { useState, useEffect, useRef } from 'react';
import { InputSection } from '../components/InputSection';
import { RunSummary } from '../components/RunSummary';
import { ScoreBreakdown } from '../components/ScoreBreakdown';
import { FixesTable } from '../components/FixesTable';
import { Timeline } from '../components/Timeline';
import { Activity, Lock, CheckCircle, XCircle, SkipForward, AlertCircle, GitPullRequest } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface AnalysisResults {
  repoUrl: string;
  branchName: string;
  totalFailures: number;
  totalFixes: number;
  status: string;
  timeTaken: string;
  prUrl?: string | null;
  scoreDetails: {
    baseScore: number;
    speedBonus: number;
    fixRateBonus: number;
    totalScore: number;
  };
  fixes: Array<{
    file: string;
    bugType: string;
    lineNumber: number;
    commitMessage: string;
    status: string;
    verifierNote?: string;
    detectedBy?: string;
    fixedBy?: string;
    verifiedBy?: string;
  }>;
  timeline: Array<{
    iteration: number;
    status: string;
    timestamp: string;
  }>;
  iterationsUsed: number;
  retryLimit: number;
  modelsUsed?: {
    detection: string;
    fixing: string;
    fastVerify: string;
    deepVerify: string;
    reasoningVerify: string;
  };
}

interface LiveEvent {
  type: string;
  message: string;
  timestamp: string;
  data?: any;
}

export function Dashboard() {
  const [results, setResults]         = useState<AnalysisResults | null>(null);
  const [loading, setLoading]         = useState(false);
  const [liveEvents, setLiveEvents]   = useState<LiveEvent[]>([]);
  const [jobStatus, setJobStatus]     = useState<string>('');
  const [totalFiles, setTotalFiles]   = useState<number>(0);
  const [doneFiles, setDoneFiles]     = useState<number>(0);
  const eventSourceRef                = useRef<EventSource | null>(null);
  const liveLogRef                    = useRef<HTMLDivElement>(null);
  const { session, authLoading, handleSignIn } = useAuth();

  // Auto-scroll live log to bottom
  useEffect(() => {
    if (liveLogRef.current) {
      liveLogRef.current.scrollTop = liveLogRef.current.scrollHeight;
    }
  }, [liveEvents]);

  // Cleanup SSE on unmount
  useEffect(() => {
    return () => { eventSourceRef.current?.close(); };
  }, []);

  const handleAnalyze = async (data: { repoUrl: string }) => {
    if (!session) { alert('Please sign in to analyze repositories.'); return; }

    // Reset state
    setLoading(true);
    setResults(null);
    setLiveEvents([]);
    setJobStatus('pending');
    setTotalFiles(0);
    setDoneFiles(0);
    eventSourceRef.current?.close();

    try {
      // Step 1: Create background job — returns immediately with jobId
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: data.repoUrl }),
      });
      const jobData = await response.json();
      if (!response.ok) throw new Error(jobData.error || 'Failed to start analysis');

      const { jobId } = jobData;
      setJobStatus('running');

      // Step 2: Open SSE stream for live events
      const es = new EventSource(`/api/job/${jobId}/stream`);
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const e: LiveEvent = JSON.parse(event.data);

          // Add to live log (skip heartbeat comments)
          setLiveEvents(prev => [...prev, e]);

          // Track file count
          if (e.type === 'FILE_ANALYZING' && e.data?.totalFiles) {
            setTotalFiles(e.data.totalFiles);
          }
          if (e.type === 'FILE_DONE' || e.type === 'FILE_REJECTED' || e.type === 'FILE_SKIPPED') {
            setDoneFiles(prev => prev + 1);
          }

          // Job finished
          if (e.type === 'COMPLETED') {
            setResults(e.data);
            setJobStatus('completed');
            setLoading(false);
            es.close();
          }

          if (e.type === 'FAILED') {
            setJobStatus('failed');
            setLoading(false);
            alert(`Analysis failed: ${e.message}`);
            es.close();
          }
        } catch {}
      };

      es.onerror = () => {
        // SSE connection dropped — poll for result as fallback
        es.close();
        pollForResult(jobId);
      };

    } catch (error: unknown) {
      alert(`Failed to start analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setLoading(false);
      setJobStatus('');
    }
  };

  // Fallback polling if SSE drops
  const pollForResult = async (jobId: string) => {
    const maxAttempts = 60;
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(r => setTimeout(r, 5000));
      try {
        const res  = await fetch(`/api/job/${jobId}/result`);
        const data = await res.json();
        if (data.status === 'completed') {
          setResults(data.result);
          setJobStatus('completed');
          setLoading(false);
          return;
        }
        if (data.status === 'failed') {
          setJobStatus('failed');
          setLoading(false);
          alert(`Analysis failed: ${data.error}`);
          return;
        }
      } catch {}
    }
    setLoading(false);
    alert('Analysis timed out. Please try again.');
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'FILE_DONE':     return <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />;
      case 'FILE_REJECTED': return <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />;
      case 'FILE_SKIPPED':  return <SkipForward className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />;
      case 'FILE_ERROR':    return <AlertCircle className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />;
      case 'COMPLETED':     return <CheckCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />;
      case 'FAILED':        return <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />;
      default:              return <Activity className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'FILE_DONE':     return 'text-emerald-700 dark:text-emerald-300';
      case 'FILE_REJECTED': return 'text-red-600 dark:text-red-400';
      case 'FILE_ERROR':    return 'text-orange-600 dark:text-orange-400';
      case 'COMPLETED':     return 'text-indigo-700 dark:text-indigo-300 font-semibold';
      case 'FAILED':        return 'text-red-700 dark:text-red-300 font-semibold';
      default:              return 'text-neutral-600 dark:text-neutral-400';
    }
  };

  const progressPercent = totalFiles > 0 ? Math.round((doneFiles / totalFiles) * 100) : 0;

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <Activity className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex-1 bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center p-4">
        <div className="bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Authentication Required</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8">
            Please sign in with your GitHub account to access the CodeHeal dashboard.
          </p>
          <button onClick={handleSignIn} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors">
            Sign In with GitHub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans transition-colors duration-300">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Dashboard</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-2">Analyze your repositories and deploy AI-generated fixes.</p>
        </div>

        <InputSection onAnalyze={handleAnalyze} loading={loading} />

        {/* Live Progress Panel */}
        {loading && (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                <h2 className="font-semibold text-neutral-900 dark:text-white">
                  Live Analysis
                </h2>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {jobStatus === 'running' ? 'Processing...' : 'Starting...'}
                </span>
              </div>
              {totalFiles > 0 && (
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  {doneFiles} / {totalFiles} files
                </span>
              )}
            </div>

            {/* Progress bar */}
            {totalFiles > 0 && (
              <div className="px-5 pt-4">
                <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2">
                  <div
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5">{progressPercent}% complete</p>
              </div>
            )}

            {/* Live log */}
            <div
              ref={liveLogRef}
              className="p-5 space-y-2 max-h-80 overflow-y-auto font-mono text-xs"
            >
              {liveEvents.length === 0 && (
                <div className="flex items-center gap-2 text-neutral-400">
                  <Activity className="w-3.5 h-3.5 animate-spin" />
                  <span>Connecting to analysis stream...</span>
                </div>
              )}
              {liveEvents.map((event, i) => (
                <div key={i} className={`flex items-start gap-2 ${getEventColor(event.type)}`}>
                  {getEventIcon(event.type)}
                  <span>{event.message}</span>
                </div>
              ))}
            </div>

            {/* AI Pipeline indicator */}
            <div className="px-5 pb-5">
              <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-3 flex flex-wrap gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                <span className="font-medium text-neutral-700 dark:text-neutral-300">Pipeline:</span>
                <span>🔍 Gemini 2.5 Flash</span>
                <span>→</span>
                <span>🔧 Kimi K2</span>
                <span>→</span>
                <span>✅ Llama 8B</span>
                <span>→</span>
                <span>🧠 Llama 70B</span>
                <span>→</span>
                <span>💡 DeepSeek R1</span>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-8 transition-all duration-500">

            {/* PR Banner */}
            {results.prUrl && (
              <a
                href={results.prUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
              >
                <GitPullRequest className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-800 dark:text-emerald-300">Pull Request Created</p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">{results.prUrl}</p>
                </div>
              </a>
            )}

            {/* Models Used Banner */}
            {results.modelsUsed && (
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-4">
                <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-2 uppercase tracking-wider">AI Pipeline Used</p>
                <div className="flex flex-wrap gap-2 text-xs text-indigo-600 dark:text-indigo-400">
                  <span>🔍 {results.modelsUsed.detection}</span>
                  <span className="text-indigo-300">•</span>
                  <span>🔧 {results.modelsUsed.fixing}</span>
                  <span className="text-indigo-300">•</span>
                  <span>✅ {results.modelsUsed.fastVerify}</span>
                  <span className="text-indigo-300">•</span>
                  <span>🧠 {results.modelsUsed.deepVerify}</span>
                  <span className="text-indigo-300">•</span>
                  <span>💡 {results.modelsUsed.reasoningVerify}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8 min-w-0">
                <RunSummary results={results} />
                <FixesTable fixes={results.fixes ?? []} />
              </div>
              <div className="space-y-8 min-w-0 overflow-hidden">
                <ScoreBreakdown details={results.scoreDetails} />
                <Timeline
                  timeline={results.timeline}
                  iterationsUsed={results.iterationsUsed}
                  retryLimit={results.retryLimit}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
