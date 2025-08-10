import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import ModalityCard from '../../ui/ModalityCard';

export type ChartDatum = { label: string; value: number };
export type OutputChartPanelProps = {
  data: ChartDatum[];
  title?: string;
  color?: string; // bar color
};

export default function OutputChartPanel({ data, title = 'Chart', color = '#2563eb' }: OutputChartPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const max = useMemo(() => Math.max(1, ...data.map((d) => d.value)), [data]);

  return (
    <ModalityCard tone="output" label="Chart">
      <Pressable accessibilityRole="button" onPress={() => setExpanded((v) => !v)}>
        <Text style={styles.headerText}>{expanded ? '▾' : '▸'} {title}</Text>
      </Pressable>
      {expanded ? (
        data.length === 0 ? (
          <Text style={styles.hint}>No data</Text>
        ) : (
          <View style={styles.chart}>
            {data.map((d, i) => {
              const pct = Math.max(0, d.value) / max;
              return (
                <View key={i} style={styles.barRow}>
                  <Text style={styles.barLabel} numberOfLines={1}>{d.label}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
                  </View>
                  <Text style={styles.barValue}>{d.value}</Text>
                </View>
              );
            })}
          </View>
        )
      ) : null}
    </ModalityCard>
  );
}

const styles = StyleSheet.create({
  headerText: { color: '#111827', fontWeight: '700' },
  hint: { color: '#6b7280', marginTop: 8 },
  chart: { marginTop: 8, gap: 8 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barLabel: { width: 72, color: '#111827' },
  barTrack: { flex: 1, height: 12, backgroundColor: '#e5e7eb', borderRadius: 999, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 999 },
  barValue: { width: 48, textAlign: 'right', color: '#111827' },
});

