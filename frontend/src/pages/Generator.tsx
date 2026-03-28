import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wand2, Play, Copy, ShoppingCart, UserPlus, Bug, ArrowRight, Zap, CheckCircle2, Loader2 } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { Screen } from '../types';
import { cn } from '../lib/utils';
import { API_BASE } from '../lib/config';

interface GeneratorProps {
  onNavigate: (screen: Screen) => void;
}

// Converts AI step objects into a readable Playwright script string
function stepsToPlaywrightCode(steps: Array<{ action: string; target: string; value?: string }>): string {
  const lines: string[] = [
    `import { test, expect } from '@playwright/test';`,
    ``,
    `test('AI Generated Test', async ({ page }) => {`,
  ];

  for (const step of steps) {
    switch (step.action) {
      case 'navigate':
        lines.push(`    await page.goto('${step.target}');`);
        break;
      case 'fill':
        lines.push(`    await page.fill('${step.target}', '${step.value ?? ''}');`);
        break;
      case 'click':
        lines.push(`    await page.click('${step.target}');`);
        break;
      case 'assertVisible':
        lines.push(`    await expect(page.locator('${step.target}')).toBeVisible();`);
        break;
      case 'assertText':
        lines.push(`    await expect(page.locator('${step.target}')).toHaveText('${step.value ?? ''}');`);
        break;
      case 'waitFor':
        lines.push(`    await page.waitForSelector('${step.target}');`);
        break;
      default:
        lines.push(`    // Unsupported action: ${step.action} on ${step.target}`);
    }
  }

  lines.push(`});`);
  return lines.join('\n');
}

