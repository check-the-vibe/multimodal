# 🤖 AI SDK Integration Guide

## ✅ Current Status

The AI SDK integration is **READY TO TEST**! 

- ✅ Vercel API deployed at: `https://multimodal-artiwtotz-nealrileys-projects.vercel.app`
- ✅ AI SDK packages installed in main app
- ✅ Configuration and hooks created
- ✅ Streaming chat integration complete
- ⚠️ Vercel authentication may be blocking public access

## 🚀 Quick Test

### Option 1: Test Locally (Recommended)

1. **Start the Vercel API locally:**
   ```bash
   cd multimodal-api
   vercel dev
   # This starts at http://localhost:3000
   ```

2. **Update config for local testing:**
   ```typescript
   // services/config.ts
   export const AI_SDK_ENABLED = true;  // Enable AI
   export const API_BASE_URL = 'http://localhost:3000';  // Use local API
   ```

3. **Run the Expo app:**
   ```bash
   npm start
   # Press 'w' for web, or use your device
   ```

4. **Test the chat:**
   - Type a message in the text input
   - Select "Chat" as output
   - Press Send
   - You should see AI responses streaming!

### Option 2: Use Production Vercel API

1. **Check Vercel Authentication:**
   - Go to https://vercel.com/dashboard
   - Select your `multimodal-api` project
   - Go to Settings → Security
   - Disable "Vercel Authentication" for public access
   - OR add your domain to allowed origins

2. **Verify API Key:**
   - In Vercel Dashboard → Settings → Environment Variables
   - Ensure `OPENAI_API_KEY` is set

3. **Test with curl:**
   ```bash
   curl -X POST https://multimodal-artiwtotz-nealrileys-projects.vercel.app/api/chat \
     -H "Content-Type: application/json" \
     -d '{"messages": [{"role": "user", "content": "Hello!"}]}'
   ```

## 🔧 Configuration

### Feature Flag
```typescript
// services/config.ts
export const AI_SDK_ENABLED = true;  // true = use AI, false = use mock
```

### API URLs
- **Production:** `https://multimodal-artiwtotz-nealrileys-projects.vercel.app`
- **Local Dev:** `http://localhost:3000`

### Available Models
- OpenAI: `gpt-4o`, `gpt-4o-mini` (default)
- Anthropic: `claude-3-5-sonnet-20241022`
- Google: `gemini-2.0-flash-exp`

## 📁 Key Files

### Expo App
- `services/config.ts` - Configuration and feature flags
- `services/agentClient.ts` - Updated to use AI SDK
- `hooks/useAIChat.ts` - React hook for chat functionality

### Vercel API
- `multimodal-api/api/chat.ts` - Main chat endpoint
- `multimodal-api/.env.local` - API keys (local only)
- `multimodal-api/vercel.json` - Vercel configuration

## 🧪 Testing

### Run Test Script
```bash
node test-api.js
```

This will test:
1. Mock mode (AI_SDK_ENABLED = false)
2. Real API connection

### Manual Testing in App
1. Open the app
2. Type a message
3. Select Chat output
4. Press Send
5. Watch for streaming response

## 🐛 Troubleshooting

### "Authentication Required" Error
- Your Vercel deployment has authentication enabled
- Either disable it in Vercel Dashboard or test locally

### No Response / Network Error
- Check if API server is running (`vercel dev`)
- Verify API_BASE_URL in config
- Check console for errors

### "API key not configured" Error
- Add your OpenAI key to `.env.local` (local)
- Or add to Vercel Dashboard → Environment Variables (production)

### CORS Errors
- The API is configured for CORS
- If still getting errors, check browser console
- Try testing with Expo web first

## 📊 Monitoring

### Check Logs
- **Local:** Terminal running `vercel dev`
- **Production:** Vercel Dashboard → Functions → Logs

### API Usage
- Monitor OpenAI usage at: https://platform.openai.com/usage
- Start with `gpt-4o-mini` for cost-effective testing

## 🎯 Next Steps

1. **Test basic chat** - Get text streaming working
2. **Add multi-modal** - Images, audio transcription
3. **Provider selection** - Switch between OpenAI/Anthropic/Google
4. **Enhanced UI** - Better streaming display, typing indicators
5. **Error handling** - Retry logic, offline support

## 💡 Tips

- Use `gpt-4o-mini` for testing (cheaper)
- Test locally first before production
- Monitor API usage to control costs
- Keep API keys secure (never commit them)

## 🔗 Resources

- [Vercel Dashboard](https://vercel.com/dashboard)
- [OpenAI API Keys](https://platform.openai.com/api-keys)
- [AI SDK Docs](https://sdk.vercel.ai/docs)
- [Expo Documentation](https://docs.expo.dev)

---

**Ready to test?** Start with local development:
```bash
cd multimodal-api && vercel dev
# In another terminal:
npm start
```