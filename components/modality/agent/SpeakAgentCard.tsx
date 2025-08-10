import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import ModalityCard from '../../ui/ModalityCard';
import { type AgentModeSettings } from './AgentModeSettings';

export type SpeakAgentCardProps = {
  settings: AgentModeSettings;
  onSettingsChange: (settings: AgentModeSettings) => void;
};

const voices = [
  { id: 'alloy', name: 'Alloy', icon: '🔷' },
  { id: 'echo', name: 'Echo', icon: '🔊' },
  { id: 'fable', name: 'Fable', icon: '📖' },
  { id: 'onyx', name: 'Onyx', icon: '⚫' },
  { id: 'nova', name: 'Nova', icon: '✨' },
  { id: 'shimmer', name: 'Shimmer', icon: '💫' },
];

export default function SpeakAgentCard({ settings, onSettingsChange }: SpeakAgentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isExpanded) {
    return (
      <ModalityCard tone="agent" label="Speak">
        <Pressable style={styles.collapsedContainer} onPress={() => setIsExpanded(true)}>
          <Text style={styles.icon}>🔊</Text>
          <Text style={styles.collapsedText}>Text to Speech</Text>
        </Pressable>
      </ModalityCard>
    );
  }

  return (
    <ModalityCard tone="agent" label="Speak">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Speak Agent</Text>
          <Pressable onPress={() => setIsExpanded(false)} style={styles.collapseButton}>
            <Text style={styles.collapseButtonText}>✕</Text>
          </Pressable>
        </View>
        
        <View style={styles.settingsContainer}>
          <Text style={styles.description}>
            Convert text to natural speech using OpenAI's text-to-speech models.
          </Text>
          
          <View style={styles.setting}>
            <Text style={styles.settingLabel}>Voice</Text>
            <View style={styles.voiceOptions}>
              {voices.map((voice) => (
                <Pressable 
                  key={voice.id}
                  style={[styles.voiceOption, settings.voice === voice.id && styles.voiceOptionActive]}
                  onPress={() => onSettingsChange({ ...settings, voice: voice.id as any })}
                >
                  <Text style={styles.voiceIcon}>{voice.icon}</Text>
                  <Text style={[styles.voiceOptionText, settings.voice === voice.id && styles.voiceOptionTextActive]}>
                    {voice.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.setting}>
            <Text style={styles.settingLabel}>Model</Text>
            <View style={styles.modelOptions}>
              <Pressable 
                style={[styles.modelOption, settings.ttsModel === 'tts-1' && styles.modelOptionActive]}
                onPress={() => onSettingsChange({ ...settings, ttsModel: 'tts-1' })}
              >
                <Text style={[styles.modelOptionText, settings.ttsModel === 'tts-1' && styles.modelOptionTextActive]}>
                  Standard
                </Text>
              </Pressable>
              <Pressable 
                style={[styles.modelOption, settings.ttsModel === 'tts-1-hd' && styles.modelOptionActive]}
                onPress={() => onSettingsChange({ ...settings, ttsModel: 'tts-1-hd' })}
              >
                <Text style={[styles.modelOptionText, settings.ttsModel === 'tts-1-hd' && styles.modelOptionTextActive]}>
                  HD Quality
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.setting}>
            <Text style={styles.settingLabel}>Speed: {settings.speed || 1.0}x</Text>
            <View style={styles.speedInfo}>
              <Text style={styles.speedLabel}>0.25x</Text>
              <Text style={styles.speedLabel}>4.0x</Text>
            </View>
          </View>
        </View>
      </View>
    </ModalityCard>
  );
}

const styles = StyleSheet.create({
  collapsedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    minHeight: 150,
  },
  icon: {
    fontSize: 48,
    marginBottom: 8,
  },
  collapsedText: {
    color: '#6b7280',
    fontSize: 14,
  },
  container: {
    minHeight: 150,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  collapseButton: {
    padding: 4,
  },
  collapseButtonText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '600',
  },
  settingsContainer: {
    gap: 16,
  },
  description: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 8,
  },
  setting: {
    gap: 8,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  voiceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  voiceOption: {
    width: '30%',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  voiceOptionActive: {
    backgroundColor: '#3b82f6',
  },
  voiceIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  voiceOptionText: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '500',
  },
  voiceOptionTextActive: {
    color: 'white',
  },
  modelOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  modelOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  modelOptionActive: {
    backgroundColor: '#3b82f6',
  },
  modelOptionText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  modelOptionTextActive: {
    color: 'white',
  },
  speedInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  speedLabel: {
    fontSize: 11,
    color: '#9ca3af',
  },
});