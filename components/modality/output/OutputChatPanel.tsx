import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ModalityCard from '../../ui/ModalityCard';

export type OutputChatPanelProps = {
  messages: string[];
  reverse?: boolean;
};

export default function OutputChatPanel({ messages, reverse = true }: OutputChatPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const list = reverse ? [...messages] : [...messages].reverse();
  return (
    <ModalityCard tone="output" label="Chat">
      <Pressable accessibilityRole="button" onPress={() => setExpanded((v) => !v)}>
        <Text style={styles.headerText}>{expanded ? '▾' : '▸'} Messages</Text>
      </Pressable>
      {expanded ? (
        <View>
          {list.length === 0 ? (
            <Text style={styles.hint}>No messages yet</Text>
          ) : (
            list.map((m, idx) => (
              <Text key={idx} style={styles.bubble}>• {m}</Text>
            ))
          )}
        </View>
      ) : null}
    </ModalityCard>
  );
}

const styles = StyleSheet.create({
  headerText: { color: '#111827', fontWeight: '700' },
  bubble: { backgroundColor: '#eef2ff', color: '#111827', padding: 8, borderRadius: 8, marginTop: 6 },
  hint: { color: '#6b7280' },
});
