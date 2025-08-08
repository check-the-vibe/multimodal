import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ModalityCard from '../../ui/ModalityCard';

export type InputAudioCardProps = {
  recording: boolean;
  onToggle: () => void;
  lastUri?: string | null;
};

export default function InputAudioCard({ recording, onToggle, lastUri }: InputAudioCardProps) {
  return (
    <ModalityCard tone="input" label="Audio">
      <View style={styles.row}>
        <Text style={styles.status}>{recording ? 'Recording…' : 'Idle'}</Text>
        <Pressable accessibilityRole="button" onPress={onToggle} style={styles.btn}>
          <Text style={styles.btnText}>{recording ? 'Stop' : 'Record'}</Text>
        </Pressable>
      </View>
      {lastUri ? <Text style={styles.hint}>Last: {lastUri}</Text> : <Text style={styles.hint}>Tap Record to capture audio</Text>}
    </ModalityCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  status: { color: '#111827', fontWeight: '600' },
  btn: { backgroundColor: '#111827', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: '600' },
  hint: { marginTop: 8, color: '#6b7280' },
});

