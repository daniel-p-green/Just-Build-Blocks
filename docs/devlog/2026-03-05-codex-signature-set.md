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

## 2026-03-05 22:20 CST

### Session goal

Make the visible product projections feel premium enough to support the stronger canonical set engine: set box first, instruction clarity second, studio lighting/materials third.

### Decisions made

- Treated the set-box surface as product photography, not a block-grid infographic.
- Used the downloadable instruction artifact as the source of truth for the in-app instructions preview to keep those surfaces aligned.
- Kept the studio scope lean, but improved lighting, shadows, and materials so it reads more like a collectible shoot than a technical preview.

### Tasks completed

- Reworked the hero canvas packaging scene around a more premium blue field, stronger inner framing, and a standing front-facing Codex collectible render.
- Replaced flat box-art block rendering with a more object-like standing-brick projection for the monochrome set.
- Upgraded the instruction HTML artifact with clearer step composition, top callout rows, phase panels, and completion insets.
- Swapped the in-app instruction stage to an `iframe` preview of the actual generated instruction artifact.
- Improved the live builder studio with tone mapping, shadows, a product-stage backdrop, a shelf, and more collectible-feeling materials.

### Checks run

- `npm test` was re-invoked, but the process stalled in this environment without returning a final diagnostic.
- `esbuild` sanity had passed earlier in the session before this visual pass; a fresh re-run also stalled in the current environment.
- Security grep still shows `OPENAI_API_KEY` only in the server concept service path.

### Blockers

- The desktop environment is still unreliable for long-running CLI confirmation; some commands start and then hang without diagnostics.
- We still need one stable compile/build confirmation after the latest visual pass.

### Next move

1. Get one stable build signal for the latest visual changes.
2. Iterate on the set box until the object read is genuinely “blink twice” premium.
3. Add more instruction-specific fidelity, especially step imagery derived from phases rather than abstract figure boards.

## 2026-03-06 09:10 CST

### Session goal

Pivot the product from a single flagship experience into a collection-first launch line while keeping `ModelIR` canonical and turning the visible app into a premium consumer product line instead of a one-off tool.

### Decisions made

- Elevated the product to `BLOCKS Signature Collection` with a four-SKU launch line.
- Kept `ModelIR` as the canonical geometry truth and treated packaging, instruction books, studio, and collection landing as derived projections.
- Decided the collection shell would stay compact and product-led: landing shelf first, commission flow second.
- Threaded SKU accent colors through packaging, instruction-book styling, and studio lighting/materials so the line reads as one family with controlled variation.

### References reviewed

- Existing collection-first plan in-thread
- Existing signature-set engine and scene-pack implementation in this repo
- Prior premium packaging and instruction references already logged above

### Tasks completed

- Added collection-layer canonical types and pack generation in `src/lib/collection-pack.ts`.
- Added launch-line metadata to the set engine so real exports can carry SKU, line, accent color, archetype, and packaging angle.
- Expanded `ScenePack` with collection-aware fields including launch line, SKU, accent color, hero shot angle, builder accent, and instruction book title.
- Added a `CollectionShelf` landing surface and wired the app to start on the collection landing before entering per-set detail flows.
- Updated the app so collection detail pages use collection-derived `ScenePack` / `RealSetBuild` projections while commission builds continue to use the same downstream surfaces.
- Reworked the hero renderer to use SKU-aware accent styling for premium box art.
- Upgraded the instruction artifact with stronger book-strip metadata, accent-aware step styling, color-bin summary, and clearer product-book composition.
- Tightened the live 3D studio with accent-aware lighting, fog, trim, and plinth details so each SKU reads as part of the same line.
- Added collection-pack tests and rewrote onboarding tests around the collection-first landing flow.
- Extended scene-pack tests to cover the new collection identity fields.

### Checks run

- Pending after collection-first pass

### Blockers

- Need a fresh test/build confirmation after the collection-first pass.
- Need to confirm the updated app flow has no stale single-flagship assumptions in `App.tsx`.

### Next move

1. Run targeted vitest coverage for onboarding, scene pack, collection pack, and set engine.
2. Run a quick security review after verification.
3. If verification passes, do a final visual tightening pass on the collection shelf and set detail surfaces.
