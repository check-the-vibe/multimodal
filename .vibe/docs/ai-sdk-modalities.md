# Vercel AI SDK v5 — Modalities & Capabilities

This document catalogs the input and output modalities supported by the Vercel AI SDK (v5) and highlights OpenAI-specific capabilities. It is scoped to our Expo/React Native app architecture (client → server proxy → provider) and aligns with patterns used in `.vibe/docs/ai-sdk-expo.md`.

> Note: Provider features vary by model and account. Use the SDK as the orchestration layer; choose models that support the modalities you need. Always route provider calls through server-side API routes.

---

## Overview

- Unified APIs for multi-provider text, tools, images, audio, embeddings, and structured outputs.
- First-class streaming for incremental UI updates and tool events.
- Client hooks (`@ai-sdk/react`) with custom transport for Expo; server primitives (`ai`) for streaming and structured generation.
- Normalized messages and multi-part content for multimodal prompts.

Core server primitives we use:
- `streamText`, `generateText`
- `generateObject`, `streamObject`
- `embed`, `embedMany`
- `tool` (Zod-typed tool definitions)
- `convertToModelMessages`, `toUIMessageStreamResponse`

---

## Input Modalities (Supported by AI SDK)

The SDK accepts multi-part, multimodal user messages and system context. On the client, use `@ai-sdk/react` message types; on the server, normalize via `convertToModelMessages`.

### 1) Text
- Description: Plain text prompts and chat messages.
- How (client): Append a `user` message with `content` or `parts: [{ type: 'text', text }]`.
- How (server): Pass via `messages` and optional `system` string to `streamText`/`generateText`.
- Model requirements: All text-capable chat models.

Example (server):
```ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = streamText({
  model: openai('gpt-4o-mini'),
  system: 'You are concise and helpful.',
  messages: [
    { role: 'user', content: 'Explain diffusion models in 2 sentences.' },
  ],
});
```

### 2) Images (vision input)
- Description: User-provided images referenced by URL or data URL for visual reasoning.
- How (client): Include `parts: [{ type: 'file', mediaType: 'image/jpeg', url: 'data:...base64' }]` or remote URL.
- How (server): `convertToModelMessages(messages)` normalizes to provider formats for vision models.
- Model requirements: Vision-capable models (e.g., OpenAI GPT‑4o / GPT‑4o‑mini Vision).

Example (client composition):
```ts
// Add a user message with text + image part
append({
  role: 'user',
  content: 'What is in this picture?',
  parts: [
    { type: 'text', text: 'What is in this picture?' },
    { type: 'file', mediaType: 'image/jpeg', url: 'data:image/jpeg;base64,<...>' },
  ],
});
```

### 3) Files / Documents
- Description: Arbitrary files (PDF, txt, csv, images, audio) passed as attachments for model context or for downstream tools (RAG, parsing).
- How (client): Add `parts: [{ type: 'file', mediaType, url }]` to the last `user` message.
- How (server): Decide routing — either feed directly to a model that accepts file inputs or use tools/pipelines (e.g., parse → summarize). Many LLMs require that files be converted to text or images before inclusion.
- Model requirements: Vary by provider; vision models accept images; most text models require extracted text.

### 4) Audio (as input)
- Description: Recorded audio for transcription or audio-aware models.
- How (client): Capture audio and attach as `file` part; or transcribe first (server) and send text + original file as context.
- How (server): For transcription, call a provider STT model (e.g., Whisper). For audio-in models, pass audio via provider-supported fields.
- Model requirements: STT models (e.g., Whisper) or multimodal models that accept audio input.

### 5) Tools (function-calling inputs)
- Description: Parameterized tool invocations surfaced by the model; SDK validates inputs and executes your functions.
- How (server): Define tools with Zod schemas using `tool` and include in `streamText`.
- How (client): No special handling beyond displaying intermediate tool events; SDK streams tool call state back to the UI.

Example (server tools):
```ts
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';

const search = tool({
  description: 'Search the knowledge base',
  parameters: z.object({ query: z.string().min(1) }),
  execute: async ({ query }) => {
    // Implement search and return structured result
    return { results: [{ title: 'Doc', url: 'https://...' }] };
  },
});

const result = streamText({
  model: openai('gpt-4o'),
  messages,
  tools: { search },
});
```

### 6) System Prompts & Context
- Description: Global instructions for behavior and style.
- How (server): Pass a `system` string to `streamText`/`generateText` or include a `{ role: 'system', content }` message.
- Behavior: Applied across the entire conversation.

---

## Output Modalities (Supported by AI SDK)

### 1) Streaming Text
- Description: Token-by-token or chunked assistant text.
- How: Use `streamText` and return `result.toUIMessageStreamResponse()` to the client.
- Client: `useChat` renders streaming messages; Expo needs a custom transport (`expo/fetch`).

