'use client';

import React, { useEffect, useState } from 'react';
import {
  CalendarCheck,
  Search,
  Plus,
  Phone,
  Video,
  Mail,
  FileText,
  Clock,
  Building,
  User,
  Trash2,
  Filter,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('ALL');

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'MEETING',
    subject: '',
    description: '',
    companyId: '',
    leadId: '',
    opportunityId: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    show: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    fetchActivities();
  }, [typeFilter]);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (typeFilter !== 'ALL') params.set('type', typeFilter);

      const res = await fetch(`/api/activities?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setActivities(json.activities || []);
        setLeads(json.leads || []);
        setCompanies(json.companies || []);
        setOpportunities(json.opportunities || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to log activity');

      setToast({ show: true, message: 'Activity logged successfully', type: 'success' });
      setShowModal(false);
      setFormData({
        type: 'MEETING',
        subject: '',
        description: '',
        companyId: '',
        leadId: '',
        opportunityId: '',
        date: new Date().toISOString().split('T')[0],
      });
      fetchActivities();
    } catch (err: any) {
      setToast({ show: true, message: err.message, type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/activities/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setToast({ show: true, message: 'Activity deleted', type: 'success' });
      fetchActivities();
    } catch (err: any) {
      setToast({ show: true, message: err.message, type: 'error' });
    }
  };

  const activityIcons: Record<string, any> = {
    CALL: Phone,
    MEETING: Video,
    EMAIL: Mail,
    DEMO: Video,
    PROPOSAL: FileText,
    NOTE: FileText,
  };

  return (
    <div className="space-y-6">
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <CalendarCheck className="w-5 h-5 text-blue-400" />
            <span>Activity Timeline & Client Engagement</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit of all sales meetings, discovery workshops, proposal deliveries, and calls
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-lg shadow-blue-600/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Log Activity</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'MEETING', 'CALL', 'DEMO', 'PROPOSAL', 'EMAIL', 'NOTE'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                typeFilter === t
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400 font-medium">Total: {activities.length} Entries</span>
      </div>

      {/* Activity Timeline Stream */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading activity timeline...</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="py-20 text-center text-slate-500 text-xs">No activities found for this filter.</div>
      ) : (
        <div className="space-y-4">
          {activities.map((act) => {
            const Icon = activityIcons[act.type] || FileText;
            return (
              <div
                key={act.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-blue-400 font-mono">
                          {act.type}
                        </span>
                        <h3 className="text-xs font-bold text-white">{act.subject}</h3>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-2">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(act.date)}</span>
                        <span>•</span>
                        <span className="text-slate-300">Logged by {act.user?.name || 'System Rep'}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(act.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {act.description && (
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    {act.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-slate-400 border-t border-slate-800/80">
                  {act.company && (
                    <span className="flex items-center space-x-1">
                      <Building className="w-3 h-3 text-blue-400" />
                      <span>{act.company.name}</span>
                    </span>
                  )}
                  {act.lead && (
                    <span className="flex items-center space-x-1">
                      <FileText className="w-3 h-3 text-emerald-400" />
                      <span>Dossier: {act.lead.companyName}</span>
                    </span>
                  )}
                  {act.opportunity && (
                    <span className="flex items-center space-x-1">
                      <CalendarCheck className="w-3 h-3 text-amber-400" />
                      <span>Deal: {act.opportunity.title}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Log Engagement Activity"
        subtitle="Record meeting minutes, client calls, or sales notes"
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="MEETING">Meeting</option>
                <option value="CALL">Call</option>
                <option value="DEMO">Demo</option>
                <option value="PROPOSAL">Proposal</option>
                <option value="EMAIL">Email</option>
                <option value="NOTE">Internal Note</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Subject / Summary *</label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g., Solution Architecture Workshop"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Related Company</label>
            <select
              value={formData.companyId}
              onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="">Select Company (Optional)</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Detailed Minutes & Notes</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none resize-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2 rounded-xl text-xs"
            >
              Save Activity
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
