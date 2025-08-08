import React from 'react';
import { Image, StyleSheet, Text } from 'react-native';
import ModalityCard from '../../ui/ModalityCard';

export type OutputImagePanelProps = {
  uri?: string | null;
  alt?: string;
};

export default function OutputImagePanel({ uri, alt = 'Last image' }: OutputImagePanelProps) {
  return (
    <ModalityCard tone="output" label="Image">
      {uri ? <Image source={{ uri }} style={styles.img} accessibilityLabel={alt} /> : <Text style={styles.hint}>No image to display</Text>}
    </ModalityCard>
  );
}

const styles = StyleSheet.create({
  img: { width: 160, height: 90, borderRadius: 6, backgroundColor: '#000' },
  hint: { color: '#6b7280' },
});

