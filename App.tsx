import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaView, StyleSheet, Text, View, Image, Platform, Pressable, Alert, useWindowDimensions, Switch, ScrollView, KeyboardAvoidingView } from 'react-native';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
// Video rendering uses expo-video, loaded dynamically in LazyVideo to avoid test env issues
import LoadingOverlay from './components/LoadingOverlay';
import VerticalLabel from './components/ui/VerticalLabel';
import InputTextCard from './components/modality/input/InputTextCard';
import OutputChatPanel from './components/modality/output/OutputChatPanel';
import OutputTTSPanel from './components/modality/output/OutputTTSPanel';
import StackPager from './components/ui/StackPager';
import PaginationDots from './components/ui/PaginationDots';
import ChatComposer from './components/composer/ChatComposer';
import { streamChat } from './services/agentClient';
import type { OutputType } from './components/types';
import { API_BASE_URL, MULTIMODAL_API_KEY } from './services/config';

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

  // Core interface state
  const [inputExpanded, setInputExpanded] = useState(false);
  const [outputExpanded, setOutputExpanded] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [agentModel] = useState<string>('gpt-4o-mini');
  const [selectedOutputIndex, setSelectedOutputIndex] = useState(0);
  const outputTypes: OutputType[] = ['chat', 'audio'];
  const [ttsStatus, setTtsStatus] = useState<'idle' | 'speaking' | 'error'>('idle');

  useEffect(() => {
    let mounted = true;
    const prepare = async () => {
      try {
        // TODO: load fonts/assets here if needed
        await new Promise((res) => setTimeout(res, 600));
        // Best-effort: allow audio playback in iOS silent mode (may help TTS audibility)
        try {
          console.log('[audio] Setting audio mode…');
          const mode = await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            allowsRecordingIOS: false,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
          });
          console.log('[audio] Audio mode set OK', mode);
        } catch {}
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


  if (!appIsReady) {
    // Let native splash show while we get ready
    return null;
  }

  const handleSend = async () => {
    if (!textInput.trim()) return;
    
    // Expand output section when sending first message
    if (!outputExpanded) {
      setOutputExpanded(true);
    }
    
    const inputText = textInput.trim();
    const selectedOutput = outputTypes[selectedOutputIndex];
    console.log('[send] Platform:', Platform.OS, 'Selected output:', selectedOutput, 'Text length:', inputText.length);
    if (selectedOutput === 'chat') {
      console.log('[chat] start streaming');
      let acc = '';
      setChatMessages((arr) => ['…', ...arr]);
      await streamChat({ model: agentModel, messages: [{ role: 'user', content: inputText }] }, (chunk) => {
        acc += chunk;
        setChatMessages((arr) => [acc, ...arr.slice(1)]);
      });
      console.log('[chat] streaming done. chars:', acc.length);
      setTextInput('');
    } else if (selectedOutput === 'audio') {
      try {
        // Stop any ongoing utterance before starting a new one
        try { 
          const speaking = await Speech.isSpeakingAsync();
          console.log('[tts] isSpeaking before stop:', speaking);
          await Speech.stop();
          console.log('[tts] stop called');
        } catch (e) { console.log('[tts] stop error', e); }
        // 1) Get agent response via streaming, mirror to chat
        console.log('[tts] fetching agent reply for TTS…');
        let acc = '';
        setChatMessages((arr) => ['…', ...arr]);
        await streamChat({ model: agentModel, messages: [{ role: 'user', content: inputText }] }, (chunk) => {
          acc += chunk;
          setChatMessages((arr) => [acc, ...arr.slice(1)]);
        });
        console.log('[tts] agent reply length:', acc.length);
        // 2) Speak the agent reply, not the raw user input
        setTtsStatus('speaking');
        const opts = {
          language: 'en-US',
          pitch: 1.0,
          rate: Platform.OS === 'ios' ? 0.5 : 1.0,
          onStart: () => { console.log('[tts] onStart'); setTtsStatus('speaking'); },
          onDone: () => { console.log('[tts] onDone'); setTtsStatus('idle'); },
          onStopped: () => { console.log('[tts] onStopped'); setTtsStatus('idle'); },
          onError: (e?: any) => { console.log('[tts] onError', e); setTtsStatus('error'); },
        } as const;
        console.log('[tts] speak agent reply start', { len: acc.length, opts });
        Speech.speak(acc || inputText, opts);
        // Probe speaking state shortly after invocation
        setTimeout(async () => {
          try {
            const s = await Speech.isSpeakingAsync();
            console.log('[tts] isSpeaking after start (~200ms):', s);
          } catch {}
        }, 200);
      } catch (e) {
        console.log('[tts] exception during speak', e);
        setTtsStatus('error');
        Alert.alert('TTS Error', 'Unable to speak the text.');
      } finally {
        setTextInput('');
      }
    }
  };

  // Network test function for debugging
  const testNetwork = async () => {
    const testUrl = API_BASE_URL + '/api/test';
    console.log('[Network Test] Testing connectivity to:', testUrl);
    
    try {
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      console.log('[Network Test] Response status:', response.status);
      const data = await response.text();
      console.log('[Network Test] Response data:', data);
      
      Alert.alert('Network Test Success', `Connected to: ${testUrl}\nStatus: ${response.status}\nResponse: ${data.substring(0, 100)}`);
    } catch (error: any) {
      console.error('[Network Test] Failed:', error);
      Alert.alert('Network Test Failed', `URL: ${testUrl}\n\nError: ${error.message}\n\nDetails: ${error.toString()}`);
    }
  };

  return (
    <SafeAreaView style={styles.container} onLayout={onLayoutRootView}>
      <View style={styles.headerBar}>
        <Pressable style={styles.headerBack} onPress={testNetwork}>
          <Text style={{ fontSize: 12 }}>🔧</Text>
        </Pressable>
        <Image
          source={require('./assets/splash.png')}
          style={styles.headerLogo}
          resizeMode="contain"
          accessibilityLabel="App logo"
        />
        <View style={styles.headerBack} />
      </View>
      {/* Main interface */}
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
            <View style={[styles.section, { flexDirection: 'column', gap: 16 }]}>
          {/* Input Section */}
          <View style={[styles.half, styles.panel, { backgroundColor: '#ffffff' }]}>
            <VerticalLabel text="input" side="left" />
            {!inputExpanded ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Start chat"
                onPress={() => setInputExpanded(true)}
                style={styles.iconContainer}
              >
                <Text style={styles.chatIcon}>💬</Text>
                <Text style={styles.hintSmall}>Tap to chat</Text>
              </Pressable>
            ) : (
              <>
                <InputTextCard value={textInput} onChange={setTextInput} />
                <View style={{ marginTop: 8 }}>
                  <ChatComposer value={textInput} onChange={setTextInput} onSend={handleSend} disabled={false} />
                </View>
              </>
            )}
          </View>
          {/* Output Section */}
          <View style={[styles.half, styles.panel, { backgroundColor: '#ffffff' }]}>
            <VerticalLabel text="output" side="left" />
            {!outputExpanded ? (
              <View style={styles.iconContainer}>
                <Text style={styles.chatIcon}>🗨️</Text>
                <Text style={styles.hintSmall}>Swipe outputs after sending</Text>
              </View>
            ) : (
              <>
                <StackPager
                  items={outputTypes}
                  selectedIndex={selectedOutputIndex}
                  onIndexChange={setSelectedOutputIndex}
                  renderItem={(type, idx, selected) => (
                    type === 'chat' ? (
                      <OutputChatPanel messages={chatMessages} />
                    ) : (
                      <OutputTTSPanel status={ttsStatus} />
                    )
                  )}
                />
                <PaginationDots
                  count={outputTypes.length}
                  index={selectedOutputIndex}
                  onDotPress={setSelectedOutputIndex}
                />
              </>
            )}
          </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  pill: { display: 'none' },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  dot: { width: 8, height: 8, borderRadius: 8, backgroundColor: '#d1d5db' },
  dotActive: { backgroundColor: '#111827' },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  chatIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
});
