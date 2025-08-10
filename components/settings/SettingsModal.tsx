import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  Switch,
  TextInput,
} from 'react-native';
import Slider from '@react-native-community/slider';
import type { AppSettings } from '../../services/settingsStorage';
import AgentSettingsPanel from '../modality/agent/AgentSettingsPanel';

export type SettingsModalProps = {
  visible: boolean;
  settings: AppSettings;
  onClose: () => void;
  onSettingsChange: (settings: AppSettings) => void;
};

export default function SettingsModal({ visible, settings, onClose, onSettingsChange }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'agent' | 'ui' | 'api'>('agent');

  const updateAgentSettings = (agentSettings: AppSettings['agent']) => {
    onSettingsChange({ ...settings, agent: agentSettings });
  };

  const updateUiSettings = (uiSettings: Partial<AppSettings['ui']>) => {
    onSettingsChange({ ...settings, ui: { ...settings.ui, ...uiSettings } });
  };

  const updateApiSettings = (apiSettings: Partial<AppSettings['api']>) => {
    onSettingsChange({ ...settings, api: { ...settings.api, ...apiSettings } });
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Done</Text>
          </Pressable>
        </View>

        <View style={styles.tabs}>
          {(['agent', 'ui', 'api'] as const).map((tab) => (
            <Pressable
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'agent' ? '🤖 Agent' : tab === 'ui' ? '🎨 UI' : '🔧 API'}
              </Text>
            </Pressable>
          ))}
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'agent' && (
            <AgentSettingsPanel
              settings={settings.agent}
              onSettingsChange={updateAgentSettings}
            />
          )}

          {activeTab === 'ui' && (
            <View>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Theme</Text>
                <View style={styles.buttonGroup}>
                  {(['light', 'dark'] as const).map((theme) => (
                    <Pressable
                      key={theme}
                      style={[
                        styles.optionButton,
                        settings.ui.theme === theme && styles.optionButtonActive,
                      ]}
                      onPress={() => updateUiSettings({ theme })}
                    >
                      <Text
                        style={[
                          styles.optionButtonText,
                          settings.ui.theme === theme && styles.optionButtonTextActive,
                        ]}
                      >
                        {theme === 'light' ? '☀️ Light' : '🌙 Dark'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Font Size</Text>
                <View style={styles.buttonGroup}>
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <Pressable
                      key={size}
                      style={[
                        styles.optionButton,
                        settings.ui.fontSize === size && styles.optionButtonActive,
                      ]}
                      onPress={() => updateUiSettings({ fontSize: size })}
                    >
                      <Text
                        style={[
                          styles.optionButtonText,
                          settings.ui.fontSize === size && styles.optionButtonTextActive,
                        ]}
                      >
                        {size.charAt(0).toUpperCase() + size.slice(1)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <View style={styles.switchRow}>
                  <Text style={styles.sectionTitle}>Show Hints</Text>
                  <Switch
                    value={settings.ui.showHints}
                    onValueChange={(value) => updateUiSettings({ showHints: value })}
                    trackColor={{ false: '#d1d5db', true: '#111827' }}
                    thumbColor="#ffffff"
                  />
                </View>
                <Text style={styles.hint}>Display helpful tips throughout the app</Text>
              </View>
            </View>
          )}

          {activeTab === 'api' && (
            <View>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Custom API Key (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  value={settings.api.customApiKey || ''}
                  onChangeText={(text) => updateApiSettings({ customApiKey: text || undefined })}
                  placeholder="sk-..."
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Text style={styles.hint}>Use your own API key instead of the default</Text>
              </View>

              <View style={styles.section}>
                <View style={styles.sliderHeader}>
                  <Text style={styles.sectionTitle}>Timeout</Text>
                  <Text style={styles.sliderValue}>{(settings.api.timeout / 1000).toFixed(0)}s</Text>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={5000}
                  maximumValue={60000}
                  step={5000}
                  value={settings.api.timeout}
                  onValueChange={(value) => updateApiSettings({ timeout: value })}
                  minimumTrackTintColor="#111827"
                  maximumTrackTintColor="#d1d5db"
                  thumbTintColor="#111827"
                />
                <Text style={styles.hint}>Maximum time to wait for API response</Text>
              </View>

              <View style={styles.section}>
                <View style={styles.sliderHeader}>
                  <Text style={styles.sectionTitle}>Retry Attempts</Text>
                  <Text style={styles.sliderValue}>{settings.api.retryAttempts}</Text>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={5}
                  step={1}
                  value={settings.api.retryAttempts}
                  onValueChange={(value) => updateApiSettings({ retryAttempts: value })}
                  minimumTrackTintColor="#111827"
                  maximumTrackTintColor="#d1d5db"
                  thumbTintColor="#111827"
                />
                <Text style={styles.hint}>Number of times to retry failed requests</Text>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#111827',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: '#111827',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  optionButtonTextActive: {
    color: '#ffffff',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sliderValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  slider: {
    height: 40,
    marginHorizontal: -8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
    color: '#111827',
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
});