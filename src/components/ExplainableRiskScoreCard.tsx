import React, { useState } from 'react';
import { 
  ExplainableRiskAssessment, 
  RiskScoreBand 
} from '../types';
import { 
  getRiskBandInfo, 
  computeExplainableRiskScore,
  DEMO_RISK_BENCHMARK_PROFILES, 
  OFFICIAL_LEGAL_DISCLAIMER 
} from '../services/riskScoringEngine';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Info, 
  Sparkles, 
  Sliders, 
  FileText, 
  HelpCircle,
  Clock,
  Eye,
  Camera,
  Layers,
  Database,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface ExplainableRiskScoreCardProps {
  assessment: ExplainableRiskAssessment;
  onUpdateAssessment?: (newAssessment: ExplainableRiskAssessment) => void;
  allowInteractiveSimulation?: boolean;
  compact?: boolean;
}

export const ExplainableRiskScoreCard: React.FC<ExplainableRiskScoreCardProps> = ({
  assessment: initialAssessment,
  onUpdateAssessment,
  allowInteractiveSimulation = true,
  compact = false,
}) => {
  const [currentAssessment, setCurrentAssessment] = useState<ExplainableRiskAssessment>(initialAssessment);
  const [showSimulator, setShowSimulator] = useState<boolean>(false);
  const [activeScenarioId, setActiveScenarioId] = useState<string>('current');

  // Simulator toggle state
  const [simTextManipulation, setSimTextManipulation] = useState<boolean>(
    currentAssessment.riskFactors.some(f => f.name.toLowerCase().includes('text manipulation') || f.name.toLowerCase().includes('tamper'))
  );
  const [simFieldMismatch, setSimFieldMismatch] = useState<boolean>(
    currentAssessment.riskFactors.some(f => f.category === 'field_mismatch' || f.category === 'reference_database')
  );
  const [simExpired, setSimExpired] = useState<boolean>(
    currentAssessment.riskFactors.some(f => f.category === 'expiration')
  );
  const [simPoorImageQuality, setSimPoorImageQuality] = useState<boolean>(
    currentAssessment.riskFactors.some(f => f.category === 'image_quality')
  );
  const [simLowOcr, setSimLowOcr] = useState<boolean>(
    currentAssessment.riskFactors.some(f => f.category === 'ocr_confidence')
  );
  const [simFaceAnomaly, setSimFaceAnomaly] = useState<boolean>(
    currentAssessment.riskFactors.some(f => f.category === 'face_verification')
  );

  const bandInfo = getRiskBandInfo(currentAssessment.score);

  const handleApplySimulation = (
    textManip: boolean,
    fieldMismatch: boolean,
    expired: boolean,
    poorQuality: boolean,
    lowOcr: boolean,
    faceAnomaly: boolean
  ) => {
    const indicators: any[] = [];
    if (textManip) {
      indicators.push({
        id: 'sim-txt',
        type: 'text_manipulation',
        title: 'Potential text manipulation',
        description: 'Synthetic stroke geometry and antialiasing divergence detected in demographic block',
        severity: 'high',
      });
    }

    const fieldMismatches: any[] = [];
    if (fieldMismatch) {
      fieldMismatches.push({
        field: 'Demographic Specimen Record',
        documentValue: 'Extracted Field Data',
        referenceValue: 'Authority Register Baseline',
        isPrimaryIdentityField: true,
      });
    }

    const newAssessment = computeExplainableRiskScore({
      classificationConfidence: 94.0,
      ocrConfidence: lowOcr ? 78.4 : 97.2,
      referenceMatchStatus: fieldMismatch ? 'mismatch' : 'full_match',
      fieldMismatches,
      isExpired: expired,
      expiryDateStr: expired ? '2024-05-12' : '2033-01-09',
      tamperingIndicators: indicators,
      imageQuality: {
        blurScore: poorQuality ? 36 : 8,
        glareScore: poorQuality ? 40 : 5,
        rating: poorQuality ? 'degraded' : 'optimal',
      },
      faceVerification: {
        matchConfidence: faceAnomaly ? 74.0 : 98.4,
        isManipulatedOrBoundaryFeathered: faceAnomaly,
      },
    });

    setCurrentAssessment(newAssessment);
    if (onUpdateAssessment) {
      onUpdateAssessment(newAssessment);
    }
  };

  const handleSelectBenchmark = (benchmarkId: string) => {
    setActiveScenarioId(benchmarkId);
    const benchmark = DEMO_RISK_BENCHMARK_PROFILES.find(b => b.id === benchmarkId);
    if (benchmark) {
      const computed = computeExplainableRiskScore(benchmark.input);
      setCurrentAssessment(computed);
      
      // Update simulation toggles
      setSimTextManipulation(computed.riskFactors.some(f => f.category === 'tampering'));
      setSimFieldMismatch(computed.riskFactors.some(f => f.category === 'field_mismatch' || f.category === 'reference_database'));
      setSimExpired(computed.riskFactors.some(f => f.category === 'expiration'));
      setSimPoorImageQuality(computed.riskFactors.some(f => f.category === 'image_quality'));
      setSimLowOcr(computed.riskFactors.some(f => f.category === 'ocr_confidence'));
      setSimFaceAnomaly(computed.riskFactors.some(f => f.category === 'face_verification'));

      if (onUpdateAssessment) {
        onUpdateAssessment(computed);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
              <Sparkles className="w-3 h-3 text-blue-700" />
              Explainable AI Risk Engine
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Deterministic Multi-Signal Pipeline
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-1">
            AI-Assisted Screening Risk Assessment
          </h3>
          <p className="text-xs text-slate-500">
            Transparent additive scoring combining 10 optical, biometric, and database signals.
          </p>
        </div>

        {allowInteractiveSimulation && (
          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              type="button"
              onClick={() => setShowSimulator(!showSimulator)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
                showSimulator
                  ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              {showSimulator ? 'Close Engine Simulator' : 'Test Scenarios & Signals'}
            </button>
          </div>
        )}
      </div>

      {/* Simulator / Scenario Benchmark Selector */}
      {showSimulator && allowInteractiveSimulation && (
        <div className="p-4 bg-blue-50/40 border-b border-blue-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-blue-700" />
              Interactive Risk Signal Tuner &amp; Official Benchmarks
            </span>
            <span className="text-[11px] text-blue-700 font-medium">
              Toggle signals to observe immediate mathematical recalculation
            </span>
          </div>

          {/* Quick Preset Selector */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-bold text-slate-500 mr-1">Pre-configured Benchmarks:</span>
            {DEMO_RISK_BENCHMARK_PROFILES.map((benchmark) => (
              <button
                key={benchmark.id}
                type="button"
                onClick={() => handleSelectBenchmark(benchmark.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all border ${
                  activeScenarioId === benchmark.id
                    ? 'bg-blue-700 text-white border-blue-800 shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-blue-50 border-slate-200'
                }`}
              >
                {benchmark.expectedScore}/100 — {benchmark.expectedBand}
              </button>
            ))}
          </div>

          {/* Signal Toggles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 text-xs">
            <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-blue-300">
              <input
                type="checkbox"
                checked={simTextManipulation}
                onChange={(e) => {
                  const val = e.target.checked;
                  setSimTextManipulation(val);
                  handleApplySimulation(val, simFieldMismatch, simExpired, simPoorImageQuality, simLowOcr, simFaceAnomaly);
                }}
                className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
              />
              <span className="font-semibold text-slate-800 text-[11px]">
                +25 Text Manipulation
              </span>
            </label>

            <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-blue-300">
              <input
                type="checkbox"
                checked={simFieldMismatch}
                onChange={(e) => {
                  const val = e.target.checked;
                  setSimFieldMismatch(val);
                  handleApplySimulation(simTextManipulation, val, simExpired, simPoorImageQuality, simLowOcr, simFaceAnomaly);
                }}
                className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
              />
              <span className="font-semibold text-slate-800 text-[11px]">
                +20 Field Mismatch
              </span>
            </label>

            <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-blue-300">
              <input
                type="checkbox"
                checked={simExpired}
                onChange={(e) => {
                  const val = e.target.checked;
                  setSimExpired(val);
                  handleApplySimulation(simTextManipulation, simFieldMismatch, val, simPoorImageQuality, simLowOcr, simFaceAnomaly);
                }}
                className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
              />
              <span className="font-semibold text-slate-800 text-[11px]">
                +15 Expired Doc
              </span>
            </label>

            <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-blue-300">
              <input
                type="checkbox"
                checked={simPoorImageQuality}
                onChange={(e) => {
                  const val = e.target.checked;
                  setSimPoorImageQuality(val);
                  handleApplySimulation(simTextManipulation, simFieldMismatch, simExpired, val, simLowOcr, simFaceAnomaly);
                }}
                className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
              />
              <span className="font-semibold text-slate-800 text-[11px]">
                +10 Poor Image
              </span>
            </label>

            <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-blue-300">
              <input
                type="checkbox"
                checked={simLowOcr}
                onChange={(e) => {
                  const val = e.target.checked;
                  setSimLowOcr(val);
                  handleApplySimulation(simTextManipulation, simFieldMismatch, simExpired, simPoorImageQuality, val, simFaceAnomaly);
                }}
                className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
              />
              <span className="font-semibold text-slate-800 text-[11px]">
                +6 Low OCR
              </span>
            </label>

            <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-blue-300">
              <input
                type="checkbox"
                checked={simFaceAnomaly}
                onChange={(e) => {
                  const val = e.target.checked;
                  setSimFaceAnomaly(val);
                  handleApplySimulation(simTextManipulation, simFieldMismatch, simExpired, simPoorImageQuality, simLowOcr, val);
                }}
                className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
              />
              <span className="font-semibold text-slate-800 text-[11px]">
                +20 Face Boundary
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Main Scoring Core */}
      <div className="p-5 sm:p-6 space-y-6">
        {/* Score & Band Hero Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Left: Big Score & Band */}
          <div className="md:col-span-5 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-100 pb-5 md:pb-0 md:pr-6">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Risk Score:
              </span>
              <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-mono">
                {currentAssessment.score}
              </span>
              <span className="text-xl font-bold text-slate-400 font-mono">
                / 100
              </span>
            </div>

            <div className="mt-2.5">
              <span className="text-[11px] font-bold text-slate-500 block mb-1">Risk Level:</span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-black uppercase tracking-wider border ${bandInfo.badgeBg} ${bandInfo.badgeBorder} ${bandInfo.badgeText}`}>
                {currentAssessment.score <= 20 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : currentAssessment.score <= 40 ? (
                  <Info className="w-4 h-4 text-blue-600" />
                ) : currentAssessment.score <= 60 ? (
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                )}
                {currentAssessment.band}
              </span>
            </div>

            {/* Visual Risk Band Scale Bar */}
            <div className="mt-4 space-y-1.5">
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex relative p-0.5 border border-slate-200">
                {/* 5 Band segments */}
                <div className="w-[20%] bg-emerald-500 h-full rounded-l-full" title="0–20: Low" />
                <div className="w-[20%] bg-blue-500 h-full" title="21–40: Moderate-Low" />
                <div className="w-[20%] bg-amber-500 h-full" title="41–60: Medium" />
                <div className="w-[20%] bg-orange-500 h-full" title="61–80: High" />
                <div className="w-[20%] bg-red-600 h-full rounded-r-full" title="81–100: Critical" />

                {/* Needle Indicator */}
                <div 
                  style={{ left: `${Math.min(98, Math.max(2, currentAssessment.score))}%` }} 
                  className="absolute top-[-2px] bottom-[-2px] w-2 bg-slate-900 rounded-full shadow-md -translate-x-1/2 ring-2 ring-white"
                />
              </div>

              {/* Band Labels */}
              <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-tight font-mono">
                <span className="text-emerald-700">0–20 Low</span>
                <span className="text-blue-700">21–40 Mod-Low</span>
                <span className="text-amber-700">41–60 Med</span>
                <span className="text-orange-700">61–80 High</span>
                <span className="text-red-700">81–100 Crit</span>
              </div>
            </div>
          </div>

          {/* Right: Recommended Action Banner */}
          <div className="md:col-span-7 space-y-3">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-2">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                Recommended Action:
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-base sm:text-lg font-black tracking-tight ${bandInfo.badgeText}`}>
                  {currentAssessment.recommendedAction}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {bandInfo.actionGuidance}
              </p>
            </div>

            {/* Rapid Stat Overview */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Identified Factors</span>
                <span className="text-sm font-black text-slate-800">
                  {currentAssessment.riskFactors.length}
                </span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Active Penalties</span>
                <span className="text-sm font-black text-slate-800 font-mono">
                  +{currentAssessment.riskFactors.reduce((acc, f) => acc + f.points, 0)} pts
                </span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Baseline Base</span>
                <span className="text-sm font-black text-slate-800 font-mono">
                  {currentAssessment.riskFactors.length === 0 ? '6 pts' : '0 pts'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Factors Section (Additive Mathematical Breakdown) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              Risk Factors:
            </h4>
            <span className="text-[11px] text-slate-500">
              Deterministic additive components
            </span>
          </div>

          {currentAssessment.riskFactors.length === 0 ? (
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 text-emerald-900 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-xs">
                <strong className="block font-bold">Zero Threat Penalties Detected (+0)</strong>
                <span>All biometric vectors, security watermarks, and authority register checks passed without variance.</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {currentAssessment.riskFactors.map((factor) => (
                <div
                  key={factor.id}
                  className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    factor.points >= 25 
                      ? 'bg-red-50/50 border-red-200 text-red-950'
                      : factor.points >= 20 
                      ? 'bg-orange-50/50 border-orange-200 text-orange-950'
                      : factor.points >= 15 
                      ? 'bg-amber-50/50 border-amber-200 text-amber-950'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-black font-mono px-2 py-0.5 rounded border ${
                        factor.points >= 25
                          ? 'bg-red-100 border-red-300 text-red-900'
                          : factor.points >= 20
                          ? 'bg-orange-100 border-orange-300 text-orange-900'
                          : factor.points >= 15
                          ? 'bg-amber-100 border-amber-300 text-amber-900'
                          : 'bg-slate-200 border-slate-300 text-slate-800'
                      }`}>
                        +{factor.points}
                      </span>
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                        {factor.name}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5 py-0.5 bg-white rounded border border-slate-200">
                        {factor.category.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 pl-1">
                      {factor.description}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      factor.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      factor.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      factor.severity === 'medium' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {factor.severity} severity
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 10 Evaluated Signals Summary Matrix */}
        {!compact && (
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                Signals Evaluated (10-Point Vector)
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Non-Random Verification Inputs
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-bold">1. Doc Classification</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {currentAssessment.signalsEvaluated.classificationConfidence.toFixed(1)}% Conf
                </span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-bold">2. OCR Confidence</span>
                <span className={`font-semibold font-mono ${
                  currentAssessment.signalsEvaluated.ocrConfidence < 85 ? 'text-amber-700' : 'text-slate-800'
                }`}>
                  {currentAssessment.signalsEvaluated.ocrConfidence.toFixed(1)}% Mean
                </span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-bold">3. Ref Database Match</span>
                <span className={`font-semibold capitalize ${
                  currentAssessment.signalsEvaluated.referenceDatabaseStatus === 'mismatch' ? 'text-red-700 font-bold' : 'text-emerald-700'
                }`}>
                  {currentAssessment.signalsEvaluated.referenceDatabaseStatus.replace('_', ' ')}
                </span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-bold">4. Field Mismatches</span>
                <span className={`font-semibold ${
                  currentAssessment.signalsEvaluated.fieldMismatchCount > 0 ? 'text-orange-700 font-bold' : 'text-slate-800'
                }`}>
                  {currentAssessment.signalsEvaluated.fieldMismatchCount} Discrepancies
                </span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-bold">5. Expired Document</span>
                <span className={`font-semibold ${
                  currentAssessment.signalsEvaluated.isExpired ? 'text-red-700 font-bold' : 'text-emerald-700'
                }`}>
                  {currentAssessment.signalsEvaluated.isExpired ? 'EXPIRED' : 'VALID'}
                </span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-bold">6. Date Relationships</span>
                <span className={`font-semibold ${
                  currentAssessment.signalsEvaluated.invalidDateRelationships.length > 0 ? 'text-red-700 font-bold' : 'text-emerald-700'
                }`}>
                  {currentAssessment.signalsEvaluated.invalidDateRelationships.length > 0 ? 'ANOMALIES DETECTED' : 'CONSISTENT'}
                </span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-bold">7. Tampering Flags</span>
                <span className={`font-semibold ${
                  currentAssessment.signalsEvaluated.tamperingIndicatorsCount > 0 ? 'text-red-700 font-bold' : 'text-emerald-700'
                }`}>
                  {currentAssessment.signalsEvaluated.tamperingIndicatorsCount} Flags
                </span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-bold">8. Image Quality</span>
                <span className={`font-semibold uppercase ${
                  currentAssessment.signalsEvaluated.imageQualityRating === 'degraded' ? 'text-amber-700 font-bold' : 'text-slate-800'
                }`}>
                  {currentAssessment.signalsEvaluated.imageQualityRating}
                </span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-bold">9. Face Verification</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {currentAssessment.signalsEvaluated.faceVerificationConfidence.toFixed(1)}% Match
                </span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-bold">10. Missing Fields</span>
                <span className={`font-semibold ${
                  currentAssessment.signalsEvaluated.missingImportantFields.length > 0 ? 'text-orange-700' : 'text-emerald-700'
                }`}>
                  {currentAssessment.signalsEvaluated.missingImportantFields.length === 0 ? 'NONE (ALL PRESENT)' : `${currentAssessment.signalsEvaluated.missingImportantFields.length} MISSING`}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* IMPORTANT MANDATORY LEGAL / REGULATORY DISCLAIMER */}
        <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-950">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold uppercase tracking-wide text-amber-900 block text-[11px]">
              Statutory Compliance Notice:
            </span>
            <p className="text-[11px] leading-relaxed opacity-95">
              {OFFICIAL_LEGAL_DISCLAIMER}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
