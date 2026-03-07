# Devlog: Codex Signature Set

Date: 2026-03-05
Repository: Just-Build-Blocks
Flagship: Codex Signature Set

## 2026-03-05 21:30 CST

### Session goal

Reset the product around a more believable flagship: a monochrome Codex collectible with a premium wrapper, real exports, and an instruction-ready canonical model.

### Decisions made

- Locked `ModelIR` as the canonical source of truth and treated `ScenePack` as a derived product projection.
- Narrowed the physical hero set to a black-and-white Codex collectible with a small plinth instead of a colorful district playset.
- Kept color in the wrapper: set box, studio controls, metadata rails, motion, and sound cues.
- Treated the instruction system as a first-class derived surface from assemblies and phases, not a parallel authoring system.

### References reviewed

- Dominik Kundel, "Building LEGO sets with Codex" (validation loop, `.io` bundle structure, self-verification)
- Monochrome Codex glyph reference provided in-thread
- Standing Codex build references and screenshots provided in-thread
- Instruction-sheet references provided in-thread
- [`AndrewSalls/StudioInstructionBuilder`](https://github.com/AndrewSalls/StudioInstructionBuilder)
- [`radtket/lego-minifig-builder`](https://github.com/radtket/lego-minifig-builder)
- [`petergpt/gpt-5-4-pro-3d-generations`](https://github.com/petergpt/gpt-5-4-pro-3d-generations)

### Tasks completed

- Reworked the set engine toward a `signature-collectible` Codex path.
- Added `monochrome-signature` model style, plinth support strategy, and instruction theme metadata.
- Derived a monochrome display grid with face, boundary/detail, and plinth regions.
- Reworked `compileModelIR` to emit a signature-oriented assembly structure: `plinth`, `backing`, `face`, `detail`.
- Reworked MPD export generation to derive submodels from assemblies instead of hardcoding the old plaque-era files.
- Fixed validation so it checks the assemblies actually present in the canonical model.
- Fixed a structural overlap bug where the plinth and backing were both occupying the same cells.
- Added a lean Three.js builder studio surface and an instruction-book HTML artifact generator.
- Reworked `ScenePack` so it exposes canonical model data, validation, part manifest, instructions, keepsakes, and packaging fields.
- Added deterministic engine tests for `buildRealSet`.
- Updated scene-pack tests to assert canonical model validity instead of old flat-grid assumptions.
- Simplified the live reveal flow so the studio animates real build phases instead of relying on the old hidden 2D reveal canvas.
- Added a local Three.js type shim to keep the new builder slice compiling in this environment without waiting on a package install.
- Added a formal backlog and prompt/spec docs for set box, studio, instructions, film, and sound.

### Checks run

- `npm test` -> pass (`19/19`)
- `esbuild` app bundle sanity check -> pass
- `npx tsc -b --pretty false` -> currently hangs in this environment without diagnostics
- `npx vite build` -> currently hangs in this environment without diagnostics

### Blockers

- Reliable TypeScript and Vite build confirmation is still flaky in the current desktop environment.
- The live builder studio compiles conceptually, but needs a full successful `tsc`/`vite build` confirmation pass.
- The wrapper surfaces still need more premium product polish now that the engine is stronger.

### Next move

1. Finish compile stabilization for the Three.js builder slice.
2. Add dev-task memory and prompt/spec docs for set box, studio, instructions, film, and sound.
3. Rework the set-box and instruction surfaces so the first frame and build sheet feel like a real signature product.
