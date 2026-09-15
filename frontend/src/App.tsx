import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Layers, Satellite,
  ShieldCheck, Radio, Globe, Activity
} from 'lucide-react';
import { Navbar } from './components/layout/Navbar';
import { TelemetryBanner } from './components/layout/TelemetryBanner';
import { SatelliteViewer } from './components/viewer/SatelliteViewer';
import { AICopilot } from './components/copilot/AICopilot';
import { ResultCard } from './components/results/ResultCard';
import { ImageUploader } from './components/upload/ImageUploader';
import { SampleGallery } from './components/samples/SampleGallery';
import { CompareStudio } from './components/compare/CompareStudio';
import { HistoryView } from './components/history/HistoryView';
import { SensorGuideModal } from './components/modals/SensorGuideModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { ExportReportModal } from './components/modals/ExportReportModal';
import { ApiService } from './services/api';
import { AnalysisResult, ConfigStatus, HistoryEntry, ImageMetadata, RemoteSensingIntent, SampleDataset } from './types';

export const App: React.FC = () => {
  // Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analyze' | 'compare' | 'history' | 'guide'>('dashboard');

  // Images state
  const [uploadMode, setUploadMode] = useState<'single' | 'temporal' | 'optical_sar'>('single');
  const [primaryImage, setPrimaryImage] = useState<ImageMetadata | null>(null);
  const [beforeImage, setBeforeImage] = useState<ImageMetadata | null>(null);
  const [afterImage, setAfterImage] = useState<ImageMetadata | null>(null);
  const [sarImage, setSarImage] = useState<ImageMetadata | null>(null);

  // Analysis result state
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // App data
  const [samples, setSamples] = useState<SampleDataset[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSamplesModalOpen, setIsSamplesModalOpen] = useState(false);

  // Initial data loading
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [sampleData, historyData, config] = await Promise.all([
        ApiService.getSamples(),
        ApiService.getHistory(),
        ApiService.getConfigStatus(),
      ]);

      setSamples(sampleData);
      setHistory(historyData);
      setConfigStatus(config);

      // Default load first sample image if none loaded
      if (sampleData.length > 0 && !primaryImage) {
        loadSampleIntoWorkspace(sampleData[0], false);
      }
    } catch (err) {
      console.error('Initial data load error:', err);
    }
  };

  const loadSampleIntoWorkspace = (sample: SampleDataset, shouldSwitchTab = true, queryToRun?: string) => {
    setUploadMode(sample.mode);

    if (sample.images.primary) {
      setPrimaryImage({
        id: `sample_${sample.id}_primary`,
        filename: `${sample.title.replace(/\s+/g, '_')}_Sentinel2.jpg`,
        path: sample.images.primary,
        url: sample.images.primary,
        width: 512,
        height: 512,
        format: 'JPEG',
        channels: 3,
        sizeBytes: 154000,
        uploadedAt: new Date().toISOString(),
        geospatial: sample.geospatial,
        role: 'primary',
      });
    }

    if (sample.images.before) {
      setBeforeImage({
        id: `sample_${sample.id}_before`,
        filename: `${sample.title.replace(/\s+/g, '_')}_Before2018.jpg`,
        path: sample.images.before,
        url: sample.images.before,
        width: 512,
        height: 512,
        format: 'JPEG',
        channels: 3,
        sizeBytes: 154000,
        uploadedAt: new Date().toISOString(),
        geospatial: sample.geospatial,
        role: 'before',
      });
    } else {
      setBeforeImage(null);
    }

    if (sample.images.after) {
      setAfterImage({
        id: `sample_${sample.id}_after`,
        filename: `${sample.title.replace(/\s+/g, '_')}_After2024.jpg`,
        path: sample.images.after,
        url: sample.images.after,
        width: 512,
        height: 512,
        format: 'JPEG',
        channels: 3,
        sizeBytes: 154000,
        uploadedAt: new Date().toISOString(),
        geospatial: sample.geospatial,
        role: 'after',
      });
    } else {
      setAfterImage(null);
    }

    if (sample.images.sar) {
      setSarImage({
        id: `sample_${sample.id}_sar`,
        filename: `${sample.title.replace(/\s+/g, '_')}_Sentinel1_SAR.jpg`,
        path: sample.images.sar,
        url: sample.images.sar,
        width: 512,
        height: 512,
        format: 'JPEG',
        channels: 3,
        sizeBytes: 154000,
        uploadedAt: new Date().toISOString(),
        geospatial: sample.geospatial,
        role: 'sar',
      });
    } else {
      setSarImage(null);
    }

    if (shouldSwitchTab) {
      setActiveTab('analyze');
    }

    if (queryToRun) {
      setTimeout(() => {
        handleExecuteQuery(queryToRun);
      }, 100);
    }
  };

  // Main Query Execution
  const handleExecuteQuery = async (queryText: string, forcedIntent?: RemoteSensingIntent) => {
    try {
      setIsLoading(true);
      const res = await ApiService.submitQuery({
        query: queryText,
        forcedIntent,
        images: {
          primary: primaryImage || undefined,
          before: beforeImage || undefined,
          after: afterImage || undefined,
          sar: sarImage || undefined,
        },
      });

      setAnalysisResult(res);
      if (res.layers.length > 0) {
        setActiveLayerId(res.layers[0].id);
      }

      // Refresh history
      const updatedHistory = await ApiService.getHistory();
      setHistory(updatedHistory);

      // Auto switch to analyze tab if on dashboard
      if (activeTab === 'dashboard') {
        setActiveTab('analyze');
      }
    } catch (err: any) {
      alert(`Query analysis error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistoryItem = (entry: HistoryEntry) => {
    setAnalysisResult(entry.result);
    if (entry.result.images.primary) setPrimaryImage(entry.result.images.primary);
    if (entry.result.images.before) setBeforeImage(entry.result.images.before);
    if (entry.result.images.after) setAfterImage(entry.result.images.after);
    if (entry.result.images.sar) setSarImage(entry.result.images.sar);
    if (entry.result.layers.length > 0) setActiveLayerId(entry.result.layers[0].id);
    setActiveTab('analyze');
  };

  const handleDeleteHistory = async (id: string) => {
    await ApiService.deleteHistoryItem(id);
    const updated = await ApiService.getHistory();
    setHistory(updated);
  };

  return (
    <div className="min-h-screen bg-space-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        configStatus={configStatus}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Telemetry Status Bar */}
      <TelemetryBanner />

      {/* Demo Mode Notification Banner if No API Key */}
      {configStatus?.demoMode && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center text-xs font-mono text-amber-300 flex items-center justify-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>
            <strong>Demo Mode Active:</strong> Executing real client-side & server-side algorithmic remote sensing (NDVI, NDWI, SSIM Difference).
          </span>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="underline font-bold text-white hover:text-amber-200 ml-1"
          >
            Add Free Gemini API Key for Multimodal AI reasoning
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* TAB 1: MISSION CONTROL DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            
            {/* Hero Section */}
            <div className="relative glass-panel rounded-3xl p-8 md:p-12 border border-slate-800 overflow-hidden shadow-2xl">
              <div className="absolute -right-20 -top-20 w-96 h-96 bg-radar-cyan/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-isro-saffron/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-3xl space-y-4">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-space-900/90 border border-radar-cyan/30 text-radar-cyan text-xs font-mono">
                  <Satellite className="w-3.5 h-3.5" />
                  <span>Indian Space Research Organisation • SIH #26167</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight leading-tight">
                  Ask your satellite imagery <span className="text-transparent bg-clip-text bg-gradient-to-r from-radar-cyan via-blue-400 to-radar-emerald">anything.</span>
                </h1>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                  Analyze optical, multispectral, SAR radar and bi-temporal satellite imagery using natural-language queries. No GIS experience required.
                </p>

                {/* Main Hero Query & CTA */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={() => setActiveTab('analyze')}
                    className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-radar-cyan to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-space-950 font-bold text-sm font-mono flex items-center justify-center space-x-2 shadow-glow-cyan transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>+ Open Analysis Studio</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('compare')}
                    className="px-6 py-3.5 rounded-xl bg-space-900 hover:bg-space-800 text-slate-200 border border-slate-700 text-sm font-mono font-semibold flex items-center justify-center space-x-2 transition-all"
                  >
                    <Layers className="w-4 h-4 text-radar-cyan" />
                    <span>Compare Dual Images</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Capability Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-radar-cyan/15 border border-radar-cyan/30 flex items-center justify-center text-radar-cyan">
                  <Globe className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold text-white">Water & Inundation</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Automated NDWI/MNDWI water extraction isolating rivers, reservoirs, and flood extent.
                </p>
              </div>

              <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-radar-emerald/15 border border-radar-emerald/30 flex items-center justify-center text-radar-emerald">
                  <Activity className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold text-white">Vegetation & NDVI</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Chlorophyll biomass vigor calculation and agricultural crop canopy stage classification.
                </p>
              </div>

              <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300">
                  <Layers className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold text-white">Temporal Change Delta</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Multi-epoch pixel difference heatmaps isolating deforestation and urban expansion.
                </p>
              </div>

              <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-radar-purple/15 border border-radar-purple/30 flex items-center justify-center text-radar-purple">
                  <Radio className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold text-white">SAR Microwave Radar</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cloud-penetrating C-Band radar backscatter sigma-0 surface roughness analysis.
                </p>
              </div>
            </div>

            {/* Pre-packaged Sample Datasets Showcase */}
            <SampleGallery
              samples={samples}
              onSelectSample={(s, q) => loadSampleIntoWorkspace(s, true, q)}
            />

          </div>
        )}

        {/* TAB 2: ANALYSIS STUDIO WORKSPACE */}
        {activeTab === 'analyze' && (
          <div className="space-y-6">
            
            {/* Top Row: Left Uploader & Right Co-Pilot */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Image Uploader (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <ImageUploader
                  uploadMode={uploadMode}
                  setUploadMode={setUploadMode}
                  primaryImage={primaryImage}
                  setPrimaryImage={setPrimaryImage}
                  beforeImage={beforeImage}
                  setBeforeImage={setBeforeImage}
                  afterImage={afterImage}
                  setAfterImage={setAfterImage}
                  sarImage={sarImage}
                  setSarImage={setSarImage}
                  onOpenSamples={() => setIsSamplesModalOpen(true)}
                />

                <AICopilot
                  onQuerySubmit={(q, intent) => handleExecuteQuery(q, intent)}
                  isLoading={isLoading}
                  activeIntent={analysisResult?.intent}
                  hasDualImages={Boolean(beforeImage && afterImage)}
                  hasSarImage={Boolean(sarImage)}
                />
              </div>

              {/* Right Column: Satellite Image Viewer (7 cols) */}
              <div className="lg:col-span-7">
                <SatelliteViewer
                  primaryImage={primaryImage}
                  secondaryImage={uploadMode === 'temporal' ? afterImage : sarImage}
                  analysisResult={analysisResult}
                  activeLayerId={activeLayerId}
                  setActiveLayerId={setActiveLayerId}
                />
              </div>

            </div>

            {/* Bottom Row: Rich Analysis Result Dashboard */}
            {analysisResult && (
              <ResultCard
                result={analysisResult}
                onOpenExport={() => setIsExportOpen(true)}
              />
            )}

          </div>
        )}

        {/* TAB 3: COMPARE STUDIO */}
        {activeTab === 'compare' && (
          <CompareStudio
            beforeImage={beforeImage}
            afterImage={afterImage}
            onRunChangeDetection={() => handleExecuteQuery('Detect and quantify all landscape changes between these two satellite images', 'CHANGE_DETECTION')}
            isLoading={isLoading}
          />
        )}

        {/* TAB 4: AUDIT HISTORY */}
        {activeTab === 'history' && (
          <HistoryView
            history={history}
            onSelectHistory={handleSelectHistoryItem}
            onDeleteHistory={handleDeleteHistory}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-space-950 py-6 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-white font-semibold">SatQuery AI</span>
            <span>• ISRO Remote Sensing Assistant</span>
            <span className="px-1.5 py-0.5 rounded bg-space-900 border border-slate-800 text-isro-saffron font-bold">
              SIH #26167
            </span>
          </div>
          <div>
            Built with React, TypeScript, Sharp & Google Gemini Multimodal Vision
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SensorGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        configStatus={configStatus}
        onConfigUpdated={loadInitialData}
      />

      <ExportReportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        result={analysisResult}
      />

      {/* Samples Modal */}
      {isSamplesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto glass-panel rounded-2xl border border-slate-700 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold font-display text-white">Select an ISRO Satellite Dataset</h3>
              <button
                onClick={() => setIsSamplesModalOpen(false)}
                className="px-3 py-1 rounded-lg bg-space-900 text-slate-400 hover:text-white text-xs font-mono"
              >
                Close
              </button>
            </div>
            <SampleGallery
              samples={samples}
              onSelectSample={(s, q) => {
                loadSampleIntoWorkspace(s, true, q);
                setIsSamplesModalOpen(false);
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
