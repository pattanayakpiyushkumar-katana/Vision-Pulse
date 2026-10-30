import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import VisualCaptureWidget from '../components/VisualCaptureWidget';
import {
  Camera, Sparkles, AlertCircle, Loader2, ArrowRight,
  ShieldCheck, HelpCircle, Layers, CheckCircle2, Cpu
} from 'lucide-react';

export default function InspectStudioPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [sites, setSites] = useState([]);
  const [loadingSites, setLoadingSites] = useState(true);

  const [formData, setFormData] = useState({
    site_id: searchParams.get('site_id') || '',
    title: '',
    domain_category: searchParams.get('domain') || 'MANUFACTURING_QC',
    analysis_mode: 'Standard Anomaly Detection',
    operator_notes: '',
    image_data_url: ''
  });

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [error, setError] = useState('');

  const domains = [
    { code: 'MANUFACTURING_QC', label: 'Manufacturing & PCB Defect QC', icon: Cpu },
    { code: 'INFRASTRUCTURE_SAFETY', label: 'Infrastructure & Structural Inspection', icon: Layers },
    { code: 'WORKPLACE_HSE', label: 'Workplace Safety & PPE Compliance', icon: ShieldCheck },
    { code: 'DOCUMENT_OCR_AUDIT', label: 'Scanned Document & Invoice Intelligence', icon: HelpCircle },
    { code: 'RETAIL_INVENTORY', label: 'Retail Shelf & Warehouse Inventory', icon: Sparkles }
  ];

  const analysisModes = [
    'Standard Anomaly Detection',
    'Deep Defect & Root-Cause Audit',
    'Safety & Compliance Check',
    'Document OCR & Verification'
  ];

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      setLoadingSites(true);
      const res = await axiosClient.get('/sites');
      setSites(res.data.sites || []);
    } catch (err) {
      console.error('Error fetching sites:', err);
    } finally {
      setLoadingSites(false);
    }
  };

  const handleImageCaptured = (dataUrl) => {
    setFormData((prev) => ({ ...prev, image_data_url: dataUrl }));
    setError('');
  };

  const handleClearImage = () => {
    setFormData((prev) => ({ ...prev, image_data_url: '' }));
  };

  const handlePresetApplied = (preset) => {
    setFormData((prev) => ({
      ...prev,
      title: preset.title || prev.title,
      domain_category: preset.domain_category || prev.domain_category,
      analysis_mode: preset.analysis_mode || prev.analysis_mode,
      operator_notes: preset.operator_notes || prev.operator_notes
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.image_data_url) {
      setError('Please upload a visual asset, capture a camera frame, or select a sample image.');
      return;
    }

    if (!formData.title.trim()) {
      setError('Please provide an operational inspection title.');
      return;
    }

    setAnalyzing(true);
    setAnalysisStep(1);

    const stepInterval = setInterval(() => {
      setAnalysisStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 900);

    try {
      const payload = {
        site_id: formData.site_id || null,
        title: formData.title.trim(),
        domain_category: formData.domain_category,
        analysis_mode: formData.analysis_mode,
        operator_notes: formData.operator_notes.trim(),
        image_data_url: formData.image_data_url
      };

      const res = await axiosClient.post('/inspections/analyze', payload);
      clearInterval(stepInterval);
      const inspectionId = res.data.inspection?.id;

      if (inspectionId) {
        navigate(`/inspections/${inspectionId}`);
      } else {
        navigate('/inspections');
      }
    } catch (err) {
      clearInterval(stepInterval);
      setAnalyzing(false);
      console.error('Analysis execution failed:', err);
      const msg = err.response?.data?.error || err.response?.data?.details?.[0]?.message || 'Visual analysis failed.';
      setError(msg);
    }
  };

  const analysisStepsList = [
    'Initializing multimodal neural vision tensor...',
    'Segmenting visual bounding regions & defect vectors...',
    'Performing optical OCR text & label correlation...',
    'Formulating root-cause hypotheses & remediation protocols...',
    'Finalizing health score & persisting to database...'
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold mb-2">
          <Camera className="w-3.5 h-3.5" />
          <span>Multimodal AI Visual Studio</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          New AI Visual Inspection
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Upload images, capture live camera feeds, or audit scanned documents for automated anomaly detection
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Analysis Loading Screen */}
      {analyzing ? (
        <div className="rounded-2xl border border-cyan-500/40 bg-slate-900/95 p-12 text-center shadow-2xl backdrop-blur-xl">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 animate-ping" />
            <div className="absolute inset-0 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin" />
            <div className="absolute inset-3 rounded-full bg-slate-950 flex items-center justify-center text-cyan-400">
              <Camera className="w-8 h-8 animate-pulse" />
            </div>
          </div>

          <h2 className="text-lg font-bold text-white tracking-tight">
            Gemini 2.5 Flash Vision In Progress
          </h2>
          <p className="mt-2 text-xs font-mono text-cyan-400">
            {analysisStepsList[analysisStep] || analysisStepsList[0]}
          </p>

          <div className="mt-6 w-72 mx-auto h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (analysisStep + 1) * 20)}%` }}
            />
          </div>
          <p className="mt-3 text-[11px] text-slate-500">
            Executing server-side Zod validation and PostgreSQL RLS transaction
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Visual Capture Widget */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>1. Visual Input Source</span>
                <span className="text-rose-400">*</span>
              </label>
              <span className="text-[11px] text-slate-400">Drag & Drop, HTML5 Webcam, or 1-Click Samples</span>
            </div>

            <VisualCaptureWidget
              onImageCaptured={handleImageCaptured}
              currentImage={formData.image_data_url}
              onClearImage={handleClearImage}
              onPresetApplied={handlePresetApplied}
            />
          </div>

          {/* Section 2: Form Configuration Grid */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-md space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">
              2. Inspection Metadata & Advisory Parameters
            </h3>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Inspection Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. SMT Line #4 PCB Surface Defect Inspection"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Site & Domain */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Inspection Site / Zone
                </label>
                <select
                  value={formData.site_id}
                  onChange={(e) => setFormData({ ...formData, site_id: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Ad-Hoc Inspection (No Registered Facility)</option>
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Visual Domain <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formData.domain_category}
                  onChange={(e) => setFormData({ ...formData, domain_category: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  {domains.map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Analysis Mode */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                AI Analysis Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {analysisModes.map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setFormData({ ...formData, analysis_mode: mode })}
                    className={`px-3.5 py-2 rounded-xl text-xs text-left font-medium border transition-all ${
                      formData.analysis_mode === mode
                        ? 'bg-cyan-500/15 border-cyan-500/60 text-cyan-300 font-bold'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Operator Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Operator Notes / Reference Standard (Optional)
              </label>
              <textarea
                rows={3}
                value={formData.operator_notes}
                onChange={(e) => setFormData({ ...formData, operator_notes: e.target.value })}
                placeholder="Mention expected baseline dimensions, standard tolerances (e.g. IPC-A-610 Class 3), or known visual areas of concern..."
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!formData.image_data_url || !formData.title.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm shadow-xl shadow-cyan-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>Execute AI Visual Inspection</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="mt-2 text-center text-[11px] text-slate-500">
              Evaluates visual anomalies, scores optical health, and logs multi-tenant record to database.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}

