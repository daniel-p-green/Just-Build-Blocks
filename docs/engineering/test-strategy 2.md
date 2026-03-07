# Test Strategy: Just Build with Blocks Signature Product

Date: 2026-03-06
Repository: Just-Build-Blocks
Working stack: React, Vite, TypeScript, Vitest

## Quality Gates

- Lint: `npm run lint`
- Test: `npm test`
- Build: `npm run build`

## Test Scope

### Unit

- Canonical model logic: input normalization, set spec generation, model compilation, bounds, manifests, and validation reports.
- Export logic: deterministic `.mpd`, `.io`, and `instructions.json` generation.
- Rendering contracts: scene-pack derivation, build phases, sound schedules, and instruction data generation.

### Integration

- Data boundaries: image input or prompt input -> canonical model -> scene data -> exports.
- Service boundaries: prompt generation server path and local-only image path both feed the same downstream contract.
- State transitions: idle -> loading -> generated -> exportable -> renderable.

### End-to-End

- Primary user flow: generate a set from image input, inspect box and studio, and download the export bundle.
- Prompt flow: generate a set from a brand name or short prompt and reach the same downstream surfaces.
- Quality flow: verify the first frame, instruction surface, and film render are all driven by the same set data.

## Requirement-to-Test Mapping

| PRD criterion | Test level | Test case id |
|---|---|---|
| Deterministic set spec and model generation | Unit | UT-MODEL-001 |
| Export bundle consistency across manifests and model files | Unit | UT-EXPORT-001 |
| Input normalization for image and prompt paths | Integration | IT-INPUT-001 |
| Set to box/studio/instructions flow | Integration | IT-FLOW-001 |
| Film render and sound-cue contract | Manual / integration | IT-FILM-001 |

## Test Data and Fixtures

- Required fixtures: synthetic pixel grids, transparent images, simple logo inputs, and prompt concepts that map to known outputs.
- Synthetic data needs: deterministic assemblies, stable color bins, and fixed export snapshots for regression checking.
- Cleanup strategy: no persistent backend state required for most tests; fixture outputs stay local to the test runner.

## Release Verification Checklist

- [ ] All new or changed behavior covered by tests where practical
- [ ] Regression tests pass
- [ ] No flaky tests introduced
- [ ] Export bundle verified for consistency
- [ ] Remotion render path reviewed manually
- [ ] Risk summary written
