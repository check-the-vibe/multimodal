import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import ModalityCard from '../../ui/ModalityCard';

export type InputTextCardProps = {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
};

export default function InputTextCard({ value, onChange, placeholder }: InputTextCardProps) {
  return (
    <ModalityCard tone="input" label="Text">
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder ?? 'Type here…'}
      />
    </ModalityCard>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, color: '#111827' },
});

