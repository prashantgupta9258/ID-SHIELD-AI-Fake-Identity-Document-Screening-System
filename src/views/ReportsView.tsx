import React, { useEffect, useState } from 'react';
import { 
  Printer, 
  Download, 
  ChevronLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Database
} from 'lucide-react';
import { ScreeningRecord, ScreeningReportRecord } from '../types';
import { saveScreeningReport } from '../services/reportService';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { DEMO_RAW_DOCUMENTS } from '../data/demoReferenceAssets';
import { REFERENCE_DOCUMENTS } from '../data/referenceDataset';

export function getOfficialDocumentTypeName(record: ScreeningRecord): string {
  if (!record || !record.document) return 'OFFICIAL TRAVEL CREDENTIAL';

  const doc = record.document;
  const person = record.person || ({} as any);
  const docNum = String(doc.docNumber || '').trim().toUpperCase();
  const rawTypeName = String(doc.typeName || '').trim();
  const rawType = String(doc.type || '').trim().toLowerCase();
  const fullName = String(person.fullName || '').trim().toUpperCase();

  // 1. Direct match with reference databases
  for (const raw of DEMO_RAW_DOCUMENTS) {
    const rawNum = String(raw.samplePerson.docNumber || '').replace(/[\s\-_]/g, '').toUpperCase();
    const cleanDocNum = docNum.replace(/[\s\-_]/g, '').toUpperCase();
    const rawName = String(raw.samplePerson.fullName || '').trim().toUpperCase();
    if (
      (cleanDocNum && rawNum && (cleanDocNum === rawNum || cleanDocNum.includes(rawNum) || rawNum.includes(cleanDocNum))) ||
      (fullName && rawName && fullName === rawName)
    ) {
      if (raw.category === 'PASSPORT') return 'INDIAN REPUBLIC PASSPORT (BIO-DATA PAGE)';
      if (raw.category === 'VISA') return 'REPUBLIC OF INDIA VISA (TOURIST STICKER)';
      if (raw.category === 'NATIONAL_ID') return 'AADHAAR NATIONAL IDENTITY CARD (UIDAI)';
      if (raw.category === 'DRIVING_LICENSE') return 'MOTOR VEHICLE DRIVING LICENCE (SMART CARD)';
      if (raw.category === 'PERMIT') return 'PROTECTED AREA PERMIT (PAP - RESTRICTED REGION)';
      if (raw.category === 'TRAVEL_AUTHORIZATION') return 'MINISTRY OF EXTERNAL AFFAIRS TRAVEL AUTHORIZATION';
      return raw.displayName.toUpperCase();
    }
  }

  for (const ref of REFERENCE_DOCUMENTS) {
    const refNum = String(ref.docNumber || '').replace(/[\s\-_]/g, '').toUpperCase();
    const cleanDocNum = docNum.replace(/[\s\-_]/g, '').toUpperCase();
    const refName = String(ref.personName || '').trim().toUpperCase();
    if (
      (cleanDocNum && refNum && (cleanDocNum === refNum || cleanDocNum.includes(refNum) || refNum.includes(cleanDocNum))) ||
      (fullName && refName && fullName === refName)
    ) {
      if (ref.docTypeName) return ref.docTypeName.toUpperCase();
      if (ref.name) return ref.name.toUpperCase();
    }
  }

  // 2. Pattern detection from document number & text
  if (/^\d{4}\s\d{4}\s\d{4}$/.test(docNum) || /^\d{12}$/.test(docNum.replace(/\s+/g, '')) || rawType === 'aadhaar' || rawType === 'national_id' || rawTypeName.toLowerCase().includes('aadhaar')) {
    return 'AADHAAR NATIONAL IDENTITY CARD (UIDAI)';
  }
  if (docNum.startsWith('DL') || docNum.includes('DL-') || rawType === 'driving_license' || rawTypeName.toLowerCase().includes('driving')) {
    return 'MOTOR VEHICLE DRIVING LICENCE (SMART CARD)';
  }
  if (docNum.startsWith('PAP') || rawType === 'permit' || rawTypeName.toLowerCase().includes('permit')) {
    return 'PROTECTED AREA PERMIT (PAP - RESTRICTED REGION)';
  }
  if (docNum.startsWith('TA-') || rawType === 'travel_auth' || rawTypeName.toLowerCase().includes('travel')) {
    return 'MINISTRY OF EXTERNAL AFFAIRS TRAVEL AUTHORIZATION';
  }
  if ((docNum.startsWith('V') && docNum.length >= 7) || (docNum.startsWith('T') && docNum.length >= 8) || rawType === 'visa' || rawTypeName.toLowerCase().includes('visa')) {
    return 'REPUBLIC OF INDIA VISA (TOURIST STICKER)';
  }

  // 3. Fallback to rawTypeName if it is descriptive (not just "PASSPORT")
  if (rawTypeName && rawTypeName.length > 8 && rawTypeName.toUpperCase() !== 'PASSPORT') {
    return rawTypeName.toUpperCase();
  }

  if (rawType === 'passport' || /^[A-Z]\d{7}$/.test(docNum.replace(/\s+/g, ''))) {
    return 'INDIAN REPUBLIC PASSPORT (BIO-DATA PAGE)';
  }

  return (rawTypeName || rawType || 'GOVERNMENT IDENTITY DOCUMENT').toUpperCase();
}

