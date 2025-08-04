import React from 'react';
import { StyleSheet, Text } from 'react-native';
import ModalityCard from '../../ui/ModalityCard';

export type OutputTTSPanelProps = {
  status?: 'idle' | 'speaking' | 'error';
  hint?: string;
};

export default function OutputTTSPanel({ status = 'idle', hint = 'Uses expo-speech' }: OutputTTSPanelProps) {
  return (
    <ModalityCard tone="output" label="Audio (TTS)">
      <Text style={styles.text}>Status: {status}</Text>
      <Text style={styles.hint}>{hint}</Text>
    </ModalityCard>
  );
}

const styles = StyleSheet.create({
  text: { color: '#111827', fontWeight: '600' },
  hint: { marginTop: 6, color: '#6b7280' },
});

