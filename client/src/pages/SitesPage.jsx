import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import {
  MapPin, Plus, Trash2, Camera, ExternalLink,
  ShieldCheck, Loader2, X, AlertCircle
} from 'lucide-react';

export default function SitesPage() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    domain_category: 'MANUFACTURING_QC',
    camera_or_source_type: 'Static Upload / Live Feed',
    status: 'Active'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const domains = [
    { code: 'MANUFACTURING_QC', label: 'Manufacturing & PCB Defect QC' },
    { code: 'INFRASTRUCTURE_SAFETY', label: 'Infrastructure & Structural Inspection' },
    { code: 'WORKPLACE_HSE', label: 'Workplace Safety & PPE Compliance' },
    { code: 'DOCUMENT_OCR_AUDIT', label: 'Scanned Document & Invoice Intelligence' },
    { code: 'RETAIL_INVENTORY', label: 'Retail Shelf & Warehouse Inventory' }
  ];

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/sites');
      setSites(res.data.sites || []);
    } catch (err) {
      console.error('Error fetching sites:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSite = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await axiosClient.post('/sites', formData);
      setSites([res.data.site, ...sites]);
      setModalOpen(false);
      setFormData({
        name: '',
        location: '',
        domain_category: 'MANUFACTURING_QC',
        camera_or_source_type: 'Static Upload / Live Feed',
        status: 'Active'
      });
    } catch (err) {
      console.error('Create site error:', err);
      const msg = err.response?.data?.error || err.response?.data?.details?.[0]?.message || 'Failed to register site.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSite = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove the inspection site "${name}"?`)) {
      return;
    }
    try {
      await axiosClient.delete(`/sites/${id}`);
      setSites(sites.filter(s => s.id !== id));
    } catch (err) {
      console.error('Delete site error:', err);
      alert('Failed to delete inspection site.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <MapPin className="w-6 h-6 text-cyan-400" />
            <span>Inspection Sites & Facilities</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Configure target industrial zones, camera stream sources, and workspace environments
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Site</span>
        </button>
      </div>

      {/* Sites Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
          <p className="text-xs">Loading inspection sites...</p>
        </div>
      ) : sites.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-12 text-center text-slate-400">
          <MapPin className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <h3 className="text-sm font-bold text-white">No Sites Registered Yet</h3>
          <p className="text-xs mt-1 max-w-sm mx-auto text-slate-400">
            Create your first inspection facility (e.g. SMT Assembly Line A, Bridge Sector B-7, Warehouse North).
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold hover:bg-cyan-500/30"
          >
            <Plus className="w-4 h-4" />
            <span>Register Site</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sites.map((site) => (
            <div
              key={site.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-md shadow-lg flex flex-col justify-between hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-mono">
                    {site.domain_category}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {site.status || 'Active'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white tracking-tight">{site.name}</h3>
                
                <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span className="truncate">{site.location}</span>
                </div>

                <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <Camera className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span className="truncate">{site.camera_or_source_type}</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <Link
                  to={`/inspect?site_id=${site.id}&domain=${site.domain_category}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Inspect Facility</span>
                </Link>

                <button
                  onClick={() => handleDeleteSite(site.id, site.name)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete Site"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Register Site Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-cyan-400" />
                <span>Register Inspection Site</span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateSite} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Site / Facility Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. SMT Line #4 Cleanroom"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Physical Location / Building
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Building 2, Floor 3, Bay 12"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Target Visual Domain
                </label>
                <select
                  value={formData.domain_category}
                  onChange={(e) => setFormData({ ...formData, domain_category: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  {domains.map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.label} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Camera Source Type
                  </label>
                  <input
                    type="text"
                    value={formData.camera_or_source_type}
                    onChange={(e) => setFormData({ ...formData, camera_or_source_type: e.target.value })}
                    placeholder="e.g. 4K Fixed Optical Feed"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Operating Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Standby">Standby</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold shadow-md shadow-cyan-500/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Site Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

