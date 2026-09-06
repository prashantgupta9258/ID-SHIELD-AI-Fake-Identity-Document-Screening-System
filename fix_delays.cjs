const fs = require('fs');
const viewPath = './src/views/NewScreeningView.tsx';
let viewContent = fs.readFileSync(viewPath, 'utf8');

viewContent = viewContent.replace(
  /const steps = \[[\s\S]*?\];/m,
  `const steps = [
      { key: 'qualityCheck', label: 'Document Quality Check', delay: 100 },
      { key: 'ocrExtraction', label: 'OCR & Data Extraction', delay: 250 },
      { key: 'photoVerification', label: 'Photo Verification & Ghost Inspection', delay: 400 },
      { key: 'tamperingDetection', label: 'Document Tampering & ELA Analysis', delay: 550 },
      { key: 'mrzValidation', label: 'MRZ Checksum & Cryptographic Validation', delay: 700 },
      { key: 'faceMatching', label: 'Biometric Face Matching (ICAO 9303)', delay: 850 },
      { key: 'identityConsistency', label: 'Cross-Field Identity Consistency', delay: 1000 },
      { key: 'fraudRiskAnalysis', label: 'Comprehensive Fraud Risk Scoring', delay: 1150 },
    ];`
);

viewContent = viewContent.replace(
  /\}, 350\);/g,
  '}, 150);'
);

fs.writeFileSync(viewPath, viewContent, 'utf8');
