import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, StyleSheet, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import ModalityCard from '../../ui/ModalityCard';
import type { AgentMode } from '../agent/AgentModeSelector';
import { API_BASE_URL, MULTIMODAL_API_KEY } from '../../../services/config';

export type ImageInputCardProps = {
  onImageSelect?: (uri: string) => void;
  onSend?: () => void;
  isSending?: boolean;
  agentMode?: AgentMode;
  onVisionAnalysis?: (analysis: string) => void;
};

export default function ImageInputCard({ onImageSelect, onSend, isSending = false, agentMode, onVisionAnalysis }: ImageInputCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [inputMode, setInputMode] = useState<'buttons' | 'url'>('buttons');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  React.useEffect(() => {
    console.log('[ImageInputCard] Component mounted, agentMode:', agentMode);
  }, []);
  
  React.useEffect(() => {
    console.log('[ImageInputCard] Agent mode changed to:', agentMode);
  }, [agentMode]);

  const analyzeWithVision = async () => {
    if (!imageUri || !onVisionAnalysis) return;
    
    console.log('[ImageInputCard] Starting vision analysis...');
    console.log('[ImageInputCard] Image URI:', imageUri.substring(0, 100) + (imageUri.length > 100 ? '...' : ''));
    
    setIsAnalyzing(true);
    try {
      // Prepare the image content based on whether it's a URL or local file
      let imageContent;
      let imageType = 'unknown';
      
      if (imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
        // URL image
        imageType = 'url';
        imageContent = {
          type: 'image',
          image: {
            url: imageUri
          }
        };
        console.log('[ImageInputCard] Image type: URL');
      } else if (imageUri.startsWith('data:image')) {
        // Base64 image
        imageType = 'base64';
        imageContent = {
          type: 'image',
          image: imageUri
        };
        console.log('[ImageInputCard] Image type: Base64, size:', Math.round(imageUri.length / 1024), 'KB');
      } else {
        // Local file - convert to base64
        imageType = 'local';
        console.log('[ImageInputCard] Image type: Local file, converting to base64...');
        try {
          const base64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          // Add data URI prefix
          const mimeType = imageUri.toLowerCase().endsWith('.png') ? 'png' : 'jpeg';
          imageContent = {
            type: 'image',
            image: `data:image/${mimeType};base64,${base64}`
          };
          console.log('[ImageInputCard] Converted to base64, size:', Math.round(base64.length / 1024), 'KB');
        } catch (err) {
          console.error('[ImageInputCard] Failed to convert local image to base64:', err);
          // Fallback to URL format
          imageContent = {
            type: 'image',
            image: {
              url: imageUri
            }
          };
          console.log('[ImageInputCard] Falling back to URL format');
        }
      }

      const requestBody = {
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this image and describe what you see in detail.' },
            imageContent
          ]
        }],
        mode: 'analyze',
        stream: false
      };
      
      console.log('[ImageInputCard] Sending vision API request...');
      console.log('[ImageInputCard] Request URL:', `${API_BASE_URL}/api/openai/vision`);
      console.log('[ImageInputCard] Request mode:', requestBody.mode);
      console.log('[ImageInputCard] Message count:', requestBody.messages.length);
      
      const response = await fetch(`${API_BASE_URL}/api/openai/vision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': MULTIMODAL_API_KEY,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('[ImageInputCard] Response status:', response.status);
      console.log('[ImageInputCard] Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('[ImageInputCard] Vision API error:', response.status);
        console.error('[ImageInputCard] Error details:', errorData);
        throw new Error(`Vision API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      console.log('[ImageInputCard] Response received successfully');
      console.log('[ImageInputCard] Response data keys:', Object.keys(data));
      console.log('[ImageInputCard] Analysis length:', data.message?.length || data.analysis?.length || 0);
      
      const analysisResult = data.message || data.analysis || 'Analysis complete';
      console.log('[ImageInputCard] Passing analysis to callback, first 100 chars:', analysisResult.substring(0, 100));
      onVisionAnalysis(analysisResult);
    } catch (error) {
      console.error('[ImageInputCard] Vision analysis error:', error);
      console.error('[ImageInputCard] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      Alert.alert('Analysis Error', error instanceof Error ? error.message : 'Failed to analyze image');
    } finally {
      console.log('[ImageInputCard] Analysis complete, resetting state');
      setIsAnalyzing(false);
    }
  };

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
    console.log('[ImageInputCard] Taking photo...');
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      console.log('[ImageInputCard] Camera permission denied');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      console.log('[ImageInputCard] Photo captured:', uri);
      console.log('[ImageInputCard] Photo dimensions:', result.assets[0].width, 'x', result.assets[0].height);
      setImageUri(uri);
      onImageSelect?.(uri);
    } else {
      console.log('[ImageInputCard] Photo capture canceled');
    }
  };

  const pickImage = async () => {
    console.log('[ImageInputCard] Picking image from gallery...');
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      console.log('[ImageInputCard] Gallery permission denied');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      console.log('[ImageInputCard] Image selected:', uri);
      console.log('[ImageInputCard] Image dimensions:', result.assets[0].width, 'x', result.assets[0].height);
      setImageUri(uri);
      onImageSelect?.(uri);
    } else {
      console.log('[ImageInputCard] Image selection canceled');
    }
  };

  const loadFromUrl = () => {
    if (urlInput.trim()) {
      const url = urlInput.trim();
      console.log('[ImageInputCard] Loading image from URL:', url);
      setImageUri(url);
      onImageSelect?.(url);
      setUrlInput('');
      setInputMode('buttons');
    } else {
      console.log('[ImageInputCard] Empty URL input, ignoring');
    }
  };

  const clearImage = () => {
    setImageUri(null);
    setUrlInput('');
  };

  if (!isExpanded) {
    return (
      <ModalityCard tone="input" label="Image">
        <TouchableOpacity style={styles.collapsedContainer} onPress={() => {
          console.log('[ImageInputCard] Expanding card');
          setIsExpanded(true);
        }}>
          <Text style={styles.icon}>📷</Text>
          <Text style={styles.collapsedText}>Tap to add image</Text>
        </TouchableOpacity>
      </ModalityCard>
    );
  }

  return (
    <ModalityCard tone="input" label="Image">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Image Input</Text>
          <TouchableOpacity onPress={() => setIsExpanded(false)} style={styles.collapseButton}>
            <Text style={styles.collapseButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        {imageUri ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.image} />
            <View style={styles.imageActions}>
              <TouchableOpacity style={styles.clearButton} onPress={clearImage}>
                <Text style={styles.clearButtonText}>✕ Clear</Text>
              </TouchableOpacity>
              {agentMode === 'vision' && onVisionAnalysis && (
                <TouchableOpacity 
                  style={[styles.visionButton, isAnalyzing && styles.sendButtonDisabled]} 
                  onPress={!isAnalyzing ? analyzeWithVision : undefined}
                  disabled={isAnalyzing}
                >
                  <Text style={styles.visionButtonText}>
                    {isAnalyzing ? 'Analyzing...' : '👁️ Analyze'}
                  </Text>
                </TouchableOpacity>
              )}
              {onSend && agentMode !== 'vision' && (
                <TouchableOpacity 
                  style={[styles.sendButton, isSending && styles.sendButtonDisabled]} 
                  onPress={!isSending ? onSend : undefined}
                  disabled={isSending}
                >
                  <Text style={styles.sendButtonText}>
                    {isSending ? 'Sending...' : 'Send ➤'}
                  </Text>
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
  collapsedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    minHeight: 150,
  },
  icon: {
    fontSize: 48,
    marginBottom: 8,
  },
  collapsedText: {
    color: '#6b7280',
    fontSize: 14,
  },
  container: {
    minHeight: 150,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  collapseButton: {
    padding: 4,
  },
  collapseButtonText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '600',
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
  sendButtonDisabled: {
    opacity: 0.6,
  },
  visionButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  visionButtonText: {
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