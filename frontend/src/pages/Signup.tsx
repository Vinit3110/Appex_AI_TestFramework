import { useState } from 'react';
import { motion } from 'motion/react';
import { Rocket, User, Mail, Lock, CheckCircle2, ShieldAlert } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { Screen } from '../types';

interface SignupProps {
  onNavigate: (screen: Screen) => void;
}

export default function Signup({ onNavigate }: SignupProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const passwordsMatch = password === confirmPassword;
  const showMismatch = touched.password && touched.confirmPassword && confirmPassword.length > 0 && !passwordsMatch;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setFormError('All fields are required.');
      return;
    }
    if (!passwordsMatch) {
      setFormError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    onNavigate('dashboard');
  };

  const markTouched = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface relative overflow-hidden">
      {/* Atmospheric Backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px]" />

      <header className="fixed top-0 w-full z-50 px-8 h-20 flex items-center justify-between">
        <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-headline tracking-tight">QBot</div>
        <nav className="hidden md:flex gap-8 text-sm font-medium">
          <a href="#" className="text-on-surface-variant hover:text-primary transition-all">Support</a>
          <a href="#" className="text-on-surface-variant hover:text-primary transition-all">Docs</a>
        </nav>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 mt-16">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xl relative z-10"
        >
          <GlassCard className="p-10 md:p-14 border border-white/5">
            <div className="mb-12">
              <h1 className="font-headline text-4xl font-bold tracking-tight mb-4 text-white">Begin Exploration</h1>
              <p className="text-on-surface-variant leading-relaxed text-lg opacity-80">Join the high-end intelligence suite and start testing your neural models today.</p>
            </div>

            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="group">
                <label className="block text-[0.7rem] uppercase tracking-[0.2em] font-bold text-primary mb-3">Full Name</label>
                <div className="relative flex items-center border-b border-on-surface-variant/30 group-focus-within:border-primary transition-all duration-500">
                  <User className="text-on-surface-variant group-focus-within:text-primary w-5 h-5 mr-4 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Janus Obsidian"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => markTouched('name')}
                    className="w-full bg-transparent border-none focus:ring-0 py-4 text-white placeholder:text-on-surface-variant/20 text-lg"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-[0.7rem] uppercase tracking-[0.2em] font-bold text-primary mb-3">Email Identity</label>
                <div className="relative flex items-center border-b border-on-surface-variant/30 group-focus-within:border-primary transition-all duration-500">
                  <Mail className="text-on-surface-variant group-focus-within:text-primary w-5 h-5 mr-4 transition-colors" />
                  <input 
                    type="email" 
                    placeholder="janus@luminescent.ai"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => markTouched('email')}
                    className="w-full bg-transparent border-none focus:ring-0 py-4 text-white placeholder:text-on-surface-variant/20 text-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="group">
                  <label className="block text-[0.7rem] uppercase tracking-[0.2em] font-bold text-primary mb-3">Password</label>
                  <div className="relative flex items-center border-b border-on-surface-variant/30 group-focus-within:border-primary transition-all duration-500">
                    <Lock className="text-on-surface-variant group-focus-within:text-primary w-5 h-5 mr-4 transition-colors" />
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => markTouched('password')}
                      className="w-full bg-transparent border-none focus:ring-0 py-4 text-white placeholder:text-on-surface-variant/20 text-lg"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-[0.7rem] uppercase tracking-[0.2em] font-bold text-primary mb-3">Verify Password</label>
                  <div className={`relative flex items-center border-b transition-all duration-500 ${
                    showMismatch
                      ? 'border-error/50'
                      : 'border-on-surface-variant/30 group-focus-within:border-primary'
                  }`}>
                    <Lock className={`w-5 h-5 mr-4 transition-colors ${
                      showMismatch ? 'text-error' : 'text-on-surface-variant group-focus-within:text-primary'
                    }`} />
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onBlur={() => markTouched('confirmPassword')}
                      className="w-full bg-transparent border-none focus:ring-0 py-4 text-white placeholder:text-on-surface-variant/20 text-lg"
                    />
                  </div>
                  {showMismatch && (
                    <p className="mt-3 text-xs text-error flex items-center gap-1.5 font-medium tracking-wide">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Tokens do not match
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4 py-2 group cursor-pointer">
                <div className="mt-1 flex items-center justify-center h-5 w-5 rounded border border-on-surface-variant bg-surface-low group-hover:border-primary transition-colors">
                  <CheckCircle2 className="text-primary w-4 h-4" />
                </div>
                <label className="text-sm text-on-surface-variant leading-relaxed select-none">
                  I accept the <a href="#" className="text-primary hover:text-secondary hover:underline transition-colors">Neural Terms of Service</a> and the processing of my biometric data within the <a href="#" className="text-primary hover:text-secondary hover:underline transition-colors">Void Privacy Protocol</a>.
                </label>
              </div>

              {formError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm font-medium">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  {formError}
                </div>
              )}

              <div className="pt-6">
                <button 
                  type="submit"
                  className="w-full py-5 rounded-xl font-headline font-bold text-on-primary-container bg-gradient-to-r from-primary to-secondary shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 flex items-center justify-center gap-3 text-lg"
                >
                  <span>Initialize Account</span>
                  <Rocket className="w-6 h-6" />
                </button>
              </div>
            </form>

            <div className="mt-12 pt-8 border-t border-white/5 text-center">
              <p className="text-on-surface-variant text-sm">
                Already part of the network? 
                <button 
                  onClick={() => onNavigate('login')}
                  className="text-primary font-bold hover:text-secondary transition-colors ml-1.5"
                >
                  Authenticate here
                </button>
              </p>
            </div>
          </GlassCard>

          <div className="hidden lg:block absolute -right-64 top-1/2 -translate-y-1/2 w-48 opacity-10 pointer-events-none">
            <div className="text-[9rem] font-headline font-black text-white rotate-90 whitespace-nowrap tracking-tighter">QBOT</div>
          </div>
        </motion.div>
      </main>

      <div className="fixed bottom-12 left-12 flex flex-col gap-6 pointer-events-none opacity-50">
        <div className="flex items-center gap-4">
          <div className="h-[2px] w-14 bg-primary shadow-lg shadow-primary/50" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold">System Ready</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-[2px] w-10 bg-on-surface-variant" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-on-surface-variant font-bold">Latency 14ms</span>
        </div>
      </div>

      <footer className="p-8 text-center text-[10px] text-on-surface-variant uppercase tracking-[0.2em] opacity-40">
        © {new Date().getFullYear()} QBot Suite • Secure Environment Protocol v2.4.0
      </footer>
    </div>
  );
}
