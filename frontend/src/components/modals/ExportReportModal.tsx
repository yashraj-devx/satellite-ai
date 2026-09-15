import React from 'react';
import { X, Printer, Satellite } from 'lucide-react';
import { AnalysisResult } from '../../types';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: AnalysisResult | null;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  result,
}) => {
  if (!isOpen || !result) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 text-slate-100 rounded-2xl border border-slate-700 p-8 space-y-6 shadow-2xl print:bg-white print:text-black print:p-0 print:border-none">
        
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 print:hidden">
          <div className="flex items-center space-x-2 text-radar-cyan font-mono text-xs">
            <Satellite className="w-4 h-4" />
            <span>Official Remote Sensing Analysis Dossier</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-radar-cyan hover:bg-cyan-300 text-space-950 text-xs font-mono font-bold flex items-center space-x-1.5 transition-all shadow-glow-cyan"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div className="space-y-6 print:space-y-4 print:text-black">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-isro-saffron pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold font-display uppercase tracking-wider text-white print:text-black">
                  SatQuery AI – Earth Observation Analysis Report
                </h1>
              </div>
              <p className="text-xs font-mono text-slate-400 print:text-slate-600 mt-0.5">
                Indian Space Research Organisation (ISRO) • Smart India Hackathon #26167
              </p>
            </div>

            <div className="text-right text-xs font-mono">
              <span className="block text-slate-400 print:text-slate-600">Dossier ID: {result.id}</span>
              <span className="block text-slate-300 print:text-slate-800 font-semibold">{new Date(result.timestamp).toUTCString()}</span>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-800/80 print:bg-slate-100 border border-slate-700 text-xs font-mono">
            <div>
              <span className="text-slate-400 print:text-slate-600 block text-[10px]">Operation Intent:</span>
              <strong className="text-radar-cyan print:text-blue-700">{result.intent}</strong>
            </div>
            <div>
              <span className="text-slate-400 print:text-slate-600 block text-[10px]">Primary Metric:</span>
              <strong className="text-white print:text-black">{result.metrics.primaryMetricName}: {result.metrics.primaryMetricValue}</strong>
            </div>
            <div>
              <span className="text-slate-400 print:text-slate-600 block text-[10px]">Confidence Rating:</span>
              <strong className="text-radar-emerald print:text-green-700">{result.confidence}%</strong>
            </div>
            <div>
              <span className="text-slate-400 print:text-slate-600 block text-[10px]">Sensor Class:</span>
              <strong className="text-slate-200 print:text-black">{result.geospatial?.sensor || 'Optical MSI'}</strong>
            </div>
          </div>

          {/* User Query & Summary */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase font-mono tracking-wider font-bold text-slate-400 print:text-slate-700">
              1. Analysis Query & Executive Summary
            </h3>
            <div className="p-3.5 rounded-xl bg-slate-800/40 print:bg-slate-50 border border-slate-700/60 text-xs leading-relaxed space-y-1.5">
              <p><strong className="text-radar-cyan print:text-blue-800">Natural Language Prompt:</strong> "{result.query}"</p>
              <p className="text-slate-200 print:text-black font-medium">{result.summary}</p>
            </div>
          </div>

          {/* Key Findings */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase font-mono tracking-wider font-bold text-slate-400 print:text-slate-700">
              2. Scientific Observations & Remote Sensing Findings
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {result.findings?.map((f, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-800/50 print:bg-slate-50 border border-slate-700 space-y-1">
                  <div className="flex items-center justify-between font-semibold text-white print:text-black">
                    <span>{f.title}</span>
                    {f.badge && <span className="text-[10px] font-mono text-radar-cyan print:text-blue-700">[{f.badge}]</span>}
                  </div>
                  <p className="text-[11px] text-slate-300 print:text-slate-700 leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Explanation */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase font-mono tracking-wider font-bold text-slate-400 print:text-slate-700">
              3. Detailed Spectral & Physical Mechanics
            </h3>
            <p className="text-xs text-slate-300 print:text-slate-800 leading-relaxed whitespace-pre-line bg-slate-800/30 print:bg-transparent p-3 rounded-xl border border-slate-700/40">
              {result.explanation}
            </p>
          </div>

          {/* Breakdown Table if present */}
          {result.metrics.breakdown && (
            <div className="space-y-2">
              <h3 className="text-xs uppercase font-mono tracking-wider font-bold text-slate-400 print:text-slate-700">
                4. Thematic Area Partitioning Table
              </h3>
              <table className="w-full text-xs font-mono border-collapse border border-slate-700 print:border-slate-300">
                <thead>
                  <tr className="bg-slate-800 print:bg-slate-200 text-left">
                    <th className="p-2 border border-slate-700 print:border-slate-300">Class Category</th>
                    <th className="p-2 border border-slate-700 print:border-slate-300">Surface Coverage %</th>
                    <th className="p-2 border border-slate-700 print:border-slate-300">Pixel Population</th>
                  </tr>
                </thead>
                <tbody>
                  {result.metrics.breakdown.map((b, idx) => (
                    <tr key={idx} className="border-b border-slate-800 print:border-slate-200">
                      <td className="p-2 border border-slate-700 print:border-slate-300 font-medium">{b.name}</td>
                      <td className="p-2 border border-slate-700 print:border-slate-300 font-bold">{b.percentage}%</td>
                      <td className="p-2 border border-slate-700 print:border-slate-300 text-slate-400 print:text-slate-600">{b.pixelCount.toLocaleString()} px</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer Signature */}
          <div className="border-t border-slate-700 pt-4 flex items-center justify-between text-[11px] font-mono text-slate-400 print:text-slate-600">
            <span>Generated via SatQuery AI Vision-Language Engine</span>
            <span>Verified by ISRO SIH #26167 Automated Pipeline</span>
          </div>

        </div>

      </div>
    </div>
  );
};
