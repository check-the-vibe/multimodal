# Development Approach & Methodology

## Core Philosophy

### 1. Simplicity First
- Start with minimal viable features
- Add complexity only when needed
- Remove unused code aggressively

### 2. Platform-Aware Development
- Test on all target platforms early
- Handle platform differences explicitly
- Use Platform.OS for conditional logic

### 3. Security by Default
- Never expose API keys in code
- Authenticate all sensitive endpoints
- Use environment variables for secrets

## Development Workflow

### Phase 1: Planning
1. **Understand Requirements**
   - Read existing documentation
   - Check current implementation
   - Identify constraints

2. **Document Approach**
   - Create/update .vibe/docs
   - Define component interfaces
   - Plan state management

3. **Use TodoWrite Tool**
   - Break down into tasks
   - Track progress systematically
   - Mark completed immediately

### Phase 2: Implementation
1. **Start Simple**
   ```typescript
   // First: Make it work
   const basic = () => { return "hello"; }
   
   // Then: Make it right
   const improved = (name: string): string => {
     return `Hello, ${name}!`;
   }
   
   // Finally: Make it fast (if needed)
   const optimized = useMemo(() => {...}, [deps]);
   ```

2. **Incremental Changes**
   - Small, testable commits
   - Verify each step works
   - Don't break existing features

3. **Platform Testing**
   - Web first (fastest iteration)
   - Then iOS/Android
   - Fix platform-specific issues

### Phase 3: Debugging
1. **Add Logging**
   ```typescript
   console.log('[Component] State:', state);
   console.log('[API] Request:', request);
   console.log('[Error] Details:', error);
   ```

2. **Use Debug Tools**
   - Network test button (🔧)
   - React DevTools
   - Expo DevTools

3. **Systematic Approach**
   - Reproduce consistently
   - Isolate the problem
   - Fix root cause, not symptoms

## Architecture Decisions

### Why Simplified UI?
**Before**: Multiple input/output modalities
**Problem**: Complex state management, unused features
**Solution**: Single chat interface with expandable sections
**Result**: Cleaner code, better UX, easier maintenance

### Why Vercel for API?
**Options Considered**:
1. Local Express server
2. AWS Lambda
3. Vercel Functions

**Decision**: Vercel Functions
**Reasons**:
- Zero-config deployment
- Built-in CORS handling
- Easy environment variables
- Free tier sufficient

### Why API Key Authentication?
**Problem**: Open endpoints = unlimited usage
**Options**:
1. OAuth (too complex)
2. JWT (overkill)
3. API Key (just right)
**Implementation**: Simple x-api-key header

## Code Organization

### File Structure Strategy
```
/components/
  /modality/      # Domain-specific components
    /input/       # Input-related
    /output/      # Output-related
  /ui/           # Generic, reusable
  /composer/     # Specialized UI groups

/services/       # Business logic
  config.ts      # Configuration
  agentClient.ts # API communication

/multimodal-api/ # Backend (separate deployment)
  /api/          # Vercel Functions
  server.js      # Local dev server
```

### State Management Approach
**Current**: React hooks (useState, useRef)
**Why**: Simple, sufficient for current needs
**Future**: Consider Zustand or Redux if complexity grows

### Error Handling Pattern
```typescript
try {
  // Attempt operation
  const result = await riskyOperation();
  
} catch (error: any) {
  // Log for debugging
  console.error('[Context] Error:', error);
  
  // User-friendly message
  Alert.alert('Title', 'What went wrong and what to do');
  
  // Fallback behavior
  return defaultValue;
}
```

## Testing Strategy

### Manual Testing Checklist
- [ ] Web browser (localhost)
- [ ] iOS Simulator
- [ ] iOS Device (Expo Go)
- [ ] Android Emulator
- [ ] Android Device (Expo Go)
- [ ] Network interruption
- [ ] API key invalid
- [ ] API server down

