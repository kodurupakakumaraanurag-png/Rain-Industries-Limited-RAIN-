'use client';

import React, { useEffect, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Check,
  Clock,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Toast } from '@/components/ui/Toast';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    show: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const json = await res.json();
        setNotifications(json.notifications || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });

      if (res.ok) {
        setToast({ show: true, message: 'All notifications marked as read', type: 'success' });
        fetchNotifications();
      }
    } catch (err) {
      setToast({ show: true, message: 'Failed to update notifications', type: 'error' });
    }
  };

  const icons: Record<string, any> = {
    INFO: Info,
    WARNING: AlertTriangle,
    SUCCESS: CheckCircle2,
    ALERT: AlertTriangle,
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Bell className="w-5 h-5 text-blue-400" />
            <span>Notification & Alert Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational alerts, task deadlines, and high-priority lead score updates
          </p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-20 text-center text-slate-500 text-xs">No notifications at this time.</div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const Icon = icons[notif.type] || Info;
            return (
              <div
                key={notif.id}
                className={`bg-slate-900/80 border rounded-2xl p-4 transition-all flex items-start space-x-3.5 ${
                  notif.isRead ? 'border-slate-800/60 opacity-60' : 'border-blue-500/30 bg-blue-950/10 shadow-md'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${
                  notif.type === 'ALERT' || notif.type === 'WARNING'
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">{notif.title}</h4>
                    <span className="text-[10px] text-slate-400 font-mono flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(notif.createdAt)}</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{notif.message}</p>

                  {notif.link && (
                    <Link
                      href={notif.link}
                      className="inline-flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300 font-semibold pt-1"
                    >
                      <span>View details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
