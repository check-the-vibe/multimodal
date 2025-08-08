import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

export type PaginationDotsProps = {
  count: number;
  index: number;
  onDotPress?: (index: number) => void;
  tone?: 'light' | 'dark';
};

export default function PaginationDots({ count, index, onDotPress, tone = 'dark' }: PaginationDotsProps) {
  const arr = Array.from({ length: Math.max(0, count) });
  return (
    <View style={styles.row}>
      {arr.map((_, i) => {
        const active = i === index;
        return (
          <Pressable key={i} accessibilityRole="button" onPress={() => onDotPress?.(i)} style={[styles.dot, active ? styles.dotActive : null, tone === 'light' ? styles.dotLight : styles.dotDark]} />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 6, opacity: 0.4 },
  dotActive: { opacity: 1 },
  dotLight: { backgroundColor: '#d1d5db' },
  dotDark: { backgroundColor: '#374151' },
});
