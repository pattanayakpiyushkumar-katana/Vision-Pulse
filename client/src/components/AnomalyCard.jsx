import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock, Wrench, MapPin, Sparkles, HelpCircle } from 'lucide-react';
import axiosClient from '../api/axiosClient';

export default function AnomalyCard({ anomaly, onStatusChange }) {
  const [currentStatus, setCurrentStatus] = useState(anomaly.remediation_status || 'Pending');
  const [updating, setUpdating] = useState(false);

  const severityStyles = {
    Critical: 'bg-rose-500/15 text-rose-400 border-rose-500/40 ring-1 ring-rose-500/30',
    High: 'bg-orange-500/15 text-orange-400 border-orange-500/40 ring-1 ring-orange-500/30',
    Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/40 ring-1 ring-amber-500/30',
    Low: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40 ring-1 ring-cyan-500/30',
    None: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 ring-1 ring-emerald-500/30'
  };

  const statusStyles = {
    Pending: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    'In Progress': 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    Resolved: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
  };

  const handleStatusUpdate = async (newStatus) => {
    if (newStatus === currentStatus || updating) return;
    setUpdating(true);
    const prev = currentStatus;
    setCurrentStatus(newStatus); // Optimistic UI update

    try {
      await axiosClient.patch(`/anomalies/${anomaly.id}/status`, {
        remediation_status: newStatus
      });
      if (onStatusChange) {
        onStatusChange(anomaly.id, newStatus);
      }
    } catch (err) {
      console.error('Failed to update status', err);
      setCurrentStatus(prev); // Revert on failure
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-700/70 bg-slate-800/60 p-5 backdrop-blur-md shadow-lg transition-all duration-200 hover:border-slate-600">
      {/* Top Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-700/50">
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${severityStyles[anomaly.severity] || severityStyles.Medium}`}>
              {anomaly.severity} Severity
            </span>
            <span className="text-xs font-medium text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded">
              {anomaly.category}
            </span>
          </div>
          <h4 className="mt-2 text-base font-bold text-white tracking-tight">{anomaly.label}</h4>
        </div>

        {/* Confidence pill */}
        <div className="flex flex-col items-end">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">AI Confidence</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                style={{ width: `${Math.min(100, Math.max(0, anomaly.confidence_score))}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400">
              {Number(anomaly.confidence_score).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Region Location */}
      <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-300 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700/50">
        <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
        <span className="text-slate-400">Spatial Region:</span>
        <span className="text-white font-mono">{anomaly.location_region}</span>
      </div>

      {/* Description */}
      <p className="mt-3 text-xs leading-relaxed text-slate-300">
        {anomaly.description}
      </p>

      {/* Root Cause & Recommended Action */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg bg-slate-900/70 p-3 border border-slate-800">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Root-Cause Hypothesis</span>
          </div>
          <p className="text-slate-300 leading-snug">{anomaly.root_cause_hypothesis}</p>
        </div>

        <div className="rounded-lg bg-slate-900/70 p-3 border border-slate-800">
          <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-1">
            <Wrench className="w-3.5 h-3.5" />
            <span>Recommended Remediation</span>
          </div>
          <p className="text-slate-300 leading-snug">{anomaly.recommended_action}</p>
        </div>
      </div>

      {/* Remediation Status Toggle Bar */}
      <div className="mt-4 pt-3 border-t border-slate-700/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Remediation Status:</span>
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusStyles[currentStatus]}`}>
            {currentStatus}
          </span>
        </div>

        {/* Interactive status buttons */}
        <div className="inline-flex rounded-lg bg-slate-900/90 p-1 border border-slate-700/80">
          <button
            type="button"
            disabled={updating}
            onClick={() => handleStatusUpdate('Pending')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              currentStatus === 'Pending'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pending
          </button>
          <button
            type="button"
            disabled={updating}
            onClick={() => handleStatusUpdate('In Progress')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              currentStatus === 'In Progress'
                ? 'bg-blue-500 text-white font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            In Progress
          </button>
          <button
            type="button"
            disabled={updating}
            onClick={() => handleStatusUpdate('Resolved')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              currentStatus === 'Resolved'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Resolved
          </button>
        </div>
      </div>
    </div>
  );
}

