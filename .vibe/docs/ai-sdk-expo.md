Title: AI SDK in Expo (Client/Server Integration Plan)

https://ai-sdk.dev/docs/getting-started/expo

Important
- Network access is disabled in this environment, so this document reflects best‑practice integration patterns for the AI SDK in an Expo app without copying from the live docs. It is tailored to our app architecture and can be adjusted once we import exact snippets from the official guide.

Overview
- Goal: Use the AI SDK (aka Vercel AI SDK) with Expo for chat streaming and multimodal support via a server proxy. Never embed provider API keys in the mobile app.
- Providers: OpenAI (default), Anthropic, Google (Gemini). We will start with OpenAI GPT‑5 (placeholder), then add others.
- Flow: Expo client → our proxy (/api/agent/chat) → provider (OpenAI/Anthropic/Google). Stream partial tokens to the client UI.

Packages (server side)
- ai: core SDK with helpers like `streamText`, `generateText`, tool calling, structured outputs.
- @ai-sdk/openai, @ai-sdk/anthropic, @ai-sdk/google: provider adapters.
- Optional: zod for structured output; eventsource polyfills for server/testing.

Client Considerations (Expo)
- Do not call providers directly; keep secrets server-side.
- Use `fetch` to call our server endpoint; consume a ReadableStream for streaming output.
- RN 0.79/Expo SDK 53 supports `fetch` streams; handle chunks and append to chat.
- For image inputs, upload asset to storage (presigned URL) or send small base64 if unavoidable.
- For clipboard output, treat as plain text; use platform clipboard APIs if needed later (e.g., expo-clipboard).

Server Endpoint Shape (/api/agent/chat)
- Method: POST
- Body (normalized):
  {
    provider: 'openai' | 'anthropic' | 'google',
    model: string,            // e.g., 'gpt-5', 'gpt-4o', 'o4-mini', 'claude-3.7', 'gemini-2.0-flash'
    messages: [               // minimal chat schema
      { role: 'system' | 'user' | 'assistant', content: string }
    ],
    images?: string[],        // URLs (preferred) or small base64 data URLs
    options?: { temperature?: number, stream?: boolean }
  }
- Response: text/event-stream (SSE) for streaming tokens (or chunked HTTP); ends with a JSON `done` event containing the final text.

OpenAI Example (Node/Edge)
// npm i ai @ai-sdk/openai
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

export async function POST(req) {
  const { model = 'gpt-5', messages = [], images = [], options = {} } = await req.json();

  // Map our minimal schema → AI SDK multimodal input
  const userParts = [];
  const lastUser = messages.filter(m => m.role === 'user').map(m => m.content).join('\n');
  if (lastUser) userParts.push({ type: 'text', text: lastUser });
  for (const url of images || []) userParts.push({ type: 'image', image: { url } });

  const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const result = await streamText({
    model: openai(model),
    input: [
      { role: 'system', content: [{ type: 'text', text: 'You are a helpful assistant.' }] },
      { role: 'user', content: userParts.length ? userParts : [{ type: 'text', text: 'Hello' }] }
    ],
    temperature: options.temperature,
  });

  // For Vercel/Edge runtimes (SSE response helper)
  return result.toDataStreamResponse();
}

Anthropic Example (server)
// npm i ai @ai-sdk/anthropic
import { streamText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';

const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
// Use `anthropic(model)` in place of `openai(model)`

Google (Gemini) Example (server)
// npm i ai @ai-sdk/google
import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_API_KEY });
// Use `google(model)` in place of `openai(model)`

Client Usage (Expo)
// Replace our stub with real endpoint call
async function streamFromProxy(payload, onToken) {
  const res = await fetch(`${BASE_URL}/api/agent/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, options: { stream: true } }),
  });
  if (!res.body) throw new Error('No response body');
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    // Parse SSE lines or plain chunks; call onToken with token fragments
    onToken(chunk);
  }
}

Structured Output (optional)
- Use `generateText` with `schema` (zod) on the server to extract structured JSON. Return JSON at the end of the stream with `event: done`.

Tool Calling / Functions (optional)
- The AI SDK can call tools declared in the server; route tool calls to business logic (search, DB). Not planned for v1.

Images and Multimodal
- Prefer URLs for images. For large assets: upload to storage and pass URLs.
- OpenAI multimodal inputs use image parts; Anthropic/Gemini similar with provider-specific parts.

Security
- Keep provider keys in server env vars.
- Validate and sanitize incoming `messages` and asset URLs.
- Add rate limiting and auth gates as needed.

Our App Wiring Plan
1) Keep `services/agentClient.ts` for local stub; later replace with `streamFromProxy` above.
2) Expose `/api/agent/chat` in the backend (Edge/Node). Start with OpenAI via AI SDK `streamText`.
3) Map Inputs/Agent selection to body payload (model, provider, messages, images[]).
4) Stream response tokens to the chat panel; expose final text for Clipboard output.
5) Extend to Anthropic/Google by switching `provider` and `model` on the server; keep client payload the same.

Expo Specific Notes
- Avoid Node APIs on the client; stick to `fetch` and streams.
- For native clipboard: consider `expo-clipboard` later (not installed yet).
- For file uploads: use `expo-file-system` or provider-specific upload endpoints before invoking the model.

Testing
- Unit test the server handler by passing mock payloads and verifying SSE framing.
- On client, mock `fetch` and test stream assembly into the chat UI.

