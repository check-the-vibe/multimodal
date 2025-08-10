import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import ModalityCard from '../../ui/ModalityCard';
import { type AgentModeSettings } from './AgentModeSettings';

export type CreateAgentCardProps = {
  settings: AgentModeSettings;
  onSettingsChange: (settings: AgentModeSettings) => void;
};

export default function CreateAgentCard({ settings, onSettingsChange }: CreateAgentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isExpanded) {
    return (
      <ModalityCard tone="agent" label="Create">
        <Pressable style={styles.collapsedContainer} onPress={() => setIsExpanded(true)}>
          <Text style={styles.icon}>🎨</Text>
          <Text style={styles.collapsedText}>DALL-E 3</Text>
        </Pressable>
      </ModalityCard>
    );
  }

  return (
    <ModalityCard tone="agent" label="Create">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create Agent</Text>
          <Pressable onPress={() => setIsExpanded(false)} style={styles.collapseButton}>
            <Text style={styles.collapseButtonText}>✕</Text>
          </Pressable>
        </View>
        
        <View style={styles.settingsContainer}>
          <Text style={styles.description}>
            Generate images from text descriptions using DALL-E 3.
          </Text>
          
          <View style={styles.setting}>
            <Text style={styles.settingLabel}>Image Size</Text>
            <View style={styles.sizeOptions}>
              <Pressable 
                style={[styles.sizeOption, settings.imageSize === '1024x1024' && styles.sizeOptionActive]}
                onPress={() => onSettingsChange({ ...settings, imageSize: '1024x1024' })}
              >
                <Text style={[styles.sizeOptionText, settings.imageSize === '1024x1024' && styles.sizeOptionTextActive]}>
                  Square
                </Text>
                <Text style={[styles.sizeOptionDetail, settings.imageSize === '1024x1024' && styles.sizeOptionTextActive]}>
                  1024×1024
                </Text>
              </Pressable>
              <Pressable 
                style={[styles.sizeOption, settings.imageSize === '1792x1024' && styles.sizeOptionActive]}
                onPress={() => onSettingsChange({ ...settings, imageSize: '1792x1024' })}
              >
                <Text style={[styles.sizeOptionText, settings.imageSize === '1792x1024' && styles.sizeOptionTextActive]}>
                  Wide
                </Text>
                <Text style={[styles.sizeOptionDetail, settings.imageSize === '1792x1024' && styles.sizeOptionTextActive]}>
                  1792×1024
                </Text>
              </Pressable>
              <Pressable 
                style={[styles.sizeOption, settings.imageSize === '1024x1792' && styles.sizeOptionActive]}
                onPress={() => onSettingsChange({ ...settings, imageSize: '1024x1792' })}
              >
                <Text style={[styles.sizeOptionText, settings.imageSize === '1024x1792' && styles.sizeOptionTextActive]}>
                  Tall
                </Text>
                <Text style={[styles.sizeOptionDetail, settings.imageSize === '1024x1792' && styles.sizeOptionTextActive]}>
                  1024×1792
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.setting}>
            <Text style={styles.settingLabel}>Quality</Text>
            <View style={styles.qualityOptions}>
              <Pressable 
                style={[styles.qualityOption, settings.imageQuality === 'standard' && styles.qualityOptionActive]}
                onPress={() => onSettingsChange({ ...settings, imageQuality: 'standard' })}
              >
                <Text style={[styles.qualityOptionText, settings.imageQuality === 'standard' && styles.qualityOptionTextActive]}>
                  Standard
                </Text>
              </Pressable>
              <Pressable 
                style={[styles.qualityOption, settings.imageQuality === 'hd' && styles.qualityOptionActive]}
                onPress={() => onSettingsChange({ ...settings, imageQuality: 'hd' })}
              >
                <Text style={[styles.qualityOptionText, settings.imageQuality === 'hd' && styles.qualityOptionTextActive]}>
                  HD
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.setting}>
            <Text style={styles.settingLabel}>Style</Text>
            <View style={styles.styleOptions}>
              <Pressable 
                style={[styles.styleOption, settings.imageStyle === 'vivid' && styles.styleOptionActive]}
                onPress={() => onSettingsChange({ ...settings, imageStyle: 'vivid' })}
              >
                <Text style={[styles.styleOptionText, settings.imageStyle === 'vivid' && styles.styleOptionTextActive]}>
                  Vivid
                </Text>
              </Pressable>
              <Pressable 
                style={[styles.styleOption, settings.imageStyle === 'natural' && styles.styleOptionActive]}
                onPress={() => onSettingsChange({ ...settings, imageStyle: 'natural' })}
              >
                <Text style={[styles.styleOptionText, settings.imageStyle === 'natural' && styles.styleOptionTextActive]}>
                  Natural
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.setting}>
            <Text style={styles.settingLabel}>Number of Images: {settings.numberOfImages || 1}</Text>
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
  sizeOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  sizeOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  sizeOptionActive: {
    backgroundColor: '#3b82f6',
  },
  sizeOptionText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  sizeOptionDetail: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
  },
  sizeOptionTextActive: {
    color: 'white',
  },
  qualityOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  qualityOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  qualityOptionActive: {
    backgroundColor: '#3b82f6',
  },
  qualityOptionText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  qualityOptionTextActive: {
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
});