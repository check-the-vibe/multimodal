import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import ModalityCard from '../../ui/ModalityCard';
import { type AgentModeSettings } from './AgentModeSettings';

export type VisionAgentCardProps = {
  settings: AgentModeSettings;
  onSettingsChange: (settings: AgentModeSettings) => void;
};

export default function VisionAgentCard({ settings, onSettingsChange }: VisionAgentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isExpanded) {
    return (
      <ModalityCard tone="agent" label="Vision">
        <Pressable style={styles.collapsedContainer} onPress={() => setIsExpanded(true)}>
          <Text style={styles.icon}>👁️</Text>
          <Text style={styles.collapsedText}>Image Analysis</Text>
        </Pressable>
      </ModalityCard>
    );
  }

  return (
    <ModalityCard tone="agent" label="Vision">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Vision Agent</Text>
          <Pressable onPress={() => setIsExpanded(false)} style={styles.collapseButton}>
            <Text style={styles.collapseButtonText}>✕</Text>
          </Pressable>
        </View>
        
        <View style={styles.settingsContainer}>
          <Text style={styles.description}>
            Analyze images, extract text (OCR), and answer visual questions using GPT-4o Vision.
          </Text>
          
          <View style={styles.setting}>
            <Text style={styles.settingLabel}>Analysis Mode</Text>
            <View style={styles.modeOptions}>
              {['analyze', 'ocr', 'describe', 'extract'].map((mode) => (
                <Pressable 
                  key={mode}
                  style={[styles.modeOption, settings.visionMode === mode && styles.modeOptionActive]}
                  onPress={() => onSettingsChange({ ...settings, visionMode: mode as any })}
                >
                  <Text style={[styles.modeOptionText, settings.visionMode === mode && styles.modeOptionTextActive]}>
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.setting}>
            <Text style={styles.settingLabel}>Image Detail</Text>
            <View style={styles.detailOptions}>
              <Pressable 
                style={[styles.detailOption, settings.imageDetail === 'low' && styles.detailOptionActive]}
                onPress={() => onSettingsChange({ ...settings, imageDetail: 'low' })}
              >
                <Text style={[styles.detailOptionText, settings.imageDetail === 'low' && styles.detailOptionTextActive]}>
                  Low
                </Text>
              </Pressable>
              <Pressable 
                style={[styles.detailOption, settings.imageDetail === 'high' && styles.detailOptionActive]}
                onPress={() => onSettingsChange({ ...settings, imageDetail: 'high' })}
              >
                <Text style={[styles.detailOptionText, settings.imageDetail === 'high' && styles.detailOptionTextActive]}>
                  High
                </Text>
              </Pressable>
              <Pressable 
                style={[styles.detailOption, settings.imageDetail === 'auto' && styles.detailOptionActive]}
                onPress={() => onSettingsChange({ ...settings, imageDetail: 'auto' })}
              >
                <Text style={[styles.detailOptionText, settings.imageDetail === 'auto' && styles.detailOptionTextActive]}>
                  Auto
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.setting}>
            <Text style={styles.settingLabel}>Max Images: {settings.maxImages || 1}</Text>
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
  modeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  modeOption: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  modeOptionActive: {
    backgroundColor: '#3b82f6',
  },
  modeOptionText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  modeOptionTextActive: {
    color: 'white',
  },
  detailOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  detailOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  detailOptionActive: {
    backgroundColor: '#3b82f6',
  },
  detailOptionText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  detailOptionTextActive: {
    color: 'white',
  },
});