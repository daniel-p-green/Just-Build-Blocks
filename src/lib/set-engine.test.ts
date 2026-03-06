import { describe, expect, it } from 'vitest';

import { buildBlockBuildFromImageData } from './block-engine';
import { buildRealSet } from './set-engine';

const flattenPixels = (pixels: Array<[number, number, number, number]>) =>
  new Uint8ClampedArray(pixels.flat());

describe('buildRealSet', () => {
  it('builds a deterministic monochrome Codex signature set with clean exports', () => {
    const build = buildBlockBuildFromImageData(
      {
        width: 3,
        height: 3,
        data: flattenPixels([
          [255, 255, 255, 255],
          [0, 0, 0, 255],
          [255, 255, 255, 255],
          [0, 0, 0, 255],
          [255, 255, 255, 255],
          [0, 0, 0, 255],
          [255, 255, 255, 255],
          [0, 0, 0, 255],
          [255, 255, 255, 255],
        ]),
      },
      { columns: 3 },
    );

    const realSet = buildRealSet({
      brandName: 'Codex',
      build,
      input: {
        kind: 'image',
        brandName: 'Codex',
        fileMeta: {
          fileName: 'codex.png',
        },
      },
    });

    expect(realSet.intent.targetKind).toBe('signature-collectible');
    expect(realSet.spec.modelStyle).toBe('monochrome-signature');
    expect(realSet.spec.supportStrategy).toBe('plinth-supported');
    expect(realSet.validation.valid).toBe(true);
    expect(realSet.exportBundle.ioEntryNames).toEqual([
      'model.ldr',
      'metadata.json',
      'instructions.json',
    ]);
    expect(realSet.exportBundle.mpdText).toContain('0 FILE plinth.ldr');
    expect(realSet.exportBundle.mpdText).toContain('0 FILE face.ldr');
    expect(realSet.exportBundle.mpdText).toContain('0 FILE detail.ldr');
    expect(realSet.exportBundle.instructionPlan.steps.map((step) => step.id)).toEqual([
      'foundation-01',
      'face-02',
      'detail-03',
    ]);
    expect(
      realSet.partManifest.reduce((total, item) => total + item.count, 0),
    ).toBe(realSet.model.parts.length);
  });

  it('stays deterministic for the same Codex input', () => {
    const build = buildBlockBuildFromImageData(
      {
        width: 2,
        height: 2,
        data: flattenPixels([
          [255, 255, 255, 255],
          [0, 0, 0, 255],
          [0, 0, 0, 255],
          [255, 255, 255, 255],
        ]),
      },
      { columns: 2 },
    );
    const input = {
      kind: 'image' as const,
      brandName: 'Codex',
      fileMeta: {
        fileName: 'codex.png',
      },
    };

    const first = buildRealSet({
      brandName: 'Codex',
      build,
      input,
    });
    const second = buildRealSet({
      brandName: 'Codex',
      build,
      input,
    });

    expect(first.spec).toEqual(second.spec);
    expect(first.model).toEqual(second.model);
    expect(first.exportBundle.mpdText).toEqual(second.exportBundle.mpdText);
    expect(first.exportBundle.ioEntryNames).toEqual(second.exportBundle.ioEntryNames);
  });
});
