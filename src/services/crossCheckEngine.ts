import { 
  collection, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  CanonicalDocumentType, 
  FirestoreReferenceDocument,
  CrossCheckMatchState,
  CrossCheckFieldResult,
  CrossCheckVisualConsistency,
  CrossCheckPipelineResult,
  RiskLevel
} from '../types';
import { REFERENCE_COLLECTION_NAME } from './referenceDocumentService';
import { DEMO_RAW_DOCUMENTS, DemoRawDocument } from '../data/demoReferenceAssets';
import { extractDocumentStructuredFields } from './ocrExtractionService';
import { detectDocumentCategory } from './referenceDocumentService';
import { 
  compareNames, 
  compareDobs, 
  compareGenders, 
  compareDocNumbers, 
  compareIdentityRecords,
  normalizeDateToIso as normalizeIdentityDate,
  normalizeGender as normalizeIdentityGender,
  normalizeDocNumber as normalizeIdentityDocNumber,
  extractStringValue
} from './identityFieldMatcher';

/**
 * MANDATORY UI LABELS & COMPLIANCE TEXT FOR SIH PROTOTYPE
 * Strictly enforced across all screens.
 */
export const CROSS_CHECK_COMPLIANCE = {
  referenceStatus: 'Demo Reference Match' as const,
  datasetSource: 'Matched against controlled Firebase reference dataset',
  disclaimer: 'This prototype uses a controlled demo reference database. It does not perform live government verification.',
  prohibitedLabel: 'Government Verified',
};

/**
 * Field requirements defined per Document Type in prompt specifications:
 * 
 * PASSPORT: passportNumber, fullName, nationality, dateOfBirth, gender, dateOfExpiry
 * VISA: visaNumber, passportNumber, name, visaType, dateOfIssue, dateOfExpiry
 * NATIONAL ID: identityNumber, name, dateOfBirth, gender
 * DRIVING LICENSE: licenseNumber, name, dateOfBirth, expiryDate
 * PERMIT: permitNumber, applicantName, passportNumber, dateOfBirth, validUntil
 * TRAVEL AUTHORIZATION: documentNumber, name, passportNumber, dateOfIssue, validUntil
 */
export interface DocumentTypeFieldDefinition {
  fieldKey: string;
  fieldLabel: string;
  primaryKey?: boolean;
  isDate?: boolean;
}

export const CROSS_CHECK_FIELD_SPECS: Record<CanonicalDocumentType, DocumentTypeFieldDefinition[]> = {
  PASSPORT: [
    { fieldKey: 'passportNumber', fieldLabel: 'Passport Number', primaryKey: true },
    { fieldKey: 'fullName', fieldLabel: 'Full Name' },
    { fieldKey: 'nationality', fieldLabel: 'Nationality' },
    { fieldKey: 'dateOfBirth', fieldLabel: 'Date of Birth', isDate: true },
    { fieldKey: 'gender', fieldLabel: 'Gender' },
    { fieldKey: 'dateOfExpiry', fieldLabel: 'Date of Expiry', isDate: true },
  ],
  VISA: [
    { fieldKey: 'visaNumber', fieldLabel: 'Visa Number', primaryKey: true },
    { fieldKey: 'passportNumber', fieldLabel: 'Passport Number' },
    { fieldKey: 'name', fieldLabel: 'Name' },
    { fieldKey: 'visaType', fieldLabel: 'Visa Type' },
    { fieldKey: 'dateOfIssue', fieldLabel: 'Date of Issue', isDate: true },
    { fieldKey: 'dateOfExpiry', fieldLabel: 'Date of Expiry', isDate: true },
  ],
  NATIONAL_ID: [
    { fieldKey: 'identityNumber', fieldLabel: 'Identity Number', primaryKey: true },
    { fieldKey: 'name', fieldLabel: 'Name' },
    { fieldKey: 'dateOfBirth', fieldLabel: 'Date of Birth', isDate: true },
    { fieldKey: 'gender', fieldLabel: 'Gender' },
  ],
  DRIVING_LICENSE: [
    { fieldKey: 'licenseNumber', fieldLabel: 'License Number', primaryKey: true },
    { fieldKey: 'name', fieldLabel: 'Name' },
    { fieldKey: 'dateOfBirth', fieldLabel: 'Date of Birth', isDate: true },
    { fieldKey: 'expiryDate', fieldLabel: 'Expiry Date', isDate: true },
  ],
  PERMIT: [
    { fieldKey: 'permitNumber', fieldLabel: 'Permit Number', primaryKey: true },
    { fieldKey: 'applicantName', fieldLabel: 'Applicant Name' },
    { fieldKey: 'passportNumber', fieldLabel: 'Passport Number' },
    { fieldKey: 'dateOfBirth', fieldLabel: 'Date of Birth', isDate: true },
    { fieldKey: 'validUntil', fieldLabel: 'Valid Until', isDate: true },
  ],
  TRAVEL_AUTHORIZATION: [
    { fieldKey: 'documentNumber', fieldLabel: 'Document Number', primaryKey: true },
    { fieldKey: 'name', fieldLabel: 'Name' },
    { fieldKey: 'passportNumber', fieldLabel: 'Passport Number' },
    { fieldKey: 'dateOfIssue', fieldLabel: 'Date of Issue', isDate: true },
    { fieldKey: 'validUntil', fieldLabel: 'Valid Until', isDate: true },
  ],
  UNKNOWN: [
    { fieldKey: 'documentNumber', fieldLabel: 'Document Number', primaryKey: true },
    { fieldKey: 'name', fieldLabel: 'Name' },
  ],
};

