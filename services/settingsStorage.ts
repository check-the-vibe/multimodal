import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AgentSettings } from '../components/modality/agent/AgentSettingsPanel';
import type { AgentMode } from '../components/modality/agent/AgentModeSelector';
import type { AgentModeSettings } from '../components/modality/agent/AgentModeSettings';

const SETTINGS_KEY = '@multimodal_settings';

export interface AppSettings {
  agent: AgentSettings; // Legacy format - kept for backward compatibility
  agentMode: {
    selectedMode: AgentMode;
    settings: AgentModeSettings;
  };
  ui: {
    theme: 'light' | 'dark';
    fontSize: 'small' | 'medium' | 'large';
    showHints: boolean;
  };
  api: {
    customApiKey?: string;
    timeout: number;
    retryAttempts: number;
  };
}

const DEFAULT_SETTINGS: AppSettings = {
  agent: {
    provider: 'openai',
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 2000,
    systemPrompt: 'You are a helpful assistant.',
  },
  agentMode: {
    selectedMode: 'text',
    settings: {
      mode: 'text',
      model: 'gpt-4o-mini',
      temperature: 0.7,
      maxTokens: 2000,
      systemPrompt: 'You are a helpful assistant.',
      streamResponse: true,
    },
  },
  ui: {
    theme: 'light',
    fontSize: 'medium',
    showHints: true,
  },
  api: {
    timeout: 30000,
    retryAttempts: 3,
  },
};

export const loadSettings = async (): Promise<AppSettings> => {
  try {
    const jsonValue = await AsyncStorage.getItem(SETTINGS_KEY);
    if (jsonValue != null) {
      const parsed = JSON.parse(jsonValue);
      // Merge with defaults to ensure all fields exist
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        agent: { ...DEFAULT_SETTINGS.agent, ...parsed.agent },
        agentMode: { 
          ...DEFAULT_SETTINGS.agentMode, 
          ...parsed.agentMode,
          settings: { 
            ...DEFAULT_SETTINGS.agentMode.settings, 
            ...(parsed.agentMode?.settings || {})
          }
        },
        ui: { ...DEFAULT_SETTINGS.ui, ...parsed.ui },
        api: { ...DEFAULT_SETTINGS.api, ...parsed.api },
      };
    }
  } catch (e) {
    console.error('[Settings] Error loading settings:', e);
  }
  return DEFAULT_SETTINGS;
};

export const saveSettings = async (settings: AppSettings): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(settings);
    await AsyncStorage.setItem(SETTINGS_KEY, jsonValue);
  } catch (e) {
    console.error('[Settings] Error saving settings:', e);
  }
};

export const resetSettings = async (): Promise<AppSettings> => {
  try {
    await AsyncStorage.removeItem(SETTINGS_KEY);
  } catch (e) {
    console.error('[Settings] Error resetting settings:', e);
  }
  return DEFAULT_SETTINGS;
};

// Utility function to create default settings for a specific mode
export const getDefaultSettingsForMode = (mode: AgentMode): AgentModeSettings => {
  const baseSettings = {
    mode,
    temperature: 0.7,
    maxTokens: 2000,
    systemPrompt: getDefaultSystemPrompt(mode),
  };

  switch (mode) {
    case 'text':
      return {
        ...baseSettings,
        mode: 'text',
        model: 'gpt-4o-mini',
        streamResponse: true,
      };
    case 'vision':
      return {
        ...baseSettings,
        mode: 'vision',
        model: 'gpt-4o',
        maxImages: 3,
        imageDetail: 'auto',
      };
    case 'create':
      return {
        ...baseSettings,
        mode: 'create',
        model: 'dall-e-3',
        size: '1024x1024',
        quality: 'standard',
        style: 'vivid',
        numberOfImages: 1,
      };
    case 'transcribe':
      return {
        ...baseSettings,
        mode: 'transcribe',
        model: 'whisper-1',
        responseFormat: 'json',
      };
    case 'speak':
      return {
        ...baseSettings,
        mode: 'speak',
        model: 'tts-1',
        voice: 'alloy',
        responseFormat: 'mp3',
        speed: 1.0,
      };
    case 'code':
      return {
        ...baseSettings,
        mode: 'code',
        model: 'gpt-4o',
        language: 'typescript',
        includeComments: true,
        codeStyle: 'production',
      };
    default:
      return baseSettings as AgentModeSettings;
  }
};

function getDefaultSystemPrompt(mode: AgentMode): string {
  switch (mode) {
    case 'text':
      return 'You are a helpful assistant.';
    case 'vision':
      return 'You are an expert at analyzing images and describing what you see in detail.';
    case 'create':
      return 'You are an expert at creating detailed, vivid image generation prompts.';
    case 'transcribe':
      return 'You are an expert at accurately transcribing audio content.';
    case 'speak':
      return 'You are an expert at converting text to natural-sounding speech.';
    case 'code':
      return 'You are an expert programmer and coding assistant.';
    default:
      return 'You are a helpful assistant.';
  }
}