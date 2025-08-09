/**
 * Configuration for AI SDK integration
 */

// Feature flag to enable/disable AI SDK
export const AI_SDK_ENABLED = true; // Set to true to use real AI, false for mock

// API Base URL - Your Vercel deployment URL
// For iOS simulator, use your machine's IP instead of localhost
const getLocalAPIUrl = () => {
  // iOS simulator needs the machine's IP address
  if (__DEV__) {
    // Check if we're in a web browser
    if (typeof window !== 'undefined') {
      // In web browser, always use localhost
      return 'http://localhost:3000';
    }
    // In React Native (iOS/Android), use machine IP
    return 'http://10.0.1.116:3000';
  }
  return 'https://multimodal-api-sandy.vercel.app';
};

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || getLocalAPIUrl();


// Helper to generate full API URLs
export function apiUrl(path: string): string {
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const pathWithSlash = path.startsWith('/') ? path : `/${path}`;
  return `${base}${pathWithSlash}`;
}

// Provider configuration
export const DEFAULT_PROVIDER = 'openai';
export const DEFAULT_MODEL = 'gpt-4o-mini'; // Using mini for cost-effective testing

// Available providers and their models
export const PROVIDERS = {
  openai: {
    name: 'OpenAI',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
  },
  anthropic: {
    name: 'Anthropic',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229'],
  },
  google: {
    name: 'Google',
    models: ['gemini-2.0-flash-exp', 'gemini-1.5-pro'],
  },
} as const;

export type Provider = keyof typeof PROVIDERS;