# TASKS

## ✅ Task 1: Consistent UI/UX for Component Cards
<outcome>
There is a consistent branding, iconography, and general user experience between our different component cards. Our "Chat" card, of a text type, has a single input box only, which is visible when pressed. Same with output.

**Implementation Details:**
- Simplified UI to single chat input/output
- Consistent expansion pattern: Icon → Tap → Full Interface
- Input: 💬 icon → Expands to text input + send button
- Output: 🗨️ icon → Expands to chat message display
- Clean, minimal design with consistent styling
- Platform-aware (web vs mobile) behavior
</outcome>

## ✅ Task 2: AI SDK Integration
<outcome>
Successfully integrated Vercel AI SDK v5 with OpenAI GPT-4o-mini. The chat functionality works across web and mobile platforms with proper authentication.

**Implementation Details:**
- Backend API at `https://multimodal-teal.vercel.app/api/chat`
- API key authentication via `x-api-key` header
- Platform-specific URL configuration (localhost for web dev, Vercel for mobile)
- Error handling with fallback to echo mode
- Non-streaming responses with client-side simulated streaming
</outcome>

## ✅ Task 3: Security & Authentication
<outcome>
Protected the API endpoints from unauthorized access using API key authentication.

**Implementation Details:**
- Generated secure API key: `mm_469eade2349b909e92b789cf1533dc3592f08480d9f6a0794ba09b94ac29669d`
- Required `x-api-key` header on `/api/chat` endpoint
- Environment variables in Vercel for production
- Health check endpoint (`/api/test`) remains open
- Documentation for security setup in `SECURE_YOUR_API.md`
</outcome>

## ✅ Task 4: Platform Compatibility
<outcome>
Ensured the app works seamlessly across web browser, iOS, and Android platforms.

**Implementation Details:**
- Platform.OS detection for accurate platform identification
- Conditional API URLs based on platform
- CORS configuration for cross-origin requests
- Network debugging tools (🔧 icon in header)
- Tested on web (localhost), iOS (Expo Go), and Android (Expo Go)
</outcome>

## ✅ Task 5: Documentation & Session Management
<outcome>
Created comprehensive documentation for parallel AI development sessions.

**Implementation Details:**
- Updated `CLAUDE.md` with complete project guidance
- Created `.vibe/docs/cards.md` documenting all UI components
- Created `.vibe/docs/approach.md` with development methodology
- Established parallel session protocol for multiple AI assistants
- Decision log and troubleshooting patterns documented
</outcome>

## 🚀 Current Status: PRODUCTION READY

### Working Features:
- ✅ Simplified chat interface with expandable sections
- ✅ AI-powered responses via OpenAI GPT-4o-mini
- ✅ Secure API with authentication
- ✅ Cross-platform support (web, iOS, Android)
- ✅ Network debugging tools
- ✅ Comprehensive documentation

### Production Configuration:
- **API URL**: `https://multimodal-teal.vercel.app`
- **Authentication**: API key required for chat endpoint
- **Deployment**: Automatic via Vercel on push to main
- **Monitoring**: Check Vercel dashboard for logs and usage

## 📋 Next Phase Tasks

### 📐 Card Definition Phase

**Goal**: Define the interface, behavior, and contracts for all cards before implementation.

**Shared Definitions**:
1. [ ] Define base card interface
   - Collapsed state (icon + hint)
   - Expanded state (full UI)
   - State management pattern
   - Animation/transition specs

2. [ ] Define common types
   - `InputType`: 'text' | 'image' | 'audio' | 'file' | 'drawing'
   - `OutputType`: 'chat' | 'audio' | 'image' | 'code' | 'table'
   - `CardState`: 'collapsed' | 'expanding' | 'expanded' | 'collapsing'
   - Message format for all card communications

3. [ ] Define card template structure
   - Header (title, settings icon)
   - Body (main content area)
   - Footer (action buttons, status)
   - Send trigger mechanism (Enter key or Send icon)

**Input Card Definitions**:
1. [ ] TextInputCard
   - Single text area (multiline)
   - No submit button in card (template provides)
   - Enter key behavior (shift+enter for newline)
   - Character limit indicator
   - Placeholder text

