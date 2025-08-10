# Cards & Components Documentation

## Overview

This document describes all UI cards and components in the multimodal application. Each card follows a consistent pattern for expandable, interactive interfaces.

## Card Architecture Pattern

### Base Card Structure
```typescript
interface Card {
  expanded: boolean;           // Whether card shows full UI or icon
  enabled: boolean;           // Whether card is interactive
  value: any;                 // Current card state/data
  onChange: (value: any) => void;  // Update handler
}
```

### Expansion Pattern
All cards follow this UX pattern:
1. **Collapsed State**: Show icon + hint text
2. **User Interaction**: Tap to expand
3. **Expanded State**: Show full interface
4. **Data Entry**: User interacts with expanded UI
5. **Auto-Expand**: When data arrives, expand automatically

## Current Cards (Simplified)

### 1. Input Card
**Location**: `App.tsx` (inline)
**State**: `inputExpanded`

#### Collapsed State
```typescript
<Pressable onPress={() => setInputExpanded(true)}>
  <Text style={styles.chatIcon}>💬</Text>
  <Text style={styles.hintSmall}>Tap to chat</Text>
</Pressable>
```

#### Expanded State
```typescript
<>
  <InputTextCard value={textInput} onChange={setTextInput} />
  <ChatComposer value={textInput} onChange={setTextInput} onSend={handleSend} />
</>
```

### 2. Output Card
**Location**: `App.tsx` (inline)
**State**: `outputExpanded`

#### Collapsed State
```typescript
<View style={styles.iconContainer}>
  <Text style={styles.chatIcon}>🗨️</Text>
  <Text style={styles.hintSmall}>Chat responses will appear here</Text>
</View>
```

#### Expanded State
```typescript
<OutputChatPanel messages={chatMessages} />
```

## Component Library

### Core Components

#### InputTextCard
**Path**: `components/modality/input/InputTextCard.tsx`
**Purpose**: Multi-line text input area
```typescript
interface Props {
  value: string;
  onChange: (text: string) => void;
}
```

#### OutputChatPanel
**Path**: `components/modality/output/OutputChatPanel.tsx`
**Purpose**: Scrollable chat message display
```typescript
interface Props {
  messages: string[];
}
```

#### ChatComposer
**Path**: `components/composer/ChatComposer.tsx`
**Purpose**: Single-line input with send button
```typescript
interface Props {
  value: string;
  onChange: (text: string) => void;
  onSend: () => void;
  disabled?: boolean;
}
```

#### VerticalLabel
**Path**: `components/ui/VerticalLabel.tsx`
**Purpose**: Rotated section label
```typescript
interface Props {
  text: string;
  side: 'left' | 'right';
}
```

## Removed Cards (For Reference)

These cards were removed during simplification but document the pattern:

### InputAudioCard
- **Icon**: 🎤
- **Expanded**: Audio recording interface
- **State**: Recording status, audio URI

### InputPhotoCard
- **Icon**: 📷
- **Expanded**: Camera/gallery picker
- **State**: Selected image URI

### InputVideoCard
- **Icon**: 🎥
- **Expanded**: Video recording/picker
- **State**: Selected video URI

### InputClipboardCard
- **Icon**: 📋
- **Expanded**: Clipboard paste area
- **State**: Clipboard content

### OutputTTSPanel
- **Icon**: 🔊
- **Expanded**: Text-to-speech controls
- **State**: Speaking status

### OutputImagePanel
- **Icon**: 🖼️
- **Expanded**: Generated image display
- **State**: Image URI

### OutputClipboardPanel
- **Icon**: 📋
- **Expanded**: Copy to clipboard interface
- **State**: Text to copy

## Card State Management

### Expansion Logic
```typescript
// Auto-expand on first interaction
if (!outputExpanded && hasNewMessage) {
  setOutputExpanded(true);
}

// Manual expansion
<Pressable onPress={() => setInputExpanded(true)}>
```

### Data Flow
```
User Input → Input Card → Agent Client → API → Response → Output Card
```

### State Persistence
Currently no persistence - state resets on app reload.
Future: Could add AsyncStorage or Redux for persistence.

## Styling Patterns

### Common Styles
```typescript
const cardStyles = {
  panel: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  chatIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  hintSmall: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  }
}
```

## Animation Patterns

### Expansion Animation (Future)
```typescript
// Using React Native Animated API
const expandAnim = useRef(new Animated.Value(0)).current;

const expand = () => {
  Animated.timing(expandAnim, {
    toValue: 1,
    duration: 300,
    useNativeDriver: false,
  }).start();
};
```

## Accessibility

### Required Attributes
```typescript
<Pressable
  accessibilityRole="button"
  accessibilityLabel="Start chat"
  accessibilityHint="Tap to open chat input"
>
```

### Screen Reader Support
- All interactive elements have labels
- State changes announced
- Focus management on expansion

## Testing Patterns

### Component Tests
```typescript
describe('InputCard', () => {
  it('shows icon when collapsed', () => {
    const { getByText } = render(<InputCard expanded={false} />);
    expect(getByText('💬')).toBeTruthy();
  });
  
  it('shows input when expanded', () => {
    const { getByTestId } = render(<InputCard expanded={true} />);
    expect(getByTestId('text-input')).toBeTruthy();
  });
});
```

## Future Card Ideas

### Voice Input Card
- **Icon**: 🎙️
- **Purpose**: Voice-to-text input
- **API**: Web Speech API / expo-speech

### Drawing Card
- **Icon**: ✏️
- **Purpose**: Sketch input
- **Library**: react-native-svg

### Location Card
- **Icon**: 📍
- **Purpose**: Location sharing
- **API**: expo-location

### File Upload Card
- **Icon**: 📎
- **Purpose**: Document upload
- **API**: expo-document-picker

## Card Development Guidelines

### Creating New Cards

1. **Define Interface**
```typescript
interface NewCardProps {
  expanded: boolean;
  value: CardDataType;
  onChange: (value: CardDataType) => void;
  onExpand?: () => void;
}
```

2. **Implement States**
- Collapsed: Icon + hint
- Expanded: Full interface
- Loading: Activity indicator
- Error: Error message

3. **Handle Interactions**
- Tap to expand
- Data entry
- Validation
- Error recovery

4. **Test Coverage**
- Render tests
- Interaction tests
- State transition tests
- Accessibility tests

## Performance Considerations

### Lazy Loading
```typescript
const LazyCard = lazy(() => import('./cards/ComplexCard'));
```

### Memoization
```typescript
const MemoizedCard = memo(Card, (prev, next) => {
  return prev.value === next.value && prev.expanded === next.expanded;
});
```

### Virtual Lists
For many cards, use FlatList with:
- `removeClippedSubviews`
- `maxToRenderPerBatch`
- `windowSize`

---

**Note**: This document should be updated whenever new cards are added or existing cards are modified.