## Release Readiness Pass Assumptions

- Scope is limited to the current `codex/snapshot-2026-03-06` workspace and the issues called out in the standup RAG update.
- The highest-priority fixes are the remaining verification blocker, missing collection-flow coverage, and stale release-tracking docs.
- Existing in-progress collection, audio, and Remotion work should remain intact unless a change is required to restore verification.

## Open Questions

- Why does `scene-pack` loosen the part-manifest role contract compared with `set-engine`?
- Which collection-flow state is still least explicit in the current app smoke tests?
- Does `npm run lint` complete cleanly in this live workspace once the build blocker is resolved, or is there a second environment-specific issue?

## Resolutions

- `scene-pack` had widened `role` to `string` in both the exported type and schema. Tightening it back to the set-engine union removed the downstream build break in `App.tsx`.
- The least explicit app-flow gap was the transition through the instruction surface. `App.onboarding.test.tsx` now calls out box -> studio -> instructions before the keep surface.
- The lint problem was environmental, not architectural: the local install was missing an internal `semver` file under `@typescript-eslint`, and generated `tmp/` artifacts were being linted. Reinstalling dependencies and ignoring `tmp/` restored a trustworthy lint run.
