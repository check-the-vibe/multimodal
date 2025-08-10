/**
 * Test script for OpenAI Vision API endpoint
 * Tests base64 images, URL images, multi-image support, different modes, and error handling
 */

const API_BASE_URL = 'http://localhost:3000'; // Change to Vercel URL for production testing
const API_KEY = 'mm_469eade2349b909e92b789cf1533dc3592f08480d9f6a0794ba09b94ac29669d';

// Test image data (small base64 image for testing)
const TEST_BASE64_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
const TEST_IMAGE_URL = 'https://picsum.photos/200/300';

async function testVisionAPI() {
  console.log('🧪 Testing OpenAI Vision API...\n');

  // Test 1: Basic image analysis with base64
  console.log('Test 1: Basic image analysis with base64');
  await testRequest({
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'What do you see in this image?' },
          { type: 'image', image: TEST_BASE64_IMAGE }
        ]
      }
    ],
    mode: 'analyze',
    stream: false
  }, 'basic-base64-analysis');

  // Test 2: Image analysis with URL
  console.log('\nTest 2: Image analysis with URL');
  await testRequest({
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Describe this image in detail.' },
          { type: 'image', image: { url: TEST_IMAGE_URL } }
        ]
      }
    ],
    mode: 'describe',
    stream: false
  }, 'url-image-description');

  // Test 3: OCR mode
  console.log('\nTest 3: OCR mode test');
  await testRequest({
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Extract any text from this image.' },
          { type: 'image', image: TEST_BASE64_IMAGE }
        ]
      }
    ],
    mode: 'ocr',
    stream: false
  }, 'ocr-mode-test');

  // Test 4: Multi-image analysis
  console.log('\nTest 4: Multi-image analysis');
  await testRequest({
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Compare these two images.' },
          { type: 'image', image: TEST_BASE64_IMAGE },
          { type: 'image', image: { url: TEST_IMAGE_URL } }
        ]
      }
    ],
    mode: 'analyze',
    stream: false
  }, 'multi-image-comparison');

  // Test 5: Custom prompt
  console.log('\nTest 5: Custom prompt');
  await testRequest({
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Analyze this image.' },
          { type: 'image', image: TEST_BASE64_IMAGE }
        ]
      }
    ],
    mode: 'analyze',
    customPrompt: 'Identify any geometric shapes or patterns in the image and describe their mathematical properties.',
    stream: false
  }, 'custom-prompt-analysis');

  // Test 6: Streaming response
  console.log('\nTest 6: Streaming response');
  await testStreamingRequest({
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Give me a detailed analysis of this image.' },
          { type: 'image', image: { url: TEST_IMAGE_URL } }
        ]
      }
    ],
    mode: 'analyze',
    stream: true
  }, 'streaming-analysis');

  // Test 7: Error handling - no images
  console.log('\nTest 7: Error handling - no images');
  await testRequest({
    messages: [
      {
        role: 'user',
        content: 'Analyze this image.'
      }
    ]
  }, 'no-images-error');

  // Test 8: Error handling - invalid base64
  console.log('\nTest 8: Error handling - invalid base64');
  await testRequest({
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'What do you see?' },
          { type: 'image', image: 'invalid-base64-data' }
        ]
      }
    ]
  }, 'invalid-base64-error');

  // Test 9: Error handling - invalid URL
  console.log('\nTest 9: Error handling - invalid URL');
  await testRequest({
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Describe this image.' },
          { type: 'image', image: { url: 'not-a-valid-url' } }
        ]
      }
    ]
  }, 'invalid-url-error');

  // Test 10: Error handling - missing API key
  console.log('\nTest 10: Error handling - missing API key');
  await testRequest({
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'What do you see?' },
          { type: 'image', image: TEST_BASE64_IMAGE }
        ]
      }
    ]
  }, 'missing-api-key-error', null);

  console.log('\n✅ All vision API tests completed!');
}

async function testRequest(payload, testName, apiKey = API_KEY) {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (apiKey) {
      headers['x-api-key'] = apiKey;
    }

    const response = await fetch(`${API_BASE_URL}/api/openai/vision`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    console.log(`  Status: ${response.status}`);
    if (response.ok) {
      console.log(`  Model: ${data.model || 'N/A'}`);
      console.log(`  Mode: ${data.mode || 'N/A'}`);
      console.log(`  Total Images: ${data.totalImages || 'N/A'}`);
      console.log(`  Response: ${data.message?.substring(0, 100)}${data.message?.length > 100 ? '...' : ''}`);
      console.log(`  ✅ ${testName} - SUCCESS`);
    } else {
      console.log(`  Error: ${data.error}`);
      console.log(`  Details: ${data.details || 'N/A'}`);
      console.log(`  ⚠️  ${testName} - ERROR (expected for error tests)`);
    }
  } catch (error) {
    console.log(`  Network Error: ${error.message}`);
    console.log(`  ❌ ${testName} - NETWORK ERROR`);
  }
}

async function testStreamingRequest(payload, testName) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/openai/vision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const data = await response.json();
      console.log(`  Status: ${response.status}`);
      console.log(`  Error: ${data.error}`);
      console.log(`  ❌ ${testName} - ERROR`);
      return;
    }

    console.log(`  Status: ${response.status} - Streaming...`);
    
    const reader = response.body?.getReader();
    if (!reader) {
      console.log('  ❌ No reader available');
      return;
    }

    let chunks = 0;
    let totalContent = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              if (data.type === 'metadata') {
                console.log(`  Model: ${data.model}, Mode: ${data.mode}, Images: ${data.totalImages}`);
              } else if (data.type === 'text') {
                totalContent += data.content;
                chunks++;
              } else if (data.type === 'done') {
                console.log(`  Received ${chunks} chunks`);
                console.log(`  Total content: ${totalContent.substring(0, 100)}${totalContent.length > 100 ? '...' : ''}`);
                console.log(`  ✅ ${testName} - SUCCESS`);
                return;
              }
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    console.log(`  Network Error: ${error.message}`);
    console.log(`  ❌ ${testName} - NETWORK ERROR`);
  }
}

// Run the tests
testVisionAPI().catch(console.error);