# Vercel Quickstart for AI SDK Integration

## Simplest Integration Path

The absolute simplest way to get started is to create a standalone Vercel project for your API endpoints, separate from your Expo app.

## Step 1: Create Vercel Project (5 minutes)

```bash
# Create a new directory for your API
mkdir multimodal-api
cd multimodal-api

# Initialize package.json
npm init -y

# Install minimal dependencies
npm install ai @ai-sdk/openai
npm install -D @vercel/node typescript @types/node
```

## Step 2: Create Your First API Endpoint

Create the folder structure:
```bash
mkdir -p api
```

Create `api/chat.ts`:
```typescript
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Enable CORS for your Expo app
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).setHeader('Access-Control-Allow-Origin', '*').end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { messages } = req.body;

    const result = await streamText({
      model: openai('gpt-4o-mini'), // Start with mini for testing
      messages,
    });

    // Set CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Return streaming response
    return result.toTextStreamResponse().pipeToWritableStream(
      new WritableStream({
        write(chunk) {
          res.write(chunk);
        },
        close() {
          res.end();
        },
      })
    );
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

## Step 3: Create vercel.json Configuration

Create `vercel.json`:
```json
{
  "functions": {
    "api/chat.ts": {
      "maxDuration": 30
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ]
}
```

## Step 4: Set Up Environment Variables

Create `.env.local` for local testing:
```bash
OPENAI_API_KEY=sk-...your-key-here...
```

## Step 5: Deploy to Vercel

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (it will ask you questions on first deploy)
vercel

# Answer the prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name? multimodal-api
# - Directory? ./
# - Override settings? N
```

## Step 6: Add Environment Variables in Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your `multimodal-api` project
3. Go to Settings → Environment Variables
4. Add: `OPENAI_API_KEY` with your actual key
5. Click Save

## Step 7: Test Your Endpoint

Your API is now live at: `https://multimodal-api.vercel.app/api/chat`

Test with curl:
```bash
curl -X POST https://multimodal-api.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

## Step 8: Update Your Expo App

In your Expo app, create `hooks/useAIChat.ts`:
```typescript
import { useState, useCallback } from 'react';

const API_URL = 'https://multimodal-api.vercel.app/api/chat';

export function useAIChat() {
  const [messages, setMessages] = useState<Array<{role: string; content: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage = { role: 'user', content };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        assistantMessage += chunk;
        
        // Update UI with streaming text
        setMessages([...updatedMessages, { role: 'assistant', content: assistantMessage }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  return {
    messages,
    sendMessage,
    isLoading,
  };
}
```

Update your `ChatPanel.tsx`:
```typescript
import { useAIChat } from '@/hooks/useAIChat';

export function ChatPanel() {
  const { messages, sendMessage, isLoading } = useAIChat();
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  return (
    <View>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <Text>{item.role}: {item.content}</Text>
        )}
      />
      <TextInput
        value={input}
        onChangeText={setInput}
        placeholder="Type a message..."
      />
      <Button title="Send" onPress={handleSend} disabled={isLoading} />
    </View>
  );
}
```

## Even Simpler: Test Locally First

Before deploying to Vercel, test locally:

```bash
# In your API directory
vercel dev

# This starts a local server at http://localhost:3000
# Update your Expo app to use: http://localhost:3000/api/chat
```

## Minimal Working Example - Complete Setup

Here's the absolute minimum you need:

### 1. Single File API (`api/test.ts`)
```typescript
export default async function handler(req: any, res: any) {
  res.status(200).json({ 
    message: "API is working!",
    received: req.body 
  });
}
```

### 2. Deploy
```bash
vercel --prod
```

### 3. Test from Expo
```typescript
fetch('https://your-app.vercel.app/api/test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ test: 'data' })
})
.then(r => r.json())
.then(console.log);
```

## Total Time to First Working Integration

1. **5 minutes**: Create Vercel project and deploy test endpoint
2. **2 minutes**: Add OpenAI key in Vercel dashboard
3. **5 minutes**: Update Expo app to call the API
4. **Total: ~12 minutes** to see AI responses in your app

## Next Steps After Basic Setup

1. Add more endpoints (`/api/transcribe`, `/api/image`)
2. Implement proper error handling
3. Add authentication (Vercel has built-in auth support)
4. Set up monitoring with Vercel Analytics
5. Implement rate limiting with Vercel Edge Middleware

## Common Issues & Solutions

### CORS Errors
Add these headers to every response:
```typescript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
```

### Streaming Not Working
Make sure you're using the AI SDK's streaming helpers:
```typescript
return result.toTextStreamResponse();
```

### Environment Variables Not Loading
- In development: Create `.env.local`
- In production: Add via Vercel Dashboard
- Restart/redeploy after adding variables

### Function Timeout
Increase timeout in `vercel.json`:
```json
{
  "functions": {
    "api/chat.ts": {
      "maxDuration": 60
    }
  }
}
```

## Cost Considerations

- **Vercel Free Tier**: 
  - 100GB bandwidth/month
  - 100,000 function invocations/month
  - 100 hours compute time/month
  - Perfect for development and testing

- **OpenAI Costs**:
  - GPT-4o-mini: ~$0.15 per 1M input tokens
  - GPT-4o: ~$2.50 per 1M input tokens
  - Start with mini for testing

## Security Note

For production:
1. Don't use `'*'` for CORS - specify your Expo app URL
2. Add authentication (JWT, API keys, etc.)
3. Implement rate limiting
4. Validate and sanitize all inputs
5. Monitor usage to prevent abuse