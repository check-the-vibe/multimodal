import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export type TabItem = { id: string; label: string };

export type TabsBarProps = {
  tabs: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
};

export default function TabsBar({ tabs, activeId, onChange }: TabsBarProps) {
  return (
    <View style={styles.row}>
      {tabs.map((t) => {
        const active = activeId === t.id;
        return (
          <Pressable key={t.id} accessibilityRole="tab" onPress={() => onChange(t.id)} style={[styles.tab, active ? styles.tabActive : null]}>
            <Text style={[styles.text, active ? styles.textActive : null]}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  tab: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#e5e7eb' },
  tabActive: { backgroundColor: '#111827' },
  text: { color: '#111827', fontWeight: '600' },
  textActive: { color: '#fff' },
});

