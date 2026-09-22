import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'INR'): string {
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return String(dateString);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getStatusBadgeClass(status: string): string {
  switch (status.toUpperCase()) {
    case 'NEW':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'CONTACTED':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    case 'QUALIFIED':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'PROPOSAL':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'NEGOTIATION':
      return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    case 'WON':
      return 'bg-green-500/10 text-green-400 border-green-500/20';
    case 'LOST':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    case 'COMPLETED':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'IN_PROGRESS':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'TODO':
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    case 'OVERDUE':
      return 'bg-red-500/10 text-red-400 border-red-500/20';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
}

export function getPriorityBadgeClass(priority: string): string {
  switch (priority.toUpperCase()) {
    case 'URGENT':
      return 'bg-rose-500/15 text-rose-400 border-rose-500/30 font-semibold animate-pulse';
    case 'HIGH':
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30 font-medium';
    case 'MEDIUM':
      return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    case 'LOW':
      return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    default:
      return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
  }
}

export function getScoreColorClass(score: number): { text: string; bg: string; border: string } {
  if (score >= 24) {
    return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
  } else if (score >= 18) {
    return { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' };
  } else if (score >= 12) {
    return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
  } else {
    return { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' };
  }
}
