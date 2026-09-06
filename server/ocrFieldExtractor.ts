import { GoogleGenAI } from '@google/genai';
import { 
  CanonicalDocumentType, 
  OcrExtractionResult 
} from '../src/types';

export interface OcrExtractionPayload {
  id?: string;
  fileName?: string;
  documentType?: CanonicalDocumentType;
  dataUrl?: string;
  mimeType?: string;
  textContext?: string;
  sourceType?: 'UPLOAD' | 'REFERENCE';
}

// Mandatory fields expected for each document type as required by user specifications
export const EXPECTED_FIELDS_BY_TYPE: Record<CanonicalDocumentType, string[]> = {
  PASSPORT: [
    'surname',
    'givenNames',
    'fullName',
    'passportNumber',
    'nationality',
    'dateOfBirth',
    'gender',
    'placeOfBirth',
    'placeOfIssue',
    'dateOfIssue',
    'dateOfExpiry',
    'mrz',
    'issuingAuthority',
  ],
  VISA: [
    'visaNumber',
    'name',
    'passportNumber',
    'visaType',
    'placeOfIssue',
    'dateOfIssue',
    'dateOfExpiry',
    'numberOfEntries',
    'entryValidation',
    'stayDuration',
  ],
  NATIONAL_ID: [
    'name',
    'identityNumber',
    'dateOfBirth',
    'gender',
    'address',
    'issuingAuthority',
  ],
  DRIVING_LICENSE: [
    'licenseNumber',
    'name',
    'dateOfBirth',
    'address',
    'issueDate',
    'expiryDate',
    'vehicleClass',
    'issuingAuthority',
  ],
  PERMIT: [
    'permitNumber',
    'applicantName',
    'passportNumber',
    'nationality',
    'dateOfBirth',
    'dateOfIssue',
    'validUntil',
    'area',
    'purpose',
    'issuingAuthority',
    'approvalStatus',
  ],
  TRAVEL_AUTHORIZATION: [
    'documentNumber',
    'name',
    'passportNumber',
    'nationality',
    'dateOfBirth',
    'dateOfIssue',
    'validUntil',
    'issuingAuthority',
    'approvalStatus',
  ],
  UNKNOWN: [],
};

// ================= NORMALIZATION UTILITIES =================

/**
 * Normalizes dates to ISO 8601 (YYYY-MM-DD).
 * Examples:
 * "15/07/1992" -> "1992-07-15"
 * "15-07-1992" -> "1992-07-15"
 * "1992-07-15" -> "1992-07-15"
 * "15 JUL 1992" -> "1992-07-15"
 */
export function normalizeDate(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const clean = raw.trim();
  if (!clean || clean.toUpperCase() === 'NULL' || clean.toUpperCase() === 'N/A') return null;

  // Already ISO: YYYY-MM-DD
  const isoMatch = clean.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const dmyMatch = clean.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // Textual month: e.g. "15 JUL 1992" or "15-JUL-1992" or "15 July 1992" or "July 15, 1992"
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

  // Try standard Date parse as fallback
  const parsed = new Date(clean);
  if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 1900 && parsed.getFullYear() < 2100) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return clean;
}

/**
 * Normalizes person and entity names to clean uppercase spacing.
 */
export function normalizeName(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const clean = raw.trim();
  if (!clean || clean.toUpperCase() === 'NULL' || clean.toUpperCase() === 'N/A') return null;

  // Handle format like "SINGH, ARYA" or "SINGH<<ARYA"
  if (clean.includes('<<')) {
    const parts = clean.split('<<').map(p => p.replace(/</g, '').trim()).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[1]} ${parts[0]}`.toUpperCase().replace(/\s+/g, ' ');
    }
  }

  if (clean.includes(',')) {
    const parts = clean.split(',').map(p => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[1]} ${parts[0]}`.toUpperCase().replace(/\s+/g, ' ');
    }
  }

  return clean.toUpperCase().replace(/\s+/g, ' ').replace(/[^\w\s.-]/g, '').trim();
}

/**
 * Normalizes document numbers (removes extraneous spaces/punctuation, converts to uppercase).
 */
