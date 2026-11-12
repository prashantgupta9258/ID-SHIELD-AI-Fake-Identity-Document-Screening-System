export type DocumentType = 
  | 'passport' 
  | 'visa' 
  | 'aadhaar' 
  | 'driving_license' 
  | 'permit' 
  | 'travel_auth' 
  | 'other';

export type RiskLevel = 'low' | 'moderate_low' | 'medium' | 'high' | 'critical';

export type RiskScoreBand = 
  | 'PERFECT MATCH (PASSED)'
  | 'MISMATCH (REJECTED)'
  | 'LOW RISK' 
  | 'MODERATE-LOW RISK' 
  | 'MEDIUM RISK' 
  | 'HIGH RISK' 
  | 'CRITICAL RISK';

export type RecommendedAction = 
  | 'STANDARD CLEARANCE (100% MATCH)'
  | 'REJECT ADMISSION (MISMATCH)'
  | 'STANDARD CLEARANCE' 
  | 'ROUTINE VERIFICATION' 
  | 'SECONDARY INSPECTION' 
  | 'MANUAL REVIEW REQUIRED' 
  | 'CRITICAL ESCALATION / REJECT ADMISSION';

export interface RiskFactor {
  id: string;
  points: number; // e.g. 25
  label: string; // e.g. "+25 Potential text manipulation"
  name: string; // "Potential text manipulation"
  category: 
    | 'tampering' 
    | 'field_mismatch' 
    | 'expiration' 
    | 'date_anomaly' 
    | 'image_quality' 
    | 'ocr_confidence' 
    | 'face_verification' 
    | 'classification' 
    | 'missing_field' 
    | 'reference_database';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence?: string;
}

export interface ExplainableRiskAssessment {
  score: number; // 0-100 (e.g. 76)
  band: RiskScoreBand; // 'LOW RISK' | 'MODERATE-LOW RISK' | 'MEDIUM RISK' | 'HIGH RISK' | 'CRITICAL RISK'
  level: RiskLevel; // 'low' | 'moderate_low' | 'medium' | 'high' | 'critical'
  recommendedAction: RecommendedAction;
  riskFactors: RiskFactor[];
  signalsEvaluated: {
    classificationConfidence: number;
    ocrConfidence: number;
    referenceDatabaseStatus: string;
    fieldMismatchCount: number;
    isExpired: boolean;
    invalidDateRelationships: string[];
    tamperingIndicatorsCount: number;
    imageQualityRating: string;
    faceVerificationConfidence: number;
    missingImportantFields: string[];
  };
  disclaimer: string;
  evaluatedAt: string;
}

export type ScreeningStatus = 
  | 'verified' 
  | 'suspicious' 
  | 'rejected' 
  | 'manual_review';

export type PipelineStepStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'warning' 
  | 'failed';

export interface BoundingBox {
  id: string;
  label: string;
  field: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage
  height: number; // percentage
  status: 'valid' | 'suspicious' | 'anomalous';
  confidence: number;
  extractedValue?: string;
  expectedValue?: string;
  notes?: string;
}

export interface AnomalyFinding {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  confidence: number;
  evidence: string;
  category: 'tampering' | 'chronology' | 'mrz' | 'biometric' | 'metadata' | 'watermark';
  detectedAt?: string;
}

export interface ReferenceDocument {
  id: string;
  name: string;
  docType: DocumentType;
  docTypeName: string;
  country: string;
  personName: string;
  dob: string;
  gender: string;
  nationality: string;
  docNumber: string;
  issueDate: string;
  expiryDate: string;
  issuingAuthority: string;
  secondaryNumber?: string; // e.g. Visa No, Aadhaar No, Permit No
  riskLevel: RiskLevel;
  status: ScreeningStatus;
  aiScore: number; // e.g. 98.2%
  riskScore: number; // 0-100, e.g. 8
  badgeLabel: string;
  description: string;
  findings: AnomalyFinding[];
  boundingBoxes: BoundingBox[];
  mrzLine1?: string;
  mrzLine2?: string;
  extractedFields: Record<string, { label: string; value: string; match: boolean }>;
  tamperingDetected: boolean;
  tamperHeatmapUrl?: string;
  imageThumbnail: string; // SVG or color badge
  rawImageUrl?: string;
  imageUrl?: string;
  svgContent?: string;
}

