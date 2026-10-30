import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import {
  ClipboardList, Search, Filter, Camera, ArrowRight,
  MapPin, Loader2, Calendar, ShieldAlert
} from 'lucide-react';

export default function InspectionsHistoryPage() {
  const [inspections, setInspections] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    domain_category: 'ALL',
    severity_level: 'ALL',
    site_id: 'ALL',
    search: ''
  });

  const domains = [
    { code: 'ALL', label: 'All Domains' },
    { code: 'MANUFACTURING_QC', label: 'Manufacturing & PCB' },
    { code: 'INFRASTRUCTURE_SAFETY', label: 'Infrastructure & Safety' },
    { code: 'WORKPLACE_HSE', label: 'Workplace Safety (HSE)' },
    { code: 'DOCUMENT_OCR_AUDIT', label: 'Scanned Document OCR' },
    { code: 'RETAIL_INVENTORY', label: 'Retail Inventory' }
  ];

  const severities = ['ALL', 'Critical', 'High', 'Medium', 'Low', 'None'];

  useEffect(() => {
    fetchSites();
  }, []);

  useEffect(() => {
    fetchInspections();
  }, [filters]);

  const fetchSites = async () => {
    try {
      const res = await axiosClient.get('/sites');
      setSites(res.data.sites || []);
    } catch (err) {
      console.error('Error fetching sites', err);
    }
  };

  const fetchInspections = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.domain_category !== 'ALL') params.domain_category = filters.domain_category;
      if (filters.severity_level !== 'ALL') params.severity_level = filters.severity_level;
      if (filters.site_id !== 'ALL') params.site_id = filters.site_id;
      if (filters.search.trim()) params.search = filters.search.trim();

      const res = await axiosClient.get('/inspections', { params });
      setInspections(res.data.inspections || []);
    } catch (err) {
      console.error('Error fetching inspections', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <ClipboardList className="w-6 h-6 text-cyan-400" />
            <span>Inspection Audit Log</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Historical multimodal inspection records, health scores, and anomaly telemetry
          </p>
        </div>

        <Link
          to="/inspect"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all self-start sm:self-auto"
        >
          <Camera className="w-4 h-4" />
          <span>New Inspection</span>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Search by title or summary..."
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Domain Category Filter */}
        <div>
          <select
            value={filters.domain_category}
            onChange={(e) => setFilters({ ...filters, domain_category: e.target.value })}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            {domains.map((d) => (
              <option key={d.code} value={d.code}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        {/* Severity Level Filter */}
        <div>
          <select
            value={filters.severity_level}
            onChange={(e) => setFilters({ ...filters, severity_level: e.target.value })}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            {severities.map((s) => (
              <option key={s} value={s}>
                {s === 'ALL' ? 'All Severities' : `${s} Severity`}
              </option>
            ))}
          </select>
        </div>

        {/* Site Filter */}
        <div>
          <select
            value={filters.site_id}
            onChange={(e) => setFilters({ ...filters, site_id: e.target.value })}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Registered Sites</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Inspections List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
          <p className="text-xs">Querying historical database records...</p>
        </div>
      ) : inspections.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-12 text-center text-slate-400">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <h3 className="text-sm font-bold text-white">No Inspections Match Your Criteria</h3>
          <p className="text-xs mt-1 max-w-sm mx-auto text-slate-400">
            Try adjusting your search terms or filters, or execute a new visual inspection in the studio.
          </p>
          <Link
            to="/inspect"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold hover:bg-cyan-500/30"
          >
            <Camera className="w-4 h-4" />
            <span>Launch Inspection Studio</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {inspections.map((insp) => (
            <div
              key={insp.id}
              className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 md:p-5 backdrop-blur-md shadow-md hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-mono">
                    {insp.domain_category}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    insp.severity_level === 'Critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                    insp.severity_level === 'High' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' :
                    insp.severity_level === 'Medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                    'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  }`}>
                    {insp.severity_level}
                  </span>
                  <span className="text-slate-500 text-xs">•</span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>{new Date(insp.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <h3 className="text-sm md:text-base font-bold text-white tracking-tight truncate">
                  {insp.title}
                </h3>

                <p className="mt-1 text-xs text-slate-300 line-clamp-1">
                  {insp.ai_summary}
                </p>

                <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>{insp.site_name || 'Ad-Hoc'}</span>
                  </span>
                  <span>•</span>
                  <span className="font-mono text-cyan-300">
                    {insp.anomaly_count || 0} defects detected
                  </span>
                </div>
              </div>

              {/* Right Score & CTA */}
              <div className="flex items-center justify-between md:justify-end gap-5 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Health Score</span>
                  <span className={`text-lg font-black ${
                    insp.visual_health_score >= 85 ? 'text-emerald-400' :
                    insp.visual_health_score >= 70 ? 'text-amber-400' :
                    'text-rose-400'
                  }`}>
                    {insp.visual_health_score}/100
                  </span>
                </div>

                <Link
                  to={`/inspections/${insp.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white text-xs font-bold transition-colors border border-slate-700"
                >
                  <span>Review Report</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

