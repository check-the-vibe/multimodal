import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaView, StyleSheet, Text, View, Image, Platform, Pressable, Alert, useWindowDimensions, Switch, ScrollView, KeyboardAvoidingView } from 'react-native';
// Video rendering uses expo-video, loaded dynamically in LazyVideo to avoid test env issues
import LoadingOverlay from './components/LoadingOverlay';
import StackPager from './components/ui/StackPager';
import PaginationDots from './components/ui/PaginationDots';
import InputTextCard from './components/modality/input/InputTextCard';
import InputClipboardCard from './components/modality/input/InputClipboardCard';
import InputAudioCard from './components/modality/input/InputAudioCard';
import InputPhotoCard from './components/modality/input/InputPhotoCard';
import InputVideoCard from './components/modality/input/InputVideoCard';
import OutputChatPanel from './components/modality/output/OutputChatPanel';
import OutputTTSPanel from './components/modality/output/OutputTTSPanel';
import OutputImagePanel from './components/modality/output/OutputImagePanel';
import OutputClipboardPanel from './components/modality/output/OutputClipboardPanel';
import ChatComposer from './components/composer/ChatComposer';
import AgentCard from './components/agents/AgentCard';
import { mapInputToCapability } from './components/types';
import { exampleAgents } from './data/agents';
import { streamChat } from './services/agentClient';

