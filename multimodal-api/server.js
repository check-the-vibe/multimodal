/**
 * Simple Express server for the AI API
 * Run with: node server.js
 */

const express = require('express');
const cors = require('cors');
const { openai } = require('@ai-sdk/openai');
const { streamText, generateText, convertToCoreMessages } = require('ai');

const app = express();
const PORT = 3000;

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'API is running',
    endpoints: ['/api/chat', '/api/test'],
    timestamp: new Date().toISOString()
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API test successful!',
    timestamp: new Date().toISOString()
  });
});

// Main chat endpoint
app.post('/api/chat', async (req, res) => {
  console.log('Chat request received:', {
    messages: req.body.messages?.length,
    provider: req.body.provider,
    model: req.body.model
  });

  try {
    const { 
      messages = [], 
      provider = 'openai', 
      model = 'gpt-4o-mini',
      stream = true 
    } = req.body;

    // Validate messages
    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Check API key
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ 
        error: 'OpenAI API key not configured',
        hint: 'Add OPENAI_API_KEY to .env.local file'
      });
    }

    // For now, just use OpenAI
    const selectedModel = openai(model);
    
    // System prompt
    const system = `You are a helpful AI assistant. Provide clear, concise, and helpful responses.`;

    if (!stream) {
      // Non-streaming response (simpler for testing)
      const { text } = await generateText({
        model: selectedModel,
        system,
        messages: messages,
        temperature: 0.7,
        maxTokens: 1000,
      });
      
      return res.json({ 
        message: text,
        provider,
        model 
      });
    }

    // Streaming response
    console.log('Starting streaming response...');
    
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable Nginx buffering
    
    // Write initial newline to establish connection
    res.write('\n');

    try {
      const result = await streamText({
        model: selectedModel,
        system,
        messages: messages,
        temperature: 0.7,
        maxTokens: 1000,
      });

      // Get the text stream
      const stream = result.textStream;
      
      // Process the stream
      for await (const chunk of stream) {
        console.log('Sending chunk:', chunk);
        res.write(`data: ${JSON.stringify({ type: 'text', content: chunk })}\n\n`);
        // Force flush the response
        if (res.flush) res.flush();
      }

      // Send done event
      console.log('Stream complete, sending done event');
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();
    } catch (streamError) {
      console.error('Streaming error:', streamError);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Streaming failed', details: streamError.message });
      } else {
        res.write(`data: ${JSON.stringify({ type: 'error', error: streamError.message })}\n\n`);
        res.end();
      }
    }

  } catch (error) {
    console.error('Chat API error:', error);
    
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }
});

// Start server - listen on all interfaces for iOS access
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
================================================================================
🚀 AI API Server Running!
================================================================================
URLs: 
  - Local: http://localhost:${PORT}
  - Network: http://10.0.1.116:${PORT} (for iOS/Android)
Endpoints:
  - GET  /           → Health check
  - GET  /api/test   → Test endpoint
  - POST /api/chat   → AI chat (streaming)

OpenAI Key: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Missing'}

Test with:
  curl http://localhost:${PORT}/api/test
================================================================================
  `);
});