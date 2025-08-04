import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Agent } from '../types';
import ModalityCard from '../ui/ModalityCard';

export type AgentCardProps = {
  agent: Agent;
  selected?: boolean;
};

export default function AgentCard({ agent, selected }: AgentCardProps) {
  return (
    <ModalityCard tone="neutral" selected={selected} label={agent.name}>
      <View style={styles.row}>
        <Text style={styles.k}>Accepts:</Text>
        <Text style={styles.v}>{agent.accepts.join(', ') || '—'}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.k}>Produces:</Text>
        <Text style={styles.v}>{agent.produces.join(', ') || '—'}</Text>
      </View>
      {agent.comingSoon ? (
        <Text style={styles.pill}>Coming soon</Text>
      ) : null}
      {agent.description ? (
        <Text style={styles.hint}>{agent.description}</Text>
      ) : null}
    </ModalityCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  k: { fontWeight: '700', color: '#111827', marginRight: 6 },
  v: { color: '#111827' },
  pill: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: '#f59e0b',
    color: '#111827',
    fontWeight: '700',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 12,
  },
  hint: { marginTop: 6, color: '#6b7280', fontSize: 12 },
});