// Keep the splash screen visible while we bootstrap the app
if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync().catch(() => {
    /* noop if already hidden */
  });
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const { width, height } = useWindowDimensions();
  const isPortrait = height >= width;
  const [currentScreen, setCurrentScreen] = useState<'home' | 'inputs' | 'outputs' | 'agent'>('home');
  const [probeResult, setProbeResult] = useState<string | null>(null);
  const [avLoaded, setAvLoaded] = useState(false);
  const avModuleRef = useRef<any>(null);
  const audioModuleRef = useRef<{ kind: 'audio' | 'av'; mod: any } | null>(null);
  const audioPlayerRef = useRef<any>(null);
  const [audioStatus, setAudioStatus] = useState<'idle' | 'loading' | 'playing' | 'paused'>('idle');
  const soundRef = useRef<any>(null);
  const [showVideo, setShowVideo] = useState(false);

  // Core interface state
  const inputTypes = ['text', 'clipboard'] as const;
  type InputType = typeof inputTypes[number];
  const outputTypes = ['chat', 'clipboard'] as const;
  type OutputType = typeof outputTypes[number];
  const inputColors: Record<InputType, string> = {
    text: '#FEF3C7',  // amber-100
    audio: '#DBEAFE', // blue-100
    photo: '#DCFCE7', // green-100
    video: '#FCE7F3', // pink-100
  };
  const outputColors: any = {
    chat: '#E5E7EB',
    clipboard: '#EDE9FE',
  };
  const [selectedInputIndex, setSelectedInputIndex] = useState(0);
  const [selectedOutputIndex, setSelectedOutputIndex] = useState(0);
  const [selectedAgentIndex, setSelectedAgentIndex] = useState(0);
  const [inputEnabled, setInputEnabled] = useState<Record<InputType, boolean>>({ text: true, audio: true, photo: true, video: true });
  const [inputConnected, setInputConnected] = useState<Record<InputType, boolean>>({ text: true, audio: false, photo: false, video: false });
  const [outputEnabled, setOutputEnabled] = useState<Record<OutputType, boolean>>({ chat: true, tts: true, image: true });
  const [outputConnected, setOutputConnected] = useState<Record<OutputType, boolean>>({ chat: true, tts: true, image: true });
  const [textInput, setTextInput] = useState('');
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [lastImageUri, setLastImageUri] = useState<string | null>(null);
  const [lastVideoUri, setLastVideoUri] = useState<string | null>(null);
  const [lastAudioUri, setLastAudioUri] = useState<string | null>(null);
  const [agents] = useState(exampleAgents);
  const [agentModel, setAgentModel] = useState<string>('gpt-5');

  useEffect(() => {
    let mounted = true;
    const prepare = async () => {
      try {
        // TODO: load fonts/assets here if needed
        await new Promise((res) => setTimeout(res, 600));
      } finally {
        if (mounted) setAppIsReady(true);
      }
    };
    prepare();
    return () => {
      mounted = false;
    };
  }, []);

  // In-app loader overlay for exactly 3 seconds from mount
  useEffect(() => {
    const t = setTimeout(() => setShowLoader(false), 3000);
    return () => clearTimeout(t);
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady && Platform.OS !== 'web') {
      // Hide native splash once the landing page has laid out
      try {
        await SplashScreen.hideAsync();
      } catch {}
    }
  }, [appIsReady]);

  const probeModules = useCallback(async () => {
    const outcomes: string[] = [];
    const checks: { name: string; loader: () => Promise<unknown> }[] = [
      { name: 'expo-av', loader: () => import('expo-av') },
      { name: 'expo-video', loader: () => import('expo-video') },
      { name: 'expo-camera', loader: () => import('expo-camera') },
      { name: 'expo-image-picker', loader: () => import('expo-image-picker') },
      { name: 'expo-media-library', loader: () => import('expo-media-library') },
      { name: 'expo-file-system', loader: () => import('expo-file-system') },
      { name: 'expo-speech', loader: () => import('expo-speech') },
    ];
    for (const c of checks) {
      try {
        await c.loader();
        outcomes.push(`${c.name}: ok`);
      } catch {
        outcomes.push(`${c.name}: missing`);
      }
    }
    setProbeResult(outcomes.join(' | '));
  }, []);

  const speakHello = useCallback(async () => {
    try {
      const Speech = await import('expo-speech');
      Speech.speak('Hello from MultiModal', {
        language: 'en-US',
        rate: 1.0,
        pitch: 1.0,
        onError: () => {
          Alert.alert(
            'TTS issue',
            'Check volume/ringer; enable plays in silent mode.'
          );
        },
      });
    } catch {
      Alert.alert('Speech unavailable', 'Install expo-speech to enable TTS.');
    }
  }, []);

  const pickImage = useCallback(async () => {
    try {
      const ImagePicker = await import('expo-image-picker');
      await ImagePicker.requestMediaLibraryPermissionsAsync();
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All, allowsEditing: false });
      if (!result.canceled) {
        const uri = result.assets?.[0]?.uri ?? null;
        if (uri) setLastImageUri(uri);
        Alert.alert('Picked', `URI: ${uri ?? 'unknown'}`);
      }
    } catch {
      Alert.alert('Image Picker unavailable', 'Install expo-image-picker to enable.');
    }
  }, []);

  // Audio playback (streamed) using expo-av
  const AUDIO_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

  const ensureAvLoaded = useCallback(async () => {
    if (!avLoaded || !avModuleRef.current) {
      avModuleRef.current = await import('expo-av');
      setAvLoaded(true);
    }
    return avModuleRef.current as any;
  }, [avLoaded]);

  const ensureAudioLib = useCallback(async () => {
    if (audioModuleRef.current) return audioModuleRef.current;
    try {
      const mod = await import('expo-audio');
      audioModuleRef.current = { kind: 'audio', mod };
    } catch {
      const mod = await ensureAvLoaded();
      audioModuleRef.current = { kind: 'av', mod };
    }
    return audioModuleRef.current!;
  }, [ensureAvLoaded]);

  const loadAndPlayAudio = useCallback(async () => {
    try {
      setAudioStatus('loading');
      const lib = await ensureAudioLib();
      if (lib.kind === 'audio') {
        const m = lib.mod;
        try { await m.setAudioModeAsync({ shouldPlayInBackground: false } as any); } catch {}
        if (!audioPlayerRef.current) {
          const player = m.createAudioPlayer({ uri: AUDIO_URL });
          // Listen for status updates
          player.addListener?.(m.PLAYBACK_STATUS_UPDATE, (status: any) => {
            setAudioStatus(status?.playing ? 'playing' : status?.paused ? 'paused' : 'idle');
          });
          audioPlayerRef.current = player;
        }
        audioPlayerRef.current.play();
        setAudioStatus('playing');
        return;
      }
      // Fallback to expo-av
      const { Audio } = lib.mod;
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          interruptionModeIOS: 1,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        } as any);
      } catch {}
      if (!soundRef.current) {
        const { sound } = await Audio.Sound.createAsync({ uri: AUDIO_URL }, { shouldPlay: true });
        soundRef.current = sound;
        sound.setOnPlaybackStatusUpdate((status: any) => {
          if (!status.isLoaded) return;
          setAudioStatus(status.isPlaying ? 'playing' : 'paused');
        });
      } else {
        await soundRef.current.playAsync();
      }
      setAudioStatus('playing');
    } catch (e) {
      setAudioStatus('idle');
      Alert.alert('Audio error', 'Could not start audio playback.');
    }
  }, [ensureAudioLib]);

  const pauseAudio = useCallback(async () => {
    try {
      const lib = await ensureAudioLib();
      if (lib.kind === 'audio') {
        audioPlayerRef.current?.pause();
        setAudioStatus('paused');
        return;
      }
      if (soundRef.current) {
        await soundRef.current.pauseAsync();
        setAudioStatus('paused');
      }
    } catch {}
  }, [ensureAudioLib]);

  const stopAudio = useCallback(async () => {
    try {
      const lib = await ensureAudioLib();
      if (lib.kind === 'audio') {
        if (audioPlayerRef.current) {
          audioPlayerRef.current.pause();
          try { await audioPlayerRef.current.seekTo(0); } catch {}
        }
      } else if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    } catch {}
    setAudioStatus('idle');
  }, [ensureAudioLib]);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
    };
  }, []);

  const takePhoto = useCallback(async () => {
    try {
      const ImagePicker = await import('expo-image-picker');
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (perm.status !== 'granted') return Alert.alert('Camera', 'Permission denied');
      const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
      if (!result.canceled) {
        const uri = result.assets?.[0]?.uri ?? null;
        if (uri) setLastImageUri(uri);
      }
    } catch {}
  }, []);

  const takeVideo = useCallback(async () => {
    try {
      const ImagePicker = await import('expo-image-picker');
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (perm.status !== 'granted') return Alert.alert('Camera', 'Permission denied');
      const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Videos });
      if (!result.canceled) {
        const uri = result.assets?.[0]?.uri ?? null;
        if (uri) setLastVideoUri(uri);
      }
    } catch {}
  }, []);

  // Simple audio recording using expo-audio (fallback to expo-av)
  const recordingRef = useRef<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const toggleRecording = useCallback(async () => {
    try {
      const lib = await ensureAudioLib();
      if (lib.kind === 'audio') {
        const m = lib.mod;
        const perm = await m.requestRecordingPermissionsAsync();
        if (perm.status !== 'granted') return Alert.alert('Microphone', 'Permission denied');
        await m.setAudioModeAsync({ shouldPlayInBackground: false } as any);
        if (!isRecording) {
          const recorder = new m.AudioModule.AudioRecorder({});
          await recorder.prepareToRecordAsync({});
          recorder.record();
          recordingRef.current = recorder;
          setIsRecording(true);
        } else {
          const rec = recordingRef.current;
          if (rec) {
            await rec.stop();
            const uri = rec.uri ?? null;
            if (uri) setLastAudioUri(uri);
          }
          recordingRef.current = null;
          setIsRecording(false);
        }
        return;
      }
      // Fallback to expo-av
      const { Audio } = lib.mod;
      if (!isRecording) {
        const { granted } = await Audio.requestPermissionsAsync();
        if (!granted) return Alert.alert('Microphone', 'Permission denied');
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true } as any);
        const recording = new (Audio as any).Recording();
        await recording.prepareToRecordAsync((Audio as any).RecordingOptionsPresets.HIGH_QUALITY);
        await recording.startAsync();
        recordingRef.current = recording;
        setIsRecording(true);
      } else {
        const rec = recordingRef.current;
        if (rec) {
          await rec.stopAndUnloadAsync();
          const uri = rec.getURI();
          if (uri) setLastAudioUri(uri);
        }
        recordingRef.current = null;
        setIsRecording(false);
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true } as any);
      }
    } catch (e) {
      setIsRecording(false);
      Alert.alert('Recording error', 'Unable to toggle recording.');
    }
  }, [ensureAudioLib, isRecording]);

  if (!appIsReady) {
    // Let native splash show while we get ready
    return null;
  }

  const selectedInput = inputTypes[selectedInputIndex];
  const selectedInputCapability = mapInputToCapability(selectedInput as any);
  const visibleAgents = agents.filter((a: any) => a.accepts.includes(selectedInputCapability));
  const agentSafeIndex = Math.max(0, Math.min(selectedAgentIndex, Math.max(0, visibleAgents.length - 1)));
  const selectedAgent = visibleAgents[agentSafeIndex] || null;

  const allOutputs = ['chat', 'clipboard'] as const;
  const visibleOutputs = selectedAgent
    ? allOutputs.filter((o) => (selectedAgent.produces as any[]).includes(o === 'clipboard' ? 'chat' : o))
    : allOutputs;
  const selectedOutput = visibleOutputs[Math.max(0, Math.min(selectedOutputIndex, Math.max(0, visibleOutputs.length - 1)))] ?? 'chat';
  

  const handleSend = async () => {
    if ((selectedAgent as any)?.comingSoon) {
      return Alert.alert('Coming soon', 'This agent is not available yet.');
    }
    if (!inputEnabled[selectedInput] || !outputEnabled[selectedOutput]) {
      return Alert.alert('Disabled', 'Selected input/output is disabled.');
    }
    const inputText = selectedInput === 'text' || selectedInput === 'clipboard' ? (textInput || '(empty)') : '(unsupported)';
    if (selectedOutput === 'chat') {
      let acc = '';
      setChatMessages((arr) => ['…', ...arr]);
      await streamChat({ model: agentModel, messages: [{ role: 'user', content: inputText }] }, (chunk) => {
        acc += chunk;
        setChatMessages((arr) => [acc, ...arr.slice(1)]);
      });
      if (selectedInput === 'text') setTextInput('');
      return;
    }
    if (selectedOutput === 'clipboard') {
      setChatMessages((arr) => [inputText, ...arr]);
      if (selectedInput === 'text') setTextInput('');
      return;
    }
  };

  return (
    <SafeAreaView style={styles.container} onLayout={onLayoutRootView}>
      <View style={styles.headerBar}>
        {currentScreen !== 'home' ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={() => setCurrentScreen('home')}
            style={styles.headerBack}
          >
            <Text style={styles.headerBackText}>‹</Text>
          </Pressable>
        ) : (
          <View style={styles.headerBack} />
        )}
        <Image
          source={require('./assets/splash.png')}
          style={styles.headerLogo}
          resizeMode="contain"
          accessibilityLabel="App logo"
        />
        <View style={styles.headerBack} />
      </View>
      {/* Landing: removed hero and quick action buttons per spec */}
      {currentScreen === 'home' && (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
            <View style={[styles.section, { flexDirection: 'column' }]}>
          <View style={[styles.half, styles.panel, { backgroundColor: '#ffffff', marginRight: isPortrait ? 0 : 8 }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Inputs (swipe)</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open input settings"
                onPress={() => setCurrentScreen('inputs')}
                style={styles.iconBtn}
              >
                <Text style={styles.iconText}>⚙︎</Text>
              </Pressable>
            </View>
            <Text style={styles.pill}>Selected: {selectedInput}</Text>
            <StackPager
              items={inputTypes as unknown as string[]}
              selectedIndex={selectedInputIndex}
              onIndexChange={(i) => { setSelectedAgentIndex(0); setSelectedInputIndex(i); }}
              renderItem={(t) => (
                t === 'text' ? (
                  <InputTextCard value={textInput} onChange={setTextInput} />
                ) : (
                  <InputClipboardCard value={textInput} onChange={setTextInput} />
                )
              )}
            />
            <View style={styles.dotsRow}>
              <PaginationDots count={inputTypes.length} index={selectedInputIndex} onDotPress={(i) => { setSelectedAgentIndex(0); setSelectedInputIndex(i); }} />
            </View>
            <View style={{ marginTop: 8 }}>
              <ChatComposer value={textInput} onChange={setTextInput} onSend={handleSend} disabled={selectedInput !== 'text'} />
            </View>
          </View>
          <View style={isPortrait ? styles.dividerHorizontal : styles.dividerVertical} />
          <View style={[styles.half, styles.panel, { backgroundColor: '#ffffff', marginVertical: 8 }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Agent (swipe)</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open agent settings"
                onPress={() => setCurrentScreen('agent')}
                style={styles.iconBtn}
              >
                <Text style={styles.iconText}>⚙︎</Text>
              </Pressable>
            </View>
            {(() => {
              const cap = (selectedInput === 'photo' ? 'image' : selectedInput) as any;
              const filtered = (agents as any[]).filter((a) => a.accepts.includes(cap));
              const safeIndex = Math.max(0, Math.min(selectedAgentIndex, Math.max(0, filtered.length - 1)));
              return (
                filtered.length === 0 ? (
                  <Text style={styles.hintSmall}>No agents available for {cap}</Text>
                ) : (
                  <>
                    <StackPager
                      items={filtered as any}
                      selectedIndex={safeIndex}
                      onIndexChange={setSelectedAgentIndex}
                      renderItem={(agent: any, idx: number) => <AgentCard agent={agent} selected={idx === safeIndex} />}
                    />
                    <View style={styles.dotsRow}>
                      <PaginationDots count={filtered.length} index={safeIndex} onDotPress={(i) => setSelectedAgentIndex(i)} />
                    </View>
                  </>
                )
              );
            })()}
          </View>
          <View style={isPortrait ? styles.dividerHorizontal : styles.dividerVertical} />
          <View style={[styles.half, styles.panel, { backgroundColor: '#ffffff', marginLeft: isPortrait ? 0 : 8 }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Outputs (swipe)</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open output settings"
                onPress={() => setCurrentScreen('outputs')}
                style={styles.iconBtn}
              >
                <Text style={styles.iconText}>⚙︎</Text>
              </Pressable>
            </View>
            <Text style={styles.pill}>Selected: {selectedOutput}</Text>
            <StackPager
              items={(selectedAgent ? (['chat','clipboard'] as const).filter((o) => (selectedAgent.produces as any[]).includes(o === 'clipboard' ? 'chat' : o)) : (['chat','clipboard'] as const)) as unknown as string[]}
              selectedIndex={selectedOutputIndex}
              onIndexChange={setSelectedOutputIndex}
              renderItem={(t) => (
                t === 'chat' ? (
                  <OutputChatPanel messages={chatMessages} />
                ) : t === 'clipboard' ? (
                  <OutputClipboardPanel text={chatMessages[0] || textInput} />
                ) : (
                  <Text style={styles.hintSmall}>N/A</Text>
                )
              )}
            />
            <View style={styles.dotsRow}>
              <PaginationDots count={(selectedAgent ? (['chat','clipboard'] as const).filter((o) => (selectedAgent.produces as any[]).includes(o === 'clipboard' ? 'chat' : o)) : (['chat','clipboard'] as const)).length} index={selectedOutputIndex} onDotPress={(i) => setSelectedOutputIndex(i)} />
            </View>
          </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
      {/* Audio/Video demos removed on landing per demo */}

      {currentScreen === 'inputs' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Input Settings</Text>
          {(['text','audio','photo','video'] as const).map((t) => (
            <View key={t} style={[styles.row, { justifyContent: 'space-between', marginVertical: 6 }] }>
              <Text style={{ fontWeight: '600' }}>{t}</Text>
              <View style={styles.row}>
                <Text style={styles.hintSmall}>Enabled</Text>
                <Switch value={!!inputEnabled[t]} onValueChange={(v) => setInputEnabled((m) => ({ ...m, [t]: v }))} />
                <Pressable accessibilityRole="button" style={styles.buttonSm} onPress={() => setInputConnected((m) => ({ ...m, [t]: !m[t] }))}>
                  <Text style={styles.buttonText}>{inputConnected[t] ? 'Disconnect' : 'Connect'}</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}

      {currentScreen === 'agent' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Agent Settings</Text>
          <Text style={styles.hint}>Provider: OpenAI</Text>
          <View style={{ marginTop: 12 }}>
            {['gpt-5', 'gpt-4o', 'o4-mini'].map((m) => (
              <Pressable key={m} accessibilityRole="button" onPress={() => setAgentModel(m)} style={[styles.row, { justifyContent: 'space-between', marginVertical: 8 }]}>
                <Text style={{ fontWeight: '600' }}>{m}</Text>
                <Text style={{ color: agentModel === m ? '#111827' : '#9ca3af' }}>{agentModel === m ? '●' : '○'}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {currentScreen === 'outputs' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Output Settings</Text>
          {(['chat','tts','image'] as const).map((t) => (
            <View key={t} style={[styles.row, { justifyContent: 'space-between', marginVertical: 6 }] }>
              <Text style={{ fontWeight: '600' }}>{t}</Text>
              <View style={styles.row}>
                <Text style={styles.hintSmall}>Enabled</Text>
                <Switch value={!!outputEnabled[t]} onValueChange={(v) => setOutputEnabled((m) => ({ ...m, [t]: v }))} />
                <Pressable accessibilityRole="button" style={styles.buttonSm} onPress={() => setOutputConnected((m) => ({ ...m, [t]: !m[t] }))}>
                  <Text style={styles.buttonText}>{outputConnected[t] ? 'Disconnect' : 'Connect'}</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}
      <StatusBar style="dark" />
      <LoadingOverlay visible={showLoader} title="MultiModal" subtitle="Loading…" logo={require('./assets/splash.png')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    padding: 16,
  },
  headerBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  headerLogo: { width: 24, height: 24 },
  headerBack: { width: 44, height: 32, alignItems: 'center', justifyContent: 'center' },
  headerBackText: { fontSize: 22, lineHeight: 22, color: '#111827' },
  hero: { alignItems: 'center', gap: 6 },
  title: { fontSize: 24, fontWeight: '700', letterSpacing: 0.2 },
  subtitle: { fontSize: 14, color: '#555' },
  logo: { marginTop: 10, width: 120, height: 120 },
  actions: {
    marginTop: 24,
    alignItems: 'center',
  },
  section: {
    marginTop: 16,
    width: '100%',
  },
  panel: {
    width: '100%',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  iconBtn: { padding: 6, marginRight: -6 },
  iconText: { fontSize: 16, color: '#111827' },
  button: {
    backgroundColor: '#111827',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginVertical: 6,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonSm: {
    backgroundColor: '#111827',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 6,
  },
  buttonSmDanger: {
    backgroundColor: '#991b1b',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 6,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  hint: {
    color: '#666',
    textAlign: 'center',
  },
  hintSmall: {
    color: '#666',
    textAlign: 'center',
    fontSize: 12,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatBubble: {
    backgroundColor: '#eef2ff',
    color: '#111827',
    padding: 8,
    borderRadius: 8,
    marginTop: 6,
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  tabBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 4,
  },
  tabBtnActive: { backgroundColor: '#111827' },
  tabText: { color: '#111827', fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  textBox: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    color: '#111827',
  },
  half: { flex: 1 },
  dividerHorizontal: {
    height: 1,
    width: '100%',
    backgroundColor: '#e5e7eb',
    marginVertical: 0,
  },
  dividerVertical: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: '#e5e7eb',
    marginHorizontal: 0,
  },
  pill: {
    alignSelf: 'center',
    backgroundColor: '#6366f1',
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginBottom: 8,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  dot: { width: 8, height: 8, borderRadius: 8, backgroundColor: '#d1d5db' },
  dotActive: { backgroundColor: '#111827' },
});

// Video player using expo-video (replaces deprecated expo-av <Video/>)
function LazyVideo({ uri }: { uri: string }) {
  const [mod, setMod] = useState<any | null>(null);
  const playerRef = useRef<any>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const m = await import('expo-video');
        if (!mounted) return;
        setMod(m);
        const player = m.createVideoPlayer({ uri });
        player.loop = true;
        try { player.play(); } catch {}
        playerRef.current = player;
      } catch {}
    })();
    return () => { mounted = false; };
  }, [uri]);

  if (!mod?.VideoView || !playerRef.current) {
    return <Text style={{ color: '#666' }}>Loading player…</Text>;
  }
  const VideoView = mod.VideoView;
  return (
    <VideoView
      player={playerRef.current}
      nativeControls
      contentFit="contain"
      allowsFullscreen
      allowsPictureInPicture
      style={{ width: 320, height: 180, backgroundColor: '#000' }}
    />
  );
}