export interface ScreeningRecord {
  caseId: string;
  timestamp: string;
  person: {
    fullName: string;
    dob: string;
    nationality: string;
    gender: string;
    passportNumber?: string;
    visaNumber?: string;
    countryOfIssue: string;
    photoUrl?: string;
  };
  document: {
    type: DocumentType;
    typeName: string;
    docNumber: string;
    issueDate: string;
    expiryDate: string;
    issuingAuthority: string;
    fileName?: string;
    fileSize?: string;
    fileUrl?: string;
    previewType: string;
  };
  aiScore: number;
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  status: ScreeningStatus;
  screeningTimeSeconds: number;
  officer: string;
  checkpoint: string;
  findings: AnomalyFinding[];
  pipelineResults: {
    qualityCheck: PipelineStepStatus;
    ocrExtraction: PipelineStepStatus;
    photoVerification: PipelineStepStatus;
    tamperingDetection: PipelineStepStatus;
    mrzValidation: PipelineStepStatus;
    faceMatching: PipelineStepStatus;
    identityConsistency: PipelineStepStatus;
    fraudRiskAnalysis: PipelineStepStatus;
  };
  comparisonData: Array<{
    field: string;
    documentData: string;
    verifiedData: string;
    matches: boolean;
    confidence: number;
  }>;
  riskAssessment?: ExplainableRiskAssessment;
  faceVerificationResult?: FaceVerificationResult;
  officerNotes?: string;
}

export interface SecurityAlert {
  id: string;
  caseId: string;
  timestamp: string;
  severity: 'medium' | 'high' | 'critical';
  title: string;
  personName: string;
  documentType: string;
  checkpoint: string;
  riskScore: number;
  flagReason: string;
}

export type CanonicalDocumentType = 
  | 'PASSPORT'
  | 'VISA'
  | 'NATIONAL_ID'
  | 'DRIVING_LICENSE'
  | 'PERMIT'
  | 'TRAVEL_AUTHORIZATION'
  | 'UNKNOWN';

export interface FirestoreReferenceDocument {
  referenceDocumentId: string;
  documentType: CanonicalDocumentType;
  displayName: string;
  imageUrl: string;
  extractedFields: Record<string, any>;
  extractedText: string;
  normalizedFields: Record<string, string>;
  imageHash: string;
  sourceType: 'SIH_DEMO_DATASET';
  verificationMode: 'DEMO_REFERENCE_DATABASE';
  createdAt: string;
  updatedAt: string;
  storagePath?: string;
  fileSizeBytes?: number;
}

export interface AuditLog {
  logId: string;
  action: string;
  officer: string;
  timestamp: string;
  details: Record<string, any>;
  severity: 'info' | 'warning' | 'critical';
  caseId?: string;
}

export interface ScreeningReportRecord {
  reportId: string;
  caseId: string;
  generatedAt: string;
  officerName: string;
  digitalSignature: string;
  summary: {
    personName: string;
    docNumber: string;
    docType: string;
    aiScore: number;
    riskScore: number;
    riskLevel: RiskLevel;
    status: ScreeningStatus;
    findingsCount: number;
  };
  verificationMode: 'DEMO_REFERENCE_DATABASE';
}

export interface OfficerAuthUser {
  uid: string;
  officerName: string;
  badgeNumber: string;
  checkpointLocation: string;
  role: string;
  isAnonymous: boolean;
  email?: string;
}

export interface VerificationMatchResult {
  matched: boolean;
  matchType: 'REFERENCE_DATABASE_MATCH' | 'NO_MATCH_FOUND' | 'SUSPICIOUS_DISCREPANCY';
  confidence: number;
  referenceRecord?: FirestoreReferenceDocument;
  sourceType: 'DEMO_REFERENCE_DATABASE' | 'AUTHORIZED_GOVERNMENT_API';
  disclaimer: string;
  pipelineResult?: CrossCheckPipelineResult;
  matchingFields: Array<{
    field: string;
    documentData: string;
    referenceData: string;
    matches: boolean;
    confidence: number;
  }>;
}