export function normalizeDocumentNumber(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const clean = raw.trim();
  if (!clean || clean.toUpperCase() === 'NULL' || clean.toUpperCase() === 'N/A') return null;

  // For national IDs like Aadhaar with 12 digits, format as 4-4-4 or condensed
  const digitsOnly = clean.replace(/\D/g, '');
  if (digitsOnly.length === 12) {
    return `${digitsOnly.slice(0, 4)} ${digitsOnly.slice(4, 8)} ${digitsOnly.slice(8, 12)}`;
  }

  // Remove whitespace and hyphens for passports / license numbers
  return clean.replace(/[\s-]/g, '').toUpperCase();
}

/**
 * Normalizes nationality to standard ICAO 3-letter code or canonical country name.
 */
export function normalizeNationality(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const clean = raw.trim().toUpperCase();
  if (!clean || clean === 'NULL' || clean === 'N/A') return null;

  if (clean.includes('IND') || clean.includes('BHARAT') || clean.includes('भारत')) return 'IND';
  if (clean.includes('FRA') || clean.includes('FRENCH') || clean.includes('FRANCE')) return 'FRA';
  if (clean.includes('USA') || clean.includes('UNITED STATES') || clean.includes('AMERICAN')) return 'USA';
  if (clean.includes('GBR') || clean.includes('BRITISH') || clean.includes('UNITED KINGDOM')) return 'GBR';
  if (clean.includes('DEU') || clean.includes('GERMAN') || clean.includes('GERMANY')) return 'DEU';
  if (clean.includes('CAN') || clean.includes('CANADIAN') || clean.includes('CANADA')) return 'CAN';
  if (clean.includes('AUS') || clean.includes('AUSTRALIAN') || clean.includes('AUSTRALIA')) return 'AUS';

  // Return uppercase stripped string
  return clean.replace(/[^\w\s]/g, '').trim();
}

/**
 * Normalizes gender to standard "M", "F", or "X".
 */
export function normalizeGender(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const clean = raw.trim().toUpperCase();
  if (!clean || clean === 'NULL' || clean === 'N/A') return null;

  if (clean === 'M' || clean.startsWith('MALE') || clean.includes('PURUSH') || clean.includes('पुरूष')) return 'M';
  if (clean === 'F' || clean.startsWith('FEMALE') || clean.includes('MAHILA') || clean.includes('महिला')) return 'F';
  if (clean === 'X' || clean.startsWith('OTHER') || clean.includes('TRANS')) return 'X';

  return clean;
}

/**
 * Dispatches normalization for a given field based on field name
 */
export function normalizeField(fieldName: string, rawValue: string | null): string | null {
  if (rawValue === null || rawValue === undefined) return null;
  const trimmed = rawValue.trim();
  if (!trimmed || trimmed.toUpperCase() === 'NULL' || trimmed.toUpperCase() === 'N/A' || trimmed.toUpperCase() === 'UNKNOWN') {
    return null;
  }

  const lower = fieldName.toLowerCase();

  // Date fields
  if (lower.includes('date') || lower.includes('dob') || lower.includes('until') || lower.includes('expiry') || lower.includes('issuedate')) {
    return normalizeDate(trimmed);
  }

  // Name fields
  if (lower.includes('name') || lower === 'surname' || lower === 'givennames') {
    return normalizeName(trimmed);
  }

  // Document numbers
  if (lower.includes('number') || lower.includes('docnumber') || lower.includes('identitynumber') || lower.includes('licensenumber') || lower.includes('permitnumber') || lower.includes('visanumber')) {
    return normalizeDocumentNumber(trimmed);
  }

  // Nationality
  if (lower === 'nationality') {
    return normalizeNationality(trimmed);
  }

  // Gender
  if (lower === 'gender' || lower === 'sex') {
    return normalizeGender(trimmed);
  }

  return trimmed;
}

// ================= DETERMINISTIC OCR EXTRACTION FALLBACK =================

