'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Target,
  Search,
  Plus,
  Filter,
  Kanban,
  Building,
  User,
  Trash2,
  Edit,
  DollarSign,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Toast } from '@/components/ui/Toast';
import { formatCurrency, formatDate, getStatusBadgeClass } from '@/lib/utils';

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [ownerFilter, setOwnerFilter] = useState('ALL');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [oppToDelete, setOppToDelete] = useState<any>(null);

  const initialForm = {
    title: '',
    companyId: '',
    contactId: '',
    amount: 3500000,
    probability: 60,
    stage: 'NEW',
    expectedCloseDate: '',
    ownerId: '',
    description: '',
  };

  const [formData, setFormData] = useState(initialForm);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    show: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    fetchOpportunities();
  }, [search, stageFilter, ownerFilter]);

  const fetchOpportunities = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (stageFilter !== 'ALL') params.set('stage', stageFilter);
      if (ownerFilter !== 'ALL') params.set('ownerId', ownerFilter);

      const res = await fetch(`/api/opportunities?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setOpportunities(json.opportunities || []);
        setCompanies(json.companies || []);
        setUsers(json.users || []);
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
      const url = editingId ? `/api/opportunities/${editingId}` : '/api/opportunities';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to save opportunity');

      setToast({
        show: true,
        message: editingId ? 'Opportunity updated' : 'Opportunity created',
        type: 'success',
      });

      setShowModal(false);
      setEditingId(null);
      setFormData(initialForm);
      fetchOpportunities();
    } catch (err: any) {
      setToast({ show: true, message: err.message || 'Error occurred', type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!oppToDelete) return;
    try {
      const res = await fetch(`/api/opportunities/${oppToDelete.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setToast({ show: true, message: 'Opportunity deleted', type: 'success' });
      setOppToDelete(null);
      fetchOpportunities();
    } catch (err: any) {
      setToast({ show: true, message: err.message, type: 'error' });
    }
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
            <Target className="w-5 h-5 text-blue-400" />
            <span>Opportunities Directory</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Tabular view of all industrial sales opportunities and contract valuations
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Link
            href="/pipeline"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all"
          >
            <Kanban className="w-3.5 h-3.5 text-blue-400" />
            <span>Kanban View</span>
          </Link>

          <button
            onClick={() => {
              setEditingId(null);
              setFormData(initialForm);
              setShowModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-lg shadow-blue-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Opportunity</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search deals, accounts..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="ALL">All Stages</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="PROPOSAL">Proposal</option>
            <option value="NEGOTIATION">Negotiation</option>
            <option value="WON">Won</option>
            <option value="LOST">Lost</option>
          </select>

          <select
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="ALL">All Representatives</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400">Loading opportunities...</p>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="py-20 text-center text-slate-500 text-xs">No opportunities found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Opportunity Title</th>
                  <th className="py-3 px-3">Company Account</th>
                  <th className="py-3 px-3">Valuation (₹)</th>
                  <th className="py-3 px-3">Probability</th>
                  <th className="py-3 px-3">Stage</th>
                  <th className="py-3 px-3">Close Date</th>
                  <th className="py-3 px-3">Owner</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {opportunities.map((opp) => (
                  <tr key={opp.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white max-w-[220px] truncate">
                      {opp.title}
                    </td>
                    <td className="py-3.5 px-3 text-slate-300 max-w-[180px] truncate">
                      {opp.company?.name}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-emerald-400">
                      {formatCurrency(opp.amount)}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-300">
                      {opp.probability}%
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${getStatusBadgeClass(opp.stage)}`}>
                        {opp.stage}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-400">
                      {formatDate(opp.expectedCloseDate)}
                    </td>
                    <td className="py-3.5 px-3 text-slate-300">
                      {opp.owner?.name || 'Unassigned'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => {
                            setEditingId(opp.id);
                            setFormData({
                              title: opp.title,
                              companyId: opp.companyId,
                              contactId: opp.contactId || '',
                              amount: opp.amount,
                              probability: opp.probability,
                              stage: opp.stage,
                              expectedCloseDate: opp.expectedCloseDate || '',
                              ownerId: opp.ownerId || '',
                              description: opp.description || '',
                            });
                            setShowModal(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setOppToDelete(opp)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Edit Opportunity' : 'New Opportunity'}
        subtitle="Manage deal details and pipeline progression"
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Opportunity Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Company Account *</label>
            <select
              required
              value={formData.companyId}
              onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="">Select Company Account</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Valuation (₹ INR)</label>
              <input
                type="number"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Probability (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={formData.probability}
                onChange={(e) => setFormData({ ...formData, probability: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Stage</label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="NEW">NEW</option>
                <option value="CONTACTED">CONTACTED</option>
                <option value="QUALIFIED">QUALIFIED</option>
                <option value="PROPOSAL">PROPOSAL</option>
                <option value="NEGOTIATION">NEGOTIATION</option>
                <option value="WON">WON</option>
                <option value="LOST">LOST</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Close Date</label>
              <input
                type="date"
                value={formData.expectedCloseDate}
                onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
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
              {editingId ? 'Update Deal' : 'Save Deal'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(oppToDelete)}
        onClose={() => setOppToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Opportunity"
        message={`Are you sure you want to delete "${oppToDelete?.title}"?`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
