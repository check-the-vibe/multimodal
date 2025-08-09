import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { streamText, generateText } from 'ai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Enable CORS for your Expo app
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // In production, replace with your specific app URL
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Chat API received request:', req.method);
  
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

  try {
    const { 
      messages, 
      provider = 'openai', 
      model,
      stream = true 
    }: {
      messages: any[];
      provider?: 'openai' | 'anthropic' | 'google';
      model?: string;
      stream?: boolean;
    } = req.body;

    console.log(`Processing chat request: provider=${provider}, model=${model}, messages=${messages?.length}`);

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Messages array is required' });
      return;
    }

    // Select provider and model
    let selectedModel;
    switch (provider) {
      case 'anthropic':
        selectedModel = anthropic(model || 'claude-3-5-sonnet-20241022');
        break;
      case 'google':
        selectedModel = google(model || 'gemini-2.0-flash-exp');
        break;
      case 'openai':
      default:
        selectedModel = openai(model || 'gpt-4o-mini'); // Using mini for cost-effective testing
        break;
    }

    // System prompt for consistent behavior
    const system = `You are a helpful AI assistant with multi-modal capabilities. 
You can process text, images, and other file types. 
Provide clear, concise, and helpful responses.
Be friendly and conversational.`;

    console.log('Calling AI model...');

    // For non-streaming response (simpler for debugging)
    if (!stream) {
      const { text } = await generateText({
        model: selectedModel,
        system,
        messages: messages,
        temperature: 0.7,
        maxTokens: 2000,
      });
      
      // Set CORS headers
      Object.entries(corsHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
      
      res.status(200).json({ 
        message: text,
        provider,
        model: model || 'default'
      });
      return;
    }

    // Stream the response
    const result = streamText({
      model: selectedModel,
      system,
      messages: messages,
      temperature: 0.7,
      maxTokens: 2000,
    });

    // Set CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Set streaming headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    console.log('Streaming response...');

    // Stream the response
    const textStream = result.textStream;
    for await (const chunk of textStream) {
      // Send as SSE format
      res.write(`data: ${JSON.stringify({ type: 'text', content: chunk })}\n\n`);
    }

    // Send done event
    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();

  } catch (error: any) {
    console.error('Chat API error:', error);
    
    // Set CORS headers even for errors
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Handle specific errors
    if (error.message?.includes('API key')) {
      res.status(500).json({ 
        error: 'API key not configured. Please add your API key to Vercel environment variables.',
        details: error.message 
      });
    } else if (error.message?.includes('rate limit')) {
      res.status(429).json({ 
        error: 'Rate limit exceeded. Please try again later.',
        details: error.message 
      });
    } else {
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }
}