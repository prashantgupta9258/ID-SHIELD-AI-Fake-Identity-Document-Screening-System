import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  FileText, 
  ShieldCheck, 
  Eye, 
  Trash2, 
  Camera, 
  Plus, 
  RefreshCw, 
  FolderTree, 
  Info, 
  Search, 
  Stamp, 
  QrCode, 
  Calendar, 
  Hash, 
  Cpu, 
  ChevronRight,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { 
  CanonicalDocumentType, 
  DocumentUnderstandingResult, 
  DocumentSeparationGroup,
  DocumentInspectionDetails
} from '../types';
import { 
  DocumentUploadItem,
  analyzeDocumentWithAI, 
  batchUnderstandAndSeparate, 
  getReferenceDocumentUploadItems,
  getSampleUnknownDocumentItem
} from '../services/aiDocumentUnderstandingService';
import { CameraCaptureModal } from './CameraCaptureModal';

interface MultimodalDocumentPipelineProps {
  onSelectForScreening?: (doc: DocumentUnderstandingResult) => void;
  onTriggerToast?: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
}

export const MultimodalDocumentPipeline: React.FC<MultimodalDocumentPipelineProps> = ({
  onSelectForScreening,
  onTriggerToast,
}) => {
  // Queue of uploaded or reference documents
  const [queuedItems, setQueuedItems] = useState<DocumentUploadItem[]>([]);
  
  // Analyzed results & Automatic separation groups
  const [analyzedDocs, setAnalyzedDocs] = useState<DocumentUnderstandingResult[]>([]);
  const [separatedGroups, setSeparatedGroups] = useState<DocumentSeparationGroup[]>([]);
  
  // UI states
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDocDetails, setSelectedDocDetails] = useState<DocumentUnderstandingResult | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Load default demo reference bundle on initial mount so officer sees working state immediately
  useEffect(() => {
    loadDemoBundle();
  }, []);

  const loadDemoBundle = () => {
    const refs = getReferenceDocumentUploadItems();
    const unknownSample = getSampleUnknownDocumentItem();
    // Bundle includes: Passport, Visa, DL, Permit, ETA, and Unknown Document
    const bundle: DocumentUploadItem[] = [
      refs[0], // Passport
      refs[1], // Visa
      refs[3], // Driving Licence
      refs[4], // Permit
      refs[5], // Travel Authorization
      unknownSample, // Unknown / non-identity receipt
    ];
    setQueuedItems(bundle);
    onTriggerToast?.('info', 'Loaded 6-document demo bundle (Passport, Visa, DL, Permit, ETA, Unknown)');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: DocumentUploadItem[] = [];
    let processed = 0;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        newItems.push({
          id: `upload-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          fileName: file.name,
          fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          dataUrl,
          mimeType: file.type || 'image/jpeg',
          textContext: `User uploaded document file: ${file.name}`,
          sourceType: 'UPLOAD',
        });

        processed++;
        if (processed === files.length) {
          setQueuedItems((prev) => [...prev, ...newItems]);
          onTriggerToast?.('success', `Added ${newItems.length} document image(s) to analysis queue`);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const newItems: DocumentUploadItem[] = [];
    let processed = 0;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        newItems.push({
          id: `drop-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          fileName: file.name,
          fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          dataUrl,
          mimeType: file.type || 'image/jpeg',
          textContext: `User dropped document file: ${file.name}`,
          sourceType: 'UPLOAD',
        });

        processed++;
        if (processed === files.length) {
          setQueuedItems((prev) => [...prev, ...newItems]);
          onTriggerToast?.('success', `Added ${newItems.length} dropped file(s)`);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCameraCapture = (imageDataUrl: string) => {
    const newItem: DocumentUploadItem = {
      id: `cam-${Date.now()}`,
      fileName: `camera_scan_${new Date().toISOString().substring(11, 19).replace(/:/g, '-')}.jpg`,
      fileSize: '1.2 MB',
      dataUrl: imageDataUrl,
      mimeType: 'image/jpeg',
      textContext: 'Live webcam optical scan of physical identity document',
      sourceType: 'UPLOAD',
    };
    setQueuedItems((prev) => [newItem, ...prev]);
    onTriggerToast?.('success', 'Camera snapshot attached to document queue');
  };

  const removeItem = (id: string) => {
    setQueuedItems((prev) => prev.filter((item) => item.id !== id));
    setAnalyzedDocs((prev) => prev.filter((item) => item.id !== id));
    setSeparatedGroups((prev) => {
      return prev
        .map((g) => ({
          ...g,
          documents: g.documents.filter((d) => d.id !== id),
        }))
        .filter((g) => g.documents.length > 0);
    });
  };

  const runMultimodalPipeline = async () => {
    if (queuedItems.length === 0) {
      onTriggerToast?.('warning', 'Please upload or add documents to the queue first');
      return;
    }

    setIsProcessing(true);
    onTriggerToast?.('info', `AI Multimodal Pipeline started for ${queuedItems.length} document(s)...`);

    try {
      const { documents, groups } = await batchUnderstandAndSeparate(queuedItems);
      setAnalyzedDocs(documents);
      setSeparatedGroups(groups);
      if (documents.length > 0 && !selectedDocDetails) {
        setSelectedDocDetails(documents[0]);
      }
      onTriggerToast?.(
        'success',
        `Completed multimodal understanding! Separated into ${groups.length} distinct credential group(s).`
      );
    } catch (err: any) {
      onTriggerToast?.('error', `Pipeline execution failure: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredGroups = separatedGroups.filter((g) => {
    if (filterCategory === 'ALL') return true;
    return g.category === filterCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-blue-100 text-blue-800 border border-blue-200">
                Multimodal AI Pipeline
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Gemini 3.8 Flash Active
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Multimodal AI Document Understanding & Automatic Separation
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-3xl">
              Inspects text, numbers, dates, headings, labels, photo regions, stamps, seals, QR/barcodes, MRZ, 
              and layout to automatically classify and separate multiple uploaded documents.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={loadDemoBundle}
              className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
              Load Demo Separation Bundle
            </button>
            <button
              type="button"
              disabled={isProcessing || queuedItems.length === 0}
              onClick={runMultimodalPipeline}
              className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 rounded-xl shadow-xs transition-all flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>AI Analyzing & Separating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Run Multimodal AI Pipeline ({queuedItems.length})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Upload Zone & Action Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Upload className="w-4 h-4 text-blue-600" />
            Document Ingestion Queue ({queuedItems.length} Documents)
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCameraOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs"
            >
              <Camera className="w-3.5 h-3.5 text-blue-600" />
              Scan with Camera
            </button>
            <button
              type="button"
              onClick={() => {
                const unknown = getSampleUnknownDocumentItem();
                setQueuedItems((prev) => [...prev, unknown]);
                onTriggerToast?.('info', 'Added unknown receipt sample for UNKNOWN category test');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              Add Test Unknown Image
            </button>
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
            dragOver 
              ? 'border-blue-600 bg-blue-50/50' 
              : 'border-slate-300 hover:border-blue-400 bg-slate-50/50'
          }`}
        >
          <label htmlFor="multi-file-input" className="cursor-pointer block">
            <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <div className="font-bold text-slate-800 text-sm">
              Upload Single or Multiple Document Images
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Select multiple files (Passport, Visa, Driving Licence, Permit, ETA, or unknown scans)
            </p>
            <span className="inline-block mt-3 px-4 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50">
              Browse Files from Device
            </span>
            <input
              id="multi-file-input"
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Queued Documents Chips */}
        {queuedItems.length > 0 && (
          <div className="pt-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Queued Documents Ready for Analysis:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {queuedItems.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/80 flex flex-col justify-between text-xs group hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="truncate font-semibold text-slate-800 text-[11px]" title={item.fileName}>
                      {item.fileName}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-slate-400 hover:text-red-600 transition-colors p-0.5"
                      title="Remove from queue"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2">
                    <span className="font-mono">{item.fileSize}</span>
                    <span className={`px-1.5 py-0.2 rounded font-semibold text-[9px] ${
                      item.sourceType === 'REFERENCE' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {item.sourceType}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Results Grid: Left Separation Tree, Right Detailed Inspection Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= LEFT COLUMN: AUTOMATIC DOCUMENT SEPARATION TREE ================= */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <FolderTree className="w-5 h-5 text-blue-600" />
                  Automatic Document Separation Tree
                </h3>
                <p className="text-xs text-slate-500">
                  AI dynamically classifies and separates uploaded images into distinct credential categories
                </p>
              </div>

              {/* Category Filter Chips */}
              <div className="flex flex-wrap items-center gap-1">
                {['ALL', 'PASSPORT', 'VISA', 'DRIVING_LICENSE', 'PERMIT', 'UNKNOWN'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFilterCategory(cat)}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors ${
                      filterCategory === cat
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Empty State before running pipeline */}
            {separatedGroups.length === 0 && !isProcessing && (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="font-bold text-slate-700 text-sm">No Separation Results Yet</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Click the <strong>"Run Multimodal AI Pipeline"</strong> button above to process the queued images. 
                  The system will automatically group each document into its verified category.
                </p>
              </div>
            )}

            {/* Loading State during AI pipeline */}
            {isProcessing && (
              <div className="p-8 text-center bg-blue-50/50 rounded-xl border border-blue-200 space-y-3">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                <h4 className="font-bold text-blue-950 text-sm">
                  Analyzing Multimodal Document Features...
                </h4>
                <p className="text-xs text-blue-700 max-w-md mx-auto font-mono">
                  Inspecting optical text, photo boundaries, stamps, seals, barcodes, and MRZ zones across all submitted files...
                </p>
              </div>
            )}

            {/* Render Automatic Separation Groups */}
            {filteredGroups.map((group) => (
              <div 
                key={group.category}
                className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-slate-50/30"
              >
                {/* Category Header Node */}
                <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-xs text-slate-800 tracking-wider uppercase">
                      {group.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${group.badgeColor}`}>
                      {group.documents.length} {group.documents.length === 1 ? 'document' : 'documents'}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-500">
                    {group.title}
                  </span>
                </div>

                {/* Sub-documents Tree Children */}
                <div className="divide-y divide-slate-100 bg-white">
                  {group.documents.map((doc) => {
                    const isSelected = selectedDocDetails?.id === doc.id;
                    const isUnknown = doc.documentType === 'UNKNOWN';

                    return (
                      <div
                        key={doc.id}
                        onClick={() => setSelectedDocDetails(doc)}
                        className={`p-3.5 pl-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-blue-50/80 border-l-4 border-l-blue-600' 
                            : 'hover:bg-slate-50/80 border-l-4 border-l-transparent'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-400 text-xs">└──</span>
                            <span className="font-bold text-slate-900 text-xs sm:text-sm">
                              {doc.fileName}
                            </span>
                            {doc.sourceType === 'REFERENCE' && (
                              <span className="text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                Benchmark Ref
                              </span>
                            )}
                          </div>

                          {/* Classification Reason or UNKNOWN message */}
                          <div className="pl-6 text-xs">
                            {isUnknown ? (
                              <div className="text-amber-800 font-semibold flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>{doc.message || 'Unable to confidently classify this document.'}</span>
                              </div>
                            ) : (
                              <p className="text-slate-600 italic">
                                "{doc.reason}"
                              </p>
                            )}
                          </div>

                          {/* Extracted quick badges */}
                          <div className="pl-6 flex flex-wrap items-center gap-1.5 pt-1 text-[10px]">
                            {doc.inspection.photoRegions.detected && (
                              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                                Photo Region ✓
                              </span>
                            )}
                            {doc.inspection.mrz.present && (
                              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-medium">
                                MRZ Verified ✓
                              </span>
                            )}
                            {doc.inspection.stamps.detected && (
                              <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 font-medium">
                                Stamps ({doc.inspection.stamps.count}) ✓
                              </span>
                            )}
                            {doc.inspection.seals.detected && (
                              <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 font-medium">
                                Official Seal ✓
                              </span>
                            )}
                            {doc.inspection.qrBarcodeRegions.detected && (
                              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                                Barcode ({doc.inspection.qrBarcodeRegions.type}) ✓
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                              Layout: {doc.inspection.visualLayout.formFactor}
                            </span>
                          </div>
                        </div>

                        {/* Confidence Score Meter */}
                        <div className="sm:text-right shrink-0 pl-6 sm:pl-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">
                              Classification Confidence
                            </span>
                            <span className={`text-base font-black font-mono ${
                              doc.confidence >= 90 ? 'text-emerald-700' :
                              doc.confidence >= 60 ? 'text-blue-700' : 'text-slate-500'
                            }`}>
                              {doc.confidence}%
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-blue-600 flex items-center gap-0.5">
                            View Forensic Detail <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= RIGHT COLUMN: READ DOCUMENT IMAGE - FORENSIC INSPECTION DRAWER ================= */}
        <div className="lg:col-span-5 space-y-4">
          {selectedDocDetails ? (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Forensic Inspection Snapshot
                  </span>
                  <h3 className="font-black text-slate-900 text-base truncate" title={selectedDocDetails.fileName}>
                    {selectedDocDetails.fileName}
                  </h3>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold uppercase font-mono ${
                  selectedDocDetails.documentType === 'UNKNOWN' 
                    ? 'bg-slate-100 text-slate-700 border border-slate-300' 
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}>
                  {selectedDocDetails.documentType}
                </span>
              </div>

              {/* Visual Preview Canvas */}
              {selectedDocDetails.previewUrl && (
                <div className="p-3 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner">
                  {selectedDocDetails.previewUrl.startsWith('data:image/svg') ? (
                    <div 
                      className="w-full max-h-48 overflow-hidden flex items-center justify-center"
                      dangerouslySetInnerHTML={{
                        __html: decodeURIComponent(selectedDocDetails.previewUrl.replace('data:image/svg+xml;utf8,', ''))
                      }}
                    />
                  ) : (
                    <img 
                      src={selectedDocDetails.previewUrl} 
                      alt="Examined Document" 
                      className="max-h-48 object-contain rounded"
                    />
                  )}
                </div>
              )}

              {/* Primary AI Classification Callout */}
              <div className={`p-4 rounded-xl border ${
                selectedDocDetails.documentType === 'UNKNOWN'
                  ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                  : 'bg-blue-50/70 border-blue-200 text-blue-950'
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-extrabold tracking-wider opacity-75">
                      Classified Credential Category
                    </span>
                    <div className="text-lg font-black tracking-tight font-mono">
                      {selectedDocDetails.documentType}
                    </div>
                  </div>
                  <div className="text-right font-mono font-black text-lg">
                    {selectedDocDetails.confidence}%
                  </div>
                </div>
                <p className="text-xs mt-2 font-medium">
                  {selectedDocDetails.documentType === 'UNKNOWN' 
                    ? (selectedDocDetails.message || 'Unable to confidently classify this document. Do not force an incorrect category.')
                    : selectedDocDetails.reason
                  }
                </p>
              </div>

              {/* 11-Element Forensic Inspection Breakdown */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-blue-600" />
                  Inspected Document Features
                </h4>

                {/* Inspection Details Accordion Cards */}
                <div className="space-y-2 text-xs divide-y divide-slate-100">
                  {/* 1. Document Headings & Titles */}
                  <div className="pt-2">
                    <span className="font-bold text-slate-700 block mb-1">1. Headings &amp; Titles:</span>
                    {selectedDocDetails.inspection.headings.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedDocDetails.inspection.headings.map((h, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold text-[11px]">
                            {h}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">None detected</span>
                    )}
                  </div>

                  {/* 2. Key Text & Labels */}
                  <div className="pt-2">
                    <span className="font-bold text-slate-700 block mb-1">2. Labels &amp; Text Zones:</span>
                    {selectedDocDetails.inspection.labels.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedDocDetails.inspection.labels.map((l, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-600 text-[10px]">
                            {l}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">No structured field labels</span>
                    )}
                  </div>

                  {/* 3. Numbers & Identifiers */}
                  <div className="pt-2">
                    <span className="font-bold text-slate-700 block mb-1">3. Numbers &amp; Identifiers:</span>
                    {selectedDocDetails.inspection.numbers.length > 0 ? (
                      <div className="flex flex-wrap gap-1 font-mono text-[11px]">
                        {selectedDocDetails.inspection.numbers.map((n, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200 font-bold">
                            {n}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">None detected</span>
                    )}
                  </div>

                  {/* 4. Dates & Chronology */}
                  <div className="pt-2">
                    <span className="font-bold text-slate-700 block mb-1">4. Dates (DOB, Issue, Expiry):</span>
                    <div className="grid grid-cols-3 gap-1 text-[11px] font-mono">
                      <div className="p-1.5 bg-slate-50 rounded border border-slate-200">
                        <span className="text-[9px] text-slate-400 block font-sans">DOB</span>
                        <strong className="text-slate-800">{selectedDocDetails.inspection.dates.dob || 'N/A'}</strong>
                      </div>
                      <div className="p-1.5 bg-slate-50 rounded border border-slate-200">
                        <span className="text-[9px] text-slate-400 block font-sans">Issue</span>
                        <strong className="text-slate-800">{selectedDocDetails.inspection.dates.issueDate || 'N/A'}</strong>
                      </div>
                      <div className="p-1.5 bg-slate-50 rounded border border-slate-200">
                        <span className="text-[9px] text-slate-400 block font-sans">Expiry</span>
                        <strong className="text-slate-800">{selectedDocDetails.inspection.dates.expiryDate || 'N/A'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* 5. Photo Regions */}
                  <div className="pt-2">
                    <span className="font-bold text-slate-700 block mb-1">5. Photo Region:</span>
                    <p className="text-slate-600">
                      {selectedDocDetails.inspection.photoRegions.detected ? (
                        <span className="text-emerald-800 font-medium">
                          ✓ {selectedDocDetails.inspection.photoRegions.description}
                          {selectedDocDetails.inspection.photoRegions.ghostPhotoDetected && ' (Ghost portrait verified)'}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">No biometric portrait detected</span>
                      )}
                    </p>
                  </div>

                  {/* 6. Stamps & Consular Endorsements */}
                  <div className="pt-2">
                    <span className="font-bold text-slate-700 block mb-1">6. Official Stamps:</span>
                    <p className="text-slate-600">
                      {selectedDocDetails.inspection.stamps.detected ? (
                        <span className="text-purple-800 font-medium">
                          ✓ {selectedDocDetails.inspection.stamps.description} ({selectedDocDetails.inspection.stamps.count} stamp)
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">No physical ink transit stamps</span>
                      )}
                    </p>
                  </div>

                  {/* 7. Seals & Emblems */}
                  <div className="pt-2">
                    <span className="font-bold text-slate-700 block mb-1">7. Official Seals:</span>
                    <p className="text-slate-600">
                      {selectedDocDetails.inspection.seals.detected ? (
                        <span className="text-teal-800 font-medium">
                          ✓ {selectedDocDetails.inspection.seals.description}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">No recognized state seals</span>
                      )}
                    </p>
                  </div>

                  {/* 8. QR / Barcode Regions */}
                  <div className="pt-2">
                    <span className="font-bold text-slate-700 block mb-1">8. QR / Barcode Regions:</span>
                    <p className="text-slate-600">
                      {selectedDocDetails.inspection.qrBarcodeRegions.detected ? (
                        <span className="text-amber-800 font-medium">
                          ✓ [{selectedDocDetails.inspection.qrBarcodeRegions.type}] {selectedDocDetails.inspection.qrBarcodeRegions.description}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">No optical machine barcodes</span>
                      )}
                    </p>
                  </div>

                  {/* 9. MRZ (Machine Readable Zone) */}
                  <div className="pt-2">
                    <span className="font-bold text-slate-700 block mb-1">9. Machine Readable Zone (MRZ):</span>
                    {selectedDocDetails.inspection.mrz.present ? (
                      <div className="p-2 bg-slate-900 rounded font-mono text-[10px] text-emerald-400 space-y-0.5 overflow-x-auto shadow-inner">
                        {selectedDocDetails.inspection.mrz.line1 && <div>{selectedDocDetails.inspection.mrz.line1}</div>}
                        {selectedDocDetails.inspection.mrz.line2 && <div>{selectedDocDetails.inspection.mrz.line2}</div>}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">No ICAO 9303 MRZ lines present on this document</span>
                    )}
                  </div>

                  {/* 10. Visual Document Layout */}
                  <div className="pt-2">
                    <span className="font-bold text-slate-700 block mb-1">10. Visual Document Layout:</span>
                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <div className="font-mono font-bold text-slate-900 text-xs">
                        Format: {selectedDocDetails.inspection.visualLayout.formFactor}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {selectedDocDetails.inspection.visualLayout.description}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button: Feed directly into New Screening */}
              {selectedDocDetails.documentType !== 'UNKNOWN' && onSelectForScreening && (
                <button
                  type="button"
                  onClick={() => onSelectForScreening(selectedDocDetails)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <span>Initiate Full Screening with this Document</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-2xs text-center space-y-2">
              <Eye className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-700 text-sm">No Document Selected</h4>
              <p className="text-xs text-slate-500">
                Click on any document in the separation tree to inspect its text, numbers, dates, stamps, seals, QR, and MRZ details.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Camera Capture Modal */}
      {isCameraOpen && (
        <CameraCaptureModal
          isOpen={isCameraOpen}
          onClose={() => setIsCameraOpen(false)}
          onCapture={handleCameraCapture}
        />
      )}
    </div>
  );
};
