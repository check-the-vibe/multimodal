import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import ModalityCard from '../../ui/ModalityCard';

export type AudioInputCardProps = {
  onAudioSelect?: (uri: string) => void;
};

export default function AudioInputCard({ onAudioSelect }: AudioInputCardProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [duration, setDuration] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (recording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [recording]);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Audio recording permission is required');
        return false;
      }
    }
    return true;
  };

  const startRecording = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (uri) {
        setAudioUri(uri);
        onAudioSelect?.(uri);
        
        const status = await recording.getStatusAsync();
        if (status.durationMillis) {
          setDuration(Math.round(status.durationMillis / 1000));
        }
      }
      setRecording(null);
    } catch (err) {
      console.error('Failed to stop recording', err);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const pickAudioFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setAudioUri(asset.uri);
        onAudioSelect?.(asset.uri);
        setDuration(0);
      }
    } catch (err) {
      console.error('Failed to pick audio file', err);
      Alert.alert('Error', 'Failed to pick audio file');
    }
  };

  const playPauseAudio = async () => {
    if (!audioUri) return;

    try {
      if (isPlaying && sound) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else if (!isPlaying && sound) {
        await sound.playAsync();
        setIsPlaying(true);
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audioUri },
          { shouldPlay: true }
        );
        setSound(newSound);
        setIsPlaying(true);

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
          }
        });
      }
    } catch (err) {
      console.error('Failed to play audio', err);
      Alert.alert('Error', 'Failed to play audio');
    }
  };

  const clearAudio = async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }
    setAudioUri(null);
    setIsPlaying(false);
    setDuration(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ModalityCard tone="input" label="Audio">
      <View style={styles.container}>
        {audioUri ? (
          <View style={styles.audioContainer}>
            <View style={styles.audioInfo}>
              <Text style={styles.audioIcon}>🎵</Text>
              <Text style={styles.audioText}>
                Audio recorded {duration > 0 && `(${formatTime(duration)})`}
              </Text>
            </View>
            <View style={styles.audioControls}>
              <TouchableOpacity style={styles.controlButton} onPress={playPauseAudio}>
                <Text style={styles.controlIcon}>{isPlaying ? '⏸️' : '▶️'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlButton} onPress={clearAudio}>
                <Text style={styles.controlIcon}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : recording ? (
          <View style={styles.recordingContainer}>
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>Recording... {formatTime(recordingTime)}</Text>
            </View>
            <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
              <Text style={styles.stopButtonText}>Stop Recording</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={startRecording}>
              <Text style={styles.buttonIcon}>🎤</Text>
              <Text style={styles.buttonText}>Record</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={pickAudioFile}>
              <Text style={styles.buttonIcon}>📁</Text>
              <Text style={styles.buttonText}>Upload</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ModalityCard>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 100,
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
    minWidth: 100,
  },
  buttonIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  buttonText: {
    fontSize: 12,
    color: '#374151',
  },
  recordingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ef4444',
    marginRight: 8,
  },
  recordingText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  stopButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  stopButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  audioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  audioInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  audioIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  audioText: {
    fontSize: 14,
    color: '#374151',
  },
  audioControls: {
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#e5e7eb',
  },
  controlIcon: {
    fontSize: 20,
  },
});