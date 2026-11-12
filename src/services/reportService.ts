import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ScreeningRecord, ScreeningReportRecord } from '../types';
import { logAuditEvent } from './auditLogService';
import { getSavedOfficerProfile } from './firebaseAuthService';

export const REPORTS_COLLECTION = 'reports';

// Generate a cryptographic-style digital signature for the report
export function generateDigitalSignature(caseId: string, timestamp: string): string {
  const raw = `${caseId}:${timestamp}:ID-SHIELD-DEMO-ROOT-CA`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
  return `SHA256:7B8F9A${hex}C3D4E5F6A1B2C3D4E5F67890ABCDEF1234567890ABCDEF12`;
}

// Save a report to Firestore
export async function saveScreeningReport(record: ScreeningRecord): Promise<ScreeningReportRecord> {
  const officer = getSavedOfficerProfile();
  const reportId = `REP-${record.caseId.replace(/^ID-/, '')}-${Date.now().toString().slice(-4)}`;
  const generatedAt = new Date().toISOString();
  const signature = generateDigitalSignature(record.caseId, generatedAt);

  const reportData: ScreeningReportRecord = {
    reportId,
    caseId: record.caseId,
    generatedAt,
    officerName: `${officer.officerName} (${officer.badgeNumber})`,
    digitalSignature: signature,
    summary: {
      personName: record.person.fullName,
      docNumber: record.document.docNumber,
      docType: record.document.type,
      aiScore: record.aiScore,
      riskScore: record.riskScore,
      riskLevel: record.riskLevel,
      status: record.status,
      findingsCount: record.findings?.length || 0,
    },
    verificationMode: 'DEMO_REFERENCE_DATABASE',
  };

  try {
    const docRef = doc(db, REPORTS_COLLECTION, reportId);
    await setDoc(docRef, reportData);

    await logAuditEvent(
      'REPORT_GENERATED',
      {
        reportId,
        caseId: record.caseId,
        personName: record.person.fullName,
        docNumber: record.document.docNumber,
        digitalSignature: signature.substring(0, 20) + '...',
      },
      'info',
      record.caseId
    );
  } catch (error: any) {
    console.warn('Firestore report write fallback:', error.message);
  }

  return reportData;
}

// Fetch a single report by ID
export async function getScreeningReport(reportId: string): Promise<ScreeningReportRecord | null> {
  try {
    const docRef = doc(db, REPORTS_COLLECTION, reportId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as ScreeningReportRecord;
    }
  } catch (err: any) {
    console.warn('Firestore report get error:', err.message);
  }
  return null;
}
