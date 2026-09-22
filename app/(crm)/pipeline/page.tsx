'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Kanban,
  Plus,
  DollarSign,
  TrendingUp,
  Building,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Award,
  AlertCircle,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';
import { formatCurrency, formatDate, getStatusBadgeClass } from '@/lib/utils';

const STAGES = [
  { key: 'NEW', label: 'New Deals', color: 'border-blue-500/30 text-blue-400 bg-blue-500/10' },
  { key: 'CONTACTED', label: 'Contacted', color: 'border-purple-500/30 text-purple-400 bg-purple-500/10' },
  { key: 'QUALIFIED', label: 'Qualified', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' },
  { key: 'PROPOSAL', label: 'Proposal Sent', color: 'border-amber-500/30 text-amber-400 bg-amber-500/10' },
  { key: 'NEGOTIATION', label: 'Negotiation', color: 'border-orange-500/30 text-orange-400 bg-orange-500/10' },
  { key: 'WON', label: 'Closed Won', color: 'border-green-500/30 text-green-400 bg-green-500/10' },
  { key: 'LOST', label: 'Closed Lost', color: 'border-rose-500/30 text-rose-400 bg-rose-500/10' },
];

export default function PipelinePage() {
  const [columns, setColumns] = useState<any>({});
  const [totalPipelineValue, setTotalPipelineValue] = useState(0);
  const [totalOpportunities, setTotalOpportunities] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [companies, setCompanies] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [ownerFilter, setOwnerFilter] = useState('ALL');

  // New Deal Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    companyId: '',
    amount: 3000000,
    probability: 60,
    stage: 'NEW',
    expectedCloseDate: '',
    ownerId: '',
    description: '',
  });

  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    show: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    fetchPipeline();
    fetchMetadata();
  }, [ownerFilter]);

  const fetchPipeline = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (ownerFilter !== 'ALL') params.set('ownerId', ownerFilter);

      const res = await fetch(`/api/pipeline?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setColumns(json.columns || {});
        setTotalPipelineValue(json.totalPipelineValue || 0);
        setTotalOpportunities(json.totalOpportunities || 0);
      }
    } catch (err) {
      console.error('Error fetching pipeline:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [compRes, userRes] = await Promise.all([
        fetch('/api/companies'),
        fetch('/api/users'),
      ]);
      if (compRes.ok) {
        const json = await compRes.json();
        setCompanies(json.companies || []);
      }
      if (userRes.ok) {
        const json = await userRes.json();
        setUsers(json.users || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStageMove = async (opportunityId: string, currentStage: string, direction: 'prev' | 'next') => {
    const stageKeys = STAGES.map((s) => s.key);
    const currentIndex = stageKeys.indexOf(currentStage);
    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    if (nextIndex < 0 || nextIndex >= stageKeys.length) return;
    const newStage = stageKeys[nextIndex];

    try {
      const res = await fetch('/api/pipeline', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunityId, newStage }),
      });

      if (res.ok) {
        setToast({ show: true, message: `Deal moved to ${newStage}`, type: 'success' });
        fetchPipeline();
      }
    } catch (err) {
      setToast({ show: true, message: 'Failed to update deal stage', type: 'error' });
    }
  };

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create opportunity');

      setToast({ show: true, message: 'Opportunity created successfully', type: 'success' });
      setShowCreateModal(false);
      setFormData({
        title: '',
        companyId: '',
        amount: 3000000,
        probability: 60,
        stage: 'NEW',
        expectedCloseDate: '',
        ownerId: '',
        description: '',
      });
      fetchPipeline();
    } catch (err: any) {
      setToast({ show: true, message: err.message || 'Error creating deal', type: 'error' });
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

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Kanban className="w-5 h-5 text-blue-400" />
            <span>Manufacturing Opportunity Pipeline</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Active deal progression, contract valuations, and stage conversion funnel
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Owner Filter */}
          <select
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="ALL">All Sales Representatives</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-lg shadow-blue-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Opportunity</span>
          </button>
        </div>
      </div>

      {/* Total Summary Strip */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-6">
          <div>
            <span className="text-[11px] font-semibold text-slate-400">Total Active Pipeline</span>
            <h3 className="text-lg font-bold text-white font-mono">{formatCurrency(totalPipelineValue)}</h3>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <span className="text-[11px] font-semibold text-slate-400">Total Deal Volume</span>
            <h3 className="text-lg font-bold text-blue-400">{totalOpportunities} Deals</h3>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/opportunities"
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1"
          >
            <span>Switch to Table View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Kanban Board Container */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading pipeline columns...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-3.5 overflow-x-auto pb-4">
          {STAGES.map((stageObj, idx) => {
            const col = columns[stageObj.key] || { items: [], totalValue: 0, count: 0 };
            return (
              <div
                key={stageObj.key}
                className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 flex flex-col min-w-[240px] max-w-[320px] shrink-0"
              >
                {/* Column Header */}
                <div className="pb-3 mb-3 border-b border-slate-800/80 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${stageObj.color}`}>
                        {col.count}
                      </span>
                      <h3 className="text-xs font-bold text-white tracking-wide">{stageObj.label}</h3>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">
                      {formatCurrency(col.totalValue)}
                    </p>
                  </div>
                </div>

                {/* Deal Cards Container */}
                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[65vh] pr-1">
                  {col.items.length === 0 ? (
                    <div className="py-8 text-center border border-dashed border-slate-800/80 rounded-xl text-slate-600 text-[11px]">
                      No deals
                    </div>
                  ) : (
                    col.items.map((opp: any) => (
                      <div
                        key={opp.id}
                        className="bg-slate-950 border border-slate-800/90 hover:border-blue-500/40 rounded-xl p-3 shadow-md space-y-2.5 transition-all group"
                      >
                        {/* Company & Valuation */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-blue-400 truncate max-w-[130px]">
                              {opp.company?.name}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-300">
                              {opp.probability}% Prob
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">
                            {opp.title}
                          </h4>
                          <p className="text-xs font-bold text-emerald-400 font-mono mt-1">
                            {formatCurrency(opp.amount)}
                          </p>
                        </div>

                        {/* Owner & Close Date */}
                        <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-400">
                          <span className="truncate max-w-[100px]">{opp.owner?.name || 'Unassigned'}</span>
                          {opp.expectedCloseDate && (
                            <span className="font-mono">{formatDate(opp.expectedCloseDate)}</span>
                          )}
                        </div>

                        {/* Stage Mover Controls */}
                        <div className="pt-1.5 flex items-center justify-between border-t border-slate-900/60">
                          <button
                            disabled={idx === 0}
                            onClick={() => handleStageMove(opp.id, stageObj.key, 'prev')}
                            className="p-1 text-slate-400 hover:text-white disabled:opacity-20 disabled:hover:text-slate-400 rounded hover:bg-slate-800 transition-colors"
                            title="Move back"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[9px] text-slate-400 font-mono">Stage {idx + 1}/7</span>
                          <button
                            disabled={idx === STAGES.length - 1}
                            onClick={() => handleStageMove(opp.id, stageObj.key, 'next')}
                            className="p-1 text-slate-400 hover:text-white disabled:opacity-20 disabled:hover:text-slate-400 rounded hover:bg-slate-800 transition-colors"
                            title="Advance stage"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE OPPORTUNITY MODAL */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Opportunity Deal"
        subtitle="Add a high-value manufacturing contract to the active pipeline"
        maxWidth="md"
      >
        <form onSubmit={handleCreateOpportunity} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Opportunity Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Enterprise SCADA Integration Suite"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Target Account / Company *</label>
            <select
              required
              value={formData.companyId}
              onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
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
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Deal Valuation (₹ INR) *</label>
              <input
                type="number"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Win Probability (%)</label>
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
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Initial Stage</label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              >
                {STAGES.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Target Close Date</label>
              <input
                type="date"
                value={formData.expectedCloseDate}
                onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Deal Owner / Rep</label>
            <select
              value={formData.ownerId}
              onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="">Auto-assign current user</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2 rounded-xl text-xs shadow-lg shadow-blue-600/25"
            >
              Create Opportunity
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
