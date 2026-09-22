'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  Search,
  Filter,
  Plus,
  Upload,
  Download,
  Trash2,
  Edit,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  Building,
  Target,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Toast } from '@/components/ui/Toast';
import { formatCurrency, formatDate, getStatusBadgeClass, getPriorityBadgeClass, getScoreColorClass } from '@/lib/utils';
import { calculateTotalLeadScore, getScoringCategory } from '@/lib/lead-scoring';

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [industryFilter, setIndustryFilter] = useState('ALL');
  const [industries, setIndustries] = useState<string[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedLeadForConvert, setSelectedLeadForConvert] = useState<any>(null);
  const [leadToDelete, setLeadToDelete] = useState<any>(null);

  // Toast
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    show: false,
    message: '',
    type: 'success',
  });

  // Create/Edit Lead Form State
  const initialFormState = {
    companyName: '',
    industryDomain: 'Manufacturing',
    locationCity: '',
    websiteUrl: '',
    contactPocName: '',
    designationRole: 'Decision Maker',
    phoneNumber: '',
    emailAddress: '',
    businessOverview: '',
    problemFriction: '',
    projectRequirement: '',
    placementOpportunity: '',
    priorityLevel: 'MEDIUM',
    pipelineStatus: 'NEW',
    nextAction: '',
    dateAdded: new Date().toISOString().split('T')[0],
    leadSource: 'Direct Entry',
    contactMethod: 'Email',
    digitalPresenceScore: 3,
    hiringActivityScore: 3,
    techStackFitScore: 3,
    fundingRevenueScore: 3,
    projectUrgencyScore: 3,
    budgetClarityScore: 3,
    projectAllocationStatus: 'Available for Selection',
    assignedToId: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);

  // Convert Form State
  const [convertForm, setConvertForm] = useState({
    title: '',
    amount: 3500000,
    probability: 60,
    stage: 'QUALIFIED',
    description: '',
  });

  // CSV Import State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvRawText, setCsvRawText] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, [search, statusFilter, priorityFilter, industryFilter]);

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (priorityFilter !== 'ALL') params.set('priority', priorityFilter);
      if (industryFilter !== 'ALL') params.set('industry', industryFilter);

      const res = await fetch(`/api/leads?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setLeads(json.leads || []);
        if (json.filters) {
          setIndustries(json.filters.industries || []);
          setUsers(json.filters.users || []);
        }
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingLeadId ? `/api/leads/${editingLeadId}` : '/api/leads';
      const method = editingLeadId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save lead');

      setToast({
        show: true,
        message: editingLeadId ? 'Lead dossier updated successfully' : 'Lead dossier created successfully',
        type: 'success',
      });

      setShowCreateModal(false);
      setEditingLeadId(null);
      setFormData(initialFormState);
      fetchLeads();
    } catch (err: any) {
      setToast({ show: true, message: err.message || 'An error occurred', type: 'error' });
    }
  };

  const handleEditClick = (lead: any) => {
    setEditingLeadId(lead.id);
    setFormData({
      companyName: lead.companyName || '',
      industryDomain: lead.industryDomain || 'Manufacturing',
      locationCity: lead.locationCity || '',
      websiteUrl: lead.websiteUrl || '',
      contactPocName: lead.contactPocName || '',
      designationRole: lead.designationRole || 'Decision Maker',
      phoneNumber: lead.phoneNumber || '',
      emailAddress: lead.emailAddress || '',
      businessOverview: lead.businessOverview || '',
      problemFriction: lead.problemFriction || '',
      projectRequirement: lead.projectRequirement || '',
      placementOpportunity: lead.placementOpportunity || '',
      priorityLevel: lead.priorityLevel || 'MEDIUM',
      pipelineStatus: lead.pipelineStatus || 'NEW',
      nextAction: lead.nextAction || '',
      dateAdded: lead.dateAdded || new Date().toISOString().split('T')[0],
      leadSource: lead.leadSource || 'Direct Entry',
      contactMethod: lead.contactMethod || 'Email',
      digitalPresenceScore: lead.digitalPresenceScore ?? 3,
      hiringActivityScore: lead.hiringActivityScore ?? 3,
      techStackFitScore: lead.techStackFitScore ?? 3,
      fundingRevenueScore: lead.fundingRevenueScore ?? 3,
      projectUrgencyScore: lead.projectUrgencyScore ?? 3,
      budgetClarityScore: lead.budgetClarityScore ?? 3,
      projectAllocationStatus: lead.projectAllocationStatus || 'Available for Selection',
      assignedToId: lead.assignedToId || '',
    });
    setShowCreateModal(true);
  };

  const handleDeleteLead = async () => {
    if (!leadToDelete) return;
    try {
      const res = await fetch(`/api/leads/${leadToDelete.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete lead');

      setToast({ show: true, message: 'Lead dossier deleted', type: 'success' });
      setLeadToDelete(null);
      fetchLeads();
    } catch (err: any) {
      setToast({ show: true, message: err.message || 'Error deleting lead', type: 'error' });
    }
  };

  const handleConvertLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadForConvert) return;

    try {
      const res = await fetch(`/api/leads/${selectedLeadForConvert.id}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(convertForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to convert lead');

      setToast({
        show: true,
        message: `Lead successfully converted into Opportunity!`,
        type: 'success',
      });

      setShowConvertModal(false);
      setSelectedLeadForConvert(null);
      fetchLeads();
    } catch (err: any) {
      setToast({ show: true, message: err.message || 'Conversion failed', type: 'error' });
    }
  };

  const handleCsvImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsImporting(true);

    try {
      let res;
      if (csvFile) {
        const data = new FormData();
        data.append('file', csvFile);
        res = await fetch('/api/leads/import-csv', {
          method: 'POST',
          body: data,
        });
      } else if (csvRawText) {
        res = await fetch('/api/leads/import-csv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ csvContent: csvRawText }),
        });
      } else {
        throw new Error('Please select a CSV file or paste CSV text');
      }

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to import CSV');

      setToast({
        show: true,
        message: json.message || `Successfully imported ${json.importedCount} leads`,
        type: 'success',
      });

      setShowImportModal(false);
      setCsvFile(null);
      setCsvRawText('');
      fetchLeads();
    } catch (err: any) {
      setToast({ show: true, message: err.message || 'CSV Import failed', type: 'error' });
    } finally {
      setIsImporting(false);
    }
  };

  const downloadSampleCsv = () => {
    const headers = [
      'Company Name',
      'Industry Domain',
      'Location / City',
      'Website URL',
      'Contact POC Name',
      'Designation / Role',
      'Phone Number',
      'Email Address',
      'Business Overview',
      'Problem / Friction',
      'Project Requirement',
      'Placement Opportunity',
      'Priority Level',
      'Pipeline Status',
      'Next Action',
      'Date Added',
      'Lead Source',
      'Contact Method',
      'Digital Presence Score',
      'Hiring Activity Score',
      'Tech Stack Fit Score',
      'Funding / Revenue Score',
      'Project Urgency Score',
      'Budget Clarity Score',
    ].join(',');

    const sampleRow = [
      '"Dynamic Hydraulics Ltd"',
      '"Industrial Machinery"',
      '"Peenya, Bengaluru"',
      '"dynamichydraulics.com"',
      '"Kiran Varma"',
      '"VP Operations"',
      '"+91 98800 11223"',
      '"kiran@dynamichydraulics.com"',
      '"Manufacturer of heavy-duty hydraulic cylinders"',
      '"Manual workflow tracking and slow quote generation"',
      '"Custom Next.js CRM with CPQ module"',
      '"Full SaaS contract"',
      '"HIGH"',
      '"NEW"',
      '"Schedule discovery call with CTO"',
      '"2026-09-22"',
      '"Google Sheet Import"',
      '"Email"',
      '4',
      '3',
      '5',
      '4',
      '4',
      '4',
    ].join(',');

    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${sampleRow}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'rain_leads_sample_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const calculatedLiveScore = calculateTotalLeadScore({
    digitalPresenceScore: Number(formData.digitalPresenceScore),
    hiringActivityScore: Number(formData.hiringActivityScore),
    techStackFitScore: Number(formData.techStackFitScore),
    fundingRevenueScore: Number(formData.fundingRevenueScore),
    projectUrgencyScore: Number(formData.projectUrgencyScore),
    budgetClarityScore: Number(formData.budgetClarityScore),
  });

  const liveCategory = getScoringCategory(calculatedLiveScore);

  return (
    <div className="space-y-6">
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />

      {/* Header Bar with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <span>Enterprise Manufacturing Lead Dossiers</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            26-point intelligence dossiers with 6-dimension algorithmic qualification scoring
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowImportModal(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all"
          >
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span>Import CSV</span>
          </button>

          <a
            href="/api/leads/export"
            download
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </a>

          <button
            onClick={() => {
              setEditingLeadId(null);
              setFormData(initialFormState);
              setShowCreateModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-lg shadow-blue-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Lead Dossier</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Controls Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, contact, city, role..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Pipeline Stages</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="PROPOSAL">Proposal</option>
            <option value="NEGOTIATION">Negotiation</option>
            <option value="WON">Won</option>
            <option value="LOST">Lost</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Industry Filter */}
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Industries</option>
            {industries.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Leads Dossier Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400">Loading dossiers...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Layers className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-300">No lead dossiers match the criteria</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search terms or filters, or add a new lead dossier to the database.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Enterprise Account</th>
                  <th className="py-3 px-3">Industry Domain</th>
                  <th className="py-3 px-3">Key POC / Role</th>
                  <th className="py-3 px-3">Pipeline Status</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3 text-center">6D Score</th>
                  <th className="py-3 px-3">Assigned Rep</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {leads.map((lead) => {
                  const scoreColor = getScoreColorClass(lead.totalLeadScore);
                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Account & Location */}
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/leads/${lead.id}`}
                          className="font-bold text-white hover:text-blue-400 transition-colors block truncate max-w-[200px]"
                        >
                          {lead.companyName}
                        </Link>
                        <div className="text-[11px] text-slate-400 truncate max-w-[200px] mt-0.5">
                          {lead.locationCity}
                        </div>
                        {lead.converted && (
                          <span className="inline-block mt-1 text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider">
                            ✓ Converted to Deal
                          </span>
                        )}
                      </td>

                      {/* Industry */}
                      <td className="py-3.5 px-3 text-slate-300">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px]">
                          {lead.industryDomain}
                        </span>
                      </td>

                      {/* Key POC */}
                      <td className="py-3.5 px-3">
                        <div className="font-medium text-slate-200 truncate max-w-[150px]">
                          {lead.contactPocName}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                          {lead.designationRole}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${getStatusBadgeClass(
                            lead.pipelineStatus
                          )}`}
                        >
                          {lead.pipelineStatus}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${getPriorityBadgeClass(
                            lead.priorityLevel
                          )}`}
                        >
                          {lead.priorityLevel}
                        </span>
                      </td>

                      {/* 6D Lead Score */}
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-lg border font-mono ${scoreColor.bg} ${scoreColor.text} ${scoreColor.border}`}
                          title={`Score: ${lead.totalLeadScore}/30 | Source Score: ${lead.sourceScore || 'N/A'}`}
                        >
                          {lead.totalLeadScore} / 30
                        </span>
                      </td>

                      {/* Assigned Rep */}
                      <td className="py-3.5 px-3">
                        <span className="text-slate-300 text-[11px]">
                          {lead.assignedTo?.name || 'Unassigned'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <Link
                            href={`/leads/${lead.id}`}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            title="View Full Dossier"
                          >
                            <FileText className="w-4 h-4" />
                          </Link>

                          {!lead.converted && (
                            <button
                              onClick={() => {
                                setSelectedLeadForConvert(lead);
                                setConvertForm({
                                  title: `${lead.companyName} - Enterprise Modernization`,
                                  amount: 3500000,
                                  probability: 70,
                                  stage: 'QUALIFIED',
                                  description: lead.projectRequirement || lead.problemFriction || '',
                                });
                                setShowConvertModal(true);
                              }}
                              className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                              title="Convert to Opportunity Deal"
                            >
                              <Target className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => handleEditClick(lead)}
                            className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Edit Dossier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setLeadToDelete(lead)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT LEAD DOSSIER MODAL (26 Fields + 6D Scoring) */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={editingLeadId ? 'Edit Manufacturing Lead Dossier' : 'New Enterprise Lead Dossier'}
        subtitle="Complete 26-point strategic intelligence and 6-dimension scoring profile"
        maxWidth="4xl"
      >
        <form onSubmit={handleSaveLead} className="space-y-6">
          {/* Section 1: Enterprise Account Info */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3 flex items-center space-x-1.5">
              <Building className="w-3.5 h-3.5" />
              <span>1. Corporate & Account Identification</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="e.g., Rain Industries Limited (RAIN)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Industry Domain</label>
                <input
                  type="text"
                  value={formData.industryDomain}
                  onChange={(e) => setFormData({ ...formData, industryDomain: e.target.value })}
                  placeholder="e.g., Manufacturing, Chemicals"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Location / City</label>
                <input
                  type="text"
                  value={formData.locationCity}
                  onChange={(e) => setFormData({ ...formData, locationCity: e.target.value })}
                  placeholder="e.g., Hyderabad, Telangana"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Website URL</label>
                <input
                  type="text"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  placeholder="e.g., rain-industries.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Date Added</label>
                <input
                  type="date"
                  value={formData.dateAdded}
                  onChange={(e) => setFormData({ ...formData, dateAdded: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Lead Source</label>
                <select
                  value={formData.leadSource}
                  onChange={(e) => setFormData({ ...formData, leadSource: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Direct Entry">Direct Entry</option>
                  <option value="Google Sheet Import">Google Sheet Import</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Trade Show">Trade Show</option>
                  <option value="Referral">Referral</option>
                  <option value="Website">Website</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Contact Decision Maker */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3 flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5" />
              <span>2. Key Executive POC & Contact Details</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Contact POC Name</label>
                <input
                  type="text"
                  value={formData.contactPocName}
                  onChange={(e) => setFormData({ ...formData, contactPocName: e.target.value })}
                  placeholder="e.g., Rajesh Varma"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Designation / Role</label>
                <input
                  type="text"
                  value={formData.designationRole}
                  onChange={(e) => setFormData({ ...formData, designationRole: e.target.value })}
                  placeholder="e.g., CTO / Project Head"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="+91 98490 12345"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.emailAddress}
                  onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                  placeholder="name@company.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Strategic Dossier Intelligence */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>3. Manufacturing Intelligence & Requirement Scope</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Business Overview</label>
                <textarea
                  rows={2}
                  value={formData.businessOverview}
                  onChange={(e) => setFormData({ ...formData, businessOverview: e.target.value })}
                  placeholder="Describe enterprise scale, products, manufacturing operations..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Problem / Operational Friction</label>
                <textarea
                  rows={2}
                  value={formData.problemFriction}
                  onChange={(e) => setFormData({ ...formData, problemFriction: e.target.value })}
                  placeholder="Legacy workflow friction, manual CRM tracking, lack of automation..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Project Requirement</label>
                <textarea
                  rows={2}
                  value={formData.projectRequirement}
                  onChange={(e) => setFormData({ ...formData, projectRequirement: e.target.value })}
                  placeholder="Custom Next.js CRM portal, ERP/SAP integration, quote automation..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Next Action & Approach</label>
                <textarea
                  rows={2}
                  value={formData.nextAction}
                  onChange={(e) => setFormData({ ...formData, nextAction: e.target.value })}
                  placeholder="Reach out to Technology decision makers with custom automation pitch..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: 6-Dimension Algorithmic Lead Scoring Engine */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                  <Target className="w-3.5 h-3.5" />
                  <span>4. 6-Dimension Lead Scoring Engine (0-5 each)</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Algorithmic total: <strong className="text-white font-mono">{calculatedLiveScore}/30</strong> • Tier:{' '}
                  <span className={`font-semibold ${liveCategory.color === 'emerald' ? 'text-emerald-400' : 'text-blue-400'}`}>
                    {liveCategory.label} ({liveCategory.grade})
                  </span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2">
              {[
                { label: 'Digital Presence', field: 'digitalPresenceScore' },
                { label: 'Hiring Activity', field: 'hiringActivityScore' },
                { label: 'Tech Stack Fit', field: 'techStackFitScore' },
                { label: 'Funding / Rev', field: 'fundingRevenueScore' },
                { label: 'Project Urgency', field: 'projectUrgencyScore' },
                { label: 'Budget Clarity', field: 'budgetClarityScore' },
              ].map((dim) => (
                <div key={dim.field} className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1 truncate">
                    {dim.label}
                  </label>
                  <select
                    value={(formData as any)[dim.field]}
                    onChange={(e) => setFormData({ ...formData, [dim.field]: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white font-mono focus:outline-none"
                  >
                    {[0, 1, 2, 3, 4, 5].map((val) => (
                      <option key={val} value={val}>
                        {val} / 5
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Pipeline Assignment */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Pipeline Stage</label>
              <select
                value={formData.pipelineStatus}
                onChange={(e) => setFormData({ ...formData, pipelineStatus: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
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
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Priority Level</label>
              <select
                value={formData.priorityLevel}
                onChange={(e) => setFormData({ ...formData, priorityLevel: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Assign Sales Rep</label>
              <select
                value={formData.assignedToId}
                onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="">Auto-Assign / Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Modal Actions */}
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
              {editingLeadId ? 'Update Lead Dossier' : 'Save Dossier'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONVERT LEAD TO OPPORTUNITY MODAL */}
      <Modal
        isOpen={showConvertModal}
        onClose={() => setShowConvertModal(false)}
        title="Convert Lead to Pipeline Deal"
        subtitle={`Create Opportunity, Company Account, and Contacts for ${selectedLeadForConvert?.companyName}`}
        maxWidth="md"
      >
        <form onSubmit={handleConvertLead} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Opportunity Title</label>
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
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Deal Valuation (₹ INR)</label>
              <input
                type="number"
                required
                value={convertForm.amount}
                onChange={(e) => setConvertForm({ ...convertForm, amount: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
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
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Starting Stage</label>
            <select
              value={convertForm.stage}
              onChange={(e) => setConvertForm({ ...convertForm, stage: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
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

      {/* IMPORT CSV MODAL */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Bulk Import Manufacturing Leads via CSV"
        subtitle="Upload or paste lead rows formatted according to the 26-field dossier schema"
        maxWidth="xl"
      >
        <form onSubmit={handleCsvImport} className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 shrink-0 text-blue-400" />
              <span>Need the exact column schema?</span>
            </div>
            <button
              type="button"
              onClick={downloadSampleCsv}
              className="font-bold underline hover:text-white text-blue-400 ml-2 shrink-0"
            >
              Download Sample CSV
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
              Upload CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer bg-slate-950 p-2 rounded-xl border border-slate-800"
            />
          </div>

          <div className="text-center text-[11px] text-slate-500 uppercase font-semibold">
            — Or Paste Raw CSV Content Below —
          </div>

          <div>
            <textarea
              rows={5}
              value={csvRawText}
              onChange={(e) => setCsvRawText(e.target.value)}
              placeholder="Paste comma-separated rows with header line here..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowImportModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isImporting}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2 rounded-xl text-xs shadow-lg shadow-blue-600/25 disabled:opacity-50"
            >
              {isImporting ? 'Importing...' : 'Parse & Import Leads'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={Boolean(leadToDelete)}
        onClose={() => setLeadToDelete(null)}
        onConfirm={handleDeleteLead}
        title="Delete Lead Dossier"
        message={`Are you sure you want to permanently delete the lead dossier for "${leadToDelete?.companyName}"? This action cannot be undone.`}
        confirmLabel="Delete Lead"
        variant="danger"
      />
    </div>
  );
}