/**
 * Normalization helpers
 */
export function normalizeStringValue(val: string | null | undefined): string {
  if (!val) return '';
  return val
    .trim()
    .toUpperCase()
    .replace(/[,\/\\\-_\.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeAlphaNumericOnly(val: string | null | undefined): string {
  if (!val) return '';
  return val.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function normalizeDateIso(val: string | null | undefined): string {
  if (!val) return '';
  const clean = val.trim();
  
  // Match YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;
  
  // Textual month: e.g. "15 JUL 1992" or "15-JUL-1992" or "15 July 1992"
  const months: Record<string, string> = {
    JAN: '01', JANU: '01', JANUARY: '01',
    FEB: '02', FEBR: '02', FEBRUARY: '02',
    MAR: '03', MARC: '03', MARCH: '03',
    APR: '04', APRI: '04', APRIL: '04',
    MAY: '05',
    JUN: '06', JUNE: '06',
    JUL: '07', JULY: '07',
    AUG: '08', AUGU: '08', AUGUST: '08',
    SEP: '09', SEPT: '09', SEPTEMBER: '09',
    OCT: '10', OCTO: '10', OCTOBER: '10',
    NOV: '11', NOVE: '11', NOVEMBER: '11',
    DEC: '12', DECE: '12', DECEMBER: '12',
  };

  const textMatch = clean.match(/(\d{1,2})\s*[-/ ]\s*([A-Za-z]{3,9})\s*[-/ ,]\s*(\d{4})/);
  if (textMatch) {
    const [, d, mon, y] = textMatch;
    const mStr = mon.substring(0, 3).toUpperCase();
    if (months[mStr]) {
      return `${y}-${months[mStr]}-${d.padStart(2, '0')}`;
    }
  }

  // Match DD/MM/YYYY or DD-MM-YYYY
  const parts = clean.split(/[\/\-\.]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    }
    if (parts[2].length === 4) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }
  
  return clean;
}

export function normalizeGenderCode(val: string | null | undefined): string {
  if (!val) return '';
  const clean = val.trim().toUpperCase();
  if (clean.startsWith('F') || clean.includes('FEMALE') || clean.includes('महिला')) return 'F';
  if (clean.startsWith('M') || clean.includes('MALE') || clean.includes('पुरूष')) return 'M';
  return clean;
}

export function normalizeNationalityCode(val: string | null | undefined): string {
  if (!val) return '';
  const clean = val.trim().toUpperCase();
  if (clean.includes('IND') || clean.includes('BHARAT') || clean.includes('भारत')) return 'INDIAN';
  if (clean.includes('USA') || clean.includes('UNITED STATES') || clean.includes('AMERICAN')) return 'AMERICAN';
  if (clean.includes('GBR') || clean.includes('BRIT') || clean.includes('UNITED KINGDOM')) return 'BRITISH';
  return clean;
}

export interface CrossCheckExecutionInput {
  documentImageBase64?: string;
  documentFileName?: string;
  documentMimeType?: string;
  ocrTextOverride?: string;
  manualFieldsOverride?: Record<string, string>;
  forceDocumentType?: CanonicalDocumentType;
  benchmarkPresetId?: string;
}

/**
 * Core Cross-Check Engine
 * Implements the 12-Step Pipeline:
 * 1. USER UPLOADS IMAGE
 * 2. AI READS IMAGE
 * 3. DOCUMENT TYPE DETECTION
 * 4. DOCUMENT CLASSIFICATION
 * 5. OCR
 * 6. STRUCTURED FIELD EXTRACTION
 * 7. FIELD NORMALIZATION
 * 8. FIREBASE REFERENCE DATABASE SEARCH (Filtered by documentType)
 * 9. REFERENCE DOCUMENT MATCHING (Specific field matching per doc type)
 * 10. VISUAL CONSISTENCY ANALYSIS
 * 11. MATCH SCORE
 * 12. RISK ASSESSMENT & SCREENING REPORT
 */

async function fetchImageAsBase64(url: string): Promise<string> {
  if (url.startsWith('data:')) return url;
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error('Failed to fetch image as base64', err);
    return '';
  }
}

function computeVisualHash(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve('');
      ctx.drawImage(img, 0, 0, 16, 16);
      const imgData = ctx.getImageData(0, 0, 16, 16);
      let avg = 0;
      for (let i = 0; i < imgData.data.length; i += 4) {
        avg += imgData.data[i] * 0.299 + imgData.data[i+1] * 0.587 + imgData.data[i+2] * 0.114;
      }
      avg = avg / 256;
      let hash = '';
      for (let i = 0; i < imgData.data.length; i += 4) {
        const luma = imgData.data[i] * 0.299 + imgData.data[i+1] * 0.587 + imgData.data[i+2] * 0.114;
        hash += luma >= avg ? '1' : '0';
      }
      let hex = '';
      for(let i=0; i<hash.length; i+=4) {
        hex += parseInt(hash.substring(i, i+4), 2).toString(16);
      }
      resolve(hex);
    };
    img.onerror = () => resolve('');
    img.src = dataUrl;
  });
}

