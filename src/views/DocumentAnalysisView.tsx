import React, { useState } from 'react';
import { 
  FileSearch, 
  Layers, 
  Sparkles, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Cpu, 
  Scan, 
  ExternalLink,
  ChevronRight,
  Eye,
  Info,
  FolderTree
} from 'lucide-react';
import { ReferenceDocument, BoundingBox } from '../types';
import { REFERENCE_DOCUMENTS } from '../data/referenceDataset';
import { DocumentVisualizer } from '../components/DocumentVisualizer';
import { MultimodalDocumentPipeline } from '../components/MultimodalDocumentPipeline';
import { OcrStructuredFieldExtractor } from '../components/OcrStructuredFieldExtractor';
import { CrossCheckEngineVisualizer } from '../components/CrossCheckEngineVisualizer';
import { TamperingDetectionVisualizer } from '../components/TamperingDetectionVisualizer';
import { FileCheck2, Database, Sliders } from 'lucide-react';
import { ExplainableRiskScoreCard } from '../components/ExplainableRiskScoreCard';
import { computeExplainableRiskScore, evaluateScreeningRecord } from '../services/riskScoringEngine';

interface DocumentAnalysisViewProps {
  currentDoc?: ReferenceDocument;
  onSelectDoc: (doc: ReferenceDocument) => void;
  onOpenInvestigation: (doc: ReferenceDocument) => void;
  onSelectForScreening?: (doc: any) => void;
  onTriggerToast?: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
}

