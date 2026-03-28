import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Rocket, CheckCircle2, AlertTriangle, TrendingUp, ExternalLink, Sparkles, Bot, Database, Plus, Settings, Loader2 } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { Screen, TestResult, Summary } from '../types';
import { cn } from '../lib/utils';
import { API_BASE } from '../lib/config';

interface DashboardProps {
  onNavigate: (screen: Screen) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/tests/results`)
      .then(res => {
        if (!res.ok) throw new Error('No results yet. Run tests first.');
        return res.json();
      })
      .then(data => {
        setSummary(data.summary);
        setResults(data.results || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const passRate = summary ? summary.passRate : 0;
  const failRate = summary ? (100 - summary.passRate) : 0;

  return (
    <div className="space-y-10">
      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-xl p-10 glass-panel min-h-[240px] flex flex-col justify-end border border-white/5">
        <div className="absolute top-0 right-0 w-2/3 h-full opacity-40 mix-blend-screen pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-l from-primary/20 to-transparent" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="font-headline text-5xl font-extrabold text-on-surface tracking-tighter mb-4 leading-tight">
            Welcome back to <span className="text-primary italic">Appex.</span>
          </h2>
          <p className="text-on-surface-variant text-lg max-w-xl leading-relaxed">
            {loading ? 'Fetching latest test data...' : error ? error : `Last run: ${summary?.total ?? 0} tests · ${summary?.duration ?? '—'} · ${summary?.passRate ?? 0}% pass rate`}
          </p>
        </div>
      </section>

      {/* Stats Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-on-surface-variant gap-3">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading stats...</span>
        </div>
      ) : error ? (
        <div className="text-center py-12 glass-panel rounded-2xl border border-dashed border-error/20 text-error/70">
          {error}
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Tests */}
            <GlassCard className="group relative overflow-hidden transition-all hover:translate-y-[-4px]">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 blur-3xl rounded-full group-hover:bg-primary/20 transition-colors" />
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <Rocket className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-primary flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" /> {summary?.duration}
                </span>
              </div>
              <p className="text-on-surface-variant text-xs font-bold tracking-widest uppercase mb-1">Total Tests Run</p>
              <h3 className="font-headline text-4xl font-bold text-on-surface">{summary?.total ?? 0}</h3>
              <div className="mt-4 h-1 w-full bg-surface-high rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
            </GlassCard>

            {/* Passed */}
            <GlassCard className="group relative overflow-hidden transition-all hover:translate-y-[-4px]">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-tertiary/10 blur-3xl rounded-full group-hover:bg-tertiary/20 transition-colors" />
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 rounded-xl bg-tertiary/10 text-tertiary">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-tertiary flex items-center gap-1">
                  {passRate}% Pass Rate
                </span>
              </div>
              <p className="text-on-surface-variant text-xs font-bold tracking-widest uppercase mb-1">Passed Tests</p>
              <h3 className="font-headline text-4xl font-bold text-on-surface">{summary?.passed ?? 0}</h3>
              <div className="mt-4 h-1 w-full bg-surface-high rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${passRate}%` }}
                  className="h-full bg-tertiary rounded-full"
                />
              </div>
            </GlassCard>

            {/* Failed */}
            <GlassCard className="group relative overflow-hidden transition-all hover:translate-y-[-4px]">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-error/10 blur-3xl rounded-full group-hover:bg-error/20 transition-colors" />
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 rounded-xl bg-error/10 text-error">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-error flex items-center gap-1">
                  {failRate.toFixed(1)}% Fail Rate
                </span>
              </div>
              <p className="text-on-surface-variant text-xs font-bold tracking-widest uppercase mb-1">Failed Tests</p>
              <h3 className="font-headline text-4xl font-bold text-on-surface">{summary?.failed ?? 0}</h3>
              <div className="mt-4 h-1 w-full bg-surface-high rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${failRate}%` }}
                  className="h-full bg-error rounded-full"
                />
              </div>
            </GlassCard>
          </section>

          {/* Main Content Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Recent Results Table */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h4 className="font-headline text-2xl font-bold">Recent Test Results</h4>
                  <p className="text-on-surface-variant text-sm">Live results from your last Playwright run</p>
                </div>
                <button
                  onClick={() => onNavigate('results')}
                  className="text-primary text-xs font-bold hover:underline"
                >
                  View All Results
                </button>
              </div>

              <GlassCard className="p-2 overflow-hidden">
                <table className="w-full text-left border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-[10px] text-on-surface-variant tracking-widest uppercase font-bold">
                      <th className="py-4 pl-6">Test ID</th>
                      <th className="py-4">Test Name</th>
                      <th className="py-4">Status</th>
                      <th className="py-4">Duration</th>
                      <th className="py-4 pr-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.slice(0, 5).map((result) => (
                      <tr key={result.id} className="bg-surface-container/30 hover:bg-surface-container/60 transition-colors rounded-xl group">
                        <td className="py-5 pl-6 font-mono text-xs text-primary font-bold truncate max-w-[80px]">
                          {result.id.split('-').pop()}
                        </td>
                        <td className="py-5">
                          <p className="text-sm font-semibold truncate max-w-[200px]">{result.title}</p>
                          <p className="text-[10px] text-on-surface-variant opacity-60">{result.suite ?? 'login.spec.js'}</p>
                        </td>
                        <td className="py-5">
                          <div className={cn(
                            "inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold",
                            result.status === 'passed' && "bg-tertiary/10 text-tertiary",
                            result.status === 'failed' && "bg-error/10 text-error",
                            result.status === 'skipped' && "bg-secondary/10 text-secondary"
                          )}>
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              result.status === 'passed' && "bg-tertiary shadow-[0_0_8px_#a1faff]",
                              result.status === 'failed' && "bg-error shadow-[0_0_8px_#ff716c]",
                              result.status === 'skipped' && "bg-secondary shadow-[0_0_8px_#c180ff]"
                            )} />
                            {result.status.toUpperCase()}
                          </div>
                        </td>
                        <td className="py-5 text-sm text-on-surface-variant">{result.duration}</td>
                        <td className="py-5 pr-6 text-right">
                          <button
                            onClick={() => onNavigate('results')}
                            className="p-2 rounded-lg hover:bg-surface-variant transition-colors text-on-surface-variant group-hover:text-primary"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </GlassCard>
            </div>

            {/* Sidebar Insights */}
            <div className="lg:col-span-4 space-y-6">
              <h4 className="font-headline text-2xl font-bold">System Insights</h4>

              <GlassCard className="relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="text-secondary w-4 h-4" />
                    <span className="text-xs font-bold tracking-[0.2em] text-on-surface uppercase opacity-80">AI Suggestion</span>
                  </div>
                  <h5 className="text-lg font-bold mb-3 leading-tight">
                    {summary && summary.failed > 0 ? 'Failures Detected' : 'All Tests Passing'}
                  </h5>
                  <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                    {summary && summary.failed > 0
                      ? `${summary.failed} test(s) failed in the last run. Use the AI Generator to diagnose and fix failing tests.`
                      : 'Great job! All tests are passing. Consider adding more test coverage with the AI Generator.'}
                  </p>
                  <button
                    onClick={() => onNavigate('generator')}
                    className="text-primary text-xs font-bold flex items-center gap-2 group"
                  >
                    {summary && summary.failed > 0 ? 'Diagnose with AI' : 'Generate New Tests'}
                    <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                      <TrendingUp className="w-4 h-4" />
                    </motion.span>
                  </button>
                </div>
                <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-secondary/10 blur-[60px] rounded-full" />
              </GlassCard>

              <GlassCard>
                <div className="flex items-center justify-between mb-6">
                  <h5 className="font-bold">Run Summary</h5>
                  <Settings className="w-4 h-4 text-on-surface-variant" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-xs font-bold">Passed</p>
                        <p className="text-[10px] text-primary">{passRate}%</p>
                      </div>
                      <div className="h-1 w-full bg-surface-high rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${passRate}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-error/10 text-error">
                      <Database className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-xs font-bold">Failed</p>
                        <p className={cn("text-[10px]", failRate > 10 ? "text-error" : "text-primary")}>{failRate.toFixed(1)}%</p>
                      </div>
                      <div className="h-1 w-full bg-surface-high rounded-full overflow-hidden">
                        <div className="h-full bg-error transition-all duration-1000" style={{ width: `${failRate}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          </section>
        </>
      )}

      {/* Mobile FAB */}
      <button
        onClick={() => onNavigate('generator')}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-gradient-to-r from-primary to-secondary text-on-primary-container shadow-2xl shadow-primary/40 flex items-center justify-center md:hidden z-50"
      >
        <Plus className="w-8 h-8" />
      </button>
    </div>
  );
}
