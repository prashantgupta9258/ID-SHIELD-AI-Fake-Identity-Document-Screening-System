import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Sparkles, 
  Upload, 
  Camera, 
  Copy, 
  Check, 
  ArrowRight, 
  RefreshCw, 
  ShieldCheck, 
  Info,
  Calendar,
  Layers,
  FileCheck2,
  FileQuestion,
  ExternalLink
} from 'lucide-react';
import { 
  CanonicalDocumentType, 
  OcrExtractionResult 
} from '../types';
import { 
  extractDocumentStructuredFields, 
  EXPECTED_FIELDS_BY_TYPE 
} from '../services/ocrExtractionService';
import { CameraCaptureModal } from './CameraCaptureModal';

interface OcrStructuredFieldExtractorProps {
  onTriggerToast?: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onSendToScreening?: (data: { docType: CanonicalDocumentType; fields: Record<string, string | null> }) => void;
}

interface DemoPreset {
  id: string;
  name: string;
  docType: CanonicalDocumentType;
  description: string;
  isOccluded?: boolean;
  sampleText: string;
}

const DEMO_PRESETS: DemoPreset[] = [
  {
    id: 'preset-passport',
    name: 'Indian Passport (ICAO Doc 9303)',
    docType: 'PASSPORT',
    description: '13-field complete ICAO TD3 optical passport page with 2-line MRZ',
    sampleText: `REPUBLIC OF INDIA / भारत गणराज्य\nPASSPORT / पासपोर्ट\nType/प्रकार: P  Code/कोड: IND  Passport No./पासपोर्ट नं.: Z1234567\nSurname/उपनाम: SINGH\nGiven Names/दिया गया नाम: ARYA\nNationality/राष्ट्रीयता: INDIAN\nSex/लिंग: F  Date of Birth/जन्म तिथि: 15/07/1992\nPlace of Birth/जन्म स्थान: CHANDIGARH, INDIA\nPlace of Issue/जारी करने का स्थान: CHANDIGARH\nDate of Issue/जारी करने की तिथि: 20/01/2023  Date of Expiry/समाप्ति की तिथि: 19/01/2033\nIssuing Authority: PASSPORT OFFICE, CHANDIGARH\nP<INDSINGH<<ARYA<<<<<<<<<<<<<<<<<<<<<<<<<<<<\nZ1234567<0IND9207153F3301193<<<<<<<<<<<<<<06`,
  },
  {
    id: 'preset-passport-occluded',
    name: 'Damaged Passport (Null & Uncertain Fields Test)',
    docType: 'PASSPORT',
    description: 'Demonstrates strict non-hallucination policy: water damage obscures placeOfBirth and placeOfIssue',
    isOccluded: true,
    sampleText: `REPUBLIC OF INDIA / भारत गणराज्य\nPASSPORT / पासपोर्ट\nType/प्रकार: P  Code/कोड: IND  Passport No./पासपोर्ट नं.: Z9921458\nSurname/उपनाम: VERMA\nGiven Names/दिया गया नाम: RAHUL\nNationality/राष्ट्रीयता: INDIAN\nSex/लिंग: M  Date of Birth/जन्म तिथि: 04-11-1988\nPlace of Birth/जन्म स्थान: [SMUDGED INK UNREADABLE]\nPlace of Issue/जारी करने का स्थान: [WATER STAIN TORN]\nDate of Issue/जारी करने की तिथि: 12-08-2021  Date of Expiry/समाप्ति की तिथि: 11-08-2031\nIssuing Authority: PASSPORT OFFICE, NEW DELHI\nP<INDVERMA<<RAHUL<<<<<<<<<<<<<<<<<<<<<<<<<<<\nZ9921458<0IND8811045M3108112<<<<<<<<<<<<<<04`,
  },
  {
    id: 'preset-visa',
    name: 'Schengen Visa Sticker',
    docType: 'VISA',
    description: '10-field consular visa sticker with entry validity, stay duration, and visa type',
    sampleText: `REPUBLIQUE FRANCAISE - SCHENGEN VISA\nVALABLE POUR: ETATS SCHENGEN\nDU: 01-04-2024  AU: 30-09-2024\nTYPE DE VISA: C\nNOMBRE D'ENTREES: MULT\nDUREE DE SEJOUR: 90 JOURS\nDELIVRE A: NEW DELHI\nLE: 25-03-2024\nNUMERO DE PASSPORT: Z1234567\nNOM, PRENOM: ARYA SINGH\nVISA NUMBER: FRA08849120\nVNFRA<<ARYA<<SINGH<<<<<<<<<<<<<<<<<<<<<<<<<<\n08849120<4IND9207153F2409304<<<<<<<<<<<<<<02`,
  },
  {
    id: 'preset-national-id',
    name: 'National ID (Aadhaar)',
    docType: 'NATIONAL_ID',
    description: '6-field resident national identity card with 12-digit number and address',
    sampleText: `GOVERNMENT OF INDIA\nUNIQUE IDENTIFICATION AUTHORITY OF INDIA\nEnrollment No: 1042/88391/00291\nTo, Arya Singh\nD/O Rajesh Singh\nH.No 442, Sector 15-A, Chandigarh, 160015\nDOB: 15/07/1992\nFemale / महिला\nAadhaar Number: 2847 9102 4431\nमेरा आधार, मेरी पहचान`,
  },
  {
    id: 'preset-dl',
    name: 'Driving Licence (UT Chandigarh)',
    docType: 'DRIVING_LICENSE',
    description: '8-field motor vehicle driving license with vehicle classes and multi-format dates',
    sampleText: `UNION OF INDIA - DRIVING LICENCE\nSTATE TRANSPORT AUTHORITY UT CHANDIGARH\nDL No: DL-0420180092147\nName: ARYA SINGH\nDOB: 15-07-1992\nIssue Date: 14-05-2018\nValid Till (Non-Transport): 13-05-2038\nVehicle Class: MCWG, LMV\nAddress: Flat 12B, Officers Colony, Sector 9, Chandigarh\nIssuing Authority: RTO CHANDIGARH`,
  },
  {
    id: 'preset-permit',
    name: 'Restricted Area Permit (RAP)',
    docType: 'PERMIT',
    description: '11-field Ministry of Home Affairs border sensitive zone movement permit',
    sampleText: `GOVERNMENT OF INDIA - MINISTRY OF HOME AFFAIRS\nFOREIGNERS REGIONAL REGISTRATION OFFICE (FRRO)\nRESTRICTED AREA PERMIT (RAP)\nPermit Number: RAP-2024-DEL-00918\nApplicant Name: ARYA SINGH\nPassport Number: Z1234567\nNationality: INDIAN\nDate of Birth: 15/07/1992\nDate of Issue: 01/03/2024\nValid Until: 31/08/2024\nPermitted Area: SECTOR 4B - LADAKH BORDER SENSITIVE ZONE\nPurpose: SCIENTIFIC RESEARCH & TERRAIN MAPPING\nIssuing Authority: MINISTRY OF HOME AFFAIRS, NEW DELHI\nApproval Status: APPROVED`,
  },
  {
    id: 'preset-eta',
    name: 'Electronic Travel Authorization (ETA)',
    docType: 'TRAVEL_AUTHORIZATION',
    description: '9-field Bureau of Immigration Air Suvidha travel authorization clearance',
    sampleText: `BUREAU OF IMMIGRATION - AIR SUVIDHA / ETA\nELECTRONIC TRAVEL AUTHORIZATION\nDocument Number: ETA-IND-8839104\nApplicant Name: ARYA SINGH\nPassport Number: Z1234567\nNationality: INDIAN\nDate of Birth: 15/07/1992\nDate of Issue: 10/02/2024\nValid Until: 09/02/2025\nIssuing Authority: BUREAU OF IMMIGRATION, GOVT OF INDIA\nApproval Status: GRANTED`,
  },
];