export function fallbackOcrExtraction(payload: OcrExtractionPayload): OcrExtractionResult {
  const text = (payload.textContext || '' + ' ' + (payload.fileName || '')).toUpperCase();
  let detectedType: CanonicalDocumentType = 'PASSPORT';
  if (text.includes('VISA')) detectedType = 'VISA';
  else if (text.includes('DRIVING') || text.includes('LICENSE')) detectedType = 'DRIVING_LICENSE';
  else if (text.includes('IDENTITY') || text.includes('ID CARD')) detectedType = 'NATIONAL_ID';

  const docType: CanonicalDocumentType = payload.documentType || detectedType;

  const expectedFields = EXPECTED_FIELDS_BY_TYPE[docType] || [];
  const fields: Record<string, string | null> = {};
  const uncertainFields: string[] = [];
  const warnings: string[] = ['AI structured extraction unavailable (rate limited). Using exact input fields.'];

  for (const field of expectedFields) {
    fields[field] = null;
    uncertainFields.push(field);
  }

  return {
    documentType: docType,
    confidence: 10,
    extractedText: payload.textContext || '',
    fields,
    normalizedFields: {},
    uncertainFields,
    warnings,
    analysisTimestamp: new Date().toISOString()
  };
}

// ================= GEMINI MULTIMODAL OCR EXTRACTION =================

