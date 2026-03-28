import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Cpu, Zap, CheckCircle2, Loader2, ShieldCheck, Network, AlertTriangle } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { Screen } from '../types';
import { API_BASE } from '../lib/config';

const POLL_INTERVAL_MS = 2000;

interface ExecutionProps {
  onNavigate: (screen: Screen) => void;
}

export default function Execution({ onNavigate }: ExecutionProps) {
  const [logs, setLogs] = useState<{ id: number; text: string }[]>([{ id: 0, text: 'Connecting to backend...' }]);
  const logCounter = useRef(1);
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [browser, setBrowser] = useState('chromium');
  const logEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-scroll terminal
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (line: string) => {
    const id = logCounter.current++;
    setLogs(prev => [...prev.slice(-199), { id, text: line }]);
  };

  const startRun = async () => {
    setStarted(true);
    setError(null);
    const id = logCounter.current++;
    setLogs([{ id, text: `[${new Date().toLocaleTimeString()}] Starting ${browser} test run...` }]);
    setProgress(5);

    try {
      const res = await fetch(`${API_BASE}/api/tests/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ browser }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to start run');

      addLog(`[${new Date().toLocaleTimeString()}] ${data.message}`);
      setIsRunning(true);
      setProgress(10);
      pollStatus();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start run';
      setError(message);
      addLog(`[ERROR] ${message}`);
      setStarted(false);
    }
  };

  const pollStatus = () => {
    let tick = 10;

    pollRef.current = setInterval(async () => {
      try {
        const statusRes = await fetch(`${API_BASE}/api/tests/status`);
        const statusData = await statusRes.json();

        // Simulate incremental progress while running
        tick = Math.min(tick + 3, 90);
        setProgress(tick);

        addLog(`[${new Date().toLocaleTimeString()}] ${statusData.message}`);

        if (!statusData.running) {
          // Run is done — fetch final results
          clearInterval(pollRef.current!);
          setProgress(100);
          setIsRunning(false);
          addLog(`[${new Date().toLocaleTimeString()}] Run complete. Fetching results...`);

          const resultsRes = await fetch(`${API_BASE}/api/tests/results`);
          const results = await resultsRes.json();

          if (results.summary) {
            addLog(`[${new Date().toLocaleTimeString()}] ✔ ${results.summary.passed} passed, ${results.summary.failed} failed — ${results.summary.duration}`);
          }

          setTimeout(() => onNavigate('results'), 2000);
        }
      } catch {
        addLog(`[${new Date().toLocaleTimeString()}] [WARN] Could not reach backend, retrying...`);
      }
    }, POLL_INTERVAL_MS);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-headline font-bold mb-2">Execution <span className="text-primary">Kernel</span></h1>
          <p className="text-on-surface-variant flex items-center gap-2">
            {isRunning
              ? <><span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Running Playwright tests on {browser}...</>
              : started && progress === 100
                ? <><span className="w-2 h-2 rounded-full bg-tertiary" /> Run complete. Redirecting to results...</>
                : <><span className="w-2 h-2 rounded-full bg-on-surface-variant/40" /> Ready to run. Select browser and start.</>
            }
          </p>
        </div>

        <div className="flex gap-4 items-center">
          {!started && (
            <select
              value={browser}
              onChange={e => setBrowser(e.target.value)}
              className="px-4 py-2 rounded-xl glass-panel border border-primary/20 text-xs font-bold font-mono bg-transparent outline-none text-on-surface"
            >
              <option value="chromium">Chromium</option>
              <option value="firefox">Firefox</option>
              <option value="all">All Browsers</option>
            </select>
          )}
          <div className="px-4 py-2 rounded-xl glass-panel border border-primary/20 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold font-mono">{browser.toUpperCase()}</span>
          </div>
          <div className="px-4 py-2 rounded-xl glass-panel border border-secondary/20 flex items-center gap-2">
            <Zap className="w-4 h-4 text-secondary" />
            <span className="text-xs font-bold font-mono">Playwright</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Terminal */}
        <div className="lg:col-span-7">
          <GlassCard className="p-0 overflow-hidden h-[500px] flex flex-col border border-on-surface-variant/10">
            <div className="bg-surface-variant/80 px-4 py-3 flex items-center gap-2 border-b border-on-surface-variant/15">
              <Terminal className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest opacity-60">System Log</span>
            </div>
            <div className="flex-1 p-6 font-mono text-sm overflow-y-auto bg-black/60 space-y-2">
              <AnimatePresence mode="popLayout">
                {logs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-4"
                  >
                    <span className={
                      log.text.includes('✔') || log.text.includes('passed') ? 'text-tertiary' :
                        log.text.includes('ERROR') || log.text.includes('failed') ? 'text-error' :
                          log.text.includes('WARN') ? 'text-secondary' :
                            'text-on-surface/80'
                    }>
                      {log.text.includes('✔') && <CheckCircle2 className="inline w-4 h-4 mr-2" />}
                      {log.text}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={logEndRef} />
              {isRunning && (
                <motion.div
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="w-2 h-5 bg-primary/60 inline-block ml-1"
                />
              )}
            </div>
          </GlassCard>
        </div>

        {/* Visualizer */}
        <div className="lg:col-span-5 space-y-6">
          <GlassCard className="flex flex-col items-center justify-center p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

            <div className="relative mb-8">
              <motion.div
                animate={isRunning ? { rotate: 360 } : {}}
                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                className="w-48 h-48 rounded-full border-2 border-dashed border-primary/20"
              />
              <motion.div
                animate={isRunning ? { rotate: -360 } : {}}
                transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                className="absolute inset-4 rounded-full border-2 border-dashed border-secondary/20"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {isRunning
                    ? <Loader2 className="w-16 h-16 text-primary animate-spin" />
                    : progress === 100
                      ? <CheckCircle2 className="w-16 h-16 text-tertiary" />
                      : <Terminal className="w-16 h-16 text-on-surface-variant/40" />
                  }
                  {isRunning && <div className="absolute inset-0 blur-xl bg-primary/40 animate-pulse" />}
                </div>
              </div>
            </div>

            <h3 className="text-xl font-headline font-bold mb-2">
              {progress === 100 ? 'Run Complete!' : isRunning ? 'Tests Running' : 'Ready'}
            </h3>
            <p className="text-on-surface-variant text-sm mb-8">
              {isRunning ? 'Playwright is executing your tests...' : progress === 100 ? 'Redirecting to results...' : 'Click "Start Run" to begin.'}
            </p>

            <div className="w-full space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full bg-surface-high rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-secondary"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {!started && (
              <button
                onClick={startRun}
                className="mt-8 px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-on-primary-container font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform text-sm"
              >
                Start Run
              </button>
            )}
          </GlassCard>

          <div className="grid grid-cols-2 gap-4">
            <GlassCard className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-tertiary/10 text-tertiary">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Engine</p>
                <p className="text-sm font-bold">Playwright</p>
              </div>
            </GlassCard>
            <GlassCard className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                <Network className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Backend</p>
                <p className="text-sm font-bold">{API_BASE.replace(/^https?:\/\//, '')}</p>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
