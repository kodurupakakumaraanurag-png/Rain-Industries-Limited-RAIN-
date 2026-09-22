'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building,
  User,
  Phone,
  Mail,
  Globe,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  Target,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Activity,
  CheckSquare,
  Edit,
  Trash2,
  TrendingUp,
  Share2,
} from 'lucide-react';
import { formatCurrency, formatDate, getStatusBadgeClass, getPriorityBadgeClass, getScoreColorClass } from '@/lib/utils';
import { calculateTotalLeadScore, getScoringCategory } from '@/lib/lead-scoring';
import { Toast } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;

  const [lead, setLead] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingScore, setIsUpdatingScore] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showLogActivityModal, setShowLogActivityModal] = useState(false);

  // Scoring sliders state
  const [scores, setScores] = useState({
    digitalPresenceScore: 0,
    hiringActivityScore: 0,
    techStackFitScore: 0,
    fundingRevenueScore: 0,
    projectUrgencyScore: 0,
    budgetClarityScore: 0,
  });

  // Convert Form State
  const [convertForm, setConvertForm] = useState({
    title: '',
    amount: 4000000,
    probability: 70,
    stage: 'QUALIFIED',
    description: '',
  });

  // Activity Form State
  const [activityForm, setActivityForm] = useState({
    type: 'MEETING',
    subject: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    show: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    fetchLead();
  }, [leadId]);

  const fetchLead = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/leads/${leadId}`);
      if (!res.ok) throw new Error('Lead not found');
      const json = await res.json();
      setLead(json.lead);
      setScores({
        digitalPresenceScore: json.lead.digitalPresenceScore || 0,
        hiringActivityScore: json.lead.hiringActivityScore || 0,
        techStackFitScore: json.lead.techStackFitScore || 0,
        fundingRevenueScore: json.lead.fundingRevenueScore || 0,
        projectUrgencyScore: json.lead.projectUrgencyScore || 0,
        budgetClarityScore: json.lead.budgetClarityScore || 0,
      });
      setConvertForm((prev) => ({
        ...prev,
        title: `${json.lead.companyName} - Enterprise Modernization`,
        description: json.lead.projectRequirement || '',
      }));
    } catch (err: any) {
      console.error(err);
      setToast({ show: true, message: 'Failed to load lead', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleScoreChange = async (key: string, value: number) => {
    const updatedScores = { ...scores, [key]: value };
    setScores(updatedScores);
    setIsUpdatingScore(true);

    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedScores),
      });

      if (res.ok) {
        const json = await res.json();
        setLead((prev: any) => ({
          ...prev,
          ...updatedScores,
          totalLeadScore: json.lead.totalLeadScore,
        }));
      }
    } catch (err) {
      console.error('Error saving score:', err);
    } finally {
      setIsUpdatingScore(false);
    }
  };

  const handleConvertLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/leads/${leadId}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(convertForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to convert lead');

      setToast({ show: true, message: 'Lead converted to opportunity deal!', type: 'success' });
      setShowConvertModal(false);
      fetchLead();
    } catch (err: any) {
      setToast({ show: true, message: err.message || 'Conversion failed', type: 'error' });
    }
  };

  const handleLogActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...activityForm,
          leadId: lead.id,
          companyId: lead.companyId,
          contactId: lead.contactId,
        }),
      });

      if (!res.ok) throw new Error('Failed to log activity');

      setToast({ show: true, message: 'Activity logged successfully', type: 'success' });
      setShowLogActivityModal(false);
      setActivityForm({
        type: 'MEETING',
        subject: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
      fetchLead();
    } catch (err: any) {
      setToast({ show: true, message: err.message || 'Error logging activity', type: 'error' });
    }
  };

  const handleDeleteLead = async () => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete lead');
      router.push('/leads');
    } catch (err: any) {
      setToast({ show: true, message: err.message || 'Error deleting lead', type: 'error' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400">Loading strategic dossier...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Lead Dossier Not Found</h2>
        <Link
          href="/leads"
          className="inline-flex items-center space-x-2 text-xs bg-blue-600 px-4 py-2 rounded-xl text-white font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Leads</span>
        </Link>
      </div>
    );
  }

  const currentTotalScore = calculateTotalLeadScore(scores);
  const scoreCategory = getScoringCategory(currentTotalScore);
  const scoreColor = getScoreColorClass(currentTotalScore);

  return (
    <div className="space-y-6">
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />

      {/* Navigation & Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          href="/leads"
          className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Lead Dossiers</span>
        </Link>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setShowLogActivityModal(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5"
          >
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span>Log Engagement</span>
          </button>

          {!lead.converted && (
            <button
              onClick={() => setShowConvertModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-lg shadow-emerald-600/25"
            >
              <Target className="w-3.5 h-3.5" />
              <span>Convert to Opportunity</span>
            </button>
          )}

          <button
            onClick={() => setShowDeleteDialog(true)}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl"
            title="Delete Lead"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Enterprise Dossier Hero Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadgeClass(lead.pipelineStatus)}`}>
                {lead.pipelineStatus}
              </span>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getPriorityBadgeClass(lead.priorityLevel)}`}>
                {lead.priorityLevel} PRIORITY
              </span>
              <span className="text-[10px] font-mono bg-slate-950 px-2 py-0.5 rounded text-slate-400 border border-slate-800">
                Source: {lead.leadSource}
              </span>
              {lead.converted && (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ✓ Converted to Deal
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-white tracking-tight">{lead.companyName}</h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center space-x-1">
                <Building className="w-3.5 h-3.5 text-blue-400" />
                <span>{lead.industryDomain}</span>
              </span>
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>{lead.locationCity}</span>
              </span>
              {lead.websiteUrl && (
                <span className="flex items-center space-x-1">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <a
                    href={lead.websiteUrl.startsWith('http') ? lead.websiteUrl : `https://${lead.websiteUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    {lead.websiteUrl}
                  </a>
                </span>
              )}
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Added: {formatDate(lead.dateAdded)}</span>
              </span>
            </div>
          </div>

          {/* Overall Lead Score Badge & Tier Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center space-x-4 shrink-0">
            <div className={`w-14 h-14 rounded-2xl border flex flex-col items-center justify-center font-bold ${scoreColor.bg} ${scoreColor.border} ${scoreColor.text}`}>
              <span className="text-lg leading-none font-mono">{currentTotalScore}</span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400">/ 30</span>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Lead Intelligence Score
              </p>
              <h3 className="text-sm font-bold text-white mt-0.5">{scoreCategory.label}</h3>
              <p className="text-[10px] text-slate-400">
                Grade: <strong className="text-blue-400 font-mono">{scoreCategory.grade}</strong>
                {lead.sourceScore ? ` • Dossier Source Score: ${lead.sourceScore}` : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: 26-Point Intelligence vs 6D Score Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Dossier Intel & Contacts */}
        <div className="lg:col-span-7 space-y-6">
          {/* Key Executive Decision Maker */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3 flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Key Executive Contact (POC)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              <div>
                <p className="text-[10px] text-slate-400">Contact Name & Role</p>
                <p className="text-xs font-bold text-white mt-0.5">{lead.contactPocName}</p>
                <p className="text-[11px] text-slate-300">{lead.designationRole}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Communication Details</p>
                <p className="text-xs text-slate-200 mt-0.5 flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>{lead.phoneNumber || 'Not listed'}</span>
                </p>
                <p className="text-xs text-slate-200 mt-1 flex items-center space-x-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{lead.emailAddress || 'Not listed'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Strategic Manufacturing Intelligence */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Strategic Dossier Narrative (26 Fields)</span>
            </h3>

            <div>
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase">Business Overview</h4>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                {lead.businessOverview || 'No overview provided.'}
              </p>
            </div>

            <div>
              <h4 className="text-[11px] font-semibold text-rose-400 uppercase">Operational Friction / Problem</h4>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                {lead.problemFriction || 'No friction points noted.'}
              </p>
            </div>

            <div>
              <h4 className="text-[11px] font-semibold text-blue-400 uppercase">Project Requirement Scope</h4>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                {lead.projectRequirement || 'Custom enterprise full-stack system modernization.'}
              </p>
            </div>

            <div>
              <h4 className="text-[11px] font-semibold text-emerald-400 uppercase">Placement & High-Leverage Opportunity</h4>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                {lead.placementOpportunity || 'Live enterprise portfolio demonstration.'}
              </p>
            </div>

            <div>
              <h4 className="text-[11px] font-semibold text-amber-400 uppercase">Next Action Strategy</h4>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                {lead.nextAction || 'Approach key technology decision makers.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive 6-Dimension Score Engine & Activities */}
        <div className="lg:col-span-5 space-y-6">
          {/* Interactive 6D Scoring Engine */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>6-Dimension Scoring Engine</span>
                </h3>
                <p className="text-[11px] text-slate-400">Live slider tuning (0 to 5 per dimension)</p>
              </div>
              {isUpdatingScore && (
                <span className="text-[10px] text-blue-400 animate-pulse font-semibold">Saving...</span>
              )}
            </div>

            <div className="space-y-3 pt-2">
              {[
                { label: 'Digital Presence & Stack', key: 'digitalPresenceScore', val: scores.digitalPresenceScore },
                { label: 'Hiring Activity & Expansion', key: 'hiringActivityScore', val: scores.hiringActivityScore },
                { label: 'Tech Stack & Architecture Fit', key: 'techStackFitScore', val: scores.techStackFitScore },
                { label: 'Funding & Annual Revenue', key: 'fundingRevenueScore', val: scores.fundingRevenueScore },
                { label: 'Project Urgency & Timeline', key: 'projectUrgencyScore', val: scores.projectUrgencyScore },
                { label: 'Budget Clarity & Allocation', key: 'budgetClarityScore', val: scores.budgetClarityScore },
              ].map((item) => (
                <div key={item.key} className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{item.label}</span>
                    <span className="font-mono font-bold text-blue-400">{item.val} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="1"
                    value={item.val}
                    onChange={(e) => handleScoreChange(item.key, Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Related Opportunities (If converted) */}
          {lead.opportunities && lead.opportunities.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span>Linked Opportunities</span>
              </h3>
              <div className="space-y-2">
                {lead.opportunities.map((opp: any) => (
                  <div key={opp.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">{opp.title}</h4>
                      <p className="text-[11px] text-emerald-400 font-mono">{formatCurrency(opp.amount)}</p>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${getStatusBadgeClass(opp.stage)}`}>
                      {opp.stage}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lead Engagement Activity Feed */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>Activity Timeline</span>
              </h3>
              <button
                onClick={() => setShowLogActivityModal(true)}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                + Log
              </button>
            </div>

            {lead.activities && lead.activities.length > 0 ? (
              <div className="space-y-2.5">
                {lead.activities.map((act: any) => (
                  <div key={act.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-blue-400 px-1.5 py-0.2 rounded bg-blue-500/10 font-mono">
                        {act.type}
                      </span>
                      <span className="text-[10px] text-slate-400">{formatDate(act.date)}</span>
                    </div>
                    <p className="font-semibold text-slate-200">{act.subject}</p>
                    {act.description && <p className="text-[11px] text-slate-400">{act.description}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-4 text-center">No activities recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Convert to Opportunity Modal */}
      <Modal
        isOpen={showConvertModal}
        onClose={() => setShowConvertModal(false)}
        title="Convert Lead to Pipeline Deal"
        subtitle={`Promote ${lead.companyName} into an active Opportunity`}
        maxWidth="md"
      >
        <form onSubmit={handleConvertLead} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Deal Title</label>
            <input
              type="text"
              required
              value={convertForm.title}
              onChange={(e) => setConvertForm({ ...convertForm, title: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Deal Valuation (₹)</label>
              <input
                type="number"
                required
                value={convertForm.amount}
                onChange={(e) => setConvertForm({ ...convertForm, amount: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Probability (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={convertForm.probability}
                onChange={(e) => setConvertForm({ ...convertForm, probability: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Pipeline Stage</label>
            <select
              value={convertForm.stage}
              onChange={(e) => setConvertForm({ ...convertForm, stage: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="QUALIFIED">QUALIFIED</option>
              <option value="PROPOSAL">PROPOSAL</option>
              <option value="NEGOTIATION">NEGOTIATION</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowConvertModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2 rounded-xl text-xs shadow-lg shadow-emerald-600/25"
            >
              Convert to Opportunity
            </button>
          </div>
        </form>
      </Modal>

      {/* Log Activity Modal */}
      <Modal
        isOpen={showLogActivityModal}
        onClose={() => setShowLogActivityModal(false)}
        title="Log Client Activity"
        subtitle={`Record engagement with ${lead.companyName}`}
        maxWidth="md"
      >
        <form onSubmit={handleLogActivity} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Activity Type</label>
            <select
              value={activityForm.type}
              onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="CALL">Phone Call</option>
              <option value="MEETING">In-person / Virtual Meeting</option>
              <option value="EMAIL">Email Follow-up</option>
              <option value="DEMO">Product / Technical Demo</option>
              <option value="PROPOSAL">Proposal Presentation</option>
              <option value="NOTE">Internal Note</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Subject / Summary</label>
            <input
              type="text"
              required
              value={activityForm.subject}
              onChange={(e) => setActivityForm({ ...activityForm, subject: e.target.value })}
              placeholder="e.g., Architecture review meeting with CTO"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Detailed Notes</label>
            <textarea
              rows={3}
              value={activityForm.description}
              onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
              placeholder="Discussion points, next steps, feedback..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none resize-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowLogActivityModal(false)}
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

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteLead}
        title="Delete Lead Dossier"
        message={`Are you sure you want to delete the dossier for "${lead.companyName}"?`}
        confirmLabel="Delete Lead"
        variant="danger"
      />
    </div>
  );
}