export async function extractStructuredFieldsWithGemini(
  ai: GoogleGenAI | null,
  payload: OcrExtractionPayload
): Promise<OcrExtractionResult> {
  if (!ai) {
    console.log('Gemini client not initialized, using deterministic forensic fallback');
    return fallbackOcrExtraction(payload);
  }

  try {
    const prompt = `You are a forensic immigration document OCR and structured field extraction engine for border checkpoints.
Inspect the submitted document image/text and extract the exact structured fields for this credential.

CRITICAL INSTRUCTIONS:
1. You must NEVER invent, speculate, or hallucinate missing information.
2. If a value cannot be read from the document image or text with high certainty, or is missing entirely, you MUST set its value to null.
3. Keep the exact optical OCR text in "extractedText".
4. For every expected field, return its exact original OCR value in "fields". Do NOT normalize here.
5. If the document type cannot be confidently determined or is not an identity credential, set documentType to "UNKNOWN".

SUPPORTED DOCUMENT TYPES AND MANDATORY FIELDS:
- PASSPORT: surname, givenNames, fullName, passportNumber, nationality, dateOfBirth, gender, placeOfBirth, placeOfIssue, dateOfIssue, dateOfExpiry, mrz, issuingAuthority
- VISA: visaNumber, name, passportNumber, visaType, placeOfIssue, dateOfIssue, dateOfExpiry, numberOfEntries, entryValidation, stayDuration
- NATIONAL_ID: name, identityNumber, dateOfBirth, gender, address, issuingAuthority
- DRIVING_LICENSE: licenseNumber, name, dateOfBirth, address, issueDate, expiryDate, vehicleClass, issuingAuthority
- PERMIT: permitNumber, applicantName, passportNumber, nationality, dateOfBirth, dateOfIssue, validUntil, area, purpose, issuingAuthority, approvalStatus
- TRAVEL_AUTHORIZATION: documentNumber, name, passportNumber, nationality, dateOfBirth, dateOfIssue, validUntil, issuingAuthority, approvalStatus
- UNKNOWN: if document is not one of above.

Respond ONLY with valid JSON matching this schema:
{
  "documentType": "PASSPORT" | "VISA" | "NATIONAL_ID" | "DRIVING_LICENSE" | "PERMIT" | "TRAVEL_AUTHORIZATION" | "UNKNOWN",
  "confidence": number (0 to 100),
  "extractedText": "all readable raw text from the document",
  "fields": {
    "<fieldName>": string | null
  },
  "warnings": ["any warnings regarding blur, occlusion, or missing security markers"]
}`;

    const contents: any[] = [{ text: prompt }];

    // If base64 image data is provided, attach it as inlineData
    if (payload.dataUrl && payload.dataUrl.startsWith('data:')) {
      const match = payload.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        contents.push({
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        });
      }
    }

    if (payload.textContext) {
      contents.push({ text: `DOCUMENT CONTEXT & OCR TEXT:\n${payload.textContext}` });
    }

    let response;
    let retries = 3;
    let delay = 1000;
    while (retries > 0) {
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents,
          config: {
            responseMimeType: 'application/json',
          },
        });
        break;
      } catch (err: any) {
        const errString = typeof err === 'string' ? err : (err.message || JSON.stringify(err));
        if ((errString.includes('503') || errString.includes('429') || err?.status === 429 || err?.status === 503 || err?.error?.code === 429 || err?.error?.code === 503) && retries > 1) {
          retries--;
          let currentDelay = delay;
          if (errString.includes('429') || err?.status === 429 || err?.error?.code === 429) {
             const match = errString.match(/retry in (\d+(?:\.\d+)?)s/);
             if (match) {
                 currentDelay = (parseFloat(match[1]) * 1000) + 1000;
             } else {
                 currentDelay = 32000;
             }
             
             if (currentDelay > 10000) {
               throw new Error('RATE_LIMIT_FAST_FAIL');
             }
          }
          await new Promise(resolve => setTimeout(resolve, currentDelay));
          delay *= 2; // exponential backoff
        } else {
          throw err;
        }
      }
    }

    if (!response) {
      throw new Error("Failed to get response from Gemini API after retries.");
    }

    let textResponse = response.text?.trim() || '{}';
    
    // Sanitize JSON by removing markdown code blocks if present
    textResponse = textResponse.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
    
    // Attempt to extract only the JSON object if there's trailing garbage
    if (textResponse.startsWith('{')) {
      const lastBrace = textResponse.lastIndexOf('}');
      if (lastBrace !== -1) {
        textResponse = textResponse.substring(0, lastBrace + 1);
      }
    }

    const parsed = JSON.parse(textResponse);

    const docType: CanonicalDocumentType = (parsed.documentType || 'UNKNOWN').toUpperCase() as CanonicalDocumentType;
    const expectedFields = EXPECTED_FIELDS_BY_TYPE[docType] || [];
    const rawFields: Record<string, string | null> = parsed.fields || {};

    const finalFields: Record<string, string | null> = {};
    const normalizedFields: Record<string, string | null> = {};
    const uncertainFields: string[] = [];
    const warnings: string[] = Array.isArray(parsed.warnings) ? parsed.warnings : [];

    // Rigorously enforce: Never invent missing information.
    // If value cannot be read, return null and add field to uncertainFields[]
    for (const fieldName of expectedFields) {
      const rawVal = rawFields[fieldName];
      if (rawVal === undefined || rawVal === null || typeof rawVal !== 'string' || rawVal.trim() === '' || rawVal.toUpperCase() === 'NULL' || rawVal.toUpperCase() === 'N/A' || rawVal.toUpperCase() === 'UNKNOWN') {
        finalFields[fieldName] = null;
        normalizedFields[fieldName] = null;
        uncertainFields.push(fieldName);
        warnings.push(`Field '${fieldName}' could not be read from document image; returned null and flagged as uncertain.`);
      } else {
        finalFields[fieldName] = rawVal.trim();
        const normVal = normalizeField(fieldName, rawVal);
        normalizedFields[fieldName] = normVal;
        if (normVal === null) {
          finalFields[fieldName] = null;
          uncertainFields.push(fieldName);
          warnings.push(`Field '${fieldName}' failed normalization validation; marked as uncertain.`);
        }
      }
    }

    return {
      documentType: docType,
      confidence: typeof parsed.confidence === 'number' ? Math.min(100, Math.max(0, parsed.confidence)) : 95,
      extractedText: parsed.extractedText || payload.textContext || '',
      fields: finalFields,
      normalizedFields,
      uncertainFields,
      warnings,
      analysisTimestamp: new Date().toISOString(),
    };
  } catch (err: any) {
    if (err?.message === 'RATE_LIMIT_FAST_FAIL') {
      console.log('Gemini AI rate limit reached. Using instant deterministic forensic OCR fallback.');
    } else {
      console.log('Gemini OCR extraction bypassed, using deterministic forensic fallback.');
    }
    return fallbackOcrExtraction(payload);
  }
}
