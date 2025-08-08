import React from 'react';
import { Image, ImageSourcePropType, SafeAreaView, StyleSheet, Text, View } from 'react-native';

export type LoadingOverlayProps = {
  visible: boolean;
  title?: string;
  subtitle?: string;
  logo?: ImageSourcePropType;
  backgroundColor?: string;
};

export default function LoadingOverlay({ visible, title, subtitle, logo, backgroundColor }: LoadingOverlayProps) {
  if (!visible) return null;
  return (
    <SafeAreaView style={[styles.container, backgroundColor ? { backgroundColor } : null]}>
      <View style={styles.content}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {logo ? <Image source={logo} style={styles.logo} resizeMode="contain" /> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { alignItems: 'center', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827' },
  subtitle: { marginTop: 4, fontSize: 13, color: '#6b7280' },
  logo: { marginTop: 10, width: 120, height: 120 },
});
