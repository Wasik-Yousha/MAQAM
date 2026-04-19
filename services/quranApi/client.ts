/**
 * Authenticated HTTP client for Quran.Foundation Content APIs
 * 
 * Attaches required x-auth-token and x-client-id headers.
 * Auto-retries once on 401 with a fresh token.
 */

import { getQfConfig, QF_CONTENT_API_PATH } from './config';
import { getAccessToken, clearTokenCache } from './auth';

interface RequestOptions {
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Make an authenticated GET request to the Content API
 * @param path — API path after /content/api/v4 (e.g., '/chapters')
 */
export async function apiGet<T>(path: string, options?: RequestOptions): Promise<T> {
  const config = getQfConfig();
  
  // Build URL with query params
  const url = new URL(`${config.apiBaseUrl}${QF_CONTENT_API_PATH}${path}`);
  if (options?.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const makeRequest = async (retry = false): Promise<T> => {
    const token = await getAccessToken();

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-auth-token': token,
        'x-client-id': config.clientId,
        'Accept': 'application/json',
      },
    });

    // Auto-retry on 401 with fresh token
    if (response.status === 401 && !retry) {
      clearTokenCache();
      return makeRequest(true);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[QuranAPI] ${path} failed:`, response.status, errorText.substring(0, 200));
      throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
  };

  return makeRequest();
}

/**
 * Make an authenticated POST request
 */
export async function apiPost<T>(path: string, body?: any, options?: RequestOptions): Promise<T> {
  const config = getQfConfig();
  
  const url = new URL(`${config.apiBaseUrl}${QF_CONTENT_API_PATH}${path}`);
  if (options?.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const makeRequest = async (retry = false): Promise<T> => {
    const token = await getAccessToken();

    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: {
        'x-auth-token': token,
        'x-client-id': config.clientId,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      ...((body) ? { body: JSON.stringify(body) } : {})
    };

    const response = await fetch(url.toString(), fetchOptions);

    if (response.status === 401 && !retry) {
      clearTokenCache();
      return makeRequest(true);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[QuranAPI] POST ${path} failed:`, response.status, errorText.substring(0, 200));
      throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
  };

  return makeRequest();
}
