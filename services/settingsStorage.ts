import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AgentSettings } from '../components/modality/agent/AgentSettingsPanel';

const SETTINGS_KEY = '@multimodal_settings';

export interface AppSettings {
  agent: AgentSettings;
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