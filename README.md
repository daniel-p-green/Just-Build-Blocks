# Just Build with Blocks

`Just Build with Blocks` is a standalone web app for turning a logo or a plain-language idea into a custom block-set product story:

- upload an image or describe it
- reveal a custom `BLOCKS` set box
- step into a guided 2.5D builder studio
- generate instructions, parts, stills, and a film-ready handoff
- tease `Buy the bricks` without implying real checkout

The guiding line stays the same:

> The software is the board. The blocks are the possibilities.

## Current sprint coverage

This repo now includes the first public-build foundation across the early sprints:

- Sprint 0: repo workflow scaffolding, CI, public contribution templates
- Sprint 1: OpenAI-shell + block-set stage brand system
- Sprint 2: unified input surface for image upload and prompt entry
- Sprint 3: set-box reveal as the hero product moment
- Sprint 4: guided builder studio with reveal playback
- Sprint 5: instructions, part counts, and keepsake exports

## Product surfaces

- React + Vite app shell
- shared `ScenePack` contract
- prompt concept server boundary for OpenAI-backed text flows
- set-box still renderer
- builder/reveal renderer
- Remotion still and film compositions

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

The product aims for strong emotional familiarity with iconic studded block toys while avoiding counterfeit assets or source-identical packaging.

- use the custom `BLOCKS` badge
- use OpenAI Sans for the shell and typography system
- keep the shell clean and OpenAI-like
- let the stage carry the primary-color joy and tactile spectacle

Start with:

- [`docs/brand/block-brand-guidelines.md`](/Users/danielgreen/Documents/GitHub/Just-Build-Blocks/docs/brand/block-brand-guidelines.md)
- [`docs/brand/reference-board.md`](/Users/danielgreen/Documents/GitHub/Just-Build-Blocks/docs/brand/reference-board.md)
- [`docs/brand/sound-direction.md`](/Users/danielgreen/Documents/GitHub/Just-Build-Blocks/docs/brand/sound-direction.md)
