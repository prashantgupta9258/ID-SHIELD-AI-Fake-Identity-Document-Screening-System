import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { AuditLog } from '../types';
import { getSavedOfficerProfile } from './firebaseAuthService';

export const AUDIT_COLLECTION = 'auditLogs';

// In-memory fallback logs for offline demo resilience
let localAuditLogs: AuditLog[] = [
  {
    logId: 'AUDIT-INIT-001',
    action: 'SYSTEM_BOOT',
    officer: 'System Supervisor (AUTO)',
    timestamp: new Date().toISOString(),
    details: { event: 'ID-SHIELD AI Screening Core Initialized', targetProject: 'shi-project-49e55' },
    severity: 'info',
  },
  {
    logId: 'AUDIT-INIT-002',
    action: 'DATABASE_SYNC',
    officer: 'Officer V. Sharma',
    timestamp: new Date().toISOString(),
    details: { event: 'Connected to Firestore & Demo Reference Database' },
    severity: 'info',
  },
];

// Record an audit log event
export async function logAuditEvent(
  action: string,
  details: Record<string, any>,
  severity: 'info' | 'warning' | 'critical' = 'info',
  caseId?: string
): Promise<AuditLog> {
  const officer = getSavedOfficerProfile();
  const logId = `AUDIT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

  const logRecord: AuditLog = {
    logId,
    action,
    officer: `${officer.officerName} (${officer.badgeNumber})`,
    timestamp: new Date().toISOString(),
    details,
    severity,
    caseId,
  };

  localAuditLogs = [logRecord, ...localAuditLogs];

  try {
    const docRef = doc(db, AUDIT_COLLECTION, logId);
    await setDoc(docRef, logRecord);
  } catch (error: any) {
    console.warn('Firestore audit log write fallback:', error.message);
  }

  return logRecord;
}

// Subscribe to real-time audit logs
export function subscribeToAuditLogs(
  onUpdate: (logs: AuditLog[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const colRef = collection(db, AUDIT_COLLECTION);
    const q = query(colRef, orderBy('timestamp', 'desc'), limit(50));

    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const logs: AuditLog[] = [];
          snapshot.forEach((snap) => {
            logs.push(snap.data() as AuditLog);
          });
          onUpdate(logs);
        } else {
          onUpdate(localAuditLogs);
        }
      },
      (error) => {
        console.warn('Audit logs subscription error, using local buffer:', error.message);
        onUpdate(localAuditLogs);
        if (onError) onError(error);
      }
    );
  } catch (e: any) {
    onUpdate(localAuditLogs);
    return () => {};
  }
}
