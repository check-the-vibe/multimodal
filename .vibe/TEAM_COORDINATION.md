# Team Coordination Document

## Active Agents & Assignments

### Agent 1: Card Definition Specialist (Claude - card-definition)
**Session**: `tmux attach -t card-definition`
**Status**: Working
**Tasks**:
- Define base card interface with collapsed/expanded states
- Define common types (InputType, OutputType, CardState)
- Define card template structure  
- Define all input card specifications
- Define Agent card interface and settings
- Define all output card specifications
- Define card communication protocol
**Deliverable**: `.vibe/docs/card-specifications.md`

### Agent 2: AI SDK Research Specialist (Codex - ai-sdk-research)  
**Session**: `tmux attach -t ai-sdk-research`
**Status**: Working
**Tasks**:
- Document all supported input modalities in AI SDK
- Document all supported output modalities
- Document OpenAI-specific capabilities
- Create modality compatibility matrix
**Deliverable**: `.vibe/docs/ai-sdk-modalities.md`

### Agent 3: Input Cards Implementation (Claude - input-cards)
**Session**: `tmux attach -t input-cards`
**Status**: Working
**Tasks**:
- ImageInputCard (camera/gallery/URL support)
- AudioInputCard (recording/upload)
- FileInputCard (document picker)
- DrawingInputCard (canvas/sketch)
- ClipboardInputCard (paste rich content)
**Directory**: `components/modality/input/`

### Agent 4: Output Cards Implementation (Codex - output-cards)
**Session**: `tmux attach -t output-cards`
**Status**: Working
**Tasks**:
- ImageOutputCard (display generated images)
- CodeOutputCard (syntax highlighting)
- TableOutputCard (structured data)
- ChartOutputCard (data visualization)
- FileOutputCard (downloads)
**Directory**: `components/modality/output/`

### Agent 5: Agent Section & Settings (Claude - agent-settings)
**Session**: `tmux attach -t agent-settings`
**Status**: Working
**Tasks**:
- Restore Agent section in UI layout
- Create AgentCard component
- Implement Agent Settings Panel
- Wire Agent configuration to API calls
- Implement comprehensive settings management
**Components**: AgentCard, Settings Panel

## Coordination Points

### Dependencies
1. Agent 3 & 4 depend on Agent 1's card specifications
2. Agent 5 needs to integrate with Agent 2's API research
3. All implementation agents should follow patterns from Agent 1

### Shared Resources
- **Types**: `components/types.ts` - coordinate type definitions
- **API Client**: `services/agentClient.ts` - coordinate API changes
- **Main App**: `App.tsx` - coordinate UI layout changes

### Communication Protocol
1. Check this document for updates
2. Avoid conflicting file edits
3. Follow existing patterns in codebase
4. Test changes before completing tasks

## Progress Tracking

### Completed
- ✅ Team setup and task distribution
- ✅ All agents started and assigned tasks

### In Progress  
- [ ] Card specifications documentation (Agent 1)
- [ ] AI SDK capabilities research (Agent 2)
- [ ] Input cards implementation (Agent 3)
- [ ] Output cards implementation (Agent 4)
- [ ] Agent section restoration (Agent 5)

### Pending
- [ ] Integration testing
- [ ] Documentation updates
- [ ] Final review and cleanup

## Commands for Monitoring

```bash
# Check agent progress
tmux capture-pane -t [session-name] -p | tail -30

# List all sessions
tmux list-sessions

# Attach to a session
tmux attach -t [session-name]

# Check recent file changes
git status
find . -type f -mmin -10 -name "*.tsx" -o -name "*.ts" -o -name "*.md"
```

## Notes
- All agents should read CLAUDE.md for project guidelines
- Follow existing code patterns and conventions
- Ensure React Native/Expo compatibility
- Test on both web and mobile platforms when possible