interface ReportsViewProps {
  reportRecord: ScreeningRecord;
  onBack: () => void;
  onTriggerToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  reportRecord,
  onBack,
  onTriggerToast,
}) => {
  const [savedFirestoreReport, setSavedFirestoreReport] = useState<ScreeningReportRecord | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function persistReport() {
      try {
        const saved = await saveScreeningReport(reportRecord);
        if (isMounted) {
          setSavedFirestoreReport(saved);
        }
      } catch (err: any) {
        console.warn('Report persistence fallback:', err.message);
      }
    }
    persistReport();
    return () => {
      isMounted = false;
    };
  }, [reportRecord.caseId]);

  const handlePrint = () => {
    window.print();
    onTriggerToast('info', 'Print dialog opened for official security report.');
  };

  const handleDownload = async () => {
    const reportElement = document.getElementById('report-canvas');
    if (!reportElement) {
      onTriggerToast('error', 'Report element not found');
      return;
    }

    try {
      onTriggerToast('info', 'Generating PDF, please wait...');
      
      const imgData = await toPng(reportElement, { cacheBust: true, pixelRatio: 2 });
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4'
      });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Security_Report_${reportRecord.caseId}.pdf`);
      
      onTriggerToast('success', `Security Report [${reportRecord.caseId}.pdf] downloaded successfully.`);
    } catch (err) {
      console.error('PDF Generation Error:', err);
      onTriggerToast('error', 'Failed to generate PDF. Please try again.');
    }
  };

  const officialDocType = getOfficialDocumentTypeName(reportRecord);
  const assessment = reportRecord.riskAssessment;
  const refStatus = assessment?.signalsEvaluated?.referenceDatabaseStatus || (reportRecord.status === 'verified' ? 'DEMO REFERENCE MATCH' : 'NOT IN DATABASE');
  const matchScore = reportRecord.status === 'verified' ? '100%' : '0%';
  
  const faceVerif = reportRecord.faceVerificationResult;
  const faceStatus = faceVerif ? faceVerif.status.replace('_', ' ') : reportRecord.pipelineResults?.faceMatching === 'completed' ? 'PASSED' : 'UNKNOWN';
  const faceConf = faceVerif ? `${faceVerif.confidence}%` : (reportRecord.status === 'verified' ? '99.8%' : '0%');

  const tamperingDetected = reportRecord.pipelineResults?.tamperingDetection === 'warning' || reportRecord.pipelineResults?.tamperingDetection === 'failed' || reportRecord.findings.some(f => f.category === 'tampering');
  const tampStatus = tamperingDetected ? 'SUSPICIOUS INDICATORS DETECTED' : 'NO CLEAR TAMPERING INDICATORS';
  const tampConf = tamperingDetected ? '92%' : '99%';
  const tampInds = tamperingDetected ? reportRecord.findings.filter(f => f.category === 'tampering').map(f => f.title).join(', ') : 'None detected';

  const baseOcrFields = (reportRecord.comparisonData && reportRecord.comparisonData.length > 0)
    ? reportRecord.comparisonData.map(c => ({
        field: c.field.toUpperCase() === 'DOCUMENT TYPE' || c.field.toUpperCase() === 'DOC TYPE' ? 'DOCUMENT TYPE' : c.field,
        value: c.field.toUpperCase() === 'DOCUMENT TYPE' || c.field.toUpperCase() === 'DOC TYPE' ? officialDocType : c.documentData
      }))
    : [
        { field: 'FULL NAME', value: reportRecord.person.fullName || 'N/A' },
        { field: 'DOCUMENT TYPE', value: officialDocType },
        { field: 'DOCUMENT NUMBER', value: reportRecord.document.docNumber || 'N/A' },
        { field: 'DATE OF BIRTH', value: reportRecord.person.dob || 'N/A' },
        { field: 'GENDER', value: (reportRecord.person.gender || 'N/A').toUpperCase() },
        { field: 'NATIONALITY', value: (reportRecord.person.nationality || 'INDIAN').toUpperCase() },
      ];

  const hasDocTypeField = baseOcrFields.some(f => f.field.toUpperCase().includes('DOCUMENT TYPE') || f.field.toUpperCase() === 'DOC TYPE');
  const ocrFields = hasDocTypeField
    ? baseOcrFields
    : [{ field: 'DOCUMENT TYPE', value: officialDocType }, ...baseOcrFields];

  const matchedFields = reportRecord.comparisonData.filter(c => c.matches).map(c => c.field);
  const mismatchedFields = reportRecord.comparisonData.filter(c => !c.matches).map(c => c.field);

  const recommendation = reportRecord.status === 'verified' 
    ? 'CLEAR PASS — ADMISSION APPROVED' 
    : reportRecord.riskLevel === 'critical' 
      ? 'CRITICAL RISK / REJECT ADMISSION' 
      : 'HIGH RISK / MANUAL REVIEW';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs print:hidden">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to History
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Report
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Official Security Report Paper Canvas */}
      <div id="report-canvas" className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-300 shadow-lg text-slate-900 font-sans space-y-8">
        
        <div className="text-center border-b-2 border-slate-900 pb-6">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">AI-BASED DOCUMENT SCREENING SYSTEM</h1>
          <div className="mt-4 flex flex-col items-center text-sm font-mono space-y-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-left max-w-xl w-full bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex flex-col">
                <span className="text-slate-500 font-sans text-xs uppercase font-bold">Screening ID:</span>
                <span className="font-bold text-slate-900">{reportRecord.caseId}</span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-slate-500 font-sans text-xs uppercase font-bold">Date &amp; Time:</span>
                <span className="text-slate-900">{reportRecord.timestamp}</span>
              </div>

              <div className="flex flex-col sm:col-span-2">
                <span className="text-slate-500 font-sans text-xs uppercase font-bold">Document Type:</span>
                <span className="font-bold text-blue-900 tracking-wide">{officialDocType}</span>
              </div>

              <div className="flex flex-col">
                <span className="text-slate-500 font-sans text-xs uppercase font-bold">Document Number:</span>
                <span className="font-mono font-bold text-slate-900">{reportRecord.document.docNumber || 'N/A'}</span>
              </div>

              <div className="flex flex-col">
                <span className="text-slate-500 font-sans text-xs uppercase font-bold">Holder Name:</span>
                <span className="font-bold text-slate-900">{reportRecord.person?.fullName || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-black text-slate-800 uppercase border-b border-slate-200 pb-1">OCR INFORMATION</h2>
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <h3 className="text-xs font-bold text-slate-600 uppercase mb-2">Extracted Fields</h3>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              {ocrFields.map((f, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-[10px] uppercase text-slate-500 font-bold">{f.field}</span>
                  <span className="font-mono text-slate-900 font-semibold">{f.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-black text-slate-800 uppercase border-b border-slate-200 pb-1">REFERENCE DATABASE ANALYSIS</h2>
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-[10px] uppercase text-slate-500 font-bold">Reference Status</span>
                <span className="font-bold text-slate-900">{refStatus}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase text-slate-500 font-bold">Match Score</span>
                <span className="font-mono font-bold text-slate-900">{matchScore}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-[10px] uppercase text-slate-500 font-bold">Matched Fields</span>
                <ul className="text-slate-800 font-semibold">
                  {matchedFields.length > 0 ? matchedFields.map((f, i) => <li key={i} className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-600"/> {f}</li>) : <li>None</li>}
                </ul>
              </div>
              <div>
                <span className="block text-[10px] uppercase text-slate-500 font-bold">Mismatched Fields</span>
                <ul className="text-slate-800 font-semibold">
                  {mismatchedFields.length > 0 ? mismatchedFields.map((f, i) => <li key={i} className="flex items-center gap-1"><XCircle className="w-3 h-3 text-red-600"/> {f}</li>) : <li>None</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-black text-slate-800 uppercase border-b border-slate-200 pb-1">TAMPERING ANALYSIS</h2>
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-[10px] uppercase text-slate-500 font-bold">Status</span>
                <span className={`font-bold ${tamperingDetected ? 'text-red-700' : 'text-slate-900'}`}>{tampStatus}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase text-slate-500 font-bold">Confidence</span>
                <span className="font-mono font-bold text-slate-900">{tampConf}</span>
              </div>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-slate-500 font-bold">Indicators</span>
              <span className="text-slate-800 font-semibold">{tampInds}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-black text-slate-800 uppercase border-b border-slate-200 pb-1">FACE VERIFICATION</h2>
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-sm grid grid-cols-2 gap-4">
            <div>
              <span className="block text-[10px] uppercase text-slate-500 font-bold">Status</span>
              <span className="font-bold text-slate-900 uppercase">{faceStatus}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-slate-500 font-bold">Confidence</span>
              <span className="font-mono font-bold text-slate-900">{faceConf}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-black text-slate-800 uppercase border-b border-slate-200 pb-1">RISK ASSESSMENT</h2>
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-[10px] uppercase text-slate-500 font-bold">Risk Score</span>
                <span className="font-mono font-bold text-slate-900">{reportRecord.riskScore}/100</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase text-slate-500 font-bold">Risk Level</span>
                <span className="font-bold text-slate-900 uppercase">{reportRecord.riskLevel.replace('_', ' ')}</span>
              </div>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-slate-500 font-bold">Risk Factors</span>
              <ul className="list-disc pl-4 text-slate-800 font-semibold">
                {reportRecord.findings.length > 0 ? reportRecord.findings.map((f, i) => (
                  <li key={i}>{f.title}</li>
                )) : <li>None</li>}
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-black text-slate-800 uppercase border-b border-slate-200 pb-1">RECOMMENDATION</h2>
          <div className="bg-slate-100 rounded-lg p-4 border border-slate-300">
            <span className="font-black text-slate-900 text-base">{recommendation}</span>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t-2 border-slate-900">
          <div className="text-[10px] text-slate-500 font-bold text-center leading-relaxed max-w-2xl mx-auto uppercase">
            "This is an AI-assisted SIH prototype using a controlled demo reference database. It is not live government verification and does not replace official document verification or forensic examination."
          </div>
        </div>
      </div>
    </div>
  );
};

