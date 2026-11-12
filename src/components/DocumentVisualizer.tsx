import React, { useState } from 'react';
import { BoundingBox, DocumentType } from '../types';
import { 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ShieldAlert, 
  ShieldCheck, 
  Maximize2, 
  Layers, 
  Sparkles,
  AlertTriangle,
  FileSearch
} from 'lucide-react';

interface DocumentVisualizerProps {
  documentType: DocumentType;
  previewType?: string;
  customImageUrl?: string;
  boundingBoxes?: BoundingBox[];
  isScanning?: boolean;
  tamperingDetected?: boolean;
  activeBoxId?: string | null;
  onSelectBox?: (box: BoundingBox | null) => void;
  documentNumber?: string;
  personName?: string;
  mrzLine1?: string;
  mrzLine2?: string;
}

export const DocumentVisualizer: React.FC<DocumentVisualizerProps> = ({
  documentType,
  previewType = 'passport-arya',
  customImageUrl,
  boundingBoxes = [],
  isScanning = false,
  tamperingDetected = false,
  activeBoxId = null,
  onSelectBox,
  documentNumber,
  personName,
  mrzLine1,
  mrzLine2,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [showOverlays, setShowOverlays] = useState<boolean>(true);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [selectedBox, setSelectedBox] = useState<BoundingBox | null>(null);

  const safeBoundingBoxes = boundingBoxes || [];

  const handleBoxClick = (box: BoundingBox) => {
    const next = selectedBox?.id === box.id ? null : box;
    setSelectedBox(next);
    if (onSelectBox) onSelectBox(next);
  };

  const handleResetZoom = () => setZoom(1);
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.75));

  return (
    <div id="document-visualizer-container" className="flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Control Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800 flex items-center gap-1.5">
            <FileSearch className="w-4 h-4 text-blue-600" />
            Inspection Canvas
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-500 font-mono uppercase text-[11px]">
            {previewType || documentType}
          </span>
          {tamperingDetected && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200 animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              Anomaly Detected
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Overlay Toggle */}
          <button
            id="btn-toggle-overlays"
            type="button"
            onClick={() => setShowOverlays(!showOverlays)}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              showOverlays 
                ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
            title="Toggle AI Detection Boundaries"
          >
            <Layers className="w-3.5 h-3.5" />
            AI Overlays ({safeBoundingBoxes.length})
          </button>

          {/* Tamper Heatmap Toggle */}
          <button
            id="btn-toggle-heatmap"
            type="button"
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              showHeatmap 
                ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
            title="Error Level Analysis (ELA) Heatmap"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            ELA Heatmap
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center bg-white border border-slate-200 rounded">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1 hover:bg-slate-100 text-slate-600 rounded-l transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 py-0.5 text-[10px] font-mono text-slate-600 min-w-[32px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1 hover:bg-slate-100 text-slate-600 rounded-r transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1 hover:bg-slate-100 text-slate-500 border-l border-slate-200 transition-colors"
              title="Reset zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Document Stage */}
      <div className="relative min-h-[380px] sm:min-h-[460px] bg-slate-100 overflow-hidden flex items-center justify-center p-4">
        {/* Subtle grid backdrop */}
        <div 
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        {/* Scalable Container */}
        <div 
          className="relative transition-transform duration-150 ease-out shadow-lg rounded-lg overflow-hidden select-none"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
        >
          {/* Custom Uploaded Image IF provided */}
          {customImageUrl ? (
            <div className="relative max-w-[560px] w-full bg-white">
              <img 
                src={customImageUrl} 
                alt="Document preview" 
                className="w-full h-auto object-contain max-h-[500px]"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            /* Render High-Fidelity Official Document Template */
            <DocumentTemplateRenderer 
              previewType={previewType} 
              personName={personName}
              documentNumber={documentNumber}
              mrzLine1={mrzLine1}
              mrzLine2={mrzLine2}
            />
          )}

          {/* AI Scanning Line Animation */}
          {isScanning && (
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_12px_rgba(37,99,235,0.8)] animate-[scan_2s_ease-in-out_infinite] z-20 pointer-events-none" />
          )}

          {/* Error Level Analysis (ELA) Tamper Heatmap Overlay */}
          {showHeatmap && (
            <div className="absolute inset-0 z-10 pointer-events-none mix-blend-multiply opacity-75">
              {tamperingDetected ? (
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <rect width="100%" height="100%" fill="rgba(30, 41, 59, 0.2)" />
                  {/* Tampered hotspots */}
                  <circle cx="28%" cy="62%" r="48" fill="url(#heatRed)" />
                  <circle cx="85%" cy="66%" r="55" fill="url(#heatRed)" />
                  <ellipse cx="50%" cy="52%" rx="70" ry="25" fill="url(#heatYellow)" />
                  <defs>
                    <radialGradient id="heatRed" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
                      <stop offset="60%" stopColor="#f97316" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="heatYellow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#eab308" stopOpacity="0.8" />
                      <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                </svg>
              ) : (
                <div className="w-full h-full bg-emerald-500/10 border-2 border-emerald-400/50 flex items-center justify-center">
                  <span className="bg-white/90 px-3 py-1 rounded text-xs font-semibold text-emerald-800 shadow">
                    Uniform Error Level: No Splicing Artifacts Detected
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Interactive Bounding Boxes */}
          {showOverlays && (
            <div className="absolute inset-0 z-20 pointer-events-none">
              {safeBoundingBoxes.map((box) => {
                const isSelected = selectedBox?.id === box.id || activeBoxId === box.id;
                
                let borderStyle = 'border-blue-500 bg-blue-500/10 text-blue-700';
                if (box.status === 'anomalous') {
                  borderStyle = 'border-red-500 bg-red-500/20 text-red-700 ring-2 ring-red-400 animate-pulse';
                } else if (box.status === 'suspicious') {
                  borderStyle = 'border-amber-500 bg-amber-500/15 text-amber-800';
                }

                return (
                  <div
                    key={box.id}
                    onClick={() => handleBoxClick(box)}
                    style={{
                      left: `${box.x}%`,
                      top: `${box.y}%`,
                      width: `${box.width}%`,
                      height: `${box.height}%`,
                    }}
                    className={`absolute pointer-events-auto cursor-pointer border-2 rounded transition-all duration-150 ${borderStyle} ${
                      isSelected ? 'ring-2 ring-offset-1 ring-blue-600 scale-[1.02]' : 'hover:scale-[1.01]'
                    }`}
                    title={`${box.label}: ${box.status.toUpperCase()} (${box.confidence}%)`}
                  >
                    {/* Badge on Box */}
                    <div className="absolute -top-5 left-0 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-tight whitespace-nowrap shadow-sm flex items-center gap-1 bg-white border border-slate-300">
                      {box.status === 'anomalous' && <AlertTriangle className="w-2.5 h-2.5 text-red-600" />}
                      {box.status === 'valid' && <ShieldCheck className="w-2.5 h-2.5 text-blue-600" />}
                      {box.status === 'suspicious' && <ShieldAlert className="w-2.5 h-2.5 text-amber-600" />}
                      <span>{box.field}</span>
                      <span className="text-slate-400 font-mono text-[8px]">{box.confidence}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Selected Box Forensic Inspector Drawer / Footer */}
      {selectedBox && (
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-start gap-2">
            <div className={`p-1.5 rounded ${
              selectedBox.status === 'anomalous' ? 'bg-red-100 text-red-700' :
              selectedBox.status === 'suspicious' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-700'
            }`}>
              {selectedBox.status === 'anomalous' ? <AlertTriangle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800">{selectedBox.label}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                  selectedBox.status === 'anomalous' ? 'bg-red-100 text-red-700' :
                  selectedBox.status === 'suspicious' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {selectedBox.status}
                </span>
                <span className="text-slate-400 text-[11px]">Confidence: {selectedBox.confidence}%</span>
              </div>
              <p className="text-slate-600 mt-0.5 text-[11px]">
                {selectedBox.notes || `Extracted value: "${selectedBox.extractedValue}"`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedBox(null)}
            className="text-[11px] font-medium text-slate-500 hover:text-slate-800 self-end sm:self-auto px-2 py-1 rounded bg-white border border-slate-200 hover:bg-slate-100"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

// Internal Sub-component rendering the exact reference documents with authentic typography and seals
const DocumentTemplateRenderer: React.FC<{
  previewType: string;
  personName?: string;
  documentNumber?: string;
  mrzLine1?: string;
  mrzLine2?: string;
}> = ({ previewType, personName, documentNumber, mrzLine1, mrzLine2 }) => {
  switch (previewType) {
    case 'passport-arya':
      return (
        <div className="w-[540px] h-[360px] bg-[#f8f6f0] border border-slate-300 rounded p-4 font-sans text-slate-800 relative shadow-inner overflow-hidden">
          {/* Security background pattern */}
          <div className="absolute inset-0 opacity-15 pointer-events-none" style={{
            backgroundImage: 'radial-gradient(#1e3a8a 0.75px, transparent 0.75px)',
            backgroundSize: '6px 6px',
          }} />
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-blue-900/30 pb-2 mb-3">
            <div className="flex items-center gap-2">
              {/* Ashoka Stambh Emblem */}
              <div className="w-8 h-8 rounded-full bg-blue-900/10 flex items-center justify-center text-blue-900 font-serif font-bold text-xs border border-blue-900/30">
                🇮🇳
              </div>
              <div>
                <div className="text-[10px] tracking-widest uppercase font-bold text-blue-950">भारत गणराज्य</div>
                <div className="text-[11px] tracking-wider uppercase font-bold text-blue-900">REPUBLIC OF INDIA</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[9px] text-slate-500">PASSPORT NO.</div>
              <div className="font-mono font-bold text-sm tracking-wider text-slate-900">{documentNumber || 'Z1234567'}</div>
            </div>
          </div>

          {/* Passport Body */}
          <div className="grid grid-cols-12 gap-3 text-[10px]">
            {/* Primary Portrait & Ghost */}
            <div className="col-span-4 flex flex-col items-center gap-1.5">
              <div className="w-24 h-32 bg-slate-200 border-2 border-slate-400 rounded overflow-hidden relative shadow-sm">
                {/* Simulated Photo of Arya Singh */}
                <div className="w-full h-full bg-gradient-to-b from-slate-300 to-slate-400 flex flex-col items-center justify-center text-slate-600">
                  <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-300 mb-1 flex items-center justify-center text-lg">👩‍💼</div>
                  <span className="text-[9px] font-semibold">ARYA SINGH</span>
                  <span className="text-[8px] text-slate-500">1992-07-15</span>
                </div>
                {/* Chip watermark */}
                <div className="absolute top-1 left-1 bg-amber-400/80 px-1 py-0.5 rounded text-[7px] font-mono font-bold text-amber-950">
                  eMRTD
                </div>
              </div>
              <div className="text-[9px] font-mono text-slate-500">SIGNATURE / हस्ताक्षर</div>
              <div className="font-serif italic font-semibold text-slate-700 text-xs">Arya Singh</div>
            </div>

            {/* VIZ Details */}
            <div className="col-span-6 space-y-1">
              <div className="grid grid-cols-2 gap-1 border-b border-slate-200 pb-1">
                <div>
                  <span className="text-[8px] text-slate-500 block">TYPE / प्रकार</span>
                  <span className="font-mono font-bold">P</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 block">COUNTRY CODE / कोड</span>
                  <span className="font-mono font-bold">IND</span>
                </div>
              </div>
              <div>
                <span className="text-[8px] text-slate-500 block">SURNAME / उपनाम</span>
                <span className="font-bold text-[11px] tracking-wide text-slate-900">SINGH</span>
              </div>
              <div>
                <span className="text-[8px] text-slate-500 block">GIVEN NAME(S) / दिया गया नाम</span>
                <span className="font-bold text-[11px] tracking-wide text-slate-900">{personName || 'ARYA'}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div>
                  <span className="text-[8px] text-slate-500 block">NATIONALITY / राष्ट्रीयता</span>
                  <span className="font-bold text-blue-900">INDIAN / भारतीय</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 block">SEX / लिंग</span>
                  <span className="font-bold">F</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div>
                  <span className="text-[8px] text-slate-500 block">DATE OF BIRTH / जन्म तिथि</span>
                  <span className="font-mono font-semibold">15/07/1992</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 block">PLACE OF BIRTH / जन्म स्थान</span>
                  <span className="font-semibold">CHANDIGARH</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div>
                  <span className="text-[8px] text-slate-500 block">DATE OF ISSUE / जारी तिथि</span>
                  <span className="font-mono">20/01/2023</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 block">DATE OF EXPIRY / समाप्ति</span>
                  <span className="font-mono font-bold text-emerald-800">19/01/2033</span>
                </div>
              </div>
            </div>

            {/* Ghost Portrait & Security Thread */}
            <div className="col-span-2 flex flex-col items-center justify-center border-l border-dashed border-slate-300 pl-2">
              <div className="w-12 h-16 bg-slate-100/80 border border-slate-300 rounded opacity-70 flex flex-col items-center justify-center">
                <span className="text-[10px]">👩‍💼</span>
                <span className="text-[6px] text-slate-400">GHOST</span>
              </div>
              <div className="mt-2 text-[7px] text-center font-mono text-slate-400">
                L-SEC-2023
              </div>
            </div>
          </div>

          {/* MRZ 2-Lines at bottom */}
          <div className="mt-3 pt-1.5 border-t border-slate-400/80 font-mono text-[10px] tracking-[0.14em] text-slate-900 bg-slate-50/90 px-2 py-1 rounded">
            <div>{mrzLine1 || 'P<KHAMBEANDOHT<ARYHARYA<<<<<<<<<<<<<<<<<<'}</div>
            <div>{mrzLine2 || 'Z12345671238ANDI02BE0AA0B4GAG7<<<<<<<<<<<<<<<033'}</div>
          </div>
        </div>
      );

    case 'visa-rajesh':
      return (
        <div className="w-[540px] h-[350px] bg-gradient-to-br from-amber-50/70 via-white to-sky-50/50 border border-slate-300 rounded p-4 font-sans text-slate-800 relative shadow-inner overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-indigo-900/20 pb-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs border border-amber-300">
                🇮🇳
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-widest text-indigo-950 block">भारत गणराज्य / REPUBLIC OF INDIA</span>
                <span className="text-[12px] font-extrabold text-blue-900 tracking-wide">VISA / वीज़ा</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[8px] text-slate-500 block">VISA NUMBER</span>
              <span className="font-mono font-bold text-sm text-red-700 tracking-wider">T12345678</span>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-3 text-[10px]">
            {/* Photo */}
            <div className="col-span-3 flex flex-col items-center">
              <div className="w-20 h-28 bg-slate-200 border-2 border-slate-300 rounded overflow-hidden flex flex-col items-center justify-center">
                <div className="text-2xl mb-1">👨‍💼</div>
                <span className="text-[8px] font-bold text-slate-700">RAJESH SINGH</span>
                <span className="text-[7px] text-slate-500">M / 1986</span>
              </div>
            </div>

            {/* Details */}
            <div className="col-span-6 space-y-1.5">
              <div className="grid grid-cols-2 gap-1">
                <div>
                  <span className="text-[8px] text-slate-500 block">TYPE OF VISA</span>
                  <span className="font-bold text-blue-900">TOURIST (T)</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 block">ENTRIES</span>
                  <span className="font-bold">MULTIPLE</span>
                </div>
              </div>
              <div>
                <span className="text-[8px] text-slate-500 block">ISSUED AT / जारी स्थान</span>
                <span className="font-semibold">HIGH COMMISSION OF INDIA, LONDON</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div>
                  <span className="text-[8px] text-slate-500 block">DATE OF ISSUE</span>
                  <span className="font-mono font-semibold">15 OCT 2023</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 block">DATE OF EXPIRY</span>
                  <span className="font-mono font-bold text-emerald-700">14 OCT 2024</span>
                </div>
              </div>
              <div>
                <span className="text-[8px] text-slate-500 block">PASSPORT NO.</span>
                <span className="font-mono font-bold">GB98214401</span>
              </div>
            </div>

            {/* Hologram & Consular Seal */}
            <div className="col-span-3 flex flex-col items-center justify-center gap-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-400 via-pink-400 to-amber-300 border-2 border-amber-300 shadow-sm flex items-center justify-center text-[8px] font-bold text-indigo-950 text-center p-1">
                ASHOKA HOLOGRAM
              </div>
              <span className="text-[7px] text-slate-500 font-mono">DOVID #HCI-994</span>
            </div>
          </div>

          {/* DEL Airport Stamping Area */}
          <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between">
            <div className="border border-blue-500/50 bg-blue-50/80 px-3 py-1.5 rounded rotate-[-1.5deg]">
              <span className="text-[9px] font-bold text-blue-900 block">★ IMMIGRATION BUREAU ★</span>
              <span className="text-[10px] font-mono font-extrabold text-blue-950">DELHI AIRPORT (DEL) — ARRIVED</span>
              <span className="text-[8px] font-mono text-blue-700 block">DATE: 20 OCT 2023 • FLIGHT AI-162</span>
            </div>
            <div className="text-[8px] font-mono text-slate-400">
              V&lt;INDT123456780SINGH&lt;&lt;RAJESH&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;
            </div>
          </div>
        </div>
      );

    case 'aadhaar-sunita':
      return (
        <div className="w-[520px] h-[340px] bg-white border border-slate-300 rounded-lg p-4 font-sans text-slate-800 relative shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-red-600 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🇮🇳</span>
              <div>
                <span className="text-[10px] font-bold text-slate-700 block">भारत सरकार / GOVERNMENT OF INDIA</span>
                <span className="text-[11px] font-bold text-blue-900">भारतीय विशिष्ट पहचान प्राधिकरण (UIDAI)</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-[9px] font-bold text-red-700 border border-red-300">
              आधार
            </div>
          </div>

          <div className="grid grid-cols-12 gap-3 text-[11px]">
            {/* Photo */}
            <div className="col-span-4 flex flex-col items-center">
              <div className="w-24 h-28 bg-slate-200 border border-slate-300 rounded flex flex-col items-center justify-center">
                <span className="text-3xl mb-1">👩</span>
                <span className="text-[9px] font-semibold">सुनीता देवी</span>
                <span className="text-[8px] text-slate-500">Sunita Devi</span>
              </div>
            </div>

            {/* Demographics */}
            <div className="col-span-8 space-y-2">
              <div>
                <span className="text-[13px] font-bold text-slate-900 block">सुनीता देवी</span>
                <span className="text-[12px] font-semibold text-slate-700">Sunita Devi</span>
              </div>
              <div className="text-[10px] space-y-0.5 text-slate-600">
                <div>जन्म तिथि / DOB: <span className="font-bold text-slate-900 font-mono">12/08/1981</span></div>
                <div>महिला / Female</div>
              </div>
              {/* Aadhaar Number */}
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[9px] text-slate-500 block">मेरा आधार, मेरी पहचान</span>
                <div className="font-mono font-extrabold text-lg tracking-widest text-red-700">
                  2345 6789 0123
                </div>
              </div>
            </div>
          </div>

          {/* QR & Barcode bottom */}
          <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[9px]">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-slate-900 text-white font-mono text-[6px] p-1 flex items-center justify-center text-center">
                SECURE QR
              </div>
              <div className="text-slate-500 text-[8px]">
                <div>हेल्पलाइन / Helpline: 1947</div>
                <div>help@uidai.gov.in | www.uidai.gov.in</div>
              </div>
            </div>
            <div className="font-mono text-[9px] text-slate-400">
              ||||| |||| || ||||||| |||||
            </div>
          </div>
        </div>
      );

    case 'dl-rajesh':
      return (
        <div className="w-[520px] h-[340px] bg-gradient-to-r from-sky-50 via-white to-amber-50/50 border border-slate-300 rounded-lg p-4 font-sans text-slate-800 relative shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-blue-800 pb-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🇮🇳</span>
              <div>
                <span className="text-[9px] font-bold uppercase text-slate-700 block">GOVERNMENT OF NCT OF DELHI</span>
                <span className="text-[11px] font-extrabold text-blue-900">DRIVING LICENCE (FORM 7)</span>
              </div>
            </div>
            <span className="font-mono text-xs font-bold text-blue-950">DL-14 20230012345</span>
          </div>

          <div className="grid grid-cols-12 gap-2 text-[10px]">
            {/* Chip & Photo */}
            <div className="col-span-4 flex flex-col items-center gap-1.5">
              {/* ISO Chip */}
              <div className="w-10 h-7 bg-amber-200 border border-amber-400 rounded flex items-center justify-center font-mono text-[7px] text-amber-900 font-bold">
                [CHIP]
              </div>
              <div className="w-20 h-24 bg-slate-200 border border-slate-300 rounded flex flex-col items-center justify-center">
                <span className="text-2xl">👨</span>
                <span className="text-[8px] font-semibold">R. K. SHARMA</span>
              </div>
              <span className="text-[8px] text-slate-500 font-mono">B+ POSITIVE</span>
            </div>

            {/* Details */}
            <div className="col-span-8 space-y-1">
              <div>
                <span className="text-[8px] text-slate-500 block">NAME & PARENTAGE</span>
                <span className="font-bold text-slate-900">RAJESH KUMAR SHARMA</span>
                <span className="text-[9px] text-slate-600 block">S/O SHRI OM PRAKASH SHARMA</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div>
                  <span className="text-[8px] text-slate-500 block">DOB</span>
                  <span className="font-mono font-semibold">15-08-1980</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 block">VALIDITY (NT)</span>
                  <span className="font-mono font-semibold">09-05-2043</span>
                </div>
              </div>
              <div className="bg-amber-50 p-1.5 rounded border border-amber-200">
                <span className="text-[8px] font-bold text-amber-900 block">ADDRESS (KERNING VARIANCE DETECTED)</span>
                <span className="font-mono text-[9px] text-slate-800">
                  FLAT NO. 202, SAI APARTMENTS, SECTOR 12, DWARKA, NEW DELHI - 110075
                </span>
              </div>
              <div>
                <span className="text-[8px] text-slate-500 block">VEHICLE CLASS</span>
                <span className="font-bold text-blue-900">MCWG, LMV</span>
              </div>
            </div>
          </div>
        </div>
      );

    case 'pap-renuka':
      return (
        <div className="w-[520px] h-[370px] bg-[#fcfaf4] border border-slate-300 rounded p-4 font-serif text-slate-900 relative shadow-sm overflow-hidden">
          {/* MHA Header */}
          <div className="text-center border-b border-slate-400 pb-2 mb-2">
            <div className="text-sm font-bold tracking-wider">GOVERNMENT OF INDIA</div>
            <div className="text-xs font-semibold text-blue-950">MINISTRY OF HOME AFFAIRS / DM PORT BLAIR</div>
            <div className="text-[11px] font-sans font-bold uppercase tracking-widest text-slate-700 mt-1">
              PROTECTED AREA PERMIT (PAP)
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] font-sans mb-2">
            <div><strong>Permit No:</strong> <span className="font-mono">PAP/ANI/2023/1784</span></div>
            <div><strong>Date of Issue:</strong> 14/11/2023</div>
            <div><strong>Valid Until:</strong> <span className="font-bold text-emerald-800">28/11/2023</span></div>
          </div>

          <div className="grid grid-cols-12 gap-3 text-[10px] font-sans">
            <div className="col-span-3">
              <div className="w-20 h-24 bg-slate-200 border border-slate-300 rounded flex flex-col items-center justify-center">
                <span className="text-2xl">👩</span>
                <span className="text-[8px] font-semibold">MS. RENUKA</span>
              </div>
            </div>
            <div className="col-span-9 space-y-1">
              <div><strong>Applicant:</strong> MS. RENUKA SHARMA (Indian National)</div>
              <div><strong>Passport:</strong> P6789012, Issued at Delhi</div>
              <div><strong>Permitted Area:</strong> North & Middle Andaman (Havelock Island, Neil Island, Port Blair)</div>
              <div><strong>Purpose:</strong> Tourism Only (14 Calendar Days max)</div>
            </div>
          </div>

          {/* Authentic Stamps */}
          <div className="mt-4 pt-2 border-t border-slate-300 flex items-center justify-around font-sans">
            <div className="w-24 h-24 rounded-full border-2 border-blue-700 text-blue-800 flex flex-col items-center justify-center text-[8px] text-center p-1 rotate-[-4deg]">
              <span className="font-bold">★ DM PORT BLAIR ★</span>
              <span>DISTRICT MAGISTRATE</span>
              <span className="text-[7px]">VETTED & VERIFIED</span>
            </div>
            <div className="border-2 border-emerald-700 text-emerald-800 p-2 rounded text-[9px] font-bold text-center rotate-[3deg]">
              APPROVED
              <div className="text-[7px] font-normal">Assistant Secretary (Home)</div>
              <div className="font-serif italic text-xs">S. Kumar</div>
            </div>
          </div>
        </div>
      );

    case 'auth-tampered':
      return (
        <div className="w-[520px] h-[370px] bg-[#faf8f5] border-2 border-red-300 rounded p-4 font-sans text-slate-800 relative shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-red-700 pb-2 mb-3">
            <div>
              <span className="text-[9px] font-bold tracking-widest text-slate-700 block">MINISTRY OF EXTERNAL AFFAIRS</span>
              <span className="text-[12px] font-bold text-red-900">EMBASSY OF INDIA, [CITY NAME]</span>
              <span className="text-[10px] font-semibold text-slate-600 block">TRAVEL AUTHORIZATION CERTIFICATE</span>
            </div>
            <div className="text-right font-mono text-xs">
              <span className="text-[8px] text-slate-500 block">DOC NUMBER</span>
              <span className="font-bold text-slate-900">AU026F60PC1IDBG8</span>
            </div>
          </div>

          {/* Critical Alert Ribbon */}
          <div className="bg-red-50 border border-red-200 text-red-700 px-2 py-1 rounded text-[10px] font-semibold flex items-center justify-between mb-2">
            <span>⚠ CHRONOLOGY FRAUD DETECTED</span>
            <span className="font-mono text-[9px]">EXPIRED: 2016 vs STAMP: 2019</span>
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[8px] text-slate-500 block">ISSUE DATE</span>
                <span className="font-mono">06/02/2013</span>
              </div>
              <div className="bg-red-100/70 p-1 rounded border border-red-300">
                <span className="text-[8px] font-bold text-red-800 block">VALID UNTIL (EXPIRED 3.5 YRS AGO)</span>
                <span className="font-mono font-bold text-red-900">07/01/2016</span>
              </div>
            </div>

            {/* Tampered Name */}
            <div className="bg-red-100/80 p-1.5 rounded border border-red-300">
              <span className="text-[8px] font-bold text-red-800 block">SUBJECT NAME (SYNTHETIC FONT SPLICE)</span>
              <span className="font-bold text-red-950 text-sm tracking-wider font-mono">
                NO DEMO TEXT
              </span>
            </div>

            {/* Blurred Passport Box */}
            <div className="bg-slate-200 p-1.5 rounded border border-dashed border-red-400 flex items-center justify-between">
              <div>
                <span className="text-[8px] text-slate-600 block">PASSPORT NO.</span>
                <span className="font-mono blur-[2.5px] select-none text-slate-800">X98765432</span>
              </div>
              <span className="text-[9px] font-bold text-red-600 bg-white px-1.5 py-0.5 rounded">
                GAUSSIAN BLUR DETECTED
              </span>
            </div>
          </div>

          {/* Forged Stamp */}
          <div className="mt-3 pt-2 border-t border-slate-300 flex items-center justify-end">
            <div className="w-28 h-24 border-2 border-red-600 bg-red-50/90 text-red-700 rounded p-1.5 text-center flex flex-col items-center justify-center rotate-[-6deg] shadow-sm">
              <span className="text-[9px] font-bold">★ APPROVED ★</span>
              <span className="text-[7px]">CONSULAR DIVISION</span>
              <span className="text-[10px] font-mono font-extrabold text-red-900 mt-1">19.07.2019</span>
              <span className="text-[6px] text-red-600">(STAMP APPLIED 3 YRS POST-EXPIRY)</span>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="w-[500px] h-[320px] bg-white border border-slate-300 rounded p-6 flex flex-col items-center justify-center text-slate-400">
          <FileSearch className="w-12 h-12 text-slate-300 mb-2" />
          <span className="font-medium text-slate-600">Standard Document Document Container</span>
          <span className="text-xs text-slate-400 font-mono mt-1">{previewType}</span>
        </div>
      );
  }
};
