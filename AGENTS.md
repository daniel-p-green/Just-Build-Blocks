# AGENTS.md

## Project Snapshot

- Repository: Just-Build-Blocks
- Stack: React, Vite, TypeScript, Vitest

## Daily Workflow Contract

1. Start every task with success criteria:
- Done means `the upload flow produces a visually strong block-built result and the requested core behavior is implemented`
- Tested by `npm test`, `npm run lint`, `npm run build`, plus a quick manual browser pass for visual work
- No changes to `unrelated experiments, generated assets, or future Remotion storytelling scope unless explicitly requested`

2. For non-trivial work:
- Write a 3-step plan first
- Then execute

3. Name workflow skills explicitly when needed:
- `test-driven-development` before implementing features or bug fixes
- `systematic-debugging` before proposing fixes for failures
- `requesting-code-review` before merge or handoff

4. Verification is required before completion:
- Lint: `npm run lint`
- Test: `npm test`
- Build: `npm run build`
- Include a short risk summary

5. End each task with a brief retrospective:
- What would we do differently next time?

## Commands

- Dev: `npm run dev`
- Test: `npm test`
- Lint: `npm run lint`
- Build: `npm run build`

## Guardrails

- Prefer minimal, reversible changes
- Do not ship without updated tests
- Document assumptions and open questions in the relevant doc before coding
