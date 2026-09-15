import React, { useState } from 'react';
import { History, Search, Trash2, ArrowUpRight, Calendar } from 'lucide-react';
import { HistoryEntry } from '../../types';

interface HistoryViewProps {
  history: HistoryEntry[];
  onSelectHistory: (entry: HistoryEntry) => void;
  onDeleteHistory: (id: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onSelectHistory,
  onDeleteHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [intentFilter, setIntentFilter] = useState<string>('ALL');

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIntent = intentFilter === 'ALL' || item.intent === intentFilter;
    return matchesSearch && matchesIntent;
  });

  return (
    <div className="w-full space-y-5">
      {/* Header & Filter Controls */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-display font-bold text-white tracking-wide flex items-center space-x-2">
            <History className="w-5 h-5 text-radar-cyan" />
            <span>Analysis Audit History</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Log of remote sensing visual-language queries, calculated masks, and telemetry
          </p>
        </div>

        {/* Search & Intent Dropdown */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search history..."
              className="pl-8 pr-3 py-1.5 rounded-xl glass-input text-xs text-slate-200 w-48 focus:w-60 transition-all font-mono"
            />
          </div>

          <select
            value={intentFilter}
            onChange={e => setIntentFilter(e.target.value)}
            className="bg-space-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 font-mono focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Intents</option>
            <option value="WATER_DETECTION">Water Detection</option>
            <option value="VEGETATION_ANALYSIS">Vegetation / NDVI</option>
            <option value="CHANGE_DETECTION">Change Detection</option>
            <option value="URBAN_AREA_DETECTION">Urban / Built-up</option>
            <option value="SAR_ANALYSIS">SAR Radar</option>
            <option value="LAND_COVER_CLASSIFICATION">Land Cover LULC</option>
          </select>
        </div>
      </div>

      {/* History Items List */}
      {filteredHistory.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-space-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <History className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-300">No Past Analyses Found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-mono">
            Execute queries in the Analysis Studio or load sample datasets to populate your analysis audit trail.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col justify-between space-y-3 hover:border-radar-cyan/40 transition-all"
            >
              <div className="flex items-start space-x-3">
                <img
                  src={item.thumbnailUrl}
                  alt="Thumbnail"
                  className="w-16 h-16 rounded-xl object-cover border border-slate-700 flex-shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-space-900 text-radar-cyan border border-radar-cyan/20">
                      {item.intent.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-white truncate">"{item.query}"</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {item.summary}
                  </p>
                </div>
              </div>

              {/* Metrics & Actions */}
              <div className="flex items-center justify-between border-t border-slate-800/80 pt-2.5 text-xs font-mono">
                <span className="text-radar-emerald font-semibold">
                  {item.primaryMetric}
                </span>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => onSelectHistory(item)}
                    className="px-2.5 py-1 rounded-lg bg-radar-cyan/15 hover:bg-radar-cyan/25 text-radar-cyan border border-radar-cyan/30 text-xs font-semibold flex items-center space-x-1 transition-all"
                  >
                    <span>Inspect</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteHistory(item.id)}
                    className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-space-900 transition-all"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
