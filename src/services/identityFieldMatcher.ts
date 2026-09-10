/**
 * Identity Field Matcher
 * 
 * High-precision, forensic-grade normalization and cross-matching engine for:
 * 1. Full Name (handles honorifics, token reordering, initials, bilingual Hindi/English, OCR noise)
 * 2. Date of Birth (handles ISO, DD/MM/YYYY, DD-MM-YYYY, textual months, prefixes, year-only, day/month swaps)
 * 3. Gender (handles M/F/X, Male/Female, Hindi पुरूष/महिला, single letter, compound formats)
 * 4. Document Number (handles spaces, dashes, prefixes like DL, Passport, Aadhaar 4-4-4, Case)
 */

export interface FieldComparisonDetail {
  matched: boolean;
  score: number; // 0 to 100
  uploaded: string;
  reference: string;
  normalizedUploaded: string;
  normalizedReference: string;
  reason: string;
}

export interface ComprehensiveIdentityMatchResult {
  isMatch: boolean;
  overallScore: number;
  name: FieldComparisonDetail;
  dob: FieldComparisonDetail;
  gender: FieldComparisonDetail;
  documentNumber: FieldComparisonDetail;
  fieldSummaries: Array<{
    field: string;
    label: string;
    uploadedValue: string;
    referenceValue: string;
    status: 'matched' | 'mismatch' | 'uncertain';
    notes: string;
  }>;
}

// Common honorifics and prefixes in Indian and International identity documents
const HONORIFICS = new Set([
  'MR', 'MR.', 'MRS', 'MRS.', 'MS', 'MS.', 'MISS', 'DR', 'DR.',
  'SHRI', 'SH', 'SH.', 'SMT', 'SMT.', 'KUMAR', 'KUMARI', 'KM', 'KM.',
  'MD', 'MD.', 'MOHD', 'MOHD.', 'SHREE', 'SRI', 'PANDIT', 'PROF', 'PROF.',
  'LATE', 'MASTER'
]);

/**
 * Safely extracts a string from any field that might be wrapped as an object (e.g., { value: "...", label: "..." })
 */
export function extractStringValue(val: any): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
    return String(val).trim();
  }
  if (typeof val === 'object') {
    if (val.value !== undefined && val.value !== null) return String(val.value).trim();
    if (val.text !== undefined && val.text !== null) return String(val.text).trim();
    if (val.extractedValue !== undefined && val.extractedValue !== null) return String(val.extractedValue).trim();
    if (val.personName !== undefined && val.personName !== null) return String(val.personName).trim();
    if (val.fullName !== undefined && val.fullName !== null) return String(val.fullName).trim();
    if (val.name !== undefined && val.name !== null) return String(val.name).trim();
  }
  return '';
}

/**
 * Normalizes person names by removing honorifics, stripping symbols, collapsing spaces, and uppercasing.
 */
