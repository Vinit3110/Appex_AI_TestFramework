import React from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Screen } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export function Layout({ children, activeScreen, onNavigate, showToast }: LayoutProps) {
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar activeScreen={activeScreen} onNavigate={onNavigate} />
      <Topbar onNavigate={onNavigate} />
      <main className="pl-64 pt-16 min-h-screen">
        <div className="p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
