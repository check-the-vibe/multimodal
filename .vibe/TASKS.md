Title: Milestones – Loading, Stacked I/O, and Agent Filtering

Overview
- Milestone A: 3s in‑app loading, then a chat‑first landing with two vertically stacked swipeable blocks: Inputs (top) and Outputs (bottom).
- Milestone B: Insert an Agent section between Inputs and Outputs. Agents filter based on the selected Input; selected Agent further filters the Outputs.
- Approach: Component‑first. Define contracts, scaffold components, wire logic, then polish and test.

Component‑First Approach
- Design and document primitives in `.vibe/docs/components.md` and `.vibe/docs/agents.md`.
- Build small, reusable components: pager, card, dots, composer, and new agent components.
- Keep logic (filtering, mapping) minimal and explicit; prefer derived state.

Milestone A (done/ongoing)
1) Loading screen overlay (3s)
2) Stacked swipe UI for Inputs and Outputs
3) Chat composer and pass‑through routing
4) Visual polish and iOS ergonomics (KeyboardAvoidingView)
5) QA tests for loading + render
6) Docs/AGENTS updates

Milestone B – Agent Section and Filtering

Goal
- Add a middle Agent section (between Inputs and Outputs) with swipeable selection.
- Filter agents by the currently selected input’s capability; filter outputs by the selected agent’s produces.
- Include a few “coming soon” agents to validate the UX and filtering.

Key Types & Mapping
- UI inputs: `text`, `audio`, `photo`, `video`.
- Capability mapping: `text → text`, `audio → audio`, `photo → image`, `video → video`.
- Outputs: `chat`, `audio`, `image`.
- Agent type:
  - `id: string`
  - `name: string`
  - `accepts: ('text'|'audio'|'image'|'video')[]`
  - `produces: ('chat'|'audio'|'image')[]`
  - `comingSoon?: boolean`
  - `description?: string`

Example Agents (all coming soon)
- `vision-llm`: accepts `text`,`image`; produces `chat`.
- `imagegen-x`: accepts `text`; produces `image`.
- `audio-assistant`: accepts `audio`,`text`; produces `audio`,`chat`.

Sequence of Work
0) Contracts & Docs (in_progress → completed)
  - Define agent schema and capability mapping in `.vibe/docs/agents.md`.
  - Update this TASKS.md with sequencing and acceptance.
  - Accept: Clear, unambiguous props and mapping.

1) Components (pending)
  - `AgentCard`: name, badges for accepts/produces, optional “coming soon” tag; disabled state.
  - `AgentPager`: reuse `StackPager` + `PaginationDots` with section header.
  - Accept: Swiping selects; disabled agents unselectable; visual selection clear.

2) State & Data (pending)
  - Add `agents` array (examples above) to app state.
  - Add `selectedAgentIndex`; default to first visible agent.
  - Accept: State persists across navigation; indices clamp safely.

3) Filtering Logic (pending)
  - Compute `visibleAgents = agents.filter(a => a.accepts.includes(mapInput(selectedInput)))`.
  - When agent selected: `visibleOutputs = outputTypes.filter(o => selectedAgent.produces.includes(o))`.
  - Clamp `selectedOutputIndex` if it falls outside `visibleOutputs`.
  - Accept: Changing Input updates Agents; changing Agent updates Outputs.

4) Wiring in App.tsx (pending)
  - Insert Agent section between Inputs and Outputs on the landing page.
  - Display badges and “coming soon” state in cards.
  - Gate “Send” if agent is coming soon: show alert.
  - Accept: No crash paths; consistent UX.

4.5) Agent Settings + Streaming (pending)
  - Add Agent settings screen (gear in Agent header) with model picker: `gpt-5` (default), `gpt-4o`, `o4-mini`.
  - Wire Send to use `services/agentClient.streamChat` (stub streaming) to update chat output incrementally.
  - Accept: Model selection persists in state; streaming visibly updates the top chat message.

5) QA (pending)
  - Add unit tests for filtering:
    - Input=text → agents: vision-llm, imagegen-x.
    - Input=photo → agents: vision-llm.
    - Agent=imagegen-x → outputs filtered to image.
  - Accept: Tests pass with `jest-expo` and mocked splash.

6) Docs (pending)
  - `.vibe/docs/agents.md`: finalize examples and mapping table.
  - README: brief usage notes on Agent filtering and “coming soon”.
  - Accept: Docs reflect shipped behavior.

7) Verification (pending)
  - Web + iOS/Android check: swiping/selection + filtered lists; keyboard behavior intact.
  - Accept: Smooth, predictable interactions; visually consistent.

Notes & Guardrails
- Minimal dependencies; no network calls required.
- Derive filtered lists from existing state; avoid duplication.
- Keep styles aligned with existing panels; use existing StackPager.
