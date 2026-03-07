## Runtime Fix Pass Assumptions

- Scope is limited to the current dirty workspace snapshot on `codex/snapshot-2026-03-06`.
- Focus is on the issues blocking app boot, 3D stability, reveal export compatibility, and required verification.
- Existing in-progress product work in unrelated docs, Remotion scenes, and collection features should remain intact.

## Open Questions

- Why do `npm test`, `npm run lint`, and `npm run build` stall in this snapshot?
- Is the current browser boot failure fully explained by the Three.js import path, or is there a second issue in the app shell after that is fixed?
