import React from 'react';
import { cn } from '../lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  rimLight?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className, rimLight = true, onClick }: GlassCardProps) {
  return (
    <div 
      onClick={onClick}
      className={cn(
      "glass-panel rounded-xl p-6",
      rimLight && "rim-light",
      onClick && "cursor-pointer",
      className
    )}>
      {children}
    </div>
  );
}
