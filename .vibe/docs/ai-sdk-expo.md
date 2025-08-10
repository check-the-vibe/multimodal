# AI SDK in Expo - Complete Integration Guide

## Overview

The Vercel AI SDK now officially supports Expo applications (Expo SDK 52+), enabling AI-powered mobile apps with streaming responses, multimodal support, and server-side API key management. This guide covers the complete integration for our multimodal Expo app.

Related docs
- Modalities & capabilities matrix: `.vibe/docs/ai-sdk-modalities.md`

## Prerequisites

- Expo SDK 52+ (we have SDK 53 ✓)
- Node.js 18+
- Provider API keys (OpenAI, Anthropic, Google)
- Server/API route infrastructure for secure key management

## Installation

### Client-Side Packages (Expo App)
```bash
npm install ai @ai-sdk/react
```

### Server-Side Packages (API Routes)
```bash
npm install ai @ai-sdk/openai @ai-sdk/anthropic @ai-sdk/google zod
```

## Core Architecture

### AI SDK Core Concepts
The AI SDK provides two primary libraries:
1. **AI SDK Core**: Unified API for generating text, structured objects, tool calls, and building agents
2. **AI SDK UI**: Framework-agnostic hooks for building chat and generative interfaces

### Key Abstractions
- **Unified Provider System**: Standardizes integration across OpenAI, Anthropic, Google, and other providers
- **Streaming First**: Built for real-time text generation and multi-modal interactions
- **Type Safety**: Full TypeScript support with proper message typing
- **Multi-Modal Native**: Supports text, images, PDFs, and file attachments out of the box

### Security Principle
- **NEVER** embed API keys in the mobile app
- All AI provider calls must go through server-side API routes
- Client → Server Proxy → AI Provider → Stream back to Client

### Streaming Architecture
- Uses `expo/fetch` for streaming support (not native fetch)
- Requires custom transport configuration for React Native
- Supports real-time token streaming with proper chunk handling
- Enables backpressure control and partial message rendering

## Server Implementation

### API Route Structure (`/api/chat`)

```typescript
// app/api/chat+api.ts (Expo Router API Route)
// OR: pages/api/chat.ts (Next.js)
// OR: functions/api/chat.ts (Vercel Functions)

import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { streamText, generateText, convertToModelMessages, UIMessage, ModelMessage } from 'ai';

export async function POST(req: Request) {
  const { messages, provider = 'openai', model, stream = true }: {
    messages: UIMessage[];
    provider: 'openai' | 'anthropic' | 'google';
    model?: string;
    stream?: boolean;
  } = await req.json();

  // Select provider and model
  const providers = {
    openai: openai(model || 'gpt-4o'),
    anthropic: anthropic(model || 'claude-3-5-sonnet-20241022'),
    google: google(model || 'gemini-2.0-flash')
  };

  // Convert UI messages to model messages with proper multi-modal handling
  const modelMessages = convertToModelMessages(messages);

  // System prompt for consistent behavior
  const system = `You are a helpful AI assistant with multi-modal capabilities. 
    You can process text, images, and other file types. 
    Provide clear, concise, and helpful responses.`;

  if (stream) {
    // Streaming response for real-time chat
    const result = streamText({
      model: providers[provider],
      system,
      messages: modelMessages,
      temperature: 0.7,
      maxTokens: 2000,
    });

    // Return streaming response with proper headers for Expo
    return result.toUIMessageStreamResponse({
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'none',
        'Cache-Control': 'no-cache',
      },
    });
  } else {
    // Non-streaming response for simple text generation
    const { response } = await generateText({
      model: providers[provider],
      system,
      messages: modelMessages as ModelMessage[],
      temperature: 0.7,
      maxTokens: 2000,
    });

    return Response.json({ messages: response.messages });
  }
}
```

### Environment Variables (Server)
```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...
```

## Client Implementation (Expo)

### Chat Hook Setup

```typescript
// app/hooks/useAIChat.ts
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { fetch as expoFetch } from 'expo/fetch';

// Helper to generate correct API URL
function generateAPIUrl(path: string): string {
  if (__DEV__) {
    // Development: Use local server or tunnel URL
    return `http://localhost:3000${path}`;
  }
  // Production: Use your deployed API URL
  return `https://your-api.com${path}`;
}

