import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  HelpCircle, 
  Database, 
  Scan, 
  FileText, 
  ArrowRight, 
  RefreshCw, 
  ShieldCheck, 
  ShieldAlert, 
  Upload, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info,
  Check,
  AlertCircle
} from 'lucide-react';
import { 
  CanonicalDocumentType, 
  CrossCheckMatchState, 
  CrossCheckPipelineResult,
  RiskLevel
} from '../types';
import { 
  executeDemoCrossCheck, 
  CROSS_CHECK_COMPLIANCE, 
  CROSS_CHECK_FIELD_SPECS 
} from '../services/crossCheckEngine';
import { DEMO_RAW_DOCUMENTS } from '../data/demoReferenceAssets';

interface CrossCheckEngineVisualizerProps {
  initialDocumentType?: CanonicalDocumentType;
  onSendToScreening?: (result: CrossCheckPipelineResult) => void;
  onTriggerToast?: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
}

export const CrossCheckEngineVisualizer: React.FC<CrossCheckEngineVisualizerProps> = ({
  initialDocumentType = 'PASSPORT',
  onSendToScreening,
  onTriggerToast,
}) => {
  const [selectedType, setSelectedType] = useState<CanonicalDocumentType>(initialDocumentType);
  const [activeBenchmark, setActiveBenchmark] = useState<string>('MATCH_94');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(12);
  const [currentStepName, setCurrentStepName] = useState<string>('Completed');
  const [pipelineResult, setPipelineResult] = useState<CrossCheckPipelineResult | null>(null);

  const WORKFLOW_STEPS = [
    { num: 1, name: 'User Uploads Image' },
    { num: 2, name: 'AI Reads Image' },
    { num: 3, name: 'Doc Type Detection' },
    { num: 4, name: 'Doc Classification' },
    { num: 5, name: 'OCR' },
    { num: 6, name: 'Structured Extraction' },
    { num: 7, name: 'Field Normalization' },
    { num: 8, name: 'Firebase DB Search' },
    { num: 9, name: 'Ref Doc Matching' },
    { num: 10, name: 'Visual Consistency' },
    { num: 11, name: 'Match Score' },
    { num: 12, name: 'Screening Report' },
  ];

  // Run pipeline when benchmark or doc type changes
  const runPipeline = async (benchmarkKey: string, docType: CanonicalDocumentType) => {
    setIsExecuting(true);
    setCurrentStepIndex(1);
    setCurrentStepName('Receiving Uploaded Document Image');

    try {
      let benchmarkPresetId: string | undefined = undefined;
      let manualFields: Record<string, string> | undefined = undefined;
      let ocrOverride: string | undefined = undefined;

      if (benchmarkKey === 'MATCH_94') {
        benchmarkPresetId = undefined;
        // Default clean document for that type
        const matchAsset = DEMO_RAW_DOCUMENTS.find(d => d.category === docType);
        if (matchAsset) {
          ocrOverride = matchAsset.ocrText;
          manualFields = {
            fullName: matchAsset.samplePerson.fullName,
            passportNumber: matchAsset.samplePerson.docNumber,
            docNumber: matchAsset.samplePerson.docNumber,
            nationality: matchAsset.samplePerson.nationality,
            dateOfBirth: matchAsset.samplePerson.dob,
            gender: matchAsset.samplePerson.gender,
            dateOfExpiry: matchAsset.samplePerson.expiryDate,
          };
        }
      } else if (benchmarkKey === 'PARTIAL_61') {
        // User example:
        // Reference Status: PARTIAL_REFERENCE_MATCH
        // Match Score: 61%
        // Matched: ✓ Passport Number, ✓ Nationality
        // Mismatch: ⚠ Name, ⚠ Date of Birth
        // This should trigger manual review.
        benchmarkPresetId = 'PARTIAL_MISMATCH';
        ocrOverride = 'P<INDSPLICED<<SURNAME<<<<<<<<<<\nZ1234567<0IND9901015M3301193';
        manualFields = {
          fullName: 'VIKRAM OBEROI (ALTERED)',
          name: 'VIKRAM OBEROI (ALTERED)',
          passportNumber: 'Z1234567',
          visaNumber: 'V98765432',
          identityNumber: '9845 2314 6789',
          licenseNumber: 'DL-0420180092147',
          permitNumber: 'RAP-2024-DEL-00918',
          documentNumber: 'ETA-IND-8839104',
          nationality: 'INDIAN',
          dateOfBirth: '1999-01-01', // Mismatched DOB
          gender: 'MALE',
        };
      } else if (benchmarkKey === 'NO_MATCH') {
        ocrOverride = 'UNKNOWN RECORD NOT IN REFERENCE DATASET UNREGISTERED HOLDER';
        manualFields = {
          passportNumber: 'ZZ9999999',
          fullName: 'UNREGISTERED APPLICANT',
          nationality: 'UNKNOWN',
        };
      } else if (benchmarkKey === 'UNABLE_TO_VERIFY') {
        ocrOverride = '### SMUDGED TEXT OCCLUDED CORRUPT PIXELS ###';
        manualFields = {};
      }

      const res = await executeDemoCrossCheck(
        {
          forceDocumentType: docType,
          benchmarkPresetId,
          manualFieldsOverride: manualFields,
          ocrTextOverride: ocrOverride,
        },
        (step, name) => {
          setCurrentStepIndex(step);
          setCurrentStepName(name);
        }
      );

      setPipelineResult(res);
      onTriggerToast?.('info', `Cross-Check complete: ${res.matchState} (${res.matchScore}%)`);
    } catch (err: any) {
      console.error('Pipeline execution error:', err);
      onTriggerToast?.('error', 'Cross-check pipeline failed: ' + err.message);
    } finally {
      setIsExecuting(false);
      setCurrentStepIndex(12);
      setCurrentStepName('Complete');
    }
  };

  useEffect(() => {
    runPipeline(activeBenchmark, selectedType);
  }, [activeBenchmark, selectedType]);

  const getMatchStateBadge = (state: CrossCheckMatchState) => {
    switch (state) {
      case 'REFERENCE_MATCH':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
          label: 'REFERENCE_MATCH',
        };
      case 'PARTIAL_REFERENCE_MATCH':
        return {
          bg: 'bg-amber-50 text-amber-900 border-amber-300',
          icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
          label: 'PARTIAL_REFERENCE_MATCH',
        };
      case 'NO_REFERENCE_MATCH':
        return {
          bg: 'bg-rose-50 text-rose-900 border-rose-300',
          icon: <XCircle className="w-4 h-4 text-rose-600" />,
          label: 'NO_REFERENCE_MATCH',
        };
      case 'UNABLE_TO_VERIFY':
        return {
          bg: 'bg-slate-100 text-slate-800 border-slate-300',
          icon: <HelpCircle className="w-4 h-4 text-slate-600" />,
          label: 'UNABLE_TO_VERIFY',
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-6">
      {/* Top Header Banner */}
      <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[11px] font-black uppercase tracking-wider">
              Core Engine
            </span>
            <span className="text-xs text-slate-500 font-medium">12-Step Cross-Check Workflow</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
            Demo Reference Cross-Check Engine
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Cross-references OCR extracted fields against the controlled Firebase <code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded text-xs font-mono">referenceDocuments</code> collection.
          </p>
        </div>

        {/* Mandatory Disclaimer Callout */}
        <div className="max-w-md bg-white border border-amber-200 rounded-xl p-3 shadow-2xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed text-slate-700">
            <strong className="text-amber-900 font-bold block mb-0.5">Demo Compliance Protocol</strong>
            {CROSS_CHECK_COMPLIANCE.disclaimer}
          </div>
        </div>
      </div>

      {/* Control Bar: Benchmark Test Suite & Document Type Selector */}
      <div className="px-6 space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Document Type Selector */}
          <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-1">
            <span className="text-xs font-bold text-slate-500 uppercase whitespace-nowrap">Document:</span>
            {(['PASSPORT', 'VISA', 'NATIONAL_ID', 'DRIVING_LICENSE', 'PERMIT', 'TRAVEL_AUTHORIZATION'] as CanonicalDocumentType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border ${
                  selectedType === type
                    ? 'bg-blue-600 text-white border-blue-700 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Test Case Benchmarks for SIH Judges */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full lg:w-auto overflow-x-auto">
            <span className="text-[11px] font-bold text-slate-500 px-2 uppercase whitespace-nowrap">Test State:</span>
            <button
              type="button"
              onClick={() => setActiveBenchmark('MATCH_94')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeBenchmark === 'MATCH_94'
                  ? 'bg-white text-emerald-800 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Full Match (94%)
            </button>
            <button
              type="button"
              onClick={() => setActiveBenchmark('PARTIAL_61')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeBenchmark === 'PARTIAL_61'
                  ? 'bg-white text-amber-800 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Partial Match (61%)
            </button>
            <button
              type="button"
              onClick={() => setActiveBenchmark('NO_MATCH')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeBenchmark === 'NO_MATCH'
                  ? 'bg-white text-rose-800 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              No Match (0%)
            </button>
            <button
              type="button"
              onClick={() => setActiveBenchmark('UNABLE_TO_VERIFY')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeBenchmark === 'UNABLE_TO_VERIFY'
                  ? 'bg-white text-slate-800 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Unable to Verify
            </button>
          </div>
        </div>

        {/* 12-Step Horizontal Workflow Progress Ribbon */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-2 font-medium">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isExecuting ? 'animate-spin' : ''}`} />
              Verification Workflow Progress
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              {isExecuting ? `Step ${currentStepIndex}/12: ${currentStepName}` : 'All 12 Verification Steps Complete'}
            </span>
          </div>
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-1">
            {WORKFLOW_STEPS.map((s) => {
              const isDone = s.num <= currentStepIndex;
              const isCurrent = s.num === currentStepIndex && isExecuting;
              return (
                <div
                  key={s.num}
                  className={`p-1.5 rounded text-center transition-all border ${
                    isCurrent
                      ? 'bg-blue-600 text-white border-blue-700 shadow-sm animate-pulse'
                      : isDone
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                        : 'bg-white text-slate-400 border-slate-200 opacity-60'
                  }`}
                  title={`${s.num}. ${s.name}`}
                >
                  <div className="text-[9px] font-mono font-bold leading-none">0{s.num < 10 ? `0${s.num}` : s.num}</div>
                  <div className="text-[9px] font-medium truncate mt-0.5">{s.name}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Results Grid */}
      {pipelineResult && (
        <div className="px-6 pb-6 space-y-6">
          {/* Status Header Banner */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-50/80 p-4 rounded-xl border border-slate-200">
            {/* Left: Required Match State & Compliance Titles */}
            <div className="md:col-span-8 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reference Status:</span>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold border ${getMatchStateBadge(pipelineResult.matchState).bg}`}>
                  {getMatchStateBadge(pipelineResult.matchState).icon}
                  {pipelineResult.matchState}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">
                  {CROSS_CHECK_COMPLIANCE.referenceStatus}
                </span>
              </div>
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-800">{CROSS_CHECK_COMPLIANCE.datasetSource}</span>
                {pipelineResult.matchedReferenceRecord && (
                  <span className="text-slate-500"> • Document ID: <code className="font-mono text-blue-700 font-bold">{pipelineResult.matchedReferenceRecord.referenceDocumentId}</code></span>
                )}
              </div>
            </div>

            {/* Right: Match Score & Risk Score Badges */}
            <div className="md:col-span-4 flex items-center justify-end gap-3">
              <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-center shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Match Score</span>
                <span className={`text-xl font-black font-mono ${
                  pipelineResult.matchScore >= 80 ? 'text-emerald-700' :
                  pipelineResult.matchScore >= 50 ? 'text-amber-700' : 'text-rose-700'
                }`}>
                  {pipelineResult.matchScore}%
                </span>
              </div>

              <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-center shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Risk Assessment</span>
                <span className={`text-xs font-black uppercase px-2 py-0.5 rounded block mt-1 ${
                  pipelineResult.riskLevel === 'low' ? 'bg-emerald-100 text-emerald-800' :
                  pipelineResult.riskLevel === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {pipelineResult.riskLevel} Risk
                </span>
              </div>
            </div>
          </div>

          {/* Conditional Manual Review Alert for Partial Matches */}
          {pipelineResult.matchState === 'PARTIAL_REFERENCE_MATCH' && (
            <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl text-amber-900 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Officer Action Required: Manual Document Review Triggered
                </h4>
                <p className="text-xs mt-1 text-amber-800 leading-relaxed">
                  Partial reference match detected with discrepancies between uploaded identity and baseline reference record. Secondary physical security inspection and passenger interview are mandatory prior to clearance.
                </p>
              </div>
            </div>
          )}

          {/* Field Comparison Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Column 1: Matched Fields */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Matched Fields ({pipelineResult.matchedFields.length})
                </span>
                <span className="text-[10px] text-slate-500">Verified against reference</span>
              </div>
              {pipelineResult.matchedFields.length > 0 ? (
                <ul className="space-y-2">
                  {pipelineResult.matchedFields.map((field, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-slate-800 bg-emerald-50/60 px-3 py-1.5 rounded-lg border border-emerald-100 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{field}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-xs text-slate-400 italic py-3 text-center">
                  No fields matched reference record
                </div>
              )}
            </div>

            {/* Column 2: Mismatched Fields */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Mismatched Fields ({pipelineResult.mismatchedFields.length})
                </span>
                <span className="text-[10px] text-slate-500">Flagged anomalies</span>
              </div>
              {pipelineResult.mismatchedFields.length > 0 ? (
                <ul className="space-y-2">
                  {pipelineResult.mismatchedFields.map((field, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-amber-900 bg-amber-50/60 px-3 py-1.5 rounded-lg border border-amber-200 font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{field}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-xs text-emerald-700 bg-emerald-50/40 p-3 rounded-lg border border-emerald-100 flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  None — All evaluated parameters align with reference data
                </div>
              )}
            </div>
          </div>

          {/* Granular Field Comparison Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Granular Field-by-Field Reference Cross-Check</span>
              <span className="text-[11px] text-slate-500 font-normal">
                Category: <strong>{pipelineResult.documentType}</strong>
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/50 text-[11px] font-bold text-slate-600 uppercase">
                    <th className="p-3">Field</th>
                    <th className="p-3">Uploaded Document Data</th>
                    <th className="p-3">Firebase Reference Data</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Analysis Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pipelineResult.fieldResults.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-800">{item.fieldLabel}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">{item.uploadedValue || <span className="text-slate-400 font-sans italic">null</span>}</td>
                      <td className="p-3 font-mono text-slate-700">{item.referenceValue || <span className="text-slate-400 font-sans italic">N/A</span>}</td>
                      <td className="p-3">
                        {item.matched ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                            <Check className="w-3 h-3 text-emerald-600" /> Match
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                            <AlertTriangle className="w-3 h-3 text-amber-600" /> Discrepancy
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-[11px] text-slate-500">
                        {item.anomalyReason || 'Confirmed congruent with reference template'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Visual Consistency Card */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Step 10: Visual Consistency Analysis
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                pipelineResult.visualConsistency.overallScore >= 80 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-amber-100 text-amber-800'
              }`}>
                Score: {pipelineResult.visualConsistency.overallScore} / 100
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Photo Tampering</span>
                <span className={`font-bold ${pipelineResult.visualConsistency.photoTamperingDetected ? 'text-red-600' : 'text-emerald-700'}`}>
                  {pipelineResult.visualConsistency.photoTamperingDetected ? 'Anomaly Detected' : 'None Detected'}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">MRZ Checksum</span>
                <span className={`font-bold ${pipelineResult.visualConsistency.mrzValid ? 'text-emerald-700' : 'text-red-600'}`}>
                  {pipelineResult.visualConsistency.mrzValid ? 'MOD 7 Valid' : 'Checksum Failed'}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Guilloche Pattern</span>
                <span className={`font-bold ${pipelineResult.visualConsistency.securityPatternMatch ? 'text-emerald-700' : 'text-amber-600'}`}>
                  {pipelineResult.visualConsistency.securityPatternMatch ? 'Aligned' : 'Degraded'}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Font Baseline</span>
                <span className={`font-bold ${pipelineResult.visualConsistency.fontAlignmentValid ? 'text-emerald-700' : 'text-red-600'}`}>
                  {pipelineResult.visualConsistency.fontAlignmentValid ? 'Continuous' : 'Splice Flagged'}
                </span>
              </div>
            </div>
            {pipelineResult.visualConsistency.notes.length > 0 && (
              <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                <strong className="text-slate-800 font-bold block mb-1">Optical Inspection Observations:</strong>
                <ul className="list-disc list-inside space-y-0.5">
                  {pipelineResult.visualConsistency.notes.map((n, idx) => (
                    <li key={idx}>{n}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