export default function Generator({ onNavigate }: GeneratorProps) {
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [showCursor, setShowCursor] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setShowCursor(prev => !prev), 800);
    return () => clearInterval(interval);
  }, []);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setIsGenerating(true);
    setGeneratedCode(null);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/tests/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? 'Generation failed');

      const code = stepsToPlaywrightCode(data.steps);
      setGeneratedCode(code);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunTest = async () => {
    onNavigate('execution');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <header className="mb-12">
        <h1 className="text-5xl font-headline font-bold mb-4 tracking-tight">
          Test <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Generator</span>
        </h1>
        <p className="text-on-surface-variant max-w-2xl text-lg leading-relaxed">
          Convert natural language requirements into executable Playwright scripts using Gemini AI.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Section */}
        <div className="lg:col-span-7 space-y-6">
          <GlassCard className="p-0 overflow-hidden border border-on-surface-variant/10">
            <div className="bg-surface-container/30 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-primary/80">Input Specification</label>
                <div className="flex gap-2">
                  <span className={cn("h-2 w-2 rounded-full transition-colors", isGenerating ? "bg-primary animate-pulse" : "bg-primary/40")} />
                  <span className={cn("h-2 w-2 rounded-full transition-colors", isGenerating ? "bg-secondary animate-pulse delay-75" : "bg-primary/20")} />
                </div>
              </div>

              <div className="relative group">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isGenerating}
                  className="w-full bg-transparent border-none focus:ring-0 text-lg font-sans placeholder:text-on-surface-variant/30 min-h-[240px] resize-none leading-relaxed text-on-surface disabled:opacity-50"
                  placeholder="Login to saucedemo.com with standard_user and verify the inventory page loads..."
                />
                <div className={cn(
                  "absolute bottom-0 left-0 w-full h-0.5 transition-all duration-500",
                  isGenerating
                    ? "bg-gradient-to-r from-primary via-secondary to-tertiary"
                    : "bg-surface-high group-focus-within:bg-gradient-to-r group-focus-within:from-primary group-focus-within:to-secondary"
                )} />
              </div>

              {error && (
                <div className="text-sm text-error bg-error/10 border border-error/20 rounded-xl px-4 py-3">
                  ⚠ {error}
                </div>
              )}

              <div className="flex flex-wrap gap-4 pt-4">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !input.trim()}
                  className="flex-1 min-w-[200px] group relative overflow-hidden px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary font-bold text-on-primary-container shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                    {isGenerating ? 'Generating with Gemini AI...' : 'Generate Test using AI'}
                  </span>
                </button>
                <button
                  onClick={handleRunTest}
                  disabled={!generatedCode || isGenerating}
                  className="px-8 py-4 rounded-xl bg-surface-bright/20 backdrop-blur-md border border-on-surface-variant/20 font-bold text-on-surface transition-all hover:bg-surface-bright/40 hover:shadow-lg active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Run Test
                </button>
              </div>
            </div>
          </GlassCard>

          <div className="grid grid-cols-2 gap-4">
            <GlassCard className="p-6">
              <Zap className="text-primary w-6 h-6 mb-2" />
              <div className="text-2xl font-headline font-bold">Gemini</div>
              <div className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">AI Engine</div>
            </GlassCard>
            <GlassCard className="p-6">
              <CheckCircle2 className="text-secondary w-6 h-6 mb-2" />
              <div className="text-2xl font-headline font-bold">Real</div>
              <div className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Live Output</div>
            </GlassCard>
          </div>
        </div>

        {/* Output Terminal */}
        <div className="lg:col-span-5 h-full">
          <GlassCard className="h-full flex flex-col p-0 overflow-hidden min-h-[500px] border border-on-surface-variant/10">
            <div className="bg-surface-variant/80 px-4 py-3 flex items-center justify-between border-b border-on-surface-variant/15">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-error/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-tertiary/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-primary/40" />
                </div>
                <span className="ml-4 text-xs font-medium text-on-surface-variant/60 font-sans">generated_test.spec.ts</span>
              </div>
              <button onClick={handleCopy} title="Copy to clipboard">
                {copied
                  ? <CheckCircle2 className="w-4 h-4 text-tertiary" />
                  : <Copy className="w-4 h-4 opacity-40 hover:opacity-100 cursor-pointer transition-opacity" />
                }
              </button>
            </div>
            <div className="flex-1 p-6 font-mono text-[13px] leading-relaxed overflow-y-auto bg-black/40">
              <pre className="text-on-surface">
                {isGenerating ? (
                  <div className="flex flex-col gap-2 opacity-50 italic">
                    <div className="flex gap-4">
                      <span className="text-on-surface-variant/40 select-none w-4">01</span>
                      <span className="animate-pulse">Sending prompt to Gemini AI...</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-on-surface-variant/40 select-none w-4">02</span>
                      <span className="animate-pulse delay-75">Parsing test steps...</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-on-surface-variant/40 select-none w-4">03</span>
                      <span className="animate-pulse delay-150">Mapping to Playwright actions...</span>
                    </div>
                  </div>
                ) : generatedCode ? (
                  generatedCode.split('\n').map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex gap-4"
                    >
                      <span className="text-on-surface-variant/40 select-none w-4">{(i + 1).toString().padStart(2, '0')}</span>
                      <span>{line}</span>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-on-surface-variant/30 italic">Waiting for input...</div>
                )}

                {!isGenerating && (
                  <div className="flex gap-4">
                    <span className="text-on-surface-variant/40 select-none w-4">
                      {generatedCode ? (generatedCode.split('\n').length + 1).toString().padStart(2, '0') : '01'}
                    </span>
                    <span className={cn("w-2 h-5 bg-primary/60", showCursor ? "opacity-100" : "opacity-0")} />
                  </div>
                )}
              </pre>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Quick Prompts */}
      <section className="mt-20">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-2xl font-headline font-bold tracking-tight">Quick Prompts</h2>
          <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
            View All History <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <HistoryCard
            icon={<ShoppingCart className="w-5 h-5" />}
            title="Login Flow"
            desc="Login to saucedemo.com with standard_user and verify the inventory page loads successfully."
            onClick={() => setInput("Login to saucedemo.com with standard_user and verify the inventory page loads successfully.")}
          />
          <HistoryCard
            icon={<UserPlus className="w-5 h-5" />}
            title="Locked User"
            desc="Try to login with locked_out_user and verify the error message is displayed."
            onClick={() => setInput("Try to login with locked_out_user and verify the error message is displayed.")}
          />
          <HistoryCard
            icon={<Bug className="w-5 h-5" />}
            title="Empty Fields"
            desc="Try to login with empty username and password and verify validation errors appear."
            onClick={() => setInput("Try to login with empty username and password and verify validation errors appear.")}
          />
        </div>
      </section>
    </div>
  );
}

function HistoryCard({ icon, title, desc, onClick }: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="group bg-surface-container p-6 rounded-xl border border-on-surface-variant/10 hover:bg-surface-variant/40 transition-all cursor-pointer"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{title}</span>
      </div>
      <p className="text-sm line-clamp-2 mb-4 text-on-surface/80 leading-relaxed">{desc}</p>
      <div className="flex items-center justify-end text-[10px] text-on-surface-variant font-mono">
        <span className="px-2 py-0.5 rounded border bg-primary/10 text-primary border-primary/20">
          CLICK TO USE
        </span>
      </div>
    </div>
  );
}
