import React from 'react';
import { TextInput, StyleSheet, View, Pressable, Text } from 'react-native';
import ModalityCard from '../../ui/ModalityCard';

export type InputTextCardProps = {
  value: string;
  onChange: (text: string) => void;
  onSend?: () => void;
  placeholder?: string;
};

export default function InputTextCard({ value, onChange, onSend, placeholder }: InputTextCardProps) {
  return (
    <ModalityCard tone="input" label="Text">
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder ?? 'Type here…'}
          multiline
          numberOfLines={3}
        />
        {onSend && (
          <Pressable 
            style={[styles.sendButton, !value.trim() && styles.sendButtonDisabled]} 
            onPress={value.trim() ? onSend : undefined}
          >
            <Text style={styles.sendButtonText}>Send ➤</Text>
          </Pressable>
        )}
      </View>
    </ModalityCard>
  );
}

const styles = StyleSheet.create({
  container: { 
    gap: 12,
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#d1d5db', 
    borderRadius: 8, 
    padding: 10, 
    color: '#111827',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#d1d5db',
    opacity: 0.6,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

