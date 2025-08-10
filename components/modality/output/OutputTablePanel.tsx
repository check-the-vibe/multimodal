import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import ModalityCard from '../../ui/ModalityCard';

export type OutputTablePanelProps = {
  rows: Array<Record<string, any>>;
  title?: string;
};

export default function OutputTablePanel({ rows, title = 'Table' }: OutputTablePanelProps) {
  const [expanded, setExpanded] = useState(true);
  const cols = useMemo(() => {
    const first = rows[0] || {};
    return Object.keys(first);
  }, [rows]);

  return (
    <ModalityCard tone="output" label="Table">
      <Pressable accessibilityRole="button" onPress={() => setExpanded((v) => !v)}>
        <Text style={styles.headerText}>{expanded ? '▾' : '▸'} {title}</Text>
      </Pressable>
      {expanded ? (
        rows.length === 0 ? (
          <Text style={styles.hint}>No rows</Text>
        ) : (
          <View style={styles.table}>
            <ScrollView horizontal>
              <View>
                <View style={[styles.row, styles.headerRow]}>
                  {cols.map((c) => (
                    <Text key={c} style={[styles.cell, styles.headerCell]}>{c}</Text>
                  ))}
                </View>
                {rows.map((r, i) => (
                  <View key={i} style={styles.row}>
                    {cols.map((c) => (
                      <Text key={c} style={styles.cell} numberOfLines={2}>
                        {String(r[c] ?? '')}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )
      ) : null}
    </ModalityCard>
  );
}

const styles = StyleSheet.create({
  headerText: { color: '#111827', fontWeight: '700' },
  hint: { color: '#6b7280', marginTop: 8 },
  table: { marginTop: 8, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, overflow: 'hidden' },
  row: { flexDirection: 'row' },
  headerRow: { backgroundColor: '#f3f4f6' },
  cell: { minWidth: 120, paddingVertical: 8, paddingHorizontal: 10, borderRightWidth: 1, borderRightColor: '#e5e7eb', color: '#111827' },
  headerCell: { fontWeight: '700' },
});

