import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import ModalityCard from '../../ui/ModalityCard';
import { type AgentModeSettings } from './AgentModeSettings';

export type CodeAgentCardProps = {
  settings: AgentModeSettings;
  onSettingsChange: (settings: AgentModeSettings) => void;
};

export default function CodeAgentCard({ settings, onSettingsChange }: CodeAgentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isExpanded) {
    return (
      <ModalityCard tone="agent" label="Code">
        <Pressable style={styles.collapsedContainer} onPress={() => setIsExpanded(true)}>
          <Text style={styles.icon}>💻</Text>
          <Text style={styles.collapsedText}>Code Assistant</Text>
        </Pressable>
      </ModalityCard>
    );
  }

  return (
    <ModalityCard tone="agent" label="Code">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Code Agent</Text>
          <Pressable onPress={() => setIsExpanded(false)} style={styles.collapseButton}>
            <Text style={styles.collapseButtonText}>✕</Text>
          </Pressable>
        </View>
        
        <View style={styles.settingsContainer}>
          <Text style={styles.description}>
            Generate, debug, and refactor code with GPT-4o optimized for programming tasks.
          </Text>
          
          <View style={styles.setting}>
            <Text style={styles.settingLabel}>Programming Language</Text>
            <View style={styles.languageOptions}>
              {['auto', 'javascript', 'python', 'typescript', 'java'].map((lang) => (
                <Pressable 
                  key={lang}
                  style={[styles.languageOption, settings.programmingLanguage === lang && styles.languageOptionActive]}
                  onPress={() => onSettingsChange({ ...settings, programmingLanguage: lang })}
                >
                  <Text style={[styles.languageOptionText, settings.programmingLanguage === lang && styles.languageOptionTextActive]}>
                    {lang === 'auto' ? 'Auto' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.setting}>
            <Text style={styles.settingLabel}>Code Style</Text>
            <View style={styles.styleOptions}>
              <Pressable 
                style={[styles.styleOption, settings.codeStyle === 'concise' && styles.styleOptionActive]}
                onPress={() => onSettingsChange({ ...settings, codeStyle: 'concise' })}
              >
                <Text style={[styles.styleOptionText, settings.codeStyle === 'concise' && styles.styleOptionTextActive]}>
                  Concise
                </Text>
              </Pressable>
              <Pressable 
                style={[styles.styleOption, settings.codeStyle === 'verbose' && styles.styleOptionActive]}
                onPress={() => onSettingsChange({ ...settings, codeStyle: 'verbose' })}
              >
                <Text style={[styles.styleOptionText, settings.codeStyle === 'verbose' && styles.styleOptionTextActive]}>
                  Detailed
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.setting}>
            <Pressable 
              style={styles.checkbox}
              onPress={() => onSettingsChange({ ...settings, includeComments: !settings.includeComments })}
            >
              <Text style={styles.checkboxIcon}>{settings.includeComments ? '✅' : '⬜'}</Text>
              <Text style={styles.checkboxLabel}>Include comments</Text>
            </Pressable>
          </View>

          <View style={styles.setting}>
            <Pressable 
              style={styles.checkbox}
              onPress={() => onSettingsChange({ ...settings, explainCode: !settings.explainCode })}
            >
              <Text style={styles.checkboxIcon}>{settings.explainCode ? '✅' : '⬜'}</Text>
              <Text style={styles.checkboxLabel}>Explain code</Text>
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
  languageOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  languageOption: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  languageOptionActive: {
    backgroundColor: '#3b82f6',
  },
  languageOptionText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  languageOptionTextActive: {
    color: 'white',
  },
  styleOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  styleOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  styleOptionActive: {
    backgroundColor: '#3b82f6',
  },
  styleOptionText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  styleOptionTextActive: {
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