export function normalizeNameTokens(nameStr: string | null | undefined): { normalized: string; tokens: string[] } {
  const raw = extractStringValue(nameStr);
  if (!raw) return { normalized: '', tokens: [] };

  // Remove common separators like commas, slashes, parenthesized Hindi text or transliterations
  const cleaned = raw
    .replace(/\(.*?\)/g, ' ')
    .replace(/[\/\\,\-_.:;]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();

  const allWords = cleaned.split(/\s+/).filter(w => w.length > 0);
  // Filter out standalone honorifics
  const meaningfulTokens = allWords.filter(w => !HONORIFICS.has(w));
  const finalTokens = meaningfulTokens.length > 0 ? meaningfulTokens : allWords;

  return {
    normalized: finalTokens.join(' '),
    tokens: finalTokens,
  };
}

/**
 * Computes Levenshtein edit distance between two strings
 */
function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

/**
 * Compares two person names with high forensic accuracy
 */
export function compareNames(upRaw: any, refRaw: any): FieldComparisonDetail {
  const upStr = extractStringValue(upRaw);
  const refStr = extractStringValue(refRaw);

  const up = normalizeNameTokens(upStr);
  const ref = normalizeNameTokens(refStr);

  if (!up.normalized || !ref.normalized) {
    return {
      matched: false,
      score: 0,
      uploaded: upStr,
      reference: refStr,
      normalizedUploaded: up.normalized,
      normalizedReference: ref.normalized,
      reason: !up.normalized ? 'Missing name on uploaded document' : 'Missing name in reference record',
    };
  }

  // 1. Exact match after normalization
  if (up.normalized === ref.normalized) {
    return {
      matched: true,
      score: 100,
      uploaded: upStr,
      reference: refStr,
      normalizedUploaded: up.normalized,
      normalizedReference: ref.normalized,
      reason: 'Exact name match confirmed.',
    };
  }

  // 2. Token set equality regardless of order (e.g. "SINGH ARYA" vs "ARYA SINGH")
  const upSet = new Set(up.tokens);
  const refSet = new Set(ref.tokens);

  const commonTokens = up.tokens.filter(t => refSet.has(t));
  const isCompletePermutation = up.tokens.length === ref.tokens.length && commonTokens.length === up.tokens.length;

  if (isCompletePermutation) {
    return {
      matched: true,
      score: 98,
      uploaded: upStr,
      reference: refStr,
      normalizedUploaded: up.normalized,
      normalizedReference: ref.normalized,
      reason: 'Name match confirmed (token order inverted, e.g. Surname first).',
    };
  }

  // 3. Initials / Middle Name handling (e.g. "RAJESH K. SHARMA" vs "RAJESH KUMAR SHARMA")
  const matchesWithInitials = () => {
    if (up.tokens.length !== ref.tokens.length) return false;
    let matchCount = 0;
    for (let i = 0; i < up.tokens.length; i++) {
      const uToken = up.tokens[i];
      const rToken = ref.tokens[i];
      if (uToken === rToken) {
        matchCount++;
      } else if (
        (uToken.length === 1 && rToken.startsWith(uToken)) ||
        (rToken.length === 1 && uToken.startsWith(rToken))
      ) {
        matchCount++;
      }
    }
    return matchCount === up.tokens.length;
  };

  if (matchesWithInitials()) {
    return {
      matched: true,
      score: 95,
      uploaded: upStr,
      reference: refStr,
      normalizedUploaded: up.normalized,
      normalizedReference: ref.normalized,
      reason: 'Name match confirmed with initial abbreviation.',
    };
  }

  // 4. Token subset (e.g. "RAJESH KUMAR SHARMA" vs "RAJESH SHARMA")
  const minLen = Math.min(up.tokens.length, ref.tokens.length);
  if (minLen >= 2 && commonTokens.length >= minLen) {
    return {
      matched: true,
      score: 90,
      uploaded: upStr,
      reference: refStr,
      normalizedUploaded: up.normalized,
      normalizedReference: ref.normalized,
      reason: `Name match confirmed (${commonTokens.length} primary tokens aligned).`,
    };
  }

  // 5. Substring inclusion
  if (
    (up.normalized.length >= 5 && ref.normalized.includes(up.normalized)) ||
    (ref.normalized.length >= 5 && up.normalized.includes(ref.normalized))
  ) {
    return {
      matched: true,
      score: 88,
      uploaded: upStr,
      reference: refStr,
      normalizedUploaded: up.normalized,
      normalizedReference: ref.normalized,
      reason: 'Name substring match confirmed.',
    };
  }

  // 6. Fuzzy edit distance (OCR typo tolerance)
  const dist = levenshteinDistance(up.normalized, ref.normalized);
  const maxLen = Math.max(up.normalized.length, ref.normalized.length);
  const similarity = 1 - dist / maxLen;

  if (similarity >= 0.82 && dist <= 3) {
    return {
      matched: true,
      score: Math.round(similarity * 100),
      uploaded: upStr,
      reference: refStr,
      normalizedUploaded: up.normalized,
      normalizedReference: ref.normalized,
      reason: `Name matched with OCR optical character variance (${Math.round(similarity * 100)}% similarity).`,
    };
  }

  return {
    matched: false,
    score: Math.round(similarity * 100),
    uploaded: upStr,
    reference: refStr,
    normalizedUploaded: up.normalized,
    normalizedReference: ref.normalized,
    reason: `Name discrepancy: "${upStr}" vs "${refStr}".`,
  };
}

/**
 * Textual month mapping
 */
const MONTH_MAP: Record<string, string> = {
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

/**
 * Normalizes any Date string to standard ISO 8601 (YYYY-MM-DD).
 * Handles DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, textual months ("15 JUL 1992"),
 * prefixes ("DOB: 15/07/1992"), and 2-digit years ("15/07/92").
 */
export function normalizeDateToIso(dateRaw: any): string {
  const raw = extractStringValue(dateRaw);
  if (!raw) return '';

  const clean = raw.trim();

  // 1. If already valid YYYY-MM-DD
  const isoMatch = clean.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }

  // 2. Textual month format: "15 JUL 1992" or "15-OCT-2023" or "OCTOBER 15, 1992"
  const textMonthMatch = clean.match(/(\d{1,2})\s*[-/ ]\s*([A-Za-z]{3,9})\s*[-/ ,]\s*(\d{4})/);
  if (textMonthMatch) {
    const [, d, mon, y] = textMonthMatch;
    const mStr = mon.substring(0, 3).toUpperCase();
    if (MONTH_MAP[mStr]) {
      return `${y}-${MONTH_MAP[mStr]}-${d.padStart(2, '0')}`;
    }
  }

  // Month first textual format: "OCT 15 2023"
  const textMonthFirst = clean.match(/([A-Za-z]{3,9})\s+(\d{1,2})[,\s]+(\d{4})/);
  if (textMonthFirst) {
    const [, mon, d, y] = textMonthFirst;
    const mStr = mon.substring(0, 3).toUpperCase();
    if (MONTH_MAP[mStr]) {
      return `${y}-${MONTH_MAP[mStr]}-${d.padStart(2, '0')}`;
    }
  }

  // 3. Numeric formats: DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const numericMatch = clean.match(/\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})\b/);
  if (numericMatch) {
    let p1 = numericMatch[1];
    let p2 = numericMatch[2];
    let year = numericMatch[3];

    // Handle 2-digit year
    if (year.length === 2) {
      const yrNum = parseInt(year, 10);
      year = yrNum > 35 ? `19${year}` : `20${year}`;
    }

    // Usually Indian/international identity docs use DD/MM/YYYY
    // But if p1 > 12 and p2 <= 12, p1 is day, p2 is month
    // If p2 > 12 and p1 <= 12, p1 is month, p2 is day
    let day = p1.padStart(2, '0');
    let month = p2.padStart(2, '0');

    if (parseInt(p1, 10) <= 12 && parseInt(p2, 10) > 12) {
      day = p2.padStart(2, '0');
      month = p1.padStart(2, '0');
    }

    return `${year}-${month}-${day}`;
  }

  // 4. Numeric format YYYY/MM/DD
  const ymdMatch = clean.match(/\b(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})\b/);
  if (ymdMatch) {
    return `${ymdMatch[1]}-${ymdMatch[2].padStart(2, '0')}-${ymdMatch[3].padStart(2, '0')}`;
  }

  // 5. Year only fallback (e.g. Aadhaar "Year of Birth: 1981")
  const yearOnlyMatch = clean.match(/\b(19\d{2}|20\d{2})\b/);
  if (yearOnlyMatch) {
    return `${yearOnlyMatch[1]}`;
  }

  return clean;
}