### Automated Testing
```typescript
// Smoke tests - does it render?
test('renders without crashing', () => {
  render(<App />);
});

// Integration - does flow work?
test('sends message and receives response', async () => {
  // Mock API
  // Trigger send
  // Verify response displayed
});

// Unit - does logic work?
test('Platform.OS detection', () => {
  expect(getAPIUrl()).toMatch(/localhost|vercel/);
});
```

## Performance Optimization

### Current Optimizations
1. **Lazy Loading**: Expo modules loaded on-demand
2. **Debouncing**: Text input with 300ms delay
3. **Memoization**: Heavy computations cached

### Future Optimizations
1. **Code Splitting**: Separate bundles per platform
2. **Image Optimization**: WebP format, lazy loading
3. **API Caching**: Response caching with SWR

## Deployment Process

### Local Development
```bash
# Terminal 1
npm start

# Terminal 2
cd multimodal-api && node server.js
```

### Staging (Branch)
```bash
git checkout -b feature/new-thing
# Make changes
git push origin feature/new-thing
# Create PR for review
```

### Production (Main)
```bash
git checkout main
git pull origin main
# Make changes
git add -A
git commit -m "Clear message"
git push origin main
# Vercel auto-deploys
```

## Parallel Session Protocol

### Session Types
1. **Claude Session** (This one)
   - Uses CLAUDE.md for guidance
   - Focuses on implementation
   - Documents in .vibe/docs/

2. **Codex Session** (Other AI)
   - Uses AGENTS.md for guidance
   - May focus on different aspects
   - Also documents in .vibe/docs/

### Synchronization Rules
1. **Before Starting**: Pull latest changes
2. **During Work**: Commit frequently
3. **After Completing**: Push immediately
4. **Conflicts**: Resolve conservatively

### Communication Between Sessions
Via git commits and documentation:
```bash
# Claude session
git commit -m "Implement chat UI expansion logic"

# Codex session (pulls)
git pull origin main
# Sees Claude's work, continues
```

## Decision Log

### 2024-08-09: Removed Multi-Modal Features
**Why**: Simplify for initial release
**What**: Removed audio, video, photo inputs
**Result**: 70% less code, cleaner UX

### 2024-08-09: Added API Authentication
**Why**: Prevent unauthorized usage
**What**: x-api-key header requirement
**Result**: Secured endpoints

### 2024-08-09: Platform-Specific URLs
**Why**: iOS can't reach localhost
**What**: Conditional URL based on Platform.OS
**Result**: Works on all platforms

## Troubleshooting Patterns

### Network Issues
```typescript
// Problem: "Network request failed"
// Check 1: URL accessibility
curl -I <url>

// Check 2: CORS headers
curl -H "Origin: http://localhost" <url>

// Check 3: Platform detection
console.log(Platform.OS, API_BASE_URL);
```

### State Issues
```typescript
// Problem: UI not updating
// Check 1: State actually changing?
console.log('Before:', state);
setState(newValue);
console.log('After:', state); // Still old? Async!

// Check 2: Component re-rendering?
console.log('Render:', Date.now());

// Check 3: Deps array correct?
useEffect(() => {}, [correctDeps]);
```

## Best Practices

### Do's
- ✅ Use TypeScript strictly
- ✅ Handle all error cases
- ✅ Test on real devices
- ✅ Document complex logic
- ✅ Commit working code frequently

### Don'ts
- ❌ Commit API keys
- ❌ Use relative paths
- ❌ Ignore platform differences
- ❌ Leave console.logs in production
- ❌ Make assumptions about environment

## Future Roadmap

### Near Term (Next Sprint)
- [ ] Add conversation history
- [ ] Implement rate limiting
- [ ] Add user preferences
- [ ] Improve error messages

### Medium Term (Next Month)
- [ ] Multi-provider support (Anthropic, Google)
- [ ] Image input support
- [ ] Voice input/output
- [ ] Offline mode

### Long Term (Next Quarter)
- [ ] User accounts
- [ ] Conversation sharing
- [ ] Custom AI models
- [ ] Plugin system

---

**Remember**: Good code is code that works, is maintainable, and can be understood by others (including future you)!