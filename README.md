# Just Build with Blocks

`Just Build with Blocks` is a product and engine effort to take a logo, brand name, or short concept and turn it into a buildable premium block set that feels shelf-ready, film-ready, and complete.

The target product flow is:

- upload an image or enter a brand name or prompt
- generate a signature set identity and buildable model
- reveal an original `BLOCKS` set box
- step into a guided 3D builder studio
- render an original instruction-book experience
- export a real bundle: manifests, instructions, scene data, `.mpd`, `.io`
- render a Remotion 3D film with sound

The guiding line stays the same:

> The software is the board. The blocks are the possibilities.

## Product goal

The end product is not a surface-only concept demo. It is a complete premium set generator that can:

- accept image input and prompt input as first-class entry points
- produce a plausible, buildable collectible object
- wrap that object in an original premium block-set presentation
- generate instructions, manifests, exports, and keepsakes from one shared source of truth
- finish with a sound-led Remotion film that feels like a real product reveal

## Current repo state

The repo already contains the foundation for that direction:

- React + Vite app shell
- image upload and prompt-input flow
- shared `ScenePack` contract for current app and Remotion surfaces
- renderers for set-box stills, builder/reveal stills, and film compositions
- a `set-engine` foundation for `BuildIntent`, `BrickSetSpec`, `ModelIR`, and export-bundle work

The current app still includes earlier demo-oriented assumptions. The next documentation and implementation passes move the project toward a real set system with premium projections.

## Quality bar

Every meaningful release should satisfy these checks:

- the first frame reads like a premium block-set product, not a prototype
- the hero object feels buildable, not just stylized
- the wrapper feels original and toy-native without direct brand copying
- the instruction experience feels clear, airy, and complete
- the Remotion film feels like one coherent reveal, with sound

## Local development

```bash
npm install
npm run dev
```

Prompt mode requires `OPENAI_API_KEY`. Without it:

- image upload still works
- prompt mode stays clearly unavailable

Optional environment variables:

```bash
OPENAI_API_KEY=...
OPENAI_TEXT_MODEL=gpt-5.4
OPENAI_BASE_URL=https://api.openai.com/v1
```

## Scripts

```bash
npm run dev
npm run lint
npm test
npm run build
npm run remotion:studio
npm run remotion:render:still
npm run remotion:render:film
```

## Public repo workflow

- trunk branch: `main`
- sprint branches: `codex/sprint-XX-slug`
- one PR per sprint point
- attach at least one screenshot or GIF before merge
- tag every merged sprint point

Supporting files live in:

- [`CONTRIBUTING.md`](/Users/danielgreen/Documents/GitHub/Just-Build-Blocks/CONTRIBUTING.md)
- [`docs/checklists/sprint-demo-checklist.md`](/Users/danielgreen/Documents/GitHub/Just-Build-Blocks/docs/checklists/sprint-demo-checklist.md)
- [`docs/releases/RELEASE_TEMPLATE.md`](/Users/danielgreen/Documents/GitHub/Just-Build-Blocks/docs/releases/RELEASE_TEMPLATE.md)

## Brand and legal posture

The product should evoke the confidence, clarity, and toy-native delight of iconic studded construction sets without copying official names, logos, packaging systems, or instruction layouts.

- use the custom `BLOCKS` badge
- use OpenAI Sans for the shell and typography system
- keep the shell clean and OpenAI-like
- keep the object disciplined and collectible
- let the wrapper, motion, and sound carry the louder delight

Start with:

- [`docs/brand/block-brand-guidelines.md`](/Users/danielgreen/Documents/GitHub/Just-Build-Blocks/docs/brand/block-brand-guidelines.md)
- [`docs/brand/reference-board.md`](/Users/danielgreen/Documents/GitHub/Just-Build-Blocks/docs/brand/reference-board.md)
- [`docs/brand/sound-direction.md`](/Users/danielgreen/Documents/GitHub/Just-Build-Blocks/docs/brand/sound-direction.md)
- [`docs/product/prd.md`](/Users/danielgreen/Documents/GitHub/Just-Build-Blocks/docs/product/prd.md)