/**
 * Compares two Date of Birth strings with comprehensive format tolerance
 */
export function compareDobs(upRaw: any, refRaw: any): FieldComparisonDetail {
  const upStr = extractStringValue(upRaw);
  const refStr = extractStringValue(refRaw);

  const isoUp = normalizeDateToIso(upStr);
  const isoRef = normalizeDateToIso(refStr);

  if (!isoUp || !isoRef) {
    return {
      matched: false,
      score: 0,
      uploaded: upStr,
      reference: refStr,
      normalizedUploaded: isoUp,
      normalizedReference: isoRef,
      reason: !isoUp ? 'Missing DOB on uploaded document' : 'Missing DOB in reference record',
    };
  }

  // 1. Exact ISO match (e.g. "1992-07-15" === "1992-07-15")
  if (isoUp === isoRef) {
    return {
      matched: true,
      score: 100,
      uploaded: upStr,
      reference: refStr,
      normalizedUploaded: isoUp,
      normalizedReference: isoRef,
      reason: 'Date of Birth matches identically.',
    };
  }

  // 2. Day / Month swap tolerance (e.g. 1981-08-12 vs 1981-12-08 due to DD/MM vs MM/DD)
  const upParts = isoUp.split('-');
  const refParts = isoRef.split('-');
  if (upParts.length === 3 && refParts.length === 3) {
    const [uY, uM, uD] = upParts;
    const [rY, rM, rD] = refParts;

    if (uY === rY) {
      if (uM === rD && uD === rM) {
        return {
          matched: true,
          score: 95,
          uploaded: upStr,
          reference: refStr,
          normalizedUploaded: isoUp,
          normalizedReference: isoRef,
          reason: 'Date of Birth match confirmed (standard DD/MM vs MM/DD format variation).',
        };
      }
    }
  }

  // 3. Year-only match if one document only states the birth year (e.g. Aadhaar card)
  if (
    (isoUp.length === 4 && isoRef.startsWith(isoUp)) ||
    (isoRef.length === 4 && isoUp.startsWith(isoRef))
  ) {
    return {
      matched: true,
      score: 90,
      uploaded: upStr,
      reference: refStr,
      normalizedUploaded: isoUp,
      normalizedReference: isoRef,
      reason: 'Year of Birth matches authorized record.',
    };
  }

  // 4. Raw digits match
  const upDigits = upStr.replace(/\D/g, '');
  const refDigits = refStr.replace(/\D/g, '');
  if (upDigits && refDigits && upDigits === refDigits) {
    return {
      matched: true,
      score: 95,
      uploaded: upStr,
      reference: refStr,
      normalizedUploaded: isoUp,
      normalizedReference: isoRef,
      reason: 'Date numeric components match.',
    };
  }

  return {
    matched: false,
    score: 0,
    uploaded: upStr,
    reference: refStr,
    normalizedUploaded: isoUp,
    normalizedReference: isoRef,
    reason: `Date of Birth discrepancy: "${upStr}" (${isoUp}) vs "${refStr}" (${isoRef}).`,
  };
}

