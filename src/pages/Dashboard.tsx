import { useState } from 'react';
import { InputSection } from '../components/InputSection';
import { RunSummary } from '../components/RunSummary';
import { ScoreBreakdown } from '../components/ScoreBreakdown';
import { FixesTable } from '../components/FixesTable';
import { Timeline } from '../components/Timeline';
import { Activity, Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface AnalysisResults {
  repoUrl: string;
  branchName: string;
  totalFailures: number;
  totalFixes: number;
  status: string;
  timeTaken: string;
  scoreDetails: {
    baseScore: number;
    speedBonus: number;
    efficiencyPenalty: number;
    totalScore: number;
  };
  fixes: Array<{
    file: string;
    bugType: string;
    lineNumber: number;
    commitMessage: string;
    status: string;
  }>;
  timeline: Array<{
    iteration: number;
    status: string;
    timestamp: string;
  }>;
  iterationsUsed: number;
  retryLimit: number;
}

export function Dashboard() {
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [loading, setLoading] = useState(false);
  const { session, authLoading, handleSignIn } = useAuth();

  const handleAnalyze = async (data: { repoUrl: string }) => {
    if (!session) {
      alert("Please sign in to analyze repositories.");
      return;
    }

    setLoading(true);
    setResults(null);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          ...data,
          providerToken: session.provider_token // Pass the GitHub token to the backend
        }),
      });

      const resultData = await response.json();

      if (!response.ok) {
        throw new Error(resultData.error || 'Analysis failed');
      }

      setResults(resultData);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(error);
      alert(`Failed to analyze repository: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <Activity className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Authentication Required</h2>
          <p className="text-neutral-600 mb-8">Please sign in with your GitHub account to access the CodeHeal dashboard and analyze your repositories.</p>
          <button
            onClick={handleSignIn}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            Sign In with GitHub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Dashboard</h1>
          <p className="text-neutral-500 mt-2">Analyze your repositories and deploy AI-generated fixes.</p>
        </div>

        <InputSection onAnalyze={handleAnalyze} loading={loading} />

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Activity className="w-12 h-12 text-indigo-600 animate-pulse" />
            <p className="text-lg font-medium text-neutral-600 animate-pulse">Agent is analyzing repository and applying fixes...</p>
          </div>
        )}

        {results && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 transition-all duration-500">
            <div className="lg:col-span-2 space-y-8">
              <RunSummary results={results} />
              <FixesTable fixes={results.fixes} />
            </div>
            <div className="space-y-8">
              <ScoreBreakdown details={results.scoreDetails} />
              <Timeline timeline={results.timeline} iterationsUsed={results.iterationsUsed} retryLimit={results.retryLimit} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