export function useAIChat(provider: string = 'openai', model?: string) {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, append } = useChat({
    // Critical: Use Expo's fetch with custom transport
    transport: new DefaultChatTransport({
      fetch: expoFetch as unknown as typeof globalThis.fetch,
      api: generateAPIUrl('/api/chat'),
    }),
    // Pass provider and model in body
    body: {
      provider,
      model,
    },
    // Optional: Handle errors
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    append,
  };
}
```

### Component Implementation

```typescript
// components/modality/output/ChatPanel.tsx
import React from 'react';
import { View, TextInput, Button, FlatList, Text } from 'react-native';
import { useAIChat } from '@/hooks/useAIChat';

export function ChatPanel({ provider, model }: { provider: string; model: string }) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useAIChat(provider, model);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>{item.role}:</Text>
            <Text>{item.content}</Text>
          </View>
        )}
      />
      <View style={{ flexDirection: 'row', padding: 10 }}>
        <TextInput
          value={input}
          onChangeText={handleInputChange}
          placeholder="Type a message..."
          style={{ flex: 1, borderWidth: 1, padding: 10 }}
        />
        <Button
          title="Send"
          onPress={handleSubmit}
          disabled={isLoading}
        />
      </View>
    </View>
  );
}
```

## Multimodal Support

### Complete Multi-Modal Chat Implementation

```typescript
// components/MultiModalChat.tsx
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { fetch as expoFetch } from 'expo/fetch';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

// Helper to convert files to data URLs for multi-modal messages
async function convertFilesToDataURLs(files: Array<{ uri: string; type: string }>) {
  return Promise.all(
    files.map(async (file) => {
      if (file.uri.startsWith('file://')) {
        const base64 = await FileSystem.readAsStringAsync(file.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        return {
          type: 'file',
          mediaType: file.type,
          url: `data:${file.type};base64,${base64}`,
        };
      }
      return {
        type: 'file',
        mediaType: file.type,
        url: file.uri,
      };
    })
  );
}

export function MultiModalChat() {
  const [attachments, setAttachments] = useState<Array<{ uri: string; type: string }>>([]);
  
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    transport: new DefaultChatTransport({
      fetch: expoFetch as unknown as typeof globalThis.fetch,
      api: generateAPIUrl('/api/chat'),
    }),
    // Prepare multi-modal messages with attachments
    onSubmit: async ({ messages }) => {
      if (attachments.length > 0) {
        const fileAttachments = await convertFilesToDataURLs(attachments);
        const lastMessage = messages[messages.length - 1];
        
        // Add file attachments to the last user message
        if (lastMessage.role === 'user') {
          lastMessage.parts = [
            { type: 'text', text: lastMessage.content },
            ...fileAttachments,
          ];
        }
        
        // Clear attachments after sending
        setAttachments([]);
      }
      return messages;
    },
  });

  // Image picker for photos
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled) {
      setAttachments([...attachments, {
        uri: result.assets[0].uri,
        type: 'image/jpeg',
      }]);
    }
  };

  // Camera for taking photos
  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled) {
      setAttachments([...attachments, {
        uri: result.assets[0].uri,
        type: 'image/jpeg',
      }]);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Message display with multi-modal content */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>{item.role}:</Text>
            {item.parts ? (
              item.parts.map((part, index) => {
                if (part.type === 'text') {
                  return <Text key={index}>{part.text}</Text>;
                }
                if (part.type === 'file' && part.mediaType?.startsWith('image/')) {
                  return (
                    <Image
                      key={index}
                      source={{ uri: part.url }}
                      style={{ width: 200, height: 200 }}
                    />
                  );
                }
                return null;
              })
            ) : (
              <Text>{item.content}</Text>
            )}
          </View>
        )}
      />
      
      {/* Attachment preview */}
      {attachments.length > 0 && (
        <ScrollView horizontal style={{ height: 100 }}>
          {attachments.map((attachment, index) => (
            <Image
              key={index}
              source={{ uri: attachment.uri }}
              style={{ width: 80, height: 80, margin: 5 }}
            />
          ))}
        </ScrollView>
      )}
      
      {/* Input area with attachment options */}
      <View style={{ flexDirection: 'row', padding: 10 }}>
        <TouchableOpacity onPress={pickImage}>
          <Text>📷</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={takePhoto}>
          <Text>📸</Text>
        </TouchableOpacity>
        <TextInput
          value={input}
          onChangeText={handleInputChange}
          placeholder="Type a message..."
          style={{ flex: 1, borderWidth: 1, padding: 10 }}
        />
        <Button
          title="Send"
          onPress={handleSubmit}
          disabled={isLoading}
        />
      </View>
    </View>
  );
}
```

### Audio/Video Processing

```typescript
// For audio transcription (using OpenAI Whisper via server)
export async function transcribeAudio(audioUri: string) {
  const formData = new FormData();
  formData.append('audio', {
    uri: audioUri,
    type: 'audio/m4a',
    name: 'recording.m4a',
  } as any);

  const response = await expoFetch(generateAPIUrl('/api/transcribe'), {
    method: 'POST',
    body: formData,
  });

  return response.json();
}
```

## Advanced Features

### Tool Calling / Function Calling

```typescript
// Server-side tool definition
import { tool } from 'ai';
import { z } from 'zod';

