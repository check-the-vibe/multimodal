// Agent client - uses AI SDK when enabled, falls back to mock
// In production, calls your server proxy (e.g., /api/agent/chat) which talks to OpenAI/Anthropic/Google.

import { AI_SDK_ENABLED, apiUrl } from './config';

export type ChatRequest = {
  model: string;
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  images?: string[]; // URLs
};

export type ChatStreamHandler = (chunk: string) => void;

export async function streamChat(req: ChatRequest, onChunk: ChatStreamHandler): Promise<string> {
  const { messages, model } = req;
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';

  // Use mock if AI SDK is disabled
  if (!AI_SDK_ENABLED) {
    // Fake streaming response: echo back text with small delays
    const reply = `Echo from ${model}: ${lastUser}`;
    const parts = reply.split(' ');
    for (const p of parts) {
      onChunk(p + ' ');
      // small delay to simulate stream
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 10));
    }
    return reply;
  }

  // Use real AI SDK streaming
  try {
    const url = apiUrl('/api/chat');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        provider: 'openai',
        model: model || 'gpt-4o-mini',
        stream: false, // Use non-streaming for now due to Express 5 issues
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    // Handle non-streaming response
    const data = await response.json();
    
    const fullMessage = data.message || data.text || '';
    
    // Simulate streaming by chunking the response
    const words = fullMessage.split(' ');
    for (const word of words) {
      onChunk(word + ' ');
      // Small delay to simulate streaming
      await new Promise(r => setTimeout(r, 50));
    }

    return fullMessage;
  } catch (error: any) {
    console.error('AI SDK streaming error:', error);
    // Fallback to mock on error
    const errorMessage = `Error: ${error.message}. Falling back to echo...`;
    onChunk(errorMessage);
    return errorMessage;
  }
}

