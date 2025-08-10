# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a multimodal AI chat application built with Expo and React Native, featuring:
- **Frontend**: Expo SDK ~53, React Native 0.79, React 19, TypeScript (strict mode)
- **Backend**: Vercel Functions with AI SDK v5 (OpenAI, Anthropic, Google)
- **Architecture**: Simplified chat interface with expandable input/output sections

## Current Implementation

### ✅ Completed Features
- **Simplified Chat UI**: Icon placeholders that expand to full interfaces
- **AI Integration**: OpenAI GPT-4o-mini via Vercel AI SDK
- **Security**: API key authentication (`x-api-key` header)
- **Platform Detection**: Automatic URL switching (localhost for web dev, Vercel for mobile)
- **Error Handling**: Detailed network error messages and fallback to echo mode
- **Debug Tools**: Network test button (🔧) in header

### 🏗️ Architecture

```
/workspaces/multimodal/
├── App.tsx                     # Main app with chat UI
├── services/
│   ├── config.ts              # API URLs and authentication
│   └── agentClient.ts         # AI chat client
├── components/
│   ├── modality/
│   │   ├── input/            # Input cards (text only now)
│   │   └── output/           # Output panels (chat only now)
│   ├── composer/             # Chat input composer
│   └── ui/                   # Reusable UI components
├── multimodal-api/           # Vercel API backend
│   ├── api/
│   │   ├── chat.ts          # AI chat endpoint
│   │   └── test.ts          # Health check
│   ├── server.js            # Express server for local dev
│   └── vercel.json          # Vercel configuration
└── .vibe/
    └── docs/                 # Architecture documentation
```

## Development Workflow

### 1. Start Local Development
```bash
# Terminal 1: Start Expo
npm start
# or for tunnel (mobile testing)
npm run dev:tunnel

# Terminal 2: Start API server
cd multimodal-api
node server.js
```

### 2. Platform-Specific URLs
- **Web Browser (Dev)**: `http://localhost:3000`
- **iOS/Android (Dev)**: `https://multimodal-teal.vercel.app`
- **Production (All)**: `https://multimodal-teal.vercel.app`

### 3. Testing Commands
```bash
npm test                    # Jest tests
npm run lint               # ESLint
npm run typecheck          # TypeScript check
npm run format             # Prettier formatting
```

## API Configuration

### Environment Variables (Vercel Dashboard)
```env
OPENAI_API_KEY=sk-...                # OpenAI API key
MULTIMODAL_API_KEY=mm_...           # API authentication key
ANTHROPIC_API_KEY=...                # Optional: Anthropic
GOOGLE_GENERATIVE_AI_API_KEY=...    # Optional: Google AI
```

### Local Development (.env.local)
```env
OPENAI_API_KEY=sk-...
MULTIMODAL_API_KEY=mm_469eade2349b909e92b789cf1533dc3592f08480d9f6a0794ba09b94ac29669d
EXPO_PUBLIC_MULTIMODAL_API_KEY=mm_469eade2349b909e92b789cf1533dc3592f08480d9f6a0794ba09b94ac29669d
```

## Component Documentation

### Core UI States
```typescript
// App.tsx
const [inputExpanded, setInputExpanded] = useState(false);   // Chat input visibility
const [outputExpanded, setOutputExpanded] = useState(false); // Chat output visibility
const [textInput, setTextInput] = useState('');             // Current message
const [chatMessages, setChatMessages] = useState<string[]>([]);  // Message history
```

### Key Components
- **InputTextCard**: Expandable text input area
- **OutputChatPanel**: Scrollable chat message display
- **ChatComposer**: Input field with send button
- **VerticalLabel**: Section label (input/output)

## Security & Authentication

### API Protection
All `/api/chat` requests require:
```typescript
headers: {
  'Content-Type': 'application/json',
  'x-api-key': MULTIMODAL_API_KEY
}
```

### Generate New API Key
```bash
node -e "console.log('mm_' + require('crypto').randomBytes(32).toString('hex'))"
```

## Debugging Guide

### Common Issues & Solutions

1. **Network Request Failed (iOS)**
   - Check: Is Vercel URL correct in config.ts?
   - Solution: Force quit Expo Go, rescan QR code

2. **401 Unauthorized**
   - Check: MULTIMODAL_API_KEY in Vercel environment
   - Solution: Add key in Vercel dashboard, redeploy

3. **API authentication not configured**
   - Check: Server has MULTIMODAL_API_KEY env var
   - Solution: Add to Vercel, wait for deployment

4. **CORS Errors**
   - Check: Response includes CORS headers
   - Solution: Verify corsHeaders in api/chat.ts

### Debug Tools
- **Network Test**: Tap 🔧 icon in header
- **Console Prefixes**: 
  - `[Config]` - Configuration and platform detection
  - `[agentClient]` - API requests and responses
  - `[Network Test]` - Connectivity testing

## Git Workflow

### Before Starting Work
```bash
git status                  # Check current state
git pull origin main        # Get latest changes
tmux list-sessions         # Check running sessions
```

### Commit Standards
- Clear, descriptive messages
- Include context for changes
- Reference issues if applicable
- Never commit API keys or secrets

### Pre-Push Checklist
- [ ] Remove debug console.logs
- [ ] Test on web browser
- [ ] Test on iOS/Android
- [ ] Verify authentication works
- [ ] Run lint and typecheck
- [ ] Update documentation

## Parallel Session Management

When running multiple AI sessions:
1. **Document in .vibe/docs/**: Keep approach documentation current
2. **Use CLAUDE.md**: For Claude-specific guidance
3. **Use AGENTS.md**: For Codex/other AI guidance
4. **Sync Regularly**: Pull changes between sessions
5. **Test Everything**: Verify changes work across platforms

## Important Files Reference

### Configuration
- `/services/config.ts` - API URLs, keys, platform detection
- `/services/agentClient.ts` - AI chat client implementation
- `/multimodal-api/vercel.json` - Vercel deployment config
- `/multimodal-api/api/chat.ts` - Chat endpoint logic

### Documentation
- `/CLAUDE.md` - This file (Claude guidance)
- `/.vibe/docs/` - Architecture and component docs
- `/multimodal-api/SECURE_YOUR_API.md` - Security setup guide
- `/.vibe/TASKS.md` - Implementation status tracking

## Next Steps & Improvements

### Immediate Priorities
1. Document all UI cards in `.vibe/docs/cards.md`
2. Create architecture diagrams
3. Add rate limiting to API
4. Implement session management

### Future Enhancements
- Add streaming when Express 5 fixes SSE
- Support Anthropic and Google providers
- Add conversation history persistence
- Implement user authentication
- Add image/audio support back

## Code Style Requirements

### TypeScript
```typescript
// ALWAYS use explicit types
const handleSend = async (): Promise<void> => { }

// AVOID any when possible
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
```

### React Native
```typescript
// Platform checks
import { Platform } from 'react-native';
if (Platform.OS === 'ios') { }

// Absolute paths only
const filePath = '/workspaces/multimodal/App.tsx';
```

### API Responses
```typescript
// Consistent error format
res.status(400).json({ 
  error: 'Error message',
  details: 'Additional context'
});
```

## Testing Strategy

### Unit Tests
- Components render without crashing
- API utilities handle errors
- Platform detection works correctly

### Integration Tests
- Chat flow works end-to-end
- Authentication blocks invalid requests
- CORS allows legitimate origins

### Manual Testing
- Web browser (Chrome/Safari)
- iOS device (Expo Go)
- Android device (Expo Go)
- Network interruptions handled

---

**Remember**: This is a living document. Update it as the project evolves!