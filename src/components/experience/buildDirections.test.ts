import { describe, expect, it } from 'vitest';

import { BUILD_DIRECTIONS, getBuildDirectionConfig } from './buildDirections';

describe('build direction adapter', () => {
  it('maps each supported direction to real engine settings', () => {
    expect(BUILD_DIRECTIONS.map((direction) => direction.id)).toEqual([
      'signature-mosaic',
      'desk-collectible',
      'night-bench',
    ]);

    expect(getBuildDirectionConfig('signature-mosaic')).toMatchObject({
      columns: 40,
      visualPresetId: 'primary-play',
      revealMode: 'faithful',
    });

    expect(getBuildDirectionConfig('desk-collectible')).toMatchObject({
      columns: 44,
      visualPresetId: 'build-table',
      revealMode: 'imagination',
    });

    expect(getBuildDirectionConfig('night-bench')).toMatchObject({
      columns: 48,
      visualPresetId: 'night-shift',
      revealMode: 'imagination',
    });
  });
});
