# PRD: Just Build with Blocks MVP

Date: 2026-03-05
Repository: Just-Build-Blocks
Working stack: React, Vite, TypeScript, Vitest

## Problem Statement

Codex can feel abstract or intimidating to non-technical people. This MVP reframes creation as something familiar and playful by transforming any uploaded logo into a polished block-built brand mark. The moment matters now because the output is intended to seed a same-day concept demo and later become the visual foundation for a Remotion film about building with GPT and Codex.

## Goals

- Goal 1: convert a user-supplied logo or brand image into a distinctive block-built hero still with minimal friction.
- Goal 2: generate three story arcs from the same transformed data so the still can evolve into a later Remotion narrative.

## Non-Goals

- Non-goal 1: precise real-world build instructions, piece sourcing, or manufacturing-grade brick counts.
- Non-goal 2: robust backend orchestration, authentication, or a polished production deployment surface.

## Users and Context

- Primary user: a creative non-technical builder exploring what is possible with AI.
- Secondary user: an internal OpenAI/Codex audience reviewing the concept as a shareable demo.
- Key usage context: a fast, live demo or design review where the visual result must feel magical immediately.

## Requirements

### Functional

1. The app must let a user upload a brand mark or logo image directly from the browser.
2. The app must transform the uploaded image into a stylized block grid using a curated toy-block palette.
3. The app must render a polished hero still that combines the block grid, background treatment, and framing copy.
4. The app must show visible block counts by palette color.
5. The app must generate three narrative story arcs derived from the uploaded brand and transformed output.
6. The app must let the user download the hero still and the generated scene data.

### Non-Functional

1. Performance: a typical logo should process and render in a few seconds on a modern laptop.
2. Reliability: the app should gracefully handle unsupported files, empty uploads, and images with transparency.
3. Accessibility: the upload flow and exported result controls must be keyboard reachable and have clear labels.
4. Security: the MVP should avoid unnecessary network dependencies and process images locally in the browser.

## Acceptance Criteria

1. Given a user uploads a valid logo image, when processing completes, then the app shows a block-built hero still, block counts, and a set of three story arcs.
2. Given a user is happy with the result, when they click export, then they can download the generated still and JSON scene data for later video work.
3. Given a user uploads a logo with transparent regions, when the block grid is computed, then transparent pixels do not pollute the visible block colors.

## UX Notes

- Key user flow: land on the page, upload a logo, watch the hero still appear, review block counts and story arcs, export assets.
- Empty and error states: the empty state should feel aspirational; file validation errors should be short, friendly, and recoverable.
- Analytics events: out of scope for this MVP.

## Rollout and Measurement

- Rollout strategy: local prototype for internal review and screen capture.
- Success metric: at least one upload path produces a share-worthy hero still and storyboard output without manual code edits.
- Guardrail metric: avoid visual results that feel generic, muddy, or too engineering-heavy to support the concept.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Stylized output looks cheap instead of magical | High | Use a constrained palette, lighting, and composition that feel intentional and toy-like rather than literal pixel art |
| The MVP drifts into precision/buildability work | High | Keep the UI and docs focused on concept proof, not real-world instructions |
