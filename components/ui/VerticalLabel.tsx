import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export type VerticalLabelProps = {
  text: string;
  side: 'left' | 'right';
};

export default function VerticalLabel({ text, side }: VerticalLabelProps) {
  const rotate = side === 'left' ? '-90deg' : '90deg';
  const posStyle = side === 'left' ? styles.left : styles.right;
  return (
    <View pointerEvents="none" style={[styles.container, posStyle]}>
      <Text style={[styles.label, { transform: [{ rotate }] }]}>{text.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '50%',
    zIndex: 10,
    transform: [{ translateY: -10 }],
  },
  left: { left: -8 },
  right: { right: -8 },
  label: {
    color: '#9ca3af',
    letterSpacing: 2,
    fontSize: 12,
    fontWeight: '700',
  },
});
