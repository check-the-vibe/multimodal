import React, { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View, Alert, TouchableOpacity, Linking, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import ModalityCard from '../../ui/ModalityCard';

export type OutputImagePanelProps = {
  uri?: string | null;
  uris?: (string | null | undefined)[];
  alt?: string;
  generatedImages?: any[]; // Can be strings or objects with url property
};

export default function OutputImagePanel({ uri, uris, alt = 'Last image', generatedImages }: OutputImagePanelProps) {
  const [expanded, setExpanded] = useState(true);
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);
  
  const list = useMemo(() => {
    let arr: string[] = [];
    
    // Add generated images first (from DALL-E)
    if (generatedImages?.length) {
      console.log('[OutputImagePanel] Processing', generatedImages.length, 'generated images');
      // Handle both string URLs and objects with url property
      const processedImages = generatedImages.map((img: any) => {
        if (typeof img === 'string') {
          return img;
        } else if (img && typeof img === 'object' && img.url) {
          console.log('[OutputImagePanel] Extracting URL from image object');
          return img.url;
        }
        return null;
      }).filter(Boolean);
      console.log('[OutputImagePanel] Adding', processedImages.length, 'valid image URLs');
      arr.push(...processedImages);
    }
    
    // Add other images
    if (uris?.length) {
      console.log('[OutputImagePanel] Adding', uris.filter(Boolean).length, 'other images');
      arr.push(...(uris.filter(Boolean) as string[]));
    }
    if (uri) {
      console.log('[OutputImagePanel] Adding single URI to front');
      arr.unshift(uri);
    }
    
    const uniqueList = Array.from(new Set(arr));
    console.log('[OutputImagePanel] Total unique images:', uniqueList.length);
    if (uniqueList.length > 0) {
      console.log('[OutputImagePanel] First image URL:', uniqueList[0]?.substring(0, 100));
    }
    return uniqueList;
  }, [uri, uris, generatedImages]);

  const downloadImage = async (imageUrl: string, index: number) => {
    console.log('[OutputImagePanel] Download requested for image', index + 1);
    console.log('[OutputImagePanel] Image URL:', imageUrl.substring(0, 100) + '...');
    
    // Validate URL
    if (!imageUrl || !imageUrl.startsWith('http')) {
      console.error('[OutputImagePanel] Invalid image URL:', imageUrl);
      Alert.alert('Error', 'Invalid image URL');
      return;
    }
    
    if (Platform.OS === 'web') {
      console.log('[OutputImagePanel] Web platform detected, opening in new tab');
      // For web, open in new tab
      window.open(imageUrl, '_blank');
      return;
    }

    console.log('[OutputImagePanel] Mobile platform, starting download...');
    setDownloadingIndex(index);
    try {
      // Request permissions
      console.log('[OutputImagePanel] Requesting media library permissions...');
      const { status } = await MediaLibrary.requestPermissionsAsync();
      console.log('[OutputImagePanel] Permission status:', status);
      
      if (status !== 'granted') {
        console.log('[OutputImagePanel] Permission denied');
        Alert.alert('Permission needed', 'Permission to access media library is required to download images');
        return;
      }

      // Download the image
      const filename = `generated_image_${Date.now()}.png`;
      console.log('[OutputImagePanel] Downloading to:', filename);
      
      const downloadResult = await FileSystem.downloadAsync(
        imageUrl,
        FileSystem.documentDirectory + filename
      );

      console.log('[OutputImagePanel] Download status:', downloadResult.status);
      console.log('[OutputImagePanel] Downloaded to:', downloadResult.uri);

      if (downloadResult.status === 200) {
        // Save to media library
        console.log('[OutputImagePanel] Saving to media library...');
        const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
        await MediaLibrary.createAlbumAsync('Downloaded Images', asset, false);
        
        console.log('[OutputImagePanel] Image saved successfully');
        Alert.alert('Success', 'Image saved to your photo gallery');
      } else {
        throw new Error(`Download failed with status ${downloadResult.status}`);
      }
    } catch (error) {
      console.error('[OutputImagePanel] Download error:', error);
      console.error('[OutputImagePanel] Error stack:', error instanceof Error ? error.stack : 'No stack');
      Alert.alert('Download Error', error instanceof Error ? error.message : 'Failed to download image');
    } finally {
      console.log('[OutputImagePanel] Resetting download state');
      setDownloadingIndex(null);
    }
  };

  return (
    <ModalityCard tone="output" label="Image">
      <Pressable accessibilityRole="button" onPress={() => {
        console.log('[OutputImagePanel] Toggle expanded:', !expanded);
        setExpanded((v) => !v);
      }}>
        <Text style={styles.headerText}>{expanded ? '▾' : '▸'} Generated Images</Text>
      </Pressable>
      {expanded ? (
        list.length > 0 ? (
          <View style={styles.grid}>
            {list.map((u, i) => (
              <View key={i} style={styles.imageContainer}>
                <Image 
                  source={{ uri: u }} 
                  style={[styles.img, expanded && styles.imgLg]} 
                  accessibilityLabel={alt}
                  resizeMode="cover"
                  onError={(e) => {
                    console.error('[OutputImagePanel] Image failed to load:', u);
                    console.error('[OutputImagePanel] Error details:', e.nativeEvent.error);
                  }}
                  onLoad={() => {
                    console.log('[OutputImagePanel] Image loaded successfully:', u.substring(0, 100));
                  }}
                />
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
  img: { width: 120, height: 72, borderRadius: 6, backgroundColor: '#f3f4f6' },
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
