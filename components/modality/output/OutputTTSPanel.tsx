import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import * as Speech from 'expo-speech';
import ModalityCard from '../../ui/ModalityCard';

export type OutputTTSPanelProps = {
  status?: 'idle' | 'speaking' | 'error';
  hint?: string;
};

export default function OutputTTSPanel({ status = 'idle', hint = 'Uses expo-speech' }: OutputTTSPanelProps) {
  const [expanded, setExpanded] = useState(true);

  const stop = useCallback(async () => {
    try { await Speech.stop(); } catch {}
  }, []);

  const testSpeak = useCallback(() => {
    try {
      Speech.speak('This is a test of text to speech.', {
        language: 'en-US',
        rate: 1.0,
      });
    } catch {}
  }, []);

  return (
    <ModalityCard tone="output" label="Audio (TTS)">
      <Pressable accessibilityRole="button" onPress={() => setExpanded((v) => !v)} style={styles.headerRow}>
        <Text style={styles.headerText}>{expanded ? '▾' : '▸'} Text to Speech</Text>
        <Text style={[styles.stat, status === 'speaking' ? styles.ok : status === 'error' ? styles.err : undefined]}>
          {status === 'speaking' ? 'Speaking…' : status === 'error' ? 'Error' : 'Idle'}
        </Text>
      </Pressable>
      {expanded ? (
        <View>
          <Text style={styles.hint}>{hint}</Text>
          <View style={styles.row}>
            <Pressable accessibilityRole="button" onPress={testSpeak} style={styles.btn}><Text style={styles.btnText}>Test voice</Text></Pressable>
            <Pressable accessibilityRole="button" onPress={stop} style={[styles.btn, styles.btnDanger]}><Text style={styles.btnText}>Stop</Text></Pressable>
          </View>
        </View>
      ) : null}
    </ModalityCard>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerText: { color: '#111827', fontWeight: '700' },
  stat: { fontWeight: '700' },
  ok: { color: '#059669' },
  err: { color: '#b91c1c' },
  hint: { marginTop: 8, color: '#6b7280' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  btn: { backgroundColor: '#111827', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  btnDanger: { backgroundColor: '#991b1b' },
  btnText: { color: '#fff', fontWeight: '700' },
});
