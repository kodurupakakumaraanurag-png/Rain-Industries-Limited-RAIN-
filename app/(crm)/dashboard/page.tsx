'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  Building2,
  Target,
  CheckSquare,
  TrendingUp,
  DollarSign,
  Plus,
  Upload,
  ArrowUpRight,
  Activity,
  Award,
  Sparkles,
  ChevronRight,
  Calendar,
  Clock,
  Briefcase,
  BarChart2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { formatCurrency, formatDate, getStatusBadgeClass, getPriorityBadgeClass, getScoreColorClass } from '@/lib/utils';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Loading executive dashboard...</p>
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const charts = data?.charts || {};
  const recentActivities = data?.recentActivities || [];
  const recentLeads = data?.recentLeads || [];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900/50 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
        <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-blue-500/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Executive Sales Operations Portal</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Rain Industries Limited (RAIN) Overview
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Real-time intelligence feed on industrial manufacturing leads, 6-dimension scoring dossiers, and pipeline revenue progression.
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <Link
              href="/leads"
              className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-lg shadow-blue-600/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Lead</span>
            </Link>
            <Link
              href="/pipeline"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all"
            >
              <Target className="w-3.5 h-3.5 text-blue-400" />
              <span>Kanban Board</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pipeline Value */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Pipeline Value</span>
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-white">
              {formatCurrency(metrics.totalPipelineValue || 0)}
            </h3>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center space-x-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Weighted: {formatCurrency(metrics.weightedPipelineValue || 0)}</span>
            </p>
          </div>
        </div>

        {/* Won Deal Revenue */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Won Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-emerald-400">
              {formatCurrency(metrics.wonPipelineValue || 0)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">
              Win Rate: <strong className="text-white">{metrics.winRate || 0}%</strong> across closed deals
            </p>
          </div>
        </div>

        {/* Total Active Leads */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Leads & Accounts</span>
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-white">{metrics.totalLeads || 0}</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              <strong className="text-blue-400">{metrics.newLeadsCount || 0}</strong> new •{' '}
              <strong className="text-emerald-400">{metrics.qualifiedLeadsCount || 0}</strong> qualified
            </p>
          </div>
        </div>

        {/* Operational Tasks */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Pending Operations</span>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-white">{metrics.openTasksCount || 0}</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Across <strong className="text-white">{metrics.totalCompanies || 0}</strong> enterprise accounts
            </p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pipeline Stage Funnel Bar Chart */}
        <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <BarChart2 className="w-4 h-4 text-blue-400" />
                <span>Opportunity Pipeline by Stage (₹ INR)</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Total valuation of deals progressing through manufacturing sales cycle
              </p>
            </div>
            <Link
              href="/pipeline"
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1"
            >
              <span>View Pipeline</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={charts.pipelineStageData || []}
                margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="stage"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                  formatter={(val: any) => [formatCurrency(Number(val)), 'Deal Value']}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Industry Distribution Doughnut Chart */}
        <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Sector & Industry Domains</h3>
            <p className="text-[11px] text-slate-400 mb-4">
              Lead distribution across industrial verticals
            </p>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.leadsByIndustry || []}
                    dataKey="count"
                    nameKey="industry"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {(charts.leadsByIndustry || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-800/80 max-h-24 overflow-y-auto">
            {(charts.leadsByIndustry || []).map((item: any, idx: number) => (
              <div key={item.industry} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center space-x-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-slate-300 truncate">{item.industry}</span>
                </div>
                <span className="text-slate-400 font-mono font-semibold ml-2">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two-Column Grid: Priority Leads & Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent High-Priority Leads Table */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>Recently Captured Lead Dossiers</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                26-field intelligence records ready for conversion
              </p>
            </div>
            <Link
              href="/leads"
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1"
            >
              <span>All Leads</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-1">Company</th>
                  <th className="pb-3">Industry</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-center">Score</th>
                  <th className="pb-3 text-right pr-1">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {recentLeads.map((lead: any) => {
                  const scoreColor = getScoreColorClass(lead.totalLeadScore);
                  return (
                    <tr key={lead.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 pl-1">
                        <div className="font-semibold text-white truncate max-w-[160px]">
                          {lead.companyName}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                          {lead.locationCity}
                        </div>
                      </td>
                      <td className="py-3 text-slate-300 text-[11px] truncate max-w-[120px]">
                        {lead.industryDomain}
                      </td>
                      <td className="py-3">
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${getStatusBadgeClass(
                            lead.pipelineStatus
                          )}`}
                        >
                          {lead.pipelineStatus}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-lg border font-mono ${scoreColor.bg} ${scoreColor.text} ${scoreColor.border}`}
                        >
                          {lead.totalLeadScore}/30
                        </span>
                      </td>
                      <td className="py-3 text-right pr-1">
                        <Link
                          href={`/leads/${lead.id}`}
                          className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center space-x-1"
                        >
                          <span>Dossier</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Operational Activity Feed */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Activity Timeline Feed</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Client engagements, workshops, and notes
                </p>
              </div>
              <Link
                href="/activities"
                className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1"
              >
                <span>All Activities</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3.5">
              {recentActivities.map((act: any) => (
                <div
                  key={act.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                      {act.type}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(act.date)}</span>
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200">{act.subject}</h4>
                  {act.description && (
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {act.description}
                    </p>
                  )}
                  <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/50">
                    <span>{act.company?.name || act.lead?.companyName || 'General Account'}</span>
                    <span className="text-slate-300 font-medium">{act.user?.name || 'System Rep'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
