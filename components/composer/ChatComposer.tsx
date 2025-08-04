import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export type ChatComposerProps = {
  value: string;
  onChange: (text: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
};

export default function ChatComposer({ value, onChange, onSend, disabled, placeholder }: ChatComposerProps) {
  return (
    <View style={styles.row}>
      <TextInput
        style={[styles.input, disabled ? styles.inputDisabled : null]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder ?? 'Type a message…'}
        editable={!disabled}
      />
      <Pressable accessibilityRole="button" onPress={onSend} disabled={!!disabled} style={[styles.btn, disabled ? styles.btnDisabled : null]}>
        <Text style={styles.btnText}>Send</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, color: '#111827' },
  inputDisabled: { opacity: 0.5 },
  btn: { backgroundColor: '#111827', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8 },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: '#fff', fontWeight: '600' },
});

