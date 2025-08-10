# Multi-Modal API Endpoints Reference

## Current Endpoints

### `/api/chat` (POST)
**Purpose**: Text-only chat with AI models  
**Status**: ✅ Implemented

```typescript
interface ChatRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  provider?: 'openai' | 'anthropic' | 'google';
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}
```

### `/api/test` (GET)
**Purpose**: Health check endpoint  
**Status**: ✅ Implemented

## Proposed Multi-Modal Endpoints

### `/api/vision` (POST)
**Purpose**: Process images with text  
**Status**: 🔨 To be implemented

```typescript
interface VisionRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string | Array<
      | { type: 'text'; text: string }
      | { type: 'image'; data: string; mimeType?: string }
    >;
  }>;
  provider: 'openai' | 'anthropic' | 'google';
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

interface VisionResponse {
  message: string;
  provider: string;
  model: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    imageCount?: number;
  };
}
```

**Provider-Specific Models**:
- OpenAI: `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`
- Anthropic: `claude-3-5-sonnet-20241022`, `claude-3-opus`, `claude-3-haiku`
- Google: `gemini-2.0-flash-exp`, `gemini-1.5-pro`, `gemini-1.5-flash`

### `/api/audio/transcribe` (POST)
**Purpose**: Convert speech to text  
**Status**: 🔨 To be implemented

```typescript
interface TranscribeRequest {
  audio: string; // base64 encoded audio
  mimeType: 'audio/wav' | 'audio/mp3' | 'audio/m4a' | 'audio/webm';
  provider: 'openai' | 'google';
  language?: string; // ISO 639-1 code
  prompt?: string; // Optional context
}

interface TranscribeResponse {
  text: string;
  language?: string;
  duration?: number;
  confidence?: number;
}
```

**Provider Support**:
- OpenAI: Whisper API
- Google: Speech-to-Text API
- Anthropic: ❌ Not supported

### `/api/audio/generate` (POST)
**Purpose**: Convert text to speech  
**Status**: 🔨 To be implemented

```typescript
interface TTSRequest {
  text: string;
  provider: 'openai' | 'google';
  voice?: string;
  speed?: number; // 0.25 to 4.0
  language?: string;
  format?: 'mp3' | 'wav' | 'opus';
}

interface TTSResponse {
  audio: string; // base64 encoded
  duration: number;
  format: string;
}
```

**Voice Options**:
- OpenAI: `alloy`, `echo`, `fable`, `onyx`, `nova`, `shimmer`
- Google: 200+ voices across 40+ languages

### `/api/image/generate` (POST)
**Purpose**: Generate images from text  
**Status**: 🔨 To be implemented

```typescript
interface ImageGenerateRequest {
  prompt: string;
  provider: 'openai' | 'google';
  size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  n?: number; // Number of images
}

interface ImageGenerateResponse {
  images: Array<{
    url?: string;
    base64?: string;
    revisedPrompt?: string;
  }>;
}
```

**Provider Support**:
- OpenAI: DALL-E 3
- Google: Gemini 2.0 (early access)
- Anthropic: ❌ Not supported

### `/api/document` (POST)
**Purpose**: Process PDF and documents  
**Status**: 🔨 To be implemented

```typescript
interface DocumentRequest {
  document: string; // base64 encoded
  mimeType: 'application/pdf' | 'application/msword' | 'text/plain';
  query?: string;
  provider: 'anthropic' | 'google';
  extractTables?: boolean;
  extractImages?: boolean;
}

interface DocumentResponse {
  text: string;
  metadata?: {
    pageCount: number;
    wordCount: number;
    tables?: Array<any>;
    images?: Array<string>;
  };
  answer?: string; // If query provided
}
```

### `/api/live` (WebSocket)
**Purpose**: Real-time bidirectional communication  
**Status**: 🔨 To be implemented

```typescript
// Client → Server
interface LiveMessage {
  type: 'audio' | 'video' | 'text' | 'control';
  data: string | ArrayBuffer;
  timestamp: number;
}

// Server → Client
interface LiveResponse {
  type: 'audio' | 'text' | 'function' | 'error';
  data: any;
  timestamp: number;
}

// Session configuration
interface LiveConfig {
  provider: 'google'; // Only Gemini initially
  mode: 'voice' | 'video' | 'screen';
  tools?: Array<'search' | 'code' | 'function'>;
  language?: string;
}
```

