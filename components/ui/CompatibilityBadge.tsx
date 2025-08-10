import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AGENT_MODE_CONFIGS } from '../../services/agentModeConfig';
import type { AgentMode } from '../modality/agent/AgentModeSelector';

export type CompatibilityBadgeProps = {
  agentMode: AgentMode;
  compact?: boolean;
};

const AGENT_ICONS: Record<AgentMode, string> = {
  text: '💬',
  vision: '👁️',
  create: '🎨',
  transcribe: '🎤',
  speak: '🔊',
  code: '💻'
};

export default function CompatibilityBadge({ agentMode, compact = false }: CompatibilityBadgeProps) {
  const config = AGENT_MODE_CONFIGS[agentMode];
  
  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Text style={styles.compactIcon}>{AGENT_ICONS[agentMode]}</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>{AGENT_ICONS[agentMode]}</Text>
        <Text style={styles.title}>
          {agentMode.charAt(0).toUpperCase() + agentMode.slice(1)} Mode
        </Text>
      </View>
      <Text style={styles.description}>{config.description}</Text>
      <View style={styles.compatibility}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compatible Inputs:</Text>
          <View style={styles.badges}>
            {config.compatibleInputs.map(input => (
              <View key={input} style={styles.badge}>
                <Text style={styles.badgeText}>{input}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compatible Outputs:</Text>
          <View style={styles.badges}>
            {config.compatibleOutputs.map(output => (
              <View key={output} style={styles.badge}>
                <Text style={styles.badgeText}>{output}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  compactContainer: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: 4,
  },
  compactIcon: {
    fontSize: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  icon: {
    fontSize: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  description: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 18,
  },
  compatibility: {
    gap: 10,
  },
  section: {
    gap: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  badge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 11,
    color: '#1e40af',
    fontWeight: '500',
  },
});