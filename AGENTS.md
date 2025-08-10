# Repository + Agent Operations

## Project Structure & Module Organization
- `App.js`: Root React Native component with swipeable modality lists.
- `index.js`: App registry entry for Expo.
- `__tests__/`: Jest-style tests (example: `App.test.js`).
- `app.json`: Expo configuration; adjust app name/bundle IDs here.
- `.vibe/`: Internal notes; not shipped with the app.

## Current Milestone: Loading → Stacked Chat I/O ✅
- **Completed**: 3s in-app loading (logo + centered title), then a chat-first interface.
- **UI Implemented**: Two stacked, swipeable blocks with enhanced animations:
  - Input section (text, audio, photo, video) with smooth scale/opacity transitions
  - Output section (chat, TTS, image) with visual depth effects
- **Behavior**: Full pass-through routing from any input to any output with appropriate formatting
- **Enhancements Delivered**:
  - Animated StackPager with interpolated transforms
  - Enhanced ModalityCard with shadows and responsive styling
  - Smart Send functionality with emoji indicators for media types
  - Complete test coverage for loading overlay and UI rendering
- Reference plan: see `.vibe/TASKS.md` for completed sequence.

## Build, Test, and Development Commands
- `npm start`: Launch Expo dev server on port 8081 (offline).
- `npm run android` / `npm run ios` / `npm run web`: Open the app on the target platform via Expo.
- Tests: Jest is suggested but not wired by default. Add a `test` script in `package.json` to enable (`"test": "jest"`), then run `npm test`.

## Coding Style & Naming Conventions
- Indentation: 2 spaces; prefer single quotes and semicolons (match existing files).
- Components: PascalCase (`App.js`), modules/variables: camelCase; tests: `__tests__/*.test.js`.
- Formatting/Linting: Prettier/ESLint not configured; if added, run `npx prettier --write .` and `npx eslint .` before commits.

## Testing Guidelines
- Framework: Jest with `react-test-renderer` works well for RN components.
- File naming: `*.test.js` under `__tests__/` (e.g., `__tests__/App.test.js`).
- Coverage: Aim for smoke tests of screens/components and basic behavior (e.g., selected modality changes on swipe). Add a `jest.config.js` if needed.

## Commit & Pull Request Guidelines
- Commits: Follow Conventional Commits when possible (e.g., `feat: add image output`, `fix: correct swipe index`, `chore: initialize expo app skeleton`).
- PRs: Include a clear description, linked issue, test plan, and screenshots/GIFs for UI changes. Keep PRs small and focused.

## Security & Configuration Tips
- Do not commit secrets. Use environment config via Expo (`app.json` or `app.config.js`) and local `.env` files ignored by Git.
- Port: The dev server uses `8081`. If you change ports/flags, update scripts consistently.
- Dependencies: Prefer minimal additions; justify new packages in the PR description.

---

## Codex Agent Strategy
- Context discipline: Keep prompts short, role-tagged, and reference file paths directly. Prefer explicit inputs/outputs over vague goals.
- Planning: Use the plan tool with 3–6 meaningful steps. Keep exactly one step in progress.
- Checkpoints: After non-trivial edits, summarize changes and next action in 1–2 sentences.
- Safety: Avoid destructive shell actions. Ask for escalation before networked installs or global/system changes.
- Minimalism: Make the smallest viable change that satisfies the task. Defer refactors unless required.

## tmux Team Collaboration
- Overview: Multiple Codex agents run in separate `tmux` windows as “team members”. Communication uses `tmux send-keys` and reading panes.
- Session name: Use `codex-team`. Windows: `lead`, `integrator`, `features`, `qa`, `docs`.
- Helper script: Use `bash scripts/team_tmux.sh kickoff` to bootstrap windows and seed role prompts/tasks. See `scripts/team_tmux.sh --help`.
- Create team:
  - `tmux new-session -d -s codex-team -n lead`
  - `tmux new-window -t codex-team -n integrator`
  - `tmux new-window -t codex-team -n features`
  - `tmux new-window -t codex-team -n qa`
  - `tmux new-window -t codex-team -n docs`
- Launch agents: Start Codex/CLI in each window with a role prompt, for example: `codex --role LEAD` (or paste the role prompt manually).
- Send a message: `tmux send-keys -t codex-team:integrator "[LEAD] Install packages per .vibe/TASKS.md" C-m`
- Tail output:
  - Attach interactively: `tmux attach -t codex-team`
  - Non-interactive snapshot: `tmux capture-pane -pt codex-team:integrator -S -200`
