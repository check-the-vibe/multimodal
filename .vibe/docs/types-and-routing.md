Title: Types and Routing (Inputs, Outputs, Agents)

Overview
- Defines the canonical types for Inputs, Outputs, and Agents used by the app.
- Establishes a simple routing model from selected Input → selected Output.
- Guides implementers on how each “card” (component) functions.

Types
- InputType: `'text' | 'clipboard' | 'audio' | 'photo' | 'video'`
- OutputType: `'chat' | 'clipboard' | 'audio' | 'image'` (audio = text‑to‑speech)
- CapabilityInput (normalized for Agents): `'text' | 'audio' | 'image' | 'video'`
- Agent: `{ id, name, accepts: CapabilityInput[], produces: OutputType[], comingSoon?, description? }`

Mapping
- `mapInputToCapability(input: InputType) -> CapabilityInput`
  - `clipboard → text`
  - `photo → image`
  - otherwise identity

Cards and Functions
- InputTextCard: Accepts user text; parent holds `textInput` state.
- OutputChatPanel: Renders an array of strings as chat bubbles.
- OutputTTSPanel: Displays TTS status; when selected output is `audio`, parent triggers `expo-speech`.
- StackPager: Swipeable selector used for Output cards; shows `PaginationDots` beneath.

Routing Rules (Milestone A → A+)
- Selected Input: text.
- Selected Output: swipe between `chat` and `audio (TTS)`.
- On Send:
  - If Output=`chat`: call `services/agentClient.streamChat` and render streamed text in `OutputChatPanel`.
  - If Output=`audio`: call `Speech.speak(text)` from `expo-speech`; update `ttsStatus` to reflect speaking lifecycle.

Implementation Notes
- State: `selectedOutputIndex` with `outputTypes = ['chat','audio']` in `App.tsx`.
- TTS Lifecycle: `onStart → 'speaking'`, `onDone/onStopped → 'idle'`, `onError → 'error'`.
- Accessibility: Provide clear labels/alt text for cards; announce TTS status when it changes.

Next (Agents, Milestone B)
- Insert Agent section (pager) between Inputs and Outputs.
- Filter: visible agents by `accepts.includes(mapInput(selectedInput))`; visible outputs by `selectedAgent.produces`.
- Gate: If `comingSoon`, block send and show alert/toast.

References
- Types: `components/types.ts`
- UI: `components/ui/StackPager.tsx`, `components/ui/PaginationDots.tsx`, `components/modality/*`
- Service: `services/agentClient.ts`
- Docs: `.vibe/docs/agents.md`, `.vibe/docs/components.md`, `.vibe/docs/prompting-gpt5.md`

