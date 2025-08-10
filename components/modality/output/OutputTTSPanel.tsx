import React, { useCallback, useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import ModalityCard from '../../ui/ModalityCard';
import type { AgentMode } from '../agent/AgentModeSelector';
import { API_BASE_URL, MULTIMODAL_API_KEY } from '../../../services/config';

export type OutputTTSPanelProps = {
  status?: 'idle' | 'speaking' | 'error';
  hint?: string;
  agentMode?: AgentMode;
  textToSpeak?: string;
  voice?: string;
};

export default function OutputTTSPanel({ status = 'idle', hint = 'Uses expo-speech', agentMode, textToSpeak, voice = 'alloy' }: OutputTTSPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const generateTTS = useCallback(async () => {
    if (!textToSpeak || agentMode !== 'speak') return;
    
    setIsGenerating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/openai/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': MULTIMODAL_API_KEY,
        },
        body: JSON.stringify({
          input: textToSpeak,
          voice: voice,
          model: 'tts-1',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // The response should be the audio file
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(audioUrl);
    } catch (error) {
      console.error('TTS generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [textToSpeak, voice, agentMode]);

  const playGeneratedAudio = useCallback(async () => {
    if (!audioUrl) return;

    try {
      if (isPlaying && sound) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else if (!isPlaying && sound) {
        await sound.playAsync();
        setIsPlaying(true);
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
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
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  }, [audioUrl, sound, isPlaying]);

  const stop = useCallback(async () => {
    try { 
      await Speech.stop();
      if (sound) {
        await sound.stopAsync();
        setIsPlaying(false);
      }
    } catch {}
  }, [sound]);

  const testSpeak = useCallback(() => {
    try {
      Speech.speak('This is a test of text to speech.', {
        language: 'en-US',
        rate: 1.0,
      });
    } catch {}
  }, []);

  return (
    <ModalityCard tone="output" label="Audio (TTS)">
      <Pressable accessibilityRole="button" onPress={() => setExpanded((v) => !v)} style={styles.headerRow}>
        <Text style={styles.headerText}>{expanded ? '▾' : '▸'} Text to Speech</Text>
        <Text style={[styles.stat, status === 'speaking' ? styles.ok : status === 'error' ? styles.err : undefined]}>
          {status === 'speaking' ? 'Speaking…' : status === 'error' ? 'Error' : 'Idle'}
        </Text>
      </Pressable>
      {expanded ? (
        <View>
          <Text style={styles.hint}>
            {agentMode === 'speak' ? 'OpenAI TTS with selectable voices' : hint}
          </Text>
          <View style={styles.row}>
            {agentMode === 'speak' && textToSpeak ? (
              <>
                <Pressable 
                  accessibilityRole="button" 
                  onPress={generateTTS} 
                  style={[styles.btn, isGenerating && styles.btnDisabled]}
                  disabled={isGenerating}
                >
                  <Text style={styles.btnText}>
                    {isGenerating ? 'Generating...' : 'Generate Audio'}
                  </Text>
                </Pressable>
                {audioUrl && (
                  <Pressable 
                    accessibilityRole="button" 
                    onPress={playGeneratedAudio} 
                    style={styles.btn}
                  >
                    <Text style={styles.btnText}>
                      {isPlaying ? 'Pause' : 'Play'}
                    </Text>
                  </Pressable>
                )}
              </>
            ) : (
              <Pressable accessibilityRole="button" onPress={testSpeak} style={styles.btn}>
                <Text style={styles.btnText}>Test voice</Text>
              </Pressable>
            )}
            <Pressable accessibilityRole="button" onPress={stop} style={[styles.btn, styles.btnDanger]}>
              <Text style={styles.btnText}>Stop</Text>
            </Pressable>
          </View>
          {agentMode === 'speak' && (
            <View style={styles.voiceInfo}>
              <Text style={styles.voiceText}>Voice: {voice}</Text>
            </View>
          )}
        </View>
      ) : null}
    </ModalityCard>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerText: { color: '#111827', fontWeight: '700' },
  stat: { fontWeight: '700' },
  ok: { color: '#059669' },
  err: { color: '#b91c1c' },
  hint: { marginTop: 8, color: '#6b7280' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  btn: { backgroundColor: '#111827', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  btnDanger: { backgroundColor: '#991b1b' },
  btnDisabled: { backgroundColor: '#6b7280', opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: '700' },
  voiceInfo: { marginTop: 8, alignItems: 'center' },
  voiceText: { fontSize: 12, color: '#6b7280', fontWeight: '500' },
});
