import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Search, 
  Filter, 
  FileText, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { ScreeningRecord, RiskLevel } from '../types';

interface SuspiciousCasesViewProps {
  cases?: ScreeningRecord[];
  onSelectCase: (record: ScreeningRecord) => void;
}

export const SuspiciousCasesView: React.FC<SuspiciousCasesViewProps> = ({
  cases = [],
  onSelectCase,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const safeCases = cases || [];

  // Filter for cases with medium, high, critical risk or suspicious status
  const suspiciousCases = safeCases.filter((c) => {
    const isFlagged = c.status === 'suspicious' || c.status === 'rejected' || c.status === 'manual_review' || c.riskScore > 30;
    const matchesSeverity = filterSeverity === 'all' || c.riskLevel === filterSeverity;
    const matchesQuery = 
      c.caseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.person.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.document.docNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return isFlagged && matchesSeverity && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-600" />
            Alerts & Suspicious Cases
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Cases requiring additional review or officer verification due to forensic heuristic flags
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-amber-900 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
            {suspiciousCases.length} Pending Referrals
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search flagged cases by Case ID, name, or document number..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 hover:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Severity:
          </span>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="text-xs p-2 rounded-lg border border-slate-300 bg-white"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical Risk Only</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
          </select>
        </div>
      </div>

      {/* Suspicious Cases Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Case ID</th>
                <th className="py-3.5 px-4">Person</th>
                <th className="py-3.5 px-4">Document</th>
                <th className="py-3.5 px-4">Risk Score</th>
                <th className="py-3.5 px-4">Primary Anomaly Detection</th>
                <th className="py-3.5 px-4">AI Confidence</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {suspiciousCases.map((sc) => {
                const primaryFinding = sc.findings[0]?.title || 'Multi-heuristic threshold exceeded';
                return (
                  <tr key={sc.caseId} className="hover:bg-slate-50/90 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                      {sc.caseId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{sc.person.fullName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{sc.person.nationality}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-medium">{sc.document.typeName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{sc.document.docNumber}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-mono font-black text-sm ${
                          sc.riskScore > 70 ? 'text-red-700' : 'text-amber-700'
                        }`}>
                          {sc.riskScore}
                        </span>
                        <span className="text-[10px] text-slate-400">/100</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="text-slate-800 font-semibold truncate">{primaryFinding}</div>
                      <div className="text-[10px] text-slate-500 line-clamp-1">
                        {sc.findings[0]?.description || 'Further inspection recommended'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                      {sc.aiScore}%
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        sc.riskLevel === 'critical' ? 'bg-red-100 text-red-800 border border-red-200' :
                        'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {sc.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {sc.timestamp.split(' ')[0]}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectCase(sc)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Investigate
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