export const DocumentAnalysisView: React.FC<DocumentAnalysisViewProps> = ({
  currentDoc: propDoc,
  onSelectDoc,
  onOpenInvestigation,
  onSelectForScreening,
  onTriggerToast,
}) => {
  const currentDoc = propDoc || REFERENCE_DOCUMENTS[0];
  const [selectedBox, setSelectedBox] = useState<BoundingBox | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [activeAnalysisMode, setActiveAnalysisMode] = useState<'tampering_detection' | 'cross_check' | 'ocr_extraction' | 'multimodal' | 'forensic' | 'explainable_risk'>('tampering_detection');

  const handleTriggerScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 2400);
  };

  const isTampered = currentDoc?.tamperingDetected ?? false;


  // Analysis modules for the pipeline
  const pipelineModules = [
    {
      id: 'mod-1',
      name: '1. Document Quality',
      desc: 'Resolution, perspective distortion, glare & blur quantification.',
      status: 'Completed',
      statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      progress: 100,
      detail: 'Sharpness index 96.4/100, 300+ DPI equivalent.',
    },
    {
      id: 'mod-2',
      name: '2. OCR Extraction',
      desc: 'Visual Inspection Zone (VIZ) neural text extraction.',
      status: isTampered ? 'Warning' : 'Completed',
      statusColor: isTampered ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200',
      progress: 100,
      detail: isTampered ? 'Altered font weight detected in primary name field.' : '99.4% OCR confidence across 9 structured fields.',
    },
    {
      id: 'mod-3',
      name: '3. MRZ Validation',
      desc: 'ICAO 9303 Doc 9303 check digit arithmetic calculation.',
      status: currentDoc.docType === 'passport' ? 'Completed' : 'N/A',
      statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      progress: 100,
      detail: 'MOD 7 weighted multiplier matched visual document number.',
    },
    {
      id: 'mod-4',
      name: '4. Document Tampering Detection',
      desc: 'Error Level Analysis (ELA) and high-frequency noise variance.',
      status: isTampered ? 'Warning' : 'Completed',
      statusColor: isTampered ? 'text-red-700 bg-red-50 border-red-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200',
      progress: 100,
      detail: isTampered ? 'CRITICAL: Compression anomaly on stamp & identity area.' : 'Uniform compression grid, no synthetic splicing.',
    },
    {
      id: 'mod-5',
      name: '5. Photo Manipulation Detection',
      desc: 'Facial boundary blending, copy-move cloning & ghost photo alignment.',
      status: isTampered ? 'Warning' : 'Completed',
      statusColor: isTampered ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200',
      progress: 100,
      detail: isTampered ? 'Gaussian blur mask detected near identification coordinates.' : 'Dual-spectrum face match passed.',
    },
    {
      id: 'mod-6',
      name: '6. Face Matching',
      desc: 'Facial biometric Euclidean distance vs centralized immigration registry.',
      status: 'Completed',
      statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      progress: 100,
      detail: 'Similarity distance: 0.12 (98.2% face match).',
    },
    {
      id: 'mod-7',
      name: '7. Identity Consistency',
      desc: 'Cross-verification of name, DOB, issuing dates & visa validity.',
      status: isTampered ? 'Warning' : 'Completed',
      statusColor: isTampered ? 'text-red-700 bg-red-50 border-red-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200',
      progress: 100,
      detail: isTampered ? 'CHRONOLOGY DEFECT: Approval stamp applied 3 yrs after expiry.' : 'All chronological timelines logical and verified.',
    },
    {
      id: 'mod-8',
      name: '8. Fraud Risk Analysis',
      desc: 'Heuristic Bayesian threat scoring and alert classification.',
      status: isTampered ? 'Failed' : 'Completed',
      statusColor: isTampered ? 'text-red-700 bg-red-50 border-red-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200',
      progress: 100,
      detail: `Final aggregate threat score: ${currentDoc.riskScore}/100.`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Mode Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveAnalysisMode('tampering_detection')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeAnalysisMode === 'tampering_detection'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Demo Tampering Detection (9-Point Workflow)
        </button>
        <button
          type="button"
          onClick={() => setActiveAnalysisMode('cross_check')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeAnalysisMode === 'cross_check'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          Core Cross-Check Engine (12-Step Pipeline)
        </button>
        <button
          type="button"
          onClick={() => setActiveAnalysisMode('ocr_extraction')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeAnalysisMode === 'ocr_extraction'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          OCR &amp; Structured Field Extraction
        </button>
        <button
          type="button"
          onClick={() => setActiveAnalysisMode('multimodal')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeAnalysisMode === 'multimodal'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          Multimodal Separation Tree
        </button>
        <button
          type="button"
          onClick={() => setActiveAnalysisMode('forensic')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeAnalysisMode === 'forensic'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Deep Forensic Layer Inspection (8-Module Pipeline)
        </button>
        <button
          type="button"
          onClick={() => setActiveAnalysisMode('explainable_risk')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeAnalysisMode === 'explainable_risk'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Explainable Risk Engine (10 Signals)
        </button>
      </div>

      {activeAnalysisMode === 'tampering_detection' ? (
        <TamperingDetectionVisualizer
          onTriggerToast={(msg, type) => {
            if (onTriggerToast) onTriggerToast(type || 'info', msg);
          }}
          onSendToScreening={(data) => {
            if (onSelectForScreening) {
              onSelectForScreening(data);
            }
          }}
        />
      ) : activeAnalysisMode === 'cross_check' ? (
        <CrossCheckEngineVisualizer
          onTriggerToast={onTriggerToast}
          onSendToScreening={(result) => {
            if (onSelectForScreening) {
              onSelectForScreening({
                documentType: result.documentType,
                fields: result.fieldResults.reduce((acc, f) => ({ ...acc, [f.fieldKey]: f.uploadedValue }), {}),
              });
            }
          }}
        />
      ) : activeAnalysisMode === 'ocr_extraction' ? (
        <OcrStructuredFieldExtractor
          onTriggerToast={onTriggerToast}
          onSendToScreening={(data) => {
            if (onSelectForScreening) {
              onSelectForScreening(data);
            }
          }}
        />
      ) : activeAnalysisMode === 'multimodal' ? (
        <MultimodalDocumentPipeline
          onSelectForScreening={onSelectForScreening}
          onTriggerToast={onTriggerToast}
        />
      ) : activeAnalysisMode === 'explainable_risk' ? (
        <div className="space-y-6">
          {/* Header Context */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                  Autonomous Risk Calculation
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Specimen: {currentDoc.personName} ({currentDoc.docNumber})
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-1">
                Deterministic Multi-Signal Risk Assessment
              </h2>
              <p className="text-xs text-slate-500">
                Calculates a calibrated 0–100 risk score based on 10 deterministic forensic, biometric, and database signals.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onOpenInvestigation(currentDoc)}
              className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 shrink-0 self-start sm:self-center"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Open Investigation Case
            </button>
          </div>

          <ExplainableRiskScoreCard
            assessment={computeExplainableRiskScore({
              classificationConfidence: isTampered ? 85 : 98.5,
              ocrConfidence: isTampered ? 74 : 98.2,
              referenceMatchStatus: isTampered ? 'mismatch' : 'full_match',
              fieldMismatches: isTampered ? [{ field: 'Specimen Holder Name', documentValue: currentDoc.personName, referenceValue: 'GOVERNMENT SPECIMEN REGISTER', isPrimaryIdentityField: true }] : [],
              isExpired: new Date(currentDoc.expiryDate) < new Date(),
              expiryDateStr: currentDoc.expiryDate,
              tamperingIndicators: (currentDoc.findings || []).map(f => ({
                id: f.id,
                type: f.title.toLowerCase().includes('photo') ? 'photo_manipulation' : 'text_manipulation',
                title: f.title,
                description: f.description,
                severity: (f.confidence > 90 ? 'critical' : 'high') as any,
              })),
              imageQuality: {
                blurScore: 8,
                glareScore: 6,
                rating: 'optimal',
              },
              faceVerification: {
                matchConfidence: isTampered ? 76 : 98.4,
                isManipulatedOrBoundaryFeathered: isTampered,
              },
            })}
            allowInteractiveSimulation={true}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            AI Document Analysis
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Multi-layer AI analysis is currently evaluating the submitted identity document
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTriggerScan}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors"
          >
            <Scan className="w-4 h-4" />
            Trigger Live Rescan
          </button>
        </div>
      </div>

      {/* Reference Dataset Fast Switcher Tabs */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 mb-2 px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            Switch Reference Document:
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {REFERENCE_DOCUMENTS.map((doc) => {
            const isCurrent = doc.id === currentDoc.id;
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => onSelectDoc(doc)}
                className={`p-2 rounded-lg text-left border transition-all text-xs flex flex-col justify-between ${
                  isCurrent 
                    ? 'border-blue-600 bg-blue-50/80 font-bold text-blue-950 shadow-2xs' 
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <div className="truncate font-semibold text-[11px]">{doc.personName}</div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                  <span>{doc.docType.toUpperCase()}</span>
                  <span className={`font-mono font-bold ${doc.riskLevel === 'critical' ? 'text-red-600' : 'text-emerald-700'}`}>
                    {doc.riskScore}/100
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two-Column Forensic Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Document Preview & Interactive Detection Overlays */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">{currentDoc.name}</h3>
                <p className="text-xs text-slate-500">
                  {currentDoc.docTypeName} • Issued by: {currentDoc.issuingAuthority}
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                currentDoc.riskLevel === 'critical' ? 'bg-red-100 text-red-800 border border-red-200' :
                currentDoc.riskLevel === 'medium' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}>
                {currentDoc.status.toUpperCase()}
              </span>
            </div>

            {/* Document Visualizer Canvas */}
            <DocumentVisualizer
              documentType={currentDoc.docType}
              previewType={currentDoc.imageThumbnail}
              boundingBoxes={currentDoc.boundingBoxes}
              isScanning={isScanning}
              tamperingDetected={currentDoc.tamperingDetected}
              personName={currentDoc.personName}
              documentNumber={currentDoc.docNumber}
              mrzLine1={currentDoc.mrzLine1}
              mrzLine2={currentDoc.mrzLine2}
              onSelectBox={(box) => setSelectedBox(box)}
            />

            <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Click on any highlighted detection box above to view field-specific OCR confidence, font metrics, and forensic tampering notes.
              </span>
            </div>
          </div>

          {/* Extracted Fields Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800 flex items-center justify-between">
              <span>Extracted Document Attributes</span>
              <span className="text-[11px] font-mono text-slate-500">{Object.keys(currentDoc?.extractedFields || {}).length} Fields</span>
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {Object.entries(currentDoc?.extractedFields || {}).map(([k, rawItem]) => {
                const item = rawItem as { label: string; value: string; match?: boolean };
                return (
                  <div key={k} className="px-4 py-2.5 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-slate-800">{item.value}</span>
                      {item.match ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Verification Pipeline */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  AI Verification Pipeline
                </h3>
                <p className="text-xs text-slate-500">8 Real-time forensic verification modules</p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500">
                Latencies: &lt; 220ms
              </span>
            </div>

            {/* Pipeline Modules List */}
            <div className="space-y-2.5">
              {pipelineModules.map((m) => (
                <div 
                  key={m.id} 
                  className="p-3 bg-slate-50/60 rounded-xl border border-slate-200/80 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-800">{m.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${m.statusColor}`}>
                      {m.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-snug">{m.desc}</p>
                  <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="font-mono text-slate-500">{m.detail}</span>
                    <span className="font-mono font-semibold text-slate-700">{m.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Confidence & Risk Score Meter Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
              Forensic Confidence & Risk Assessment
            </h4>

            <div className="grid grid-cols-2 gap-4">
              {/* Circular Confidence Meter */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center text-center">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-200"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={currentDoc.aiScore > 80 ? 'text-blue-600' : 'text-red-500'}
                      strokeDasharray={`${currentDoc.aiScore}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute font-mono font-black text-sm text-slate-900">
                    {currentDoc.aiScore}%
                  </span>
                </div>
                <span className="mt-2 text-xs font-bold text-slate-800">AI Confidence</span>
                <span className="text-[10px] text-slate-500">Heuristic accuracy</span>
              </div>

              {/* Circular Risk Score Meter */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center text-center">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-200"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={currentDoc.riskScore > 70 ? 'text-red-600' : currentDoc.riskScore > 30 ? 'text-amber-500' : 'text-emerald-500'}
                      strokeDasharray={`${currentDoc.riskScore}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className={`absolute font-mono font-black text-sm ${
                    currentDoc.riskScore > 70 ? 'text-red-700' : currentDoc.riskScore > 30 ? 'text-amber-700' : 'text-emerald-700'
                  }`}>
                    {currentDoc.riskScore}
                  </span>
                </div>
                <span className="mt-2 text-xs font-bold text-slate-800">Risk Score</span>
                <span className="text-[10px] text-slate-500">0 - 100 Index</span>
              </div>
            </div>

            {/* Action button */}
            <button
              type="button"
              onClick={() => onOpenInvestigation(currentDoc)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>View Detailed Case Investigation</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
      )}
    </div>
  );
};