export const OcrStructuredFieldExtractor: React.FC<OcrStructuredFieldExtractorProps> = ({
  onTriggerToast,
  onSendToScreening,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('preset-passport');
  const [customText, setCustomText] = useState<string>(DEMO_PRESETS[0].sampleText);
  const [uploadedImage, setUploadedImage] = useState<{ name: string; dataUrl: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'structured' | 'raw_ocr' | 'json_output'>('structured');
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [extractionResult, setExtractionResult] = useState<OcrExtractionResult | null>(() => {
    // Initialize with standard passport extraction
    return {
      documentType: 'PASSPORT',
      confidence: 98.4,
      extractedText: DEMO_PRESETS[0].sampleText,
      fields: {
        surname: 'SINGH',
        givenNames: 'ARYA',
        fullName: 'ARYA SINGH',
        passportNumber: 'Z1234567',
        nationality: 'INDIAN',
        dateOfBirth: '15/07/1992',
        gender: 'F',
        placeOfBirth: 'CHANDIGARH, INDIA',
        placeOfIssue: 'CHANDIGARH',
        dateOfIssue: '20/01/2023',
        dateOfExpiry: '19/01/2033',
        mrz: 'P<INDSINGH<<ARYA<<<<<<<<<<<<<<<<<<<<<<<<<<<<\nZ1234567<0IND9207153F3301193<<<<<<<<<<<<<<06',
        issuingAuthority: 'PASSPORT OFFICE, CHANDIGARH',
      },
      normalizedFields: {
        surname: 'SINGH',
        givenNames: 'ARYA',
        fullName: 'ARYA SINGH',
        passportNumber: 'Z1234567',
        nationality: 'IND',
        dateOfBirth: '1992-07-15',
        gender: 'F',
        placeOfBirth: 'CHANDIGARH, INDIA',
        placeOfIssue: 'CHANDIGARH',
        dateOfIssue: '2023-01-20',
        dateOfExpiry: '2033-01-19',
        mrz: 'P<INDSINGH<<ARYA<<<<<<<<<<<<<<<<<<<<<<<<<<<<\nZ1234567<0IND9207153F3301193<<<<<<<<<<<<<<06',
        issuingAuthority: 'PASSPORT OFFICE, CHANDIGARH',
      },
      uncertainFields: [],
      warnings: ['All 13 mandatory ICAO TD3 fields verified against optical OCR text.'],
      analysisTimestamp: new Date().toISOString(),
    };
  });

  const handleSelectPreset = (preset: DemoPreset) => {
    setSelectedPresetId(preset.id);
    setCustomText(preset.sampleText);
    setUploadedImage(null);
    runExtraction({
      textContext: preset.sampleText,
      documentType: preset.docType,
      fileName: `${preset.docType.toLowerCase()}_sample.jpg`,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUploadedImage({
        name: file.name,
        dataUrl,
      });
      setSelectedPresetId('custom-upload');
      runExtraction({
        fileName: file.name,
        dataUrl,
        mimeType: file.type || 'image/jpeg',
        textContext: `User uploaded document file: ${file.name}`,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = (imageDataUrl: string) => {
    const name = `camera_scan_${Date.now()}.jpg`;
    setUploadedImage({
      name,
      dataUrl: imageDataUrl,
    });
    setSelectedPresetId('custom-camera');
    runExtraction({
      fileName: name,
      dataUrl: imageDataUrl,
      mimeType: 'image/jpeg',
      textContext: 'Live webcam snapshot captured by border officer',
    });
  };

  const runExtraction = async (payload: {
    textContext?: string;
    documentType?: CanonicalDocumentType;
    fileName?: string;
    dataUrl?: string;
    mimeType?: string;
  }) => {
    setIsProcessing(true);
    onTriggerToast?.('info', 'Running multimodal OCR & structured field extraction...');

    try {
      const result = await extractDocumentStructuredFields({
        ...payload,
        id: `ocr-${Date.now()}`,
      });

      setExtractionResult(result);
      if (result.uncertainFields.length > 0) {
        onTriggerToast?.('warning', `Extracted with ${result.uncertainFields.length} uncertain/null field(s).`);
      } else {
        onTriggerToast?.('success', `Successfully extracted ${Object.keys(result.fields).length} fields for ${result.documentType}`);
      }
    } catch (err: any) {
      onTriggerToast?.('error', `OCR Extraction error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    onTriggerToast?.('info', 'Copied to clipboard');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const currentPreset = DEMO_PRESETS.find(p => p.id === selectedPresetId);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                Core Module: OCR & Extraction
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                Zero-Hallucination Policy Enforced
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1.5">
              OCR & Structured Field Extraction
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
              Extracts mandatory structured credentials across every supported document type. Missing or unreadable fields strictly return <code className="text-slate-800 font-mono font-bold bg-slate-100 px-1 py-0.5 rounded">null</code> and are added to <code className="text-amber-800 font-mono font-bold bg-amber-50 px-1 py-0.5 rounded">uncertainFields[]</code> without synthetic fabrication.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <label 
              htmlFor="ocr-file-upload-input"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl shadow-2xs cursor-pointer transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              Upload Image
              <input 
                id="ocr-file-upload-input" 
                type="file" 
                accept="image/*,.pdf" 
                onChange={handleFileUpload} 
                className="hidden" 
              />
            </label>

            <button
              type="button"
              onClick={() => setIsCameraOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl shadow-2xs transition-colors"
            >
              <Camera className="w-3.5 h-3.5 text-blue-600" />
              Camera Scan
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => {
                if (uploadedImage) {
                  runExtraction({
                    fileName: uploadedImage.name,
                    dataUrl: uploadedImage.dataUrl,
                  });
                } else {
                  runExtraction({
                    textContext: customText,
                    documentType: currentPreset?.docType,
                  });
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
              {isProcessing ? 'Extracting...' : 'Re-Run OCR'}
            </button>
          </div>
        </div>

        {/* Demo Preset Selector Pills */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5 flex items-center justify-between">
            <span>Select Document Specification Preset:</span>
            <span className="text-[11px] font-normal text-slate-400">Click any preset to test extraction & normalizer</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {DEMO_PRESETS.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-3 rounded-xl border text-left transition-all relative ${
                    isSelected 
                      ? 'border-blue-600 bg-blue-50/70 shadow-2xs ring-1 ring-blue-600' 
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50/50'
                  }`}
                >
                  {preset.isOccluded && (
                    <span className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      NULL / UNCERTAIN
                    </span>
                  )}
                  <div className="text-xs font-bold text-slate-900 truncate pr-16">{preset.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{preset.description}</div>
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-mono text-blue-700 font-semibold">
                    <span>{preset.docType}</span>
                    <span>•</span>
                    <span>{EXPECTED_FIELDS_BY_TYPE[preset.docType]?.length || 0} fields</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Analysis Display Grid */}
      {extractionResult && (
        <div className="space-y-6">
          {/* Top Status & Metrics Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Classified Document Type</span>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-lg font-black text-slate-900">{extractionResult.documentType}</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {extractionResult.confidence}% confidence
                </span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {EXPECTED_FIELDS_BY_TYPE[extractionResult.documentType]?.length || 0} mandatory fields expected
              </span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Resolved Fields</span>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-lg font-black text-emerald-700">
                  {Object.values(extractionResult.fields).filter(v => v !== null).length}
                </span>
                <span className="text-xs text-slate-500">
                  of {EXPECTED_FIELDS_BY_TYPE[extractionResult.documentType]?.length || 0} fields
                </span>
              </div>
              <span className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                OCR and normalized pairs verified
              </span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Uncertain / Null Fields</span>
              <div className="mt-1 flex items-center gap-2">
                <span className={`text-lg font-black ${extractionResult.uncertainFields.length > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                  {extractionResult.uncertainFields.length}
                </span>
                {extractionResult.uncertainFields.length > 0 ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    Flagged Null
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-600">
                    0 Uncertain
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block truncate">
                {extractionResult.uncertainFields.length > 0 
                  ? extractionResult.uncertainFields.join(', ')
                  : 'No missing fields detected'}
              </span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Normalization Engine</span>
                <div className="mt-1 text-sm font-bold text-slate-800">
                  ISO 8601 (YYYY-MM-DD)
                </div>
                <span className="text-[11px] text-slate-500 block">
                  Names, Document IDs & ICAO Codes
                </span>
              </div>
              {onSendToScreening && (
                <button
                  type="button"
                  onClick={() => {
                    onSendToScreening({
                      docType: extractionResult.documentType,
                      fields: extractionResult.normalizedFields,
                    });
                  }}
                  className="mt-2 w-full py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors"
                >
                  Send to Screening Form
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Strict Null/Uncertain Fields Warning Banner */}
          {extractionResult.uncertainFields.length > 0 && (
            <div className="bg-amber-50/80 border border-amber-300 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-900">
                  Strict Zero-Hallucination Alert: Uncertain / Null Fields Detected ({extractionResult.uncertainFields.length})
                </h4>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  The AI system did not invent or speculate unreadable data. The following field(s) were obscured, damaged, or absent from the physical document scan and were explicitly set to <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">null</code>:
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {extractionResult.uncertainFields.map((f) => (
                    <span 
                      key={f} 
                      className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-white border border-amber-300 text-amber-900 shadow-2xs inline-flex items-center gap-1"
                    >
                      <FileQuestion className="w-3 h-3 text-amber-600" />
                      {f}: null
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 pt-3 bg-slate-50/50">
              <div className="flex items-center gap-2">
                {[
                  { id: 'structured', label: 'Structured Fields Table', icon: FileCheck2 },
                  { id: 'raw_ocr', label: 'Raw Optical OCR Text', icon: FileText },
                  { id: 'json_output', label: 'Normalized JSON Response', icon: Layers },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-all ${
                        isActive 
                          ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg' 
                          : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 rounded-t-lg'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="pb-2">
                <button
                  type="button"
                  onClick={() => copyToClipboard(JSON.stringify(extractionResult, null, 2), 'all_json')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-2xs"
                >
                  {copiedKey === 'all_json' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy Output
                </button>
              </div>
            </div>

            {/* TAB 1: Structured Fields Table */}
            {activeTab === 'structured' && (
              <div className="p-4 overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                      <th className="py-2.5 px-3 font-bold uppercase tracking-wider">Field Name</th>
                      <th className="py-2.5 px-3 font-bold uppercase tracking-wider">Original OCR Value</th>
                      <th className="py-2.5 px-3 font-bold uppercase tracking-wider">Normalized Value</th>
                      <th className="py-2.5 px-3 font-bold uppercase tracking-wider">Status</th>
                      <th className="py-2.5 px-3 font-bold uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {(EXPECTED_FIELDS_BY_TYPE[extractionResult.documentType] || Object.keys(extractionResult.fields)).map((fieldName) => {
                      const rawVal = extractionResult.fields[fieldName];
                      const normVal = extractionResult.normalizedFields[fieldName];
                      const isUncertain = rawVal === null || extractionResult.uncertainFields.includes(fieldName);

                      return (
                        <tr 
                          key={fieldName}
                          className={`hover:bg-slate-50/70 transition-colors ${
                            isUncertain ? 'bg-amber-50/40' : ''
                          }`}
                        >
                          <td className="py-3 px-3 font-mono font-bold text-slate-800">
                            {fieldName}
                          </td>
                          <td className="py-3 px-3">
                            {isUncertain ? (
                              <span className="font-mono text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded text-[11px] font-bold">
                                null
                              </span>
                            ) : (
                              <span className="text-slate-900 font-medium font-mono text-[11px] break-all">
                                {rawVal}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            {isUncertain ? (
                              <span className="font-mono text-slate-400 italic">null</span>
                            ) : (
                              <span className="font-mono text-blue-900 font-bold text-[11px] bg-blue-50 px-2 py-0.5 rounded border border-blue-100 break-all">
                                {normVal}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            {isUncertain ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                <HelpCircle className="w-3 h-3 text-amber-600" />
                                Uncertain / Unread
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Validated
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            {rawVal && (
                              <button
                                type="button"
                                onClick={() => copyToClipboard(String(normVal || rawVal), fieldName)}
                                className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100"
                                title="Copy normalized value"
                              >
                                {copiedKey === fieldName ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 2: Raw Optical OCR Text */}
            {activeTab === 'raw_ocr' && (
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Raw extracted OCR buffer directly parsed from document typography:</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(extractionResult.extractedText, 'ocr_text')}
                    className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:underline"
                  >
                    {copiedKey === 'ocr_text' ? 'Copied!' : 'Copy Raw Text'}
                  </button>
                </div>
                <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto border border-slate-800 selection:bg-blue-500 selection:text-white">
                  {extractionResult.extractedText || '// No text extracted'}
                </div>
              </div>
            )}

            {/* TAB 3: Normalized JSON Response */}
            {activeTab === 'json_output' && (
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Standardized JSON Payload matching technical API contracts:</span>
                  <span className="font-mono text-[11px] text-slate-400">Timestamp: {extractionResult.analysisTimestamp}</span>
                </div>
                <div className="bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto border border-slate-800">
                  {JSON.stringify(extractionResult, null, 2)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Camera Capture Modal */}
      {isCameraOpen && (
        <CameraCaptureModal
          onCapture={handleCameraCapture}
          onClose={() => setIsCameraOpen(false)}
        />
      )}
    </div>
  );
};
