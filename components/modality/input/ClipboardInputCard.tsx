import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import ModalityCard from '../../ui/ModalityCard';

export type ClipboardInputCardProps = {
  onClipboardPaste?: (content: string, type: 'text' | 'image' | 'html') => void;
  onSend?: () => void;
  isSending?: boolean;
};

export default function ClipboardInputCard({ onClipboardPaste, onSend, isSending = false }: ClipboardInputCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [clipboardContent, setClipboardContent] = useState<{
    type: 'text' | 'image' | 'html';
    content: string;
    preview?: string;
  } | null>(null);

  const pasteFromClipboard = async () => {
    try {
      const hasString = await Clipboard.hasStringAsync();
      
      if (hasString) {
        const text = await Clipboard.getStringAsync();
        
        if (text) {
          let contentType: 'text' | 'image' | 'html' = 'text';
          let preview = text;
          
          // Check if it's HTML
          if (text.includes('<') && text.includes('>')) {
            contentType = 'html';
            // Strip HTML tags for preview
            preview = text.replace(/<[^>]*>/g, '').substring(0, 200);
          }
          
          // Check if it's an image URL
          if (text.match(/^https?:\/\/.*\.(jpg|jpeg|png|gif|webp|svg)/i)) {
            contentType = 'image';
            preview = text;
          }
          
          setClipboardContent({
            type: contentType,
            content: text,
            preview: preview,
          });
          
          onClipboardPaste?.(text, contentType);
        } else {
          Alert.alert('Clipboard Empty', 'No content found in clipboard');
        }
      } else {
        Alert.alert('Clipboard Empty', 'No content found in clipboard');
      }
    } catch (err) {
      console.error('Failed to paste from clipboard', err);
      Alert.alert('Error', 'Failed to paste from clipboard');
    }
  };

  const clearContent = () => {
    setClipboardContent(null);
  };

  const copyToClipboard = async () => {
    if (clipboardContent) {
      await Clipboard.setStringAsync(clipboardContent.content);
      Alert.alert('Copied', 'Content copied back to clipboard');
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'image': return '🖼️';
      case 'html': return '🌐';
      default: return '📝';
    }
  };

  if (!isExpanded) {
    return (
      <ModalityCard tone="input" label="Clipboard">
        <TouchableOpacity style={styles.collapsedContainer} onPress={() => setIsExpanded(true)}>
          <Text style={styles.icon}>📋</Text>
          <Text style={styles.collapsedText}>Tap to paste</Text>
        </TouchableOpacity>
      </ModalityCard>
    );
  }

  return (
    <ModalityCard tone="input" label="Clipboard">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Clipboard Input</Text>
          <TouchableOpacity onPress={() => setIsExpanded(false)} style={styles.collapseButton}>
            <Text style={styles.collapseButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        {clipboardContent ? (
          <View style={styles.contentContainer}>
            <View style={styles.contentHeader}>
              <View style={styles.contentInfo}>
                <Text style={styles.contentIcon}>{getContentIcon(clipboardContent.type)}</Text>
                <Text style={styles.contentType}>
                  {clipboardContent.type.charAt(0).toUpperCase() + clipboardContent.type.slice(1)} Content
                </Text>
              </View>
              <View style={styles.contentActions}>
                <TouchableOpacity style={styles.actionButton} onPress={copyToClipboard}>
                  <Text style={styles.actionIcon}>📋</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={clearContent}>
                  <Text style={styles.actionIcon}>✕</Text>
                </TouchableOpacity>
                {onSend && (
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
            
            <ScrollView style={styles.previewContainer} showsVerticalScrollIndicator={false}>
              {clipboardContent.type === 'image' ? (
                <Image 
                  source={{ uri: clipboardContent.content }} 
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.textPreview} numberOfLines={6}>
                  {clipboardContent.preview}
                </Text>
              )}
            </ScrollView>
            
            {clipboardContent.content.length > 200 && clipboardContent.type !== 'image' && (
              <Text style={styles.truncatedText}>
                ({clipboardContent.content.length} characters total)
              </Text>
            )}
          </View>
        ) : (
          <TouchableOpacity style={styles.pasteButton} onPress={pasteFromClipboard}>
            <Text style={styles.pasteIcon}>📋</Text>
            <Text style={styles.pasteText}>Paste from Clipboard</Text>
            <Text style={styles.pasteHint}>Text, HTML, Images, Links</Text>
          </TouchableOpacity>
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
    minHeight: 100,
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
  pasteButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: '#fafafa',
  },
  pasteIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  pasteText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  pasteHint: {
    fontSize: 12,
    color: '#6b7280',
  },
  contentContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  contentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  contentType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  contentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 6,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
  },
  actionIcon: {
    fontSize: 16,
  },
  previewContainer: {
    maxHeight: 150,
    backgroundColor: 'white',
    borderRadius: 6,
    padding: 10,
  },
  textPreview: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  imagePreview: {
    width: '100%',
    height: 130,
    borderRadius: 6,
  },
  truncatedText: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 6,
    fontStyle: 'italic',
  },
  sendButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
});