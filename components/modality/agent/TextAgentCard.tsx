import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import ModalityCard from '../../ui/ModalityCard';
import { type AgentModeSettings } from './AgentModeSettings';

export type TextAgentCardProps = {
  settings: AgentModeSettings;
  onSettingsChange: (settings: AgentModeSettings) => void;
};

export default function TextAgentCard({ settings, onSettingsChange }: TextAgentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isExpanded) {
    return (
      <ModalityCard tone="agent" label="Text">
        <Pressable style={styles.collapsedContainer} onPress={() => setIsExpanded(true)}>
          <Text style={styles.icon}>💬</Text>
          <Text style={styles.collapsedText}>GPT-4o Chat</Text>
        </Pressable>
      </ModalityCard>
    );
  }

  return (
    <ModalityCard tone="agent" label="Text">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Text Agent</Text>
          <Pressable onPress={() => setIsExpanded(false)} style={styles.collapseButton}>
            <Text style={styles.collapseButtonText}>✕</Text>
          </Pressable>
        </View>
        
        <View style={styles.settingsContainer}>
          <Text style={styles.description}>
            Standard chat conversations with GPT-4o, optimized for text generation and dialogue.
          </Text>
          
          <View style={styles.setting}>
            <Text style={styles.settingLabel}>Model</Text>
            <View style={styles.modelOptions}>
              <Pressable 
                style={[styles.modelOption, settings.model === 'gpt-4o' && styles.modelOptionActive]}
                onPress={() => onSettingsChange({ ...settings, model: 'gpt-4o' })}
              >
                <Text style={[styles.modelOptionText, settings.model === 'gpt-4o' && styles.modelOptionTextActive]}>
                  GPT-4o
                </Text>
              </Pressable>
              <Pressable 
                style={[styles.modelOption, settings.model === 'gpt-4o-mini' && styles.modelOptionActive]}
                onPress={() => onSettingsChange({ ...settings, model: 'gpt-4o-mini' })}
              >
                <Text style={[styles.modelOptionText, settings.model === 'gpt-4o-mini' && styles.modelOptionTextActive]}>
                  GPT-4o Mini
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.setting}>
            <Text style={styles.settingLabel}>Temperature: {settings.temperature}</Text>
            <View style={styles.slider}>
              <Text style={styles.sliderLabel}>Precise</Text>
              <Text style={styles.sliderLabel}>Creative</Text>
            </View>
          </View>

          <View style={styles.setting}>
            <Pressable 
              style={styles.checkbox}
              onPress={() => onSettingsChange({ ...settings, streaming: !settings.streaming })}
            >
              <Text style={styles.checkboxIcon}>{settings.streaming ? '✅' : '⬜'}</Text>
              <Text style={styles.checkboxLabel}>Stream responses</Text>
            </Pressable>
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
  slider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  sliderLabel: {
    fontSize: 11,
    color: '#9ca3af',
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxIcon: {
    fontSize: 18,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
  },
});