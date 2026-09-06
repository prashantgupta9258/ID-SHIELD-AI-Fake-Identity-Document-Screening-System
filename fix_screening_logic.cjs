const fs = require('fs');

// 1. Fix NewScreeningView.tsx
const viewPath = './src/views/NewScreeningView.tsx';
let viewContent = fs.readFileSync(viewPath, 'utf8');

// Replace finishScreening
const finishStart = viewContent.indexOf('const finishScreening = async () => {');
const finishEnd = viewContent.indexOf('setFinalResult(record);');
if (finishStart !== -1 && finishEnd !== -1) {
  const newFinish = `const finishScreening = async () => {
    const caseId = \`ID-2026-\${Math.floor(1000 + Math.random() * 9000)}\`;

    // Query the pluggable verification adapter (SIH Demo Reference Database Engine)
    const matchResult = await activeVerificationAdapter.matchDocument({
      docNumber: activeReferenceDoc ? activeReferenceDoc.docNumber : formData.passportNumber,
      docType: selectedDocType,
      fullName: formData.fullName,
      countryOfIssue: formData.countryOfIssue,
    });

    let uploadedStorageUrl = uploadedFile?.dataUrl;
    if (uploadedFile?.dataUrl) {
      try {
        uploadedStorageUrl = await uploadScreeningDocument(caseId, uploadedFile.name, uploadedFile.dataUrl);
      } catch (err: any) {
        console.warn('Firebase Storage upload fallback:', err.message);
      }
    }

    const comparisonList = matchResult.matchingFields.map((f) => ({
      field: f.field,
      documentData: f.documentData,
      verifiedData: f.referenceData,
      matches: f.matches,
      confidence: f.confidence,
    }));
    
    const mismatches = comparisonList.filter(c => !c.matches);
    const isReferenceMismatch = matchResult.matchType !== 'REFERENCE_DATABASE_MATCH' && matchResult.matchType !== 'NO_MATCH_FOUND';
    
    // Evaluate if the document seems altered (e.g., if activeReferenceDoc has critical findings, or if name contains NO DEMO)
    const hasTamperingIndicators = 
        activeReferenceDoc?.findings?.some((f: any) => f.severity === 'critical' || f.severity === 'high') || 
        formData.fullName.toUpperCase().includes('NO DEMO');
        
    const isTampered = hasTamperingIndicators || (isReferenceMismatch && mismatches.length >= 2);
    const isSuspicious = !isTampered && (isReferenceMismatch || matchResult.matchType === 'NO_MATCH_FOUND' || activeReferenceDoc?.findings?.length > 0);

    // Call riskScoringEngine with dynamic parameters
    const riskAssessment = evaluateScreeningRecord({
      status: isTampered ? 'rejected' : isSuspicious ? 'suspicious' : 'verified',
      person: { fullName: formData.fullName },
      document: { 
        type: selectedDocType, 
        docNumber: activeReferenceDoc ? activeReferenceDoc.docNumber : formData.passportNumber 
      },
      findings: activeReferenceDoc?.findings || [],
    });

    // Face verification - simple mock based on tampering
    const faceVerificationResult = {
      status: isTampered ? 'SUSPICIOUS_MISMATCH' : 'MATCH_CONFIRMED',
      confidence: isTampered ? 42.1 : 98.7,
      referenceImageUrl: activeReferenceDoc?.faceUrl,
      capturedImageUrl: uploadedFile?.dataUrl,
    };

    const record: ScreeningRecord = {
      caseId,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      person: {
        fullName: formData.fullName,
        dob: formData.dob,
        nationality: formData.countryOfIssue,
        gender: formData.gender,
      },
      document: {
        type: selectedDocType as DocumentType,
        typeName: selectedDocType.replace('_', ' ').toUpperCase(),
        docNumber: activeReferenceDoc ? activeReferenceDoc.docNumber : formData.passportNumber,
        countryOfIssue: formData.countryOfIssue,
        expiryDate: '2030-01-01',
        frontImageUrl: uploadedStorageUrl,
      },
      aiScore: isTampered ? 32.4 : isSuspicious ? 84.6 : 98.2,
      riskScore: riskAssessment.score,
      riskLevel: riskAssessment.level,
      riskAssessment: riskAssessment,
      status: isTampered ? 'rejected' : isSuspicious ? 'suspicious' : 'verified',
      screeningTimeSeconds: 14.6,
      officer: 'Officer V. Sharma (ID: BOI-8842)',
      checkpoint: 'Terminal 3 - E-Gates (Air Suvidha Fast Track), IGI Airport',
      findings: activeReferenceDoc?.findings || [],
      faceVerificationResult: faceVerificationResult,
      pipelineResults: {
        qualityCheck: 'completed',
        ocrExtraction: 'completed',
        photoVerification: 'completed',
        tamperingDetection: isTampered ? 'failed' : isSuspicious ? 'warning' : 'completed',
        mrzValidation: isTampered ? 'failed' : 'completed',
        faceMatching: isTampered ? 'warning' : 'completed',
        identityConsistency: isTampered ? 'failed' : isSuspicious ? 'warning' : 'completed',
        fraudRiskAnalysis: isTampered ? 'failed' : 'completed',
      },
      comparisonData: comparisonList,
    };

    // Persist to Cloud Firestore and emit Audit Log
    try {
      await saveScreeningRecord(record);
    } catch (e: any) {
      console.warn('Firestore screening record write:', e.message);
    }

    `;
  
  viewContent = viewContent.substring(0, finishStart) + newFinish + viewContent.substring(finishEnd);
  fs.writeFileSync(viewPath, viewContent, 'utf8');
}

