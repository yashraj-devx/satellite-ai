import React, { useState, useRef } from 'react';
import { Upload, Trash2, Clock, Radio, Sparkles } from 'lucide-react';
import { ImageMetadata } from '../../types';
import { ApiService } from '../../services/api';

interface ImageUploaderProps {
  uploadMode: 'single' | 'temporal' | 'optical_sar';
  setUploadMode: (mode: 'single' | 'temporal' | 'optical_sar') => void;
  primaryImage: ImageMetadata | null;
  setPrimaryImage: (img: ImageMetadata | null) => void;
  beforeImage: ImageMetadata | null;
  setBeforeImage: (img: ImageMetadata | null) => void;
  afterImage: ImageMetadata | null;
  setAfterImage: (img: ImageMetadata | null) => void;
  sarImage: ImageMetadata | null;
  setSarImage: (img: ImageMetadata | null) => void;
  onOpenSamples: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  uploadMode,
  setUploadMode,
  primaryImage,
  setPrimaryImage,
  beforeImage,
  setBeforeImage,
  afterImage,
  setAfterImage,
  sarImage,
  setSarImage,
  onOpenSamples,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [activeDropRole, setActiveDropRole] = useState<'primary' | 'before' | 'after' | 'sar'>('primary');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, role: 'primary' | 'before' | 'after' | 'sar') => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    await processUpload(files, role);
  };

  const processUpload = async (files: File[], role: 'primary' | 'before' | 'after' | 'sar') => {
    try {
      setIsUploading(true);
      const uploaded = await ApiService.uploadImages(files, role);
      if (uploaded.length > 0) {
        const item = uploaded[0];
        if (role === 'primary') setPrimaryImage(item);
        if (role === 'before') setBeforeImage(item);
        if (role === 'after') setAfterImage(item);
        if (role === 'sar') setSarImage(item);
      }
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent, role: 'primary' | 'before' | 'after' | 'sar') => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      await processUpload(files, role);
    }
  };

  const clearImage = (role: 'primary' | 'before' | 'after' | 'sar') => {
    if (role === 'primary') setPrimaryImage(null);
    if (role === 'before') setBeforeImage(null);
    if (role === 'after') setAfterImage(null);
    if (role === 'sar') setSarImage(null);
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col space-y-4">
      
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-wide">Satellite Imagery Input</h3>
          <p className="text-[11px] text-slate-400 font-mono">Upload optical, temporal pairs, or SAR radar</p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center space-x-1 bg-space-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            type="button"
            onClick={() => setUploadMode('single')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              uploadMode === 'single'
                ? 'bg-radar-cyan/20 text-radar-cyan border border-radar-cyan/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Single Optical
          </button>
          <button
            type="button"
            onClick={() => setUploadMode('temporal')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center space-x-1 ${
              uploadMode === 'temporal'
                ? 'bg-radar-cyan/20 text-radar-cyan border border-radar-cyan/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Dual Temporal</span>
          </button>
          <button
            type="button"
            onClick={() => setUploadMode('optical_sar')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center space-x-1 ${
              uploadMode === 'optical_sar'
                ? 'bg-radar-cyan/20 text-radar-cyan border border-radar-cyan/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3 h-3" />
            <span>Optical + SAR</span>
          </button>
        </div>
      </div>

      {/* Upload Dropzones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {uploadMode === 'single' && (
          <div className="col-span-2">
            {primaryImage ? (
              <div className="relative p-3 rounded-xl bg-space-900 border border-slate-700 flex items-center space-x-3">
                <img
                  src={primaryImage.url}
                  alt={primaryImage.filename}
                  className="w-16 h-16 rounded-lg object-cover border border-slate-700"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-white block truncate">{primaryImage.filename}</span>
                  <p className="text-[10px] font-mono text-slate-400">
                    {primaryImage.width}x{primaryImage.height} • {primaryImage.format} • {(primaryImage.sizeBytes / 1024).toFixed(0)} KB
                  </p>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-space-800 text-radar-cyan border border-radar-cyan/20 inline-block mt-1">
                    {primaryImage.geospatial.sensor}
                  </span>
                </div>
                <button
                  onClick={() => clearImage('primary')}
                  className="p-1.5 rounded-lg bg-space-800 text-slate-400 hover:text-red-400 transition-all"
                  title="Remove Image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={e => handleDrop(e, 'primary')}
                onClick={() => {
                  setActiveDropRole('primary');
                  fileInputRef.current?.click();
                }}
                className="cursor-pointer border-2 border-dashed border-slate-700 hover:border-radar-cyan/60 rounded-xl p-6 flex flex-col items-center justify-center space-y-2 text-center bg-space-900/40 hover:bg-space-900/80 transition-all group"
              >
                <div className="p-3 rounded-full bg-space-800 group-hover:bg-radar-cyan/10 text-slate-400 group-hover:text-radar-cyan transition-all">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-slate-200">
                    Drop satellite image here or <strong className="text-radar-cyan underline">browse</strong>
                  </span>
                  <p className="text-[10px] font-mono text-slate-500">Supports JPG, PNG, WebP, GeoTIFF (Max 50MB)</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dual Temporal Mode: Before & After */}
        {uploadMode === 'temporal' && (
          <>
            {/* Before Image */}
            <div>
              <span className="text-[11px] font-mono text-slate-400 block mb-1">Epoch 1 (Before Image):</span>
              {beforeImage ? (
                <div className="relative p-2.5 rounded-xl bg-space-900 border border-slate-700 flex items-center space-x-2.5">
                  <img src={beforeImage.url} alt="Before" className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-white truncate block">{beforeImage.filename}</span>
                    <span className="text-[10px] font-mono text-slate-400">Before Epoch</span>
                  </div>
                  <button onClick={() => clearImage('before')} className="p-1 text-slate-400 hover:text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => handleDrop(e, 'before')}
                  onClick={() => {
                    setActiveDropRole('before');
                    fileInputRef.current?.click();
                  }}
                  className="cursor-pointer border border-dashed border-slate-700 hover:border-amber-400/60 rounded-xl p-4 text-center bg-space-900/40 text-xs text-slate-300"
                >
                  <Upload className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                  <span>Upload <strong>Before</strong> Image</span>
                </div>
              )}
            </div>

            {/* After Image */}
            <div>
              <span className="text-[11px] font-mono text-slate-400 block mb-1">Epoch 2 (After Image):</span>
              {afterImage ? (
                <div className="relative p-2.5 rounded-xl bg-space-900 border border-slate-700 flex items-center space-x-2.5">
                  <img src={afterImage.url} alt="After" className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-white truncate block">{afterImage.filename}</span>
                    <span className="text-[10px] font-mono text-slate-400">After Epoch</span>
                  </div>
                  <button onClick={() => clearImage('after')} className="p-1 text-slate-400 hover:text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => handleDrop(e, 'after')}
                  onClick={() => {
                    setActiveDropRole('after');
                    fileInputRef.current?.click();
                  }}
                  className="cursor-pointer border border-dashed border-slate-700 hover:border-radar-cyan/60 rounded-xl p-4 text-center bg-space-900/40 text-xs text-slate-300"
                >
                  <Upload className="w-4 h-4 mx-auto mb-1 text-radar-cyan" />
                  <span>Upload <strong>After</strong> Image</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Optical + SAR Mode */}
        {uploadMode === 'optical_sar' && (
          <>
            <div>
              <span className="text-[11px] font-mono text-slate-400 block mb-1">Optical MSI Scene:</span>
              {primaryImage ? (
                <div className="p-2.5 rounded-xl bg-space-900 border border-slate-700 flex items-center space-x-2.5">
                  <img src={primaryImage.url} alt="Optical" className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-white truncate block">{primaryImage.filename}</span>
                    <span className="text-[10px] font-mono text-radar-cyan">Optical RGB/VNIR</span>
                  </div>
                  <button onClick={() => clearImage('primary')} className="p-1 text-slate-400 hover:text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => { setActiveDropRole('primary'); fileInputRef.current?.click(); }}
                  className="cursor-pointer border border-dashed border-slate-700 rounded-xl p-4 text-center bg-space-900/40 text-xs text-slate-300"
                >
                  <Upload className="w-4 h-4 mx-auto mb-1 text-radar-cyan" />
                  <span>Upload Optical Image</span>
                </div>
              )}
            </div>

            <div>
              <span className="text-[11px] font-mono text-slate-400 block mb-1">SAR Radar Backscatter:</span>
              {sarImage ? (
                <div className="p-2.5 rounded-xl bg-space-900 border border-slate-700 flex items-center space-x-2.5">
                  <img src={sarImage.url} alt="SAR" className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-white truncate block">{sarImage.filename}</span>
                    <span className="text-[10px] font-mono text-isro-amber">Sentinel-1 C-Band SAR</span>
                  </div>
                  <button onClick={() => clearImage('sar')} className="p-1 text-slate-400 hover:text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => { setActiveDropRole('sar'); fileInputRef.current?.click(); }}
                  className="cursor-pointer border border-dashed border-slate-700 rounded-xl p-4 text-center bg-space-900/40 text-xs text-slate-300"
                >
                  <Upload className="w-4 h-4 mx-auto mb-1 text-isro-amber" />
                  <span>Upload SAR Radar Image</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/tiff,.tif,.tiff"
        onChange={e => handleFileSelect(e, activeDropRole)}
        className="hidden"
      />

      {/* Quick Sample Dataset Action Button */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] font-mono text-slate-500">Don't have satellite files?</span>
        <button
          type="button"
          onClick={onOpenSamples}
          disabled={isUploading}
          className="px-3 py-1.5 rounded-xl bg-space-900 hover:bg-space-800 border border-slate-700 hover:border-radar-cyan/40 text-slate-300 hover:text-radar-cyan text-xs font-mono flex items-center space-x-1.5 transition-all shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-radar-cyan" />
          <span>Load Pre-packaged ISRO Samples</span>
        </button>
      </div>

    </div>
  );
};
