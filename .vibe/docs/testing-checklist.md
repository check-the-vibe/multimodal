# Quick Testing Checklist

## Agent-Input-Output Permutation Matrix

### ✅ = Working | ❌ = Bug | ⚠️ = Partial | - = Not Applicable

| Agent Mode | Input Type | Output Type | Status | Notes |
|------------|------------|-------------|--------|-------|
| **Text** | | | | |
| | Text | Chat | ⬜ | Basic chat functionality |
| | Text | Code | ⬜ | Code generation with syntax |
| | Text | Table | ⬜ | Tabular data display |
| | Text | Chart | ⬜ | Chart visualization |
| | Clipboard | Chat | ⬜ | Paste and chat |
| | Clipboard | Code | ⬜ | Paste code and analyze |
| **Vision** | | | | |
| | Image | Chat | ⬜ | Image analysis |
| | Image | Code | ⬜ | Extract code from image |
| | Image | Table | ⬜ | Extract table from image |
| | Drawing | Chat | ⬜ | Analyze drawing |
| | Drawing | Code | ⬜ | Generate code from diagram |
| | Clipboard | Chat | ⬜ | Image URL analysis |
| **Create** | | | | |
| | Text | Image | ⬜ | DALL-E generation |
| | Clipboard | Image | ⬜ | Paste prompt and generate |
| **Transcribe** | | | | |
| | Audio | Chat | ⬜ | Speech to text |
| | Audio | Code | ⬜ | Dictate code |
| | File | Chat | ⬜ | Transcribe audio file |
| **Speak** | | | | |
| | Text | Audio | ⬜ | Text to speech |
| | Clipboard | Audio | ⬜ | Paste and speak |
| **Code** | | | | |
| | Text | Code | ⬜ | Generate code |
| | Text | Chat | ⬜ | Explain code |
| | Text | File | ⬜ | Generate files |
| | File | Code | ⬜ | Refactor uploaded code |
| | Clipboard | Code | ⬜ | Analyze pasted code |

## Priority 1 - Critical Path Tests

### Text Agent
- [ ] Send "Hello" → Get response in chat
- [ ] Send "Write a function to add two numbers" → Get code
- [ ] Send "Create a table of fruits and prices" → Get table

### Vision Agent  
- [ ] Upload image → Get description
- [ ] Take photo → Analyze content
- [ ] Draw circle → Get shape recognition

### Create Agent
- [ ] Type "A red rose" → Get generated image
- [ ] Type "Abstract art" → Get creative image

### Transcribe Agent
- [ ] Record "Testing 123" → Get text "Testing 123"
- [ ] Upload MP3 → Get transcription

### Speak Agent
- [ ] Type "Hello world" → Hear audio
- [ ] Select different voice → Hear difference

### Code Agent
- [ ] Type "Python hello world" → Get Python code
- [ ] Type "Explain recursion" → Get explanation

## Priority 2 - Settings & Options

### Per Agent Settings
- [ ] Text: Switch GPT-4o ↔ GPT-4o-mini
- [ ] Vision: Toggle detail level (low/high/auto)
- [ ] Create: Change size (square/wide/tall)
- [ ] Create: Toggle quality (standard/HD)
- [ ] Transcribe: Toggle timestamps
- [ ] Speak: Change voice (6 options)
- [ ] Code: Toggle comments on/off

## Priority 3 - Edge Cases

### Input Validation
- [ ] Empty text input → Should not send
- [ ] No image selected → Should prompt
- [ ] No audio recorded → Should show error
- [ ] Invalid clipboard content → Handle gracefully

### API Errors
- [ ] Network offline → Show error message
- [ ] API timeout → Show timeout error
- [ ] Rate limit → Show rate limit message
- [ ] Invalid response → Handle gracefully

## Priority 4 - UI/UX Polish

### Navigation
- [ ] Swipe smoothly between agents
- [ ] Dots show current position
- [ ] Disabled inputs are visually different
- [ ] Cards collapse/expand properly

### Feedback
- [ ] Loading spinner during API calls
- [ ] Send button disabled while sending
- [ ] Success/error messages clear
- [ ] Audio playback controls work

## Bug Severity Levels

### 🔴 Critical (Fix immediately)
- App crashes
- No API response
- Data loss
- Security issues

### 🟠 High (Fix in next release)
- Feature not working
- Major UX issues
- Performance problems
- Incorrect output

### 🟡 Medium (Fix soon)
- Minor feature issues
- UI inconsistencies
- Non-blocking errors
- Missing validations

### 🟢 Low (Fix eventually)
- Cosmetic issues
- Minor text problems
- Enhancement requests
- Edge case handling

## Test Execution Order

### Day 1 - Morning
1. Test all Text agent combinations
2. Test all Vision agent combinations
3. Document any bugs found

### Day 1 - Afternoon
1. Test Create agent
2. Test Transcribe agent
3. Test Speak agent
4. Test Code agent

### Day 2 - Morning
1. Test all settings
2. Test edge cases
3. Test error handling

### Day 2 - Afternoon
1. Platform-specific testing
2. Performance testing
3. Regression testing of fixes

## Quick Bug Report Format

```
BUG-[NUMBER]: [Agent] + [Input] → [Output] fails
Steps: 1) Select X agent 2) Use Y input 3) Expected Z
Actual: [What happened instead]
Priority: [Critical/High/Medium/Low]
```

## Testing Environment

- **URL**: https://multimodal-teal.vercel.app
- **API Key**: Configured in Vercel
- **Test Data**: 
  - Images: Use photos from device
  - Audio: Record test phrases
  - Text: Use varied prompts
  - Files: Prepare test files

## Final Checklist Before Release

- [ ] All Priority 1 tests pass
- [ ] No Critical bugs remain
- [ ] Settings persist correctly
- [ ] Works on iOS device
- [ ] Works on Android device
- [ ] Works on web browser
- [ ] API errors handled gracefully
- [ ] Performance acceptable
- [ ] Documentation updated