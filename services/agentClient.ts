// Stubbed agent client for local development
// In production, call your server proxy (e.g., /api/agent/chat) which talks to OpenAI/Anthropic/Google.

export type ChatRequest = {
  model: string;
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  images?: string[]; // URLs
};

export type ChatStreamHandler = (chunk: string) => void;

export async function streamChat(req: ChatRequest, onChunk: ChatStreamHandler): Promise<string> {
  // Fake streaming response: echo back text with small delays
  const lastUser = [...req.messages].reverse().find((m) => m.role === 'user')?.content ?? '';
  const reply = `Echo from ${req.model}: ${lastUser}`;
  const parts = reply.split(' ');
  for (const p of parts) {
    onChunk(p + ' ');
    // small delay to simulate stream
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, 10));
  }
  return reply;
}

