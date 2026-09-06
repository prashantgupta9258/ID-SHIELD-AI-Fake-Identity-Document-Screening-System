import { 
  CanonicalDocumentType, 
  OcrExtractionResult 
} from '../types';
import { 
  EXPECTED_FIELDS_BY_TYPE, 
  fallbackOcrExtraction,
  OcrExtractionPayload
} from '../../server/ocrFieldExtractor';

export async function extractDocumentStructuredFields(
  payload: OcrExtractionPayload
): Promise<OcrExtractionResult> {
  try {
    const response = await fetch('/api/ai/extract-fields', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data.success && data.result) {
      return data.result as OcrExtractionResult;
    }
    throw new Error(data.error || 'Failed to extract structured fields');
  } catch (err: any) {
    console.warn('Network call to /api/ai/extract-fields failed, executing deterministic client fallback:', err.message);
    return fallbackOcrExtraction(payload);
  }
}

export { EXPECTED_FIELDS_BY_TYPE };
