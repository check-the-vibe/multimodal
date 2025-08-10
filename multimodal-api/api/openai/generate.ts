import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

// Enable CORS for your Expo app
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // In production, replace with your specific app URL
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
};

interface GenerateRequest {
  prompt: string;
  size?: "1024x1024" | "1792x1024" | "1024x1792";
  quality?: "standard" | "hd";
  style?: "vivid" | "natural";
  n?: number; // number of images to generate (1-10)
}

interface GenerateResponse {
  images: Array<{
    url: string;
    revisedPrompt?: string;
  }>;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('[Generate API] Received request:', req.method);
  console.log('[Generate API] Request headers:', Object.keys(req.headers));
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('[Generate API] Handling CORS preflight');
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    console.log('[Generate API] Invalid method:', req.method);
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Check API key authentication
  const apiKey = req.headers['x-api-key'] as string;
  const validApiKey = process.env.MULTIMODAL_API_KEY;
  
  console.log('[Generate API] Auth check - API key provided:', !!apiKey);
  console.log('[Generate API] Auth check - Valid key configured:', !!validApiKey);
  
  if (!validApiKey) {
    console.error('[Generate API] MULTIMODAL_API_KEY not configured in environment');
    res.status(500).json({ error: 'API authentication not configured' });
    return;
  }
  
  if (!apiKey || apiKey !== validApiKey) {
    console.log('[Generate API] Invalid API key attempted');
    res.status(401).json({ error: 'Unauthorized - Invalid API key' });
    return;
  }
  
  console.log('[Generate API] Authentication successful');

  // Check OpenAI API key
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    console.error('[Generate API] OPENAI_API_KEY not configured in environment');
    res.status(500).json({ error: 'OpenAI API key not configured' });
    return;
  }
  
  console.log('[Generate API] OpenAI API key configured');

  try {
    const { 
      prompt, 
      size = "1024x1024",
      quality = "standard",
      style = "vivid",
      n = 1
    }: GenerateRequest = req.body;

    console.log('[Generate API] Processing request with parameters:');
    console.log('[Generate API] - Prompt:', prompt?.substring(0, 100) + (prompt?.length > 100 ? '...' : ''));
    console.log('[Generate API] - Prompt length:', prompt?.length, 'characters');
    console.log('[Generate API] - Size:', size);
    console.log('[Generate API] - Quality:', quality);
    console.log('[Generate API] - Style:', style);
    console.log('[Generate API] - Count (n):', n);

    // Validate required parameters
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      console.error('[Generate API] Invalid prompt - empty or not a string');
      res.status(400).json({ error: 'Prompt is required and must be a non-empty string' });
      return;
    }

    // Validate prompt length (DALL-E 3 has a 4000 character limit)
    if (prompt.length > 4000) {
      console.error('[Generate API] Prompt too long:', prompt.length, 'characters');
      res.status(400).json({ error: 'Prompt must be 4000 characters or less' });
      return;
    }

    // Validate size parameter
    const validSizes: Array<"1024x1024" | "1792x1024" | "1024x1792"> = ["1024x1024", "1792x1024", "1024x1792"];
    if (!validSizes.includes(size)) {
      res.status(400).json({ 
        error: 'Invalid size. Must be one of: 1024x1024, 1792x1024, 1024x1792' 
      });
      return;
    }

    // Validate quality parameter
    if (!["standard", "hd"].includes(quality)) {
      res.status(400).json({ 
        error: 'Invalid quality. Must be either "standard" or "hd"' 
      });
      return;
    }

    // Validate style parameter
    if (!["vivid", "natural"].includes(style)) {
      res.status(400).json({ 
        error: 'Invalid style. Must be either "vivid" or "natural"' 
      });
      return;
    }

    // Validate n parameter
    if (!Number.isInteger(n) || n < 1 || n > 10) {
      res.status(400).json({ 
        error: 'Invalid n parameter. Must be an integer between 1 and 10' 
      });
      return;
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });

    console.log('[Generate API] Calling DALL-E 3 API...');
    const startTime = Date.now();

    // Generate images using DALL-E 3
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt.trim(),
      size,
      quality,
      style,
      n,
    });

    const responseTime = Date.now() - startTime;
    console.log('[Generate API] DALL-E 3 responded in:', responseTime, 'ms');
    console.log('[Generate API] Generated', response.data.length, 'image(s)');

    // Format response
    const images = response.data.map((image, index) => {
      console.log('[Generate API] Image', index + 1, 'URL length:', image.url?.length || 0);
      if (image.revised_prompt) {
        console.log('[Generate API] Image', index + 1, 'revised prompt:', image.revised_prompt.substring(0, 100));
      }
      return {
        url: image.url || '',
        revisedPrompt: image.revised_prompt,
      };
    });

    const result: GenerateResponse = { images };
    console.log('[Generate API] Sending response with', images.length, 'image(s)');

    // Set CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    
    res.status(200).json(result);

  } catch (error: any) {
    console.error('[Generate API] Error occurred:', error.message);
    console.error('[Generate API] Error stack:', error.stack);
    
    // Set CORS headers even for errors
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Handle specific OpenAI API errors
    if (error.status) {
      switch (error.status) {
        case 400:
          res.status(400).json({ 
            error: 'Bad request - Invalid parameters or prompt',
            details: error.message 
          });
          break;
        case 401:
          res.status(500).json({ 
            error: 'OpenAI API key is invalid or missing',
            details: 'Please check your OpenAI API key configuration' 
          });
          break;
        case 429:
          res.status(429).json({ 
            error: 'Rate limit exceeded or quota exceeded',
            details: error.message 
          });
          break;
        case 500:
        case 503:
          res.status(502).json({ 
            error: 'OpenAI service temporarily unavailable',
            details: 'Please try again later' 
          });
          break;
        default:
          res.status(500).json({ 
            error: 'OpenAI API error',
            details: error.message 
          });
      }
    } else if (error.message?.includes('content_policy')) {
      res.status(400).json({ 
        error: 'Content policy violation',
        details: 'Your prompt was rejected for violating OpenAI content policy. Please modify your prompt and try again.' 
      });
    } else if (error.message?.includes('billing')) {
      res.status(402).json({ 
        error: 'Billing issue',
        details: 'Please check your OpenAI account billing status.' 
      });
    } else {
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }
}