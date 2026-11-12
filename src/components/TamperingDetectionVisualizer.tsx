import React, { useState, useEffect } from 'react';
import { 
  TamperingAnalysisResult, 
  SuspiciousRegion, 
  TamperingIndicator, 
  TamperingStatus,
  TamperingIndicatorCategory
} from '../types';
import { executeTamperingDetection } from '../services/tamperingDetectionService';
import { DEMO_RAW_DOCUMENTS } from '../data/demoReferenceAssets';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Sparkles, 
  Eye, 
  Camera, 
  Upload, 
  FileSearch, 
  ChevronRight, 
  HelpCircle, 
  Sliders, 
  SplitSquareVertical, 
  Maximize2,
  Database,
  Crosshair,
  Compass
} from 'lucide-react';

interface TamperingDetectionVisualizerProps {
  onTriggerToast?: (message: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
  onSendToScreening?: (data: any) => void;
}

export const TamperingDetectionVisualizer: React.FC<TamperingDetectionVisualizerProps> = ({
  onTriggerToast,
  onSendToScreening,
}) => {
  // Preset Scenarios
  const [selectedScenario, setSelectedScenario] = useState<
    'TAMPERED_PHOTO_FONT' | 'STAMP_CHRONOLOGY_TAMPER' | 'CLEAN_GENUINE' | 'INCONCLUSIVE_DEGRADED'
  >('TAMPERED_PHOTO_FONT');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<TamperingAnalysisResult | null>(null);
  const [activeRegion, setActiveRegion] = useState<SuspiciousRegion | null>(null);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'indicators' | 'regions' | 'comparison' | 'limitations'>('indicators');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Run detection when scenario changes
  const runDetection = async (
    scenario: 'TAMPERED_PHOTO_FONT' | 'STAMP_CHRONOLOGY_TAMPER' | 'CLEAN_GENUINE' | 'INCONCLUSIVE_DEGRADED'
  ) => {
    setIsLoading(true);
    setActiveRegion(null);
    try {
      // Simulate forensic pipeline computation latency
      await new Promise((r) => setTimeout(r, 450));

      let res: TamperingAnalysisResult;
      if (scenario === 'STAMP_CHRONOLOGY_TAMPER') {
        const refDoc = DEMO_RAW_DOCUMENTS.find(d => d.category === 'TRAVEL_AUTHORIZATION');
        res = await executeTamperingDetection({
          forceScenario: 'STAMP_CHRONOLOGY_TAMPER',
          referenceDocument: refDoc,
          uploadedDocument: {
            fileName: 'eta_travel_auth_david_smith_altered.jpg',
            documentType: 'TRAVEL_AUTHORIZATION',
            rawText: refDoc?.ocrText,
            extractedFields: refDoc?.extractedFields,
          },
        });
      } else if (scenario === 'CLEAN_GENUINE') {
        const refDoc = DEMO_RAW_DOCUMENTS.find(d => d.category === 'PASSPORT');
        res = await executeTamperingDetection({
          forceScenario: 'CLEAN_GENUINE',
          referenceDocument: refDoc,
          uploadedDocument: {
            fileName: 'passport_ind_arya_singh_genuine.jpg',
            documentType: 'PASSPORT',
            rawText: refDoc?.ocrText,
            extractedFields: refDoc?.extractedFields,
          },
        });
      } else if (scenario === 'INCONCLUSIVE_DEGRADED') {
        res = await executeTamperingDetection({
          forceScenario: 'INCONCLUSIVE_DEGRADED',
          qualityScore: 28,
          isDegradedScan: true,
          uploadedDocument: {
            fileName: 'blurry_low_res_mobile_photo.jpg',
            documentType: 'UNKNOWN',
          },
        });
      } else {
        // Default: TAMPERED_PHOTO_FONT
        const refDoc = DEMO_RAW_DOCUMENTS.find(d => d.category === 'PASSPORT');
        res = await executeTamperingDetection({
          forceScenario: 'TAMPERED_PHOTO_FONT',
          referenceDocument: refDoc,
          uploadedDocument: {
            fileName: 'ind_passport_michael_altered.jpg',
            documentType: 'PASSPORT',
            rawText: 'REPUBLIC OF INDIA PASSPORT SURNAME: CHEN GIVEN NAMES: MICHAEL NO DEMO TEXT',
            extractedFields: {
              docNumber: 'AU026F60PC1IDBG8',
              fullName: 'MICHAEL CHEN [ALTERED]',
              passportNumber: 'AU026F60PC1IDBG8',
            },
          },
        });
      }

      setResult(res);
      if (res.suspiciousRegions.length > 0) {
        setActiveRegion(res.suspiciousRegions[0]);
      }
      if (onTriggerToast) {
        if (res.tamperingStatus === 'POTENTIAL_TAMPERING_DETECTED') {
          onTriggerToast('Potential tampering detected in document.', 'warning');
        } else if (res.tamperingStatus === 'UNABLE_TO_DETERMINE') {
          onTriggerToast('Analysis inconclusive due to image constraints.', 'info');
        } else {
          onTriggerToast('Document structure consistent with reference baseline.', 'success');
        }
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runDetection(selectedScenario);
  }, [selectedScenario]);

  // SVG representation for Uploaded vs Reference
  const currentRefAsset = DEMO_RAW_DOCUMENTS.find(
    d => d.category === (selectedScenario === 'STAMP_CHRONOLOGY_TAMPER' ? 'TRAVEL_AUTHORIZATION' : 'PASSPORT')
  ) || DEMO_RAW_DOCUMENTS[0];

  const categories: { id: string; label: string }[] = [
    { id: 'ALL', label: 'All Dimensions (9)' },
    { id: 'PHOTO_CONSISTENCY', label: 'Photo' },
    { id: 'TEXT_CONSISTENCY', label: 'Text' },
    { id: 'FONT_CONSISTENCY', label: 'Font' },
    { id: 'ALIGNMENT', label: 'Alignment' },
    { id: 'IMAGE_BOUNDARIES', label: 'Boundaries' },
    { id: 'COMPRESSION_ARTIFACTS', label: 'Compression' },
    { id: 'STAMP_SEAL_CONSISTENCY', label: 'Stamp / Seal' },
    { id: 'METADATA', label: 'Metadata' },
  ];

  const filteredIndicators = result?.indicators.filter((ind) => {
    if (filterCategory === 'ALL') return true;
    return ind.category === filterCategory;
  }) || [];

  return (
    <div id="tampering-detection-module" className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              Forensic Comparison Engine
            </span>
            <span className="text-[11px] text-slate-400">|</span>
            <span className="text-[11px] font-medium text-slate-500">
              9-Dimensional Cross-Reference Inspection
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Demo Tampering Detection Workflow
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Cross-examines submitted credentials against canonical reference templates stored in the demo reference database.
          </p>
        </div>

        {/* Action / Benchmark Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-[11px] font-bold text-slate-600 mr-1">Evaluation Presets:</div>
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setSelectedScenario('TAMPERED_PHOTO_FONT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedScenario === 'TAMPERED_PHOTO_FONT'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⚠ Photo & Font Tamper
            </button>
            <button
              type="button"
              onClick={() => setSelectedScenario('STAMP_CHRONOLOGY_TAMPER')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedScenario === 'STAMP_CHRONOLOGY_TAMPER'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⚠ Stamp Chronology
            </button>
            <button
              type="button"
              onClick={() => setSelectedScenario('CLEAN_GENUINE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedScenario === 'CLEAN_GENUINE'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ✓ Genuine Template
            </button>
            <button
              type="button"
              onClick={() => setSelectedScenario('INCONCLUSIVE_DEGRADED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedScenario === 'INCONCLUSIVE_DEGRADED'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ? Inconclusive (Low Res)
            </button>
          </div>
        </div>
      </div>

      {/* Mandatory Anti-Defamation & Neutrality Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-[11px] leading-relaxed">
          <strong className="text-slate-800">Operational Anti-Defamation Standard:</strong> This system does not produce speculative assertions such as <em>&quot;100% Fake&quot;</em> or <em>&quot;This person is fraudulent.&quot;</em> It strictly reports objective optical and structural anomalies as <strong>&quot;Potential tampering detected. Manual verification is recommended.&quot;</strong> When scanning resolution or compression precludes reliable evaluation, the system strictly reports <strong>&quot;Unable to determine&quot;</strong> to avoid false accusations.
        </div>
      </div>

      {/* MAIN STATUS OUTCOME BANNER */}
      {result && (
        <div className={`p-5 rounded-2xl border transition-all ${
          result.tamperingStatus === 'POTENTIAL_TAMPERING_DETECTED'
            ? 'bg-amber-50/70 border-amber-300 text-amber-950'
            : result.tamperingStatus === 'UNABLE_TO_DETERMINE'
              ? 'bg-slate-100 border-slate-300 text-slate-800'
              : 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className={`p-3 rounded-xl shrink-0 ${
                result.tamperingStatus === 'POTENTIAL_TAMPERING_DETECTED'
                  ? 'bg-amber-100 text-amber-700 border border-amber-200'
                  : result.tamperingStatus === 'UNABLE_TO_DETERMINE'
                    ? 'bg-slate-200 text-slate-700 border border-slate-300'
                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
              }`}>
                {result.tamperingStatus === 'POTENTIAL_TAMPERING_DETECTED' ? (
                  <AlertTriangle className="w-7 h-7 text-amber-600" />
                ) : result.tamperingStatus === 'UNABLE_TO_DETERMINE' ? (
                  <HelpCircle className="w-7 h-7 text-slate-600" />
                ) : (
                  <ShieldCheck className="w-7 h-7 text-emerald-600" />
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    result.tamperingStatus === 'POTENTIAL_TAMPERING_DETECTED'
                      ? 'bg-amber-200/80 text-amber-900 border-amber-300'
                      : result.tamperingStatus === 'UNABLE_TO_DETERMINE'
                        ? 'bg-slate-200 text-slate-800 border-slate-300'
                        : 'bg-emerald-200/80 text-emerald-900 border-emerald-300'
                  }`}>
                    {result.tamperingStatus.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    Evaluation Confidence: <strong>{result.tamperingConfidence}%</strong>
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
                  {result.headline}
                </h3>

                <p className="text-xs text-slate-600 mt-1">
                  {result.tamperingStatus === 'POTENTIAL_TAMPERING_DETECTED'
                    ? `Identified ${result.suspiciousRegions.length} anomalous visual regions differing from the reference template.`
                    : result.tamperingStatus === 'UNABLE_TO_DETERMINE'
                      ? 'Scan resolution or heavy lossy compression prevents conclusive forensic differentiation.'
                      : 'All 9 visual, typographic, and biometric inspection dimensions conform to baseline reference standards.'}
                </p>
              </div>
            </div>

            {/* Quick Metrics & Reference Target */}
            <div className="flex flex-wrap md:flex-col items-end gap-1.5 text-xs text-right border-t md:border-t-0 md:border-l border-slate-200/80 pt-3 md:pt-0 md:pl-4">
              <div className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-slate-500">Reference Template:</span>
                <span className="font-semibold text-slate-800">
                  {result.referenceDocumentName || 'Controlled Reference Baseline'}
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Indicators Evaluated: <strong>{result.indicators.length}</strong> (Across 9 Dimensions)
              </div>
              <div className="text-[11px] text-slate-500">
                Suspicious Regions: <strong className={result.suspiciousRegions.length > 0 ? 'text-amber-700' : 'text-emerald-700'}>{result.suspiciousRegions.length}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TWO-COLUMN WORKFLOW: LEFT = VISUAL COMPARISON CANVAS, RIGHT = INDICATORS & REGIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: VISUAL INSPECTION STAGE (UPLOADED VS REFERENCE) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            {/* Canvas Toolbar */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Eye className="w-4 h-4 text-blue-600" />
                  Uploaded Document Inspection Canvas
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                  className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors flex items-center gap-1 ${
                    showBoundingBoxes
                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Crosshair className="w-3 h-3" />
                  Suspicious Regions ({result?.suspiciousRegions.length || 0})
                </button>

                {/* Zoom controls */}
                <div className="inline-flex items-center bg-white border border-slate-200 rounded px-1">
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.1))}
                    className="p-1 hover:text-blue-600"
                    title="Zoom out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-[10px] px-1 text-slate-600">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
                    className="p-1 hover:text-blue-600"
                    title="Zoom in"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomLevel(1)}
                    className="p-1 text-slate-400 hover:text-slate-600 border-l border-slate-100 ml-1"
                    title="Reset"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Document Stage */}
            <div className="relative bg-slate-100 p-4 min-h-[360px] flex items-center justify-center overflow-hidden">
              {/* Grid Background */}
              <div 
                className="absolute inset-0 opacity-40 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                }}
              />

              {/* Scaled Preview Frame */}
              <div 
                className="relative max-w-[560px] w-full rounded-lg overflow-hidden shadow-md transition-transform duration-150"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                {/* SVG Render representing the document */}
                <div 
                  className="w-full relative"
                  dangerouslySetInnerHTML={{ __html: currentRefAsset.svgContent }}
                />

                {/* Bounding Box Overlays for Suspicious Regions */}
                {showBoundingBoxes && result?.suspiciousRegions.map((region) => {
                  const isSelected = activeRegion?.id === region.id;
                  return (
                    <button
                      key={region.id}
                      type="button"
                      onClick={() => setActiveRegion(region)}
                      className={`absolute border-2 rounded transition-all cursor-pointer group text-left ${
                        isSelected 
                          ? 'border-red-600 bg-red-500/25 ring-2 ring-red-400 shadow-md z-30' 
                          : 'border-amber-500 bg-amber-500/15 hover:bg-amber-500/25 z-20'
                      }`}
                      style={{
                        left: `${region.x}%`,
                        top: `${region.y}%`,
                        width: `${region.width}%`,
                        height: `${region.height}%`,
                      }}
                    >
                      {/* Region Tag Pill */}
                      <span className={`absolute -top-3 left-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase whitespace-nowrap shadow-xs flex items-center gap-1 ${
                        isSelected ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
                      }`}>
                        <AlertTriangle className="w-2.5 h-2.5" />
                        {region.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Suspicious Region Inspector Bar */}
            {activeRegion ? (
              <div className="p-3 bg-red-50/80 border-t border-red-200 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-red-900">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>Selected Region: {activeRegion.label}</span>
                    <span className="text-[10px] font-black bg-red-200 text-red-800 px-1.5 py-0.2 rounded uppercase">
                      {activeRegion.severity}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-red-700">
                    Coords: X:{activeRegion.x}% Y:{activeRegion.y}%
                  </span>
                </div>
                <p className="text-red-950 text-[11px] mt-1 font-medium">
                  {activeRegion.description}
                </p>
                <div className="mt-1.5 pt-1 border-t border-red-200/60 text-[10px] text-red-800">
                  <strong>Reference Baseline Difference:</strong> {activeRegion.referenceComparisonNote}
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                <span>Click any highlighted region above to inspect optical discrepancy vs reference baseline.</span>
                <span className="font-mono text-[10px] text-slate-400">ICAO 9303 Grid</span>
              </div>
            )}
          </div>

          {/* Corresponding Reference Document Preview Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-600" />
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  Corresponding Reference Document (Demo Baseline)
                </h4>
              </div>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {currentRefAsset.id}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Expected Reference Layout
                </span>
                <div className="text-[11px] text-slate-700 font-medium">
                  {currentRefAsset.displayName}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Issuing Authority: {currentRefAsset.samplePerson.issuingAuthority}
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Canonical Font &amp; Structure Spec
                </span>
                <div className="text-[11px] text-slate-700 font-medium">
                  {currentRefAsset.category === 'PASSPORT' ? 'OCR-B Laser Typography (ICAO Doc 9303)' : 'Official Consular Print Spec'}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Guilloche resolution: 2400 DPI equivalent
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: TABBED WORKFLOW - INDICATORS, SUSPICIOUS REGIONS, LIMITATIONS */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b border-slate-200 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setActiveTab('indicators')}
                className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 ${
                  activeTab === 'indicators'
                    ? 'border-blue-600 text-blue-800 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Potential Indicators ({result?.indicators.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('regions')}
                className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 ${
                  activeTab === 'regions'
                    ? 'border-blue-600 text-blue-800 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Suspicious Regions ({result?.suspiciousRegions.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('limitations')}
                className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 ${
                  activeTab === 'limitations'
                    ? 'border-blue-600 text-blue-800 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Limitations ({result?.limitations.length || 0})
              </button>
            </div>

            {/* TAB CONTENT 1: POTENTIAL TAMPERING INDICATORS */}
            {activeTab === 'indicators' && (
              <div className="p-4 space-y-3">
                {/* Category Filter Pills */}
                <div className="flex flex-wrap gap-1 pb-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFilterCategory(cat.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                        filterCategory === cat.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Indicators List */}
                <div className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
                  {filteredIndicators.map((ind) => {
                    const isWarning = ind.status === 'warning' || ind.status === 'flagged';
                    const isInconclusive = ind.status === 'inconclusive';

                    return (
                      <div
                        key={ind.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isWarning
                            ? 'bg-amber-50/50 border-amber-200/80 hover:bg-amber-50'
                            : isInconclusive
                              ? 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                              : 'bg-emerald-50/40 border-emerald-200/80 hover:bg-emerald-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            <span className="mt-0.5 shrink-0 text-sm">
                              {isWarning ? '⚠' : isInconclusive ? '?' : '✓'}
                            </span>
                            <div>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className={`font-bold text-xs ${
                                  isWarning ? 'text-amber-950' : isInconclusive ? 'text-slate-800' : 'text-emerald-950'
                                }`}>
                                  {ind.name}
                                </span>
                                <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-white/80 border border-slate-200 text-slate-600">
                                  {ind.category.replace(/_/g, ' ')}
                                </span>
                              </div>
                              <p className="text-xs text-slate-700 mt-1 leading-snug">
                                {ind.description}
                              </p>
                            </div>
                          </div>

                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${
                            isWarning 
                              ? 'bg-amber-100 text-amber-800 border-amber-300' 
                              : isInconclusive
                                ? 'bg-slate-200 text-slate-700 border-slate-300'
                                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          }`}>
                            {ind.status}
                          </span>
                        </div>

                        {/* Evidence & Forensic Observations */}
                        <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-[11px] space-y-1">
                          <div className="text-slate-600">
                            <strong className="text-slate-800">Observed Evidence:</strong> {ind.evidence}
                          </div>
                          {ind.referenceStandard && (
                            <div className="text-slate-500 text-[10px]">
                              <strong className="text-slate-700">Reference Standard:</strong> {ind.referenceStandard}
                            </div>
                          )}
                          {ind.observedAnomaly && (
                            <div className="text-amber-900 text-[10px]">
                              <strong>Anomaly Finding:</strong> {ind.observedAnomaly}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: SUSPICIOUS REGIONS */}
            {activeTab === 'regions' && (
              <div className="p-4 space-y-3">
                {result?.suspiciousRegions.length === 0 ? (
                  <div className="p-8 text-center bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                    <h4 className="font-bold text-sm text-emerald-950">No Suspicious Regions Detected</h4>
                    <p className="text-xs text-emerald-800 max-w-sm mx-auto">
                      All biometric and demographic zones line up within acceptable register tolerances with the reference template.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500">
                      The AI optical sensor identified the following distinct suspicious coordinates on the submitted document:
                    </p>

                    <div className="space-y-2.5">
                      {result?.suspiciousRegions.map((reg) => {
                        const isSelected = activeRegion?.id === reg.id;
                        return (
                          <div
                            key={reg.id}
                            onClick={() => setActiveRegion(reg)}
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-red-50 border-red-300 shadow-2xs ring-1 ring-red-400'
                                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-900">{reg.label}</span>
                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded uppercase ${
                                  reg.severity === 'critical'
                                    ? 'bg-red-100 text-red-800 border border-red-200'
                                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                                }`}>
                                  {reg.severity}
                                </span>
                              </div>
                              <span className="font-mono text-[10px] text-slate-500">
                                Coords: {reg.x}%, {reg.y}%
                              </span>
                            </div>

                            <div className="text-xs text-slate-700 font-medium">{reg.description}</div>
                            <div className="text-[11px] text-slate-500 mt-1">
                              <strong className="text-slate-700">Anomaly:</strong> {reg.anomalyType}
                            </div>
                            <div className="mt-1 text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                              <strong className="text-slate-800">Reference Deviation:</strong> {reg.referenceComparisonNote}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 3: LIMITATIONS & CONSTRAINTS */}
            {activeTab === 'limitations' && (
              <div className="p-4 space-y-3">
                <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Transparent Limitations Mandate:</strong>
                    <p className="text-[11px] text-blue-800 mt-0.5">
                      To preserve constitutional due process and evidentiary rigor, this prototype acknowledges scientific boundaries. The analysis is limited to observable optical data.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {result?.limitations.map((lim, idx) => (
                    <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl text-xs flex items-start gap-2.5">
                      <span className="font-mono font-bold text-slate-400 shrink-0">{idx + 1}.</span>
                      <span className="text-slate-700 leading-relaxed">{lim}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SUMMARY ACTIONS */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Evaluation complete at <strong className="font-mono text-slate-700">{new Date(result?.analyzedAt || '').toLocaleTimeString()}</strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => runDetection(selectedScenario)}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Re-evaluate Document
              </button>

              {onSendToScreening && (
                <button
                  type="button"
                  onClick={() => {
                    onSendToScreening({
                      tamperingResult: result,
                      scenario: selectedScenario,
                    });
                    if (onTriggerToast) onTriggerToast('Sent to Screening Wizard for final determination', 'info');
                  }}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  Forward to Screening
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
