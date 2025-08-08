Title: Component Inventory and Contracts

Overview
- This document lists reusable components for the 3s loader → stacked chat I/O milestone.
- Each entry covers responsibility, props, events, styling, and a brief usage example.
- Goal: Implement components first, then assemble the interface with minimal glue logic.

Foundations

1) LoadingOverlay
- Responsibility: Full-screen overlay that centers a logo and title; controlled visibility.
- Props:
  - `visible: boolean` — controls display.
  - `title?: string` — e.g., "MultiModal".
  - `logo?: ImageSourcePropType` — app logo/image.
  - `subtitle?: string` — optional supporting text.
  - `backgroundColor?: string` — defaults to light.
- Events: none (parent controls visibility/timing).
- Styling: stretches to screen; centers content vertically/horizontally; safe-area aware.
- Example:
  - `<LoadingOverlay visible={loading} title="MultiModal" logo={require('../../assets/splash.png')} />`

2) StackPager<T>
- Responsibility: Generic, swipeable, horizontal pager with stacked “block/cube” visual.
- Props:
  - `items: T[]`
  - `renderItem: (item: T, index: number, selected: boolean) => ReactNode`
  - `selectedIndex: number`
  - `onIndexChange: (index: number) => void`
  - `loop?: boolean` — visual wrap-around illusion; default false.
  - `cardWidth?: number` — defaults to viewport width.
  - `style?: ViewStyle` — container style.
- Events: `onIndexChange` fired after momentum scroll.
- Styling: applies transform/opacity to neighbors for stacked feel; snap/paging enabled.
- Example:
  - `<StackPager items={inputs} selectedIndex={i} onIndexChange={setI} renderItem={(it, idx, sel) => <ModalityCard selected={sel} label={it} />} />`

3) ModalityCard
- Responsibility: Presentational card wrapper for an item in a pager.
- Props:
  - `selected?: boolean`
  - `label?: string` — optional caption header.
  - `tone?: 'neutral' | 'input' | 'output'` — theme accent.
  - `style?: ViewStyle`
  - `children?: ReactNode`
- Events: none.
- Styling: rounded/outlined or flat block; subtle shadow; responds to `selected` with scale/opacity.
- Example:
  - `<ModalityCard selected tone="input">{content}</ModalityCard>`

4) PaginationDots
- Responsibility: Dots indicator for paged stacks.
- Props:
  - `count: number`
  - `index: number`
  - `onDotPress?: (index: number) => void`
  - `tone?: 'light' | 'dark'`
- Events: `onDotPress` optional navigation.
- Styling: small rounded dots; active dot highlighted.
- Example: `<PaginationDots count={4} index={current} onDotPress={setCurrent} />`

Inputs (feature components)

5) InputTextCard
- Responsibility: Text input modality.
- Props:
  - `value: string`
  - `onChange: (text: string) => void`
  - `placeholder?: string`
- Events: `onChange` per keystroke.
- Styling: uses `ModalityCard` internally with a TextInput.
- Example: `<InputTextCard value={text} onChange={setText} />`

6) InputAudioCard
- Responsibility: Audio recording stub with toggle.
- Props:
  - `recording: boolean`
  - `onToggle: () => void`
  - `lastUri?: string | null`
- Events: `onToggle` to start/stop.
- Styling: `ModalityCard` + status label/button.
- Example: `<InputAudioCard recording={rec} onToggle={toggleRec} lastUri={lastAudio} />`

7) InputPhotoCard
- Responsibility: Photo capture/pick stub with last thumbnail.
- Props:
  - `thumbnailUri?: string | null`
  - `onCapture: () => void`
  - `onPick?: () => void`
- Events: `onCapture`, `onPick`.
- Styling: `ModalityCard` + image preview or placeholder.
- Example: `<InputPhotoCard thumbnailUri={img} onCapture={takePhoto} onPick={pickImage} />`

8) InputVideoCard
- Responsibility: Video capture/pick stub with last URI label.
- Props:
  - `videoUri?: string | null`
  - `onCapture: () => void`
  - `onPick?: () => void`
- Events: `onCapture`, `onPick`.
- Styling: `ModalityCard` + URI text/placeholder.
- Example: `<InputVideoCard videoUri={vid} onCapture={takeVideo} />`

Outputs (feature components)

9) OutputChatPanel
- Responsibility: Renders message list (most recent first or last); lightweight bubbles.
- Props:
  - `messages: string[]`
  - `reverse?: boolean` — display newest on top; default true.
- Events: none.
- Styling: simple vertical list; accessible text.
- Example: `<OutputChatPanel messages={chatMessages} />`

10) OutputTTSPanel
- Responsibility: Displays TTS state and a hint; invokes TTS externally.
- Props:
  - `status?: 'idle' | 'speaking' | 'error'`
  - `hint?: string`
- Events: none (TTS side-effect lives in parent on send).
- Styling: informative card.
- Example: `<OutputTTSPanel status="idle" hint="Uses expo-speech" />`

11) OutputImagePanel
- Responsibility: Shows last image thumbnail or placeholder.
- Props:
  - `uri?: string | null`
  - `alt?: string`
- Events: none.
- Styling: `ModalityCard` + Image component.
- Example: `<OutputImagePanel uri={lastImage} alt="Last image" />`

Composition Helpers

12) ChatComposer
- Responsibility: Text field + send button for composing messages.
- Props:
  - `value: string`
  - `onChange: (text: string) => void`
  - `onSend: () => void`
  - `disabled?: boolean`
- Events: `onSend` triggers routing of current input → output.
- Styling: compact row; accessible button label.
- Example: `<ChatComposer value={text} onChange={setText} onSend={handleSend} />`

13) TabsBar
- Responsibility: Small tab strip for switching app sections (Home, Inputs, Outputs) if needed.
- Props:
  - `tabs: { id: string; label: string }[]`
  - `activeId: string`
  - `onChange: (id: string) => void`
- Events: `onChange` when a tab is pressed.
- Styling: pill buttons; highlight active.
- Example: `<TabsBar tabs={tabs} activeId={tab} onChange={setTab} />`

Types and Layout

14) Modality Types (types.ts)
- Responsibility: Centralize types/enums for modalities.
- Shape:
  - `export type InputType = 'text' | 'audio' | 'photo' | 'video'`
  - `export type OutputType = 'chat' | 'audio' | 'image'`
- Usage: Shared across components/screens for consistency.

Suggested File Layout (no code yet)
- `components/LoadingOverlay.tsx`
- `components/ui/StackPager.tsx`
- `components/ui/ModalityCard.tsx`
- `components/ui/PaginationDots.tsx`
- `components/composer/ChatComposer.tsx`
- `components/modality/input/{InputTextCard,InputAudioCard,InputPhotoCard,InputVideoCard}.tsx`
- `components/modality/output/{OutputChatPanel,OutputTTSPanel,OutputImagePanel}.tsx`
- `components/nav/TabsBar.tsx`
- `components/types.ts`

Acceptance for Docs (Task 0)
- All components above documented with props and intent.
- Examples compile conceptually and map to current app state/handlers.
- Ready for FEATURES to scaffold code with minimal ambiguity.

