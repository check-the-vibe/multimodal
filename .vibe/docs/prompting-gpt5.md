Title: GPT‑5 Prompting Guide (Adapted for This Repo)

Overview
- Purpose: Provide consistent, high‑signal prompts for GPT‑5 across roles (LEAD, INTEGRATOR, FEATURES, QA, DOCS) in this codebase.
- Principles: Be explicit, ground in files, constrain outputs, and prefer minimal, testable changes.
- Tooling: This environment supports `apply_patch`, `update_plan`, and limited `shell` usage (workspace‑write, network restricted).

Core Prompt Structure
- System: Role, goals, constraints, and safety rules.
- Developer: Repo‑specific rules (paths, coding standards, test strategy).
- User: Concrete task with acceptance criteria and file references.
- Tools: Allowed tools, when to use them, preamble before calls.
- Output: Exact format expectations (e.g., JSON only, or patch only).

General Best Practices
- Objective: State the goal in one sentence before acting.
- Constraints: List OS/env limits, network status, sandboxing, and coding style.
- Grounding: Reference exact file paths and lines when possible; avoid speculation.
- Plan: For non‑trivial tasks, propose 3–6 concise steps; keep one step in progress via `update_plan`.
- Changes: Make the smallest viable, reversible change that meets the acceptance criteria.
- Validation: Run or describe targeted tests; do not introduce unrelated changes.
- Safety: Never add secrets; avoid destructive ops; request escalation for network installs.

Tool Use Patterns
- `apply_patch`: Use for all file edits; keep diffs focused and minimal. Do not add license headers.
- `update_plan`: Maintain a terse plan; mark steps completed as you progress; exactly one in_progress.
- `shell`: Prefer read operations; avoid destructive commands; network is restricted.

Output Modes
- Prose: When giving explanations or summaries, keep concise, grouped, and scannable.
- Structured JSON: Provide a schema, forbid extra keys, and output JSON only if requested.
- Patches: Use `apply_patch` format; avoid reformatting unrelated code; include only necessary hunks.

Reasoning Hygiene
- Avoid long chain‑of‑thought in outputs; summarize rationale briefly (bullets) when helpful.
- Ask for missing info only when it blocks progress; otherwise proceed with sensible defaults.
- Do not fabricate external facts; if network‑blocked, note it and continue with local context.

Role Templates (Short)
- LEAD (planning/coordination):
  Goal: Define steps, owners, and acceptance; enforce minimal‑change policy.
  Output: Brief plan (3–6 steps), risks, next unblocked action.
- INTEGRATOR (deps/config):
  Goal: Manage installs, scripts, configs; verify builds.
  Output: Diff to scripts/config; quick runbook; post‑install checks.
- FEATURES (implementation):
  Goal: Add/modify component logic with tests; keep scope tight.
  Output: Focused patch; notes on decisions; smoke test guidance.
- QA (tests):
  Goal: Add minimal tests for behavior/edge cases.
  Output: New/updated test files; run instructions; expected assertions.
- DOCS (docs):
  Goal: Update README/notes with usage, troubleshooting, and links.
  Output: Concise sections; copy‑pastable commands; cross‑links.

Few‑Shot Examples
1) Plan + Patch (FEATURES)
  - Propose: “1) Add prop; 2) Update handler; 3) Adjust styles; 4) Add test.”
  - Patch only `App.tsx` and a targeted test under `__tests__/`.
2) JSON‑Only (QA)
  - Return `{ "tests": [{ "file": "__tests__/x.test.ts", "cases": [ ... ] }] }` with no extra keys when asked.

Multimodal Guidance
- Inputs: text, audio, photo, video; Outputs: chat, audio, image.
- Refer to assets under `assets/` by path; include alt text when describing images.
- Avoid fetching remote assets; simulate via provided stubs.

Model Selection
- Default: `gpt-5` for complex reasoning or planning; `gpt-4o`/`o4-mini` for speed/cost.
- Use JSON/structured outputs for settings and tool arguments to reduce ambiguity.

Testing & Acceptance
- Tests: Prefer `jest-expo` smoke/behavior tests colocated in `__tests__/`.
- Acceptance: Reiterate the criteria in one short list and ensure the patch satisfies them.

Common Anti‑Patterns
- Over‑editing unrelated files, adding dependencies without justification, or producing verbose, unfocused explanations.
- Returning explanations when the task asks for “JSON only” or a patch only.

References
- Team Lead session notes: `./team-lead-session.md`
- Agents and filtering: `./agents.md`
- Component contracts: `./components.md`

