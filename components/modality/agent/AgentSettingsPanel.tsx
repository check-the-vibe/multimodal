import React from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Pressable } from 'react-native';
import Slider from '@react-native-community/slider';

export type AgentSettings = {
  provider: 'openai' | 'anthropic' | 'google';
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
};

export type AgentSettingsPanelProps = {
  settings: AgentSettings;
  onSettingsChange: (settings: AgentSettings) => void;
};

const MODEL_OPTIONS = {
  openai: [
    { label: 'GPT-4o', value: 'gpt-4o' },
    { label: 'GPT-4o mini', value: 'gpt-4o-mini' },
    { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
    { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
  ],
  anthropic: [
    { label: 'Claude 3.5 Sonnet', value: 'claude-3-5-sonnet-20241022' },
    { label: 'Claude 3.5 Haiku', value: 'claude-3-5-haiku-20241022' },
    { label: 'Claude 3 Opus', value: 'claude-3-opus-20240229' },
  ],
  google: [
    { label: 'Gemini 1.5 Pro', value: 'gemini-1.5-pro' },
    { label: 'Gemini 1.5 Flash', value: 'gemini-1.5-flash' },
    { label: 'Gemini 2.0 Flash', value: 'gemini-2.0-flash-exp' },
  ],
};

export default function AgentSettingsPanel({ settings, onSettingsChange }: AgentSettingsPanelProps) {
  const updateSetting = <K extends keyof AgentSettings>(key: K, value: AgentSettings[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const handleProviderChange = (provider: AgentSettings['provider']) => {
    const defaultModel = MODEL_OPTIONS[provider][0].value;
    onSettingsChange({ ...settings, provider, model: defaultModel });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Provider</Text>
        <View style={styles.providerButtons}>
          {(['openai', 'anthropic', 'google'] as const).map((provider) => (
            <Pressable
              key={provider}
              style={[
                styles.providerButton,
                settings.provider === provider && styles.providerButtonActive,
              ]}
              onPress={() => handleProviderChange(provider)}
            >
              <Text
                style={[
                  styles.providerButtonText,
                  settings.provider === provider && styles.providerButtonTextActive,
                ]}
              >
                {provider === 'openai' ? 'OpenAI' : provider === 'anthropic' ? 'Anthropic' : 'Google'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Model</Text>
        <View style={styles.modelButtons}>
          {MODEL_OPTIONS[settings.provider].map((option) => (
            <Pressable
              key={option.value}
              style={[
                styles.modelButton,
                settings.model === option.value && styles.modelButtonActive,
              ]}
              onPress={() => updateSetting('model', option.value)}
            >
              <Text
                style={[
                  styles.modelButtonText,
                  settings.model === option.value && styles.modelButtonTextActive,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sliderHeader}>
          <Text style={styles.sectionTitle}>Temperature</Text>
          <Text style={styles.sliderValue}>{settings.temperature.toFixed(2)}</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={2}
          value={settings.temperature}
          onValueChange={(value) => updateSetting('temperature', value)}
          minimumTrackTintColor="#111827"
          maximumTrackTintColor="#d1d5db"
          thumbTintColor="#111827"
        />
        <Text style={styles.hint}>Controls randomness: 0 = focused, 2 = creative</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sliderHeader}>
          <Text style={styles.sectionTitle}>Max Tokens</Text>
          <Text style={styles.sliderValue}>{settings.maxTokens}</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={100}
          maximumValue={4000}
          step={100}
          value={settings.maxTokens}
          onValueChange={(value) => updateSetting('maxTokens', value)}
          minimumTrackTintColor="#111827"
          maximumTrackTintColor="#d1d5db"
          thumbTintColor="#111827"
        />
        <Text style={styles.hint}>Maximum response length</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Prompt</Text>
        <TextInput
          style={styles.textInput}
          value={settings.systemPrompt}
          onChangeText={(text) => updateSetting('systemPrompt', text)}
          placeholder="You are a helpful assistant..."
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        <Text style={styles.hint}>Instructions for the AI's behavior</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  providerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  providerButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  providerButtonActive: {
    backgroundColor: '#111827',
  },
  providerButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  providerButtonTextActive: {
    color: '#ffffff',
  },
  modelButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modelButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
  },
  modelButtonActive: {
    backgroundColor: '#111827',
  },
  modelButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#111827',
  },
  modelButtonTextActive: {
    color: '#ffffff',
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sliderValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  slider: {
    height: 40,
    marginHorizontal: -8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
    color: '#111827',
    minHeight: 100,
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
});