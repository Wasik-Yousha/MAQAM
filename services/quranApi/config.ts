/**
 * Quran.Foundation API Configuration
 * 
 * This is a CONFIDENTIAL client integration — client_secret is used
 * server-side for client_credentials grant. In a React Native context,
 * these are bundled into the app binary (acceptable for hackathon,
 * but in production should be proxied through a backend).
 */

type QfEnv = 'prelive' | 'production';

interface QfConfig {
  env: QfEnv;
  clientId: string;
  clientSecret: string;
  authBaseUrl: string;
  apiBaseUrl: string;
}

const CONFIGS: Record<QfEnv, Omit<QfConfig, 'env'>> = {
  prelive: {
    clientId: '4506d018-aa0c-4629-b4ef-56ad069ed85f',
    clientSecret: 'Hg~hvinZdZD2rSkvAufixGItWi',
    authBaseUrl: 'https://prelive-oauth2.quran.foundation',
    apiBaseUrl: 'https://apis-prelive.quran.foundation',
  },
  production: {
    clientId: 'a38d1692-e85f-4a64-a3d8-2f8c19ad5c0e',
    clientSecret: 'rFvOD~6uON-u2V6xtgKhVjwJck',
    authBaseUrl: 'https://oauth2.quran.foundation',
    apiBaseUrl: 'https://apis.quran.foundation',
  },
};

// Default to production — switch to 'prelive' for testing
const CURRENT_ENV: QfEnv = 'production';

export function getQfConfig(): QfConfig {
  const config = CONFIGS[CURRENT_ENV];
  if (!config.clientId) {
    throw new Error(
      'Missing Quran Foundation API credentials. Request access: https://api-docs.quran.foundation/request-access'
    );
  }
  return { env: CURRENT_ENV, ...config };
}

export const QF_CONTENT_API_PATH = '/content/api/v4';
