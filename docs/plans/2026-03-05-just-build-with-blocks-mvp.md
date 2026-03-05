# Just Build with Blocks MVP Implementation Plan

Date: 2026-03-05
Repository: Just-Build-Blocks
Feature slug: just-build-with-blocks-mvp

> Required workflow:
> 1) Define success criteria
> 2) If non-trivial, write a 3-step plan before code
> 3) Implement with test-first discipline

## Goal

Deliver a local web MVP that turns an uploaded logo into a stylized block-built hero still, exposes block counts, and generates three Remotion-ready story arcs.

## Inputs

- `docs/discovery/idea-brief.md`
- `docs/product/prd.md`
- `docs/product/jtbd.md`
- `docs/product/use-cases.md`
- `docs/engineering/test-strategy.md`

## Execution Plan (3 Steps)

1. Scaffold the frontend stack, document the MVP contract, and lock test-first coverage for the transformation engine.
2. Implement the block engine, hero composition model, and exportable scene/story data.
3. Build the upload-driven interface, verify lint/tests/build, and capture remaining risk for the later Remotion phase.

## Task Breakdown

### Task 1

- Files to modify: `package.json`, `src/lib/block-engine.ts`, `src/lib/block-engine.test.ts`
- Tests to add first: palette quantization, grid generation, transparent pixel handling, story arc generation
- Definition of done: the core transformation engine is covered by passing Vitest tests

### Task 2

- Files to modify: `src/App.tsx`, `src/App.css`, `src/index.css`, `src/main.tsx`
- Tests to add first: reuse the block-engine tests before UI wiring
- Definition of done: a user can upload a logo and see a polished block-built hero result with counts and export actions

### Task 3

- Files to modify: `AGENTS.md`, product docs, any export helpers
- Tests to add first: none beyond core utility coverage for MVP; rely on manual verification for the visual layer
- Definition of done: docs, commands, and verification steps match the implemented repo state

## Verification Commands

- Dev: `npm run dev`
- Test: `npm test`
- Lint: `npm run lint`
- Build: `npm run build`

## Risk Notes

- Risk 1: visual polish may matter more than algorithmic fidelity for this concept, so the styling layer has outsized importance.
- Risk 2: without a Remotion composition in this pass, the exported story arcs are only a bridge into the next phase, not the final film.

## Retrospective Prompt

What would we do differently next time to reduce risk or increase delivery speed?
