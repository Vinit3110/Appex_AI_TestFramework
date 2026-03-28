import React from 'react';
import { motion } from 'motion/react';
import { User, Bell, Shield, Globe, Cpu, Database, Save, ChevronRight } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { cn } from '../lib/utils';

export default function Settings() {
  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <header>
        <h1 className="text-4xl font-headline font-bold mb-2 tracking-tight">System <span className="text-secondary">Settings</span></h1>
        <p className="text-on-surface-variant">Configure your neural testing environment and account preferences.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Navigation */}
        <div className="md:col-span-4 space-y-2">
          <SettingNavItem icon={<User className="w-4 h-4" />} label="Account Profile" active />
          <SettingNavItem icon={<Bell className="w-4 h-4" />} label="Notifications" />
          <SettingNavItem icon={<Shield className="w-4 h-4" />} label="Security & Privacy" />
          <SettingNavItem icon={<Globe className="w-4 h-4" />} label="Network Config" />
          <SettingNavItem icon={<Cpu className="w-4 h-4" />} label="AI Engine Parameters" />
          <SettingNavItem icon={<Database className="w-4 h-4" />} label="Data Retention" />
        </div>

        {/* Content */}
        <div className="md:col-span-8 space-y-8">
          <GlassCard className="p-8 space-y-8">
            <section className="space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Profile Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Full Name</label>
                  <input type="text" defaultValue="Kalpesh Chavan" className="w-full bg-surface-variant/30 border border-on-surface-variant/10 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Email Address</label>
                  <input type="email" defaultValue="kalpeshchavan2811@gmail.com" className="w-full bg-surface-variant/30 border border-on-surface-variant/10 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
                </div>
              </div>
            </section>

            <div className="h-px bg-on-surface-variant/10" />

            <section className="space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Cpu className="w-5 h-5 text-secondary" />
                AI Model Configuration
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-surface-variant/20 border border-on-surface-variant/5">
                  <div>
                    <div className="font-bold">Neural Synthesis Engine</div>
                    <div className="text-xs text-on-surface-variant">V4.2 (Stable) - Optimized for high-concurrency</div>
                  </div>
                  <button className="text-primary text-xs font-bold hover:underline">Change</button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-surface-variant/20 border border-on-surface-variant/5">
                  <div>
                    <div className="font-bold">Auto-Optimization</div>
                    <div className="text-xs text-on-surface-variant">Automatically adjust shard distribution based on latency</div>
                  </div>
                  <div className="w-12 h-6 rounded-full bg-primary/20 relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-primary" />
                  </div>
                </div>
              </div>
            </section>

            <div className="pt-4 flex justify-end">
              <button className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-on-primary-container font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95">
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </GlassCard>

          <GlassCard className="p-8 border-error/20 bg-error/5">
            <h3 className="text-lg font-bold text-error mb-2">Danger Zone</h3>
            <p className="text-sm text-on-surface-variant mb-6">Once you delete your account or reset the system, there is no going back. Please be certain.</p>
            <div className="flex gap-4">
              <button className="px-6 py-2.5 rounded-lg border border-error/30 text-error text-sm font-bold hover:bg-error/10 transition-all">Reset System</button>
              <button className="px-6 py-2.5 rounded-lg bg-error text-on-error text-sm font-bold hover:bg-error-dark transition-all">Delete Account</button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function SettingNavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={cn(
      "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group",
      active ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-surface-variant/40 text-on-surface-variant border border-transparent"
    )}>
      <div className="flex items-center gap-3">
        <span className={cn("transition-colors", active ? "text-primary" : "text-on-surface-variant group-hover:text-on-surface")}>
          {icon}
        </span>
        <span className="text-sm font-bold">{label}</span>
      </div>
      <ChevronRight className={cn("w-4 h-4 transition-transform", active ? "translate-x-0" : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100")} />
    </button>
  );
}