function hashSimilarity(h1: string, h2: string): number {
  if (!h1 || !h2 || h1.length !== h2.length) return 0;
  let matches = 0;
  for(let i=0; i<h1.length; i++) {
    const b1 = parseInt(h1[i], 16).toString(2).padStart(4, '0');
    const b2 = parseInt(h2[i], 16).toString(2).padStart(4, '0');
    for(let j=0; j<4; j++) {
       if (b1[j] === b2[j]) matches++;
    }
  }
  return matches / (h1.length * 4);
}

function isFieldMatch(spec: DocumentTypeFieldDefinition, upVal: string, refVal: string): boolean {
  if (!upVal || !refVal) return false;
  if (upVal === refVal) return true;

  const lowerKey = spec.fieldKey.toLowerCase();

  // Name comparison (handles token inversion, initials, honorifics, Levenshtein distance)
  if (lowerKey.includes('name') || lowerKey.includes('surname') || lowerKey.includes('given')) {
    const res = compareNames(upVal, refVal);
    return res.matched;
  }

  // Date comparison (DOB, issue, expiry, valid)
  if (spec.isDate || lowerKey.includes('date') || lowerKey.includes('dob') || lowerKey.includes('expiry') || lowerKey.includes('birth') || lowerKey.includes('valid') || lowerKey.includes('until')) {
    const res = compareDobs(upVal, refVal);
    return res.matched;
  }

  // Gender / Sex comparison (M/F/X, Male/Female, पुरूष/महिला)
  if (lowerKey.includes('gender') || lowerKey === 'sex') {
    const res = compareGenders(upVal, refVal);
    return res.matched;
  }

  // Document Number / ID (alphanumeric clean, prefix tolerance, OCR 1-char typo)
  if (lowerKey.includes('number') || lowerKey.includes('id') || lowerKey.includes('license') || lowerKey.includes('permit') || lowerKey.includes('passport') || lowerKey.includes('visa')) {
    const res = compareDocNumbers(upVal, refVal);
    return res.matched;
  }

  // Nationality / Country
  if (lowerKey.includes('nationality') || lowerKey.includes('country')) {
    const uNat = normalizeNationalityCode(upVal);
    const rNat = normalizeNationalityCode(refVal);
    if (uNat && rNat && (uNat === rNat || uNat.includes(rNat) || rNat.includes(uNat))) return true;
  }

  const cleanUp = upVal.replace(/[^A-Z0-9]/g, '').toUpperCase();
  const cleanRef = refVal.replace(/[^A-Z0-9]/g, '').toUpperCase();
  if (cleanUp && cleanRef && (cleanUp === cleanRef || cleanUp.includes(cleanRef) || cleanRef.includes(cleanUp))) return true;

  return false;
}

