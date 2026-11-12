/**
 * API configuration helper for flexible deployment environments.
 * 
 * In standard full-stack deployments (Node.js, Docker, Vercel, Render),
 * API requests go to relative '/api/...'.
 * 
 * In static GitHub Pages deployments, you can either:
 * 1. Connect a deployed backend URL via VITE_API_BASE_URL
 * 2. Rely on the intelligent built-in client-side fallback engines.
 */
export function getApiUrl(endpoint: string): string {
  const customBase = ((import.meta as any).env?.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  if (customBase) {
    return `${customBase}${cleanEndpoint}`;
  }

  return cleanEndpoint;
}

export const IS_PRODUCTION_STATIC = 
  typeof window !== 'undefined' && 
  (window.location.hostname.endsWith('github.io') || window.location.hostname.includes('pages.dev'));
