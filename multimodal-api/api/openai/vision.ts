import { openai } from '@ai-sdk/openai';
import { streamText, generateText } from 'ai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Enable CORS for your Expo app
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // In production, replace with your specific app URL
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
};

interface ImageContent {
  type: 'image';
  image: string | { url: string }; // base64 string or URL object
}

interface TextContent {
  type: 'text';
  text: string;
}

interface VisionMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | (TextContent | ImageContent)[];
}

interface VisionRequest {
  messages: VisionMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  mode?: 'analyze' | 'ocr' | 'describe' | 'extract';
  customPrompt?: string;
}

// Helper function to validate base64 image
function isValidBase64Image(base64String: string): boolean {
  if (!base64String || typeof base64String !== 'string') return false;
  
  // Check if it starts with data:image/ prefix
  const base64Regex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
  return base64Regex.test(base64String);
}

// Helper function to validate image URL
function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const parsedUrl = new URL(url);
    const supportedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const pathname = parsedUrl.pathname.toLowerCase();
    return supportedExtensions.some(ext => pathname.endsWith(ext)) || 
           parsedUrl.hostname.includes('githubusercontent.com') ||
           parsedUrl.hostname.includes('imgur.com') ||
           parsedUrl.hostname.includes('cloudinary.com');
  } catch {
    return false;
  }
}

// Helper function to estimate image size from base64
function estimateBase64Size(base64String: string): number {
  if (!base64String) return 0;
  
  // Remove data URL prefix if present
  const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, '');
  
  // Base64 encoding increases size by ~33%, so divide by 0.75 to get approximate original size
  return Math.floor(base64Data.length * 0.75);
}

// Helper function to get mode-specific prompts
function getModePrompt(mode: string, customPrompt?: string): string {
  if (customPrompt) return customPrompt;
  
  switch (mode) {
    case 'ocr':
      return `Extract and transcribe all text from the image(s). Maintain the original formatting and structure as much as possible. If there are multiple text elements, organize them logically.`;
    
    case 'describe':
      return `Provide a detailed description of the image(s). Include information about objects, people, scenes, colors, composition, and any notable details you observe.`;
    
    case 'extract':
      return `Extract structured information from the image(s). Look for data tables, forms, charts, or any organized information and present it in a clear, structured format.`;
    
    case 'analyze':
    default:
      return `Analyze the image(s) thoroughly and provide insights. Describe what you see, identify key elements, and offer any relevant observations or interpretations.`;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Vision API received request:', req.method);
  
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
      messages, 
      model = 'gpt-4o',  // Default to gpt-4o for vision capabilities
      temperature = 0.7,
      maxTokens = 4096,  // Higher default for detailed image descriptions
      stream = true,
      mode = 'analyze',
      customPrompt
    }: VisionRequest = req.body;

    console.log(`Processing vision request: model=${model}, temp=${temperature}, maxTokens=${maxTokens}, mode=${mode}, messages=${messages?.length}`);

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Messages array is required' });
      return;
    }

    // Validate that we have at least one image in the messages
    let hasImages = false;
    let totalEstimatedSize = 0;
    const MAX_TOTAL_SIZE = 20 * 1024 * 1024; // 20MB limit

    // Process and validate messages
    const processedMessages: VisionMessage[] = [];

    for (const message of messages) {
      if (message.role === 'system') {
        processedMessages.push(message);
        continue;
      }

      // Handle messages with image content
      if (Array.isArray(message.content)) {
        const processedContent: (TextContent | ImageContent)[] = [];
        
        for (const content of message.content) {
          if (content.type === 'text') {
            processedContent.push(content);
          } else if (content.type === 'image') {
            hasImages = true;
            
            // Validate image format
            if (typeof content.image === 'string') {
              // Base64 image
              if (!isValidBase64Image(content.image)) {
                res.status(400).json({ 
                  error: 'Invalid base64 image format. Must be data:image/[type];base64,[data]' 
                });
                return;
              }
              
              const imageSize = estimateBase64Size(content.image);
              totalEstimatedSize += imageSize;
              
              processedContent.push(content);
            } else if (content.image && typeof content.image === 'object' && content.image.url) {
              // URL image
              if (!isValidImageUrl(content.image.url)) {
                res.status(400).json({ 
                  error: 'Invalid image URL format or unsupported image type' 
                });
                return;
              }
              
              // Estimate URL image size (conservative estimate)
              totalEstimatedSize += 2 * 1024 * 1024; // 2MB estimate per URL image
              
              processedContent.push(content);
            } else {
              res.status(400).json({ 
                error: 'Image must be either base64 string or URL object with url property' 
              });
              return;
            }
          }
        }
        
        processedMessages.push({
          ...message,
          content: processedContent
        });
      } else {
        // Simple text message
        processedMessages.push(message);
      }
    }

    // Check if we have any images
    if (!hasImages) {
      res.status(400).json({ 
        error: 'At least one image is required for vision API' 
      });
      return;
    }

    // Check total size limit
    if (totalEstimatedSize > MAX_TOTAL_SIZE) {
      res.status(400).json({ 
        error: `Total image size exceeds 20MB limit. Estimated size: ${Math.round(totalEstimatedSize / 1024 / 1024)}MB` 
      });
      return;
    }

    console.log(`Images validated. Estimated total size: ${Math.round(totalEstimatedSize / 1024 / 1024)}MB`);

    // Use GPT-4o model with vision capabilities
    const selectedModel = openai(model);

    // Get system prompt based on mode
    const systemPrompt = getModePrompt(mode, customPrompt);
    
    // Add system message if not present
    let finalMessages = processedMessages;
    if (!processedMessages.some(m => m.role === 'system')) {
      finalMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...processedMessages
      ];
    }

    console.log('Calling OpenAI Vision API...');

    // For non-streaming response
    if (!stream) {
      const { text } = await generateText({
        model: selectedModel as any,
        messages: finalMessages as any,
        temperature,
        maxTokens,
      });
      
      // Set CORS headers
      Object.entries(corsHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
      
      res.status(200).json({ 
        message: text,
        model,
        mode,
        totalImages: messages.filter(m => Array.isArray(m.content) && 
          m.content.some(c => c.type === 'image')).length
      });
      return;
    }

    // Stream the response
    const result = streamText({
      model: selectedModel as any,
      messages: finalMessages as any,
      temperature,
      maxTokens,
    });

    // Set CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Set streaming headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    console.log('Streaming vision response...');

    // Send initial metadata
    res.write(`data: ${JSON.stringify({ 
      type: 'metadata', 
      model,
      mode,
      totalImages: messages.filter(m => Array.isArray(m.content) && 
        m.content.some(c => c.type === 'image')).length
    })}\n\n`);

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
    console.error('Vision API error:', error);
    
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
    } else if (error.message?.includes('content_policy') || error.message?.includes('safety')) {
      res.status(400).json({ 
        error: 'Image content violates OpenAI content policy.',
        details: error.message 
      });
    } else if (error.message?.includes('invalid_image')) {
      res.status(400).json({ 
        error: 'Invalid image format or corrupted image data.',
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