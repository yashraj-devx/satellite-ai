import React from 'react';
import { Satellite, Sparkles, Layers, History, BookOpen, Settings, ShieldCheck, Zap } from 'lucide-react';
import { ConfigStatus } from '../../types';

interface NavbarProps {
  activeTab: 'dashboard' | 'analyze' | 'compare' | 'history' | 'guide';
  setActiveTab: (tab: 'dashboard' | 'analyze' | 'compare' | 'history' | 'guide') => void;
  configStatus: ConfigStatus | null;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  configStatus,
  onOpenSettings,
  onOpenGuide,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-space-950/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-radar-cyan/40 shadow-glow-cyan">
            <Satellite className="w-5 h-5 text-radar-cyan animate-pulse-slow" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-isro-saffron rounded-full animate-ping" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-display font-bold text-lg text-white tracking-wider">SatQuery<span className="text-radar-cyan"> AI</span></span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-isro-saffron/20 text-isro-saffron border border-isro-saffron/30 font-semibold">
                ISRO SIH #26167
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono hidden sm:block">Multimodal Remote Sensing Vision-Language Assistant</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 bg-space-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-radar-cyan/15 text-radar-cyan border border-radar-cyan/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-space-800/50'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('analyze')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'analyze'
                ? 'bg-radar-cyan/15 text-radar-cyan border border-radar-cyan/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-space-800/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Analysis Studio</span>
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'compare'
                ? 'bg-radar-cyan/15 text-radar-cyan border border-radar-cyan/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-space-800/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Compare Dual</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'history'
                ? 'bg-radar-cyan/15 text-radar-cyan border border-radar-cyan/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-space-800/50'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit History</span>
          </button>
          <button
            onClick={onOpenGuide}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-space-800/50 transition-all flex items-center space-x-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Sensor Guide</span>
          </button>
        </nav>

        {/* Right Controls: AI Mode Badge & Settings */}
        <div className="flex items-center space-x-2.5">
          {configStatus?.apiConfigured ? (
            <div
              onClick={onOpenSettings}
              className="cursor-pointer flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-radar-emerald/10 border border-radar-emerald/30 text-radar-emerald text-xs font-medium hover:bg-radar-emerald/20 transition-all"
            >
              <Zap className="w-3.5 h-3.5 text-radar-emerald animate-pulse" />
              <span className="font-mono text-[11px]">Gemini AI Live</span>
            </div>
          ) : (
            <div
              onClick={onOpenSettings}
              className="cursor-pointer flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium hover:bg-amber-500/20 transition-all"
              title="Click to configure Google Gemini API Key"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono text-[11px]">Demo / Algo Mode</span>
            </div>
          )}

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-space-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
            title="Configure System & API Keys"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
