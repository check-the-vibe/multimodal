import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';

export type AgentMode = 'text' | 'vision' | 'create' | 'transcribe' | 'speak' | 'code';

export type AgentModeConfig = {
  id: AgentMode;
  name: string;
  icon: string;
  description: string;
  model: string;
  endpoint?: string;
};

export const AGENT_MODES: AgentModeConfig[] = [
  {
    id: 'text',
    name: 'Text',
    icon: '💬',
    description: 'Standard chat conversation',
    model: 'gpt-4o',
  },
  {
    id: 'vision',
    name: 'Vision',
    icon: '👁️',
    description: 'Image analysis and description',
    model: 'gpt-4o',
  },
  {
    id: 'create',
    name: 'Create',
    icon: '🎨',
    description: 'Generate images from text',
    model: 'dall-e-3',
    endpoint: 'openai/generate',
  },
  {
    id: 'transcribe',
    name: 'Transcribe',
    icon: '🎤',
    description: 'Convert speech to text',
    model: 'whisper-1',
    endpoint: 'openai/transcribe',
  },
  {
    id: 'speak',
    name: 'Speak',
    icon: '🔊',
    description: 'Convert text to speech',
    model: 'tts-1',
    endpoint: 'openai/tts',
  },
  {
    id: 'code',
    name: 'Code',
    icon: '⌨️',
    description: 'Code generation and analysis',
    model: 'gpt-4o',
  },
];

export type AgentModeSelectorProps = {
  selectedMode: AgentMode;
  onModeChange: (mode: AgentMode) => void;
  layout?: 'grid' | 'list';
};

export default function AgentModeSelector({ 
  selectedMode, 
  onModeChange, 
  layout = 'grid' 
}: AgentModeSelectorProps) {
  const selectedConfig = AGENT_MODES.find(mode => mode.id === selectedMode);

  if (layout === 'list') {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.currentModeSection}>
          <Text style={styles.sectionTitle}>Selected Mode</Text>
          {selectedConfig && (
            <View style={styles.currentModeCard}>
              <Text style={styles.currentModeIcon}>{selectedConfig.icon}</Text>
              <View style={styles.currentModeInfo}>
                <Text style={styles.currentModeName}>{selectedConfig.name}</Text>
                <Text style={styles.currentModeDescription}>{selectedConfig.description}</Text>
                <Text style={styles.currentModeModel}>Model: {selectedConfig.model}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.allModesSection}>
          <Text style={styles.sectionTitle}>All Modes</Text>
          <View style={styles.listContainer}>
            {AGENT_MODES.map((mode) => (
              <ModeListItem
                key={mode.id}
                mode={mode}
                selected={selectedMode === mode.id}
                onPress={() => onModeChange(mode.id)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Agent Mode</Text>
      <View style={styles.gridContainer}>
        {AGENT_MODES.map((mode) => (
          <ModeGridItem
            key={mode.id}
            mode={mode}
            selected={selectedMode === mode.id}
            onPress={() => onModeChange(mode.id)}
          />
        ))}
      </View>
    </View>
  );
}

type ModeItemProps = {
  mode: AgentModeConfig;
  selected: boolean;
  onPress: () => void;
};

function ModeGridItem({ mode, selected, onPress }: ModeItemProps) {
  return (
    <Pressable
      style={[
        styles.gridItem,
        selected && styles.gridItemSelected,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Select ${mode.name} mode: ${mode.description}`}
    >
      <Text style={[styles.gridItemIcon, selected && styles.gridItemIconSelected]}>
        {mode.icon}
      </Text>
      <Text style={[styles.gridItemName, selected && styles.gridItemNameSelected]}>
        {mode.name}
      </Text>
    </Pressable>
  );
}

function ModeListItem({ mode, selected, onPress }: ModeItemProps) {
  return (
    <Pressable
      style={[
        styles.listItem,
        selected && styles.listItemSelected,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Select ${mode.name} mode: ${mode.description}`}
    >
      <Text style={styles.listItemIcon}>{mode.icon}</Text>
      <View style={styles.listItemContent}>
        <Text style={[styles.listItemName, selected && styles.listItemNameSelected]}>
          {mode.name}
        </Text>
        <Text style={styles.listItemDescription}>{mode.description}</Text>
        <Text style={styles.listItemModel}>Model: {mode.model}</Text>
      </View>
      {selected && <Text style={styles.selectedIndicator}>✓</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  currentModeSection: {
    marginBottom: 24,
  },
  currentModeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  currentModeIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  currentModeInfo: {
    flex: 1,
  },
  currentModeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  currentModeDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 2,
  },
  currentModeModel: {
    fontSize: 12,
    color: '#0ea5e9',
    fontWeight: '500',
  },
  allModesSection: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
  },
  gridItemSelected: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  gridItemIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  gridItemIconSelected: {
    // Icon stays the same color when selected
  },
  gridItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  gridItemNameSelected: {
    color: '#ffffff',
  },
  listContainer: {
    gap: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  listItemSelected: {
    backgroundColor: '#f0f9ff',
    borderColor: '#0ea5e9',
  },
  listItemIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  listItemContent: {
    flex: 1,
  },
  listItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  listItemNameSelected: {
    color: '#0ea5e9',
  },
  listItemDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 2,
  },
  listItemModel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  selectedIndicator: {
    fontSize: 16,
    color: '#0ea5e9',
    fontWeight: '600',
    marginLeft: 8,
  },
});