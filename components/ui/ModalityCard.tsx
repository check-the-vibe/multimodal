import React, { ReactNode } from 'react';
import { Platform, StyleSheet, View, ViewStyle, Text } from 'react-native';

export type ModalityCardProps = {
  selected?: boolean;
  label?: string;
  tone?: 'neutral' | 'input' | 'output';
  style?: ViewStyle;
  children?: ReactNode;
};

export default function ModalityCard({ selected, label, tone = 'neutral', style, children }: ModalityCardProps) {
  return (
    <View style={[styles.card, selected ? styles.selected : styles.neighbor, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 120,
    ...Platform.select({
      ios: { 
        shadowColor: '#000', 
        shadowOpacity: 0.08, 
        shadowRadius: 8, 
        shadowOffset: { width: 0, height: 4 } 
      },
      android: { elevation: 4 },
      default: {},
    }),
  },
  selected: { 
    borderColor: '#6366f1',
    ...Platform.select({
      ios: { 
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
      default: {},
    }),
  },
  neighbor: { 
    opacity: 0.95,
  },
  label: { 
    fontWeight: '600', 
    fontSize: 15,
    marginBottom: 10, 
    color: '#111827' 
  },
});