export interface DocumentInspectionDetails {
  text: string[];
  numbers: string[];
  dates: {
    dob?: string | null;
    issueDate?: string | null;
    expiryDate?: string | null;
    otherDates?: string[];
  };
  headings: string[];
  labels: string[];
  photoRegions: {
    detected: boolean;
    description: string;
    coordinates?: string;
    ghostPhotoDetected?: boolean;
  };
  stamps: {
    detected: boolean;
    count: number;
    description: string;
  };
  seals: {
    detected: boolean;
    description: string;
  };
  qrBarcodeRegions: {
    detected: boolean;
    type?: 'QR_CODE' | 'PDF417' | 'CODE128' | 'NONE';
    description: string;
  };
  mrz: {
    present: boolean;
    line1?: string | null;
    line2?: string | null;
    line3?: string | null;
    checksumValid?: boolean | null;
    raw?: string | null;
  };
  visualLayout: {
    formFactor: 'ID_1' | 'ID_2' | 'ID_3_PASSPORT' | 'LETTER_DOCUMENT' | 'CUSTOM' | 'UNKNOWN';
    description: string;
  };
}

export interface DocumentUnderstandingResult {
  id: string;
  fileName: string;
  fileSize?: string;
  previewUrl?: string;
  sourceType: 'UPLOAD' | 'REFERENCE';
  documentType: CanonicalDocumentType;
  confidence: number; // 0 to 100
  reason: string;
  message?: string;
  inspection: DocumentInspectionDetails;
  extractedFields: Record<string, string>;
  analysisTimestamp: string;
}

export interface DocumentSeparationGroup {
  category: CanonicalDocumentType;
  title: string;
  badgeColor: string;
  documents: DocumentUnderstandingResult[];
}

export interface PassportStructuredFields {
  surname: string | null;
  givenNames: string | null;
  fullName: string | null;
  passportNumber: string | null;
  nationality: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  placeOfBirth: string | null;
  placeOfIssue: string | null;
  dateOfIssue: string | null;
  dateOfExpiry: string | null;
  mrz: string | null;
  issuingAuthority: string | null;
}

export interface VisaStructuredFields {
  visaNumber: string | null;
  name: string | null;
  passportNumber: string | null;
  visaType: string | null;
  placeOfIssue: string | null;
  dateOfIssue: string | null;
  dateOfExpiry: string | null;
  numberOfEntries: string | null;
  entryValidation: string | null;
  stayDuration: string | null;
}

export interface NationalIdStructuredFields {
  name: string | null;
  identityNumber: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  address: string | null;
  issuingAuthority: string | null;
}

export interface DrivingLicenseStructuredFields {
  licenseNumber: string | null;
  name: string | null;
  dateOfBirth: string | null;
  address: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  vehicleClass: string | null;
  issuingAuthority: string | null;
}

export interface PermitStructuredFields {
  permitNumber: string | null;
  applicantName: string | null;
  passportNumber: string | null;
  nationality: string | null;
  dateOfBirth: string | null;
  dateOfIssue: string | null;
  validUntil: string | null;
  area: string | null;
  purpose: string | null;
  issuingAuthority: string | null;
  approvalStatus: string | null;
}

export interface TravelAuthStructuredFields {
  documentNumber: string | null;
  name: string | null;
  passportNumber: string | null;
  nationality: string | null;
  dateOfBirth: string | null;
  dateOfIssue: string | null;
  validUntil: string | null;
  issuingAuthority: string | null;
  approvalStatus: string | null;
}

export interface OcrExtractionResult {
  documentType: CanonicalDocumentType;
  confidence: number;
  extractedText: string;
  fields: Record<string, string | null>;
  normalizedFields: Record<string, string | null>;
  uncertainFields: string[];
  warnings: string[];
  analysisTimestamp: string;
}

export type CrossCheckMatchState = 
  | 'REFERENCE_MATCH'
  | 'PARTIAL_REFERENCE_MATCH'
  | 'NO_REFERENCE_MATCH'
  | 'UNABLE_TO_VERIFY';

export interface CrossCheckFieldResult {
  fieldKey: string;
  fieldLabel: string;
  uploadedValue: string | null;
  referenceValue: string | null;
  matched: boolean;
  confidence: number;
  anomalyReason?: string;
}

export interface CrossCheckVisualConsistency {
  overallScore: number; // 0 to 100
  photoTamperingDetected: boolean;
  mrzValid: boolean;
  securityPatternMatch: boolean;
  fontAlignmentValid: boolean;
  notes: string[];
}

