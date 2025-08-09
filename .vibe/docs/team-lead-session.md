# Team Lead Session Notes — Milestone A ✅ / Milestone B ▶︎

## Context
- Scope: Coordinate milestone flow, enforce minimal-change policy, and unblock roles.
- Repo state: Milestone A (Loading → Stacked Chat I/O) is implemented in `App.tsx` and related components with tests in `__tests__/`.
- Reference: See `.vibe/TASKS.md` for the active sequence and acceptance criteria.

## What’s Shipped (Milestone A)
- Loader: In‑app overlay shows for 3s on launch; native splash hides on first layout.
- Landing UI: Chat‑first, with two stacked panels — Input (top) and Output (bottom).
- Routing: Text input sends to chat output; incremental stream via `services/agentClient.streamChat` (mock or AI SDK fallback).
- Polish: Responsive layout, subtle depth, and keyboard ergonomics (`KeyboardAvoidingView`).
- Tests: Jest preset `jest-expo`; smoke and behavior tests under `__tests__/`.

## Quick Verify
- Dev server: `npm start` (Expo on port 8081). Web: `npm run web`.
- Send flow: Tap Input → type → Send → Output expands and streams response.
- Tests: `npm test` (uses `jest-expo`).

## Decisions
- Keep dependencies minimal; no new packages for Milestone A.
- Use in‑app loader instead of extending native splash duration.
- Stub streaming via `agentClient.streamChat`; gracefully fallback when AI SDK disabled.

## Milestone B — Agent Section & Filtering
- Insert Agents between Inputs and Outputs.
- Filter Agents by selected Input capability; filter Outputs by selected Agent `produces`.
- “Coming soon” agents appear disabled; gate Send with alert.
- See TASKS “Sequence of Work” for components, state, wiring, QA, and docs.

## Role Handoffs
- FEATURES: Implement AgentCard/AgentPager, state, filtering, and wiring per `.vibe/TASKS.md`.
- QA: Add unit tests for filtering and selection clamping; keep loader + render tests intact.
- DOCS: Update README for Agent filtering and “coming soon” UX; finalize `.vibe/docs/agents.md`.
- INTEGRATOR: No new deps; confirm `npm start` and `npm test` run clean.

## tmux Team Runbook (Lead)
- Create session/windows:
  - `tmux new-session -d -s codex-team -n lead`
  - `tmux new-window -t codex-team -n integrator`
  - `tmux new-window -t codex-team -n features`
  - `tmux new-window -t codex-team -n qa`
  - `tmux new-window -t codex-team -n docs`
- Kickoff prompts (examples):
  - `[LEAD→FEATURES] Implement 3s loader + stacked swipe (Milestone A).`
  - `[LEAD→QA] Add loading timeout + render smoke tests.`
  - `[LEAD→DOCS] Update README usage for new flow.`
- Monitor:
  - `tmux capture-pane -pt codex-team:features -S -200`
  - `tmux capture-pane -pt codex-team:qa -S -200`

## Sign‑off Checklist (A)
- [x] Loader overlay persists 3s reliably.
- [x] Chat‑first shell renders; Input expands on tap.
- [x] Send routes to Output; streaming updates visible.
- [x] No crashes across web/iOS/Android surfaces (basic smoke).
- [x] Tests pass locally with `jest-expo`.

## Open Items / Risks
- Streaming: Non‑streaming AI SDK path simulates chunks; revisit once server streaming stabilizes.
- Milestone B: Ensure indices clamp when filtered lists shrink; guard “coming soon” flow.

## Pointers
- Core UI: `App.tsx`, `components/LoadingOverlay.tsx`, `components/modality/*`, `components/composer/ChatComposer.tsx`.
- Services: `services/agentClient.ts`, `services/config.ts`.
- Tasks: `.vibe/TASKS.md`. Docs: `.vibe/docs/*`.

