/**
 * Configuration for AI SDK integration
 */
import { Platform } from 'react-native';

// Feature flag to enable/disable AI SDK
export const AI_SDK_ENABLED = true; // Set to true to use real AI, false for mock

// API Key for authentication - IMPORTANT: Use environment variable in production!
export const MULTIMODAL_API_KEY = process.env.EXPO_PUBLIC_MULTIMODAL_API_KEY || 'mm_469eade2349b909e92b789cf1533dc3592f08480d9f6a0794ba09b94ac29669d';

// API Base URL - Your Vercel deployment URL
const getLocalAPIUrl = () => {
  // Only use localhost for web browser in development
  if (__DEV__) {
    // Use Platform API for accurate detection
    const isWeb = Platform.OS === 'web';
    
    if (isWeb) {
      console.log('[Config] Using localhost for web browser development');
      return 'http://localhost:3000';
    } else {
      // React Native (iOS/Android) - use Vercel URL
      console.log('[Config] Using Vercel URL for mobile development (Platform:', Platform.OS, ')');
      return 'https://multimodal-teal.vercel.app';
    }
  }
  
  // Production always uses Vercel
  console.log('[Config] Using production Vercel URL');
  return 'https://multimodal-teal.vercel.app';
};

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || getLocalAPIUrl();

// Debug logging
console.log('[Config] Final API_BASE_URL:', API_BASE_URL);
console.log('[Config] Platform.OS:', Platform.OS);
console.log('[Config] Dev mode:', __DEV__ ? 'Yes' : 'No');


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