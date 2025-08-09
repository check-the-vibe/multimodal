import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaView, StyleSheet, Text, View, Image, Platform, Pressable, Alert, useWindowDimensions, Switch, ScrollView, KeyboardAvoidingView } from 'react-native';
// Video rendering uses expo-video, loaded dynamically in LazyVideo to avoid test env issues
import LoadingOverlay from './components/LoadingOverlay';
import VerticalLabel from './components/ui/VerticalLabel';
import InputTextCard from './components/modality/input/InputTextCard';
import OutputChatPanel from './components/modality/output/OutputChatPanel';
import ChatComposer from './components/composer/ChatComposer';
import { streamChat } from './services/agentClient';
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
    let acc = '';
    setChatMessages((arr) => ['…', ...arr]);
    await streamChat({ model: agentModel, messages: [{ role: 'user', content: inputText }] }, (chunk) => {
      acc += chunk;
      setChatMessages((arr) => [acc, ...arr.slice(1)]);
    });
    setTextInput('');
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
                <Text style={styles.hintSmall}>Chat responses will appear here</Text>
              </View>
            ) : (
              <OutputChatPanel messages={chatMessages} />
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

