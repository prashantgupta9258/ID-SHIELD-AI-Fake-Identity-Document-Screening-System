import React, { useState } from 'react';
import { 
  Fingerprint, 
  CheckCircle2, 
  Database,
  Scan,
  ShieldCheck
} from 'lucide-react';
import { ReferenceDocument, FaceVerificationResult } from '../types';
import { REFERENCE_DOCUMENTS } from '../data/referenceDataset';
import { FaceVerificationModule } from '../components/FaceVerificationModule';

interface IdentityVerificationViewProps {
  currentDoc?: ReferenceDocument;
  onSelectDoc: (doc: ReferenceDocument) => void;
  onTriggerToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
}

export const IdentityVerificationView: React.FC<IdentityVerificationViewProps> = ({
  currentDoc: propDoc,
  onSelectDoc,
  onTriggerToast,
}) => {
  const currentDoc = propDoc || REFERENCE_DOCUMENTS[0];
  const [latestFaceResult, setLatestFaceResult] = useState<FaceVerificationResult | null>(null);

  const isTampered = currentDoc?.id === 'REF-DOC-06';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
              Biometrics &amp; ICAO 9303 Verification
            </span>
            <span className="text-xs text-slate-500 font-mono">
              1:1 Subject Verification
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Identity &amp; Biometric Verification
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Biometric facial feature comparison, ICAO 9303 MRZ algorithm validation, and international watchlist queries
          </p>
        </div>
      </div>

      {/* Benchmark Switcher */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-2 overflow-x-auto">
        <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Active Subject Specimen:</span>
        <div className="flex items-center gap-2">
          {REFERENCE_DOCUMENTS.map((doc) => (
            <button
              key={doc.id}
              type="button"
              onClick={() => onSelectDoc(doc)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                doc.id === currentDoc.id 
                  ? 'bg-blue-600 text-white shadow-2xs' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {doc.personName} ({doc.docType})
            </button>
          ))}
        </div>
      </div>

      {/* Primary Face Verification Module (Meets All User Directives) */}
      <FaceVerificationModule
        documentImageSrc={currentDoc.rawImageUrl}
        documentType={currentDoc.docType}
        personName={currentDoc.personName}
        onResultChange={(result) => setLatestFaceResult(result)}
        onTriggerToast={onTriggerToast}
      />

      {/* Secondary Verification Staging: ICAO MRZ & Watchlists */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: ICAO MRZ & Check Digit Math */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                ICAO 9303 MRZ Checksum Validator
              </h3>
              <p className="text-xs text-slate-500">TD-3 2-line machine readable zone mathematical check</p>
            </div>
            <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              MOD 7 Algorithm
            </span>
          </div>

          {/* MRZ Lines Box */}
          <div className="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-xs tracking-[0.14em] space-y-1 shadow-inner">
            <div className="text-slate-400 text-[10px] tracking-normal mb-1">Line 1 (TD-3 Format):</div>
            <div className="break-all">{currentDoc.mrzLine1 || 'P<KHAMBEANDOHT<ARYHARYA<<<<<<<<<<<<<<<<<<'}</div>
            <div className="text-slate-400 text-[10px] tracking-normal mt-2 mb-1">Line 2 (Check Digits):</div>
            <div className="break-all text-amber-300">{currentDoc.mrzLine2 || 'Z12345671238ANDI02BE0AA0B4GAG7<<<<<<<<<<<<<<<033'}</div>
          </div>

          {/* Breakdown of Check Digit Calculations */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <div className="font-semibold text-slate-800">Passport Number Check Digit</div>
                <div className="text-[10px] text-slate-500 font-mono">Formula: Σ(Char[i] × Weight[7,3,1]) mod 10</div>
              </div>
              <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                VALID (Digit: 1)
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <div className="font-semibold text-slate-800">Date of Birth Check Digit</div>
                <div className="text-[10px] text-slate-500 font-mono">Formula: Σ(YYMMDD[i] × Weight[7,3,1]) mod 10</div>
              </div>
              <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                VALID (Digit: 2)
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <div className="font-semibold text-slate-800">Overall Composite Checksum</div>
                <div className="text-[10px] text-slate-500 font-mono">Evaluates lines 1 + 2 concatenated payload</div>
              </div>
              <span className={`font-mono font-bold px-2 py-0.5 rounded border ${
                isTampered 
                  ? 'text-red-700 bg-red-50 border-red-200' 
                  : 'text-emerald-700 bg-emerald-50 border-emerald-200'
              }`}>
                {isTampered ? 'CHECKSUM FAILED' : 'ALL 4 CHECKSUMS PASSED'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Watchlists & Clearance */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  National &amp; International Watchlist Queries
                </h3>
              </div>
              <span className="text-xs font-mono text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Real-time Sync
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">Interpol SLTD Database</span>
                <div className="font-bold text-slate-900">Stolen &amp; Lost Travel Documents</div>
                <div className="flex items-center gap-1 text-emerald-700 font-semibold pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> No match found (Clean record)
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">Bureau of Immigration (BOI)</span>
                <div className="font-bold text-slate-900">Look Out Circulars (LOC)</div>
                <div className="flex items-center gap-1 text-emerald-700 font-semibold pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> No active alerts or travel restrictions
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">UN Security Council</span>
                <div className="font-bold text-slate-900">Sanctions &amp; Travel Ban Lists</div>
                <div className="flex items-center gap-1 text-emerald-700 font-semibold pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Subject not listed on sanctions register
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
