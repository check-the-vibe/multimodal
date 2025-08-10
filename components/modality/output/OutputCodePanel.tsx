import React, { useMemo, useState, useCallback } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import ModalityCard from '../../ui/ModalityCard';

export type OutputCodePanelProps = {
  code: string;
  language?: string; // e.g., 'js', 'ts', 'json', 'py'
};

function highlight(code: string, language?: string) {
  // Extremely lightweight keyword coloring for common langs. Avoids deps.
  const kw = {
    js: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'import', 'from', 'export', 'class', 'new', 'await', 'async', 'try', 'catch'],
    ts: ['interface', 'type', 'extends', 'implements', 'public', 'private', 'protected'].concat(['const','let','var','function','return','if','else','import','from','export','class','new','await','async','try','catch']),
    json: [],
    py: ['def', 'return', 'if', 'elif', 'else', 'import', 'from', 'class', 'try', 'except', 'await', 'async'],
  } as Record<string, string[]>;
  const lang = (language || 'js').toLowerCase();
  const keys = kw[lang] ?? kw['js'];
  const pattern = new RegExp(`\\b(${keys.join('|')})\\b`, 'g');
  const tokens: { text: string; type: 'kw' | 'str' | 'plain' }[] = [];
  // Simple string highlighting for quotes
  let i = 0;
  while (i < code.length) {
    const ch = code[i];
    if (ch === '"' || ch === '\'' || ch === '`') {
      const quote = ch;
      let j = i + 1;
      while (j < code.length && code[j] !== quote) j++;
      tokens.push({ text: code.slice(i, Math.min(j + 1, code.length)), type: 'str' });
      i = Math.min(j + 1, code.length);
    } else {
      // grab till next quote or EOL chunk
      let j = i;
      while (j < code.length && !['"', '\'', '`'].includes(code[j])) j++;
      const chunk = code.slice(i, j);
      if (keys.length) {
        let last = 0;
        for (const m of chunk.matchAll(pattern)) {
          const idx = m.index ?? 0;
          if (idx > last) tokens.push({ text: chunk.slice(last, idx), type: 'plain' });
          tokens.push({ text: m[0], type: 'kw' });
          last = idx + m[0].length;
        }
        if (last < chunk.length) tokens.push({ text: chunk.slice(last), type: 'plain' });
      } else {
        tokens.push({ text: chunk, type: 'plain' });
      }
      i = j;
    }
  }
  return tokens;
}

export default function OutputCodePanel({ code, language }: OutputCodePanelProps) {
  const [expanded, setExpanded] = useState(true);
  const tokens = useMemo(() => highlight(code || '', language), [code, language]);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const copy = useCallback(async () => {
    try {
      if (typeof navigator !== 'undefined' && 'clipboard' in navigator) {
        await (navigator as any).clipboard.writeText(code || '');
      }
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 1200);
    } catch {
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 1200);
    }
  }, [code]);

  return (
    <ModalityCard tone="output" label="Code">
      <Pressable accessibilityRole="button" onPress={() => setExpanded((v) => !v)}>
        <Text style={styles.headerText}>{expanded ? '▾' : '▸'} {language ? language.toUpperCase() : 'Code'}</Text>
      </Pressable>
      {expanded ? (
        <View style={styles.box}>
          <ScrollView horizontal style={styles.scroll} contentContainerStyle={{ padding: 8 }}>
            <Text style={styles.code} selectable>
              {tokens.map((t, i) => (
                <Text key={i} style={t.type === 'kw' ? styles.kw : t.type === 'str' ? styles.str : undefined}>{t.text}</Text>
              ))}
            </Text>
          </ScrollView>
          <View style={styles.row}>
            <Pressable accessibilityRole="button" onPress={copy} style={styles.btn}><Text style={styles.btnText}>Copy</Text></Pressable>
            {copyStatus === 'copied' ? <Text style={[styles.stat, styles.ok]}>Copied</Text> : copyStatus === 'error' ? <Text style={[styles.stat, styles.err]}>Error</Text> : null}
          </View>
        </View>
      ) : null}
    </ModalityCard>
  );
}

const styles = StyleSheet.create({
  headerText: { color: '#111827', fontWeight: '700' },
  box: { marginTop: 8, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, backgroundColor: '#0b1020' },
  scroll: { borderRadius: 8 },
  code: { color: '#e5e7eb', fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) as any, fontSize: 13, lineHeight: 18 },
  kw: { color: '#93c5fd', fontWeight: '700' },
  str: { color: '#34d399' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8, justifyContent: 'flex-end' },
  btn: { backgroundColor: '#111827', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: '700' },
  stat: { fontWeight: '700' },
  ok: { color: '#059669' },
  err: { color: '#b91c1c' },
});
