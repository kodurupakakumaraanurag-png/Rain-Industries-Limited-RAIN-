'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  Target,
  Layers,
  Sparkles,
  PieChart as PieIcon,
  Users,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/reports');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400">Compiling executive intelligence reports...</p>
      </div>
    );
  }

  const funnelData = data?.funnelData || [];
  const repLeaderboard = data?.repLeaderboard || [];
  const scoreTiers = data?.scoreTiers || {};
  const dimAvg = data?.dimensionAverages || {};
  const leadsBySource = data?.leadsBySource || [];
  const leadsByIndustry = data?.leadsByIndustry || [];

  const radarData = [
    { subject: 'Digital Presence', score: Number(dimAvg.digitalPresence || 0), fullMark: 5 },
    { subject: 'Hiring Activity', score: Number(dimAvg.hiringActivity || 0), fullMark: 5 },
    { subject: 'Tech Stack Fit', score: Number(dimAvg.techStackFit || 0), fullMark: 5 },
    { subject: 'Funding / Rev', score: Number(dimAvg.fundingRevenue || 0), fullMark: 5 },
    { subject: 'Project Urgency', score: Number(dimAvg.projectUrgency || 0), fullMark: 5 },
    { subject: 'Budget Clarity', score: Number(dimAvg.budgetClarity || 0), fullMark: 5 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <span>Executive Intelligence & Sales Analytics</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Algorithmic scoring distributions, rep conversion velocity, and manufacturing funnel analytics
        </p>
      </div>

      {/* Top 3 Score Tier KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-semibold text-emerald-400">Hot Opportunities (24-30 pts)</span>
          <h3 className="text-2xl font-bold text-white mt-1 font-mono">{scoreTiers.hot || 0}</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">High probability closing tier</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-semibold text-blue-400">Warm Deals (18-23 pts)</span>
          <h3 className="text-2xl font-bold text-white mt-1 font-mono">{scoreTiers.warm || 0}</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Solid enterprise requirement</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-semibold text-amber-400">Moderate / Nurturing (12-17 pts)</span>
          <h3 className="text-2xl font-bold text-white mt-1 font-mono">{scoreTiers.moderate || 0}</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Follow-up needed</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-semibold text-rose-400">Unqualified (&lt; 12 pts)</span>
          <h3 className="text-2xl font-bold text-white mt-1 font-mono">{scoreTiers.cold || 0}</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Archived / Low fit</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Funnel Valuation Bar Chart */}
        <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-1">Pipeline Conversion Funnel (Deal Valuation in ₹)</h3>
          <p className="text-[11px] text-slate-400 mb-4">Total valuation across each active sales stage</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="stage" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }}
                  formatter={(val: any) => [formatCurrency(Number(val)), 'Stage Value']}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6D Radar Scoring Distribution */}
        <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">6-Dimension Profile Radar</h3>
            <p className="text-[11px] text-slate-400 mb-2">Average scoring across all 26-point dossiers</p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={10} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} stroke="#475569" fontSize={9} />
                  <Radar name="Average Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 text-center">Score range: 0 (poor fit) to 5 (optimal enterprise fit)</p>
        </div>
      </div>

      {/* Sales Rep Leaderboard Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-1 flex items-center space-x-2">
          <Award className="w-4 h-4 text-emerald-400" />
          <span>Sales Operations Rep Leaderboard</span>
        </h3>
        <p className="text-[11px] text-slate-400 mb-4">
          Individual rep performance across lead conversions and contract revenue
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Sales Representative</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3 text-center">Assigned Dossiers</th>
                <th className="py-3 px-3 text-center">Won Deals</th>
                <th className="py-3 px-3 text-center">Win Rate</th>
                <th className="py-3 px-3">Active Pipeline</th>
                <th className="py-3 px-4 text-right">Won Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {repLeaderboard.map((rep: any, idx: number) => (
                <tr key={rep.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-mono text-[10px]">
                      {idx + 1}
                    </span>
                    <span>{rep.name}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                      {rep.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono font-semibold">{rep.leadsCount}</td>
                  <td className="py-3.5 px-3 text-center font-mono text-emerald-400 font-bold">{rep.wonCount}</td>
                  <td className="py-3.5 px-3 text-center font-mono font-bold text-blue-400">{rep.conversionRate}%</td>
                  <td className="py-3.5 px-3 font-mono text-slate-300">{formatCurrency(rep.pipelineRevenue)}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                    {formatCurrency(rep.wonRevenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