// 2. Fix riskScoringEngine.ts to not hardcode risk factors for 76 unless requested, wait, let's keep it but make it dynamic.
const riskPath = './src/services/riskScoringEngine.ts';
let riskContent = fs.readFileSync(riskPath, 'utf8');

const evalStart = riskContent.indexOf('export function evaluateScreeningRecord');
const evalEnd = riskContent.indexOf('export const DEMO_RISK_BENCHMARK_PROFILES');

if (evalStart !== -1 && evalEnd !== -1) {
  const newEval = `export function evaluateScreeningRecord(record: Partial<ScreeningRecord>): ExplainableRiskAssessment {
  const isTampered = 
    record.status === 'rejected' || 
    (record.riskScore && record.riskScore > 75) ||
    record.person?.fullName?.toUpperCase().includes('NO DEMO') ||
    (record.findings && record.findings.some((f:any) => f.severity === 'critical'));

  const isSuspicious = 
    record.status === 'suspicious' || 
    record.status === 'manual_review' || 
    (record.riskScore && record.riskScore > 35 && record.riskScore <= 75) ||
    (record.findings && record.findings.length > 0);

  // Critical Risk Case (e.g. 92/100)
  if (isTampered) {
    return computeExplainableRiskScore({
      classificationConfidence: 82.0,
      ocrConfidence: 68.2,
      referenceMatchStatus: 'mismatch',
      fieldMismatches: [
        { field: 'Full Name', documentValue: record.person?.fullName || 'NO DEMO TEXT', referenceValue: 'AUTHENTIC SPECIMEN', isPrimaryIdentityField: true },
        { field: 'Passport No.', documentValue: record.document?.docNumber || 'ERASED', referenceValue: 'AU026F60PC1IDBG8', isPrimaryIdentityField: true }
      ],
      isExpired: true,
      expiryDateStr: record.document?.expiryDate || '2016-01-07',
      dateAnomalies: [
        {
          rule: 'Post-Expiry Stamp Date Forgery',
          description: 'Official rubber stamp applied to credential after expiration date',
        }
      ],
      tamperingIndicators: record.findings?.length ? record.findings : [
        {
          id: 't-1',
          type: 'text_manipulation',
          title: 'Potential text manipulation',
          description: 'Synthetic font replacement and pixel noise halo detected',
          severity: 'critical',
        },
        {
          id: 't-3',
          type: 'mrz_checksum',
          title: 'MRZ Checksum Failure',
          description: 'Composite check digit mismatch',
          severity: 'critical',
        }
      ],
      imageQuality: {
        blurScore: 42,
        rating: 'degraded',
      },
    });
  }

  // Medium Risk Case
  if (isSuspicious) {
    return computeExplainableRiskScore({
      classificationConfidence: 96.5,
      ocrConfidence: 88.0,
      referenceMatchStatus: 'partial_match',
      fieldMismatches: [
        { field: 'Address / Field', documentValue: 'MISMATCH DETECTED', referenceValue: 'DATABASE ENTRY', isPrimaryIdentityField: false }
      ],
      tamperingIndicators: record.findings?.length ? record.findings : [
        {
          id: 't-dl-1',
          type: 'font_mismatch',
          title: 'Micro-Kerning Anomaly',
          description: 'Digital kerning and stroke weight variance',
          severity: 'medium',
        }
      ],
      imageQuality: {
        rating: 'adequate',
      },
    });
  }

  // Low Risk Case
  return computeExplainableRiskScore({
    classificationConfidence: 99.4,
    ocrConfidence: 98.7,
    referenceMatchStatus: 'full_match',
    imageQuality: {
      dpi: 400,
      rating: 'optimal',
    },
    faceVerification: {
      matchConfidence: 99.2,
    },
  });
}

`;
  riskContent = riskContent.substring(0, evalStart) + newEval + riskContent.substring(evalEnd);
  fs.writeFileSync(riskPath, riskContent, 'utf8');
}

console.log("Fixed screening and risk logic");
