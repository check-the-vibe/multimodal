# Multimodal API

This is the API server for the Multimodal Expo app, providing AI chat functionality using the Vercel AI SDK.

## Production URL

https://multimodal-teal.vercel.app/

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file with your API keys:
```
OPENAI_API_KEY=your-openai-api-key
# Optional for other providers:
# ANTHROPIC_API_KEY=your-anthropic-api-key
# GOOGLE_GENERATIVE_AI_API_KEY=your-google-api-key
```

3. Run the server:
```bash
node server.js
```

The server will run on http://localhost:3000

## Deployment to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel --prod
```

3. Set environment variables in Vercel dashboard:
   - Go to your project settings
   - Add `OPENAI_API_KEY` in Environment Variables section

## API Endpoints

- `GET /` - Health check
- `GET /api/test` - Test endpoint
- `POST /api/chat` - AI chat endpoint

### Chat Endpoint

POST `/api/chat`

Request body:
```json
{
  "messages": [
    {"role": "user", "content": "Hello"}
  ],
  "provider": "openai",
  "model": "gpt-4o-mini",
  "stream": false
}
```

Response:
```json
{
  "message": "AI response text",
  "provider": "openai",
  "model": "gpt-4o-mini"
}
```

## Tech Stack

- Express.js server
- Vercel AI SDK v5
- OpenAI, Anthropic, and Google AI providers
- CORS enabled for cross-origin requests