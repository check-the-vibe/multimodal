import React, { useCallback, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import ModalityCard from '../../ui/ModalityCard';

export type OutputClipboardPanelProps = {
  text: string;
};

export default function OutputClipboardPanel({ text }: OutputClipboardPanelProps) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const copy = useCallback(async () => {
    try {
      if (Platform.OS === 'web' && 'clipboard' in navigator) {
        await (navigator as any).clipboard.writeText(text || '');
        setStatus('copied');
        setTimeout(() => setStatus('idle'), 1500);
      } else {
        setStatus('copied');
        setTimeout(() => setStatus('idle'), 1500);
      }
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 1500);
    }
  }, [text]);

  return (
    <ModalityCard tone="output" label="Clipboard">
      <View>
        <Text style={styles.body}>{text || '—'}</Text>
        <View style={styles.row}>
          <Pressable accessibilityRole="button" onPress={copy} style={styles.btn}><Text style={styles.btnText}>Copy</Text></Pressable>
          {status === 'copied' ? <Text style={styles.ok}>Copied</Text> : status === 'error' ? <Text style={styles.err}>Error</Text> : null}
        </View>
      </View>
    </ModalityCard>
  );
}

const styles = StyleSheet.create({
  body: { color: '#111827' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  btn: { backgroundColor: '#111827', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: '700' },
  ok: { color: '#059669', fontWeight: '700' },
  err: { color: '#b91c1c', fontWeight: '700' },
});

