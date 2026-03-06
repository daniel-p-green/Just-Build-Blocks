# PRD: Just Build with Blocks Signature Product

Date: 2026-03-06
Repository: Just-Build-Blocks
Working stack: React, Vite, TypeScript, Vitest

## Problem Statement

Turning a logo or brand idea into a believable block set usually requires several disconnected steps: concept art, packaging mockups, separate model work, separate motion work, and manual storytelling. This product should collapse that process into one system. A user should be able to start from an image or a brand name and leave with a buildable premium block set, a complete export bundle, and a Remotion 3D film with sound.

## Goals

- Goal 1: turn any recognizable logo, brand name, or short concept into a buildable premium block-set object.
- Goal 2: wrap that object in an original set-box, studio, and instruction experience that feels complete and product-grade.
- Goal 3: export a deterministic bundle that can drive stills, instructions, model files, and a Remotion 3D video with sound from one shared source of truth.

## Non-Goals

- Non-goal 1: full sandbox authoring, arbitrary brick dragging, or general-purpose CAD editing.
- Non-goal 2: retail commerce, real-world fulfillment, or official brand licensing.
- Non-goal 3: source-identical imitation of iconic toy-brand packaging, instruction systems, or naming conventions.

## Users and Context

- Primary user: a creative builder, brand operator, or design-minded reviewer who wants a believable flagship artifact, not just a loose idea.
- Secondary user: an internal OpenAI/Codex audience reviewing the product as a premium storytelling and demo surface.
- Key usage context: a local or shareable product demo where the first frame, the build object, and the final film all need to feel intentional and complete.

## Requirements

### Functional

1. The app must accept image upload and prompt-based input, including a brand name or short description.
2. The system must normalize those inputs into a canonical build pipeline rather than separate product branches.
3. The system must derive a buildable set specification and model representation with stable parts, transforms, assemblies, and bounds.
4. The app must render an original premium set-box reveal for the generated set.
5. The app must provide a guided 3D builder-studio view tied to the same build phases as the model and instructions.
6. The system must produce an original instruction-book style artifact with step order, part callouts, and readable pacing.
7. The system must export machine-readable bundle artifacts, including scene data, manifests, and model files such as `.mpd` and `.io`.
8. The system must render Remotion stills and a Remotion 3D film from the same semantic build data.
9. The film pipeline must support synchronized sound cues and feel complete without external editing to be understandable.
10. The app must let the user download the major keepsakes: stills, instruction artifact, manifests, scene data, and the core model bundle.

### Non-Functional

1. Determinism: the same normalized input should produce the same set spec, model, and export bundle unless a deliberate version change is introduced.
2. Completeness: the product surfaces should feel like parts of one system, not unrelated demos.
3. Performance: the default path should stay responsive on a modern laptop, with graceful fallbacks for expensive rendering work.
4. Accessibility: the upload flow, major controls, and export actions must be keyboard reachable and clearly labeled.
5. Brand/legal safety: the output should evoke premium studded block-set confidence without official names, logos, or copied layouts.

## Acceptance Criteria

1. Given a user uploads a valid logo image, when processing completes, then they receive a buildable set identity with a premium set-box view, a guided studio view, and export-ready model data.
2. Given a user enters a brand name or short prompt, when generation completes, then they reach the same downstream set, instruction, and export surfaces as image input.
3. Given a set is generated, when exports are downloaded, then manifests, instructions data, scene data, `.mpd`, and `.io` are internally consistent.
4. Given a film render is produced, when it is reviewed, then the visuals, build phases, and sound cues all match the same set data.
5. Given the result is viewed without explanation, when a reviewer sees the first frame and final film, then the product feels premium, complete, and toy-native without direct brand copying.

## UX Notes

- Key user flow: land on the page, upload or describe a brand, watch the premium set box resolve, inspect the guided studio and instructions, export the bundle, and render the film.
- Visual system: keep the OpenAI shell calm, let the `BLOCKS` wrapper carry color and joy, and keep the hero object disciplined and collectible.
- Empty and error states: the empty state should imply product possibility; failures should be short, recoverable, and never collapse the whole experience.

## Rollout and Measurement

- Rollout strategy: flagship local product build, then shareable internal demo with rendered stills and film.
- Success metric: a recognizable logo or brand name can become a believable set, consistent exports, and a share-worthy sound-led film without manual reconstruction.
- Guardrail metric: avoid outputs that feel counterfeit, generic, or visually noisy enough to weaken the premium product read.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Wrapper quality outruns model credibility | High | Make deterministic set spec and export validity the gating milestone before polish work |
| Output feels too close to a known retail toy brand | High | Keep all marks, labels, layouts, and instruction language original while preserving only broad category familiarity |
| Film becomes a stitched montage disconnected from the build | High | Drive film scenes and sound cues from the same canonical model and build phases |
| Prompt path feels less grounded than image path | Medium | Force both inputs through the same normalized set pipeline and quality checks |
