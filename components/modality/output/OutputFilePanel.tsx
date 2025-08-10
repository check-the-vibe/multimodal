import React, { useCallback, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import ModalityCard from '../../ui/ModalityCard';

export type OutputFile = { name: string; uri: string; size?: number };
export type OutputFilePanelProps = {
  files: OutputFile[];
  title?: string;
};

export default function OutputFilePanel({ files, title = 'Files' }: OutputFilePanelProps) {
  const [expanded, setExpanded] = useState(true);
  const [copyIndex, setCopyIndex] = useState<number | null>(null);

  const open = async (uri: string) => {
    try { await Linking.openURL(uri); } catch {}
  };

  return (
    <ModalityCard tone="output" label="Files">
      <Pressable accessibilityRole="button" onPress={() => setExpanded((v) => !v)}>
        <Text style={styles.headerText}>{expanded ? '▾' : '▸'} {title}</Text>
      </Pressable>
      {expanded ? (
        files.length === 0 ? (
          <Text style={styles.hint}>No files</Text>
        ) : (
          <View style={{ marginTop: 8, gap: 8 }}>
            {files.map((f, i) => (
              <View key={i} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name} numberOfLines={1}>{f.name}</Text>
                  <Text style={styles.meta} numberOfLines={1}>{f.size ? `${f.size} bytes · ` : ''}{f.uri}</Text>
                </View>
                <Pressable accessibilityRole="button" onPress={() => open(f.uri)} style={styles.btn}>
                  <Text style={styles.btnText}>Open</Text>
                </Pressable>
                <CopyBtn uri={f.uri} active={copyIndex === i} onStart={() => setCopyIndex(i)} onDone={() => setCopyIndex(null)} />
              </View>
            ))}
          </View>
        )
      ) : null}
    </ModalityCard>
  );
}

function CopyBtn({ uri, active, onStart, onDone }: { uri: string; active: boolean; onStart: () => void; onDone: () => void }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const copy = useCallback(async () => {
    try {
      onStart();
      if (typeof navigator !== 'undefined' && 'clipboard' in navigator) {
        await (navigator as any).clipboard.writeText(uri || '');
      }
      setStatus('copied');
      setTimeout(() => { setStatus('idle'); onDone(); }, 1000);
    } catch {
      setStatus('error');
      setTimeout(() => { setStatus('idle'); onDone(); }, 1000);
    }
  }, [uri, onStart, onDone]);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Pressable accessibilityRole="button" onPress={copy} style={styles.btn}>
        <Text style={styles.btnText}>Copy URL</Text>
      </Pressable>
      {active && (status === 'copied' ? <Text style={[styles.name, styles.ok]}>Copied</Text> : status === 'error' ? <Text style={[styles.name, styles.err]}>Error</Text> : null)}
    </View>
  );
}

const styles = StyleSheet.create({
  headerText: { color: '#111827', fontWeight: '700' },
  hint: { color: '#6b7280', marginTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { color: '#111827', fontWeight: '600' },
  meta: { color: '#6b7280', fontSize: 12 },
  btn: { backgroundColor: '#111827', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: '700' },
  ok: { color: '#059669' },
  err: { color: '#b91c1c' },
});