2. [ ] ImageInputCard
   - Image preview area
   - Source selector (camera/gallery/URL)
   - Compression settings
   - Caption field (optional)
   - Max size/dimensions

3. [ ] AudioInputCard
   - Recording controls (start/stop/pause)
   - Waveform visualization
   - Duration indicator
   - Playback preview
   - Format selection

4. [ ] FileInputCard
   - Drop zone or picker
   - File type restrictions
   - Size limits
   - Preview for supported types
   - Multiple file support

**Agent Card Definition**:
1. [ ] AgentCard interface
   - Collapsed: 🤖 + "OpenAI GPT-4"
   - Expanded: Model info + status
   - Settings access (gear icon)
   - Processing indicator
   - Error state display

2. [ ] Settings panel spec
   - Model dropdown
   - Temperature slider
   - Response length
   - System prompt area
   - Save/reset buttons

**Output Card Definitions**:
1. [ ] ChatOutputCard
   - Message list (scrollable)
   - Message bubbles (user/assistant)
   - Timestamp display
   - Copy message action
   - Clear history option

2. [ ] AudioOutputCard
   - Playback controls
   - Progress bar
   - Volume control
   - Download option
   - Transcript display

3. [ ] ImageOutputCard
   - Image display area
   - Zoom/pan controls
   - Download button
   - Metadata display
   - Gallery view for multiple

4. [ ] CodeOutputCard
   - Syntax highlighting
   - Language selector
   - Copy button
   - Line numbers
   - Collapse/expand sections

**Card Communication Protocol**:
1. [ ] Define message flow
   - Input → Agent (with type)
   - Agent → Output (with type)
   - Error propagation
   - Status updates

2. [ ] Define send mechanism
   - Trigger: Enter key OR Send icon
   - Validation before send
   - Loading states
   - Success/error feedback

**Deliverable**: `.vibe/docs/card-specifications.md` with complete interface definitions

### 🔬 Research Phase: Vercel AI SDK Modalities

**Goal**: Identify all possible input/output types supported by Vercel AI SDK v5 for comprehensive card implementation.

**Research Tasks**:
1. [ ] Document all supported input modalities in AI SDK
   - Text input (basic messages)
   - Image input (base64, URLs)
   - File attachments support
   - Audio input capabilities
   - Tool/function calling inputs
   - System prompts and context

2. [ ] Document all supported output modalities
   - Text streaming
   - Tool/function call responses
   - Image generation endpoints
   - Audio/speech generation
   - Embeddings generation
   - Structured data outputs (JSON mode)

3. [ ] Document OpenAI-specific capabilities
   - GPT-4 Vision for image understanding
   - DALL-E for image generation
   - Whisper for speech-to-text
   - TTS for text-to-speech
   - Model-specific limitations

4. [ ] Create modality compatibility matrix
   - Which inputs work with which OpenAI models
   - Which outputs are available from OpenAI
   - Rate limits and size constraints

**Deliverable**: `.vibe/docs/ai-sdk-modalities.md` with complete capability mapping

### 🎴 Card Implementation Phase

**Goal**: Create input/output cards for each supported modality.

**Input Cards to Implement**:
1. [ ] TextInputCard (✅ exists - enhance)
2. [ ] ImageInputCard (camera/gallery/URL)
3. [ ] AudioInputCard (recording/upload)
4. [ ] FileInputCard (document picker)
5. [ ] DrawingInputCard (canvas/sketch)
6. [ ] ClipboardInputCard (paste rich content)

**Output Cards to Implement**:
1. [ ] ChatOutputCard (✅ exists - enhance)
2. [ ] AudioOutputCard (✅ TTS exists - enhance)
3. [ ] ImageOutputCard (display generated images)
4. [ ] CodeOutputCard (syntax highlighted)
5. [ ] TableOutputCard (structured data)
6. [ ] ChartOutputCard (data visualization)
7. [ ] FileOutputCard (downloadable content)

### 🤖 Agent Section Restoration

**Goal**: Re-add Agent selection between Input and Output with OpenAI as default.

**Implementation Tasks**:
1. [ ] Restore Agent section in UI layout
   - Position between Input and Output sections
   - Consistent card styling with expand/collapse
   - Icon: 🤖 when collapsed

