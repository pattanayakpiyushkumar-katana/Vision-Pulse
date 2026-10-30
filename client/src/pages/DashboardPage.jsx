import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import StatCard from '../components/StatCard';
import HealthGauge from '../components/HealthGauge';
import {
  Camera, ShieldAlert, CheckCircle, Clock, MapPin,
  ArrowRight, Activity, AlertTriangle, Layers, Sparkles
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/dashboard/stats');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard statistics', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = data?.stats || {
    total_inspections: 0,
    total_sites: 0,
    average_health_score: 100,
    critical_alerts: 0,
    pending_remediations: 0,
    in_progress_remediations: 0,
    resolved_remediations: 0
  };

  const severityCounts = data?.severity_breakdown || {
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0,
    None: 0
  };

  const recentInspections = data?.recent_inspections || [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950 p-6 md:p-8 border border-slate-800 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>VisionPulse Multimodal Intelligence Active</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.full_name || 'Inspector'}
            </h1>
            <p className="mt-1 text-xs md:text-sm text-slate-400">
              Operations Center • <span className="text-slate-300 font-medium">{user?.organization || 'Default Facility'}</span> ({user?.role || 'Visual Inspector'})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/inspect"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-cyan-500/25 transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>Launch Studio</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Inspections"
          value={stats.total_inspections}
          subtitle="All visual audits across domains"
          icon={Camera}
          color="blue"
        />
        <StatCard
          title="Active Sites"
          value={stats.total_sites}
          subtitle="Registered facilities & zones"
          icon={MapPin}
          color="cyan"
        />
        <StatCard
          title="Critical Anomalies"
          value={stats.critical_alerts}
          subtitle="Urgent action required"
          icon={ShieldAlert}
          color="rose"
        />
        <StatCard
          title="Pending Actions"
          value={stats.pending_remediations}
          subtitle={`${stats.resolved_remediations} anomalies resolved`}
          icon={Clock}
          color="amber"
        />
      </div>

      {/* Health Score Gauge & Severity Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Health Gauge Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 flex flex-col items-center justify-between text-center backdrop-blur-md">
          <div className="w-full text-left border-b border-slate-800/80 pb-3 mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Fleet Visual Health</h3>
            <p className="text-xs text-slate-400">Average optical score across historical inspections</p>
          </div>

          <div className="py-2">
            <HealthGauge score={stats.average_health_score} size={150} strokeWidth={12} />
          </div>

          <div className="w-full mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-3 text-center text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Resolved</span>
              <span className="font-extrabold text-emerald-400 text-sm">{stats.resolved_remediations}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">In Progress</span>
              <span className="font-extrabold text-blue-400 text-sm">{stats.in_progress_remediations}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Pending</span>
              <span className="font-extrabold text-amber-400 text-sm">{stats.pending_remediations}</span>
            </div>
          </div>
        </div>

        {/* Severity Distribution Card */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md flex flex-col justify-between">
          <div className="border-b border-slate-800/80 pb-3 mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Anomaly Severity Breakdown</h3>
            <p className="text-xs text-slate-400">Distribution of defects by risk classification</p>
          </div>

          <div className="space-y-3.5">
            {[
              { label: 'Critical Risk', count: severityCounts.Critical, color: 'bg-rose-500', barColor: 'from-rose-500 to-red-600' },
              { label: 'High Priority', count: severityCounts.High, color: 'bg-orange-500', barColor: 'from-orange-500 to-amber-600' },
              { label: 'Medium Concern', count: severityCounts.Medium, color: 'bg-amber-500', barColor: 'from-amber-500 to-yellow-600' },
              { label: 'Low Severity', count: severityCounts.Low, color: 'bg-cyan-500', barColor: 'from-cyan-500 to-blue-600' },
              { label: 'Compliant / Pass', count: severityCounts.None, color: 'bg-emerald-500', barColor: 'from-emerald-500 to-teal-600' }
            ].map((item) => {
              const total = stats.total_inspections || 1;
              const percent = Math.round((item.count / total) * 100);
              return (
                <div key={item.label}>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-semibold text-slate-300">{item.label}</span>
                    <span className="font-mono text-slate-400">{item.count} items ({percent}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${item.barColor} transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Powered by official Gemini 2.5 Flash Vision engine</span>
            <Link to="/inspections" className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold">
              <span>View Audit Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Inspections Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Visual Audits</h3>
            <p className="text-xs text-slate-400">Latest completed visual inspections and anomaly status</p>
          </div>
          <Link
            to="/inspections"
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
          >
            <span>All Inspections ({stats.total_inspections})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentInspections.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <Camera className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No visual inspections recorded yet.</p>
            <p className="text-xs mt-1">Capture a live frame or load a benchmark sample to run your first inspection.</p>
            <Link
              to="/inspect"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold hover:bg-cyan-500/30"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Start Visual Inspection</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Inspection Title</th>
                  <th className="py-3 px-4">Domain Category</th>
                  <th className="py-3 px-4">Site / Zone</th>
                  <th className="py-3 px-4">Health Score</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Anomalies</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {recentInspections.map((insp) => (
                  <tr key={insp.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white max-w-xs truncate">
                      {insp.title}
                    </td>
                    <td className="py-3 px-4 font-mono text-cyan-400">
                      {insp.domain_category}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {insp.site_name || 'Ad-Hoc'}
                    </td>
                    <td className="py-3 px-4 font-bold">
                      <span className={`px-2 py-0.5 rounded ${
                        insp.visual_health_score >= 85 ? 'bg-emerald-500/10 text-emerald-400' :
                        insp.visual_health_score >= 70 ? 'bg-amber-500/10 text-amber-400' :
                        'bg-rose-500/10 text-rose-400'
                      }`}>
                        {insp.visual_health_score}/100
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        insp.severity_level === 'Critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                        insp.severity_level === 'High' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' :
                        insp.severity_level === 'Medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                        'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      }`}>
                        {insp.severity_level}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {insp.anomaly_count || 0} defects
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/inspections/${insp.id}`}
                        className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold"
                      >
                        <span>View Report</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

