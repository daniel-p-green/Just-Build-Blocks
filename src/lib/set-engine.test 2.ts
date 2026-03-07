import { describe, expect, it } from 'vitest';

import { buildBlockBuildFromImageData } from './block-engine';
import { buildRealSet, summarizeBricklinkSourcing, validateModelIR } from './set-engine';

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
    expect(realSet.model.parts[0]).toMatchObject({
      bricklinkAvailableInColor: true,
      bricklinkCatalogUrl: expect.stringContaining('bricklink.com/v2/catalog/catalogitem.page?P='),
      bricklinkColorId: expect.any(Number),
      bricklinkColorName: expect.any(String),
      bricklinkItemNo: expect.any(String),
      bricklinkItemType: 'P',
    });
    expect(realSet.partManifest[0]).toMatchObject({
      bricklinkAvailableInColor: true,
      bricklinkCatalogUrl: expect.stringContaining('bricklink.com/v2/catalog/catalogitem.page?P='),
      bricklinkColorId: expect.any(Number),
      bricklinkColorName: expect.any(String),
      bricklinkItemNo: expect.any(String),
      bricklinkItemType: 'P',
    });

    expect(summarizeBricklinkSourcing(realSet.partManifest)).toMatchObject({
      bricklinkSnapshotVersion: expect.any(String),
      mappedPartCoverage: {
        mappedLineItems: realSet.partManifest.length,
        percentage: 100,
        totalLineItems: realSet.partManifest.length,
      },
      unavailablePartColorCount: 0,
    });
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

  it('reports BrickLink color availability as warnings without invalidating the model', () => {
    const validation = validateModelIR({
      ioEntryNames: ['model.ldr', 'instructions.json'],
      model: {
        assemblies: [{ id: 'root', kind: 'root', name: 'Root' }],
        bounds: {
          maxX: 10,
          maxY: 0,
          maxZ: 10,
          minX: -10,
          minY: -24,
          minZ: -10,
        },
        colorBins: [],
        parts: [
          {
            assemblyId: 'root',
            bricklinkAvailableInColor: false,
            bricklinkCatalogUrl: 'https://www.bricklink.com/v2/catalog/catalogitem.page?P=3005',
            bricklinkColorId: null,
            bricklinkColorName: null,
            bricklinkItemNo: '3005',
            bricklinkItemType: 'P',
            colorCode: 999,
            colorId: 'magenta',
            colorName: 'Magenta',
            heightPlates: 3,
            id: 'root-3005-1',
            partId: '3005.dat',
            partName: 'Brick 1 x 1',
            role: 'art',
            studsX: 1,
            studsZ: 1,
            transform: {
              matrix: [1, 0, 0, 0, 1, 0, 0, 0, 1],
              x: 0,
              y: -24,
              z: 0,
            },
          },
        ],
        studFootprint: {
          depth: 2,
          width: 2,
        },
        supportStrategy: {
          kind: 'flat-display-plaque',
          notes: [],
        },
      },
      mpdText: '0 FILE model.ldr\n1 16 0 0 0 1 0 0 0 1 0 0 0 1 root.ldr\n0 FILE root.ldr',
    });

    expect(validation.issues).toContainEqual(
      expect.objectContaining({
        code: 'bricklink-color-unavailable',
      }),
    );
    expect(validation.valid).toBe(true);
  });
});
