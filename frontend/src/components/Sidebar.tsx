import { LayoutDashboard, PlusCircle, BarChart3, Settings, LogOut, Rocket } from 'lucide-react';
import { cn } from '../lib/utils';
import { Screen } from '../types';

interface SidebarProps {
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export function Sidebar({ activeScreen, onNavigate }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'generator', label: 'Create Test', icon: PlusCircle },
    { id: 'results', label: 'Results', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 z-40 bg-surface-low border-r border-on-surface-variant/10 flex flex-col py-6">
      <div className="px-8 mb-10 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <Rocket className="text-on-primary-container w-5 h-5" />
        </div>
        <div>
          <h1 className="font-headline font-bold text-primary text-lg leading-none">QBot</h1>
          <p className="text-[10px] text-on-surface-variant tracking-widest opacity-60">v2.4.0-pro</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as Screen)}
              className={cn(
                "w-full py-3 px-6 flex items-center gap-3 transition-all duration-200 text-sm",
                isActive 
                  ? "bg-gradient-to-r from-primary/10 to-transparent text-primary border-r-4 border-primary" 
                  : "text-on-surface-variant opacity-60 hover:bg-surface-variant/40 hover:opacity-100"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-6 mt-auto">
        <button 
          onClick={() => onNavigate('generator')}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-on-primary-container font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform text-sm"
        >
          New Experiment
        </button>
        <div className="mt-6 border-t border-on-surface-variant/10 pt-4">
          <button 
            onClick={() => onNavigate('login')}
            className="w-full py-2 flex items-center gap-3 text-on-surface-variant opacity-60 hover:opacity-100 hover:text-error transition-all text-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
