import React, { useState } from 'react';
import { X, Key, ShieldCheck, Zap, ExternalLink, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { ConfigStatus } from '../../types';
import { ApiService } from '../../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  configStatus: ConfigStatus | null;
  onConfigUpdated: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  configStatus,
  onConfigUpdated,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    if (!apiKeyInput.trim()) return;
    try {
      setIsTesting(true);
      setTestResult(null);
      const res = await ApiService.testApiKey(apiKeyInput.trim());
      setTestResult(res);
      if (res.success) {
        localStorage.setItem('SATQUERY_GEMINI_KEY', apiKeyInput.trim());
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Connection failed' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    if (apiKeyInput.trim()) {
      localStorage.setItem('SATQUERY_GEMINI_KEY', apiKeyInput.trim());
    }
    onConfigUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg glass-panel rounded-2xl border border-slate-700 p-6 space-y-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-radar-cyan/15 text-radar-cyan border border-radar-cyan/30">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-white">
                SatQuery AI System & API Configuration
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Connect Google Gemini Vision or use offline Demo Mode
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-space-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Status Badge */}
        <div className="p-4 rounded-xl bg-space-900 border border-slate-800 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-mono text-slate-400">Current AI Execution Engine</span>
            <div className="flex items-center space-x-2">
              {configStatus?.apiConfigured ? (
                <div className="flex items-center space-x-1 text-xs font-mono font-bold text-radar-emerald">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Google Gemini 1.5 Flash (Live Vision AI)</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-xs font-mono font-bold text-amber-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Demo Mode (Algorithmic Remote Sensing)</span>
                </div>
              )}
            </div>
          </div>

          <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-space-950 text-slate-400 border border-slate-800">
            v1.0.0 (ISRO SIH)
          </span>
        </div>

        {/* Google Gemini API Key Input */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono text-slate-300 font-semibold flex items-center space-x-1.5">
              <span>Google Gemini API Key</span>
            </label>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-mono text-radar-cyan hover:underline flex items-center space-x-1"
            >
              <span>Get Free Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="space-y-2">
            <input
              type="password"
              value={apiKeyInput}
              onChange={e => setApiKeyInput(e.target.value)}
              placeholder="Paste your Gemini API key (AIzaSy...)"
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono text-white placeholder-slate-500 focus:ring-1 focus:ring-radar-cyan"
            />
            <p className="text-[10px] font-mono text-slate-500">
              API key is stored locally in your browser/env and never logged. Free tier provides 15 RPM for multimodal satellite vision.
            </p>
          </div>

          {/* Test Key Button */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleTestKey}
              disabled={!apiKeyInput.trim() || isTesting}
              className="px-3 py-1.5 rounded-lg bg-space-900 hover:bg-space-800 text-xs font-mono font-semibold text-slate-200 border border-slate-700 flex items-center space-x-1.5 disabled:opacity-50"
            >
              {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-radar-cyan" /> : <Zap className="w-3.5 h-3.5 text-radar-cyan" />}
              <span>Test API Connection</span>
            </button>
          </div>

          {/* Test Result Message */}
          {testResult && (
            <div className={`p-3 rounded-xl text-xs font-mono flex items-start space-x-2 ${
              testResult.success 
                ? 'bg-radar-emerald/10 text-radar-emerald border border-radar-emerald/30'
                : 'bg-red-500/10 text-red-300 border border-red-500/30'
            }`}>
              {testResult.success ? <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-radar-cyan hover:bg-cyan-300 text-space-950 text-xs font-mono font-bold shadow-glow-cyan transition-all"
          >
            Save & Apply
          </button>
        </div>

      </div>
    </div>
  );
};
