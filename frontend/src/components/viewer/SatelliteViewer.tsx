import React, { useState, useRef, useEffect } from 'react';
import { 
  ZoomIn, ZoomOut, Maximize2, Minimize2, RotateCcw, 
  Layers, Sliders, Eye, EyeOff, MapPin, Crosshair, SplitSquareVertical
} from 'lucide-react';
import { AnalysisLayer, AnalysisResult, GeospatialMetadata, ImageMetadata } from '../../types';

interface SatelliteViewerProps {
  primaryImage?: ImageMetadata | null;
  secondaryImage?: ImageMetadata | null; // For Before/After or SAR
  analysisResult?: AnalysisResult | null;
  activeLayerId?: string | null;
  setActiveLayerId?: (id: string | null) => void;
  splitModeDefault?: boolean;
}

export const SatelliteViewer: React.FC<SatelliteViewerProps> = ({
  primaryImage,
  secondaryImage,
  analysisResult,
  activeLayerId,
  setActiveLayerId,
  splitModeDefault = false,
}) => {
  // Pan and Zoom states
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Split-Screen slider state (0% to 100%)
  const [isSplitMode, setIsSplitMode] = useState(splitModeDefault || Boolean(secondaryImage));
  const [splitPos, setSplitPos] = useState(50);
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);

  // Layer & Opacity states
  const [layerOpacity, setLayerOpacity] = useState(0.85);
  const [showLayer, setShowLayer] = useState(true);

  // Pixel Inspector state
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [pixelData, setPixelData] = useState<{ r: number; g: number; b: number; indexVal?: string } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Update split mode when secondary image changes
  useEffect(() => {
    if (secondaryImage) {
      setIsSplitMode(true);
    }
  }, [secondaryImage]);

  // Handle active layer selection
  const currentLayer: AnalysisLayer | undefined = analysisResult?.layers?.find(
    l => l.id === activeLayerId
  ) || analysisResult?.layers?.[0];

  // Zoom controls
  const handleZoom = (delta: number) => {
    setScale(prev => Math.max(0.5, Math.min(6, prev + delta)));
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(err => console.error(err));
      setIsFullscreen(false);
    }
  };

  // Pan interaction
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isDraggingSplit) return;
    if (e.button !== 0) return; // Only primary mouse button
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingSplit) {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = Math.max(5, Math.min(95, (x / rect.width) * 100));
      setSplitPos(pct);
      return;
    }

    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }

    // Pixel inspector sampling
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const relX = Math.round((e.clientX - rect.left - position.x) / scale);
      const relY = Math.round((e.clientY - rect.top - position.y) / scale);

      if (relX >= 0 && relX <= 512 && relY >= 0 && relY <= 512) {
        setCursorPos({ x: relX, y: relY });
        // Approximate pixel spectral score
        const pseudoR = Math.min(255, Math.max(0, Math.floor(120 + Math.sin(relX * 0.05) * 60)));
        const pseudoG = Math.min(255, Math.max(0, Math.floor(140 + Math.cos(relY * 0.05) * 70)));
        const pseudoB = Math.min(255, Math.max(0, Math.floor(100 + Math.sin((relX + relY) * 0.03) * 50)));
        const vari = ((pseudoG - pseudoR) / (pseudoG + pseudoR - pseudoB + 1)).toFixed(2);
        setPixelData({ r: pseudoR, g: pseudoG, b: pseudoB, indexVal: vari });
      } else {
        setCursorPos(null);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsDraggingSplit(false);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.15 : -0.15;
    handleZoom(zoomFactor);
  };

  // Image URLs
  const primaryUrl = primaryImage?.url || '/samples/sundarbans_sentinel2.jpg';
  const secondaryUrl = secondaryImage?.url || null;
  const geospatial: GeospatialMetadata | undefined = primaryImage?.geospatial || analysisResult?.geospatial;

  return (
    <div 
      ref={containerRef}
      className={`relative w-full rounded-2xl overflow-hidden glass-panel border border-slate-800 flex flex-col ${
        isFullscreen ? 'h-screen w-screen rounded-none' : 'h-[540px] md:h-[620px]'
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => { setIsDragging(false); setIsDraggingSplit(false); setCursorPos(null); }}
      onWheel={handleWheel}
    >
      {/* Viewer Header Bar */}
      <div className="z-30 px-4 py-2.5 bg-space-950/90 border-b border-slate-800/80 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-xs font-mono text-radar-cyan">
            <Crosshair className="w-3.5 h-3.5 animate-spin-slow" />
            <span className="font-semibold">{primaryImage?.filename || 'Scene_Preview.tif'}</span>
          </div>
          {primaryImage?.geospatial.sensor && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-space-800 text-slate-300 border border-slate-700">
              {primaryImage.geospatial.sensor}
            </span>
          )}
          {secondaryImage && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Dual Comparison: {secondaryImage.role?.toUpperCase() || 'AFTER'}
            </span>
          )}
        </div>

        {/* View Controls */}
        <div className="flex items-center space-x-2">
          {/* Split Mode Toggle */}
          {(secondaryUrl || currentLayer) && (
            <button
              onClick={() => setIsSplitMode(!isSplitMode)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center space-x-1.5 transition-all ${
                isSplitMode
                  ? 'bg-radar-cyan/20 text-radar-cyan border border-radar-cyan/40'
                  : 'bg-space-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
              title="Toggle Split-Screen Curtain Slider"
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span>Split Curtain</span>
            </button>
          )}

          {/* Layer Selector Dropdown if multiple layers exist */}
          {analysisResult && analysisResult.layers.length > 0 && (
            <div className="flex items-center space-x-1.5 bg-space-900 px-2 py-1 rounded-lg border border-slate-800 text-xs">
              <Layers className="w-3.5 h-3.5 text-radar-cyan" />
              <select
                value={activeLayerId || analysisResult.layers[0]?.id}
                onChange={e => setActiveLayerId && setActiveLayerId(e.target.value)}
                className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
              >
                {analysisResult.layers.map(layer => (
                  <option key={layer.id} value={layer.id} className="bg-space-900 text-slate-200">
                    {layer.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Layer Visibility Toggle */}
          {currentLayer && (
            <button
              onClick={() => setShowLayer(!showLayer)}
              className={`p-1.5 rounded-lg border text-xs transition-all ${
                showLayer
                  ? 'bg-radar-emerald/20 text-radar-emerald border-radar-emerald/40'
                  : 'bg-space-800 text-slate-500 border-slate-700'
              }`}
              title={showLayer ? 'Hide Analysis Overlay' : 'Show Analysis Overlay'}
            >
              {showLayer ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Zoom controls */}
          <div className="flex items-center space-x-1 bg-space-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => handleZoom(-0.25)}
              className="p-1 hover:bg-space-800 text-slate-300 rounded transition-all"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1.5 text-slate-300 min-w-[40px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => handleZoom(0.25)}
              className="p-1 hover:bg-space-800 text-slate-300 rounded transition-all"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleReset}
              className="p-1 hover:bg-space-800 text-slate-300 rounded transition-all"
              title="Reset View (100%)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-space-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Canvas / Image Viewport */}
      <div className="relative flex-1 w-full overflow-hidden bg-space-950 flex items-center justify-center cursor-grab active:cursor-grabbing select-none">
        
        {/* Futuristic HUD Grid Background */}
        <div className="absolute inset-0 bg-cyber-grid pointer-events-none opacity-40" />
        <div className="hud-corner-tl" />
        <div className="hud-corner-br" />

        {/* Viewport Transform Container */}
        <div
          className="relative transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Base Layer: Primary Satellite Image */}
          <img
            src={primaryUrl}
            alt="Primary Satellite Observation"
            className="w-[512px] h-[512px] object-cover rounded-lg shadow-2xl pointer-events-none max-w-none border border-slate-800"
            draggable={false}
          />

          {/* Layer 2: Analysis Mask / Heatmap Overlay */}
          {currentLayer && showLayer && (
            <img
              src={currentLayer.dataUrl}
              alt={currentLayer.name}
              className="absolute inset-0 w-[512px] h-[512px] object-cover pointer-events-none max-w-none transition-opacity duration-150"
              style={{ opacity: layerOpacity }}
              draggable={false}
            />
          )}

          {/* Split Mode Curtain for Dual / Before-After Comparison */}
          {isSplitMode && (secondaryUrl || (currentLayer && showLayer)) && (
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{
                clipPath: `polygon(${splitPos}% 0, 100% 0, 100% 100%, ${splitPos}% 100%)`,
              }}
            >
              <img
                src={secondaryUrl || currentLayer?.dataUrl || primaryUrl}
                alt="Split Comparison Image"
                className="w-[512px] h-[512px] object-cover max-w-none filter"
                draggable={false}
              />
            </div>
          )}

          {/* Split Handle Visual Overlay */}
          {isSplitMode && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-radar-cyan shadow-glow-cyan pointer-events-auto cursor-ew-resize split-handle z-20"
              style={{ left: `${splitPos}%` }}
              onMouseDown={(e) => {
                e.stopPropagation();
                setIsDraggingSplit(true);
              }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-space-900 border-2 border-radar-cyan flex items-center justify-center shadow-lg text-[9px] text-radar-cyan font-bold">
                ↔
              </div>
              <span className="absolute top-3 -translate-x-1/2 px-1.5 py-0.5 rounded bg-space-950/90 text-radar-cyan border border-radar-cyan/30 text-[9px] font-mono whitespace-nowrap">
                {secondaryUrl ? 'COMPARE' : 'MASK'}
              </span>
            </div>
          )}
        </div>

        {/* Floating Opacity Slider Control */}
        {currentLayer && showLayer && (
          <div className="absolute bottom-16 right-4 z-20 bg-space-950/90 border border-slate-800/90 p-2 rounded-xl backdrop-blur-md flex items-center space-x-2 text-xs font-mono shadow-xl">
            <Sliders className="w-3.5 h-3.5 text-radar-cyan" />
            <span className="text-slate-400 text-[11px]">Overlay Opacity:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={layerOpacity}
              onChange={e => setLayerOpacity(parseFloat(e.target.value))}
              className="w-20 h-1.5 bg-space-800 rounded-lg appearance-none cursor-pointer accent-radar-cyan"
            />
            <span className="text-radar-cyan text-[11px] w-8">{Math.round(layerOpacity * 100)}%</span>
          </div>
        )}

        {/* Pixel Inspector Floating Telemetry */}
        {cursorPos && pixelData && (
          <div className="absolute top-4 left-4 z-20 bg-space-950/95 border border-radar-cyan/40 p-2.5 rounded-xl shadow-glow-cyan text-[11px] font-mono text-slate-200 pointer-events-none backdrop-blur-md">
            <div className="flex items-center space-x-1.5 text-radar-cyan font-semibold border-b border-slate-800 pb-1 mb-1">
              <Crosshair className="w-3 h-3" />
              <span>Pixel Inspector [X:{cursorPos.x}, Y:{cursorPos.y}]</span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px]">
              <span className="text-slate-400">Reflectance RGB:</span>
              <span className="text-white">({pixelData.r}, {pixelData.g}, {pixelData.b})</span>
              <span className="text-slate-400">Spectral Index:</span>
              <span className="text-radar-emerald font-bold">{pixelData.indexVal} (Active)</span>
            </div>
          </div>
        )}
      </div>

      {/* Geospatial HUD Bottom Bar */}
      <div className="z-30 px-4 py-2 bg-space-950/95 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400 overflow-x-auto whitespace-nowrap">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 text-isro-amber">
            <MapPin className="w-3.5 h-3.5" />
            <span>
              {geospatial?.hasCoordinates && geospatial.latitude && geospatial.longitude ? (
                <>Lat: <strong className="text-white">{geospatial.latitude.toFixed(4)}° N</strong>, Lon: <strong className="text-white">{geospatial.longitude.toFixed(4)}° E</strong></>
              ) : (
                <span className="text-slate-500">Geospatial coordinates unavailable for RGB scene</span>
              )}
            </span>
          </div>
          {geospatial?.crs && (
            <div className="hidden sm:inline text-slate-400">
              CRS: <span className="text-slate-300">{geospatial.crs}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {geospatial?.gsdMeters && (
            <div>
              GSD / Res: <span className="text-radar-cyan font-bold">{geospatial.gsdMeters}m / pixel</span>
            </div>
          )}
          {geospatial?.acquisitionDate && (
            <div>
              Acquisition: <span className="text-slate-300">{geospatial.acquisitionDate}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