/**
 * Normalizes gender strings into standard 'M', 'F', 'X', or ''
 */
export function normalizeGender(genderRaw: any): 'M' | 'F' | 'X' | '' {
  const raw = extractStringValue(genderRaw).trim().toUpperCase();
  if (!raw) return '';

  // Female variations
  if (
    raw === 'F' ||
    raw.startsWith('FEMALE') ||
    raw.includes('FEMALE') ||
    raw.includes('WOMAN') ||
    raw.includes('महिला') ||
    raw.includes('स्त्री') ||
    raw.startsWith('F/') ||
    raw === 'FEM'
  ) {
    return 'F';
  }

  // Male variations
  if (
    raw === 'M' ||
    raw.startsWith('MALE') ||
    raw.includes('MALE') ||
    raw.includes('MAN') ||
    raw.includes('पुरूष') ||
    raw.includes('पुरुष') ||
    raw.startsWith('M/') ||
    raw === 'MAS'
  ) {
    return 'M';
  }

  // Transgender / Other
  if (
    raw === 'X' ||
    raw.startsWith('OTHER') ||
    raw.includes('TRANS') ||
    raw.includes('TG') ||
    raw.includes('OTHER')
  ) {
    return 'X';
  }

  return '';
}

/**
 * Compares two Gender fields
 */