**Features**:
- Real-time voice conversation
- Video feed analysis
- Screen sharing
- Function calling
- < 300ms latency

### `/api/multimodal` (POST)
**Purpose**: Unified endpoint for all modalities  
**Status**: 🔨 To be implemented

```typescript
interface MultiModalRequest {
  inputs: Array<{
    type: 'text' | 'image' | 'audio' | 'video' | 'document';
    data: string;
    mimeType?: string;
    metadata?: any;
  }>;
  outputs: Array<'text' | 'image' | 'audio'>;
  provider: 'openai' | 'anthropic' | 'google';
  model?: string;
  stream?: boolean;
}

interface MultiModalResponse {
  outputs: Array<{
    type: 'text' | 'image' | 'audio';
    data: string;
    metadata?: any;
  }>;
  usage: {
    inputTokens: number;
    outputTokens: number;
    inputMedia: { images: number; audio: number; video: number };
    outputMedia: { images: number; audio: number };
  };
}
```

## Implementation Priority

### Phase 1 (Week 1)
1. `/api/vision` - Image + text processing
2. `/api/image/generate` - Image generation

### Phase 2 (Week 2)
3. `/api/audio/transcribe` - Speech to text
4. `/api/audio/generate` - Text to speech

### Phase 3 (Week 3)
5. `/api/document` - Document processing
6. `/api/multimodal` - Unified endpoint

### Phase 4 (Week 4)
7. `/api/live` - Real-time interactions

## Authentication & Headers

All endpoints require:
```http
x-api-key: ${MULTIMODAL_API_KEY}
Content-Type: application/json
```

For file uploads:
```http
Content-Type: multipart/form-data
```

For WebSocket:
```http
Upgrade: websocket
Connection: Upgrade
```

## Rate Limits

| Endpoint | Requests/Min | Max File Size | Timeout |
|----------|-------------|---------------|---------|
| `/api/chat` | 60 | - | 30s |
| `/api/vision` | 30 | 20MB | 60s |
| `/api/audio/*` | 20 | 25MB | 120s |
| `/api/image/generate` | 10 | - | 60s |
| `/api/document` | 10 | 50MB | 180s |
| `/api/live` | 5 connections | - | - |

## Error Codes

| Code | Meaning | Example |
|------|---------|---------|
| 400 | Bad Request | Invalid image format |
| 401 | Unauthorized | Invalid API key |
| 413 | Payload Too Large | File > 20MB |
| 429 | Rate Limited | Too many requests |
| 500 | Server Error | Provider API down |
| 503 | Service Unavailable | Model overloaded |

## Cost Estimation

### Per 1000 Requests

| Endpoint | OpenAI | Anthropic | Google |
|----------|--------|-----------|--------|
| Text (1K tokens) | $0.015 | $0.008 | $0.0005 |
| Vision (1 image) | $0.425 | $0.48 | $0.002 |
| Audio transcribe (1 min) | $0.006 | - | $0.004 |
| Audio generate (1 min) | $0.24 | - | $0.016 |
| Image generate | $0.04-0.08 | - | TBD |

## Testing Endpoints

### Test Image Processing
```bash
curl -X POST https://multimodal-teal.vercel.app/api/vision \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{
      "role": "user",
      "content": [
        {"type": "text", "text": "What is this?"},
        {"type": "image", "data": "base64..."}
      ]
    }],
    "provider": "openai"
  }'
```

### Test Audio Transcription
```bash
curl -X POST https://multimodal-teal.vercel.app/api/audio/transcribe \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "audio": "base64...",
    "mimeType": "audio/wav",
    "provider": "openai"
  }'
```

## Monitoring & Analytics

Track per endpoint:
- Request count by provider
- Average response time
- Error rate
- Token/media usage
- Cost per request
- User satisfaction

## Security Considerations

1. **Input Validation**
   - File type verification
   - Size limits enforcement
   - Content moderation

2. **Data Handling**
   - No permanent storage of user content
   - Encryption in transit
   - Secure temporary files

3. **Access Control**
   - API key rotation
   - Rate limiting per key
   - IP allowlisting (optional)

## Next Steps

1. Implement `/api/vision` first
2. Add client-side image handling
3. Test with all three providers
4. Deploy and monitor
5. Iterate based on usage