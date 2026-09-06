import React, { useState, useEffect } from 'react';
import { 
  FaceVerificationOutcome, 
  FaceVerificationResult, 
  FaceDetectionRegion 
} from '../types';
import { 
  defaultFaceVerificationEngine, 
  DEMO_PROBE_PROFILES, 
  DemoProbeProfile,
  DEMO_FACE_VERIFICATION_DISCLAIMER 
} from '../services/faceVerificationEngine';
import { 
  Camera, 
  Upload, 
  UserCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  HelpCircle, 
  Shield, 
  ShieldCheck, 
  Sparkles, 
  Eye, 
  Scan, 
  RefreshCw, 
  Sliders, 
  Lock, 
  FileImage,
  Info
} from 'lucide-react';
import { CameraCaptureModal } from './CameraCaptureModal';

interface FaceVerificationModuleProps {
  documentImageSrc?: string;
  documentType?: string;
  personName?: string;
  initialProbeImageSrc?: string;
  onResultChange?: (result: FaceVerificationResult) => void;
  compact?: boolean;
  onTriggerToast?: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
}

export const FaceVerificationModule: React.FC<FaceVerificationModuleProps> = ({
  documentImageSrc,
  documentType = 'passport',
  personName = 'Subject',
  initialProbeImageSrc,
  onResultChange,
  compact = false,
  onTriggerToast,
}) => {
  // State for probe image
  const [probeImageSrc, setProbeImageSrc] = useState<string>(
    initialProbeImageSrc || DEMO_PROBE_PROFILES[1].samplePhotoUrl // default to 82% possible match demo
  );
  const [selectedPresetId, setSelectedPresetId] = useState<string>(DEMO_PROBE_PROFILES[1].id);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');

  // Result state
  const [verificationResult, setVerificationResult] = useState<FaceVerificationResult | null>(null);

  // Run initial verification on mount or when inputs change
  useEffect(() => {
    runVerification(probeImageSrc, DEMO_PROBE_PROFILES.find(p => p.id === selectedPresetId));
  }, [documentImageSrc, documentType]);

  const runVerification = async (currentProbe: string, forcedPreset?: DemoProbeProfile) => {
    setIsAnalyzing(true);
    setAnalysisStep('Detecting portrait region from document...');

    setTimeout(async () => {
      setAnalysisStep('Detecting facial landmarks in probe image...');

      setTimeout(async () => {
        setAnalysisStep('Comparing visual facial geometry and feature vectors...');

        setTimeout(async () => {
          try {
            const docFace = await defaultFaceVerificationEngine.detectDocumentPortrait(
              documentImageSrc || '',
              documentType
            );
            const probeFace = await defaultFaceVerificationEngine.detectProbeFace(currentProbe);

            const result = await defaultFaceVerificationEngine.compareFaces(
              docFace,
              probeFace,
              forcedPreset
            );

            setVerificationResult(result);
            setIsAnalyzing(false);
            setAnalysisStep('');

            if (onResultChange) {
              onResultChange(result);
            }

            if (onTriggerToast) {
              if (result.outcome === 'MATCH') {
                onTriggerToast('success', `Face verification: MATCH (${result.confidence.toFixed(1)}%)`);
              } else if (result.outcome === 'POSSIBLE_MATCH') {
                onTriggerToast('info', `Face verification: POSSIBLE MATCH (${result.confidence.toFixed(1)}%)`);
              } else if (result.outcome === 'LOW_CONFIDENCE') {
                onTriggerToast('warning', `Face verification: LOW CONFIDENCE (${result.confidence.toFixed(1)}%)`);
              } else if (result.outcome === 'NO_MATCH') {
                onTriggerToast('error', `Face verification: NO MATCH (${result.confidence.toFixed(1)}%)`);
              } else {
                onTriggerToast('warning', 'Face verification: UNABLE TO VERIFY');
              }
            }
          } catch (e) {
            setIsAnalyzing(false);
            setAnalysisStep('');
          }
        }, 400);
      }, 400);
    }, 400);
  };

  const handleSelectPreset = (preset: DemoProbeProfile) => {
    setSelectedPresetId(preset.id);
    setProbeImageSrc(preset.samplePhotoUrl);
    runVerification(preset.samplePhotoUrl, preset);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setProbeImageSrc(dataUrl);
      setSelectedPresetId('custom-upload');
      runVerification(dataUrl, undefined);
    };
    reader.readAsDataURL(file);
  };

  const handleWebcamCapture = (dataUrl: string) => {
    setProbeImageSrc(dataUrl);
    setSelectedPresetId('custom-camera');
    setIsCameraOpen(false);
    runVerification(dataUrl, undefined);
  };

  const getOutcomeBadge = (outcome: FaceVerificationOutcome) => {
    switch (outcome) {
      case 'MATCH':
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-300',
          text: 'text-emerald-900',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
          label: 'MATCH',
        };
      case 'POSSIBLE_MATCH':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-300',
          text: 'text-blue-950',
          icon: <Info className="w-5 h-5 text-blue-600" />,
          label: 'POSSIBLE MATCH',
        };
      case 'LOW_CONFIDENCE':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-300',
          text: 'text-amber-950',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
          label: 'LOW CONFIDENCE',
        };
      case 'NO_MATCH':
        return {
          bg: 'bg-red-50',
          border: 'border-red-300',
          text: 'text-red-950',
          icon: <XCircle className="w-5 h-5 text-red-600" />,
          label: 'NO MATCH',
        };
      case 'UNABLE_TO_VERIFY':
      default:
        return {
          bg: 'bg-slate-100',
          border: 'border-slate-300',
          text: 'text-slate-800',
          icon: <HelpCircle className="w-5 h-5 text-slate-500" />,
          label: 'UNABLE TO VERIFY',
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Top Banner with Clear Demo Label and Privacy Guarantees */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
              <Scan className="w-3 h-3 text-blue-700" />
              Demo Face Verification
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Modular 1:1 Biometric Comparison
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-1">
            Optional Subject Face Verification Module
          </h3>
          <p className="text-xs text-slate-500">
            Compares visual facial features between the credential bio-portrait and subject probe photo.
          </p>
        </div>

        {/* Privacy Safeguard Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs text-slate-600">
          <Lock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <div className="text-[11px] leading-tight">
            <span className="font-bold text-slate-800 block">Session Biometric Isolation</span>
            <span className="text-[10px] text-slate-400">No external lookup • Transient memory</span>
          </div>
        </div>
      </div>

      {/* Main Comparison Staging (Dual Side-by-Side: Document Photo vs Probe Face) */}
      <div className="p-5 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT: 1. Detect portrait/photo region from document */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileImage className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  1. Document Portrait Region
                </span>
              </div>
              <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold border border-blue-100">
                ICAO TD-3 VIZ Area
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Cropped / Isolated Portrait Preview */}
              <div className="relative w-28 h-36 bg-slate-200 rounded-xl overflow-hidden border-2 border-slate-300 shrink-0 shadow-inner flex flex-col items-center justify-center">
                {verificationResult?.documentFace.cropDataUrl ? (
                  <img
                    src={verificationResult.documentFace.cropDataUrl}
                    alt="Document Portrait Extract"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center text-center p-2 text-slate-500">
                    <UserCheck className="w-8 h-8 text-slate-400 mb-1" />
                    <span className="text-[10px] font-bold">Doc Portrait</span>
                  </div>
                )}

                {/* Facial Landmark Target Grid Overlay */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-2">
                  <div className="w-20 h-24 border border-dashed border-blue-400/80 rounded-md relative">
                    {/* Eye alignment indicators */}
                    <div className="absolute top-6 left-3 w-2 h-2 rounded-full border border-blue-400 bg-blue-400/30" />
                    <div className="absolute top-6 right-3 w-2 h-2 rounded-full border border-blue-400 bg-blue-400/30" />
                    {/* Nose & chin markers */}
                    <div className="absolute top-11 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-400/40" />
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-blue-400/50" />
                  </div>
                </div>

                {/* Subtitle tag */}
                <span className="absolute bottom-1 px-1.5 py-0.5 bg-slate-900/80 text-white text-[9px] rounded font-mono">
                  ISO/IEC 19794-5
                </span>
              </div>

              {/* Extraction Metadata */}
              <div className="space-y-1.5 text-xs text-slate-600 flex-1">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Specimen:</span>
                  <span className="font-bold text-slate-900">{personName}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Region Coordinate:</span>
                  <span className="font-mono text-[11px] text-slate-700">
                    X: {verificationResult?.documentFace.box?.x ?? 6}%, Y: {verificationResult?.documentFace.box?.y ?? 16}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Quality Assessment:</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {verificationResult?.documentFace.qualityScore ?? 89}% (Optimal Contrast)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: 2. Detect face in uploaded face image */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  2. User-Provided Face Image
                </span>
              </div>
              <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold border border-emerald-100">
                Checkpoint Probe
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Probe Image Preview with Face Box Overlay */}
              <div className="relative w-28 h-36 bg-slate-200 rounded-xl overflow-hidden border-2 border-slate-300 shrink-0 shadow-inner flex flex-col items-center justify-center">
                {probeImageSrc ? (
                  <img
                    src={probeImageSrc}
                    alt="Probe Face"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center text-center p-2 text-slate-400">
                    <Camera className="w-8 h-8 mb-1" />
                    <span className="text-[10px]">No Photo</span>
                  </div>
                )}

                {/* Face Box Overlay */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-2">
                  <div className="w-20 h-24 border border-emerald-500 rounded-md relative shadow-xs">
                    <span className="absolute -top-4 left-0 bg-emerald-600 text-white text-[8px] font-mono px-1 rounded">
                      Face Detected
                    </span>
                  </div>
                </div>

                <span className="absolute bottom-1 px-1.5 py-0.5 bg-slate-900/80 text-white text-[9px] rounded font-mono">
                  Live Probe
                </span>
              </div>

              {/* Probe Input Controls (Upload, Camera, or Presets) */}
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <label 
                    htmlFor="probe-file-input"
                    className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    Upload Image
                    <input
                      id="probe-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Live Camera
                  </button>
                </div>

                {/* Quick Presets for Demo Testing */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Or Select Demo Test Probe:
                  </span>
                  <select
                    value={selectedPresetId}
                    onChange={(e) => {
                      const found = DEMO_PROBE_PROFILES.find(p => p.id === e.target.value);
                      if (found) handleSelectPreset(found);
                    }}
                    className="w-full text-xs p-1.5 rounded-lg border border-slate-300 bg-white font-medium"
                  >
                    {DEMO_PROBE_PROFILES.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        [{preset.expectedOutcome}] {preset.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Trigger Button & In-Flight Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {isAnalyzing ? (
              <span className="flex items-center gap-2 font-bold text-blue-700">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                {analysisStep || 'Analyzing facial geometry...'}
              </span>
            ) : (
              <span>1:1 Visual facial comparison ready to execute</span>
            )}
          </div>

          <button
            type="button"
            disabled={isAnalyzing}
            onClick={() => {
              const activePreset = DEMO_PROBE_PROFILES.find(p => p.id === selectedPresetId);
              runVerification(probeImageSrc, activePreset);
            }}
            className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Scan className="w-4 h-4" />
            {isAnalyzing ? 'Comparing Vectors...' : 'Compare Visual Facial Features'}
          </button>
        </div>

        {/* ================= RESULT DISPLAY ================= */}
        {verificationResult && (
          <div className="space-y-4 pt-2">
            {/* Outcome Banner */}
            {(() => {
              const badge = getOutcomeBadge(verificationResult.outcome);
              return (
                <div className={`p-4 sm:p-5 rounded-2xl border ${badge.border} ${badge.bg} flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs`}>
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-white shadow-2xs shrink-0 mt-0.5">
                      {badge.icon}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                          Face Verification:
                        </span>
                        <span className={`text-base sm:text-lg font-black tracking-tight ${badge.text}`}>
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-2xl">
                        &ldquo;{verificationResult.explanation}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Confidence Meter Box */}
                  <div className="flex items-center gap-4 self-start md:self-center shrink-0 bg-white/90 p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Confidence
                      </span>
                      <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
                        {verificationResult.confidence.toFixed(1)}%
                      </span>
                    </div>

                    <div className="w-14 h-14 relative flex items-center justify-center">
                      <svg className="w-14 h-14 transform -rotate-90">
                        <circle
                          cx="28"
                          cy="28"
                          r="22"
                          stroke="currentColor"
                          strokeWidth="5"
                          className="text-slate-100"
                          fill="transparent"
                        />
                        <circle
                          cx="28"
                          cy="28"
                          r="22"
                          stroke="currentColor"
                          strokeWidth="5"
                          className={
                            verificationResult.confidence >= 88 ? 'text-emerald-500' :
                            verificationResult.confidence >= 70 ? 'text-blue-500' :
                            verificationResult.confidence >= 50 ? 'text-amber-500' :
                            'text-red-500'
                          }
                          strokeDasharray={138.2}
                          strokeDashoffset={138.2 - (138.2 * verificationResult.confidence) / 100}
                          strokeLinecap="round"
                          fill="transparent"
                        />
                      </svg>
                      <span className="absolute text-[11px] font-bold font-mono text-slate-700">
                        {Math.round(verificationResult.confidence)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 3. Compare visual facial features (Detailed Feature Analysis Breakdown) */}
            <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  Visual Facial Feature Comparison (Landmark Vectors)
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Non-Biometric Identification • 1:1 Verification Only
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {verificationResult.featureComparisons.map((feature, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-900 truncate">
                        {feature.featureName}
                      </span>
                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                        feature.status === 'congruent' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        feature.status === 'inconclusive' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {feature.status}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <span className="text-[10px] text-slate-400">Similarity</span>
                      <span className="text-xs font-mono font-bold text-slate-800">
                        {feature.similarityScore}%
                      </span>
                    </div>

                    {/* Mini bar */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${feature.similarityScore}%` }}
                        className={`h-full ${
                          feature.similarityScore >= 80 ? 'bg-emerald-500' :
                          feature.similarityScore >= 60 ? 'bg-blue-500' :
                          feature.similarityScore >= 40 ? 'bg-amber-500' :
                          'bg-red-500'
                        }`}
                      />
                    </div>

                    <p className="text-[10px] text-slate-500 leading-tight pt-0.5">
                      {feature.note}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Architecture & Modular Disclaimer Note */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-slate-600 text-xs">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-slate-800 block text-[11px]">
                  Modular Architecture Notice:
                </span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {DEMO_FACE_VERIFICATION_DISCLAIMER}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleWebcamCapture}
        title="Live Subject Checkpoint Capture (1:1 Verification)"
      />
    </div>
  );
};
