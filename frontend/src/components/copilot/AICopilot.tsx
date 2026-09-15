import React, { useState } from 'react';
import { Send, Mic, MicOff, Sparkles, Loader2 } from 'lucide-react';
import { RemoteSensingIntent } from '../../types';

interface AICopilotProps {
  onQuerySubmit: (query: string, forcedIntent?: RemoteSensingIntent) => void;
  isLoading: boolean;
  activeIntent?: RemoteSensingIntent | null;
  hasDualImages?: boolean;
  hasSarImage?: boolean;
}

export const AICopilot: React.FC<AICopilotProps> = ({
  onQuerySubmit,
  isLoading,
  activeIntent,
  hasDualImages,
  hasSarImage,
}) => {
  const [queryInput, setQueryInput] = useState('');
  const [isListening, setIsListening] = useState(false);

  // Suggested quick prompts tailored to current mode
  const suggestedPrompts = [
    { label: '🌊 Detect Water Bodies', query: 'Show all water bodies and hydrological channels in this image', intent: 'WATER_DETECTION' as RemoteSensingIntent },
    { label: '🌱 Vegetation & NDVI', query: 'Calculate NDVI vegetation index and analyze canopy health', intent: 'VEGETATION_ANALYSIS' as RemoteSensingIntent },
    ...(hasDualImages ? [
      { label: '🔄 What Changed?', query: 'What changed between the Before and After satellite images?', intent: 'CHANGE_DETECTION' as RemoteSensingIntent }
    ] : []),
    ...(hasSarImage ? [
      { label: '📡 SAR Backscatter', query: 'Analyze microwave SAR radar backscatter and flood extent', intent: 'SAR_ANALYSIS' as RemoteSensingIntent }
    ] : []),
    { label: '🏢 Urban & Buildings', query: 'Detect urban settlements, built-up areas, and road infrastructure', intent: 'URBAN_AREA_DETECTION' as RemoteSensingIntent },
    { label: '🗺️ 7-Class Land Cover', query: 'Perform comprehensive 7-class Land Use and Land Cover (LULC) segmentation', intent: 'LAND_COVER_CLASSIFICATION' as RemoteSensingIntent },
  ];

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!queryInput.trim() || isLoading) return;
    onQuerySubmit(queryInput.trim());
  };

  const handlePromptClick = (p: { query: string; intent?: RemoteSensingIntent }) => {
    setQueryInput(p.query);
    onQuerySubmit(p.query, p.intent);
  };

  // Web Speech API Voice Recognition
  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your current browser. Please type your query.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQueryInput(transcript);
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-radar-cyan/15 text-radar-cyan border border-radar-cyan/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide">SatQuery AI Co-Pilot</h3>
            <p className="text-[11px] text-slate-400 font-mono">Ask any question or command in plain English</p>
          </div>
        </div>

        {activeIntent && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-space-800 text-radar-cyan border border-radar-cyan/30">
            Active: {activeIntent}
          </span>
        )}
      </div>

      {/* Query Input Box */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <input
            type="text"
            value={queryInput}
            onChange={e => setQueryInput(e.target.value)}
            disabled={isLoading}
            placeholder="Ask something about your satellite imagery... (e.g. 'Show water bodies', 'What changed?')"
            className="w-full pl-4 pr-24 py-3.5 rounded-xl glass-input text-sm text-slate-100 placeholder-slate-500 shadow-inner focus:ring-1 focus:ring-radar-cyan transition-all"
          />

          <div className="absolute right-2 flex items-center space-x-1.5">
            {/* Voice Input Button */}
            <button
              type="button"
              onClick={toggleVoiceInput}
              disabled={isLoading}
              className={`p-2 rounded-lg transition-all ${
                isListening
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-space-800'
              }`}
              title={isListening ? 'Listening...' : 'Voice Query'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!queryInput.trim() || isLoading}
              className={`p-2 rounded-lg text-space-950 font-semibold transition-all ${
                !queryInput.trim() || isLoading
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-radar-cyan hover:bg-cyan-300 shadow-glow-cyan'
              }`}
              title="Execute Query"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-radar-cyan" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </form>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-col space-y-2">
        <span className="text-[11px] font-mono text-slate-400">Suggested Analysis Operations:</span>
        <div className="flex flex-wrap gap-1.5">
          {suggestedPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isLoading}
              onClick={() => handlePromptClick(p)}
              className="px-2.5 py-1 rounded-lg text-xs font-mono bg-space-900/90 hover:bg-space-800/90 text-slate-300 hover:text-radar-cyan border border-slate-800 hover:border-radar-cyan/30 transition-all text-left flex items-center space-x-1 shadow-sm"
            >
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading Telemetry Steps */}
      {isLoading && (
        <div className="bg-space-950/80 border border-radar-cyan/30 rounded-xl p-3.5 space-y-2 animate-pulse">
          <div className="flex items-center space-x-2 text-radar-cyan text-xs font-mono font-semibold">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Processing Multimodal Remote Sensing Pipeline...</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] font-mono text-slate-400">
            <div className="flex items-center space-x-1 text-slate-300">
              <span className="text-radar-emerald">✓</span>
              <span>1. Parsing Intent</span>
            </div>
            <div className="flex items-center space-x-1 text-slate-300">
              <span className="text-radar-emerald">✓</span>
              <span>2. Spectral Indices</span>
            </div>
            <div className="flex items-center space-x-1 text-radar-cyan animate-pulse">
              <span>⚡</span>
              <span>3. AI Vision Synthesis</span>
            </div>
            <div className="flex items-center space-x-1 text-slate-400">
              <span>○</span>
              <span>4. Mask Overlays</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
