import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import ModalityCard from '../../ui/ModalityCard';

export type FileInputCardProps = {
  onFileSelect?: (uri: string, name: string, mimeType?: string) => void;
  onSend?: () => void;
  isSending?: boolean;
};

export default function FileInputCard({ onFileSelect, onSend, isSending = false }: FileInputCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    name: string;
    size?: number;
    mimeType?: string;
  } | null>(null);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const fileInfo = {
          uri: asset.uri,
          name: asset.name,
          size: asset.size,
          mimeType: asset.mimeType,
        };
        setSelectedFile(fileInfo);
        onFileSelect?.(asset.uri, asset.name, asset.mimeType);
      }
    } catch (err) {
      console.error('Failed to pick document', err);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    const mb = kb / 1024;
    if (mb >= 1) {
      return `${mb.toFixed(2)} MB`;
    }
    return `${kb.toFixed(2)} KB`;
  };

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return '📄';
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📕';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📽️';
    if (mimeType.includes('zip') || mimeType.includes('archive')) return '🗂️';
    if (mimeType.includes('text')) return '📋';
    return '📄';
  };

  if (!isExpanded) {
    return (
      <ModalityCard tone="input" label="File">
        <TouchableOpacity style={styles.collapsedContainer} onPress={() => setIsExpanded(true)}>
          <Text style={styles.icon}>📁</Text>
          <Text style={styles.collapsedText}>Tap to upload file</Text>
        </TouchableOpacity>
      </ModalityCard>
    );
  }

  return (
    <ModalityCard tone="input" label="File">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>File Input</Text>
          <TouchableOpacity onPress={() => setIsExpanded(false)} style={styles.collapseButton}>
            <Text style={styles.collapseButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        {selectedFile ? (
          <View style={styles.fileContainer}>
            <View style={styles.fileInfo}>
              <Text style={styles.fileIcon}>{getFileIcon(selectedFile.mimeType)}</Text>
              <View style={styles.fileDetails}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {selectedFile.name}
                </Text>
                {selectedFile.size && (
                  <Text style={styles.fileSize}>{formatFileSize(selectedFile.size)}</Text>
                )}
              </View>
            </View>
            <View style={styles.fileActions}>
              <TouchableOpacity style={styles.clearButton} onPress={clearFile}>
                <Text style={styles.clearButtonText}>✕</Text>
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
        ) : (
          <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
            <Text style={styles.uploadIcon}>📁</Text>
            <Text style={styles.uploadText}>Choose File</Text>
            <Text style={styles.uploadHint}>PDF, DOC, XLS, TXT, etc.</Text>
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
  uploadButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: '#fafafa',
  },
  uploadIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  uploadHint: {
    fontSize: 12,
    color: '#6b7280',
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: '#6b7280',
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  clearButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: 'bold',
  },
  fileActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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