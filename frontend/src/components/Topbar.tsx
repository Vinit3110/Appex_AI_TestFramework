import { Settings } from 'lucide-react';
import { Screen } from '../types';

interface TopbarProps {
  onNavigate: (screen: Screen) => void;
}

export function Topbar({ onNavigate }: TopbarProps) {
  return (
    <header className="fixed top-0 right-0 left-64 z-30 h-16 bg-surface-variant/80 backdrop-blur-xl border-b border-on-surface-variant/10 flex justify-between items-center px-8">
      <div className="flex items-center gap-8">
        <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-headline tracking-tight">QBot</span>
        <nav className="hidden md:flex items-center gap-6 text-sm font-headline">
          <a href="#" className="text-primary border-b-2 border-primary pb-1">Docs</a>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('settings')}
            className="p-2 text-on-surface-variant hover:text-primary transition-all"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3 pl-4 border-l border-on-surface-variant/20">
          <div className="text-right">
            <p className="text-xs font-bold leading-none">Alex Rivera</p>
            <p className="text-[10px] text-primary leading-tight">Pro Architect</p>
          </div>
          <img
            src="https://picsum.photos/seed/alex/100/100"
            alt="Avatar"
            className="w-8 h-8 rounded-full border border-primary/20 object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </header>
  );
}