2. [ ] Create AgentCard component
   - Display OpenAI as provider
   - Show selected model (gpt-4o-mini, gpt-4o, etc.)
   - Status indicator (ready/processing/error)
   - Settings gear icon

3. [ ] Implement Agent Settings Panel
   - Model selector dropdown
   - Temperature slider (0.0 - 2.0)
   - Max tokens input
   - Top-p parameter
   - Frequency penalty
   - Presence penalty
   - System prompt editor

4. [ ] Wire Agent configuration
   - Pass settings to API calls
   - Persist preferences in AsyncStorage
   - Validate settings per model

**UI Flow**:
```
Input (expanded) → Agent (collapsed 🤖) → Output (expanded)
                    ↓ tap
              Agent Settings Panel
```

### 🎛️ Settings Management

**Goal**: Comprehensive settings interface for agent configuration.

**Settings Categories**:
1. [ ] Model Settings
   - Model selection (gpt-4o-mini, gpt-4o, gpt-4-turbo)
   - Advanced parameters (temperature, top-p, etc.)

2. [ ] Response Settings
   - Streaming enabled/disabled
   - Response length preferences
   - Language preferences
   - Output format (markdown, plain text, code)

3. [ ] UI Settings
   - Theme (light/dark)
   - Text size
   - Animation speed
   - Auto-expand preferences

4. [ ] API Settings
   - Custom API endpoint
   - Timeout configuration
   - Retry logic settings
   - Cache preferences

**Implementation**:
- Settings accessed via ⚙️ icon in Agent card
- Modal or slide-out panel
- Real-time preview of changes
- Reset to defaults option

### ✅ Task: Inputs/Outputs/Agents Types + TTS Output Card

Status: Completed

Goal
- Define canonical types for Inputs, Outputs, and Agents, and expand the output stack to include a Text‑to‑Speech (TTS) output card selectable via swipe while input remains text.

Subtasks
1) Types & Schema
- Add/confirm `InputType`, `OutputType`, `CapabilityInput`, and `Agent` in `components/types.ts`.
- Map `InputType → CapabilityInput` (e.g., `photo → image`, `clipboard → text`).
2) TTS Output Card
- Implement `components/modality/output/OutputTTSPanel.tsx` to display current TTS status (`idle|speaking|error`).
- Integrate `expo-speech` in `App.tsx` for speaking text.
3) Swipeable Output Selector
- Use `components/ui/StackPager.tsx` with `components/ui/PaginationDots.tsx` to switch outputs (Chat, Audio/TTS).
- Manage `selectedOutputIndex` state; expand Output section on first send.
4) Routing Logic
- If Output = `chat`: stream via `services/agentClient.streamChat` and render in `OutputChatPanel`.
- If Output = `audio`: stream the assistant reply first, then call `Speech.speak(<assistant_text>)`; update `ttsStatus` on start/done/error.
5) Docs
- Add `.vibe/docs/types-and-routing.md` documenting types, mapping, routing, and TTS behavior.
- Link from README Docs and cross‑link with `.vibe/docs/agents.md`.

Acceptance Criteria
- User can swipe to choose Output between Chat and Audio/TTS after sending.
- TTS audibly speaks the assistant response; status transitions speaking → idle; errors set status to error without crashing.
- Chat output continues to stream and render messages correctly.
- Types and routing docs exist and are linked from README.

### Near Term Improvements:
- [ ] Add conversation history persistence
- [ ] Implement rate limiting on API
- [ ] Add user preferences storage
- [ ] Improve error message UX
- [ ] Add loading states during API calls

### Feature Additions:
- [ ] Voice input using expo-speech
- [ ] Image input support for GPT-4 Vision
- [ ] Image generation with DALL-E
- [ ] Speech-to-text with Whisper
- [ ] Conversation export functionality

### Infrastructure:
- [ ] Add API response caching
- [ ] Implement proper SSE streaming (when Express 5 fixes issues)
- [ ] Add API usage analytics
- [ ] Set up error monitoring (Sentry)
- [ ] Add API versioning

## 📝 Notes

- All critical tasks for MVP are complete
- App is production-ready and deployed
- Security is implemented and tested
- Documentation is comprehensive for future development
- Ready for parallel AI session development
