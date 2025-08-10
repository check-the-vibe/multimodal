import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, StyleSheet, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import ModalityCard from '../../ui/ModalityCard';

export type ImageInputCardProps = {
  onImageSelect?: (uri: string) => void;
  onSend?: () => void;
};

export default function ImageInputCard({ onImageSelect, onSend }: ImageInputCardProps) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [inputMode, setInputMode] = useState<'buttons' | 'url'>('buttons');

  const requestCameraPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take photos');
        return false;
      }
    }
    return true;
  };

  const requestGalleryPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Gallery permission is required to select photos');
        return false;
      }
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      onImageSelect?.(uri);
    }
  };

  const pickImage = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      onImageSelect?.(uri);
    }
  };

  const loadFromUrl = () => {
    if (urlInput.trim()) {
      setImageUri(urlInput.trim());
      onImageSelect?.(urlInput.trim());
      setUrlInput('');
      setInputMode('buttons');
    }
  };

  const clearImage = () => {
    setImageUri(null);
    setUrlInput('');
  };

  return (
    <ModalityCard tone="input" label="Image">
      <View style={styles.container}>
        {imageUri ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.image} />
            <View style={styles.imageActions}>
              <TouchableOpacity style={styles.clearButton} onPress={clearImage}>
                <Text style={styles.clearButtonText}>✕ Clear</Text>
              </TouchableOpacity>
              {onSend && (
                <TouchableOpacity style={styles.sendButton} onPress={onSend}>
                  <Text style={styles.sendButtonText}>Send ➤</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          <>
            {inputMode === 'buttons' ? (
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={takePhoto}>
                  <Text style={styles.buttonIcon}>📷</Text>
                  <Text style={styles.buttonText}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={pickImage}>
                  <Text style={styles.buttonIcon}>🖼️</Text>
                  <Text style={styles.buttonText}>Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => setInputMode('url')}>
                  <Text style={styles.buttonIcon}>🔗</Text>
                  <Text style={styles.buttonText}>URL</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.urlContainer}>
                <TextInput
                  style={styles.urlInput}
                  value={urlInput}
                  onChangeText={setUrlInput}
                  placeholder="Enter image URL..."
                  onSubmitEditing={loadFromUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <View style={styles.urlButtons}>
                  <TouchableOpacity style={styles.urlButton} onPress={loadFromUrl}>
                    <Text style={styles.urlButtonText}>Load</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.urlButton} onPress={() => setInputMode('buttons')}>
                    <Text style={styles.urlButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}
      </View>
    </ModalityCard>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 120,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  button: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    minWidth: 80,
  },
  buttonIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  buttonText: {
    fontSize: 12,
    color: '#374151',
  },
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 10,
  },
  clearButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  sendButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  urlContainer: {
    padding: 10,
  },
  urlInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    color: '#111827',
  },
  urlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  urlButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  urlButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});