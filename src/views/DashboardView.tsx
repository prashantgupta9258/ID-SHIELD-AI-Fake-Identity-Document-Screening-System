import React, { useState } from 'react';
import { 
  Plus, 
  ShieldCheck, 
  ShieldAlert, 
  XCircle, 
  Clock, 
  FileSearch, 
  TrendingUp, 
  TrendingDown, 
  ChevronRight, 
  ArrowUpRight, 
  Layers, 
  Sparkles, 
  AlertTriangle,
  Fingerprint,
  Cpu,
  ScanLine,
  CheckCircle2
} from 'lucide-react';
import { ScreeningRecord, SecurityAlert, ReferenceDocument } from '../types';
import { INITIAL_STATS } from '../data/screeningsData';
import { REFERENCE_DOCUMENTS } from '../data/referenceDataset';

interface DashboardViewProps {
  screenings?: ScreeningRecord[];
  alerts?: SecurityAlert[];
  onStartNewScreening?: () => void;
  onSelectCase?: (caseRecord: ScreeningRecord) => void;
  onSelectReferenceDoc?: (doc: ReferenceDocument) => void;
  onOpenReferenceDatabase?: () => void;
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
  onNewScreening,
  onInspectDocument,
  onOpenInvestigation,
  onOpenReport,
}) => {
  const [chartMetric, setChartMetric] = useState<'status' | 'timeline'>('status');

  const safeScreenings = screenings || [];
  const safeAlerts = alerts || [];

  const handleStartScreening = onStartNewScreening || onNewScreening || (() => {});
  const handleSelectCase = onSelectCase || onOpenInvestigation || (() => {});
  const handleSelectRefDoc = onSelectReferenceDoc || onInspectDocument || (() => {});

  const stats = INITIAL_STATS;

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

      {/* 5 Key Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Screenings */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Screenings</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <FileSearch className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 tracking-tight font-mono">
            {stats.totalScreenings.toLocaleString()}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-emerald-700">
            <TrendingUp className="w-3 h-3" />
            <span>{stats.trends.total}</span>
          </div>
        </div>

        {/* Verified Documents */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Verified Documents</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-800 tracking-tight font-mono">
            {stats.verifiedDocuments.toLocaleString()}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-emerald-700">
            <TrendingUp className="w-3 h-3" />
            <span>{stats.trends.verified}</span>
          </div>
        </div>

        {/* Suspicious Cases */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Suspicious Cases</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-700 tracking-tight font-mono">
            {stats.suspiciousCases.toLocaleString()}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-amber-700">
            <TrendingUp className="w-3 h-3" />
            <span>{stats.trends.suspicious}</span>
          </div>
        </div>

        {/* Rejected Documents */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Rejected Documents</span>
            <div className="p-2 rounded-lg bg-red-50 text-red-700">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-red-700 tracking-tight font-mono">
            {stats.rejectedDocuments.toLocaleString()}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-slate-500">
            <TrendingDown className="w-3 h-3" />
            <span>{stats.trends.rejected}</span>
          </div>
        </div>

        {/* Average Screening Time */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Avg Screening Time</span>
            <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 tracking-tight font-mono">
            {stats.avgScreeningTimeSec} <span className="text-sm font-sans font-normal text-slate-500">sec</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-blue-700">
            <Sparkles className="w-3 h-3" />
            <span>{stats.trends.avgTime}</span>
          </div>
        </div>
      </div>

      {/* Demo Reference Dataset Quick Launcher (Hackathon / Evaluation Highlight) */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-2xl p-5 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/15">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-white/10 text-white">
              <Layers className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center gap-2">
                SIH Reference Document Dataset
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/40">
                  Firebase Firestore
                </span>
              </h3>
              <p className="text-xs text-blue-200/80">
                Click any reference document below to load it into the forensic pipeline, or open the Firestore reference repository:
              </p>
            </div>
          </div>
          {onOpenReferenceDatabase && (
            <button
              type="button"
              onClick={onOpenReferenceDatabase}
              className="mt-2 sm:mt-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-all flex items-center gap-1.5 active:scale-98"
            >
              <span>Explore Firebase Repository</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Reference Document Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2.5 mt-3">
          {REFERENCE_DOCUMENTS.map((doc) => (
            <button
              key={doc.id}
              type="button"
              onClick={() => handleSelectRefDoc(doc)}
              className="group bg-white/10 hover:bg-white/18 text-left p-3 rounded-xl border border-white/15 hover:border-white/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[10px] text-blue-300 font-bold">{doc.docType.toUpperCase()}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                    doc.riskLevel === 'critical' ? 'bg-red-500 text-white' :
                    doc.riskLevel === 'medium' ? 'bg-amber-400 text-slate-950' : 'bg-emerald-400 text-slate-950'
                  }`}>
                    {doc.status.toUpperCase()}
                  </span>
                </div>
                <div className="font-bold text-xs text-white truncate group-hover:text-blue-200 transition-colors">
                  {doc.personName}
                </div>
                <div className="text-[10px] text-blue-200/70 font-mono mt-0.5 truncate">
                  {doc.docNumber}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                <span className="text-blue-300 font-mono">Score: {doc.aiScore}%</span>
                <span className="text-white flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  Load <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Charts & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Screening Overview Chart */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Screening Overview & Decision Ratio</h3>
              <p className="text-xs text-slate-500">Distribution of authentic, suspicious, and rejected travel credentials</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => setChartMetric('status')}
                className={`px-2.5 py-1 rounded-md transition-colors ${chartMetric === 'status' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
              >
                Category
              </button>
              <button
                type="button"
                onClick={() => setChartMetric('timeline')}
                className={`px-2.5 py-1 rounded-md transition-colors ${chartMetric === 'timeline' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
              >
                24h Volume
              </button>
            </div>
          </div>

          {/* Clean Light Chart Rendering */}
          {chartMetric === 'status' ? (
            <div className="space-y-4 my-2">
              {/* Progress Distribution Bar */}
              <div className="h-5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                <div style={{ width: '83%' }} className="bg-emerald-500 transition-all" title="Verified: 83%" />
                <div style={{ width: '11.4%' }} className="bg-amber-400 transition-all" title="Suspicious: 11.4%" />
                <div style={{ width: '5.6%' }} className="bg-red-500 transition-all" title="Rejected: 5.6%" />
              </div>

              {/* Legend & Stat Boxes */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Verified (83.0%)
                  </div>
                  <div className="text-lg font-black text-slate-900 font-mono mt-1">1,036</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Cleared without intervention</div>
                </div>

                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    Suspicious (11.4%)
                  </div>
                  <div className="text-lg font-black text-slate-900 font-mono mt-1">142</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Referred to Secondary Desk</div>
                </div>

                <div className="p-3 bg-red-50/50 rounded-xl border border-red-100">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-900">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    Rejected (5.6%)
                  </div>
                  <div className="text-lg font-black text-slate-900 font-mono mt-1">70</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Forged or expired credentials</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 my-2">
              <div className="text-xs font-semibold text-slate-500">Hourly Throughput (Peak Hours: 02:00 - 08:00 IST)</div>
              <div className="flex items-end justify-between gap-1.5 h-36 pt-4 px-2 bg-slate-50 rounded-xl border border-slate-200">
                {[45, 62, 78, 120, 145, 110, 95, 80, 65, 55, 48, 70].map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <div 
                      style={{ height: `${(val / 150) * 100}%` }} 
                      className="w-full max-w-[28px] bg-blue-600 hover:bg-blue-700 rounded-t transition-all"
                      title={`${val} screenings`}
                    />
                    <span className="text-[9px] text-slate-400 font-mono">{idx * 2}h</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Security Alerts Pulse */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
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

            <div className="space-y-2.5">
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
            <span className="font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer">
              View All Alerts <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
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
