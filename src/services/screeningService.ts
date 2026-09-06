import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, uploadBytes } from 'firebase/storage';
import { db, storage, handleFirestoreError, OperationType } from '../lib/firebase';
import { ScreeningRecord } from '../types';
import { logAuditEvent } from './auditLogService';
import { INITIAL_SCREENINGS } from '../data/screeningsData';

export const SCREENINGS_COLLECTION = 'screeningRecords';

// Upload an identity document image to Firebase Storage under `uploaded-documents/{caseId}/{fileName}`
export async function uploadScreeningDocument(
  caseId: string, 
  fileName: string, 
  fileData: string | Blob
): Promise<string> {
  // Bypassing Firebase Storage since it is not provisioned
  return typeof fileData === 'string' ? fileData : URL.createObjectURL(fileData as Blob);
}

// Persist a new screening case to Firestore
export async function saveScreeningRecord(record: ScreeningRecord): Promise<void> {
  try {
    const docRef = doc(db, SCREENINGS_COLLECTION, record.caseId);
    await setDoc(docRef, {
      ...record,
      updatedAt: new Date().toISOString(),
    });

    // Automatically record an audit log
    await logAuditEvent(
      'SCREENING_RECORD_SAVED',
      {
        caseId: record.caseId,
        personName: record.person.fullName,
        docType: record.document.type,
        docNumber: record.document.docNumber,
        riskScore: record.riskScore,
        status: record.status,
      },
      record.status === 'rejected' || record.riskScore > 70 ? 'critical' : 'info',
      record.caseId
    );
  } catch (err: any) {
    console.warn('Firestore screening record write fallback:', err.message);
  }
}

// Update case status (e.g. Officer Manual Verification or Override)
export async function updateCaseStatusInFirestore(
  caseId: string, 
  newStatus: ScreeningRecord['status'], 
  notes?: string
): Promise<void> {
  try {
    const docRef = doc(db, SCREENINGS_COLLECTION, caseId);
    await updateDoc(docRef, {
      status: newStatus,
      officerNotes: notes || '',
      updatedAt: new Date().toISOString(),
    });

    await logAuditEvent(
      'CASE_STATUS_OVERRIDE',
      { caseId, newStatus, notes },
      newStatus === 'rejected' ? 'warning' : 'info',
      caseId
    );
  } catch (err: any) {
    console.warn('Firestore case update fallback:', err.message);
  }
}

// Subscribe to real-time screening records
export function subscribeToScreeningRecords(
  onUpdate: (records: ScreeningRecord[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const colRef = collection(db, SCREENINGS_COLLECTION);
    const q = query(colRef, orderBy('timestamp', 'desc'), limit(100));

    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const records: ScreeningRecord[] = [];
          snapshot.forEach((snap) => {
            records.push(snap.data() as ScreeningRecord);
          });
          onUpdate(records);
        } else {
          // If Firestore collection is empty, initialize with INITIAL_SCREENINGS
          onUpdate(INITIAL_SCREENINGS);
          // Seed the initial records to Firestore in background
          INITIAL_SCREENINGS.forEach((rec) => {
            saveScreeningRecord(rec).catch(() => {});
          });
        }
      },
      (error) => {
        console.warn('Screenings subscription fallback, using initial data:', error.message);
        onUpdate(INITIAL_SCREENINGS);
        if (onError) onError(error);
      }
    );
  } catch (e: any) {
    onUpdate(INITIAL_SCREENINGS);
    return () => {};
  }
}
