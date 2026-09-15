import React from 'react';
import { X, BookOpen, Satellite, Radio, Shield } from 'lucide-react';

interface SensorGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SensorGuideModal: React.FC<SensorGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto glass-panel rounded-2xl border border-slate-700 p-6 space-y-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-isro-saffron/15 text-isro-saffron border border-isro-saffron/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-white">
                ISRO Remote Sensing & Sensor Physics Reference
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Smart India Hackathon Problem Statement 26167 (ISRO)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-space-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Problem Statement Overview */}
        <div className="p-4 rounded-xl bg-space-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-radar-cyan text-xs font-mono font-semibold">
            <Shield className="w-4 h-4" />
            <span>Problem Statement #26167 Objective</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Non-expert users often face steep learning curves with conventional GIS software. <strong>SatQuery AI</strong> bridges this gap through an interactive vision-language interface where users can ask conversational queries (e.g. <em>"Show water bodies"</em>, <em>"Calculate crop vigor"</em>, <em>"What changed between 2018 and 2024?"</em>) and receive automated spectral image processing, segmented visual overlays, and scientific explanations.
          </p>
        </div>

        {/* Section 2: Remote Sensing Formulas */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono uppercase tracking-wider text-radar-cyan font-semibold">
            Core Mathematical Spectral Formulations
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* NDVI */}
            <div className="p-3.5 rounded-xl bg-space-900/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <strong className="text-white font-mono">NDVI (Normalized Difference Veg)</strong>
                <span className="text-[10px] font-mono text-radar-emerald bg-radar-emerald/10 px-1.5 py-0.5 rounded">Multispectral</span>
              </div>
              <div className="p-2 rounded bg-space-950 font-mono text-[11px] text-radar-cyan">
                NDVI = (NIR - Red) / (NIR + Red)
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Measures leaf chlorophyll resonance (0.3 to 0.9 = active biomass).
              </p>
            </div>

            {/* VARI */}
            <div className="p-3.5 rounded-xl bg-space-900/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <strong className="text-white font-mono">VARI (Visible Veg Index)</strong>
                <span className="text-[10px] font-mono text-radar-cyan bg-radar-cyan/10 px-1.5 py-0.5 rounded">RGB Fallback</span>
              </div>
              <div className="p-2 rounded bg-space-950 font-mono text-[11px] text-radar-cyan">
                VARI = (Green - Red) / (Green + Red - Blue)
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Calculates canopy fraction from RGB bands with atmospheric aerosol correction.
              </p>
            </div>

            {/* NDWI */}
            <div className="p-3.5 rounded-xl bg-space-900/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <strong className="text-white font-mono">NDWI / MNDWI (Water Index)</strong>
                <span className="text-[10px] font-mono text-isro-amber bg-isro-amber/10 px-1.5 py-0.5 rounded">Hydrology</span>
              </div>
              <div className="p-2 rounded bg-space-950 font-mono text-[11px] text-radar-cyan">
                MNDWI = (Green - SWIR) / (Green + SWIR)
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Suppresses soil & built-up noise to isolate water bodies & flood plains.
              </p>
            </div>

            {/* SSIM Change */}
            <div className="p-3.5 rounded-xl bg-space-900/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <strong className="text-white font-mono">Temporal Euclidean Delta</strong>
                <span className="text-[10px] font-mono text-radar-purple bg-radar-purple/10 px-1.5 py-0.5 rounded">Bi-temporal</span>
              </div>
              <div className="p-2 rounded bg-space-950 font-mono text-[11px] text-radar-cyan">
                ΔI(x,y) = ||I_Epoch2 - I_Epoch1||_2
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Maps landscape shifts into canopy loss, urban gain, or water alteration.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Sensor Types */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono uppercase tracking-wider text-radar-cyan font-semibold">
            Supported Earth Observation Sensors
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-space-900/60 border border-slate-800 space-y-1">
              <div className="flex items-center space-x-2 text-white font-semibold">
                <Satellite className="w-4 h-4 text-radar-cyan" />
                <span>Sentinel-2 MSI (ESA / Copernicus)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                13 spectral bands (VNIR to SWIR) at 10m-60m spatial resolution with 5-day revisit.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-space-900/60 border border-slate-800 space-y-1">
              <div className="flex items-center space-x-2 text-white font-semibold">
                <Radio className="w-4 h-4 text-radar-purple" />
                <span>Sentinel-1 & RISAT-1A (C-Band SAR)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Active microwave radar operating at 5.4 GHz, penetrating clouds and darkness for all-weather disaster monitoring.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-space-900/60 border border-slate-800 space-y-1">
              <div className="flex items-center space-x-2 text-white font-semibold">
                <Satellite className="w-4 h-4 text-isro-saffron" />
                <span>ISRO Cartosat-3 / Resourcesat-2</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Sub-meter high-resolution panchromatic & multispectral sensors for precision urban planning and cadastral mapping.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-space-900/60 border border-slate-800 space-y-1">
              <div className="flex items-center space-x-2 text-white font-semibold">
                <Satellite className="w-4 h-4 text-radar-emerald" />
                <span>Landsat-8/9 OLI & TIRS (NASA / USGS)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                30m multispectral + 100m thermal infrared sensors for long-term climate & environmental monitoring since 1972.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Close Button */}
        <div className="flex justify-end border-t border-slate-800 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-space-900 hover:bg-space-800 text-white text-xs font-mono font-semibold transition-all border border-slate-700"
          >
            Close Reference
          </button>
        </div>

      </div>
    </div>
  );
};