export function compareGenders(upRaw: any, refRaw: any): FieldComparisonDetail {
  const upStr = extractStringValue(upRaw);
  const refStr = extractStringValue(refRaw);

  const uGen = normalizeGender(upStr);
  const rGen = normalizeGender(refStr);

  if (!uGen || !rGen) {
    return {
      matched: true, // Non-blocking if gender wasn't captured on one document
      score: 75,
      uploaded: upStr || 'Not Specified',
      reference: refStr || 'Not Specified',
      normalizedUploaded: uGen || 'N/A',
      normalizedReference: rGen || 'N/A',
      reason: 'Gender field unstated on one of the documents; non-blocking.',
    };
  }

  if (uGen === rGen) {
    return {
      matched: true,
      score: 100,
      uploaded: upStr,
      reference: refStr,
      normalizedUploaded: uGen,
      normalizedReference: rGen,
      reason: `Gender confirmed (${uGen === 'M' ? 'Male' : uGen === 'F' ? 'Female' : 'Other'}).`,
    };
  }

  return {
    matched: false,
    score: 0,
    uploaded: upStr,
    reference: refStr,
    normalizedUploaded: uGen,
    normalizedReference: rGen,
    reason: `Gender mismatch: "${upStr}" (${uGen}) vs "${refStr}" (${rGen}).`,
  };
}

/**
 * Normalizes document numbers (Aadhaar, Passport, DL, Visa, Permit)
 */
