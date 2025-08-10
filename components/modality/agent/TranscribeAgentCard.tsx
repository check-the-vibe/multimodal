import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import ModalityCard from '../../ui/ModalityCard';
import { type AgentModeSettings } from './AgentModeSettings';

export type TranscribeAgentCardProps = {
  settings: AgentModeSettings;
  onSettingsChange: (settings: AgentModeSettings) => void;
};

export default function TranscribeAgentCard({ settings, onSettingsChange }: TranscribeAgentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isExpanded) {
    return (
      <ModalityCard tone="agent" label="Transcribe">
        <Pressable style={styles.collapsedContainer} onPress={() => setIsExpanded(true)}>
          <Text style={styles.icon}>🎤</Text>
          <Text style={styles.collapsedText}>Whisper STT</Text>
        </Pressable>
      </ModalityCard>
    );
  }

  return (
    <ModalityCard tone="agent" label="Transcribe">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Transcribe Agent</Text>
          <Pressable onPress={() => setIsExpanded(false)} style={styles.collapseButton}>
            <Text style={styles.collapseButtonText}>✕</Text>
          </Pressable>
        </View>
        
        <View style={styles.settingsContainer}>
          <Text style={styles.description}>
            Convert speech to text using OpenAI Whisper with automatic language detection.
          </Text>
          
          <View style={styles.setting}>
            <Text style={styles.settingLabel}>Response Format</Text>
            <View style={styles.formatOptions}>
              <Pressable 
                style={[styles.formatOption, settings.responseFormat === 'text' && styles.formatOptionActive]}
                onPress={() => onSettingsChange({ ...settings, responseFormat: 'text' })}
              >
                <Text style={[styles.formatOptionText, settings.responseFormat === 'text' && styles.formatOptionTextActive]}>
                  Text
                </Text>
              </Pressable>
              <Pressable 
                style={[styles.formatOption, settings.responseFormat === 'verbose_json' && styles.formatOptionActive]}
                onPress={() => onSettingsChange({ ...settings, responseFormat: 'verbose_json' })}
              >
                <Text style={[styles.formatOptionText, settings.responseFormat === 'verbose_json' && styles.formatOptionTextActive]}>
                  Detailed
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.setting}>
            <Text style={styles.settingLabel}>Language</Text>
            <View style={styles.languageOptions}>
              <Pressable 
                style={[styles.languageOption, !settings.language && styles.languageOptionActive]}
                onPress={() => onSettingsChange({ ...settings, language: undefined })}
              >
                <Text style={[styles.languageOptionText, !settings.language && styles.languageOptionTextActive]}>
                  Auto-detect
                </Text>
              </Pressable>
              <Pressable 
                style={[styles.languageOption, settings.language === 'en' && styles.languageOptionActive]}
                onPress={() => onSettingsChange({ ...settings, language: 'en' })}
              >
                <Text style={[styles.languageOptionText, settings.language === 'en' && styles.languageOptionTextActive]}>
                  English
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.setting}>
            <Pressable 
              style={styles.checkbox}
              onPress={() => onSettingsChange({ ...settings, timestamps: !settings.timestamps })}
            >
              <Text style={styles.checkboxIcon}>{settings.timestamps ? '✅' : '⬜'}</Text>
              <Text style={styles.checkboxLabel}>Include timestamps</Text>
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
  formatOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  formatOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  formatOptionActive: {
    backgroundColor: '#3b82f6',
  },
  formatOptionText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  formatOptionTextActive: {
    color: 'white',
  },
  languageOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  languageOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  languageOptionActive: {
    backgroundColor: '#3b82f6',
  },
  languageOptionText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  languageOptionTextActive: {
    color: 'white',
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