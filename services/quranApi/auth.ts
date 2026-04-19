/**
 * OAuth2 Token Manager for Quran.Foundation Content APIs
 * 
 * Uses client_credentials grant with "content" scope.
 * Caches token in memory and auto-refreshes before expiry.
 */

import { getQfConfig } from './config';

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * Get a valid access token, refreshing if needed.
 * Uses client_credentials grant — no user interaction required.
 */
export async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedToken;
  }

  const config = getQfConfig();
  const tokenUrl = `${config.authBaseUrl}/oauth2/token`;

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    scope: 'content',
  });

  const encodedCreds = typeof Buffer !== 'undefined'
    ? Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')
    : btoa(`${config.clientId}:${config.clientSecret}`);

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${encodedCreds}`
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[QuranAPI Auth] Token request failed:', response.status);
    throw new Error(`Failed to obtain access token: ${response.status}`);
  }

  const data: TokenResponse = await response.json();
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + data.expires_in * 1000;

  return cachedToken;
}

/**
 * Clear cached token (useful for forcing re-auth on 401)
 */
export function clearTokenCache(): void {
  cachedToken = null;
  tokenExpiresAt = 0;
}