Example (server):
```ts
const result = streamText({ model, messages, system });
return result.toUIMessageStreamResponse();
```

### 2) Tool Call Events
- Description: Models request tool execution; SDK streams requests, your function executes, results are fed back and the model continues.
- How: Provide `tools` in `streamText`. Consume streamed updates client-side to show tool progress.

### 3) Image Generation
- Description: Produce images from prompts using provider image models.
- How: Trigger image generation on the server using provider-native image APIs or AI SDK image helpers where available, then return URLs/base64 to the client.
- OpenAI: Use the Images API (e.g., DALL·E / `gpt-image-1`) and return one or more images.

Sketch (server):
```ts
// Example approach: call provider image API, then send image URLs
// Return { images: string[] } alongside or after a text response.
```

### 4) Audio / Speech (TTS)
- Description: Convert assistant text into speech.
- How: After generating text, call a provider TTS model/server action; stream/play on client (e.g., `expo-speech`).
- OpenAI: TTS-capable models synthesize audio from text; return audio bytes/URL.

### 5) Embeddings
- Description: Vector embeddings for search/RAG.
- How: Use `embed`/`embedMany` with an embedding model and text inputs.

Example:
```ts
import { embed } from 'ai';
import { openai } from '@ai-sdk/openai';

const { embedding } = await embed({
  model: openai.embedding('text-embedding-3-small'),
  value: 'searchable text',
});
```

### 6) Structured JSON / Objects
- Description: Strictly-typed JSON using schemas; optionally streamed.
- How: `generateObject` for single-shot; `streamObject` for streaming structured fields.

Example:
```ts
import { generateObject } from 'ai';
import { z } from 'zod';

const schema = z.object({ title: z.string(), tags: z.array(z.string()) });
const { object } = await generateObject({ model, schema, prompt: 'Summarize...' });
```

---

## OpenAI-Specific Capabilities (via AI SDK)

The AI SDK integrates with OpenAI through `@ai-sdk/openai`. Choose the appropriate OpenAI model to unlock each modality.

- GPT‑4o / GPT‑4o‑mini (Vision):
  - Inputs: Text, Images (URLs/data URLs); some variants accept audio-in.
  - Outputs: Text (streaming), Tool calls, Structured JSON.
- Image Generation (DALL·E / `gpt-image-1`):
  - Output: Images (PNG/JPEG/WebP depending on parameters).
  - Use: OpenAI Images API on the server; return URLs/base64.
- Whisper (Speech‑to‑Text):
  - Input: Audio files (m4a/mp3/wav/etc.).
  - Output: Transcribed text; return as part of a chat flow.
- Text‑to‑Speech:
  - Input: Assistant text.
  - Output: Audio (mp3/wav/opus based on model/options). Use TTS models; play with `expo-speech` or custom audio playback.
- Embeddings (`text-embedding-3-*`):
  - Input: Text.
  - Output: Vectors for search/RAG via `embed`/`embedMany`.
- Structured Output (JSON mode):
  - Use `generateObject`/`streamObject` with Zod schemas for type‑safe objects.

Notes
- Realtime (audio in/out) exists in the OpenAI platform; our current stack uses HTTP streaming and client-side TTS.
- Model names and availability change; confirm current names and limits in OpenAI docs.

---

## Provider Comparisons (OpenAI, Anthropic, Google)

High-level support overview. Always verify current model names and limits. Where a modality is not natively provided, you can compose pipelines (e.g., STT → chat → TTS).

OpenAI (`@ai-sdk/openai`)
- Text: ✓ Streaming via `streamText`
- Vision input: ✓ with GPT‑4o / 4o‑mini (image parts)
- Tools: ✓ Tool use supported
- Structured JSON: ✓ via `generateObject` / `streamObject`
- Image generation: ✓ via Images API (e.g., `gpt-image-1`)
- STT: ✓ Whisper (server-side API)
- TTS: ✓ TTS models (server-side), or client playback via `expo-speech`
- Embeddings: ✓ `text-embedding-3-*`

Anthropic (`@ai-sdk/anthropic`)
- Text: ✓ Streaming via `streamText`
- Vision input: ✓ Claude 3.x/3.5 accept image input
- Tools: ✓ Tool use supported (function/tool use in Messages API)
- Structured JSON: ✓ with SDK `generateObject` (schema enforced by SDK)
- Image generation: – Use third-party models; not provided by Anthropic
- STT/TTS: – Use external services (e.g., Whisper or cloud TTS)
- Embeddings: ~ Use external embeddings if needed; check provider roadmap

