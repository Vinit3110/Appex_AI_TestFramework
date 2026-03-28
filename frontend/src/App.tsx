/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Generator from './pages/Generator';
import Execution from './pages/Execution';
import Results from './pages/Results';
import Settings from './pages/Settings';
import { Layout } from './components/Layout';
import { Screen } from './types';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>('login');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'login':
        return <Login onNavigate={setActiveScreen} />;
      case 'signup':
        return <Signup onNavigate={setActiveScreen} />;
      case 'dashboard':
        return (
          <Layout activeScreen={activeScreen} onNavigate={setActiveScreen} showToast={showToast}>
            <Dashboard onNavigate={setActiveScreen} />
          </Layout>
        );
      case 'generator':
        return (
          <Layout activeScreen={activeScreen} onNavigate={setActiveScreen} showToast={showToast}>
            <Generator onNavigate={setActiveScreen} />
          </Layout>
        );
      case 'execution':
        return (
          <Layout activeScreen={activeScreen} onNavigate={setActiveScreen} showToast={showToast}>
            <Execution onNavigate={setActiveScreen} />
          </Layout>
        );
      case 'results':
        return (
          <Layout activeScreen={activeScreen} onNavigate={setActiveScreen} showToast={showToast}>
            <Results onNavigate={setActiveScreen} showToast={showToast} />
          </Layout>
        );
      case 'settings':
        return (
          <Layout activeScreen={activeScreen} onNavigate={setActiveScreen} showToast={showToast}>
            <Settings />
          </Layout>
        );
      default:
        return <Login onNavigate={setActiveScreen} />;
    }
  };

  return (
    <div className="min-h-screen bg-surface selection:bg-primary/30 selection:text-primary">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeScreen}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="min-h-screen"
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl glass-panel border border-white/10 flex items-center gap-3 shadow-2xl"
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-tertiary" />
            ) : (
              <AlertCircle className="w-5 h-5 text-error" />
            )}
            <span className="text-sm font-bold">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