const weatherTool = tool({
  description: 'Get the current weather',
  parameters: z.object({
    location: z.string(),
  }),
  execute: async ({ location }) => {
    // Fetch weather data
    return { temp: 72, condition: 'sunny' };
  },
});

// In streamText call
const result = streamText({
  model: openai('gpt-4o'),
  messages,
  tools: { weatherTool },
});
```

### Structured Output

```typescript
// Server-side structured generation
import { generateObject } from 'ai';
import { z } from 'zod';

const schema = z.object({
  title: z.string(),
  summary: z.string(),
  tags: z.array(z.string()),
});

const result = await generateObject({
  model: openai('gpt-4o'),
  schema,
  prompt: 'Analyze this text and extract key information',
});
```

## Message Formatting and Conversation Management

### Message Types and Structure

The AI SDK uses a consistent message format across all providers:

```typescript
// Types from AI SDK
import type { UIMessage, ModelMessage } from 'ai';

// UI Messages (client-side with parts for multi-modal)
interface UIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  parts?: Array<{
    type: 'text' | 'file';
    text?: string;
    mediaType?: string;
    url?: string;
  }>;
}

// Model Messages (server-side normalized format)
interface ModelMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | Array<{
    type: 'text' | 'image';
    text?: string;
    image?: { url: string };
  }>;
}
```

### Conversation History Management

```typescript
// hooks/useConversation.ts
import { useState, useCallback } from 'react';
import type { UIMessage } from 'ai';

export function useConversation() {
  const [conversations, setConversations] = useState<Map<string, UIMessage[]>>(new Map());
  const [activeConversationId, setActiveConversationId] = useState<string>('default');

  const getMessages = useCallback(() => {
    return conversations.get(activeConversationId) || [];
  }, [conversations, activeConversationId]);

  const addMessage = useCallback((message: UIMessage) => {
    setConversations(prev => {
      const updated = new Map(prev);
      const current = updated.get(activeConversationId) || [];
      updated.set(activeConversationId, [...current, message]);
      return updated;
    });
  }, [activeConversationId]);

  const clearConversation = useCallback(() => {
    setConversations(prev => {
      const updated = new Map(prev);
      updated.set(activeConversationId, []);
      return updated;
    });
  }, [activeConversationId]);

  const switchConversation = useCallback((id: string) => {
    setActiveConversationId(id);
    if (!conversations.has(id)) {
      setConversations(prev => {
        const updated = new Map(prev);
        updated.set(id, []);
        return updated;
      });
    }
  }, [conversations]);

  return {
    messages: getMessages(),
    addMessage,
    clearConversation,
    switchConversation,
    activeConversationId,
    conversationIds: Array.from(conversations.keys()),
  };
}
```

### Handling Different Input Modalities

```typescript
// services/modalityAdapter.ts
import type { UIMessage } from 'ai';

export class ModalityAdapter {
  // Convert text input to message
  static fromText(text: string): Partial<UIMessage> {
    return {
      role: 'user',
      content: text,
    };
  }

  // Convert audio recording to message (with transcription)
  static async fromAudio(audioUri: string): Promise<Partial<UIMessage>> {
    const transcription = await transcribeAudio(audioUri);
    return {
      role: 'user',
      content: transcription.text,
      parts: [
        { type: 'text', text: transcription.text },
        { type: 'file', mediaType: 'audio/m4a', url: audioUri },
      ],
    };
  }

