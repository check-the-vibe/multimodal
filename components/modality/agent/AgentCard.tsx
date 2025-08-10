import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import VerticalLabel from '../../ui/VerticalLabel';

export type AgentCardProps = {
  expanded: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
};

export default function AgentCard({ expanded, onToggle, children }: AgentCardProps) {
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
          <Text style={styles.hintSmall}>Tap to configure</Text>
        </Pressable>
      ) : (
        <View style={styles.expandedContent}>
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
  hintSmall: {
    color: '#666',
    textAlign: 'center',
    fontSize: 12,
    marginTop: 4,
  },
  expandedContent: {
    flex: 1,
  },
});