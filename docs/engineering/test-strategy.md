# Test Strategy: Just Build with Blocks MVP

Date: 2026-03-05
Repository: Just-Build-Blocks
Working stack: React, Vite, TypeScript, Vitest

## Quality Gates

- Lint: `npm run lint`
- Test: `npm test`
- Build: `npm run build`

## Test Scope

### Unit

- Core business logic: palette quantization, block grid generation, block counts, story arc generation.
- Validation rules: file type and image decode checks where logic can be isolated cleanly.
- Error handling: transparent pixel handling and empty-grid fallbacks.

### Integration

- Data boundaries: uploaded file -> image decode -> block grid -> hero render data.
- Service boundaries: local-only browser flow for MVP, no required external API integration.
- State transitions: idle -> loading -> generated -> exportable.

### End-to-End

- Primary user flow: upload a supported logo and receive a block-built still plus scene data.
- Critical edge flow: upload an asset with transparency and confirm the output stays visually coherent.

## Requirement-to-Test Mapping

| PRD criterion | Test level | Test case id |
|---|---|---|
| Block grid generation from uploaded logo | Unit | UT-BLOCK-001 |
| Transparent pixel handling | Unit | UT-BLOCK-002 |
| Three story arcs generated from transformed output | Unit | UT-STORY-001 |
| End-to-end upload to render flow | Manual / integration | IT-FLOW-001 |

## Test Data and Fixtures

- Required fixtures: synthetic pixel grids that represent simple logos and transparent backgrounds.
- Synthetic data needs: quadrant-based color maps and alpha-heavy logo samples.
- Cleanup strategy: no persistent backend state in MVP; test data stays local to the test runner.

## Release Verification Checklist

- [ ] All new/changed behavior covered by tests
- [ ] Regression tests pass
- [ ] No flaky tests introduced
- [ ] Risk summary written
