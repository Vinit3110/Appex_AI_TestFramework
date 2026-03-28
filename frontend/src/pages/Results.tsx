import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronDown, ChevronUp, CheckCircle2, XCircle, Clock, ExternalLink, Play, Bug, BarChart3, PieChart, Loader2, RefreshCw } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { Screen, TestResult, Summary, AIAnalysis } from '../types';
import { cn } from '../lib/utils';
import { API_BASE } from '../lib/config';

interface ResultsProps {
  onNavigate: (screen: Screen) => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export default function Results({ onNavigate, showToast }: ResultsProps) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'passed' | 'failed'>('all');
  const [analyses, setAnalyses] = useState<Record<string, AIAnalysis>>({});
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  const fetchResults = () => {
    setLoading(true);
    setFetchError(null);
    fetch(`${API_BASE}/api/tests/results`)
      .then(res => {
        if (!res.ok) throw new Error('No results found. Run tests first via the Execution page.');
        return res.json();
      })
      .then(data => {
        setSummary(data.summary);
        setResults(data.results || []);
        // Auto-expand first failed test
        const firstFailed = (data.results || []).find((r: TestResult) => r.status === 'failed');
        if (firstFailed) setExpandedId(firstFailed.id);
        setLoading(false);
      })
      .catch(err => {
        setFetchError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => { fetchResults(); }, []);

  const analyzeFailure = async (result: TestResult) => {
    if (analyses[result.id] || analyzingId) return;
    setAnalyzingId(result.id);

    try {
      const errorLog = result.errorLog ?? result.error ?? `Test "${result.title}" failed with no error message.`;
      const res = await fetch(`${API_BASE}/api/tests/ai/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errorLog }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Analysis failed');
      setAnalyses(prev => ({ ...prev, [result.id]: data }));
      showToast('AI analysis complete.', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      showToast(`Analysis failed: ${message}`, 'error');
    } finally {
      setAnalyzingId(null);
    }
  };

  const filteredResults = results.filter(res => {
    const matchesSearch =
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || res.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-headline font-bold mb-2">Test <span className="text-secondary">Results</span></h1>
          <p className="text-on-surface-variant">Live results from your last Playwright run.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchResults}
            className="px-6 py-3 rounded-xl glass-panel border border-on-surface-variant/10 font-bold text-sm flex items-center gap-2 hover:bg-surface-variant/40 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => onNavigate('execution')}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-on-primary-container font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
          >
            <Play className="w-4 h-4" />
            Run Again
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-on-surface-variant gap-3">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading results...</span>
        </div>
      ) : fetchError ? (
        <div className="text-center py-20 glass-panel rounded-3xl border border-dashed border-error/20 text-error/70 space-y-4">
          <p>{fetchError}</p>
          <button onClick={() => onNavigate('execution')} className="text-primary underline text-sm">
            Go to Execution →
          </button>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard label="Pass Rate" value={`${summary?.passRate ?? 0}%`} icon={<CheckCircle2 className="text-tertiary" />} />
            <StatCard label="Duration" value={summary?.duration ?? '—'} icon={<Clock className="text-primary" />} />
            <StatCard label="Total Tests" value={String(summary?.total ?? 0)} icon={<BarChart3 className="text-secondary" />} />
            <StatCard label="Failed" value={String(summary?.failed ?? 0)} icon={<PieChart className="text-error" />} />
          </section>

          {/* Filter Bar */}
          <GlassCard className="p-4 flex flex-col md:flex-row items-center gap-4 border border-on-surface-variant/10">
            <div className="flex-1 flex items-center gap-3 px-4 py-2 rounded-xl bg-surface-high border border-on-surface-variant/10 w-full">
              <Search className="text-on-surface-variant w-4 h-4" />
              <input
                type="text"
                placeholder="Search by test name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-on-surface-variant/40 outline-none"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'passed' | 'failed')}
                className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-surface-high border border-on-surface-variant/10 text-sm font-bold outline-none bg-surface-container text-on-surface"
              >
                <option value="all">All Status</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </GlassCard>

          {/* Results List */}
          <div className="space-y-4">
            {filteredResults.length === 0 ? (
              <div className="text-center py-20 glass-panel rounded-3xl border border-dashed border-on-surface-variant/20">
                <Search className="w-12 h-12 text-on-surface-variant/20 mx-auto mb-4" />
                <p className="text-on-surface-variant">No tests found matching your criteria.</p>
              </div>
            ) : filteredResults.map((result) => (
              <div key={result.id}>
                <GlassCard
                  className={cn(
                    "p-0 overflow-hidden border transition-all cursor-pointer",
                    expandedId === result.id ? "border-primary/40 ring-1 ring-primary/20" : "border-on-surface-variant/10 hover:border-on-surface-variant/30"
                  )}
                  onClick={() => setExpandedId(expandedId === result.id ? null : result.id)}
                >
                  <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                        result.status === 'passed' ? "bg-tertiary/10 text-tertiary" :
                          result.status === 'failed' ? "bg-error/10 text-error" :
                            "bg-secondary/10 text-secondary"
                      )}>
                        {result.status === 'passed' ? <CheckCircle2 className="w-6 h-6" /> :
                          result.status === 'failed' ? <XCircle className="w-6 h-6" /> :
                            <Clock className="w-6 h-6" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-[10px] font-mono font-bold text-primary">{result.id.slice(-8)}</span>
                          <h3 className="font-bold">{result.title}</h3>
                        </div>
                        <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">{result.suite ?? 'login.spec.js'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-10">
                      <div className="hidden lg:block text-center">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Duration</p>
                        <p className="text-sm font-bold">{result.duration}</p>
                      </div>
                      <div className="text-right">
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold mb-1",
                          result.status === 'passed' ? "bg-tertiary/10 text-tertiary" :
                            result.status === 'failed' ? "bg-error/10 text-error" :
                              "bg-secondary/10 text-secondary"
                        )}>
                          <span className={cn("w-1.5 h-1.5 rounded-full",
                            result.status === 'passed' ? "bg-tertiary" :
                              result.status === 'failed' ? "bg-error" : "bg-secondary"
                          )} />
                          {result.status.toUpperCase()}
                        </div>
                        <div>
                          {expandedId === result.id ? <ChevronUp className="w-5 h-5 ml-auto" /> : <ChevronDown className="w-5 h-5 ml-auto" />}
                        </div>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedId === result.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-on-surface-variant/10 bg-black/20"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="p-8 space-y-6">
                          {/* Error message */}
                          {result.status === 'failed' && result.error && (
                            <div className="p-4 rounded-xl bg-error/10 border border-error/20 flex gap-4">
                              <Bug className="text-error w-6 h-6 shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <h4 className="text-sm font-bold text-error mb-2 uppercase tracking-wider">Error Message</h4>
                                <p className="text-sm text-on-surface/90 leading-relaxed font-mono">{result.error}</p>
                              </div>
                            </div>
                          )}

                          {/* AI Analysis */}
                          {result.status === 'failed' && (
                            <div>
                              {analyses[result.id] ? (
                                <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20 space-y-3">
                                  <h4 className="text-sm font-bold text-secondary uppercase tracking-wider flex items-center gap-2">
                                    ✦ AI Failure Analysis
                                    <span className={cn(
                                      "text-[10px] px-2 py-0.5 rounded-full font-bold",
                                      analyses[result.id].severity === 'high' ? "bg-error/20 text-error" :
                                        analyses[result.id].severity === 'medium' ? "bg-secondary/20 text-secondary" :
                                          "bg-tertiary/20 text-tertiary"
                                    )}>
                                      {analyses[result.id].severity.toUpperCase()} SEVERITY
                                    </span>
                                  </h4>
                                  <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Root Cause</p>
                                    <p className="text-sm text-on-surface/90 leading-relaxed">{analyses[result.id].cause}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Suggested Fix</p>
                                    <p className="text-sm text-on-surface/90 leading-relaxed">{analyses[result.id].fix}</p>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => analyzeFailure(result)}
                                  disabled={analyzingId === result.id}
                                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary text-sm font-bold hover:bg-secondary/20 transition-all disabled:opacity-60"
                                >
                                  {analyzingId === result.id
                                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing with Gemini AI...</>
                                    : <><Bug className="w-4 h-4" /> Analyze Failure with AI</>
                                  }
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <GlassCard className="p-6 border border-on-surface-variant/10">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 rounded-lg bg-surface-high">
          {icon}
        </div>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">{label}</p>
      <p className="text-2xl font-headline font-bold">{value}</p>
    </GlassCard>
  );
}