export interface CrossCheckPipelineResult {
  workflowStep: number; // 1 to 12
  documentType: CanonicalDocumentType;
  referenceStatusTitle: 'Demo Reference Match';
  datasetSource: string; // 'Matched against controlled Firebase reference dataset'
  disclaimer: string;
  matchState: CrossCheckMatchState;
  matchScore: number; // e.g. 94%, 61%
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  matchedFields: string[]; // e.g. ["Passport Number", "Name", "Date of Birth", "Nationality", "Gender"]
  mismatchedFields: string[]; // e.g. ["Name", "Date of Birth"]
  fieldResults: CrossCheckFieldResult[];
  visualConsistency: CrossCheckVisualConsistency;
  matchedReferenceRecord: FirestoreReferenceDocument | null;
  recommendedAction: 'PROCEED' | 'MANUAL_OFFICER_REVIEW' | 'FLAG_ANOMALY' | 'REJECT';
  executionLogs: string[];
  analyzedAt: string;
}

// ---------------------------------------------------------------------------
// Demo Tampering Detection Types (Photo, Text, Font, Alignment, Boundaries, Compression, Stamp/Seal, Suspicious Regions, Metadata)
// ---------------------------------------------------------------------------

export type TamperingStatus = 
  | 'POTENTIAL_TAMPERING_DETECTED'
  | 'NO_TAMPERING_DETECTED'
  | 'UNABLE_TO_DETERMINE';

export type TamperingIndicatorCategory =
  | 'PHOTO_CONSISTENCY'
  | 'TEXT_CONSISTENCY'
  | 'FONT_CONSISTENCY'
  | 'ALIGNMENT'
  | 'IMAGE_BOUNDARIES'
  | 'COMPRESSION_ARTIFACTS'
  | 'STAMP_SEAL_CONSISTENCY'
  | 'SUSPICIOUS_REGIONS'
  | 'METADATA';

export interface TamperingIndicator {
  id: string;
  category: TamperingIndicatorCategory;
  name: string; // e.g. "Photo Region Inconsistency", "Text Alignment Difference", "Possible Edited Region", "Document Structure Consistent"
  status: 'pass' | 'warning' | 'flagged' | 'inconclusive';
  severity: 'low' | 'medium' | 'high' | 'info';
  description: string;
  evidence: string;
  referenceStandard?: string;
  observedAnomaly?: string;
}

export interface SuspiciousRegion {
  id: string;
  label: string; // e.g. "Photo Region", "Surname Field", "Embossed Seal"
  x: number; // 0 - 100 percentage
  y: number; // 0 - 100 percentage
  width: number; // 0 - 100 percentage
  height: number; // 0 - 100 percentage
  anomalyType: string;
  severity: 'warning' | 'high' | 'critical';
  description: string;
  referenceComparisonNote: string;
}

export interface TamperingAnalysisResult {
  tamperingStatus: TamperingStatus;
  tamperingConfidence: number; // 0 - 100
  headline: string; // e.g. "Potential tampering detected. Manual verification is recommended." or "Unable to determine"
  indicators: TamperingIndicator[];
  suspiciousRegions: SuspiciousRegion[];
  limitations: string[];
  analyzedAt: string;
  hasReferenceMatch: boolean;
  referenceDocumentId?: string;
  referenceDocumentName?: string;
  referenceDocumentImageUrl?: string;
  uploadedDocumentImageUrl?: string;
  analyzedDocumentType?: string;
}

// ==========================================
// Face Verification Module Types
// ==========================================

export type FaceVerificationOutcome = 
  | 'MATCH' 
  | 'POSSIBLE_MATCH' 
  | 'LOW_CONFIDENCE' 
  | 'NO_MATCH' 
  | 'UNABLE_TO_VERIFY';

export interface FaceDetectionRegion {
  detected: boolean;
  box?: {
    x: number; // percentage 0 - 100
    y: number; // percentage 0 - 100
    width: number; // percentage 0 - 100
    height: number; // percentage 0 - 100
  };
  confidence: number; // 0 - 100
  qualityScore: number; // 0 - 100
  qualityIssues?: string[];
  landmarksDetected: boolean;
  cropDataUrl?: string;
  sourceLabel: string;
}

export interface FaceFeatureComparison {
  featureName: string;
  similarityScore: number; // 0 - 100
  status: 'congruent' | 'divergent' | 'inconclusive';
  note: string;
}

export interface FaceVerificationResult {
  outcome: FaceVerificationOutcome;
  confidence: number; // 0 - 100
  explanation: string;
  documentFace: FaceDetectionRegion;
  probeFace: FaceDetectionRegion;
  featureComparisons: FaceFeatureComparison[];
  isDemoMode: boolean; // true ("Demo Face Verification")
  privacyNotice: string;
  evaluatedAt: string;
}




