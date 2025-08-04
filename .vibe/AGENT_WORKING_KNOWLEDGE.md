# Agent Working Knowledge

This document captures practical, copy-pastable guidance for Codex agents collaborating via `tmux`, managing prompts, and shipping changes in this repo.

## Prompt Management
- Keep prompts role-scoped and concise. Start messages with `[ROLE]` to make routing explicit.
- Include the immediate objective, constraints, and expected artifacts (files/commands).
- Cite exact file paths and commands using backticks.
- Prefer stepwise progress: propose → confirm → apply minimal change → summarize.
- Use short, verifiable assumptions. Ask when in doubt instead of guessing.

### Role Prompt Templates
- LEAD (system):
  - "You are the LEAD. Own the plan, sequence tasks, and coordinate handoffs. Keep exactly one in-progress step. Enforce minimal, safe changes."
- INTEGRATOR (system):
  - "You are the INTEGRATOR. Manage dependency installs, configs, and scripts. Use the smallest set of packages. Request approval before networked installs."
- FEATURES (system):
  - "You are the FEATURES engineer. Implement app code leveraging new modules. Provide focused diffs and smoke-level usage. Avoid speculative refactors."
- QA (system):
  - "You are QA. Add/maintain Jest smoke tests. Verify modules import without throwing and core components render. Keep tests fast and isolated."
- DOCS (system):
  - "You are DOCS. Update README/AGENTS with clear usage instructions and troubleshooting. Keep examples copy-pastable."

## tmux Collaboration
- Session: `codex-team`; Windows: `lead`, `integrator`, `features`, `qa`, `docs`.
- Create session:
  - `tmux new-session -d -s codex-team -n lead`
  - `tmux new-window -t codex-team -n integrator`
  - `tmux new-window -t codex-team -n features`
  - `tmux new-window -t codex-team -n qa`
  - `tmux new-window -t codex-team -n docs`
- Send message: `tmux send-keys -t codex-team:integrator "[LEAD] Run installs per .vibe/TASKS.md" C-m`
- Tail a window:
  - Interactive: `tmux attach -t codex-team`
  - Snapshot: `tmux capture-pane -pt codex-team:features -S -200`

## Expo Module Installs (from .vibe/TASKS.md)
- Combined install (preferred):
  - `npx expo install expo-av expo-video expo-camera expo-image-picker expo-media-library expo-file-system expo-speech`
- Verification:
  - `npm start` and load platform target. Fix any missing peer deps suggested by Expo.
  - Ensure `app.json` contains necessary permissions for camera/mic on native builds.

## Minimal Usage Stubs
- In `App.tsx` (TypeScript), import modules guarded by platform checks as needed:
  - `import { Audio } from 'expo-av'`
  - `import { CameraView } from 'expo-camera'` (SDK 51+ `expo-camera` naming)
  - `import { launchImageLibraryAsync } from 'expo-image-picker'`
  - `import * as MediaLibrary from 'expo-media-library'`
  - `import * as FileSystem from 'expo-file-system'`
  - `import * as Speech from 'expo-speech'`
- Render small buttons to trigger a no-op call (e.g., `Speech.speak('Hello')`) to validate integration without UI complexity.

## QA Smoke Tests (Jest)
- Ensure `package.json` has `"test": "jest"` and install `jest` tooling if needed.
- Add tests under `__tests__/` to `require()` or `import()` the new modules and assert they are defined.
- Use platform-agnostic tests; don’t require device features in unit tests.

## Safety & Approvals
- Ask for approval before running networked or environment-altering commands.
- Never use destructive commands in `send-keys` (e.g., `rm -rf`). Prefer explicit file changes with diffs.

## Example Kickoff Sequence
1. `[LEAD]` Create tmux team, seed prompts to all windows.
2. `[LEAD→INTEGRATOR]` Send the combined `expo install` command.
3. `[LEAD→FEATURES]` After installs, request creation of minimal usage stubs in `App.tsx`.
4. `[LEAD→QA]` Request smoke tests for module imports and a basic render.
5. `[LEAD→DOCS]` Update README and AGENTS with added modules and troubleshooting.
6. `[LEAD]` Review outputs via `capture-pane`, then iterate or close.

