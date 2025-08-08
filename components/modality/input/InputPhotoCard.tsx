import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import ModalityCard from '../../ui/ModalityCard';

export type InputPhotoCardProps = {
  thumbnailUri?: string | null;
  onCapture: () => void;
  onPick?: () => void;
};

export default function InputPhotoCard({ thumbnailUri, onCapture, onPick }: InputPhotoCardProps) {
  return (
    <ModalityCard tone="input" label="Photo">
      <View style={styles.row}>
        <Pressable accessibilityRole="button" onPress={onCapture} style={styles.btn}><Text style={styles.btnText}>Capture</Text></Pressable>
        {onPick ? (
          <Pressable accessibilityRole="button" onPress={onPick} style={styles.btnAlt}><Text style={styles.btnAltText}>Pick</Text></Pressable>
        ) : null}
      </View>
      {thumbnailUri ? (
        <Image source={{ uri: thumbnailUri }} style={styles.thumb} />
      ) : (
        <Text style={styles.hint}>No photo yet</Text>
      )}
    </ModalityCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btn: { backgroundColor: '#111827', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: '600' },
  btnAlt: { backgroundColor: '#e5e7eb', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  btnAltText: { color: '#111827', fontWeight: '600' },
  thumb: { width: 160, height: 90, marginTop: 10, borderRadius: 6, backgroundColor: '#000' },
  hint: { marginTop: 8, color: '#6b7280' },
});

