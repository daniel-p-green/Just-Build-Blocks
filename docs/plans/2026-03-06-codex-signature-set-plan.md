# Codex Signature Set Plan

Date: 2026-03-06
Repository: Just-Build-Blocks
Feature slug: codex-signature-set

> Required workflow:
> 1) Define success criteria
> 2) If non-trivial, write a 3-step plan before code
> 3) Implement with test-first discipline

## Goal

Deliver a premium signature-set system that can take a logo image or brand-name prompt and turn it into:

- a buildable collectible object
- an original `BLOCKS` set box
- a guided 3D studio
- an original instruction-book artifact
- a real export bundle
- a Remotion 3D film with sound

## Success criteria

- the same normalized input produces the same set spec, model, and export bundle
- image and prompt input reach the same downstream product surfaces
- instructions, studio phases, and film beats derive from the same canonical build data
- the first frame reads like a premium block-set product
- the output feels complete, not like several polished demos stitched together

## Inputs

- `docs/discovery/idea-brief.md`
- `docs/product/prd.md`
- `docs/product/jtbd.md`
- `docs/product/use-cases.md`
- `docs/engineering/test-strategy.md`
- `docs/brand/block-brand-guidelines.md`
- `docs/brand/sound-direction.md`

## Canonical model flow

- `BuildIntent`
- `BrickSetSpec`
- `ModelIR`
- `ExportBundle`
- `ScenePack`

Rule: `ModelIR` is the canon. `ScenePack` is a derived product contract for the app, instructions, and film surfaces.

## Execution Plan (3 Steps)

1. Lock the canonical set engine and export validity around the Codex signature collectible.
2. Build premium projections from that engine: set box, studio, and instructions.
3. Finish the Remotion film, sound system, and release-proof verification.

## Milestones

### Milestone 1: Canonical engine gate

- finalize `BuildIntent`, `BrickSetSpec`, `ModelIR`, and `ExportBundle`
- make the Codex collectible plausible, deterministic, and export-safe
- add validation coverage for transforms, parts, assemblies, and export consistency

### Milestone 2: Premium wrapper

- redesign the set-box surface around the original `BLOCKS` wrapper
- make the first frame screenshot-worthy
- keep the shell calm and the object disciplined

### Milestone 3: Guided studio

- add a live 3D runtime for the hero object
- keep controls minimal: orbit, phase stepper, explode or assemble, instruction sync
- avoid sandbox-editing features in this milestone

### Milestone 4: Instruction system

- derive build phases from assemblies and export data
- render original instruction-book pages
- add parts-needed callouts, subassembly handling, and inventory output

### Milestone 5: Film and sound

- drive Remotion stills and film from the same build data
- wire cue families into the same timeline
- land a complete film that feels like a product reveal, not a montage patchwork

### Milestone 6: Verification and release proof

- add smoke coverage for the main product flow
- review first frame, studio, instructions, exports, and film together
- capture screenshots, rendered outputs, and risk notes for release

## Verification Commands

- Dev: `npm run dev`
- Test: `npm test`
- Lint: `npm run lint`
- Build: `npm run build`

## Risk Notes

- Risk 1: wrapper and film quality could outrun model credibility, so the engine gate must stay first.
- Risk 2: the product could drift too close to iconic toy-brand systems, so all marks, labels, and layouts must stay original.
- Risk 3: the studio, instructions, and film could diverge into separate interpretations if they are not all derived from the same canonical phases.

## Assumptions and defaults

- the flagship quality bar is defined by the Codex signature collectible
- the object stays disciplined and mostly monochrome while the wrapper carries more overt joy
- both image and prompt input stay first-class
- the film is a capstone surface, not the proof of buildability by itself

## Retrospective Prompt

What would we do differently next time to reduce risk or increase delivery speed?
