import React, { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import ModalityCard from '../../ui/ModalityCard';

export type OutputImagePanelProps = {
  uri?: string | null;
  uris?: (string | null | undefined)[];
  alt?: string;
};

export default function OutputImagePanel({ uri, uris, alt = 'Last image' }: OutputImagePanelProps) {
  const [expanded, setExpanded] = useState(true);
  const list = useMemo(() => {
    const arr = (uris ?? []).filter(Boolean) as string[];
    if (uri) arr.unshift(uri);
    return Array.from(new Set(arr));
  }, [uri, uris]);

  return (
    <ModalityCard tone="output" label="Image">
      <Pressable accessibilityRole="button" onPress={() => setExpanded((v) => !v)}>
        <Text style={styles.headerText}>{expanded ? '▾' : '▸'} Generated Images</Text>
      </Pressable>
      {expanded ? (
        list.length > 0 ? (
          <View style={styles.grid}>
            {list.map((u, i) => (
              <Image key={i} source={{ uri: u }} style={[styles.img, expanded && styles.imgLg]} accessibilityLabel={alt} />
            ))}
          </View>
        ) : (
          <Text style={styles.hint}>No image to display</Text>
        )
      ) : null}
    </ModalityCard>
  );
}

const styles = StyleSheet.create({
  headerText: { color: '#111827', fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  img: { width: 120, height: 72, borderRadius: 6, backgroundColor: '#000' },
  imgLg: { width: 160, height: 96 },
  hint: { color: '#6b7280' },
});
