import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ModalityCard from '../../ui/ModalityCard';

export type OutputChatPanelProps = {
  messages: string[];
  reverse?: boolean;
};

export default function OutputChatPanel({ messages, reverse = true }: OutputChatPanelProps) {
  const list = reverse ? [...messages] : [...messages].reverse();
  return (
    <ModalityCard tone="output" label="Chat">
      <View>
        {list.length === 0 ? (
          <Text style={styles.hint}>No messages yet</Text>
        ) : (
          list.map((m, idx) => (
            <Text key={idx} style={styles.bubble}>• {m}</Text>
          ))
        )}
      </View>
    </ModalityCard>
  );
}

const styles = StyleSheet.create({
  bubble: { backgroundColor: '#eef2ff', color: '#111827', padding: 8, borderRadius: 8, marginTop: 6 },
  hint: { color: '#6b7280' },
});

