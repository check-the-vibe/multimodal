// Agent client - uses AI SDK when enabled, falls back to mock
// In production, calls your server proxy (e.g., /api/agent/chat) which talks to OpenAI/Anthropic/Google.

import { AI_SDK_ENABLED, apiUrl, MULTIMODAL_API_KEY } from './config';

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
    console.log('[agentClient] Starting request to:', url);
    console.log('[agentClient] Request details:', {
      messages: messages.length,
      model: model || 'gpt-4o-mini',
      lastMessage: messages[messages.length - 1]?.content?.substring(0, 50)
    });
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': MULTIMODAL_API_KEY,
      },
      body: JSON.stringify({
        messages,
        provider: 'openai',
        model: model || 'gpt-4o-mini',
        stream: false, // Use non-streaming for now due to Express 5 issues
      }),
    });

    console.log('[agentClient] Response status:', response.status);
    console.log('[agentClient] Response headers:', response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[agentClient] Error response body:', errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || 'Unknown error' };
      }
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    // Handle non-streaming response
    const data = await response.json();
    console.log('[agentClient] Response data:', {
      hasMessage: !!data.message,
      messageLength: data.message?.length,
      provider: data.provider,
      model: data.model
    });
    
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
    console.error('[agentClient] Network error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause,
      url: apiUrl('/api/chat')
    });
    
    // More detailed error message for debugging
    let errorDetails = `Network Error: ${error.message}`;
    if (error.message.includes('Network request failed')) {
      errorDetails += '\n\nPossible causes:\n';
      errorDetails += '- iOS device cannot reach ' + apiUrl('/api/chat') + '\n';
      errorDetails += '- Local server not running on port 3000\n';
      errorDetails += '- Firewall blocking connection\n';
      errorDetails += '- Wrong IP address configured\n';
    }
    
    // Fallback to mock on error
    const errorMessage = `${errorDetails}\n\nFalling back to echo mode...`;
    onChunk(errorMessage);
    return errorMessage;
  }
}

