'use client';

import React, { useEffect, useState } from 'react';
import {
  FileCheck2,
  Search,
  Filter,
  Shield,
  Clock,
  User,
  Activity,
  Code,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [selectedLogForMeta, setSelectedLogForMeta] = useState<any>(null);

  useEffect(() => {
    fetchLogs();
  }, [entityFilter, actionFilter]);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (entityFilter !== 'ALL') params.set('entity', entityFilter);
      if (actionFilter !== 'ALL') params.set('action', actionFilter);

      const res = await fetch(`/api/audit-logs?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setLogs(json.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <FileCheck2 className="w-5 h-5 text-blue-400" />
            <span>Compliance & Security Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable log of all user actions, state changes, conversions, and logins
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="ALL">All Entities</option>
            <option value="Lead">Lead</option>
            <option value="Opportunity">Opportunity</option>
            <option value="Company">Company</option>
            <option value="Contact">Contact</option>
            <option value="Task">Task</option>
            <option value="Activity">Activity</option>
            <option value="User">User</option>
          </select>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="ALL">All Actions</option>
            <option value="LEAD_CREATED">LEAD_CREATED</option>
            <option value="LEAD_UPDATED">LEAD_UPDATED</option>
            <option value="LEAD_CONVERTED">LEAD_CONVERTED</option>
            <option value="LEAD_DELETED">LEAD_DELETED</option>
            <option value="OPPORTUNITY_CREATED">OPPORTUNITY_CREATED</option>
            <option value="OPPORTUNITY_STAGE_CHANGED">STAGE_CHANGED</option>
            <option value="USER_LOGIN">USER_LOGIN</option>
          </select>
        </div>

        <span className="text-xs text-slate-400 font-medium">Showing {logs.length} Audit Events</span>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400">Loading audit trail...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center text-slate-500 text-xs">No audit logs recorded for this filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-3">Actor / Email</th>
                  <th className="py-3 px-3">Action</th>
                  <th className="py-3 px-3">Entity Type</th>
                  <th className="py-3 px-3">Entity ID</th>
                  <th className="py-3 px-4 text-right">Payload Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{log.actor?.name || 'System / Auto'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.actorEmail}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300 font-medium">{log.entity}</td>
                    <td className="py-3 px-3 text-slate-400 font-mono text-[10px] max-w-[120px] truncate">
                      {log.entityId}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {log.metadata ? (
                        <button
                          onClick={() => setSelectedLogForMeta(log)}
                          className="text-xs text-blue-400 hover:text-blue-300 font-mono underline"
                        >
                          View JSON
                        </button>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* JSON Payload Modal */}
      <Modal
        isOpen={Boolean(selectedLogForMeta)}
        onClose={() => setSelectedLogForMeta(null)}
        title="Audit Event Payload Metadata"
        subtitle={`Action: ${selectedLogForMeta?.action} by ${selectedLogForMeta?.actorEmail}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-emerald-400 text-xs font-mono overflow-x-auto max-h-96">
            {selectedLogForMeta?.metadata
              ? JSON.stringify(JSON.parse(selectedLogForMeta.metadata), null, 2)
              : 'No metadata attached.'}
          </pre>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setSelectedLogForMeta(null)}
              className="bg-slate-800 text-white px-4 py-1.5 rounded-xl text-xs font-semibold hover:bg-slate-700"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
