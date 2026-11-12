import { GoogleGenAI } from '@google/genai';

export interface GeminiCallOptions {
  model?: string;
  preferredModels?: string[];
  contents: any;
  config?: any;
  systemInstruction?: string;
  maxRetriesPerModel?: number;
}

/**
 * Standardized prioritized Gemini models.
 * 'gemini-3.1-flash-lite' is prioritized first for highest throughput, lowest latency,
 * and maximum resilience against 503 high-load capacity spikes.
 */
export const DEFAULT_GEMINI_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
  'gemini-flash-latest',
];

/**
 * Executes a Gemini request with automated exponential backoff, jitter,
 * and seamless fallback across resilient model tiers upon encountering 503 or 429.
 */
export async function executeGeminiWithRetry(
  ai: GoogleGenAI,
  options: GeminiCallOptions
): Promise<{ text: string; modelUsed: string } | null> {
  const models = options.preferredModels && options.preferredModels.length > 0 
    ? options.preferredModels 
    : (options.model ? [options.model, ...DEFAULT_GEMINI_MODELS.filter(m => m !== options.model)] : DEFAULT_GEMINI_MODELS);
    
  const maxRetries = options.maxRetriesPerModel ?? 2;

  for (const modelName of models) {
    let attempt = 0;
    while (attempt <= maxRetries) {
      try {
        const config = { ...(options.config || {}) };
        if (options.systemInstruction && !config.systemInstruction) {
          config.systemInstruction = options.systemInstruction;
        }

        const response = await ai.models.generateContent({
          model: modelName,
          contents: options.contents,
          config,
        });

        if (response && response.text) {
          return { text: response.text, modelUsed: modelName };
        }
        break; // If empty response without error, step to next model
      } catch (err: any) {
        attempt++;
        const status = err?.status || err?.error?.code || (typeof err?.message === 'string' && err.message.includes('503') ? 503 : (err?.message?.includes('429') ? 429 : null));
        const isTransient = status === 503 || status === 429 || status === 500 || err?.code === 'ECONNRESET' || err?.code === 'ETIMEDOUT';

        if (isTransient && attempt <= maxRetries) {
          const delay = (600 * Math.pow(2, attempt - 1)) + Math.floor(Math.random() * 400);
          console.info(`Model ${modelName} returned status ${status}. Retrying attempt ${attempt}/${maxRetries} in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        // Move cleanly to the next fallback model without throwing noisy unhandled errors
        console.info(`Model ${modelName} unavailable (status: ${status || 'unknown'}). Falling over to next model tier...`);
        break;
      }
    }
  }

  return null;
}