Google (`@ai-sdk/google`)
- Text: ✓ Streaming via `streamText`
- Vision input: ✓ Gemini 1.5/2.0 accept image input
- Tools: ✓ Function/tool use supported
- Structured JSON: ✓ with SDK `generateObject`
- Image generation: ~ Use Google image models/APIs (e.g., Imagen) server-side
- STT/TTS: ~ Use Google Cloud Speech/TTS APIs (server-side), not via AI SDK core
- Embeddings: ~ Use Google embedding models/APIs server-side if needed

Notes
- “~” indicates you can integrate via provider-native APIs or compose with SDK flows, but not necessarily through the same `streamText` call.
- For non-text modalities (image gen, STT, TTS, embeddings), prefer server-side calls and return URLs or typed payloads to the client.

---

## Cross-Provider Examples

Below are minimal server-side patterns for each provider using the AI SDK. Each example expects a JSON body with `{ messages }` (UI messages) unless noted.

OpenAI — streaming chat (text/vision)
```ts
import { streamText, convertToModelMessages } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { messages, model = 'gpt-4o-mini' } = await req.json();
  const normalized = convertToModelMessages(messages);
  const result = streamText({ model: openai(model), messages: normalized });
  return result.toUIMessageStreamResponse();
}
```

OpenAI — structured JSON
```ts
import { generateObject } from 'ai';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';

const schema = z.object({ title: z.string(), points: z.array(z.string()) });

export async function POST(req: Request) {
  const { prompt } = await req.json();
  const { object } = await generateObject({ model: openai('gpt-4o-mini'), schema, prompt });
  return Response.json(object);
}
```

Anthropic — streaming chat (text/vision)
```ts
import { streamText, convertToModelMessages } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

export async function POST(req: Request) {
  const { messages, model = 'claude-3-5-sonnet-20241022' } = await req.json();
  const normalized = convertToModelMessages(messages);
  const result = streamText({ model: anthropic(model), messages: normalized });
  return result.toUIMessageStreamResponse();
}
```

Anthropic — structured JSON
```ts
import { generateObject } from 'ai';
import { z } from 'zod';
import { anthropic } from '@ai-sdk/anthropic';

const schema = z.object({ summary: z.string(), tags: z.array(z.string()) });

export async function POST(req: Request) {
  const { prompt } = await req.json();
  const { object } = await generateObject({ model: anthropic('claude-3-5-sonnet-20241022'), schema, prompt });
  return Response.json(object);
}
```

Google — streaming chat (text/vision)
```ts
import { streamText, convertToModelMessages } from 'ai';
import { google } from '@ai-sdk/google';

export async function POST(req: Request) {
  const { messages, model = 'gemini-2.0-flash' } = await req.json();
  const normalized = convertToModelMessages(messages);
  const result = streamText({ model: google(model), messages: normalized });
  return result.toUIMessageStreamResponse();
}
```

Google — structured JSON
```ts
import { generateObject } from 'ai';
import { z } from 'zod';
import { google } from '@ai-sdk/google';

const schema = z.object({ title: z.string(), bullets: z.array(z.string()) });

export async function POST(req: Request) {
  const { prompt } = await req.json();
  const { object } = await generateObject({ model: google('gemini-2.0-flash'), schema, prompt });
  return Response.json(object);
}
```

Tools — shared pattern across providers
```ts
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai'; // swap with anthropic(...) or google(...)

const lookup = tool({
  description: 'Lookup a record by ID',
  parameters: z.object({ id: z.string() }),
  execute: async ({ id }) => ({ id, status: 'ok' }),
});

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = streamText({ model: openai('gpt-4o-mini'), messages, tools: { lookup } });
  return result.toUIMessageStreamResponse();
}
```

Embeddings — OpenAI example
```ts
import { embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { values } = await req.json();
  const { embeddings } = await embedMany({ model: openai.embedding('text-embedding-3-small'), values });
  return Response.json({ embeddings });
}
```

---

## Modality Compatibility Matrix

Legend
- ✓: Supported
- ~: Partial/conditional
- –: Not supported

### A) Inputs → Models (OpenAI focus)

| Model (OpenAI)           | Text In | Image In | Audio In | Files/Docs In | Tools | System |
|--------------------------|:-------:|:--------:|:--------:|:-------------:|:-----:|:------:|
| GPT‑4o                   |   ✓     |    ✓     |    ~     |       ~       |  ✓    |   ✓    |
| GPT‑4o‑mini              |   ✓     |    ✓     |    ~     |       ~       |  ✓    |   ✓    |
| GPT‑4‑turbo (text)       |   ✓     |    –     |    –     |       ~       |  ✓    |   ✓    |
| gpt‑image‑1 (image gen)  |   ✓     |    –     |    –     |       –       |  –    |   ✓    |
| Whisper (STT)            |   –     |    –     |    ✓     |       –       |  –    |   ✓    |
| text‑embedding‑3‑*       |   ✓     |    –     |    –     |       –       |  –    |   ✓    |

