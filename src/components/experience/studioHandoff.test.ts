import { describe, expect, it } from 'vitest';

import { buildStudioHandoffBundle } from './studioHandoff';

describe('buildStudioHandoffBundle', () => {
  it('derives the advanced Studio review bundle from the canonical set outputs', () => {
    const bundle = buildStudioHandoffBundle({
      instructionsHtmlFileName: 'signal-instructions.html',
      realSetBuild: {
        exportBundle: {
          ioFileName: 'signal.io',
          mpdFileName: 'signal.mpd',
        },
        model: {
          studFootprint: {
            depth: 20,
            width: 24,
          },
        },
        partManifest: [
          {
            colorName: 'Orbit Blue',
            count: 18,
            partName: 'Brick 2 x 4',
          },
          {
            colorName: 'Bright Yellow',
            count: 6,
            partName: 'Plate 2 x 2',
          },
        ],
        spec: {
          buildId: 'signal-0042',
          flagshipName: 'Signal Monolith',
          targetStuds: {
            depth: 20,
            width: 24,
          },
        },
        validation: {
          issues: [],
          totals: {
            assemblies: 4,
            parts: 24,
            uniqueColorBins: 2,
            uniquePartKinds: 2,
          },
          valid: true,
        },
      } as never,
      scenePack: {
        box: {
          title: 'Signal Monolith',
        },
        copy: {
          tagline: 'From signal to collectible.',
        },
        exports: {
          builderStillFileName: 'studio-still.png',
          handoffFileName: 'signal-handoff.json',
          ioFileName: 'signal.io',
          manifestFileName: 'signal-manifest.json',
          mpdFileName: 'signal.mpd',
          sceneFileName: 'signal-scene.json',
          validationFileName: 'signal-validation.json',
        },
        instructions: {
          countTotals: {
            totalPieces: 24,
          },
        },
        setIdentity: {
          sku: 'SIG-0042',
        },
      } as never,
    });

    expect(bundle.setTitle).toBe('Signal Monolith');
    expect(bundle.setIdentifier).toBe('SIG-0042');
    expect(bundle.footprint).toBe('24 x 20 studs');
    expect(bundle.ioAsset?.fileName).toBe('signal.io');
    expect(bundle.ldrAsset?.fileName).toBe('signal.ldr');
    expect(bundle.validationSummary.status).toBe('Review-ready');
    expect(bundle.shotList).toEqual([
      'Hero three-quarter view',
      'Structural angle',
      'Studio bench overview',
    ]);
    expect(bundle.reviewAssets.map((asset) => asset.label)).toContain('Validation report');
    expect(bundle.buildBrief).toMatch(/Signal Monolith/i);
  });
});
