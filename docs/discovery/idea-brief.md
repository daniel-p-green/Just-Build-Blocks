# Idea Brief: Just Build with Blocks MVP

Date: 2026-03-05
Repository: Just-Build-Blocks
Working stack: React, Vite, TypeScript, Vitest

## 1) Problem

People hear "Codex" or "build with AI" and often assume they need to think like engineers before they can make anything meaningful. This project creates a simpler emotional bridge: building with modern AI should feel as intuitive and playful as building with blocks did when you were a kid.

## 2) Target User

Primary user: creative, non-technical builders who want to feel possibility rather than complexity.
Secondary user: the OpenAI/Codex team, who need a shareable internal demo artifact that sparks imagination.
Out of scope: engineers who need manufacturing precision, real-world brick instructions, or legal use of the official LEGO brand.

## 3) Outcome

The user uploads a brand or logo image and immediately gets a polished block-built hero mark plus narrative directions that can feed a later Remotion piece. The result should make "you can just build" feel true before it feels technical.

## 4) Success Signals

- Leading indicator: a first-time user can upload a logo and get a visually strong result without reading instructions.
- Lagging indicator: the generated still and story arcs are compelling enough to share with `@openaaidevs` as a concept demo.
- Manual acceptance check: upload a transparent PNG or simple logo, get a branded block-built still, visible block counts, and three usable story arc directions in under one minute.

## 5) Constraints

- Technical: browser-first MVP, no manufacturing-grade brick geometry, and the data model should stay compatible with a future Remotion animation layer.
- Timeline: single-session MVP intended to unblock a same-day concept film workflow.
- Compliance / policy: use "blocks" and "building block" language rather than official LEGO brand language, while only borrowing the general toy-block visual feeling.

## 6) Non-Goals

- This effort will not generate real-world build instructions or guaranteed accurate part counts.
- This effort will not solve multi-logo batch processing, purchasing flows, or production rendering workflows.

## 7) Assumptions

- Assumption 1: a strong hero still is enough to validate the concept before deeper video or instruction-generation work.
- Assumption 2: a curated block palette and a stylized render will communicate the idea better than physically exact brick simulation for this phase.

## 8) Open Questions

- Question 1: how much of the future Remotion story should be generated automatically versus art-directed by hand?
- Question 2: when the concept graduates beyond demo mode, should the next step prioritize better stills, better motion, or true buildability?