  // Convert image to multi-modal message
  static async fromImage(imageUri: string, caption?: string): Promise<Partial<UIMessage>> {
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    return {
      role: 'user',
      content: caption || 'Please analyze this image',
      parts: [
        { type: 'text', text: caption || 'Please analyze this image' },
        { type: 'file', mediaType: 'image/jpeg', url: `data:image/jpeg;base64,${base64}` },
      ],
    };
  }

  // Convert video to multi-modal message (extract frames)
  static async fromVideo(videoUri: string, caption?: string): Promise<Partial<UIMessage>> {
    // Extract key frames from video
    const frames = await extractVideoFrames(videoUri, { count: 3 });
    
    const parts = [
      { type: 'text', text: caption || 'Please analyze this video' },
      ...frames.map(frame => ({
        type: 'file' as const,
        mediaType: 'image/jpeg',
        url: frame.dataUrl,
      })),
    ];

    return {
      role: 'user',
      content: caption || 'Please analyze this video',
      parts,
    };
  }
}
```

## Integration with Our App

### Step 1: Install Dependencies
```bash
# Client (Expo app)
npm install ai @ai-sdk/react

# Server (API routes - separate project or Expo API routes)
npm install ai @ai-sdk/openai @ai-sdk/anthropic @ai-sdk/google zod
```

### Step 2: Update Agent Service
Replace `services/agentClient.ts` with the new implementation using the AI SDK hooks and transport.

### Step 3: Connect Modalities
- Text Input → Chat messages
- Audio Input → Transcribe → Chat messages
- Photo Input → Multimodal messages with images
- Video Input → Extract frames → Multimodal messages

### Step 4: Stream to Outputs
- Chat Panel: Display streaming messages
- TTS Panel: Convert final text to speech
- Image Panel: Display generated images (DALL-E, Imagen)

## Testing

### Unit Tests
```typescript
// __tests__/aiChat.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useAIChat } from '@/hooks/useAIChat';

jest.mock('expo/fetch');

