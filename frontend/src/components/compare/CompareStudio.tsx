import React, { useState } from 'react';
import { Layers, SplitSquareVertical, ArrowRightLeft, Sparkles } from 'lucide-react';
import { ImageMetadata } from '../../types';

interface CompareStudioProps {
  beforeImage: ImageMetadata | null;
  afterImage: ImageMetadata | null;
  onRunChangeDetection: () => void;
  isLoading: boolean;
}

export const CompareStudio: React.FC<CompareStudioProps> = ({
  beforeImage,
  afterImage,
  onRunChangeDetection,
  isLoading,
}) => {
  const [splitPos, setSplitPos] = useState(50);
  const [viewMode, setViewMode] = useState<'split' | 'side-by-side'>('split');

  const beforeUrl = beforeImage?.url || '/samples/bengaluru_2018_before.jpg';
  const afterUrl = afterImage?.url || '/samples/bengaluru_2024_after.jpg';

  return (
    <div className="w-full space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-panel p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-lg font-display font-bold text-white tracking-wide flex items-center space-x-2">
            <Layers className="w-5 h-5 text-radar-cyan" />
            <span>Multimodal & Temporal Comparison Studio</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Compare bi-temporal epochs, Optical vs SAR radar, or run automated surface change detection
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 bg-space-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1 ${
                viewMode === 'split' ? 'bg-radar-cyan/20 text-radar-cyan border border-radar-cyan/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span>Curtain Split</span>
            </button>
            <button
              onClick={() => setViewMode('side-by-side')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1 ${
                viewMode === 'side-by-side' ? 'bg-radar-cyan/20 text-radar-cyan border border-radar-cyan/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Side-by-Side</span>
            </button>
          </div>

          <button
            onClick={onRunChangeDetection}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-radar-cyan hover:bg-cyan-300 text-space-950 font-bold text-xs font-mono flex items-center space-x-1.5 transition-all shadow-glow-cyan"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoading ? 'Processing...' : 'Run Change Detection'}</span>
          </button>
        </div>
      </div>

      {/* Comparison Viewport */}
      {viewMode === 'split' ? (
        <div className="relative w-full h-[520px] rounded-2xl overflow-hidden glass-panel border border-slate-800 select-none">
          {/* Image 1: Before */}
          <img
            src={beforeUrl}
            alt="Before Epoch"
            className="w-full h-full object-cover"
          />

          {/* Image 2: After with dynamic clip path */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{
              clipPath: `polygon(${splitPos}% 0, 100% 0, 100% 100%, ${splitPos}% 100%)`,
            }}
          >
            <img
              src={afterUrl}
              alt="After Epoch"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Curtain Divider Line & Handle */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-radar-cyan shadow-glow-cyan pointer-events-none"
            style={{ left: `${splitPos}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-space-900 border-2 border-radar-cyan flex items-center justify-center text-xs text-radar-cyan font-bold shadow-2xl">
              ↔
            </div>
            <span className="absolute top-4 -translate-x-1/2 px-2 py-0.5 rounded bg-space-950/90 text-radar-cyan border border-radar-cyan/30 text-[10px] font-mono">
              BEFORE / AFTER
            </span>
          </div>

          {/* Interactive Range Input overlaying the screen */}
          <input
            type="range"
            min="0"
            max="100"
            value={splitPos}
            onChange={e => setSplitPos(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
          />

          {/* Labels on corners */}
          <div className="absolute bottom-4 left-4 z-10 px-3 py-1.5 rounded-xl bg-space-950/90 border border-slate-800 text-xs font-mono text-slate-200">
            Left: <strong>{beforeImage?.filename || 'Before Epoch (2018)'}</strong>
          </div>
          <div className="absolute bottom-4 right-4 z-10 px-3 py-1.5 rounded-xl bg-space-950/90 border border-slate-800 text-xs font-mono text-radar-cyan">
            Right: <strong>{afterImage?.filename || 'After Epoch (2024)'}</strong>
          </div>
        </div>
      ) : (
        /* Side by Side Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-panel p-3 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono px-1">
              <span className="text-slate-300 font-semibold">Epoch 1 (Before Baseline)</span>
              <span className="text-slate-500">{beforeImage?.format || 'Sentinel-2 MSI'}</span>
            </div>
            <div className="h-96 rounded-xl overflow-hidden border border-slate-700 bg-space-950">
              <img src={beforeUrl} alt="Before" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="glass-panel p-3 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono px-1">
              <span className="text-radar-cyan font-semibold">Epoch 2 (After Current)</span>
              <span className="text-slate-500">{afterImage?.format || 'Sentinel-2 MSI'}</span>
            </div>
            <div className="h-96 rounded-xl overflow-hidden border border-slate-700 bg-space-950">
              <img src={afterUrl} alt="After" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
