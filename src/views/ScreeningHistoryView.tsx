import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Download, 
  Printer, 
  FileText, 
  SlidersHorizontal, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  Clock,
  Eye
} from 'lucide-react';
import { ScreeningRecord } from '../types';

interface ScreeningHistoryViewProps {
  screenings?: ScreeningRecord[];
  onSelectCase: (record: ScreeningRecord) => void;
  onOpenReport: (record: ScreeningRecord) => void;
  onTriggerToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
}

export const ScreeningHistoryView: React.FC<ScreeningHistoryViewProps> = ({
  screenings = [],
  onSelectCase,
  onOpenReport,
  onTriggerToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');

  const safeScreenings = screenings || [];

  const filtered = safeScreenings.filter((s) => {
    const matchesSearch = 
      s.caseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.person.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.document.docNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || s.document.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesRisk = riskFilter === 'all' || s.riskLevel === riskFilter;
    return matchesSearch && matchesType && matchesStatus && matchesRisk;
  });

  const handleExportCsv = () => {
    const headers = 'CaseID,Person,Nationality,DocType,DocNumber,AIScore,RiskScore,RiskLevel,Status,Date,Officer\n';
    const rows = filtered.map(r => 
      `"${r.caseId}","${r.person.fullName}","${r.person.nationality}","${r.document.typeName}","${r.document.docNumber}",${r.aiScore},${r.riskScore},"${r.riskLevel}","${r.status}","${r.timestamp}","${r.officer}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ID-SHIELD-Screening-History-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onTriggerToast('success', 'Screening history CSV export downloaded.');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Screening History Log
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Immutable audit record of all past checkpoint identity verifications and forensic decisions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Multi-Parameter Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Case ID, Name, Doc #..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 bg-slate-50 hover:bg-white"
            />
          </div>

          {/* Doc Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs p-2 rounded-lg border border-slate-300 bg-white"
          >
            <option value="all">All Document Types</option>
            <option value="passport">Passports (ICAO)</option>
            <option value="visa">Visas & Permits</option>
            <option value="aadhaar">Aadhaar National ID</option>
            <option value="driving_license">Driving Licences</option>
            <option value="travel_auth">Travel Authorizations</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs p-2 rounded-lg border border-slate-300 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="verified">Verified Only</option>
            <option value="suspicious">Suspicious</option>
            <option value="rejected">Rejected</option>
            <option value="manual_review">Manual Review</option>
          </select>

          {/* Risk Level Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="text-xs p-2 rounded-lg border border-slate-300 bg-white"
          >
            <option value="all">All Risk Levels</option>
            <option value="low">Low Risk (0-30)</option>
            <option value="medium">Medium Risk (31-60)</option>
            <option value="high">High Risk (61-80)</option>
            <option value="critical">Critical Risk (81-100)</option>
          </select>
        </div>
      </div>

      {/* Screenings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 text-xs">Screening ID</th>
                <th className="py-3 px-4 text-xs">Date & Time</th>
                <th className="py-3 px-4 text-xs">Document Type</th>
                <th className="py-3 px-4 text-xs">Reference Match</th>
                <th className="py-3 px-4 text-xs">Tampering Status</th>
                <th className="py-3 px-4 text-xs">Face Verification</th>
                <th className="py-3 px-4 text-xs">Risk Score</th>
                <th className="py-3 px-4 text-xs">Risk Level</th>
                <th className="py-3 px-4 text-right text-xs">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((sc) => {
                const refMatch = sc.riskAssessment?.signalsEvaluated?.referenceDatabaseStatus || 'N/A';
                const tampering = sc.pipelineResults?.tamperingDetection === 'warning' ? 'SUSPICIOUS' : sc.pipelineResults?.tamperingDetection === 'completed' ? 'PASSED' : 'UNKNOWN';
                const face = sc.faceVerificationResult ? sc.faceVerificationResult.status.replace('_', ' ') : sc.pipelineResults?.faceMatching === 'completed' ? 'PASSED' : 'UNKNOWN';
                return (
                <tr key={sc.caseId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-blue-700 text-xs">
                    {sc.caseId}
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-xs">
                    {sc.timestamp}
                  </td>
                  <td className="py-3 px-4 text-slate-800 font-semibold text-xs">
                    {sc.document.typeName}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                      refMatch.includes('MATCH') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-600 border border-slate-200'
                    }`}>
                      {refMatch}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                      tampering === 'PASSED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 
                      tampering === 'SUSPICIOUS' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-50 text-slate-600 border border-slate-200'
                    }`}>
                      {tampering}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                      face.includes('MATCH') && !face.includes('NO') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 
                      face.includes('NO') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-slate-50 text-slate-600 border border-slate-200'
                    }`}>
                      {face}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800 text-xs">
                    {sc.riskScore}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 font-semibold text-[10px] uppercase tracking-wider ${
                      sc.riskLevel === 'low' || sc.riskLevel === 'moderate_low' ? 'text-emerald-700' :
                      sc.riskLevel === 'critical' || sc.riskLevel === 'high' ? 'text-red-700' :
                      'text-amber-700'
                    }`}>
                      {sc.riskLevel.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onSelectCase(sc)}
                      className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg shadow-xs"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenReport(sc)}
                      className="px-2.5 py-1 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                    >
                      Report
                    </button>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
