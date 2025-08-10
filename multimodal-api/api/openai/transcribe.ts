import OpenAI from 'openai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Enable CORS for your Expo app
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Transcribe API received request:', req.method);
  
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
      audio,
      format = 'mp3',
      language,
      prompt,
      temperature = 0
    }: {
      audio: string;
      format?: 'mp3' | 'mp4' | 'mpeg' | 'mpga' | 'm4a' | 'wav' | 'webm';
      language?: string;
      prompt?: string;
      temperature?: number;
    } = req.body;

    console.log(`Processing transcription request: format=${format}, language=${language}, hasPrompt=${!!prompt}, temp=${temperature}`);

    // Validate required fields
    if (!audio) {
      res.status(400).json({ error: 'Audio data is required' });
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

    // Convert base64 audio to buffer
    const audioBuffer = Buffer.from(audio, 'base64');
    
    // Create a File-like object for the OpenAI API
    const audioFile = new File([audioBuffer], `audio.${format}`, { 
      type: `audio/${format}` 
    });

    console.log('Calling OpenAI Whisper API...');

    // Call Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      ...(language && { language }),
      ...(prompt && { prompt }),
      temperature,
      response_format: 'json',
    });

    console.log('Transcription successful');

    // Set CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    
    res.status(200).json({ 
      text: transcription.text,
      language: transcription.language || language,
      duration: transcription.duration
    });

  } catch (error: any) {
    console.error('Transcribe API error:', error);
    
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
    } else if (error.message?.includes('file')) {
      res.status(400).json({ 
        error: 'Invalid audio file format or corrupted audio data.',
        details: error.message 
      });
    } else {
      res.status(500).json({ 
        error: 'Internal server error during transcription',
        details: error.message 
      });
    }
  }
}