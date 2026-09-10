import React, { useState, useEffect } from 'react';
import { 
  Database, RefreshCw, UploadCloud, CheckCircle2, AlertTriangle, ShieldCheck, 
  FileText, Copy, Hash, Sparkles, Eye, Check, Trash2, Edit, Play, Plus, Image as ImageIcon, RotateCcw
} from 'lucide-react';
import { CanonicalDocumentType, FirestoreReferenceDocument } from '../types';
import { 
  subscribeToReferenceDocuments, seedAllReferenceDocuments, restartAndResetDatabase, IngestionStepProgress, 
  REFERENCE_COLLECTION_NAME, deleteReferenceDocument, saveReferenceDocument
} from '../services/referenceDocumentService';
import { DEMO_RAW_DOCUMENTS } from '../data/demoReferenceAssets';
import firebaseConfig from '../../firebase-applet-config.json';
import { analyzeDocumentWithAI } from '../services/aiDocumentUnderstandingService';

interface ReferenceDatabaseViewProps {
  onSelectDocumentForScreening?: (docRecord: FirestoreReferenceDocument) => void;
}

export const ReferenceDatabaseView: React.FC<ReferenceDatabaseViewProps> = ({
  onSelectDocumentForScreening,
}) => {
  const [firestoreDocs, setFirestoreDocs] = useState<FirestoreReferenceDocument[]>([]);
  const [activeModalDoc, setActiveModalDoc] = useState<FirestoreReferenceDocument | null>(null);
  const [ingestionProgress, setIngestionProgress] = useState<IngestionStepProgress | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Add Wizard State
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardImage, setWizardImage] = useState<string | null>(null);
  const [wizardImageFile, setWizardImageFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  
  // Edited values state
  const [editedName, setEditedName] = useState('');
  const [editedDocNumber, setEditedDocNumber] = useState('');
  const [editedExpiry, setEditedExpiry] = useState('');
  const [editedType, setEditedType] = useState<CanonicalDocumentType>('UNKNOWN');

  useEffect(() => {
    const unsubscribe = subscribeToReferenceDocuments(
      (docs) => setFirestoreDocs(docs),
      (err) => console.warn('Firestore subscription fallback:', err)
    );
    return () => unsubscribe();
  }, []);

  const displayDocs = firestoreDocs.length > 0 ? firestoreDocs : DEMO_RAW_DOCUMENTS.map(r => ({
    referenceDocumentId: r.id,
    documentType: r.category as CanonicalDocumentType,
    displayName: r.displayName,
    imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(r.svgContent)}`,
    extractedFields: r.extractedFields,
    extractedText: r.ocrText,
    normalizedFields: r.normalizedFields,
    imageHash: 'PENDING_FIREBASE_SYNC',
    sourceType: 'SIH_DEMO_DATASET' as const,
    verificationMode: 'DEMO_REFERENCE_DATABASE' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    storagePath: `reference-documents/${r.storageSubdir}/${r.fileName}`,
  }));

  const stats = {
    TOTAL: displayDocs.length,
    PASSPORT: displayDocs.filter(d => d.documentType === 'PASSPORT').length,
    VISA: displayDocs.filter(d => d.documentType === 'VISA').length,
    NATIONAL_ID: displayDocs.filter(d => d.documentType === 'NATIONAL_ID').length,
    DRIVING_LICENSE: displayDocs.filter(d => d.documentType === 'DRIVING_LICENSE').length,
    PERMIT: displayDocs.filter(d => d.documentType === 'PERMIT').length,
    TRAVEL_AUTHORIZATION: displayDocs.filter(d => d.documentType === 'TRAVEL_AUTHORIZATION').length,
  };

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      await seedAllReferenceDocuments((prog) => setIngestionProgress(prog));
    } catch (err: any) {
      console.error('Seeding error:', err);
    } finally {
      setIsSeeding(false);
      setTimeout(() => setIngestionProgress(prev => prev?.status === 'completed' ? null : prev), 6000);
    }
  };

  const handleRestartDatabase = async () => {
    if (window.confirm('Are you sure you want to restart the database? This will clear all existing reference records and re-seed the reference database with the new official documents and images.')) {
      setIsSeeding(true);
      try {
        await restartAndResetDatabase((prog) => setIngestionProgress(prog));
      } catch (err: any) {
        console.error('Restart database error:', err);
      } finally {
        setIsSeeding(false);
        setTimeout(() => setIngestionProgress(prev => prev?.status === 'completed' ? null : prev), 6000);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this reference document?')) {
      await deleteReferenceDocument(id);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setWizardImage(url);
      setWizardImageFile(file);
      setWizardStep(2);
    }
  };

  const handleAnalyze = async () => {
    if (!wizardImage) return;
    setIsAnalyzing(true);
    try {
      const res = await analyzeDocumentWithAI({
        id: `upl-${Date.now()}`,
        fileName: wizardImageFile?.name || 'upload.jpg',
        fileSize: 'Unknown',
        dataUrl: wizardImage,
        sourceType: 'UPLOAD',
      });
      setExtractedData(res);
      setEditedName(res.extractedFields?.fullName || '');
      setEditedDocNumber(res.extractedFields?.documentNumber || '');
      setEditedExpiry(res.inspection?.dates?.expiryDate || '');
      setEditedType(res.documentType as CanonicalDocumentType);
      setWizardStep(3);
    } catch (e) {
      console.error('AI Analysis failed', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveDocument = async () => {
    const newDoc: FirestoreReferenceDocument = {
      referenceDocumentId: `REF-${Date.now()}`,
      documentType: editedType,
      displayName: `${editedType} - ${editedName}`,
      imageUrl: wizardImage!,
      extractedFields: { ...extractedData?.extractedFields, fullName: editedName, documentNumber: editedDocNumber },
      extractedText: 'Generated from UI upload',
      normalizedFields: { FULLNAME: editedName, DOCNUMBER: editedDocNumber, EXPIRY_DATE: editedExpiry },
      imageHash: 'USER_UPLOADED_HASH',
      sourceType: 'SIH_DEMO_DATASET',
      verificationMode: 'DEMO_REFERENCE_DATABASE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      storagePath: `reference-documents/custom/`,
    };
    await saveReferenceDocument(newDoc);
    setIsAddingDoc(false);
    setWizardStep(1);
    setWizardImage(null);
    setWizardImageFile(null);
    setExtractedData(null);
  };

  return (
    <div className="space-y-6">
      {!isAddingDoc ? (
        <>
          {/* Header Section */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Demo Reference Database</h1>
                <p className="text-sm text-slate-600 mt-1 max-w-3xl">Controlled dataset for SIH prototype testing</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  id="restart-database-btn"
                  onClick={handleRestartDatabase}
                  disabled={isSeeding}
                  className={`inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold shadow-xs transition-all ${
                    isSeeding ? 'bg-slate-100 text-slate-400' : 'bg-red-50 border border-red-200 hover:bg-red-100 text-red-700'
                  }`}
                  title="Purge previous documents and re-seed with latest official documents"
                >
                  <RotateCcw className={`w-4 h-4 mr-2 ${isSeeding ? 'animate-spin' : ''}`} />
                  Restart Database
                </button>
                <button
                  onClick={() => setIsAddingDoc(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Reference Document
                </button>
                <button
                  onClick={handleSeedDatabase}
                  disabled={isSeeding}
                  className={`inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold shadow-xs transition-all ${
                    isSeeding ? 'bg-slate-100 text-slate-400' : 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isSeeding ? 'animate-spin' : ''}`} />
                  {isSeeding ? 'Ingesting...' : 'Sync Demo Dataset'}
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {Object.entries(stats).map(([key, count]) => (
              <div key={key} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col items-center justify-center text-center hover:border-blue-300 transition-colors">
                <span className="text-2xl font-black text-slate-800">{count}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase mt-1">{key.replace('_', ' ')}</span>
              </div>
            ))}
          </div>

          {ingestionProgress && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 shadow-xs transition-all animate-fadeIn">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600 animate-spin" />
                  <span className="font-semibold text-blue-900 text-sm">
                    9-Step AI Document Ingestion &amp; Firebase Storage Pipeline
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                  {ingestionProgress.percent}% ({ingestionProgress.step}/{ingestionProgress.totalSteps})
                </span>
              </div>
              <p className="text-xs text-blue-700 mb-3">{ingestionProgress.message}</p>
              <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out" style={{ width: `${ingestionProgress.percent}%` }}></div>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Reference ID</th>
                    <th className="py-3 px-4">Document Type</th>
                    <th className="py-3 px-4 text-center">Preview</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Document Number</th>
                    <th className="py-3 px-4">Expiry</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Created At</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayDocs.map((doc) => (
                    <tr key={doc.referenceDocumentId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-700 text-[10px]">
                        {doc.referenceDocumentId}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-slate-100 border border-slate-200 text-slate-800 uppercase">
                          {doc.documentType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="w-10 h-6 bg-slate-100 rounded border border-slate-200 mx-auto overflow-hidden flex items-center justify-center">
                          <img src={doc.imageUrl} alt="preview" className="max-w-full max-h-full object-cover" />
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {doc.normalizedFields?.FULLNAME || doc.extractedFields?.fullName || 'N/A'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {doc.normalizedFields?.DOCNUMBER || doc.extractedFields?.documentNumber || 'N/A'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {doc.normalizedFields?.EXPIRY_DATE || doc.extractedFields?.expiryDate || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 font-semibold text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          VERIFIED
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[10px]">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right flex items-center justify-end gap-1.5">
                        <button onClick={() => setActiveModalDoc(doc)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        {onSelectDocumentForScreening && (
                          <button onClick={() => onSelectDocumentForScreening(doc)} className="p-1.5 text-purple-600 hover:bg-purple-50 rounded" title="Analyze">
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => setActiveModalDoc(doc)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(doc.referenceDocumentId)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Add Reference Document Wizard */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Add New Reference Document</h2>
              <p className="text-xs text-slate-500 mt-1">Admin workflow for adding authenticated templates to the prototype dataset</p>
            </div>
            <button
              onClick={() => {
                setIsAddingDoc(false);
                setWizardStep(1);
                setWizardImage(null);
                setExtractedData(null);
              }}
              className="text-slate-400 hover:text-slate-700 text-sm font-semibold"
            >
              Cancel
            </button>
          </div>

          <div className="p-6">
            {/* Step Indicators */}
            <div className="flex items-center justify-between mb-8 relative">
              <div className="absolute top-1/2 left-0 w-full h-px bg-slate-200 -z-10 -translate-y-1/2"></div>
              {['Upload Image', 'AI Document Type & OCR', 'Admin Review & Save'].map((label, idx) => {
                const stepNum = idx + 1;
                const isActive = wizardStep === stepNum;
                const isPassed = wizardStep > stepNum;
                return (
                  <div key={stepNum} className="flex flex-col items-center gap-2 bg-white px-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                      isActive ? 'border-blue-600 bg-blue-600 text-white' :
                      isPassed ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-200 bg-slate-50 text-slate-400'
                    }`}>
                      {isPassed ? <Check className="w-4 h-4" /> : stepNum}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-blue-700' : isPassed ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Step 1: Upload */}
            {wizardStep === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/50 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors text-center">
                  <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center border border-slate-100">
                    <ImageIcon className="w-8 h-8 text-blue-500" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 text-base block mb-1">Click to upload document sample</span>
                    <span className="text-xs text-slate-500">PNG, JPG, SVG up to 10MB</span>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            )}

            {/* Step 2: Analysis */}
            {wizardStep === 2 && wizardImage && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                <div className="flex justify-center">
                  <img src={wizardImage} alt="Uploaded preview" className="max-h-64 object-contain rounded-xl border border-slate-200 shadow-sm" />
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition-all disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <><RefreshCw className="w-5 h-5 animate-spin" /> Running Multi-layer AI Extraction...</>
                    ) : (
                      <><Sparkles className="w-5 h-5" /> Start AI Analysis (OCR & Field Extraction)</>
                    )}
                  </button>
                </div>
                {isAnalyzing && (
                  <div className="max-w-md mx-auto space-y-2 mt-4 text-xs font-mono text-slate-500">
                    <div className="flex items-center justify-between"><span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"/> Analyzing Document Type</span><span>...</span></div>
                    <div className="flex items-center justify-between"><span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" style={{animationDelay: '0.2s'}}/> Extracting OCR Text</span><span>...</span></div>
                    <div className="flex items-center justify-between"><span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" style={{animationDelay: '0.4s'}}/> Normalizing Fields</span><span>...</span></div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Admin Review & Save */}
            {wizardStep === 3 && extractedData && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                    <img src={wizardImage!} alt="Preview" className="max-h-48 object-contain mx-auto rounded shadow-sm border border-slate-200" />
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex gap-3 text-emerald-900 text-xs">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <strong className="block mb-0.5 text-sm">AI Analysis Complete</strong>
                      The document has been processed. Please review and correct the extracted fields before adding to the trusted reference database.
                    </div>
                  </div>
                </div>

                <div className="space-y-4 bg-white p-5 border border-slate-200 rounded-xl shadow-2xs">
                  <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Edit Extracted Fields</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Document Type</label>
                      <select 
                        value={editedType}
                        onChange={(e) => setEditedType(e.target.value as CanonicalDocumentType)}
                        className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="PASSPORT">Passport</option>
                        <option value="VISA">Visa</option>
                        <option value="NATIONAL_ID">National ID</option>
                        <option value="DRIVING_LICENSE">Driving License</option>
                        <option value="PERMIT">Permit</option>
                        <option value="TRAVEL_AUTHORIZATION">Travel Authorization</option>
                        <option value="UNKNOWN">Unknown</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Full Name</label>
                      <input 
                        type="text" 
                        value={editedName} 
                        onChange={(e) => setEditedName(e.target.value)}
                        className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Document Number</label>
                      <input 
                        type="text" 
                        value={editedDocNumber} 
                        onChange={(e) => setEditedDocNumber(e.target.value)}
                        className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Expiry Date</label>
                      <input 
                        type="text" 
                        value={editedExpiry} 
                        onChange={(e) => setEditedExpiry(e.target.value)}
                        placeholder="YYYY-MM-DD"
                        className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono" 
                      />
                    </div>
                  </div>

                  <div className="pt-4 mt-2 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={handleSaveDocument}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-xs transition-colors"
                    >
                      <Database className="w-4 h-4" />
                      Save Reference Document
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {activeModalDoc && !isAddingDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">{activeModalDoc.displayName}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs text-blue-600 font-semibold">{activeModalDoc.referenceDocumentId}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{activeModalDoc.documentType}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setActiveModalDoc(null)} className="p-2 rounded-lg hover:bg-slate-200 text-slate-500">✕</button>
            </div>
            
            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 flex items-center justify-center min-h-[250px]">
                  <img src={activeModalDoc.imageUrl} alt={activeModalDoc.displayName} className="max-h-72 object-contain rounded shadow-sm" />
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Storage Metadata</h4>
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between py-1 border-b border-slate-200"><span className="font-medium">Storage Path</span><span className="font-mono">{activeModalDoc.storagePath}</span></div>
                    <div className="flex justify-between py-1"><span className="font-medium">Image Hash</span><span className="font-mono truncate max-w-[150px]">{activeModalDoc.imageHash}</span></div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 uppercase tracking-wider">
                    Normalized Reference Fields
                  </div>
                  <div className="divide-y divide-slate-100 p-2">
                    {Object.entries(activeModalDoc.normalizedFields || {}).map(([key, val]) => (
                      <div key={key} className="px-3 py-2 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-500">{key}</span>
                        <span className="font-mono font-bold text-slate-900">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 uppercase tracking-wider">
                    Extracted Fields (Raw)
                  </div>
                  <div className="divide-y divide-slate-100 p-2 max-h-40 overflow-y-auto">
                    {Object.entries(activeModalDoc.extractedFields || {}).map(([key, val]) => (
                      <div key={key} className="px-3 py-1.5 flex items-center justify-between text-xs">
                        <span className="text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="font-mono font-medium text-slate-800">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">Created: {new Date(activeModalDoc.createdAt).toLocaleString()}</span>
              <button onClick={() => setActiveModalDoc(null)} className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-bold">Close Inspector</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