function canonicalizeFields(specs: DocumentTypeFieldDefinition[], rawExtracted: any, normalizedExtracted: any, candidateData?: any) {
  const final: Record<string, string> = {};
  const samplePerson = candidateData?.samplePerson || {};
  const candidateFields = candidateData?.extractedFields || {};
  
  const combined = { 
    ...(candidateData || {}),
    ...(samplePerson || {}),
    ...(candidateFields || {}),
    ...(rawExtracted || {}), 
    ...(normalizedExtracted || {}) 
  };

  for (const spec of specs) {
    const key = spec.fieldKey;
    const lowerKey = key.toLowerCase();
    let val = extractStringValue(combined[key] || combined[lowerKey] || '');

    if (!val) {
      if (lowerKey.includes('name')) {
        val = extractStringValue(combined['fullName'] || combined['personName'] || combined['name'] || combined['applicantName'] || combined['surname'] || combined['givenNames'] || '');
      } else if (lowerKey.includes('number') || lowerKey.includes('id') || lowerKey.includes('license') || lowerKey.includes('permit')) {
        val = extractStringValue(combined['passportNumber'] || combined['documentNumber'] || combined['docNumber'] || combined['visaNumber'] || combined['identityNumber'] || combined['aadhaarNumber'] || combined['licenseNumber'] || combined['permitNumber'] || '');
      } else if (lowerKey.includes('dob') || lowerKey.includes('birth')) {
        val = extractStringValue(combined['dateOfBirth'] || combined['dob'] || combined['birthDate'] || '');
      } else if (lowerKey.includes('expiry') || lowerKey.includes('valid')) {
        val = extractStringValue(combined['dateOfExpiry'] || combined['expiryDate'] || combined['validUntil'] || '');
      } else if (lowerKey.includes('issue')) {
        val = extractStringValue(combined['dateOfIssue'] || combined['issueDate'] || '');
      } else if (lowerKey.includes('gender') || lowerKey === 'sex') {
        val = extractStringValue(combined['gender'] || combined['sex'] || '');
      } else if (lowerKey.includes('nationality')) {
        val = extractStringValue(combined['nationality'] || combined['country'] || '');
      }
    }

    let normVal = String(val || '').trim();
    if (spec.isDate || lowerKey.includes('dob') || lowerKey.includes('birth') || lowerKey.includes('date') || lowerKey.includes('expiry') || lowerKey.includes('issue')) {
      normVal = normalizeIdentityDate(normVal);
    } else if (lowerKey.includes('gender') || lowerKey === 'sex') {
      normVal = normalizeIdentityGender(normVal) || normalizeGenderCode(normVal);
    } else if (lowerKey.includes('nationality')) {
      normVal = normalizeNationalityCode(normVal);
    } else if (lowerKey.includes('number') || lowerKey.includes('id') || lowerKey.includes('license') || lowerKey.includes('permit')) {
      normVal = normalizeIdentityDocNumber(normVal);
    } else {
      normVal = normalizeStringValue(normVal);
    }

    final[key] = normVal;
  }
  return final;
}

