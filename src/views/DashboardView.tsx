import React, { useState } from 'react';
import { 
  Plus, 
  ShieldAlert, 
  XCircle, 
  Clock, 
  ChevronRight, 
  AlertTriangle,
  Fingerprint,
  Cpu,
  ScanLine,
  CheckCircle2
} from 'lucide-react';
import { ScreeningRecord, SecurityAlert, ReferenceDocument } from '../types';

interface DashboardViewProps {
  screenings?: ScreeningRecord[];
  alerts?: SecurityAlert[];
  onStartNewScreening?: () => void;
  onSelectCase?: (caseRecord: ScreeningRecord) => void;
  onSelectReferenceDoc?: (doc: ReferenceDocument) => void;
  onOpenReferenceDatabase?: () => void;
  onViewAllAlerts?: () => void;
  // Aliases for compatibility
  onNewScreening?: () => void;
  onInspectDocument?: (doc: ReferenceDocument) => void;
  onOpenInvestigation?: (caseRecord: ScreeningRecord) => void;
  onOpenReport?: (caseRecord: ScreeningRecord) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  screenings = [],
  alerts = [],
  onStartNewScreening,
  onSelectCase,
  onSelectReferenceDoc,
  onOpenReferenceDatabase,
  onViewAllAlerts,
  onNewScreening,
  onInspectDocument,
  onOpenInvestigation,
  onOpenReport,
}) => {
  const safeScreenings = screenings || [];
  const safeAlerts = alerts || [];

  const handleStartScreening = onStartNewScreening || onNewScreening || (() => {});
  const handleSelectCase = onSelectCase || onOpenInvestigation || (() => {});
  const handleSelectRefDoc = onSelectReferenceDoc || onInspectDocument || (() => {});
  const handleViewAllAlerts = onViewAllAlerts || (() => {});

  return (
    <div className="space-y-6">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Screening Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            AI-powered identity and document verification overview across checkpoints
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-dashboard-new-screening"
            type="button"
            onClick={handleStartScreening}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            + New Screening
          </button>
        </div>
      </div>

      {/* Security Alerts Pulse */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Live Border Alerts
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
              {safeAlerts.length} Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Real-time heuristic flags transmitted from border checkpoint gates
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {safeAlerts.slice(0, 3).map((alert) => (
              <div 
                key={alert.id}
                onClick={() => {
                  const found = safeScreenings.find(s => s.caseId === alert.caseId);
                  if (found) handleSelectCase(found);
                }}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 cursor-pointer transition-colors space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                    alert.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {alert.severity}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{alert.caseId}</span>
                </div>
                <div className="font-bold text-slate-800 text-xs truncate">
                  {alert.title}
                </div>
                <div className="text-[11px] text-slate-500 line-clamp-1">
                  {alert.flagReason}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">Auto-refresh: Every 10s</span>
          <span 
            role="button"
            tabIndex={0}
            onClick={handleViewAllAlerts}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleViewAllAlerts();
              }
            }}
            className="font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer select-none transition-all active:scale-95 focus:outline-hidden focus:underline"
          >
            View All Alerts <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Recent Screenings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Recent Screening Records</h3>
            <p className="text-xs text-slate-500">Live operational feed from border e-gates and immigration counters</p>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            Showing {safeScreenings.length} latest cases
          </div>
        </div>

        {/* Responsive Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Case ID</th>
                <th className="py-3 px-4">Person</th>
                <th className="py-3 px-4">Document Type</th>
                <th className="py-3 px-4">Nationality</th>
                <th className="py-3 px-4">AI Score</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {safeScreenings.map((sc) => (
                <tr key={sc.caseId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-blue-700">
                    {sc.caseId}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-800">{sc.person.fullName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{sc.document.docNumber}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {sc.document.typeName}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {sc.person.nationality}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${sc.aiScore}%` }} 
                          className={`h-full ${sc.aiScore > 90 ? 'bg-emerald-500' : sc.aiScore > 75 ? 'bg-amber-500' : 'bg-red-500'}`} 
                        />
                      </div>
                      <span className="font-mono font-semibold text-slate-700 text-[11px]">{sc.aiScore}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      sc.riskLevel === 'critical' ? 'bg-red-100 text-red-800 border border-red-200' :
                      sc.riskLevel === 'high' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                      sc.riskLevel === 'medium' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {sc.riskLevel}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                      sc.status === 'verified' ? 'text-emerald-700' :
                      sc.status === 'rejected' ? 'text-red-700' :
                      sc.status === 'suspicious' ? 'text-amber-700' : 'text-blue-700'
                    }`}>
                      {sc.status === 'verified' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {sc.status === 'rejected' && <XCircle className="w-3.5 h-3.5" />}
                      {sc.status === 'suspicious' && <ShieldAlert className="w-3.5 h-3.5" />}
                      {sc.status === 'manual_review' && <Clock className="w-3.5 h-3.5" />}
                      {sc.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {sc.timestamp.split(' ')[0]}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleSelectCase(sc)}
                      className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Section: AI Detection Summary & Checkpoint Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: AI Detection Summary */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm sm:text-base">AI Detection Engine Summary</h4>
                <p className="text-xs text-slate-500">Multi-vector forensic heuristics performance</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              99.8% Precision
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-600">MRZ & Barcode Checksum Accuracy</span>
              <span className="font-mono font-bold text-slate-900">99.98% (MOD 7/10 Valid)</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Microprint & Guilloche Line Pattern Integrity</span>
              <span className="font-mono font-bold text-slate-900">98.4% Match Rate</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Photographic Manipulation / ELA Sensitivity</span>
              <span className="font-mono font-bold text-slate-900">0.05% False Positive Rate</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Cross-Database Latency (Interpol / Bureau of Immigration)</span>
              <span className="font-mono font-bold text-slate-900">142 ms Average</span>
            </div>
          </div>
        </div>

        {/* Card 2: Immigration Checkpoint Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                <ScanLine className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm sm:text-base">Checkpoint Terminal Status</h4>
                <p className="text-xs text-slate-500">Integrated border gates and hardware scanners</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              18/18 Connected
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-600">IGI Airport Terminal 3 (E-Gates 01-12)</span>
              <span className="font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Normal Throughput
              </span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Attari Land Border ICP (Counters A1-B4)</span>
              <span className="font-semibold text-amber-700 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> High Alert Level
              </span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Port Blair Airport Domestic / PAP Verification</span>
              <span className="font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Operational
              </span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Biometric Facial Live Capture Cameras</span>
              <span className="font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Synchronized
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
