import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud, Camera, Image as ImageIcon, RefreshCw, X,
  CheckCircle2, Sparkles, VideoOff, Eye
} from 'lucide-react';
import { SAMPLE_DATASETS } from '../utils/sampleImages';

export default function VisualCaptureWidget({ onImageCaptured, currentImage, onClearImage, onPresetApplied }) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'webcam' | 'sample'
  const [isDragging, setIsDragging] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [selectedSampleKey, setSelectedSampleKey] = useState(null);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Stop camera when unmounting or switching tabs
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (activeTab !== 'webcam' && cameraActive) {
      stopCamera();
    }
  }, [activeTab]);

  const handleFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert('Visual asset exceeds the maximum allowable size of 8 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      onImageCaptured(e.target.result);
      setSelectedSampleKey(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment'
        },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Webcam access was denied or no camera device is available on this system.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const captureFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 800;
    canvas.height = video.videoHeight || 600;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    onImageCaptured(dataUrl);
    stopCamera();
    setActiveTab('upload');
  };

  const loadSampleDataset = (key) => {
    const dataset = SAMPLE_DATASETS[key];
    if (!dataset) return;
    setSelectedSampleKey(key);
    onImageCaptured(dataset.image_data_url);
    if (onPresetApplied) {
      onPresetApplied({
        title: dataset.title,
        domain_category: dataset.domain_category,
        analysis_mode: dataset.analysis_mode,
        operator_notes: dataset.operator_notes
      });
    }
  };

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-5 shadow-xl backdrop-blur-md">
      {/* Mode Tabs */}
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-4 mb-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'upload'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            File Upload / Drop
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('webcam');
              if (!cameraActive) startCamera();
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'webcam'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Camera className="w-4 h-4" />
            Live Camera Feed
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sample')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'sample'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            Load Sample Assets
          </button>
        </div>

        {currentImage && (
          <button
            type="button"
            onClick={onClearImage}
            className="text-xs text-rose-400 hover:text-rose-300 inline-flex items-center gap-1 font-medium px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20"
          >
            <X className="w-3.5 h-3.5" />
            Clear Asset
          </button>
        )}
      </div>

      {/* Main Preview / Capture Zone */}
      {currentImage ? (
        <div className="relative group rounded-xl overflow-hidden border border-cyan-500/40 bg-slate-950 flex flex-col items-center justify-center p-2">
          <div className="relative max-h-96 w-full flex items-center justify-center overflow-hidden rounded-lg bg-black/60">
            <img
              src={currentImage}
              alt="Inspection Asset Preview"
              className="max-h-96 w-auto object-contain rounded"
            />
            <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-cyan-500/40 px-3 py-1 rounded-full flex items-center gap-1.5 text-xs text-cyan-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Asset Ready for Multimodal Analysis</span>
            </div>
            {selectedSampleKey && (
              <div className="absolute top-3 right-3 bg-amber-500/20 backdrop-blur-md border border-amber-500/40 px-3 py-1 rounded-full flex items-center gap-1.5 text-xs text-amber-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Preset: {selectedSampleKey}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* TAB 1: UPLOAD DROPZONE */}
          {activeTab === 'upload' && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[220px] ${
                isDragging
                  ? 'border-cyan-400 bg-cyan-950/20 scale-[0.99]'
                  : 'border-slate-600 hover:border-cyan-500/60 bg-slate-900/40 hover:bg-slate-900/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
              />
              <div className="p-4 rounded-2xl bg-cyan-500/10 text-cyan-400 mb-3 border border-cyan-500/20">
                <UploadCloud className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold text-white">
                Drag & drop your visual asset here, or <span className="text-cyan-400 underline">browse</span>
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Supports High-Resolution JPEG, PNG, or WebP (up to 8 MB)
              </p>
              <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-500">
                <span>Direct base64 encoding</span>
                <span>•</span>
                <span>Automated EXIF rotation</span>
                <span>•</span>
                <span>Encrypted transit</span>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE HTML5 WEBCAM */}
          {activeTab === 'webcam' && (
            <div className="rounded-xl bg-slate-950 p-4 border border-slate-700 flex flex-col items-center justify-center">
              {cameraError ? (
                <div className="p-6 text-center text-rose-400 flex flex-col items-center">
                  <VideoOff className="w-10 h-10 mb-2 opacity-80" />
                  <p className="text-sm font-medium">{cameraError}</p>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="mt-4 px-4 py-1.5 rounded-lg bg-slate-800 text-xs text-white hover:bg-slate-700"
                  >
                    Retry Permission
                  </button>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center">
                  <div className="relative w-full max-w-lg aspect-video bg-black rounded-lg overflow-hidden border border-slate-800">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-full text-[11px] text-emerald-400 border border-emerald-500/30">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      LIVE FEED
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={captureFrame}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500"
                    >
                      <Camera className="w-4 h-4" />
                      Capture Inspection Frame
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-3 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs"
                    >
                      Stop Feed
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ONE-CLICK SAMPLE ASSET PRESETS */}
          {activeTab === 'sample' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-semibold text-slate-300">
                  Select a Benchmark Inspection Scenario (1-Click Load):
                </span>
                <span className="text-[11px] text-amber-400 font-mono">Instant testing ready</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(SAMPLE_DATASETS).map(([key, dataset]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => loadSampleDataset(key)}
                    className="flex flex-col text-left p-3.5 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-900 hover:border-cyan-500/60 transition-all group"
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <span className="text-xs font-bold text-cyan-400 group-hover:text-cyan-300">
                        {dataset.domain_category}
                      </span>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {dataset.analysis_mode.split(' ')[0]}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-white line-clamp-1 group-hover:text-cyan-100">
                      {dataset.title}
                    </span>
                    <span className="mt-1 text-[11px] text-slate-400 line-clamp-2">
                      {dataset.preview_description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

