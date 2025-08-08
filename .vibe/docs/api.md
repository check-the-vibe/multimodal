Title: Agent Proxy API (Stub + Target)

Overview
- The app does not call foundation model providers directly. A server-side proxy holds provider API keys and normalizes requests.
- Initial providers: OpenAI (default), Anthropic, Google (Gemini). Routing is controlled by the selected Agent + model.

Endpoint
- POST /api/agent/chat (SSE streaming or chunked HTTP)

Request Body (normalized)
{
  "provider": "openai" | "anthropic" | "google",
  "model": "gpt-5" | "gpt-4o" | "o4-mini" | "claude-3.7" | "gemini-2.0-flash" | string,
  "messages": [
    { "role": "system" | "user" | "assistant", "content": string }
  ],
  "images": ["https://..."], // optional; attach image URLs for multimodal
  "options": {
    "temperature"?: number,
    "stream"?: boolean
  }
}

Response (streaming)
- text/event-stream emitting tokens as they arrive, ending with a final JSON line:
event: token
data: "Hello"

event: token
data: " world"

event: done
data: { "final": "Hello world" }

Notes
- For image inputs use provider-specific multimodal inputs:
  - OpenAI Responses: `input: [{ role:'user', content:[{type:'text',text:'...'}, {type:'input_image', image_url:'...'}] }]`
  - Anthropic Messages: `content: [{type:'text',text:'...'}, {type:'image', source:{type:'base64',...}}]`
  - Google Gemini: parts `{text: '...'}, {inline_data|file_data}`
- For clipboard output, treat it as text output; the client can present a Copy action.
- For audio TTS, client uses on-device TTS (`expo-speech`) on the final text.

Stub Client
- `services/agentClient.ts` provides `streamChat(req, onChunk)` which simulates streaming by echoing the user message.
- Replace with a real `fetch('/api/agent/chat')` when the proxy is available.

