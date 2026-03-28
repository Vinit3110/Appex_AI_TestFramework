import { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { Screen } from '../types';

interface LoginProps {
  onNavigate: (screen: Screen) => void;
}

export default function Login({ onNavigate }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email.trim()) {
      setFormError('Email address is required.');
      return;
    }
    if (!password.trim()) {
      setFormError('Secure key is required.');
      return;
    }

    onNavigate('dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-surface">
      {/* Atmospheric Backgrounds */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[120px]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[480px] relative z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-block mb-4">
            <span className="font-headline text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-tight">QBot</span>
          </div>
          <h1 className="font-headline text-3xl font-medium tracking-tight text-on-surface">Intelligence Suite</h1>
          <p className="text-on-surface-variant mt-2 text-sm">Elevate your testing cockpit to the next dimension.</p>
        </div>

        <GlassCard className="p-8 md:p-12 shadow-2xl">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="relative group">
                <label className="block text-[0.6875rem] uppercase tracking-widest font-bold text-on-surface-variant mb-1 ml-1">Email Address</label>
                <input 
                  type="email" 
                  placeholder="commander@qbot.ai"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFormError(null); }}
                  className="w-full bg-transparent border-0 border-b-2 border-surface-variant px-1 py-3 focus:ring-0 focus:border-primary text-on-surface placeholder:text-on-surface-variant/30 transition-all duration-300"
                />
              </div>
              
              <div className="relative group">
                <div className="flex justify-between items-end mb-1">
                  <label className="block text-[0.6875rem] uppercase tracking-widest font-bold text-on-surface-variant ml-1">Secure Key</label>
                  <a href="#" className="text-[0.6875rem] uppercase tracking-widest font-bold text-primary hover:text-secondary transition-colors">Forgot Access?</a>
                </div>
                <input 
                  type="password" 
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFormError(null); }}
                  className="w-full bg-transparent border-0 border-b-2 border-surface-variant px-1 py-3 focus:ring-0 focus:border-primary text-on-surface placeholder:text-on-surface-variant/30 transition-all duration-300"
                />
              </div>
            </div>

            {formError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm font-medium">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                {formError}
              </div>
            )}

            <button 
              type="submit"
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-primary to-secondary text-on-primary-container font-headline font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-xl shadow-primary/20"
            >
              Initialize Session
            </button>

            <div className="flex items-center gap-4 py-2">
              <div className="h-[1px] flex-grow bg-surface-variant/50" />
              <span className="text-[0.6875rem] uppercase tracking-widest font-bold text-on-surface-variant/60">External Authentication</span>
              <div className="h-[1px] flex-grow bg-surface-variant/50" />
            </div>

            <button 
              type="button"
              className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-xl bg-surface-bright/20 backdrop-blur-md border border-on-surface-variant/10 text-on-surface hover:bg-surface-bright/30 transition-all duration-300 group"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor" />
              </svg>
              <span className="font-medium">Continue with Google</span>
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm text-on-surface-variant">
              New to the suite? 
              <button 
                onClick={() => onNavigate('signup')}
                className="text-secondary font-bold hover:text-primary transition-colors ml-1"
              >
                Create an Identity
              </button>
            </p>
          </div>
        </GlassCard>

        <div className="flex items-center justify-center gap-2 mt-8 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-default">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[0.6875rem] uppercase tracking-widest font-bold">End-to-End Neural Encryption Active</span>
        </div>
      </motion.div>
    </div>
  );
}
