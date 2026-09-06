const fs = require('fs');
const content = fs.readFileSync('server/ocrFieldExtractor.ts', 'utf8');

const functionStart = content.indexOf('export function fallbackOcrExtraction(');
const functionEnd = content.indexOf('// ================= GEMINI MULTIMODAL OCR EXTRACTION =================');

if (functionStart !== -1 && functionEnd !== -1) {
  const newFunction = `export function fallbackOcrExtraction(payload: OcrExtractionPayload): OcrExtractionResult {
  const text = (payload.textContext || '' + ' ' + (payload.fileName || '')).toUpperCase();
  const docType: CanonicalDocumentType = payload.documentType || detectDocTypeFromText(text);

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
    uncertainFields,
    warnings,
  };
}

`;

  const newContent = content.substring(0, functionStart) + newFunction + content.substring(functionEnd);
  fs.writeFileSync('server/ocrFieldExtractor.ts', newContent);
  console.log('Fixed!');
} else {
  console.log('Indices not found', functionStart, functionEnd);
}
