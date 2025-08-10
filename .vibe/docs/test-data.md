# Test Data & Expected Outcomes

## Text Agent Test Prompts

### Chat Output Tests
```
Prompt: "Hello, how are you?"
Expected: Friendly greeting response
```

```
Prompt: "What is the capital of France?"
Expected: "The capital of France is Paris"
```

```
Prompt: "Explain quantum computing in simple terms"
Expected: Clear, accessible explanation
```

### Code Output Tests
```
Prompt: "Write a Python function to calculate factorial"
Expected: Properly formatted Python code with factorial implementation
```

```
Prompt: "Create a React component for a button"
Expected: JSX code with functional component
```

```
Prompt: "SQL query to find top 5 customers by sales"
Expected: Valid SQL SELECT statement
```

### Table Output Tests
```
Prompt: "Create a table of planets and their distances from the sun"
Expected: Table with Planet and Distance columns
```

```
Prompt: "Show me a comparison table of programming languages"
Expected: Multi-column table with language features
```

### Chart Output Tests
```
Prompt: "Create a bar chart of monthly sales: Jan:100, Feb:150, Mar:120"
Expected: Chart data with proper labels and values
```

## Vision Agent Test Images

### Test Image URLs
```
https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/320px-PNG_transparency_demonstration_1.png
Description: PNG transparency test image
Expected: "This is a demonstration image showing PNG transparency with dice"
```

```
https://www.w3schools.com/html/img_girl.jpg
Description: Sample portrait photo
Expected: "A woman wearing a hat"
```

### Drawing Test Cases
```
Drawing: Circle
Expected: "A circular shape" or "circle"
```

```
Drawing: Square with X inside
Expected: "A square with diagonal lines" or "box with X"
```

```
Drawing: Simple smiley face
Expected: "A smiley face" or "happy face drawing"
```

## Create Agent Prompts

### Basic Image Generation
```
Prompt: "A red apple on a white table"
Expected: Image with red apple, white surface
```

```
Prompt: "Sunset over mountains"
Expected: Landscape image with sunset colors
```

```
Prompt: "Abstract geometric patterns in blue and gold"
Expected: Abstract art with specified colors
```

### Style Variations
```
Prompt: "A cat in a garden"
Style: Vivid
Expected: Bright, vibrant colors
```

```
Prompt: "A cat in a garden"
Style: Natural
Expected: Realistic, muted colors
```

### Size Variations
```
Prompt: "City skyline"
Size: 1792x1024 (Wide)
Expected: Panoramic city view
```

```
Prompt: "Portrait of a robot"
Size: 1024x1792 (Tall)
Expected: Vertical portrait format
```

## Transcribe Agent Test Audio

### Speech Samples
```
Audio: "The quick brown fox jumps over the lazy dog"
Expected: Exact transcription with all words
```

```
Audio: "Testing one two three, testing one two three"
Expected: "Testing one two three, testing one two three" or "Testing 1 2 3, testing 1 2 3"
```

```
Audio: "My email is test@example.com"
Expected: Correct email format in transcription
```

### Multi-language Tests
```
Audio: "Bonjour, comment allez-vous?" (French)
Expected: Correct French transcription
```

```
Audio: "Hola, ¿cómo estás?" (Spanish)
Expected: Correct Spanish transcription
```

## Speak Agent Test Texts

### Voice Comparison
```
Text: "This is a test of the text to speech system"
Test with each voice: alloy, echo, fable, onyx, nova, shimmer
Expected: Distinct voice characteristics
```

### Speed Variations
```
Text: "The rain in Spain stays mainly in the plain"
Speed: 0.5x - Expected: Slow, clear speech
Speed: 1.0x - Expected: Normal pace
Speed: 2.0x - Expected: Fast but intelligible
```

### Long Text
```
Text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris."
Expected: Complete audio generation without cutoff
```

## Code Agent Test Cases

### Code Generation
```
Prompt: "Write a function to reverse a string in JavaScript"
Expected: 
function reverseString(str) {
  return str.split('').reverse().join('');
}
```

```
Prompt: "Create a Python class for a bank account"
Expected: Class with __init__, deposit, withdraw methods
```

### Code Explanation
```
Prompt: "Explain this code: const x = arr.filter(n => n > 5)"
Expected: "This code filters an array to keep only numbers greater than 5"
```

### Code Refactoring
```
Input Code: 
for (var i = 0; i < arr.length; i++) {
  console.log(arr[i]);
}

Prompt: "Refactor this to modern JavaScript"
Expected:
arr.forEach(item => console.log(item));
// or
for (const item of arr) {
  console.log(item);
}
```

## Error Test Cases

### Invalid Inputs
```
Empty text: ""
Expected: Input validation prevents sending
```

```
Oversized image: >20MB file
Expected: "File too large" error message
```

```
Unsupported format: .exe file
Expected: "Unsupported file type" error
```

### API Errors
```
Invalid API key scenario
Expected: "Authentication failed" message
```

```
Network timeout scenario
Expected: "Request timed out" message
```

```
Rate limit scenario
Expected: "Rate limit exceeded, please try again later"
```

## Performance Benchmarks

### Response Times
- Text → Chat: First token < 2 seconds
- Image → Vision: Analysis < 5 seconds
- Text → Image: Generation < 10 seconds
- Audio → Text: Transcription < 3 seconds
- Text → Audio: Speech < 2 seconds
- Text → Code: Generation < 3 seconds

### File Size Limits
- Images: Max 20MB
- Audio: Max 25MB
- Generated images: ~1-3MB
- Generated audio: ~100KB per minute

### Concurrent Operations
- Should handle agent switching during operation
- Should queue multiple requests appropriately
- Should not crash with rapid interactions

## Platform-Specific Test Data

### iOS
- Test with photos from Camera Roll
- Test with voice memos
- Test in airplane mode
- Test with low battery

### Android
- Test with photos from Gallery
- Test with different keyboards
- Test in split-screen mode
- Test with battery saver on

### Web
- Test drag-and-drop files
- Test copy-paste from other tabs
- Test with ad blockers
- Test in incognito mode