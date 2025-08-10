import React, { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View, Alert, TouchableOpacity, Linking, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import ModalityCard from '../../ui/ModalityCard';

export type OutputImagePanelProps = {
  uri?: string | null;
  uris?: (string | null | undefined)[];
  alt?: string;
  generatedImages?: string[];
};

export default function OutputImagePanel({ uri, uris, alt = 'Last image', generatedImages }: OutputImagePanelProps) {
  const [expanded, setExpanded] = useState(true);
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);
  
  const list = useMemo(() => {
    let arr: string[] = [];
    
    // Add generated images first (from DALL-E)
    if (generatedImages?.length) {
      arr.push(...generatedImages.filter(Boolean));
    }
    
    // Add other images
    if (uris?.length) {
      arr.push(...(uris.filter(Boolean) as string[]));
    }
    if (uri) {
      arr.unshift(uri);
    }
    
    return Array.from(new Set(arr));
  }, [uri, uris, generatedImages]);

  const downloadImage = async (imageUrl: string, index: number) => {
    if (Platform.OS === 'web') {
      // For web, open in new tab
      Linking.openURL(imageUrl);
      return;
    }

    setDownloadingIndex(index);
    try {
      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Permission to access media library is required to download images');
        return;
      }

      // Download the image
      const filename = `generated_image_${Date.now()}.png`;
      const downloadResult = await FileSystem.downloadAsync(
        imageUrl,
        FileSystem.documentDirectory + filename
      );

      if (downloadResult.status === 200) {
        // Save to media library
        const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
        await MediaLibrary.createAlbumAsync('Downloaded Images', asset, false);
        
        Alert.alert('Success', 'Image saved to your photo gallery');
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Download Error', error instanceof Error ? error.message : 'Failed to download image');
    } finally {
      setDownloadingIndex(null);
    }
  };

  return (
    <ModalityCard tone="output" label="Image">
      <Pressable accessibilityRole="button" onPress={() => setExpanded((v) => !v)}>
        <Text style={styles.headerText}>{expanded ? '▾' : '▸'} Generated Images</Text>
      </Pressable>
      {expanded ? (
        list.length > 0 ? (
          <View style={styles.grid}>
            {list.map((u, i) => (
              <View key={i} style={styles.imageContainer}>
                <Image source={{ uri: u }} style={[styles.img, expanded && styles.imgLg]} accessibilityLabel={alt} />
                {generatedImages?.includes(u) && (
                  <TouchableOpacity 
                    style={styles.downloadButton}
                    onPress={() => downloadImage(u, i)}
                    disabled={downloadingIndex === i}
                  >
                    <Text style={styles.downloadButtonText}>
                      {downloadingIndex === i ? '⬇️' : '💾'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
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
  imageContainer: { 
    position: 'relative',
  },
  img: { width: 120, height: 72, borderRadius: 6, backgroundColor: '#000' },
  imgLg: { width: 160, height: 96 },
  downloadButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadButtonText: {
    fontSize: 12,
    color: 'white',
  },
  hint: { color: '#6b7280' },
});
