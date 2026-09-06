import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Search, 
  Filter, 
  Clock, 
  UserCheck, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  FileText, 
  Layers, 
  Database,
  Lock,
  Download
} from 'lucide-react';
import { AuditLog } from '../types';
import { subscribeToAuditLogs } from '../services/auditLogService';

interface AuditLogsViewProps {
  onTriggerToast: (type: 'success' | 'warning' | 'error' | 'info', msg: string) => void;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ onTriggerToast }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'info' | 'warning' | 'critical'>('all');
  const [isLiveSync, setIsLiveSync] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuditLogs((updatedLogs) => {
      setLogs(updatedLogs);
    });
    return () => unsubscribe();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      log.action.toLowerCase().includes(term) ||
      log.officer.toLowerCase().includes(term) ||
      (log.caseId && log.caseId.toLowerCase().includes(term)) ||
      JSON.stringify(log.details).toLowerCase().includes(term);
    return matchesSeverity && matchesSearch;
  });

  const exportAuditLog = () => {
    const content = JSON.stringify(logs, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ID-SHIELD-AUDIT-TRAIL-${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onTriggerToast('success', 'Audit trail exported successfully as signed JSON.');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Checkpoint Audit &amp; Security Logs
            </h2>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Firestore Sync
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Immutable cryptographic audit trail recording officer overrides, screening submissions, and forensic evaluations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportAuditLog}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            Export Audit Trail
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action, officer, or case ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">Severity:</span>
          {(['all', 'info', 'warning', 'critical'] as const).map((sev) => (
            <button
              key={sev}
              type="button"
              onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg capitalize transition-colors ${
                severityFilter === sev
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <th className="p-3.5">Log ID</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Officer / Agent</th>
                <th className="p-3.5">Case ID</th>
                <th className="p-3.5">Event Details</th>
                <th className="p-3.5">Severity</th>
                <th className="p-3.5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No matching audit logs found in the database.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.logId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 font-mono text-[11px] font-bold text-slate-700 whitespace-nowrap">
                      {log.logId}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="font-mono font-bold text-[11px] text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 font-medium text-slate-800 whitespace-nowrap">
                      {log.officer}
                    </td>
                    <td className="p-3.5 font-mono text-slate-600 whitespace-nowrap">
                      {log.caseId || '—'}
                    </td>
                    <td className="p-3.5 text-slate-600 max-w-xs truncate text-[11px]">
                      {Object.entries(log.details)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(' • ')}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          log.severity === 'critical'
                            ? 'bg-red-100 text-red-800'
                            : log.severity === 'warning'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {log.severity}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {log.timestamp.replace('T', ' ').substring(0, 19)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