test('sends messages and receives streaming response', async () => {
  const { result } = renderHook(() => useAIChat());
  
  await act(async () => {
    result.current.append({ role: 'user', content: 'Hello' });
  });
  
  expect(result.current.messages).toHaveLength(2);
  expect(result.current.messages[1].role).toBe('assistant');
});
```

### Integration Tests
- Mock the server endpoints
- Test streaming response handling
- Verify multimodal message formatting
- Test error handling and retries

## Performance Optimization

### Streaming Optimization
- Use chunked transfer encoding
- Implement backpressure handling
- Buffer partial tokens for smoother display

### Caching
- Cache model responses when appropriate
- Use React Query or SWR for request deduplication
- Implement offline support with local storage

## Error Handling

```typescript
const { messages, error, reload } = useChat({
  onError: (error) => {
    if (error.message.includes('rate limit')) {
      // Handle rate limiting
      showNotification('Please wait before sending more messages');
    } else if (error.message.includes('network')) {
      // Handle network errors
      showNotification('Check your internet connection');
    }
  },
  // Auto-retry configuration
  retryOn: (error) => error.status >= 500,
  retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
});
```

## Security Best Practices

1. **API Key Management**
   - Store keys in secure environment variables
   - Never commit keys to version control
   - Use key rotation policies

2. **Input Validation**
   - Sanitize user inputs
   - Validate image URLs and sizes
   - Implement content moderation

3. **Rate Limiting**
   - Implement per-user rate limits
   - Use token bucket algorithm
   - Cache responses when possible

4. **Authentication**
   - Require user authentication for API access
   - Implement JWT or session-based auth
   - Track usage per user

## Deployment Considerations

### Expo Development
- Use `expo start --tunnel` for testing with physical devices
- Configure `eas.json` for production builds
- Set up environment-specific API URLs

### API Deployment Options
1. **Vercel Functions**: Serverless, auto-scaling
2. **AWS Lambda**: Custom domain, VPC support
3. **Expo API Routes**: Integrated with app (experimental)
4. **Express/Fastify**: Traditional Node.js server

## Migration Path from Current Implementation

1. Keep existing UI components unchanged
2. Replace mock `agentClient.ts` with AI SDK implementation
3. Add server API routes progressively
4. Test each modality integration separately
5. Deploy API routes before updating mobile app
6. Use feature flags for gradual rollout

## Resources

- [AI SDK Documentation](https://ai-sdk.dev/docs)
- [AI SDK Expo Guide](https://ai-sdk.dev/docs/getting-started/expo)
- [Provider Documentation](https://ai-sdk.dev/providers)
- [Streaming Protocols](https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol)
- [Example Projects](https://github.com/vercel/ai/tree/main/examples)

## Common Issues and Solutions

### Issue: Streaming not working
**Solution**: Ensure using `expo/fetch` and proper transport configuration

### Issue: CORS errors in development
**Solution**: Configure API server with proper CORS headers or use proxy

### Issue: Large images failing
**Solution**: Upload to cloud storage first, then pass URLs to API

### Issue: Memory leaks with streaming
**Solution**: Properly cleanup stream readers and abort controllers

## Implementation Roadmap for Our Multimodal App

### Phase 1: Foundation (Priority 1)
1. **Install AI SDK dependencies**
   ```bash
   npm install ai @ai-sdk/react
   ```

2. **Create API endpoint structure**
   - Set up `/api/chat` endpoint (can use local Express server initially)
   - Configure environment variables for API keys
   - Implement basic streaming response

3. **Replace mock agentClient.ts**
   - Implement `useChat` hook with Expo fetch transport
   - Connect to Chat Panel component
   - Test basic text streaming

### Phase 2: Multi-Modal Integration (Priority 2)
1. **Connect existing input modalities**
   - Text Input → Direct chat messages
   - Audio Input → Transcribe → Chat messages
   - Photo Input → Base64 encode → Multi-modal messages
   - Video Input → Frame extraction → Multi-modal messages

2. **Update Chat Panel for multi-modal display**
   - Render text parts
   - Display image attachments
   - Show audio playback controls
   - Handle video frame previews

3. **Implement modality adapter service**
   - Create `ModalityAdapter` class
   - Convert each input type to UIMessage format
   - Handle file conversions and uploads

### Phase 3: Provider Integration (Priority 3)
1. **Add provider selection to UI**
   - Update Agent selector to include OpenAI, Anthropic, Google
   - Pass provider selection to API calls
   - Update model selection per provider

2. **Implement provider-specific features**
   - OpenAI: GPT-4o vision, DALL-E integration
   - Anthropic: Claude 3.5 Sonnet with vision
   - Google: Gemini 2.0 Flash multimodal

3. **Add specialized endpoints**
   - `/api/transcribe` for audio → text
   - `/api/generate-image` for text → image
   - `/api/tts` for text → speech

### Phase 4: Advanced Features (Priority 4)
1. **Implement conversation management**
   - Add conversation history
   - Implement conversation switching
   - Add export/import functionality

2. **Add streaming optimizations**
   - Implement backpressure handling
   - Add token buffering for smooth display
   - Optimize for mobile network conditions

3. **Error handling and resilience**
   - Add retry logic for failed requests
   - Implement offline mode with queue
   - Add rate limiting and usage tracking

### Phase 5: Production Ready (Priority 5)
1. **Security hardening**
   - Implement user authentication
   - Add request validation and sanitization
   - Set up rate limiting per user

2. **Performance optimization**
   - Implement response caching
   - Add CDN for image uploads
   - Optimize bundle size

3. **Deployment**
   - Deploy API to Vercel/AWS Lambda
   - Configure production environment variables
   - Set up monitoring and logging

## Quick Start Implementation

For immediate testing, here's a minimal implementation:

```typescript
// 1. Create a simple API route (api/chat.ts)
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const result = streamText({
    model: openai('gpt-4o'),
    messages,
  });
  
  return result.toUIMessageStreamResponse();
}

// 2. Update ChatPanel.tsx
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { fetch as expoFetch } from 'expo/fetch';

export function ChatPanel() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    transport: new DefaultChatTransport({
      fetch: expoFetch as unknown as typeof globalThis.fetch,
      api: 'http://localhost:3000/api/chat', // Your API URL
    }),
  });
  
  // Your existing UI code with messages mapped
}

// 3. Run both Expo app and API server
// Terminal 1: npm start (Expo)
// Terminal 2: npm run server (API)
```

## Next Steps

1. Review this documentation with the team
2. Set up API infrastructure (start with local, move to cloud)
3. Begin Phase 1 implementation
4. Test with each modality incrementally
5. Iterate based on user feedback
6. Deploy progressively (feature flags recommended)
