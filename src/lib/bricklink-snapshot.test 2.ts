import { describe, expect, it } from 'vitest';

import {
  BRICKLINK_SNAPSHOT_VERSION,
  buildBricklinkManifestPayload,
  getBricklinkColorRef,
  getBricklinkPartRef,
} from './bricklink-snapshot';

describe('bricklink snapshot', () => {
  it('maps the current basic part catalog to BrickLink references', () => {
    const partRef = getBricklinkPartRef('3005.dat');

    expect(BRICKLINK_SNAPSHOT_VERSION).toContain('2026');
    expect(partRef).toMatchObject({
      bricklinkCatalogUrl: 'https://www.bricklink.com/v2/catalog/catalogitem.page?P=3005',
      bricklinkItemNo: '3005',
      bricklinkItemType: 'P',
      bricklinkName: 'Brick 1 x 1',
      ldrawPartId: '3005.dat',
    });
  });

  it('maps the internal palette to BrickLink color references', () => {
    expect(getBricklinkColorRef('white')).toEqual({
      bricklinkColorId: 1,
      bricklinkColorName: 'White',
      internalColorId: 'white',
    });
    expect(getBricklinkColorRef('blue')).toEqual({
      bricklinkColorId: 7,
      bricklinkColorName: 'Blue',
      internalColorId: 'blue',
    });
  });

  it('builds a manifest payload with sourcing summary fields', () => {
    const payload = buildBricklinkManifestPayload([
      {
        bricklinkAvailableInColor: true,
        bricklinkItemNo: '3005',
      },
      {
        bricklinkAvailableInColor: false,
        bricklinkItemNo: '3023',
      },
      {
        bricklinkAvailableInColor: false,
        bricklinkItemNo: null,
      },
    ]);

    expect(payload.bricklinkSnapshotVersion).toBe(BRICKLINK_SNAPSHOT_VERSION);
    expect(payload.mappedPartCoverage).toEqual({
      mappedLineItems: 2,
      percentage: 67,
      totalLineItems: 3,
    });
    expect(payload.unavailablePartColorCount).toBe(2);
    expect(payload.items).toHaveLength(3);
  });
});
