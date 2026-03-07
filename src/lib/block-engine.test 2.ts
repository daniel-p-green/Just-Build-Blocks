import { describe, expect, it } from 'vitest';

import {
  BLOCK_PALETTE,
  buildBlockBuildFromImageData,
  buildStoryArcs,
  quantizeToPalette,
} from './block-engine';

const flattenPixels = (pixels: Array<[number, number, number, number]>) =>
  new Uint8ClampedArray(pixels.flat());

describe('quantizeToPalette', () => {
  it('returns the nearest block color for an input pixel', () => {
    const color = quantizeToPalette({ r: 205, g: 35, b: 54, a: 255 });

    expect(color.id).toBe(BLOCK_PALETTE.red.id);
  });
});

describe('buildBlockBuildFromImageData', () => {
  it('downsamples a logo into a block grid and counts each block color', () => {
    const build = buildBlockBuildFromImageData(
      {
        width: 4,
        height: 4,
        data: flattenPixels([
          [196, 40, 28, 255],
          [196, 40, 28, 255],
          [0, 85, 191, 255],
          [0, 85, 191, 255],
          [196, 40, 28, 255],
          [196, 40, 28, 255],
          [0, 85, 191, 255],
          [0, 85, 191, 255],
          [255, 205, 0, 255],
          [255, 205, 0, 255],
          [255, 255, 255, 255],
          [255, 255, 255, 255],
          [255, 205, 0, 255],
          [255, 205, 0, 255],
          [255, 255, 255, 255],
          [255, 255, 255, 255],
        ]),
      },
      { columns: 2 },
    );

    expect(build.columns).toBe(2);
    expect(build.rows).toBe(2);
    expect(build.cells).toHaveLength(4);
    expect(build.countsByColor.red).toBe(1);
    expect(build.countsByColor.blue).toBe(1);
    expect(build.countsByColor.yellow).toBe(1);
    expect(build.countsByColor.white).toBe(1);
  });

  it('ignores transparent pixels when averaging cell colors', () => {
    const build = buildBlockBuildFromImageData(
      {
        width: 2,
        height: 2,
        data: flattenPixels([
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 200, 83, 255],
          [0, 200, 83, 255],
        ]),
      },
      { columns: 1 },
    );

    expect(build.cells).toHaveLength(1);
    expect(build.cells[0]?.color.id).toBe(BLOCK_PALETTE.green.id);
  });

  it('tracks the visible bounds of the generated block mark', () => {
    const build = buildBlockBuildFromImageData(
      {
        width: 6,
        height: 3,
        data: flattenPixels([
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [196, 40, 28, 255],
          [196, 40, 28, 255],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [196, 40, 28, 255],
          [196, 40, 28, 255],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ]),
      },
      { columns: 3 },
    );

    expect(build.visibleBounds).toEqual({
      minX: 1,
      maxX: 1,
      minY: 0,
      maxY: 1,
    });
  });
});

describe('buildStoryArcs', () => {
  it('creates the three story directions for the generated brand mark', () => {
    const arcs = buildStoryArcs({
      brandName: 'OpenAI Devs',
      dominantColor: BLOCK_PALETTE.green,
    });

    expect(arcs).toHaveLength(3);
    expect(arcs.map((arc) => arc.id)).toEqual([
      'instant-magic',
      'nostalgia-bridge',
      'world-building-montage',
    ]);
    expect(arcs[1]?.headline).toContain('OpenAI Devs');
  });
});
