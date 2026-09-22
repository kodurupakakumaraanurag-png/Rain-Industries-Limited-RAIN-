'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Factory, Shield, Lock, Mail, ArrowRight, Eye, EyeOff, CheckCircle2, Sparkles, Building2, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@rain-industries.com');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const demoAccounts = [
    {
      role: 'ADMIN',
      name: 'Rajesh Varma',
      email: 'admin@rain-industries.com',
      badge: 'Full Platform Access',
      badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    },
    {
      role: 'SALES MANAGER',
      name: 'Ananya Sharma',
      email: 'manager@rain-industries.com',
      badge: 'Pipeline & Team Lead',
      badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    },
    {
      role: 'SALES EXECUTIVE',
      name: 'Vikram Reddy',
      email: 'executive@rain-industries.com',
      badge: 'Dossiers & Deals',
      badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    },
    {
      role: 'VIEWER',
      name: 'Siddharth Mehta',
      email: 'viewer@rain-industries.com',
      badge: 'Compliance & Audit',
      badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    },
  ];

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign in');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const selectPersona = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl grid md:grid-cols-12 gap-8 z-10 items-center">
        {/* Left Side: Brand Story & Manufacturing Intel */}
        <div className="md:col-span-5 space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/25 border border-blue-400/30">
              <Factory className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">
                RAIN <span className="text-blue-400">CRM</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">Rain Industries Limited (RAIN)</p>
            </div>
          </div>

          <div className="space-y-3 text-slate-300">
            <h2 className="text-2xl font-bold text-white tracking-tight leading-snug">
              Manufacturing Sales Intelligence & Deal Pipeline Platform
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enterprise portal engineered for manufacturing conglomerates, tracking 26-point lead dossiers, 6-dimension scoring algorithms, and automated pipeline governance.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center space-x-2.5 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>26-Field Dossier & AI Lead Scoring Engine</span>
            </div>
            <div className="flex items-center space-x-2.5 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>7-Stage Industrial Kanban Opportunity Board</span>
            </div>
            <div className="flex items-center space-x-2.5 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Bulk CSV Import/Export & Auto-Qualification</span>
            </div>
            <div className="flex items-center space-x-2.5 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Full Audit Trail & Role-Based Governance</span>
            </div>
          </div>

          {/* Identity Tag */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center space-x-3 text-xs text-slate-400">
            <Building2 className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <p className="text-slate-200 font-semibold text-[11px]">Corporate Headquarters</p>
              <p className="text-[10px]">Kukatpally, Hyderabad, Telangana – 500085</p>
            </div>
          </div>
        </div>

        {/* Right Side: Login Card & Demo Switcher */}
        <div className="md:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white">Enterprise Sign In</h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter your credentials or click any demo persona below.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                <Shield className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Corporate Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@rain-industries.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Enter Platform</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Persona Quick Switcher */}
            <div className="mt-6 pt-5 border-t border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Select Demo Persona</span>
                </span>
                <span className="text-[10px] text-slate-400">Password: Password123!</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {demoAccounts.map((account) => {
                  const isSelected = email === account.email;
                  return (
                    <button
                      key={account.email}
                      type="button"
                      onClick={() => selectPersona(account.email)}
                      className={`text-left p-2.5 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-blue-600/15 border-blue-500/50 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white truncate">{account.name}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono ${account.badgeColor}`}>
                          {account.role}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">{account.email}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-8 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} Rain Industries Limited (RAIN). Enterprise Sales & CRM Platform.
      </footer>
    </div>
  );
}