- Default allowance: Codex may send keys to role windows and read/tail panes. Escalate before network installs or commands that modify the environment.

### Milestone Runbook (quick)
- `[LEAD]` Kick off team; align on `.vibe/TASKS.md`.
- `[FEATURES]` Implement 3s loading overlay and stacked swipe UI in `App.tsx`.
- `[QA]` Add tests: loading overlay hides after timers run; basic render of stacks.
- `[DOCS]` Refresh README (usage flow) and note troubleshooting for loading/swipe.
- `[LEAD]` Verify on web/emulator; capture a screenshot/GIF.

## Role Prompts (short system guidance)
- LEAD: Owns plan, sequencing, and handoffs. Enforces minimal-change policy and coordinates blockers.
- INTEGRATOR: Handles dependency adds, config, and scripts. Verifies builds after installs.
- FEATURES: Implements app code using new capabilities. Provides focused diffs and smoke demos.
- QA: Adds/updates Jest smoke tests. Verifies imports, basic renders, and CI scripts.
- DOCS: Updates README/AGENTS, usage notes, and developer onboarding. Keeps commands copy-pastable.

## Task Assignments (from .vibe/TASKS.md)
- INTEGRATOR: No new packages; confirm dev server and tests run.
- FEATURES: Implement tasks 2–6 (loading overlay, chat-first shell, stacked swipe, wiring, polish).
- QA: Implement task 7 tests (loading timeout + basic render).
- DOCS: Implement task 8 docs (README/AGENTS updates, troubleshooting).
- LEAD: Own task 1 (UX spec) and task 9 (verification, sign-off).

## Example tmux Runbook
- Bootstrap team: create session and windows as above.
- Seed prompts: send role reminders to each window using `tmux send-keys`.
- Focused milestone flow:
  - `[LEAD→FEATURES]` “Implement 3s loader + stacked swipe per .vibe/TASKS.md.”
  - `[LEAD→QA]` “Add loading timeout + render smoke tests.”
  - `[LEAD→DOCS]` “Update README usage for new flow.”
- Monitor: use `capture-pane` on `features` and `qa` to watch progress.
- Handoffs: after FEATURES lands, unblock QA and DOCS; LEAD validates on web.

For deeper operational notes and prompt templates, see `.vibe/AGENT_WORKING_KNOWLEDGE.md`.

---

# GPT‑5 Prompting Guide (Adapted for This Repo)

Overview
- Goal: Standardize high‑signal prompts for GPT‑5 and sibling models used by our LEAD/INTEGRATOR/FEATURES/QA/DOCS roles.
- Reference: See `.vibe/docs/prompting-gpt5.md` for the full guide; this section provides quick templates and expectations.

Core Rules
- Be explicit about objectives, constraints, and expected outputs.
- Ground instructions in concrete files and acceptance criteria.
- Make the smallest viable change; avoid refactors unless required.
- Use `apply_patch` for edits and `update_plan` for progress; include a brief preamble before tool calls.

Role Prompt Templates
- LEAD
  - Intent: Plan steps, owners, and checks; keep one in‑progress step.
  - Output: 3–6 step plan, risks, and the next action.
- INTEGRATOR
  - Intent: Scripts/config updates with verification.
  - Output: Focused diffs + run commands, no network unless approved.
- FEATURES
  - Intent: Implement scoped UI/logic with tests.
  - Output: Minimal patch, brief decisions, and smoke test notes.
- QA
  - Intent: Add smoke/behavior tests.
  - Output: Test files + `npm test` expectations.
- DOCS
  - Intent: Refresh README/notes.
  - Output: Concise sections + cross‑links.

Output Modes
- Prose: Concise bullets grouped by topic.
- JSON: Provide only the requested keys (no extras); declare schema when needed.
- Patch: Only necessary hunks; don’t reformat unrelated code.

Safety & Sandbox
- No secrets; avoid destructive shell actions; escalate for network installs.
- Acknowledge limitations (network‑restricted); don’t fabricate external facts.

Cross‑Links
- Full prompting guide: `.vibe/docs/prompting-gpt5.md`
- Team Lead notes: `.vibe/docs/team-lead-session.md`
- Agent schema and filtering: `.vibe/docs/agents.md`