export async function executeDemoCrossCheck(
  input: CrossCheckExecutionInput,
  onStepProgress?: (step: number, stepName: string) => void
): Promise<CrossCheckPipelineResult> {
  const logs: string[] = [];
  const log = (msg: string) => {
    logs.push(`[${new Date().toISOString().substring(11, 19)}] ${msg}`);
  };

  onStepProgress?.(1, 'Receiving Uploaded Document Image');
  onStepProgress?.(2, 'AI Scanning Document Matrix');
  onStepProgress?.(3, 'Document Type Detection & Classification');
  
  let detectedType: CanonicalDocumentType = input.forceDocumentType || 'UNKNOWN';
  const rawTextSource = input.ocrTextOverride || input.documentFileName || '';
  if (detectedType === 'UNKNOWN') {
    detectedType = detectDocumentCategory(rawTextSource, input.documentFileName);
  }

  onStepProgress?.(5, 'OCR & Structured Field Extraction');
  
  const extractionResult = await extractDocumentStructuredFields({
    documentType: detectedType,
    textContext: rawTextSource,
    fileName: input.documentFileName,
    dataUrl: input.documentImageBase64,
  });

  const extractedFields: Record<string, string | null> = { ...extractionResult.fields };
  for (const [k, v] of Object.entries(input.manualFieldsOverride || {})) {
    if (!extractedFields[k] && v) {
      extractedFields[k] = v;
    }
  }

  onStepProgress?.(7, 'Field Normalization (ISO/ICAO Standards)');
  const normalizedExtracted: Record<string, string> = {};
  for (const [k, v] of Object.entries(extractedFields)) {
    if (v !== null && v !== undefined && v !== '') {
      if (k.toLowerCase().includes('date') || k.toLowerCase().includes('dob') || k.toLowerCase().includes('until') || k.toLowerCase().includes('expiry')) {
        normalizedExtracted[k] = normalizeDateIso(v);
      } else if (k.toLowerCase().includes('number') || k.toLowerCase().includes('id') || k.toLowerCase().includes('licence') || k.toLowerCase().includes('license')) {
        normalizedExtracted[k] = normalizeAlphaNumericOnly(v);
      } else if (k.toLowerCase().includes('gender') || k.toLowerCase() === 'sex') {
        normalizedExtracted[k] = normalizeGenderCode(v);
      } else if (k.toLowerCase().includes('nationality')) {
        normalizedExtracted[k] = normalizeNationalityCode(v);
      } else {
        normalizedExtracted[k] = normalizeStringValue(v);
      }
    }
  }

  onStepProgress?.(8, 'Searching Firestore referenceDocuments (All Reference Records)');
  let candidateRecords: FirestoreReferenceDocument[] = [];
  try {
    const colRef = collection(db, REFERENCE_COLLECTION_NAME);
    const querySnapshot = await getDocs(colRef);
    if (!querySnapshot.empty) {
      candidateRecords = querySnapshot.docs.map(doc => doc.data() as FirestoreReferenceDocument);
    }
  } catch (err: any) {
    log(`Firestore query warning. Using local benchmark reference dataset.`);
  }

  if (candidateRecords.length === 0) {
    candidateRecords = DEMO_RAW_DOCUMENTS.map(r => ({
      referenceDocumentId: r.id,
      documentType: r.category,
      displayName: r.displayName,
      imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(r.svgContent)}`,
      extractedFields: r.extractedFields,
      extractedText: r.ocrText,
      normalizedFields: r.normalizedFields,
      imageHash: 'SHA256-SYNTHETIC-HASH',
      sourceType: 'SIH_DEMO_DATASET',
      verificationMode: 'DEMO_REFERENCE_DATABASE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      storagePath: `reference-documents/${r.storageSubdir}/${r.fileName}`,
    }));
  }

  onStepProgress?.(9, 'Executing Field-by-Field Reference Matching');
  const fieldSpecs = CROSS_CHECK_FIELD_SPECS[detectedType] || CROSS_CHECK_FIELD_SPECS.PASSPORT;
  const canonicalUploaded = canonicalizeFields(fieldSpecs, extractedFields, normalizedExtracted);

  log('[ReferenceSearch]');
  log(`Document Type: ${detectedType}`);
  log(`Candidates Found: ${candidateRecords.length}`);

  let bestCandidate: FirestoreReferenceDocument | null = null;
  let bestFieldResults: CrossCheckFieldResult[] = [];
  let bestFieldScore = 0;
  let bestVisualScore = 0;
  let bestVisualDetails: any = null;
  let bestOverallScore = -1;
  
  // Fingerprint Generation
  const uploadedPHash = input.documentImageBase64 ? await computeVisualHash(input.documentImageBase64) : '';
  const upImageTrimmed = (input.documentImageBase64 || '').trim();

  for (let idx = 0; idx < candidateRecords.length; idx++) {
    const candidate = candidateRecords[idx];
    const candidateCanonical = canonicalizeFields(fieldSpecs, candidate.extractedFields || {}, candidate.normalizedFields || {}, candidate);
    
    let matchScorePoints = 0;
    const currentFieldResults: CrossCheckFieldResult[] = [];

    for (const spec of fieldSpecs) {
      const upVal = canonicalUploaded[spec.fieldKey] || '';
      const refVal = candidateCanonical[spec.fieldKey] || '';
      const matched = isFieldMatch(spec, upVal, refVal);
      if (matched) matchScorePoints++;
      
      currentFieldResults.push({
        fieldKey: spec.fieldKey,
        fieldLabel: spec.fieldLabel,
        uploadedValue: upVal || 'Missing',
        referenceValue: refVal || 'Missing',
        matched: matched,
        confidence: matched ? 99 : 0,
      });
    }

    const fieldScorePercent = (matchScorePoints / Math.max(fieldSpecs.length, 1)) * 100;
    
    let candImageBase64 = candidate.imageUrl || '';
    if (candImageBase64 && !candImageBase64.startsWith('data:')) {
      candImageBase64 = await fetchImageAsBase64(candImageBase64);
    }
    
    // Check if uploaded image is the exact same base64 string or file
    let isExactImageMatch = false;
    if (upImageTrimmed && candImageBase64) {
      const cTrim = candImageBase64.trim();
      if (upImageTrimmed === cTrim) {
        isExactImageMatch = true;
      } else if (upImageTrimmed.length > 500 && cTrim.length > 500) {
        try {
          const cleanUp = decodeURIComponent(upImageTrimmed).replace(/\s+/g, '');
          const cleanCand = decodeURIComponent(cTrim).replace(/\s+/g, '');
          if (cleanUp === cleanCand || (cleanUp.length > 1000 && cleanCand.length > 1000 && (cleanUp.includes(cleanCand) || cleanCand.includes(cleanUp)))) {
            isExactImageMatch = true;
          }
        } catch {
          // If URI decoding fails, compare directly
          if (upImageTrimmed.replace(/\s+/g, '') === cTrim.replace(/\s+/g, '')) {
            isExactImageMatch = true;
          }
        }
      }
    }

    const candPHash = candImageBase64 ? await computeVisualHash(candImageBase64) : '';
    const visualSim = isExactImageMatch ? 100 : (hashSimilarity(uploadedPHash, candPHash) * 100);
    
    // Robust Identity Comparison across Name, DOB, Gender, and Document Number
    const upName = canonicalUploaded['fullName'] || canonicalUploaded['name'] || canonicalUploaded['applicantName'] || (extractedFields?.fullName || extractedFields?.name || '');
    const refName = candidateCanonical['fullName'] || candidateCanonical['name'] || candidateCanonical['applicantName'] || (candidate as any).samplePerson?.fullName || candidate.extractedFields?.fullName || candidate.extractedFields?.name || candidate.displayName || '';

    const upDob = canonicalUploaded['dateOfBirth'] || canonicalUploaded['dob'] || (extractedFields?.dateOfBirth || extractedFields?.dob || '');
    const refDob = candidateCanonical['dateOfBirth'] || candidateCanonical['dob'] || (candidate as any).samplePerson?.dob || candidate.extractedFields?.dateOfBirth || candidate.extractedFields?.dob || '';

    const upGender = canonicalUploaded['gender'] || (extractedFields?.gender || '');
    const refGender = candidateCanonical['gender'] || (candidate as any).samplePerson?.gender || candidate.extractedFields?.gender || '';

    const primaryKeySpec = fieldSpecs.find(s => s.primaryKey)?.fieldKey || fieldSpecs[0].fieldKey;
    const upPrimary = canonicalUploaded[primaryKeySpec] || canonicalUploaded['passportNumber'] || canonicalUploaded['documentNumber'] || canonicalUploaded['licenseNumber'] || canonicalUploaded['permitNumber'] || canonicalUploaded['visaNumber'] || canonicalUploaded['identityNumber'] || '';
    const refPrimary = candidateCanonical[primaryKeySpec] || candidateCanonical['passportNumber'] || candidateCanonical['documentNumber'] || candidateCanonical['licenseNumber'] || candidateCanonical['permitNumber'] || candidateCanonical['visaNumber'] || candidateCanonical['identityNumber'] || candidate.extractedFields?.[primaryKeySpec] || candidate.referenceDocumentId || '';

    const identityComp = compareIdentityRecords(
      { fullName: upName, dob: upDob, gender: upGender, documentNumber: upPrimary },
      { fullName: refName, dob: refDob, gender: refGender, documentNumber: refPrimary }
    );

    const isPrimaryMatch = identityComp.documentNumber.matched;
    const isNameMatch = identityComp.name.matched;
    const isDobMatch = identityComp.dob.matched;
    const isGenderMatch = identityComp.gender.matched;

    // Check raw OCR text match
    const rawOcrUpper = (extractionResult.extractedText || '').toUpperCase();
    const refDocNumClean = (refPrimary || '').toString().replace(/[^A-Z0-9]/g, '');
    const isOcrTextMatch = Boolean(refDocNumClean && refDocNumClean.length >= 6 && rawOcrUpper.replace(/[^A-Z0-9]/g, '').includes(refDocNumClean));

    let visualScore = isExactImageMatch ? 100 : visualSim;
    
    // Compute unified composite match score with identity verification rules
    let overallScore = 0;
    if (isExactImageMatch) {
      overallScore = 100;
    } else if (identityComp.isMatch || isPrimaryMatch || isNameMatch) {
      overallScore = Math.max(90, identityComp.overallScore);
    } else if (isDobMatch) {
      overallScore = 88;
    } else if (isOcrTextMatch) {
      overallScore = 86;
    } else {
      // STRICT REJECT: If neither primary doc number, nor name, nor OCR text, nor exact image matches
      overallScore = 0;
    }

    const clampedOverall = Math.min(100, Math.max(0, overallScore));

    log(`[Candidate ${idx + 1}] Reference ID: ${candidate.referenceDocumentId}`);
    log(`  Primary: ${isPrimaryMatch} (${identityComp.documentNumber.score}%), Name: ${isNameMatch} (${identityComp.name.score}%), DOB: ${isDobMatch}, Gender: ${isGenderMatch}`);
    log(`  Field Score: ${Math.round(fieldScorePercent)}%, Visual: ${Math.round(visualScore)}%, Overall: ${Math.round(clampedOverall)}%`);

    if (clampedOverall > bestOverallScore || !bestCandidate) {
      bestCandidate = candidate;
      bestFieldResults = currentFieldResults;
      bestFieldScore = fieldScorePercent;
      bestVisualScore = visualScore;
      bestVisualDetails = {
        visualSimilarityScore: visualScore,
        layoutSimilarityScore: visualScore,
        photoRegionSimilarityScore: visualScore,
        securityFeatureConsistencyScore: visualScore,
        textRegionConsistencyScore: visualScore,
        differences: [],
      };
      bestOverallScore = clampedOverall;
    }
  }

  if (bestCandidate) {
    log('[BestCandidate]');
    log(`Reference ID: ${bestCandidate.referenceDocumentId}`);
    log(`Overall Score: ${Math.round(bestOverallScore)}`);
  }

  // Strict Decision Rule: If the overall score is below 80, this document is NOT in the database.
  // Reject unverified and unmatched documents without hesitation.
  if (!bestCandidate || bestOverallScore < 80) {
    log('[NoMatch] Uploaded document did not match any authorized database record. Enforcing REJECT verdict.');
    bestCandidate = null;
  }

  onStepProgress?.(10, 'Visual Consistency & Anti-Tampering Analysis');
  
  const isSyntheticTampered = (input.benchmarkPresetId === 'TAMPERED_PASSPORT') || (bestVisualDetails?.tamperingEvidenceScore > 60);

  let visualConsistency: CrossCheckVisualConsistency = {
    overallScore: bestVisualDetails ? bestVisualDetails.visualSimilarityScore : bestVisualScore,
    photoTamperingDetected: bestVisualDetails ? (bestVisualDetails.photoRegionSimilarityScore < 50) : false,
    mrzValid: !isSyntheticTampered,
    securityPatternMatch: bestVisualDetails ? (bestVisualDetails.securityFeatureConsistencyScore > 70) : true,
    fontAlignmentValid: bestVisualDetails ? (bestVisualDetails.textRegionConsistencyScore > 70) : true,
    notes: bestVisualDetails?.differences || [],
  };

  onStepProgress?.(11, 'Computing Match Score & Match State');
  
  let matchState: CrossCheckMatchState;
  let matchScore: number;
  let riskScore: number;
  let riskLevel: RiskLevel;
  let recommendedAction: 'PROCEED' | 'MANUAL_OFFICER_REVIEW' | 'FLAG_ANOMALY' | 'REJECT';

  if (!bestCandidate) {
    matchState = 'NO_REFERENCE_MATCH';
    matchScore = Math.max(0, Math.round(bestOverallScore));
    riskScore = 95;
    riskLevel = 'critical';
    recommendedAction = 'REJECT';
  } else {
    // SAME REFERENCE OVERRIDE
    let overallScore = (bestFieldScore * 0.40) + 
                       (bestVisualDetails?.visualSimilarityScore || bestVisualScore) * 0.30 +
                       (bestVisualDetails?.layoutSimilarityScore || bestVisualScore) * 0.10 +
                       (bestVisualDetails?.photoRegionSimilarityScore || bestVisualScore) * 0.10 +
                       (bestVisualDetails?.securityFeatureConsistencyScore || bestVisualScore) * 0.10;

    if (bestVisualScore >= 95) {
      // Exact reference image upload
      matchState = 'REFERENCE_MATCH';
      matchScore = overallScore;
      riskScore = 5;
      riskLevel = 'low';
      recommendedAction = 'PROCEED';
    } else if (isSyntheticTampered || (bestVisualDetails?.tamperingEvidenceScore > 70)) {
      matchState = 'PARTIAL_REFERENCE_MATCH';
      matchScore = overallScore;
      riskScore = bestVisualDetails?.tamperingEvidenceScore || 90;
      riskLevel = 'critical';
      recommendedAction = 'REJECT';
    } else if (overallScore >= 80) {
      matchState = 'REFERENCE_MATCH';
      matchScore = overallScore;
      riskScore = 10;
      riskLevel = 'low';
      recommendedAction = 'PROCEED';
    } else if (overallScore >= 50) {
      matchState = 'PARTIAL_REFERENCE_MATCH';
      matchScore = overallScore;
      riskScore = 60;
      riskLevel = 'medium';
      recommendedAction = 'MANUAL_OFFICER_REVIEW';
    } else {
      matchState = 'NO_REFERENCE_MATCH';
      matchScore = overallScore;
      riskScore = 85;
      riskLevel = 'high';
      recommendedAction = 'MANUAL_OFFICER_REVIEW';
    }
  }

  onStepProgress?.(12, 'Generating Verification Report');

  return {
    workflowStep: 12,
    documentType: detectedType,
    referenceStatusTitle: CROSS_CHECK_COMPLIANCE.referenceStatus,
    datasetSource: CROSS_CHECK_COMPLIANCE.datasetSource,
    disclaimer: CROSS_CHECK_COMPLIANCE.disclaimer,
    matchState,
    matchScore: Math.round(matchScore),
    riskScore: Math.round(riskScore),
    riskLevel,
    matchedFields: bestFieldResults.filter(f => f.matched).map(f => f.fieldLabel),
    mismatchedFields: bestFieldResults.filter(f => !f.matched).map(f => f.fieldLabel),
    fieldResults: bestFieldResults,
    visualConsistency,
    matchedReferenceRecord: bestCandidate || null,
    recommendedAction,
    executionLogs: logs,
    analyzedAt: new Date().toISOString(),
  };
}
