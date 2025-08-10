import OpenAI from 'openai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Enable CORS for your Expo app
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('TTS API received request:', req.method);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Check API key authentication
  const apiKey = req.headers['x-api-key'] as string;
  const validApiKey = process.env.MULTIMODAL_API_KEY;
  
  if (!validApiKey) {
    console.error('MULTIMODAL_API_KEY not configured in environment');
    res.status(500).json({ error: 'API authentication not configured' });
    return;
  }
  
  if (!apiKey || apiKey !== validApiKey) {
    console.log('Invalid API key attempted');
    res.status(401).json({ error: 'Unauthorized - Invalid API key' });
    return;
  }

  try {
    const { 
      text,
      model = 'tts-1',
      voice,
      format = 'mp3',
      speed = 1.0
    }: {
      text: string;
      model?: 'tts-1' | 'tts-1-hd';
      voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
      format?: 'mp3' | 'opus' | 'aac' | 'flac';
      speed?: number;
    } = req.body;

    console.log(`Processing TTS request: model=${model}, voice=${voice}, format=${format}, speed=${speed}, textLength=${text?.length}`);

    // Validate required fields
    if (!text || text.trim().length === 0) {
      res.status(400).json({ error: 'Text is required' });
      return;
    }

    if (!voice) {
      res.status(400).json({ error: 'Voice is required' });
      return;
    }

    // Validate speed range
    if (speed < 0.25 || speed > 4.0) {
      res.status(400).json({ error: 'Speed must be between 0.25 and 4.0' });
      return;
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not configured');
      res.status(500).json({ error: 'OpenAI API key not configured' });
      return;
    }

    console.log('Calling OpenAI TTS API...');

    // Call TTS API
    const speech = await openai.audio.speech.create({
      model: model,
      voice: voice,
      input: text,
      response_format: format,
      speed: speed,
    });

    console.log('TTS generation successful');

    // Convert response to buffer
    const audioBuffer = Buffer.from(await speech.arrayBuffer());
    
    // Convert to base64
    const audioBase64 = audioBuffer.toString('base64');

    // Set CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    
    res.status(200).json({ 
      audio: audioBase64,
      format: format,
      model: model,
      voice: voice,
      speed: speed,
      size: audioBuffer.length
    });

  } catch (error: any) {
    console.error('TTS API error:', error);
    
    // Set CORS headers even for errors
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Handle specific errors
    if (error.message?.includes('API key')) {
      res.status(500).json({ 
        error: 'OpenAI API key not configured. Please add your API key to Vercel environment variables.',
        details: error.message 
      });
    } else if (error.message?.includes('rate limit')) {
      res.status(429).json({ 
        error: 'Rate limit exceeded. Please try again later.',
        details: error.message 
      });
    } else if (error.message?.includes('invalid voice')) {
      res.status(400).json({ 
        error: 'Invalid voice selection. Must be one of: alloy, echo, fable, onyx, nova, shimmer',
        details: error.message 
      });
    } else if (error.message?.includes('text too long')) {
      res.status(400).json({ 
        error: 'Text input is too long. Please reduce the text length.',
        details: error.message 
      });
    } else {
      res.status(500).json({ 
        error: 'Internal server error during text-to-speech generation',
        details: error.message 
      });
    }
  }
}