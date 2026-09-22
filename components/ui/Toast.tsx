'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastProps {
  show: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export function Toast({ show, message, type = 'success', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
  };

  const bgClasses = {
    success: 'bg-slate-900 border-emerald-500/40 text-emerald-300 shadow-emerald-950/50',
    error: 'bg-slate-900 border-rose-500/40 text-rose-300 shadow-rose-950/50',
    info: 'bg-slate-900 border-blue-500/40 text-blue-300 shadow-blue-950/50',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5">
      <div
        className={cn(
          'flex items-center space-x-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md max-w-md',
          bgClasses[type]
        )}
      >
        {icons[type]}
        <p className="text-xs font-medium text-slate-100 flex-1">{message}</p>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
