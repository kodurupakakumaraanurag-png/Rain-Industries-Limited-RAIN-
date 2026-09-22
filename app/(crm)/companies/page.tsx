'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Search,
  Plus,
  Globe,
  MapPin,
  Phone,
  Mail,
  Users,
  Layers,
  Target,
  Trash2,
  Edit,
  ExternalLink,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Toast } from '@/components/ui/Toast';
import { formatCurrency } from '@/lib/utils';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('ALL');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<any>(null);

  const initialForm = {
    name: '',
    industry: 'Manufacturing',
    website: '',
    location: '',
    phone: '',
    email: '',
    description: '',
    employeeCount: '',
    annualRevenue: '',
    status: 'ACTIVE',
  };

  const [formData, setFormData] = useState(initialForm);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    show: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    fetchCompanies();
  }, [search, industryFilter]);

  const fetchCompanies = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (industryFilter !== 'ALL') params.set('industry', industryFilter);

      const res = await fetch(`/api/companies?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setCompanies(json.companies || []);
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
      const url = editingId ? `/api/companies/${editingId}` : '/api/companies';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to save company');

      setToast({
        show: true,
        message: editingId ? 'Company updated' : 'Company added',
        type: 'success',
      });

      setShowModal(false);
      setEditingId(null);
      setFormData(initialForm);
      fetchCompanies();
    } catch (err: any) {
      setToast({ show: true, message: err.message, type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!companyToDelete) return;
    try {
      const res = await fetch(`/api/companies/${companyToDelete.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete company');
      setToast({ show: true, message: 'Company deleted', type: 'success' });
      setCompanyToDelete(null);
      fetchCompanies();
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
            <Building2 className="w-5 h-5 text-blue-400" />
            <span>Industrial Accounts & Companies</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Directory of manufacturing conglomerates, subsidiaries, and corporate profiles
          </p>
        </div>

        <button
          onClick={() => {
            setEditingId(null);
            setFormData(initialForm);
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-lg shadow-blue-600/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Company Account</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, location, industry..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Total: {companies.length} Accounts</span>
        </div>
      </div>

      {/* Companies Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading companies...</p>
        </div>
      ) : companies.length === 0 ? (
        <div className="py-20 text-center text-slate-500 text-xs">No company accounts found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((company) => (
            <div
              key={company.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-blue-500/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">
                      {company.industry}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-0.5">{company.name}</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {company.status}
                  </span>
                </div>

                {company.location && (
                  <p className="text-xs text-slate-400 flex items-center space-x-1.5 mt-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="truncate">{company.location}</span>
                  </p>
                )}

                {company.description && (
                  <p className="text-xs text-slate-300 mt-2.5 line-clamp-2 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                    {company.description}
                  </p>
                )}

                {/* Account Metrics Strip */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800 text-center">
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                    <span className="block text-[10px] text-slate-400">Contacts</span>
                    <strong className="text-xs text-white">{company._count?.contacts || 0}</strong>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                    <span className="block text-[10px] text-slate-400">Dossiers</span>
                    <strong className="text-xs text-white">{company._count?.leads || 0}</strong>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                    <span className="block text-[10px] text-slate-400">Deals</span>
                    <strong className="text-xs text-blue-400">{company._count?.opportunities || 0}</strong>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                {company.website ? (
                  <a
                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Website</span>
                  </a>
                ) : (
                  <span className="text-xs text-slate-500">No URL</span>
                )}

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => {
                      setEditingId(company.id);
                      setFormData({
                        name: company.name,
                        industry: company.industry,
                        website: company.website || '',
                        location: company.location || '',
                        phone: company.phone || '',
                        email: company.email || '',
                        description: company.description || '',
                        employeeCount: company.employeeCount || '',
                        annualRevenue: company.annualRevenue || '',
                        status: company.status || 'ACTIVE',
                      });
                      setShowModal(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCompanyToDelete(company)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Edit Company Account' : 'New Industrial Account'}
        subtitle="Corporate profile and enterprise metrics"
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Company Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Industry Vertical *</label>
              <input
                type="text"
                required
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Website URL</label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Location / Headquarters</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Corporate Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Company Description</label>
            <textarea
              rows={2}
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
              {editingId ? 'Update Company' : 'Save Company'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(companyToDelete)}
        onClose={() => setCompanyToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Company Account"
        message={`Are you sure you want to delete "${companyToDelete?.name}"? All associated leads will remain unlinked.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
