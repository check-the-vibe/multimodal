import React, { useState } from 'react';
import { TextInput, StyleSheet, View, Pressable, Text } from 'react-native';
import ModalityCard from '../../ui/ModalityCard';

export type InputTextCardProps = {
  value: string;
  onChange: (text: string) => void;
  onSend?: () => void;
  isSending?: boolean;
  placeholder?: string;
};

export default function InputTextCard({ value, onChange, onSend, isSending = false, placeholder }: InputTextCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isExpanded) {
    return (
      <ModalityCard tone="input" label="Text">
        <Pressable style={styles.collapsedContainer} onPress={() => setIsExpanded(true)}>
          <Text style={styles.icon}>✏️</Text>
          <Text style={styles.collapsedText}>Tap to type</Text>
        </Pressable>
      </ModalityCard>
    );
  }

  return (
    <ModalityCard tone="input" label="Text">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Text Input</Text>
          <Pressable onPress={() => setIsExpanded(false)} style={styles.collapseButton}>
            <Text style={styles.collapseButtonText}>✕</Text>
          </Pressable>
        </View>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder ?? 'Type here…'}
          multiline
          numberOfLines={4}
          editable={!isSending}
        />
        {onSend && (
          <Pressable 
            style={[
              styles.sendButton, 
              (!value.trim() || isSending) && styles.sendButtonDisabled
            ]} 
            onPress={!isSending && value.trim() ? onSend : undefined}
            disabled={isSending || !value.trim()}
          >
            <Text style={styles.sendButtonText}>
              {isSending ? 'Sending...' : 'Send ➤'}
            </Text>
          </Pressable>
        )}
      </View>
    </ModalityCard>
  );
}

const styles = StyleSheet.create({
  collapsedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    minHeight: 150,
  },
  icon: {
    fontSize: 48,
    marginBottom: 8,
  },
  collapsedText: {
    color: '#6b7280',
    fontSize: 14,
  },
  container: { 
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  collapseButton: {
    padding: 4,
  },
  collapseButtonText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '600',
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#d1d5db', 
    borderRadius: 8, 
    padding: 10, 
    color: '#111827',
    minHeight: 100,
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

