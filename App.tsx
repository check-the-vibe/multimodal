import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaView, StyleSheet, Text, View, Image, Platform, Pressable, Alert, useWindowDimensions, ScrollView, KeyboardAvoidingView } from 'react-native';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
// Video rendering uses expo-video, loaded dynamically in LazyVideo to avoid test env issues
import LoadingOverlay from './components/LoadingOverlay';
import VerticalLabel from './components/ui/VerticalLabel';
import InputTextCard from './components/modality/input/InputTextCard';
import ImageInputCard from './components/modality/input/ImageInputCard';
import AudioInputCard from './components/modality/input/AudioInputCard';
import FileInputCard from './components/modality/input/FileInputCard';
import DrawingInputCard from './components/modality/input/DrawingInputCard';
import ClipboardInputCard from './components/modality/input/ClipboardInputCard';
import OutputChatPanel from './components/modality/output/OutputChatPanel';
import OutputTTSPanel from './components/modality/output/OutputTTSPanel';
import OutputImagePanel from './components/modality/output/OutputImagePanel';
import OutputCodePanel from './components/modality/output/OutputCodePanel';
import OutputTablePanel from './components/modality/output/OutputTablePanel';
import OutputChartPanel from './components/modality/output/OutputChartPanel';
import OutputFilePanel from './components/modality/output/OutputFilePanel';
import StackPager from './components/ui/StackPager';
import PaginationDots from './components/ui/PaginationDots';
import FilteredPaginationDots from './components/ui/FilteredPaginationDots';
import TextAgentCard from './components/modality/agent/TextAgentCard';
import VisionAgentCard from './components/modality/agent/VisionAgentCard';
import CreateAgentCard from './components/modality/agent/CreateAgentCard';
import TranscribeAgentCard from './components/modality/agent/TranscribeAgentCard';
import SpeakAgentCard from './components/modality/agent/SpeakAgentCard';
import CodeAgentCard from './components/modality/agent/CodeAgentCard';
import type { AgentMode } from './components/modality/agent/AgentModeSelector';
import type { AgentModeSettings } from './components/modality/agent/AgentModeSettings';
import { getDefaultSettingsForMode } from './services/settingsStorage';
import SettingsModal from './components/settings/SettingsModal';
import { streamChat } from './services/agentClient';
import { parseOutputs } from './services/parseOutput';
import type { OutputType } from './components/types';
import { API_BASE_URL } from './services/config';
import { loadSettings, saveSettings, type AppSettings } from './services/settingsStorage';
import { 
  filterInputTypes, 
  filterOutputTypes, 
  getDefaultInput, 
  getDefaultOutput,
  type InputType as InputTypeConfig,
  type OutputType as OutputTypeConfig
} from './services/agentModeConfig';

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

  // Core interface state
  const [selectedAgentIndex, setSelectedAgentIndex] = useState(0);
  const agentTypes: AgentMode[] = ['text', 'vision', 'create', 'transcribe', 'speak', 'code'];
  const [textInput, setTextInput] = useState('');
  const [selectedInputIndex, setSelectedInputIndex] = useState(0);
  const [selectedOutputIndex, setSelectedOutputIndex] = useState(0);
  const [isSending, setIsSending] = useState(false);
  
  // All available types
  const allInputTypes = ['text', 'image', 'audio', 'file', 'drawing', 'clipboard'] as const;
  const allOutputTypes: OutputType[] = ['chat', 'audio', 'image', 'code', 'table', 'chart', 'file'];
  type InputType = typeof allInputTypes[number];
  
  // Get current agent mode
  const currentAgentMode = agentTypes[selectedAgentIndex];
  
  React.useEffect(() => {
    console.log('[App] Agent mode changed to:', currentAgentMode);
    console.log('[App] Agent index:', selectedAgentIndex);
  }, [currentAgentMode, selectedAgentIndex]);
  
  // Filter input and output types based on current agent mode
  const inputTypes = filterInputTypes([...allInputTypes], currentAgentMode) as InputType[];
  const outputTypes = filterOutputTypes(allOutputTypes, currentAgentMode) as OutputType[];
  
  const [inputData, setInputData] = useState<Record<InputType, unknown>>({ 
    text: '', 
    image: null, 
    audio: null, 
    file: null, 
    drawing: null, 
    clipboard: null 
  });
  
  // Ensure selected indices are valid for filtered types
  useEffect(() => {
    if (selectedInputIndex >= inputTypes.length) {
      setSelectedInputIndex(0);
    }
  }, [inputTypes.length, selectedInputIndex]);
  
  useEffect(() => {
    if (selectedOutputIndex >= outputTypes.length) {
      setSelectedOutputIndex(0);
    }
  }, [outputTypes.length, selectedOutputIndex]);
  
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [ttsStatus, setTtsStatus] = useState<'idle' | 'speaking' | 'error'>('idle');
  // Demo data for new output cards
  const [lastImage, setLastImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [codeSnippet, setCodeSnippet] = useState<string>(`function hello(name) {\n  return 'Hello, ' + name;\n}`);
  const [tableRows, setTableRows] = useState<Array<Record<string, any>>>([
    { item: 'Apples', qty: 4, price: 2.5 },
    { item: 'Oranges', qty: 2, price: 3.0 },
  ]);
  const [chartData, setChartData] = useState<{ label: string; value: number }[]>([
    { label: 'A', value: 10 },
    { label: 'B', value: 6 },
    { label: 'C', value: 14 },
  ]);
  const [files, setFiles] = useState<{ name: string; uri: string; size?: number }[]>([
    { name: 'result.txt', uri: 'https://example.com/result.txt', size: 1234 },
  ]);

  useEffect(() => {
    let mounted = true;
    const prepare = async () => {
      try {
        // Load saved settings
        const settings = await loadSettings();
        if (mounted) {
          setAppSettings(settings);
          // Sync agent index with loaded settings
          const savedMode = settings?.agentMode?.selectedMode || 'text';
          const modeIndex = agentTypes.indexOf(savedMode as AgentMode);
          if (modeIndex !== -1) {
            setSelectedAgentIndex(modeIndex);
          }
        }
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

  const handleSettingsChange = async (settings: AppSettings) => {
    setAppSettings(settings);
    await saveSettings(settings);
  };

  const handleVisionAnalysis = (analysis: string) => {
    // Add the vision analysis to chat messages
    setChatMessages((prev) => [analysis, ...prev]);
    // Switch to chat output to see the result
    setSelectedOutputIndex(0);
  };

  const handleTranscriptionResult = (transcription: string) => {
    // Add the transcription to chat messages
    setChatMessages((prev) => [transcription, ...prev]);
    // Switch to chat output to see the result
    setSelectedOutputIndex(0);
  };

  const handleImageGeneration = async (prompt: string) => {
    if (!appSettings) return;

    console.log('[CreateAgent] Starting image generation...');
    console.log('[CreateAgent] Prompt:', prompt);
    console.log('[CreateAgent] Prompt length:', prompt.length, 'characters');
    
    const agentSettings = appSettings.agentMode?.settings || {};
    const imageSize = agentSettings.imageSize || '1024x1024';
    const imageQuality = agentSettings.imageQuality || 'standard';
    
    console.log('[CreateAgent] Settings - Size:', imageSize, 'Quality:', imageQuality);

    setIsSending(true);
    try {
      const requestBody = {
        prompt,
        model: 'dall-e-3',
        n: 1,
        size: imageSize,
        quality: imageQuality,
      };
      
      console.log('[CreateAgent] Sending request to:', `${API_BASE_URL}/api/openai/generate`);
      console.log('[CreateAgent] Request body:', JSON.stringify(requestBody));
      
      const response = await fetch(`${API_BASE_URL}/api/openai/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.EXPO_PUBLIC_MULTIMODAL_API_KEY || 'mm_469eade2349b909e92b789cf1533dc3592f08480d9f6a0794ba09b94ac29669d',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('[CreateAgent] Response status:', response.status);
      console.log('[CreateAgent] Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[CreateAgent] Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[CreateAgent] Response received');
      console.log('[CreateAgent] Response keys:', Object.keys(data));
      console.log('[CreateAgent] Images count:', data.images?.length || 0);
      
      if (data.images && data.images.length > 0) {
        console.log('[CreateAgent] First image URL preview:', data.images[0].url?.substring(0, 100) + '...');
        console.log('[CreateAgent] Revised prompt:', data.images[0].revised_prompt?.substring(0, 100));
        // Extract just the URLs from the image objects
        const imageUrls = data.images.map((img: any) => img.url).filter(Boolean);
        console.log('[CreateAgent] Extracted', imageUrls.length, 'image URLs');
        setGeneratedImages((prev) => [...imageUrls, ...prev]);
        setSelectedOutputIndex(2); // Switch to image output
        console.log('[CreateAgent] Image URLs added to gallery, switched to image output');
      } else {
        console.warn('[CreateAgent] No images in response');
      }
    } catch (error) {
      console.error('[CreateAgent] Image generation error:', error);
      console.error('[CreateAgent] Error stack:', error instanceof Error ? error.stack : 'No stack');
      setChatMessages((prev) => [`Error generating image: ${error instanceof Error ? error.message : 'Unknown error'}`, ...prev]);
    } finally {
      console.log('[CreateAgent] Generation complete');
      setIsSending(false);
    }
  };

  const handleSend = async () => {
    // Check for either text input or clipboard content
    const clipboardContent = inputData.clipboard as { content: string; type: string } | null;
    const inputText = textInput.trim() || clipboardContent?.content || '';
    
    if (!inputText || !appSettings || isSending) return;
    
    setIsSending(true);
    const selectedOutput = outputTypes[selectedOutputIndex];
    const agentMode = appSettings.agentMode?.selectedMode || 'text';
    
    console.log('[send] Platform:', Platform.OS, 'Agent mode:', agentMode, 'Selected output:', selectedOutput, 'Text length:', inputText.length);
    
    // Route based on agent mode
    if (agentMode === 'create') {
      // DALL-E image generation
      await handleImageGeneration(inputText);
      setTextInput('');
      setInputData(prev => ({ ...prev, clipboard: null }));
      setIsSending(false);
      return;
    }
    
    if (selectedOutput === 'chat' || agentMode === 'text' || agentMode === 'code' || agentMode === 'vision') {
      console.log('[chat] start streaming');
      let acc = '';
      setChatMessages((arr) => ['…', ...arr]);
      const agentSettings = appSettings.agentMode?.settings || appSettings.agent;
      const messages = agentSettings.systemPrompt 
        ? [{ role: 'system' as const, content: agentSettings.systemPrompt }, { role: 'user' as const, content: inputText }]
        : [{ role: 'user' as const, content: inputText }];
      await streamChat({
        provider: 'openai', // Always use OpenAI for agent modes
        model: agentSettings.model,
        messages,
        temperature: agentSettings.temperature,
        maxTokens: agentSettings.maxTokens,
      }, (chunk) => {
        acc += chunk;
        setChatMessages((arr) => [acc, ...arr.slice(1)]);
      });
      console.log('[chat] streaming done. chars:', acc.length);
      // Parse structured outputs from the final text
      try {
        const parsed = parseOutputs(acc);
        if (parsed.codeBlocks[0]) setCodeSnippet(parsed.codeBlocks[0].code);
        if (parsed.imageUris[0]) setLastImage(parsed.imageUris[0]);
        if (parsed.tables[0]) {
          const t = parsed.tables[0];
          const rows = t.rows.map((r) => Object.fromEntries(t.headers.map((h, i) => [h, r[i] ?? ''])));
          setTableRows(rows);
        }
        if (parsed.charts[0]) setChartData(parsed.charts[0]);
        if (parsed.files?.length) setFiles(parsed.files);
      } catch {}
      setTextInput('');
      setInputData(prev => ({ ...prev, clipboard: null }));
      setIsSending(false);
    } else if (selectedOutput === 'audio') {
      try {
        // Stop any ongoing utterance before starting a new one
        try { 
          const speaking = await Speech.isSpeakingAsync();
          console.log('[tts] isSpeaking before stop:', speaking);
          await Speech.stop();
          console.log('[tts] stop called');
        } catch (e) { console.log('[tts] stop error', e); }
        
        if (agentMode === 'speak') {
          // Use OpenAI TTS directly - let the OutputTTSPanel handle it
          console.log('[tts] Using OpenAI TTS for speak mode');
          setTextInput('');
          setInputData(prev => ({ ...prev, clipboard: null }));
          setIsSending(false);
          setSelectedOutputIndex(1); // Switch to audio output
          return;
        }
        
        // 1) Get agent response via streaming, mirror to chat
        console.log('[tts] fetching agent reply for TTS…');
        let acc = '';
        setChatMessages((arr) => ['…', ...arr]);
        const agentSettings = appSettings.agentMode?.settings || appSettings.agent;
        const messages = agentSettings.systemPrompt 
          ? [{ role: 'system' as const, content: agentSettings.systemPrompt }, { role: 'user' as const, content: inputText }]
          : [{ role: 'user' as const, content: inputText }];
        await streamChat({
          provider: 'openai', // Always use OpenAI for agent modes
          model: agentSettings.model,
          messages,
          temperature: agentSettings.temperature,
          maxTokens: agentSettings.maxTokens,
        }, (chunk) => {
          acc += chunk;
          setChatMessages((arr) => [acc, ...arr.slice(1)]);
        });
        console.log('[tts] agent reply length:', acc.length);
        // 2) Parse structured outputs
        try {
          const parsed = parseOutputs(acc);
          if (parsed.codeBlocks[0]) setCodeSnippet(parsed.codeBlocks[0].code);
          if (parsed.imageUris[0]) setLastImage(parsed.imageUris[0]);
          if (parsed.tables[0]) {
            const t = parsed.tables[0];
            const rows = t.rows.map((r) => Object.fromEntries(t.headers.map((h, i) => [h, r[i] ?? ''])));
            setTableRows(rows);
          }
          if (parsed.charts[0]) setChartData(parsed.charts[0]);
          if (parsed.files?.length) setFiles(parsed.files);
        } catch {}
        // 3) Speak the agent reply, not the raw user input
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
        setInputData(prev => ({ ...prev, clipboard: null }));
        setIsSending(false);
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
        <Pressable style={styles.headerBack} onPress={() => setSettingsModalVisible(true)}>
          <Text style={{ fontSize: 16 }}>⚙️</Text>
        </Pressable>
      </View>
      {/* Main interface */}
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
            <View style={[styles.section, { flexDirection: 'column', gap: 16 }]}>
          {/* Input Section */}
          <View style={[styles.half, styles.panel, { backgroundColor: '#ffffff' }]}>
            <VerticalLabel text="input" side="left" />
            <StackPager
              items={[...inputTypes]}
              selectedIndex={selectedInputIndex}
              onIndexChange={setSelectedInputIndex}
              renderItem={(type, idx, selected) => (
                    type === 'text' ? (
                      <InputTextCard 
                        value={textInput} 
                        onChange={setTextInput}
                        onSend={handleSend}
                        isSending={isSending}
                      />
                    ) : type === 'image' ? (
                      <ImageInputCard 
                        onImageSelect={(uri) => setInputData(prev => ({ ...prev, image: uri }))}
                        onSend={handleSend}
                        isSending={isSending}
                        agentMode={appSettings?.agentMode?.selectedMode}
                        onVisionAnalysis={handleVisionAnalysis}
                      />
                    ) : type === 'audio' ? (
                      <AudioInputCard 
                        onAudioSelect={(uri) => setInputData(prev => ({ ...prev, audio: uri }))}
                        onSend={handleSend}
                        isSending={isSending}
                        agentMode={appSettings?.agentMode?.selectedMode}
                        onTranscriptionResult={handleTranscriptionResult}
                      />
                    ) : type === 'file' ? (
                      <FileInputCard 
                        onFileSelect={(uri, name) => setInputData(prev => ({ ...prev, file: { uri, name } }))}
                        onSend={handleSend}
                        isSending={isSending}
                      />
                    ) : type === 'drawing' ? (
                      <DrawingInputCard 
                        onDrawingComplete={(svg) => setInputData(prev => ({ ...prev, drawing: svg }))}
                        onSend={handleSend}
                        isSending={isSending}
                      />
                    ) : type === 'clipboard' ? (
                      <ClipboardInputCard 
                        onClipboardPaste={(content, type) => setInputData(prev => ({ ...prev, clipboard: { content, type } }))}
                        onSend={handleSend}
                        isSending={isSending}
                      />
                    ) : null
              )}
            />
            <FilteredPaginationDots
              allItems={[...allInputTypes]}
              filteredItems={inputTypes}
              selectedIndex={selectedInputIndex}
              onDotPress={setSelectedInputIndex}
              icons={{
                text: '✏️',
                image: '🖼️',
                audio: '🎤',
                file: '📁',
                drawing: '🎨',
                clipboard: '📋'
              }}
            />
          </View>
          {/* Agent Section */}
          <View style={[styles.half, styles.panel, { backgroundColor: '#ffffff' }]}>
            <VerticalLabel text="agent" side="left" />
            <StackPager
              items={[...agentTypes]}
              selectedIndex={selectedAgentIndex}
              onIndexChange={(index) => {
                setSelectedAgentIndex(index);
                const newMode = agentTypes[index];
                
                // Update input/output indices to compatible defaults
                const compatibleInputs = filterInputTypes([...allInputTypes], newMode);
                const defaultInput = getDefaultInput(newMode);
                const newInputIndex = compatibleInputs.indexOf(defaultInput as InputType);
                if (newInputIndex !== -1) {
                  setSelectedInputIndex(newInputIndex);
                } else {
                  setSelectedInputIndex(0);
                }
                
                const compatibleOutputs = filterOutputTypes(allOutputTypes, newMode);
                const defaultOutput = getDefaultOutput(newMode);
                const newOutputIndex = compatibleOutputs.indexOf(defaultOutput as OutputType);
                if (newOutputIndex !== -1) {
                  setSelectedOutputIndex(newOutputIndex);
                } else {
                  setSelectedOutputIndex(0);
                }
                
                if (appSettings) {
                  const newSettings = getDefaultSettingsForMode(newMode);
                  handleSettingsChange({
                    ...appSettings,
                    agentMode: {
                      selectedMode: newMode,
                      settings: newSettings,
                    },
                  });
                }
              }}
              renderItem={(type, idx, selected) => {
                const settings = appSettings?.agentMode?.settings || getDefaultSettingsForMode(type);
                const onSettingsChange = (modeSettings: AgentModeSettings) => {
                  if (appSettings) {
                    handleSettingsChange({
                      ...appSettings,
                      agentMode: {
                        ...appSettings.agentMode,
                        settings: modeSettings,
                      },
                    });
                  }
                };

                return type === 'text' ? (
                  <TextAgentCard settings={settings} onSettingsChange={onSettingsChange} />
                ) : type === 'vision' ? (
                  <VisionAgentCard settings={settings} onSettingsChange={onSettingsChange} />
                ) : type === 'create' ? (
                  <CreateAgentCard settings={settings} onSettingsChange={onSettingsChange} />
                ) : type === 'transcribe' ? (
                  <TranscribeAgentCard settings={settings} onSettingsChange={onSettingsChange} />
                ) : type === 'speak' ? (
                  <SpeakAgentCard settings={settings} onSettingsChange={onSettingsChange} />
                ) : type === 'code' ? (
                  <CodeAgentCard settings={settings} onSettingsChange={onSettingsChange} />
                ) : null;
              }}
            />
            <PaginationDots
              count={agentTypes.length}
              index={selectedAgentIndex}
              onDotPress={setSelectedAgentIndex}
            />
          </View>
          {/* Output Section */}
          <View style={[styles.half, styles.panel, { backgroundColor: '#ffffff' }]}>
            <VerticalLabel text="output" side="left" />
            <StackPager
              items={outputTypes}
              selectedIndex={selectedOutputIndex}
              onIndexChange={setSelectedOutputIndex}
              renderItem={(type, idx, selected) => (
                    type === 'chat' ? (
                      <OutputChatPanel messages={chatMessages} />
                    ) : type === 'audio' ? (
                      <OutputTTSPanel 
                        status={ttsStatus} 
                        agentMode={appSettings?.agentMode?.selectedMode}
                        textToSpeak={textInput}
                        voice={appSettings?.agentMode?.settings?.voice || 'alloy'}
                      />
                    ) : type === 'image' ? (
                      <OutputImagePanel 
                        uri={lastImage ?? null} 
                        generatedImages={generatedImages}
                      />
                    ) : type === 'code' ? (
                      codeSnippet ? <OutputCodePanel code={codeSnippet} language={'js'} /> : <View style={{ padding: 20, alignItems: 'center' }}><Text style={{ color: '#6b7280' }}>No code output yet</Text></View>
                    ) : type === 'table' ? (
                      tableRows.length > 0 ? <OutputTablePanel rows={tableRows} title="Items" /> : <View style={{ padding: 20, alignItems: 'center' }}><Text style={{ color: '#6b7280' }}>No table data yet</Text></View>
                    ) : type === 'chart' ? (
                      <OutputChartPanel data={chartData} title="Distribution" />
                    ) : type === 'file' ? (
                      <OutputFilePanel files={files} />
                    ) : null
              )}
            />
            <FilteredPaginationDots
              allItems={allOutputTypes}
              filteredItems={outputTypes}
              selectedIndex={selectedOutputIndex}
              onDotPress={setSelectedOutputIndex}
              icons={{
                chat: '💬',
                audio: '🔊',
                image: '🖼️',
                code: '💻',
                table: '📊',
                chart: '📈',
                file: '📄'
              }}
            />
          </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      <StatusBar style="dark" />
      <LoadingOverlay visible={showLoader} title="MultiModal" subtitle="Loading…" logo={require('./assets/splash.png')} />
      {appSettings && (
        <SettingsModal
          visible={settingsModalVisible}
          settings={appSettings}
          onClose={() => setSettingsModalVisible(false)}
          onSettingsChange={handleSettingsChange}
        />
      )}
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
