import React from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Pressable } from 'react-native';
import Slider from '@react-native-community/slider';
import type { AgentMode } from './AgentModeSelector';

// Base settings shared across all modes
export type BaseAgentSettings = {
  mode: AgentMode;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
};

// Mode-specific settings
export type TextModeSettings = BaseAgentSettings & {
  mode: 'text';
  model: 'gpt-4o' | 'gpt-4o-mini' | 'gpt-3.5-turbo';
  streamResponse: boolean;
};

export type VisionModeSettings = BaseAgentSettings & {
  mode: 'vision';
  model: 'gpt-4o' | 'gpt-4o-mini';
  maxImages: number;
  imageDetail: 'low' | 'high' | 'auto';
};

export type CreateModeSettings = BaseAgentSettings & {
  mode: 'create';
  model: 'dall-e-3' | 'dall-e-2';
  size: '1024x1024' | '1792x1024' | '1024x1792' | '256x256' | '512x512';
  quality: 'standard' | 'hd';
  style: 'vivid' | 'natural';
  numberOfImages: number;
};

export type TranscribeModeSettings = BaseAgentSettings & {
  mode: 'transcribe';
  model: 'whisper-1';
  language?: string;
  prompt?: string;
  responseFormat: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
};

export type SpeakModeSettings = BaseAgentSettings & {
  mode: 'speak';
  model: 'tts-1' | 'tts-1-hd';
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  responseFormat: 'mp3' | 'opus' | 'aac' | 'flac';
  speed: number;
};

export type CodeModeSettings = BaseAgentSettings & {
  mode: 'code';
  model: 'gpt-4o' | 'gpt-4o-mini';
  language: string;
  includeComments: boolean;
  codeStyle: 'concise' | 'verbose' | 'production';
};

export type AgentModeSettings = 
  | TextModeSettings 
  | VisionModeSettings 
  | CreateModeSettings 
  | TranscribeModeSettings 
  | SpeakModeSettings 
  | CodeModeSettings;

export type AgentModeSettingsProps = {
  settings: AgentModeSettings;
  onSettingsChange: (settings: AgentModeSettings) => void;
};

