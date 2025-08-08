import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ModalityCard from '../../ui/ModalityCard';

export type InputVideoCardProps = {
  videoUri?: string | null;
  onCapture: () => void;
  onPick?: () => void;
};

export default function InputVideoCard({ videoUri, onCapture, onPick }: InputVideoCardProps) {
  return (
    <ModalityCard tone="input" label="Video">
      <View style={styles.row}>
        <Pressable accessibilityRole="button" onPress={onCapture} style={styles.btn}><Text style={styles.btnText}>Record</Text></Pressable>
        {onPick ? (
          <Pressable accessibilityRole="button" onPress={onPick} style={styles.btnAlt}><Text style={styles.btnAltText}>Pick</Text></Pressable>
        ) : null}
      </View>
      <Text style={styles.hint}>{videoUri ? `Last: ${videoUri}` : 'No video yet'}</Text>
    </ModalityCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btn: { backgroundColor: '#111827', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: '600' },
  btnAlt: { backgroundColor: '#e5e7eb', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  btnAltText: { color: '#111827', fontWeight: '600' },
  hint: { marginTop: 8, color: '#6b7280' },
});

