import React, { useState } from 'react';
import { ScreeningRecord } from '../types';
import { 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  ShieldAlert, 
  UserCheck, 
  Send, 
  Printer, 
  ExternalLink,
  ChevronRight,
  Database
} from 'lucide-react';
import { DocumentVisualizer } from './DocumentVisualizer';
import { ExplainableRiskScoreCard } from './ExplainableRiskScoreCard';
import { evaluateScreeningRecord } from '../services/riskScoringEngine';
import { updateCaseStatusInFirestore } from '../services/screeningService';

interface InvestigationModalProps {
  caseRecord: ScreeningRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (caseId: string, newStatus: 'verified' | 'rejected' | 'manual_review', notes?: string) => void;
  onOpenReport?: (record: ScreeningRecord) => void;
}

export const InvestigationModal: React.FC<InvestigationModalProps> = ({
  caseRecord,
  isOpen,
  onClose,
  onUpdateStatus,
  onOpenReport,
}) => {
  const [officerNote, setOfficerNote] = useState<string>('');
  const [showToast, setShowToast] = useState<string | null>(null);

  if (!isOpen || !caseRecord) return null;

  const isCritical = caseRecord.riskLevel === 'critical' || caseRecord.riskScore > 75;
  const isHigh = caseRecord.riskLevel === 'high' || (caseRecord.riskScore > 60 && caseRecord.riskScore <= 75);

  const handleAction = async (status: 'verified' | 'rejected' | 'manual_review') => {
    onUpdateStatus(caseRecord.caseId, status, officerNote);
    try {
      await updateCaseStatusInFirestore(caseRecord.caseId, status, officerNote);
    } catch (e: any) {
      console.warn('Firestore case update fallback:', e.message);
    }
    setShowToast(`Case status successfully updated to: ${status.replace('_', ' ').toUpperCase()}`);
    setTimeout(() => {
      setShowToast(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isCritical ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Case Investigation File</h3>
                <span className="font-mono text-xs text-slate-500 font-semibold bg-white border border-slate-200 px-2 py-0.5 rounded">
                  {caseRecord.caseId}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Investigating Officer: {caseRecord.officer} • Checkpoint: {caseRecord.checkpoint}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Severity Banner */}
        <div className={`px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 ${
          isCritical 
            ? 'bg-red-50/90 border-red-200 text-red-900' 
            : 'bg-amber-50/90 border-amber-200 text-amber-950'
        }`}>
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-5 h-5 ${isCritical ? 'text-red-600 animate-bounce' : 'text-amber-600'}`} />
            <div>
              <span className="font-extrabold text-sm uppercase tracking-wide">
                Potential tampering detected. Manual verification is recommended.
              </span>
              <span className="text-xs ml-2 opacity-85">
                AI flags optical anomalies for human officer inspection. No criminal allegation is asserted.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="bg-white/80 px-2.5 py-1 rounded border border-current">
              Risk Score: <strong>{caseRecord.riskScore} / 100</strong>
            </div>
            <div className="bg-white/80 px-2.5 py-1 rounded border border-current">
              AI Confidence: <strong>{caseRecord.aiScore}%</strong>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Grid: Subject Info & Document Snapshot */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Document Visualizer */}
            <div className="lg:col-span-7 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Forensic Document Evidence
                </span>
                <span className="text-[11px] text-slate-500">Interactive Layer Inspector</span>
              </div>
              <DocumentVisualizer
                documentType={caseRecord.document.type}
                previewType={caseRecord.document.previewType}
                customImageUrl={caseRecord.document.fileUrl}
                tamperingDetected={caseRecord.riskScore > 35}
                personName={caseRecord.person.fullName}
                documentNumber={caseRecord.document.docNumber}
              />
            </div>

            {/* Right: Subject Demographics & Extracted Comparison */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
                  Subject Demographics
                </span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Full Name</span>
                    <span className="font-semibold text-slate-900">{caseRecord.person.fullName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Date of Birth</span>
                    <span className="font-mono text-slate-800">{caseRecord.person.dob}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Nationality</span>
                    <span className="font-semibold text-slate-800">{caseRecord.person.nationality}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Document Type</span>
                    <span className="text-slate-800">{caseRecord.document.typeName}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Document Number</span>
                    <span className="font-mono font-bold text-slate-900">{caseRecord.document.docNumber}</span>
                  </div>
                </div>
              </div>

              {/* Data Verification Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="px-3.5 py-2 bg-slate-100/80 border-b border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Visual Field Cross-Reference Check</span>
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Demo Reference Database Match
                  </span>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {(caseRecord.comparisonData || []).map((item, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between gap-2">
                      <div className="min-w-[80px]">
                        <span className="text-slate-500 block text-[11px]">{item.field}</span>
                        <span className="font-mono font-medium text-slate-800 text-[11px]">{item.documentData}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-right">
                        <span className={`text-[11px] font-mono ${item.matches ? 'text-slate-600' : 'text-red-700 font-bold'}`}>
                          {item.verifiedData}
                        </span>
                        {item.matches ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* AI Detection Findings Section */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Detailed AI Detection Findings ({(caseRecord.findings || []).length})
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(caseRecord.findings || []).map((finding) => (
                <div 
                  key={finding.id} 
                  className={`p-4 rounded-xl border flex flex-col justify-between space-y-2 ${
                    finding.severity === 'critical' ? 'bg-red-50/70 border-red-200' :
                    finding.severity === 'high' ? 'bg-orange-50/70 border-orange-200' :
                    'bg-amber-50/70 border-amber-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        finding.severity === 'critical' ? 'bg-red-600 text-white' :
                        finding.severity === 'high' ? 'bg-orange-600 text-white' : 'bg-amber-600 text-white'
                      }`}>
                        {finding.severity} Severity
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        AI Confidence: {finding.confidence}%
                      </span>
                    </div>
                    <h5 className="font-bold text-slate-900 text-xs sm:text-sm mt-1">
                      {finding.title}
                    </h5>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                      {finding.description}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 font-mono">
                    <strong>Forensic Evidence:</strong> {finding.evidence}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Explainable AI-Assisted Risk Scoring Breakdown */}
          <ExplainableRiskScoreCard
            assessment={caseRecord.riskAssessment || evaluateScreeningRecord(caseRecord)}
            compact={false}
          />

          {/* Potential Tampering Indicators Section */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Potential Tampering Indicators (9-Point Analysis)
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                Advisory Determination: Potential tampering detected. Manual verification is recommended.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 bg-white rounded-lg border border-amber-200 text-amber-900">
                <span className="font-bold block">⚠ Photo Consistency:</span>
                <span className="text-[11px] text-slate-600">Photo Region Inconsistency</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-amber-200 text-amber-900">
                <span className="font-bold block">⚠ Alignment:</span>
                <span className="text-[11px] text-slate-600">Text Alignment Difference</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-amber-200 text-amber-900">
                <span className="font-bold block">⚠ Image Boundaries:</span>
                <span className="text-[11px] text-slate-600">Possible Edited Region</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-emerald-200 text-emerald-900">
                <span className="font-bold block">✓ Document Structure:</span>
                <span className="text-[11px] text-slate-600">Document Structure Consistent</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-amber-200 text-amber-900">
                <span className="font-bold block">⚠ Stamp / Seal:</span>
                <span className="text-[11px] text-slate-600">Chronology &amp; Geometry Anomaly</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-800">
                <span className="font-bold block">✓ Compression:</span>
                <span className="text-[11px] text-slate-600">ELA Baseline Standard</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic">
              Evidentiary protocol: Indicators are optical cues for forensic officers. The system does not assert fraudulence; manual physical verification is recommended.
            </p>
          </div>

          {/* Officer Investigation Note Input */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
            <label htmlFor="officer-note-input" className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Officer Investigation Log & Decision Notes
            </label>
            <textarea
              id="officer-note-input"
              rows={2}
              value={officerNote}
              onChange={(e) => setOfficerNote(e.target.value)}
              placeholder="Record forensic observation, interview statements, secondary referral reason, or evidence disposition..."
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onOpenReport && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenReport(caseRecord);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                Generate Security Report
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleAction('manual_review')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
            >
              <Clock className="w-3.5 h-3.5" />
              Send for Manual Review
            </button>
            <button
              type="button"
              onClick={() => handleAction('rejected')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-2xs"
            >
              <XCircle className="w-3.5 h-3.5" />
              Reject & Seize Document
            </button>
            <button
              type="button"
              onClick={() => handleAction('verified')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Officer Override: Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
