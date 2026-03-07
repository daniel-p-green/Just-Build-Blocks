# AGENTS.md

## Project Snapshot

- Repository: Just-Build-Blocks
- Stack: React, Vite, TypeScript, Vitest

## Design Context

### Users
Primary users are creative builders, brand operators, and design-minded reviewers who want to turn a logo, brand, or short concept into a believable premium block-set artifact they can share, review, or commission. Their context is usually a demo, review, or presentation moment where the first frame needs to feel complete immediately. Secondary users are internal OpenAI/Codex reviewers, but future design tradeoffs should prioritize the external creative user first.

### Brand Personality
The brand should feel playful, premium, and credible. The shell should project calm confidence and clarity, while the `BLOCKS` wrapper can carry more joy, color, and toy-native energy. The emotional goals are confidence, delight, and proud shareability, without slipping into childishness, parody, or generic AI-demo polish.

### Aesthetic Direction
Use a light-first visual system. Keep the shell recognizably OpenAI-clean: OpenAI Sans, white and graphite foundations, restrained blue, generous spacing, and disciplined rounded geometry. Let the `BLOCKS` wrapper deliver the brighter product energy through blue packaging fields, a red `BLOCKS` badge, yellow accents, playful metadata, and tactile glossy surfaces. The hero object must stay believable, buildable, and collectible. Future work should feel more playful than the current baseline, but not louder than the product can credibly support.

Do not let the product drift into:
- a clone of a known construction-toy retail site or instruction system
- a generic SaaS uploader/dashboard
- a dark, cinematic, gamer-style interface that weakens build credibility

### Design Principles
1. Teach before asking users to act. The product should coach input quality, rights, and expected output before generation starts.
2. Keep the shell calm and let the payoff carry delight. Navigation, forms, and system chrome stay clear and quiet; the wrapper, reveal, and keepsakes can be more expressive.
3. Believability beats spectacle. The set, instructions, and exports should always feel physically plausible and buildable before they feel flashy.
4. Customer-facing by default. Internal notes, diagnostics, and implementation language belong only behind explicit debug or admin boundaries.
5. Accessible delight is the default. Design for WCAG AA, keyboard reachability, clear labels, strong contrast, and reduced-motion support from the start.

## Daily Workflow Contract

1. Start every task with success criteria:
- Done means `the upload flow produces a visually strong block-built result and the requested core behavior is implemented`
- Tested by `npm test`, `npm run lint`, `npm run build`, plus a quick manual browser pass for visual work
- No changes to `unrelated experiments, generated assets, or future Remotion storytelling scope unless explicitly requested`

2. For non-trivial work:
- Write a 3-step plan first
- Then execute

3. Name workflow skills explicitly when needed:
- `test-driven-development` before implementing features or bug fixes
- `systematic-debugging` before proposing fixes for failures
- `playwright-interactive` before any required manual browser pass or UI verification
- `requesting-code-review` before merge or handoff

4. Verification is required before completion:
- Lint: `npm run lint`
- Test: `npm test`
- Build: `npm run build`
- Include a short risk summary

5. End each task with a brief retrospective:
- What would we do differently next time?

## Commands

- Dev: `npm run dev`
- Test: `npm test`
- Lint: `npm run lint`
- Build: `npm run build`
- Manual UI check: use the installed `playwright-interactive` skill for the required browser pass
- `playwright-interactive` requires `js_repl` to be enabled in Codex and should be run from this repo workspace

## Guardrails

- Prefer minimal, reversible changes
- Do not ship without updated tests
- Document assumptions and open questions in the relevant doc before coding
