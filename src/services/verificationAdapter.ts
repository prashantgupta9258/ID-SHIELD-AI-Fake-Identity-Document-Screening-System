import { 
  collection, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { FirestoreReferenceDocument, VerificationMatchResult, CanonicalDocumentType } from '../types';
import { REFERENCE_COLLECTION_NAME } from './referenceDocumentService';
import { DEMO_RAW_DOCUMENTS } from '../data/demoReferenceAssets';
import { 
  executeDemoCrossCheck, 
  CROSS_CHECK_COMPLIANCE 
} from './crossCheckEngine';

export interface VerificationQuery {
  docNumber: string;
  docType: string;
  fullName: string;
  dob?: string;
  countryOfIssue?: string;
  base64Image?: string;
  fileName?: string;
}

export interface IVerificationAdapter {
  readonly adapterName: string;
  readonly sourceType: 'DEMO_REFERENCE_DATABASE' | 'AUTHORIZED_GOVERNMENT_API';
  readonly isGovernmentAuthorized: boolean;
  matchDocument(query: VerificationQuery): Promise<VerificationMatchResult>;
}

/**
 * DemoReferenceDatabaseAdapter (Active SIH Prototype Engine)
 * 
 * Cross-references identity queries against the canonical Firebase Firestore
 * `referenceDocuments` collection and the built-in reference dataset.
 * 
 * Strict Compliance:
 * - Does NOT make unauthorized calls to government portals or bypass auth.
 * - Explicitly brands all matches as "Demo Reference Match".
 * - Never claims "Government Verified" or "Official Government Database".
 */
export class DemoReferenceDatabaseAdapter implements IVerificationAdapter {
  readonly adapterName = 'SIH Demo Reference Database Engine';
  readonly sourceType = 'DEMO_REFERENCE_DATABASE' as const;
  readonly isGovernmentAuthorized = false;

  async matchDocument(q: VerificationQuery): Promise<VerificationMatchResult> {
    const cleanDocNum = (q.docNumber || '').trim().toUpperCase();
    const cleanName = (q.fullName || '').trim().toUpperCase();

    // Map docType string to CanonicalDocumentType
    let canonicalType: CanonicalDocumentType = 'PASSPORT';
    const rawType = (q.docType || '').toUpperCase();
    if (rawType.includes('VISA')) canonicalType = 'VISA';
    else if (rawType.includes('AADHAAR') || rawType.includes('NATIONAL')) canonicalType = 'NATIONAL_ID';
    else if (rawType.includes('DRIV') || rawType.includes('LICEN')) canonicalType = 'DRIVING_LICENSE';
    else if (rawType.includes('PERMIT')) canonicalType = 'PERMIT';
    else if (rawType.includes('TRAVEL') || rawType.includes('ETA')) canonicalType = 'TRAVEL_AUTHORIZATION';

    const manualFieldsOverride: Record<string, string> = {};
    if (cleanDocNum) {
      manualFieldsOverride.passportNumber = cleanDocNum;
      manualFieldsOverride.visaNumber = cleanDocNum;
      manualFieldsOverride.identityNumber = cleanDocNum;
      manualFieldsOverride.licenseNumber = cleanDocNum;
      manualFieldsOverride.permitNumber = cleanDocNum;
      manualFieldsOverride.documentNumber = cleanDocNum;
      manualFieldsOverride.docNumber = cleanDocNum;
    }
    if (cleanName) {
      manualFieldsOverride.fullName = cleanName;
      manualFieldsOverride.name = cleanName;
      manualFieldsOverride.applicantName = cleanName;
    }
    if (q.dob) manualFieldsOverride.dateOfBirth = q.dob;
    if (q.countryOfIssue) manualFieldsOverride.countryOfIssue = q.countryOfIssue;

    // Execute through the cross-check engine
    const pipelineResult = await executeDemoCrossCheck({
      forceDocumentType: canonicalType,
      documentImageBase64: q.base64Image,
      documentFileName: q.fileName,
      manualFieldsOverride,
    });

    const isMatch = pipelineResult.matchState === 'REFERENCE_MATCH';
    const isPartial = pipelineResult.matchState === 'PARTIAL_REFERENCE_MATCH';

    return {
      matched: isMatch,
      matchType: isMatch 
        ? 'REFERENCE_DATABASE_MATCH' 
        : isPartial 
          ? 'SUSPICIOUS_DISCREPANCY' 
          : 'NO_MATCH_FOUND',
      confidence: pipelineResult.matchScore,
      referenceRecord: pipelineResult.matchedReferenceRecord || undefined,
      sourceType: 'DEMO_REFERENCE_DATABASE',
      disclaimer: CROSS_CHECK_COMPLIANCE.disclaimer,
      pipelineResult,
      matchingFields: pipelineResult.fieldResults.map(f => ({
        field: f.fieldLabel,
        documentData: f.uploadedValue || 'Not Provided',
        referenceData: f.referenceValue || 'N/A',
        matches: f.matched,
        confidence: f.confidence,
      })),
    };
  }
}

/**
 * FutureGovernmentApiAdapter (Extensible Blueprint Interface)
 * 
 * Template for future authorized deployment:
 * Connects to official government gateways (e.g. DigiLocker, Passport Seva API, Sarathi)
 * when official API keys, TLS certificates, and statutory authorization are provisioned.
 */
export class FutureGovernmentApiAdapter implements IVerificationAdapter {
  readonly adapterName = 'Government API Gateway Adapter (Future Plug-in)';
  readonly sourceType = 'AUTHORIZED_GOVERNMENT_API' as const;
  readonly isGovernmentAuthorized = true;

  constructor(
    private readonly config?: {
      apiGatewayUrl?: string;
      clientId?: string;
      mTLSCertificate?: string;
    }
  ) {}

  async matchDocument(query: VerificationQuery): Promise<VerificationMatchResult> {
    // This adapter is deliberately inactive in the SIH prototype to ensure zero unauthorized scraping or bypass
    return {
      matched: false,
      matchType: 'NO_MATCH_FOUND',
      confidence: 0,
      sourceType: 'AUTHORIZED_GOVERNMENT_API',
      disclaimer: 'Future government gateway adapter awaiting statutory endpoint provisioning and credentials.',
      matchingFields: [],
    };
  }
}

// Active singleton instance for application use
export const activeVerificationAdapter: IVerificationAdapter = new DemoReferenceDatabaseAdapter();