export function normalizeDocNumber(docNumRaw: any): string {
  const raw = extractStringValue(docNumRaw);
  if (!raw) return '';
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/**
 * Compares two Document Numbers with space/dash and format tolerance
 */
export function compareDocNumbers(upRaw: any, refRaw: any): FieldComparisonDetail {
  const upStr = extractStringValue(upRaw);
  const refStr = extractStringValue(refRaw);

  const uClean = normalizeDocNumber(upStr);
  const rClean = normalizeDocNumber(refStr);

  if (!uClean || !rClean) {
    return {
      matched: false,
      score: 0,
      uploaded: upStr,
      reference: refStr,
      normalizedUploaded: uClean,
      normalizedReference: rClean,
      reason: !uClean ? 'Missing document number on uploaded document' : 'Missing document number in reference record',
    };
  }

  // 1. Exact clean match
  if (uClean === rClean) {
    return {
      matched: true,
      score: 100,
      uploaded: upStr,
      reference: refStr,
      normalizedUploaded: uClean,
      normalizedReference: rClean,
      reason: 'Document number confirmed identically.',
    };
  }

  // 2. Substring match for prefixes or partial scans (min 6 alphanumeric characters)
  if (
    (uClean.length >= 6 && rClean.includes(uClean)) ||
    (rClean.length >= 6 && uClean.includes(rClean))
  ) {
    return {
      matched: true,
      score: 94,
      uploaded: upStr,
      reference: refStr,
      normalizedUploaded: uClean,
      normalizedReference: rClean,
      reason: 'Document number substring alignment confirmed.',
    };
  }

  // 3. OCR 1-character typo tolerance for long doc numbers (>= 8 chars)
  if (Math.min(uClean.length, rClean.length) >= 8) {
    const dist = levenshteinDistance(uClean, rClean);
    if (dist <= 1) {
      return {
        matched: true,
        score: 90,
        uploaded: upStr,
        reference: refStr,
        normalizedUploaded: uClean,
        normalizedReference: rClean,
        reason: 'Document number matched with single-character OCR optical tolerance.',
      };
    }
  }

  return {
    matched: false,
    score: 0,
    uploaded: upStr,
    reference: refStr,
    normalizedUploaded: uClean,
    normalizedReference: rClean,
    reason: `Document number mismatch: "${upStr}" vs "${refStr}".`,
  };
}

/**
 * Performs a comprehensive forensic identity comparison between uploaded document fields
 * and reference database record fields.
 */
export function compareIdentityRecords(
  uploadedFields: Record<string, any>,
  referenceFields: Record<string, any>
): ComprehensiveIdentityMatchResult {
  // Extract key fields from uploaded
  const upName = uploadedFields.fullName || uploadedFields.name || uploadedFields.personName || uploadedFields.applicantName || '';
  const upDob = uploadedFields.dob || uploadedFields.dateOfBirth || uploadedFields.birthDate || '';
  const upGender = uploadedFields.gender || uploadedFields.sex || '';
  const upDocNum = uploadedFields.documentNumber || uploadedFields.docNumber || uploadedFields.passportNumber || uploadedFields.visaNumber || uploadedFields.identityNumber || uploadedFields.aadhaarNumber || uploadedFields.licenseNumber || uploadedFields.licenceNumber || uploadedFields.permitNumber || '';

  // Extract key fields from reference
  const refName = referenceFields.personName || referenceFields.fullName || referenceFields.name || referenceFields.applicantName || '';
  const refDob = referenceFields.dob || referenceFields.dateOfBirth || referenceFields.birthDate || '';
  const refGender = referenceFields.gender || referenceFields.sex || '';
  const refDocNum = referenceFields.docNumber || referenceFields.documentNumber || referenceFields.passportNumber || referenceFields.visaNumber || referenceFields.identityNumber || referenceFields.aadhaarNumber || referenceFields.licenseNumber || referenceFields.licenceNumber || referenceFields.permitNumber || '';

  const nameMatch = compareNames(upName, refName);
  const dobMatch = compareDobs(upDob, refDob);
  const genderMatch = compareGenders(upGender, refGender);
  const docNumMatch = compareDocNumbers(upDocNum, refDocNum);

  // Overall Decision Matrix:
  // Match requires:
  // - Doc Number match AND Name match -> 98-100%
  // - OR Name match AND DOB match AND Gender match -> 92-96%
  // - OR Doc Number match AND DOB match -> 90-95%
  let isMatch = false;
  let score = 0;

  if (docNumMatch.matched && nameMatch.matched) {
    isMatch = true;
    score = Math.round((docNumMatch.score * 0.45) + (nameMatch.score * 0.35) + (dobMatch.score * 0.15) + (genderMatch.score * 0.05));
  } else if (nameMatch.matched && dobMatch.matched && genderMatch.matched) {
    isMatch = true;
    score = Math.round((nameMatch.score * 0.4) + (dobMatch.score * 0.4) + (genderMatch.score * 0.2));
  } else if (docNumMatch.matched && dobMatch.matched) {
    isMatch = true;
    score = Math.round((docNumMatch.score * 0.6) + (dobMatch.score * 0.4));
  } else {
    isMatch = false;
    score = Math.max(0, Math.round((nameMatch.score * 0.3) + (docNumMatch.score * 0.3) + (dobMatch.score * 0.2)));
  }

  const fieldSummaries = [
    {
      field: 'fullName',
      label: 'Full Legal Name',
      uploadedValue: nameMatch.uploaded || 'Not Provided',
      referenceValue: nameMatch.reference || 'N/A',
      status: (nameMatch.matched ? 'matched' : (nameMatch.uploaded ? 'mismatch' : 'uncertain')) as any,
      notes: nameMatch.reason,
    },
    {
      field: 'dob',
      label: 'Date of Birth',
      uploadedValue: dobMatch.uploaded || 'Not Provided',
      referenceValue: dobMatch.reference || 'N/A',
      status: (dobMatch.matched ? 'matched' : (dobMatch.uploaded ? 'mismatch' : 'uncertain')) as any,
      notes: dobMatch.reason,
    },
    {
      field: 'gender',
      label: 'Gender / Sex',
      uploadedValue: genderMatch.uploaded || 'Not Provided',
      referenceValue: genderMatch.reference || 'N/A',
      status: (genderMatch.matched ? 'matched' : (genderMatch.uploaded ? 'mismatch' : 'uncertain')) as any,
      notes: genderMatch.reason,
    },
    {
      field: 'documentNumber',
      label: 'Document Identifier',
      uploadedValue: docNumMatch.uploaded || 'Not Provided',
      referenceValue: docNumMatch.reference || 'N/A',
      status: (docNumMatch.matched ? 'matched' : (docNumMatch.uploaded ? 'mismatch' : 'uncertain')) as any,
      notes: docNumMatch.reason,
    },
  ];

  return {
    isMatch,
    overallScore: Math.min(100, Math.max(0, score)),
    name: nameMatch,
    dob: dobMatch,
    gender: genderMatch,
    documentNumber: docNumMatch,
    fieldSummaries,
  };
}
