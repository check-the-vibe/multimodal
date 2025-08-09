/**
 * Quick test script for the AI integration
 * Run with: node test-api.js
 */

console.log('Testing AI Integration...\n');

// Test configuration
const config = require('./services/config');
console.log('Configuration:');
console.log('- AI_SDK_ENABLED:', config.AI_SDK_ENABLED);
console.log('- API_BASE_URL:', config.API_BASE_URL);
console.log('- API Chat URL:', config.apiUrl('/api/chat'));

// Test with local mock (AI_SDK_ENABLED = false)
async function testMock() {
  console.log('\n1. Testing with mock (AI_SDK_ENABLED = false)...');
  
  // Temporarily override the flag
  const originalFlag = config.AI_SDK_ENABLED;
  config.AI_SDK_ENABLED = false;
  
  const { streamChat } = require('./services/agentClient');
  
  let result = '';
  await streamChat(
    { 
      model: 'test-model', 
      messages: [{ role: 'user', content: 'Hello mock!' }] 
    },
    (chunk) => {
      process.stdout.write(chunk);
      result += chunk;
    }
  );
  
  console.log('\nMock test completed:', result ? '✅' : '❌');
  
  // Restore flag
  config.AI_SDK_ENABLED = originalFlag;
}

// Test with real API (requires server running)
async function testReal() {
  console.log('\n2. Testing with real API (requires Vercel API or local server)...');
  console.log('   Attempting to connect to:', config.apiUrl('/api/chat'));
  
  try {
    const response = await fetch(config.apiUrl('/api/chat'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello! Please respond with: "API is working!"' }],
        provider: 'openai',
        model: 'gpt-4o-mini',
        stream: false,
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('   Response:', data);
      console.log('   Real API test: ✅');
    } else {
      console.log('   Response status:', response.status);
      const text = await response.text();
      console.log('   Response:', text.substring(0, 200));
      console.log('   Real API test: ❌ (May need authentication or local server)');
    }
  } catch (error) {
    console.log('   Error:', error.message);
    console.log('   Real API test: ❌ (Server not reachable)');
    console.log('\n   To test locally:');
    console.log('   1. cd multimodal-api');
    console.log('   2. vercel dev');
    console.log('   3. Run this test again');
  }
}

// Run tests
async function runTests() {
  await testMock();
  await testReal();
  
  console.log('\n---');
  console.log('Next steps:');
  console.log('1. If using Vercel: Check authentication settings at https://vercel.com/dashboard');
  console.log('2. For local testing: Run "vercel dev" in multimodal-api directory');
  console.log('3. Update AI_SDK_ENABLED in services/config.ts to enable/disable AI');
  console.log('4. Run the Expo app: npm start');
}

runTests();