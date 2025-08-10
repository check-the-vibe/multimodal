import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import VerticalLabel from '../../ui/VerticalLabel';

export type AgentCardProps = {
  expanded: boolean;
  onToggle: () => void;
  provider?: string;
  children?: React.ReactNode;
};

export default function AgentCard({ expanded, onToggle, provider = 'OpenAI', children }: AgentCardProps) {
  return (
    <View style={[styles.container, { backgroundColor: '#ffffff' }]}>
      <VerticalLabel text="agent" side="left" />
      {!expanded ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Configure agent settings"
          onPress={onToggle}
          style={styles.iconContainer}
        >
          <Text style={styles.agentIcon}>🤖</Text>
          <Text style={styles.providerName}>{provider}</Text>
          <Text style={styles.hintSmall}>Tap to configure</Text>
        </Pressable>
      ) : (
        <View style={styles.expandedContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Agent Settings</Text>
            <Pressable onPress={onToggle} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
          </View>
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  agentIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  hintSmall: {
    color: '#666',
    textAlign: 'center',
    fontSize: 12,
    marginTop: 4,
  },
  expandedContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6b7280',
    fontWeight: '600',
  },
});