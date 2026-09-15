import React from 'react';
import { Sparkles, MapPin, ArrowRight, Radio } from 'lucide-react';
import { SampleDataset } from '../../types';

interface SampleGalleryProps {
  samples: SampleDataset[];
  onSelectSample: (sample: SampleDataset, initialQuery?: string) => void;
  onClose?: () => void;
}

export const SampleGallery: React.FC<SampleGalleryProps> = ({
  samples,
  onSelectSample,
}) => {
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-display font-bold text-white tracking-wide">
            Pre-Packaged Remote Sensing Datasets
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            Demonstrate multimodal satellite intelligence instantly without uploading local files
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {samples.map((sample) => (
          <div
            key={sample.id}
            className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-radar-cyan/40 transition-all group"
          >
            <div className="space-y-3">
              {/* Thumbnail & Badges */}
              <div className="relative h-40 w-full rounded-xl overflow-hidden border border-slate-700/80 bg-space-950">
                <img
                  src={sample.thumbnailUrl}
                  alt={sample.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 flex items-center space-x-1.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-space-950/90 text-radar-cyan border border-radar-cyan/30 font-semibold backdrop-blur-md">
                    {sample.sensor}
                  </span>
                  {sample.mode === 'temporal' && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/90 text-space-950 font-bold">
                      Dual Temporal
                    </span>
                  )}
                  {sample.mode === 'optical_sar' && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-radar-purple/90 text-white font-bold flex items-center space-x-1">
                      <Radio className="w-2.5 h-2.5" />
                      <span>SAR Microwave</span>
                    </span>
                  )}
                </div>

                <div className="absolute bottom-2 left-2 flex items-center space-x-1 text-[10px] font-mono text-white bg-space-950/85 px-2 py-0.5 rounded-md backdrop-blur-md border border-slate-800">
                  <MapPin className="w-3 h-3 text-isro-amber" />
                  <span className="truncate max-w-[200px]">{sample.locationName}</span>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h4 className="text-base font-semibold text-white group-hover:text-radar-cyan transition-colors">
                  {sample.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {sample.description}
                </p>
              </div>

              {/* Suggested Questions */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                  Click to Ask Instant Query:
                </span>
                <div className="flex flex-col space-y-1">
                  {sample.suggestedQueries.slice(0, 2).map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSelectSample(sample, q)}
                      className="text-left text-[11px] font-mono text-slate-300 hover:text-radar-cyan bg-space-900/60 hover:bg-space-800/80 px-2.5 py-1.5 rounded-lg border border-slate-800/80 transition-all flex items-center justify-between"
                    >
                      <span className="truncate pr-2">"{q}"</span>
                      <ArrowRight className="w-3 h-3 text-slate-500 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Load CTA */}
            <button
              onClick={() => onSelectSample(sample)}
              className="w-full py-2.5 rounded-xl bg-space-900 hover:bg-radar-cyan hover:text-space-950 text-radar-cyan border border-radar-cyan/30 text-xs font-mono font-semibold flex items-center justify-center space-x-2 transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Into Workspace</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
