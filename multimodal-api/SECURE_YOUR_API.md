# 🔒 API Security Setup

## IMPORTANT: Your API is now protected with authentication!

### API Key for Testing
```
mm_469eade2349b909e92b789cf1533dc3592f08480d9f6a0794ba09b94ac29669d
```

## Setup Instructions

### 1. Add to Vercel Environment Variables (REQUIRED!)

1. Go to https://vercel.com/dashboard
2. Select your `multimodal-teal` project
3. Go to **Settings** → **Environment Variables**
4. Add these TWO variables:
   - `OPENAI_API_KEY` = your OpenAI API key
   - `MULTIMODAL_API_KEY` = `mm_469eade2349b909e92b789cf1533dc3592f08480d9f6a0794ba09b94ac29669d`
5. Click **Save**
6. **Redeploy** for changes to take effect

### 2. For Production App (Optional - More Secure)

Instead of hardcoding the API key in the app, use an environment variable:

1. Create `.env.local` in your Expo project root:
```
EXPO_PUBLIC_MULTIMODAL_API_KEY=mm_469eade2349b909e92b789cf1533dc3592f08480d9f6a0794ba09b94ac29669d
```

2. The app will automatically use this instead of the hardcoded key

### 3. Generate a New API Key (Recommended)

To generate your own secure API key:
```bash
node -e "console.log('mm_' + require('crypto').randomBytes(32).toString('hex'))"
```

Then update:
1. Vercel environment variable `MULTIMODAL_API_KEY`
2. Your app's config or `.env.local`

## How It Works

- Every request to `/api/chat` must include the header: `x-api-key: YOUR_API_KEY`
- Without a valid key, requests get a 401 Unauthorized response
- The `/api/test` endpoint remains open for health checks

## Testing

Test that authentication is working:

```bash
# This should fail (no API key)
curl -X POST https://multimodal-teal.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello"}]}'

# This should work (with API key)
curl -X POST https://multimodal-teal.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -H "x-api-key: mm_469eade2349b909e92b789cf1533dc3592f08480d9f6a0794ba09b94ac29669d" \
  -d '{"messages": [{"role": "user", "content": "Hello"}]}'
```

## Security Notes

⚠️ **NEVER** commit API keys to git
⚠️ **ALWAYS** use environment variables in production
✅ Consider rotating keys periodically
✅ Monitor your OpenAI usage dashboard for unexpected activity