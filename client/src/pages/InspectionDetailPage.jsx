import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import AnomalyCard from '../components/AnomalyCard';
import HealthGauge from '../components/HealthGauge';
import FollowUpChatModal from '../components/FollowUpChatModal';
import {
  ArrowLeft, MessageSquare, AlertTriangle, CheckCircle2,
  MapPin, Calendar, FileText, ShieldAlert, Sparkles,
  Layers, Download, Maximize2, Loader2, Info
} from 'lucide-react';

export default function InspectionDetailPage() {
  const { id } = useParams();
  const [inspection, setInspection] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('anomalies'); // 'anomalies' | 'ocr' | 'recommendations'
  const [imageZoomed, setImageZoomed] = useState(false);

  useEffect(() => {
    fetchInspectionDetails();
  }, [id]);

  const fetchInspectionDetails = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/inspections/${id}`);
      setInspection(res.data.inspection);
      setAnomalies(res.data.inspection.anomalies || []);
    } catch (err) {
      console.error('Error fetching inspection report:', err);
      setError('Inspection report could not be found or access is restricted.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnomalyStatusChange = (anomalyId, newStatus) => {
    setAnomalies((prev) =>
      prev.map((a) => (a.id === anomalyId ? { ...a, remediation_status: newStatus } : a))
    );
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-3" />
        <p className="text-sm font-semibold">Loading inspection telemetry & optical data...</p>
      </div>
    );
  }

  if (error || !inspection) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-8 text-center text-rose-300">
        <AlertTriangle className="w-10 h-10 mx-auto mb-2 text-rose-400" />
        <h3 className="text-base font-bold text-white">Inspection Report Unavailable</h3>
        <p className="text-xs mt-1 text-rose-300">{error || 'Record does not exist.'}</p>
        <Link
          to="/inspections"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 text-xs text-white font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Audit History</span>
        </Link>
      </div>
    );
  }

  const overallStatusStyles = {
    Pass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
    Warning: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    'Action Required': 'bg-rose-500/15 text-rose-300 border-rose-500/40'
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <Link
          to="/inspections"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Audit Log</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setChatModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Ask Operations Assistant</span>
          </button>
        </div>
      </div>

      {/* Main Report Header Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 md:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-mono">
                {inspection.domain_category}
              </span>

              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${overallStatusStyles[inspection.overall_status] || overallStatusStyles.Pass}`}>
                {inspection.overall_status}
              </span>

              <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Mode: {inspection.analysis_mode}
              </span>
            </div>

            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
              {inspection.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-300">{inspection.site_name || 'Ad-Hoc Facility'}</span>
                {inspection.site_location && (
                  <span className="text-slate-500">({inspection.site_location})</span>
                )}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{new Date(inspection.created_at).toLocaleString()}</span>
              </span>
            </div>
          </div>

          {/* Health Gauge Component */}
          <div className="flex items-center gap-6 self-start lg:self-auto border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-800">
            <HealthGauge score={inspection.visual_health_score} size={110} strokeWidth={9} />
          </div>
        </div>

        {/* Executive Summary Callout */}
        <div className="mt-6 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 mb-1.5 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI Executive Analysis Summary</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-200">
            {inspection.ai_summary}
          </p>
          {inspection.operator_notes && (
            <div className="mt-2 text-[11px] text-slate-400 border-t border-slate-800/60 pt-2 font-mono">
              <span className="text-slate-500">Operator Reference:</span> {inspection.operator_notes}
            </div>
          )}
        </div>
      </div>

      {/* Split Pane: Visual Asset Viewer (Left) & Anomaly Workspace (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Pane: High-Resolution Visual Viewer (5 Cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur-md sticky top-6 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Inspection Asset</span>
            </span>
            <button
              onClick={() => setImageZoomed(!imageZoomed)}
              className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{imageZoomed ? 'Shrink' : 'Expand'}</span>
            </button>
          </div>

          <div className="relative rounded-xl overflow-hidden bg-black/80 border border-slate-800 flex items-center justify-center p-1">
            <img
              src={inspection.image_data_url}
              alt={inspection.title}
              className={`w-full object-contain rounded-lg transition-all duration-300 ${
                imageZoomed ? 'max-h-[600px] cursor-zoom-out' : 'max-h-[420px] cursor-zoom-in'
              }`}
              onClick={() => setImageZoomed(!imageZoomed)}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>Visual Evidence Asset</span>
            <span className="font-mono text-cyan-400">{anomalies.length} regions evaluated</span>
          </div>
        </div>

        {/* Right Pane: Multi-Tab Findings Workspace (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Workspace Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab('anomalies')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'anomalies'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Detected Anomalies ({anomalies.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('ocr')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'ocr'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Extracted OCR</span>
            </button>

            <button
              onClick={() => setActiveTab('recommendations')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'recommendations'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Remediation Roadmap</span>
            </button>
          </div>

          {/* TAB 1: ANOMALIES LIST */}
          {activeTab === 'anomalies' && (
            <div className="space-y-4">
              {anomalies.length === 0 ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center text-emerald-300">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
                  <h4 className="text-sm font-bold text-white">Zero Anomalies Detected</h4>
                  <p className="text-xs mt-1 text-emerald-300">
                    The visual asset passed all optical parameters without significant defect or non-compliance.
                  </p>
                </div>
              ) : (
                anomalies.map((anomaly) => (
                  <AnomalyCard
                    key={anomaly.id}
                    anomaly={anomaly}
                    onStatusChange={handleAnomalyStatusChange}
                  />
                ))
              )}
            </div>
          )}

          {/* TAB 2: OCR TEXT READOUT */}
          {activeTab === 'ocr' && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Optical Character Recognition (OCR) Telemetry
                </span>
                <span className="text-[11px] font-mono text-cyan-400">Gemini 2.5 Flash OCR</span>
              </div>

              {inspection.extracted_text_ocr ? (
                <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                  {inspection.extracted_text_ocr}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No text, serial numbers, or barcodes were recognized in this visual frame.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: OPERATIONAL RECOMMENDATIONS & COMPLIANCE */}
          {activeTab === 'recommendations' && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-md space-y-4">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                  Prioritized Operational Recommendations
                </h4>
                {inspection.operational_recommendations && inspection.operational_recommendations.length > 0 ? (
                  <ul className="space-y-2">
                    {inspection.operational_recommendations.map((rec, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80"
                      >
                        <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                          {idx + 1}
                        </span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400">No special operational steps mandated.</p>
                )}
              </div>

              {/* Compliance Disclaimer */}
              {inspection.compliance_disclaimer && (
                <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                  <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-300 font-bold block mb-0.5">Verification Disclaimer</span>
                    <span>{inspection.compliance_disclaimer}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Operations Assistant Chat Modal */}
      <FollowUpChatModal
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        inspection={inspection}
        anomalies={anomalies}
      />
    </div>
  );
}