export default function AgentModeSettingsPanel({ settings, onSettingsChange }: AgentModeSettingsProps) {
  const updateSetting = <K extends keyof AgentModeSettings>(key: K, value: AgentModeSettings[K]) => {
    onSettingsChange({ ...settings, [key]: value } as AgentModeSettings);
  };

  const renderModeSpecificSettings = () => {
    switch (settings.mode) {
      case 'text':
        return <TextModeSettingsPanel settings={settings as TextModeSettings} updateSetting={updateSetting} />;
      case 'vision':
        return <VisionModeSettingsPanel settings={settings as VisionModeSettings} updateSetting={updateSetting} />;
      case 'create':
        return <CreateModeSettingsPanel settings={settings as CreateModeSettings} updateSetting={updateSetting} />;
      case 'transcribe':
        return <TranscribeModeSettingsPanel settings={settings as TranscribeModeSettings} updateSetting={updateSetting} />;
      case 'speak':
        return <SpeakModeSettingsPanel settings={settings as SpeakModeSettings} updateSetting={updateSetting} />;
      case 'code':
        return <CodeModeSettingsPanel settings={settings as CodeModeSettings} updateSetting={updateSetting} />;
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Base settings */}
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

      {/* Mode-specific settings */}
      {renderModeSpecificSettings()}

      {/* System prompt */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Prompt</Text>
        <TextInput
          style={styles.textInput}
          value={settings.systemPrompt}
          onChangeText={(text) => updateSetting('systemPrompt', text)}
          placeholder={getSystemPromptPlaceholder(settings.mode)}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        <Text style={styles.hint}>Instructions for the AI's behavior</Text>
      </View>
    </ScrollView>
  );
}

// Mode-specific settings panels
function TextModeSettingsPanel({ settings, updateSetting }: { settings: TextModeSettings, updateSetting: any }) {
  const models = ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'];
  
  return (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Model</Text>
        <View style={styles.modelButtons}>
          {models.map((model) => (
            <Pressable
              key={model}
              style={[
                styles.modelButton,
                settings.model === model && styles.modelButtonActive,
              ]}
              onPress={() => updateSetting('model', model)}
            >
              <Text
                style={[
                  styles.modelButtonText,
                  settings.model === model && styles.modelButtonTextActive,
                ]}
              >
                {model}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stream Response</Text>
        <Pressable
          style={[styles.toggleButton, settings.streamResponse && styles.toggleButtonActive]}
          onPress={() => updateSetting('streamResponse', !settings.streamResponse)}
        >
          <Text style={[styles.toggleButtonText, settings.streamResponse && styles.toggleButtonTextActive]}>
            {settings.streamResponse ? 'Enabled' : 'Disabled'}
          </Text>
        </Pressable>
        <Text style={styles.hint}>Stream responses as they are generated</Text>
      </View>
    </>
  );
}

function VisionModeSettingsPanel({ settings, updateSetting }: { settings: VisionModeSettings, updateSetting: any }) {
  const models = ['gpt-4o', 'gpt-4o-mini'];
  const imageDetails = ['low', 'high', 'auto'];
  
  return (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Model</Text>
        <View style={styles.modelButtons}>
          {models.map((model) => (
            <Pressable
              key={model}
              style={[
                styles.modelButton,
                settings.model === model && styles.modelButtonActive,
              ]}
              onPress={() => updateSetting('model', model)}
            >
              <Text
                style={[
                  styles.modelButtonText,
                  settings.model === model && styles.modelButtonTextActive,
                ]}
              >
                {model}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sliderHeader}>
          <Text style={styles.sectionTitle}>Max Images</Text>
          <Text style={styles.sliderValue}>{settings.maxImages}</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={10}
          step={1}
          value={settings.maxImages}
          onValueChange={(value) => updateSetting('maxImages', value)}
          minimumTrackTintColor="#111827"
          maximumTrackTintColor="#d1d5db"
          thumbTintColor="#111827"
        />
        <Text style={styles.hint}>Maximum number of images to analyze</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Image Detail</Text>
        <View style={styles.modelButtons}>
          {imageDetails.map((detail) => (
            <Pressable
              key={detail}
              style={[
                styles.modelButton,
                settings.imageDetail === detail && styles.modelButtonActive,
              ]}
              onPress={() => updateSetting('imageDetail', detail)}
            >
              <Text
                style={[
                  styles.modelButtonText,
                  settings.imageDetail === detail && styles.modelButtonTextActive,
                ]}
              >
                {detail}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.hint}>Image processing detail level</Text>
      </View>
    </>
  );
}

function CreateModeSettingsPanel({ settings, updateSetting }: { settings: CreateModeSettings, updateSetting: any }) {
  const models = ['dall-e-3', 'dall-e-2'];
  const sizes = ['1024x1024', '1792x1024', '1024x1792', '256x256', '512x512'];
  const qualities = ['standard', 'hd'];
  const styles_options = ['vivid', 'natural'];
  
  return (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Model</Text>
        <View style={styles.modelButtons}>
          {models.map((model) => (
            <Pressable
              key={model}
              style={[
                styles.modelButton,
                settings.model === model && styles.modelButtonActive,
              ]}
              onPress={() => updateSetting('model', model)}
            >
              <Text
                style={[
                  styles.modelButtonText,
                  settings.model === model && styles.modelButtonTextActive,
                ]}
              >
                {model}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Size</Text>
        <View style={styles.modelButtons}>
          {sizes.map((size) => (
            <Pressable
              key={size}
              style={[
                styles.modelButton,
                settings.size === size && styles.modelButtonActive,
              ]}
              onPress={() => updateSetting('size', size)}
            >
              <Text
                style={[
                  styles.modelButtonText,
                  settings.size === size && styles.modelButtonTextActive,
                ]}
              >
                {size}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quality</Text>
        <View style={styles.modelButtons}>
          {qualities.map((quality) => (
            <Pressable
              key={quality}
              style={[
                styles.modelButton,
                settings.quality === quality && styles.modelButtonActive,
              ]}
              onPress={() => updateSetting('quality', quality)}
            >
              <Text
                style={[
                  styles.modelButtonText,
                  settings.quality === quality && styles.modelButtonTextActive,
                ]}
              >
                {quality}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Style</Text>
        <View style={styles.modelButtons}>
          {styles_options.map((style_option) => (
            <Pressable
              key={style_option}
              style={[
                styles.modelButton,
                settings.style === style_option && styles.modelButtonActive,
              ]}
              onPress={() => updateSetting('style', style_option)}
            >
              <Text
                style={[
                  styles.modelButtonText,
                  settings.style === style_option && styles.modelButtonTextActive,
                ]}
              >
                {style_option}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sliderHeader}>
          <Text style={styles.sectionTitle}>Number of Images</Text>
          <Text style={styles.sliderValue}>{settings.numberOfImages}</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={4}
          step={1}
          value={settings.numberOfImages}
          onValueChange={(value) => updateSetting('numberOfImages', value)}
          minimumTrackTintColor="#111827"
          maximumTrackTintColor="#d1d5db"
          thumbTintColor="#111827"
        />
        <Text style={styles.hint}>Number of images to generate</Text>
      </View>
    </>
  );
}

function TranscribeModeSettingsPanel({ settings, updateSetting }: { settings: TranscribeModeSettings, updateSetting: any }) {
  const responseFormats = ['json', 'text', 'srt', 'verbose_json', 'vtt'];
  
  return (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Response Format</Text>
        <View style={styles.modelButtons}>
          {responseFormats.map((format) => (
            <Pressable
              key={format}
              style={[
                styles.modelButton,
                settings.responseFormat === format && styles.modelButtonActive,
              ]}
              onPress={() => updateSetting('responseFormat', format)}
            >
              <Text
                style={[
                  styles.modelButtonText,
                  settings.responseFormat === format && styles.modelButtonTextActive,
                ]}
              >
                {format}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Language (Optional)</Text>
        <TextInput
          style={styles.textInput}
          value={settings.language || ''}
          onChangeText={(text) => updateSetting('language', text || undefined)}
          placeholder="ISO-639-1 format (e.g., en, es, fr)"
        />
        <Text style={styles.hint}>Leave blank for automatic detection</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Prompt (Optional)</Text>
        <TextInput
          style={styles.textInput}
          value={settings.prompt || ''}
          onChangeText={(text) => updateSetting('prompt', text || undefined)}
          placeholder="Guide the model's style or continue a previous audio segment"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
        <Text style={styles.hint}>Optional text to guide the model's style</Text>
      </View>
    </>
  );
}

function SpeakModeSettingsPanel({ settings, updateSetting }: { settings: SpeakModeSettings, updateSetting: any }) {
  const models = ['tts-1', 'tts-1-hd'];
  const voices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
  const responseFormats = ['mp3', 'opus', 'aac', 'flac'];
  
  return (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Model</Text>
        <View style={styles.modelButtons}>
          {models.map((model) => (
            <Pressable
              key={model}
              style={[
                styles.modelButton,
                settings.model === model && styles.modelButtonActive,
              ]}
              onPress={() => updateSetting('model', model)}
            >
              <Text
                style={[
                  styles.modelButtonText,
                  settings.model === model && styles.modelButtonTextActive,
                ]}
              >
                {model}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Voice</Text>
        <View style={styles.modelButtons}>
          {voices.map((voice) => (
            <Pressable
              key={voice}
              style={[
                styles.modelButton,
                settings.voice === voice && styles.modelButtonActive,
              ]}
              onPress={() => updateSetting('voice', voice)}
            >
              <Text
                style={[
                  styles.modelButtonText,
                  settings.voice === voice && styles.modelButtonTextActive,
                ]}
              >
                {voice}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Response Format</Text>
        <View style={styles.modelButtons}>
          {responseFormats.map((format) => (
            <Pressable
              key={format}
              style={[
                styles.modelButton,
                settings.responseFormat === format && styles.modelButtonActive,
              ]}
              onPress={() => updateSetting('responseFormat', format)}
            >
              <Text
                style={[
                  styles.modelButtonText,
                  settings.responseFormat === format && styles.modelButtonTextActive,
                ]}
              >
                {format}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sliderHeader}>
          <Text style={styles.sectionTitle}>Speed</Text>
          <Text style={styles.sliderValue}>{settings.speed.toFixed(2)}</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={0.25}
          maximumValue={4.0}
          value={settings.speed}
          onValueChange={(value) => updateSetting('speed', value)}
          minimumTrackTintColor="#111827"
          maximumTrackTintColor="#d1d5db"
          thumbTintColor="#111827"
        />
        <Text style={styles.hint}>Playback speed (0.25x to 4.0x)</Text>
      </View>
    </>
  );
}

function CodeModeSettingsPanel({ settings, updateSetting }: { settings: CodeModeSettings, updateSetting: any }) {
  const models = ['gpt-4o', 'gpt-4o-mini'];
  const codeStyles = ['concise', 'verbose', 'production'];
  
  return (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Model</Text>
        <View style={styles.modelButtons}>
          {models.map((model) => (
            <Pressable
              key={model}
              style={[
                styles.modelButton,
                settings.model === model && styles.modelButtonActive,
              ]}
              onPress={() => updateSetting('model', model)}
            >
              <Text
                style={[
                  styles.modelButtonText,
                  settings.model === model && styles.modelButtonTextActive,
                ]}
              >
                {model}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Programming Language</Text>
        <TextInput
          style={styles.textInput}
          value={settings.language}
          onChangeText={(text) => updateSetting('language', text)}
          placeholder="e.g., typescript, python, rust"
        />
        <Text style={styles.hint}>Primary programming language</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Code Style</Text>
        <View style={styles.modelButtons}>
          {codeStyles.map((style) => (
            <Pressable
              key={style}
              style={[
                styles.modelButton,
                settings.codeStyle === style && styles.modelButtonActive,
              ]}
              onPress={() => updateSetting('codeStyle', style)}
            >
              <Text
                style={[
                  styles.modelButtonText,
                  settings.codeStyle === style && styles.modelButtonTextActive,
                ]}
              >
                {style}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Include Comments</Text>
        <Pressable
          style={[styles.toggleButton, settings.includeComments && styles.toggleButtonActive]}
          onPress={() => updateSetting('includeComments', !settings.includeComments)}
        >
          <Text style={[styles.toggleButtonText, settings.includeComments && styles.toggleButtonTextActive]}>
            {settings.includeComments ? 'Enabled' : 'Disabled'}
          </Text>
        </Pressable>
        <Text style={styles.hint}>Include explanatory comments in code</Text>
      </View>
    </>
  );
}

function getSystemPromptPlaceholder(mode: AgentMode): string {
  switch (mode) {
    case 'text':
      return 'You are a helpful assistant...';
    case 'vision':
      return 'You are an expert at analyzing images and describing what you see...';
    case 'create':
      return 'You are an expert at creating detailed image generation prompts...';
    case 'transcribe':
      return 'You are an expert at transcribing audio accurately...';
    case 'speak':
      return 'You are an expert at converting text to natural-sounding speech...';
    case 'code':
      return 'You are an expert programmer and coding assistant...';
    default:
      return 'You are a helpful assistant...';
  }
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
    minHeight: 40,
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
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
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#111827',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  toggleButtonTextActive: {
    color: '#ffffff',
  },
});