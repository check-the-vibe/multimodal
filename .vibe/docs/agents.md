Title: Agent Capabilities and Filtering

Related
- Team Lead session notes: `./team-lead-session.md`

Overview
- Agents sit between Inputs and Outputs. They accept certain input capabilities and can produce certain outputs.
- The UI filters Agents based on the selected Input; selecting an Agent filters Outputs to those it can produce.

Input Types vs Capabilities
- UI Input Types: `text`, `audio`, `photo`, `video`.
- Capability Mapping: `text → text`, `audio → audio`, `photo → image`, `video → video`.

Output Types
- `chat` (text), `audio` (TTS), `image` (bitmap).

Agent Schema
- id: string
- name: string
- accepts: ('text'|'audio'|'image'|'video')[]
- produces: ('chat'|'audio'|'image')[]
- comingSoon?: boolean
- description?: string

Examples (coming soon)
1) Vision-LLM
- id: `vision-llm`
- accepts: `text`, `image`
- produces: `chat`
- description: "Vision + text reasoning"
- comingSoon: true

2) ImageGen-X
- id: `imagegen-x`
- accepts: `text`
- produces: `image`
- description: "Text-to-image generation"
- comingSoon: true

3) AudioAssistant
- id: `audio-assistant`
- accepts: `audio`, `text`
- produces: `audio`, `chat`
- description: "Audio-centric assistant"
- comingSoon: true

Filtering Rules
- visibleAgents = agents.filter(a => a.accepts.includes(mapInput(selectedInput)))
- visibleOutputs = outputTypes.filter(o => selectedAgent.produces.includes(o))
- If the previously selected indices are out of bounds after filtering, clamp to 0.
- Gate actions if agent.comingSoon === true (show alert/toast and block send).

UI Notes
- Agent section mirrors Inputs/Outputs: pager + dots + section header.
- AgentCard should show accepts/produces badges and a "Coming soon" pill when disabled.
- Selecting an agent that yields no outputs should be prevented by filtering; ensure at least one output remains selectable.
