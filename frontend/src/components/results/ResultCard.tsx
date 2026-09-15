import React, { useState } from 'react';
import { 
  Sparkles, CheckCircle2, AlertTriangle, Info, ShieldAlert, 
  BarChart3, PieChart as PieIcon, Download, Printer, Zap
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis
} from 'recharts';
import { AnalysisResult } from '../../types';

interface ResultCardProps {
  result: AnalysisResult;
  onOpenExport?: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, onOpenExport }) => {
  const [activeTab, setActiveTab] = useState<'insights' | 'breakdown' | 'histogram' | 'sar'>('insights');

  // Breakdown chart data
  const breakdownData = result.metrics.breakdown?.map(item => ({
    name: item.name,
    value: item.percentage,
    color: item.color,
  })) || [];

  // Histogram data
  const histogramData = result.metrics.histogram || [];

  // Helper for source badge
  const renderSourceBadge = () => {
    switch (result.sourceType) {
      case 'HYBRID_AI_ALGO':
      case 'AI_VISION':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-radar-emerald/15 text-radar-emerald border border-radar-emerald/30 font-semibold">
            <Sparkles className="w-3 h-3" />
            <span>Gemini Vision + Algorithmic</span>
          </span>
        );
      case 'REAL_ALGORITHMIC':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-radar-cyan/15 text-radar-cyan border border-radar-cyan/30 font-semibold">
            <Zap className="w-3 h-3" />
            <span>Exact Remote Sensing Math</span>
          </span>
        );
      case 'DEMO_FALLBACK':
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
            <Info className="w-3 h-3" />
            <span>Algorithmic Demo Mode</span>
          </span>
        );
    }
  };

  const downloadActiveMask = () => {
    if (result.layers.length === 0) return;
    const layer = result.layers[0];
    const link = document.createElement('a');
    link.href = layer.dataUrl;
    link.download = `${result.intent.toLowerCase()}_mask.png`;
    link.click();
  };

  return (
    <div className="w-full glass-panel rounded-2xl border border-slate-800 overflow-hidden flex flex-col space-y-5 p-6 shadow-2xl">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-mono text-slate-400">Analysis Query Result</span>
            {renderSourceBadge()}
          </div>
          <h2 className="text-base font-semibold text-white mt-1">
            "{result.query}"
          </h2>
        </div>

        {/* Confidence & Timing Badges */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-xl bg-space-900 border border-slate-800 text-right">
            <span className="block text-[10px] font-mono text-slate-400 uppercase">Confidence</span>
            <span className="text-xs font-mono font-bold text-radar-emerald">
              {result.confidence}%
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-space-900 border border-slate-800 text-right">
            <span className="block text-[10px] font-mono text-slate-400 uppercase">Latency</span>
            <span className="text-xs font-mono font-semibold text-slate-200">
              {result.processingTimeMs}ms
            </span>
          </div>
        </div>
      </div>

      {/* Primary Key Metric Highlight Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-space-900/80 border border-slate-800/80">
        <div className="space-y-0.5">
          <span className="text-[11px] font-mono text-slate-400">{result.metrics.primaryMetricName}</span>
          <p className="text-xl font-display font-bold text-radar-cyan">
            {result.metrics.primaryMetricValue}
          </p>
        </div>
        <div className="space-y-0.5">
          <span className="text-[11px] font-mono text-slate-400">Detected Operation</span>
          <p className="text-sm font-semibold text-white">
            {result.intent.replace(/_/g, ' ')}
          </p>
        </div>
        <div className="space-y-0.5">
          <span className="text-[11px] font-mono text-slate-400">Generated Layers</span>
          <p className="text-sm font-semibold text-slate-200">
            {result.layers.length} Segmented Masks
          </p>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="space-y-2">
        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">Executive Summary</h4>
        <p className="text-sm text-slate-100 leading-relaxed font-medium bg-space-900/50 p-3.5 rounded-xl border border-slate-800/60">
          {result.summary}
        </p>
      </div>

      {/* Tabs for Detailed Views */}
      <div className="border-b border-slate-800 flex space-x-4 text-xs font-mono">
        <button
          onClick={() => setActiveTab('insights')}
          className={`pb-2 border-b-2 font-medium transition-all ${
            activeTab === 'insights'
              ? 'border-radar-cyan text-radar-cyan'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Remote Sensing Findings ({result.findings?.length || 0})
        </button>

        {breakdownData.length > 0 && (
          <button
            onClick={() => setActiveTab('breakdown')}
            className={`pb-2 border-b-2 font-medium transition-all flex items-center space-x-1 ${
              activeTab === 'breakdown'
                ? 'border-radar-cyan text-radar-cyan'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>Area Distribution Chart</span>
          </button>
        )}

        {histogramData.length > 0 && (
          <button
            onClick={() => setActiveTab('histogram')}
            className={`pb-2 border-b-2 font-medium transition-all flex items-center space-x-1 ${
              activeTab === 'histogram'
                ? 'border-radar-cyan text-radar-cyan'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Spectral Histogram</span>
          </button>
        )}

        {result.metrics.sarMetrics && (
          <button
            onClick={() => setActiveTab('sar')}
            className={`pb-2 border-b-2 font-medium transition-all ${
              activeTab === 'sar'
                ? 'border-radar-cyan text-radar-cyan'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            SAR Microwave Radar Physics
          </button>
        )}
      </div>

      {/* Tab Content 1: Key Findings & Full Scientific Explanation */}
      {activeTab === 'insights' && (
        <div className="space-y-4">
          {/* Findings Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {result.findings?.map((finding, idx) => {
              let icon = <Info className="w-4 h-4 text-radar-cyan" />;
              let borderClass = 'border-slate-800';
              let badgeColor = 'bg-radar-cyan/10 text-radar-cyan border-radar-cyan/30';

              if (finding.severity === 'positive') {
                icon = <CheckCircle2 className="w-4 h-4 text-radar-emerald" />;
                borderClass = 'border-radar-emerald/20';
                badgeColor = 'bg-radar-emerald/10 text-radar-emerald border-radar-emerald/30';
              } else if (finding.severity === 'warning') {
                icon = <AlertTriangle className="w-4 h-4 text-amber-400" />;
                borderClass = 'border-amber-500/20';
                badgeColor = 'bg-amber-500/10 text-amber-300 border-amber-500/30';
              } else if (finding.severity === 'critical') {
                icon = <ShieldAlert className="w-4 h-4 text-red-400" />;
                borderClass = 'border-red-500/20';
                badgeColor = 'bg-red-500/10 text-red-300 border-red-500/30';
              }

              return (
                <div key={idx} className={`p-3.5 rounded-xl bg-space-900/60 border ${borderClass} space-y-1.5`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {icon}
                      <h5 className="text-xs font-semibold text-white">{finding.title}</h5>
                    </div>
                    {finding.badge && (
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${badgeColor}`}>
                        {finding.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {finding.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Full Explanation */}
          <div className="p-4 rounded-xl bg-space-950/80 border border-slate-800 space-y-2">
            <h5 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Scientific & Multi-Spectral Explanation
            </h5>
            <div className="text-xs text-slate-300 space-y-2 leading-relaxed whitespace-pre-line">
              {result.explanation}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Area Distribution Donut Chart */}
      {activeTab === 'breakdown' && breakdownData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center p-2">
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={breakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {breakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#0A1124', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend Table */}
          <div className="space-y-2">
            <h5 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">Surface Area Partitioning</h5>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {result.metrics.breakdown?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-space-900/60 border border-slate-800/80 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-200 font-medium">{item.name}</span>
                  </div>
                  <span className="font-mono font-bold text-white">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 3: Histogram Distribution */}
      {activeTab === 'histogram' && histogramData.length > 0 && (
        <div className="space-y-3 p-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Spectral Reflectance / Index Frequency Distribution</span>
            <span className="text-[11px] font-mono text-radar-cyan">10-Bin Discretization</span>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histogramData}>
                <XAxis dataKey="bin" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} unit="%" />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#0A1124', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="value" fill="#00F0FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tab Content 4: SAR Physics Details */}
      {activeTab === 'sar' && result.metrics.sarMetrics && (
        <div className="p-4 rounded-xl bg-space-950 border border-slate-800 space-y-3 text-xs">
          <h5 className="font-mono text-radar-cyan uppercase tracking-wider font-semibold">
            Synthetic Aperture Radar (SAR) Microwave Mechanics
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-space-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Mean Sigma-0</span>
              <strong className="text-white text-sm">{result.metrics.sarMetrics.meanBackscatterDb} dB</strong>
            </div>
            <div className="p-3 rounded-lg bg-space-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Surface Roughness</span>
              <strong className="text-radar-emerald text-sm">{result.metrics.sarMetrics.surfaceRoughness}</strong>
            </div>
            <div className="p-3 rounded-lg bg-space-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Polarization</span>
              <strong className="text-isro-amber text-sm">{result.metrics.sarMetrics.polarizationMode}</strong>
            </div>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            Microwave radar operates at C-Band (5.4 GHz) wavelength, which is non-attenuated by meteorological clouds, dense haze, or darkness. Smooth dielectric surfaces (calm water) cause forward specular scattering away from the radar antenna, creating deep backscatter nulls (&lt; -15 dB).
          </p>
        </div>
      )}

      {/* Actions Bottom Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-4">
        <div className="flex items-center space-x-2">
          {result.layers.length > 0 && (
            <button
              onClick={downloadActiveMask}
              className="px-3 py-1.5 rounded-xl bg-space-900 hover:bg-space-800 border border-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-radar-cyan" />
              <span>Download Segmented Mask (.PNG)</span>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenExport}
            className="px-3.5 py-1.5 rounded-xl bg-radar-cyan/15 hover:bg-radar-cyan/25 border border-radar-cyan/40 text-radar-cyan text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-glow-cyan"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Generate Official Report</span>
          </button>
        </div>
      </div>

    </div>
  );
};