Notes
- “Files/Docs In” often require pre-processing (e.g., extract text or images) before inclusion in prompts.
- “Audio In” for GPT‑4o variants depends on the specific preview/real‑time models; HTTP workflows typically transcribe first via Whisper.

### B) Outputs → Models (OpenAI focus)

| Model (OpenAI)           | Text Stream | Tool Calls | Image Out | Audio/TTS Out | Embeddings | JSON/Object |
|--------------------------|:-----------:|:----------:|:---------:|:-------------:|:----------:|:-----------:|
| GPT‑4o                   |     ✓       |     ✓      |     –     |       ~       |     –      |      ✓      |
| GPT‑4o‑mini              |     ✓       |     ✓      |     –     |       ~       |     –      |      ✓      |
| GPT‑4‑turbo (text)       |     ✓       |     ✓      |     –     |       –       |     –      |      ✓      |
| gpt‑image‑1 (image gen)  |     –       |     –      |     ✓      |       –       |     –      |      –      |
| Whisper (STT)            |     –       |     –      |     –      |       –       |     –      |      –      |
| text‑embedding‑3‑*       |     –       |     –      |     –      |       –       |     ✓      |      –      |

Notes
- “Audio/TTS Out” can be achieved by pairing a text model with a TTS model (two-step pipeline), or by using TTS-capable models where available.
- JSON/Object refers to structured outputs enforced by SDK schemas (`generateObject`/`streamObject`).

### C) Inputs → Outputs (SDK routing patterns)

| Input                    | Text Out (stream) | Image Out | Audio/TTS Out | JSON/Object | Tool Calls |
|-------------------------|:-----------------:|:---------:|:-------------:|:-----------:|:----------:|
| Text                    |        ✓          |     ✓*    |      ✓*       |     ✓       |     ✓      |
| Image                   |        ✓          |     –     |      ✓*       |     ✓       |     ✓      |
| Audio (recording)       |        ✓*         |     –     |      ✓*       |     ✓       |     ✓      |
| Files/Docs              |        ✓          |     –     |      ✓*       |     ✓       |     ✓      |
| Tool Parameters         |        ✓          |     ✓*    |      ✓*       |     ✓       |     ✓      |
| System Prompt           |        ✓          |     –     |      –        |     ✓       |     ✓      |

“*” indicates a multi-step pipeline (e.g., transcribe → text; text → TTS; text → image gen tool).

---

## Practical Patterns

- Vision QA: Text + image parts → GPT‑4o → stream text; optionally follow-up with image generation tool if requested.
- Audio Notes: Record audio → Whisper (server) → produce text → stream to chat → optional TTS playback.
- RAG: Files uploaded → server parse/index → tools for retrieval → stream reasoning with citations → JSON summary via `generateObject`.
- UI: Keep messages minimal; attach large binaries as data URLs or temporary URLs; avoid embedding raw secrets anywhere client-side.

---

## Constraints & Limits (Guidance)

- Token/context limits depend on the chosen model; keep prompts concise.
- Attachment sizes: respect provider upload limits; compress images client-side where possible.
- Rate limits: provider/account-specific; implement retries/backoff on the server.
- Privacy: never send PII without explicit consent; scrub metadata from uploaded files when appropriate.

---

## Minimal End-to-End Examples

### Stream chat (text only)
```ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = streamText({ model: openai('gpt-4o-mini'), messages });
  return result.toUIMessageStreamResponse();
}
```

### Multimodal chat (text + image)
```ts
import { streamText, convertToModelMessages } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const normalized = convertToModelMessages(messages);
  const result = streamText({ model: openai('gpt-4o'), messages: normalized });
  return result.toUIMessageStreamResponse();
}
```

### Structured output (JSON)
```ts
import { generateObject } from 'ai';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';

const schema = z.object({ title: z.string(), bullets: z.array(z.string()) });

export async function POST(req: Request) {
  const { prompt } = await req.json();
  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema,
    prompt,
  });
  return Response.json(object);
}
```

### Embeddings
```ts
import { embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';

const inputs = ['The quick brown fox', 'jumps over the lazy dog'];
const { embeddings } = await embedMany({
  model: openai.embedding('text-embedding-3-small'),
  values: inputs,
});
```

---

## What This Enables For Our App

- Input: text, photo, audio, file attachments, tool triggers, and system directives.
- Output: streaming chat, tool workflows, optional image gen, TTS playback, embeddings for search, and strict JSON for data views.
- Compatibility: Choose OpenAI models per card — GPT‑4o for vision Q&A, `gpt-image-1` for image generation, Whisper for STT, `text-embedding-3-*` for search.

Cross‑links
- See `.vibe/docs/ai-sdk-expo.md` for Expo wiring and transports.
- See `.vibe/docs/types-and-routing.md` for app routing and card mapping.
