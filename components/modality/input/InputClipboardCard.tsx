import React from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import ModalityCard from '../../ui/ModalityCard';

export type InputClipboardCardProps = {
  value: string;
  onChange: (text: string) => void;
  onPaste?: (text: string) => void;
};

export default function InputClipboardCard({ value, onChange, onPaste }: InputClipboardCardProps) {
  const tryPaste = async () => {
    if (Platform.OS === 'web' && 'clipboard' in navigator) {
      try {
        const text = await (navigator as any).clipboard.readText();
        onChange(text || '');
        onPaste?.(text || '');
      } catch {}
    }
  };

  return (
    <ModalityCard tone="input" label="Clipboard">
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Paste text here…"
          value={value}
          onChangeText={onChange}
          multiline
        />
      </View>
      <View style={styles.rowJustify}>
        <Text style={styles.hint}>{Platform.OS === 'web' ? 'Use Paste button or Cmd/Ctrl+V' : 'Paste via system menu'}</Text>
        {Platform.OS === 'web' ? (
          <Pressable accessibilityRole="button" onPress={tryPaste} style={styles.btn}><Text style={styles.btnText}>Paste</Text></Pressable>
        ) : null}
      </View>
    </ModalityCard>
  );
}

const styles = StyleSheet.create({
  row: { marginTop: 4 },
  rowJustify: { marginTop: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  input: { minHeight: 64, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, color: '#111827' },
  hint: { color: '#6b7280', fontSize: 12 },
  btn: { backgroundColor: '#111827', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: '700' },
});

