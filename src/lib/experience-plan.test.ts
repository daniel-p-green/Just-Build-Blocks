import { describe, expect, it } from 'vitest';

import { BLOCK_PALETTE } from './block-engine';
import { buildExperiencePlan } from './experience-plan';

describe('buildExperiencePlan', () => {
  it('returns deterministic world and motion details for the same inputs', () => {
    const first = buildExperiencePlan({
      brandName: 'Codex Blocks',
      dominantColor: BLOCK_PALETTE.green,
      revealMode: 'imagination',
      visualPresetId: 'night-shift',
    });
    const second = buildExperiencePlan({
      brandName: 'Codex Blocks',
      dominantColor: BLOCK_PALETTE.green,
      revealMode: 'imagination',
      visualPresetId: 'night-shift',
    });

    expect(first).toEqual(second);
    expect(first.motion.depthPlan).toBe('bench-beam');
    expect(first.world.elements).toHaveLength(4);
  });

  it('makes imagination mode more expansive than faithful mode', () => {
    const faithful = buildExperiencePlan({
      brandName: 'OpenAI Devs',
      dominantColor: BLOCK_PALETTE.green,
      revealMode: 'faithful',
      visualPresetId: 'primary-play',
    });
    const imagination = buildExperiencePlan({
      brandName: 'OpenAI Devs',
      dominantColor: BLOCK_PALETTE.green,
      revealMode: 'imagination',
      visualPresetId: 'primary-play',
    });

    expect(faithful.world.cameraEmotion).toBe('monument');
    expect(imagination.world.cameraEmotion).toBe('expansion');
    expect(imagination.copy.sacredLine).toContain('build');
    expect(imagination.world.concept).not.toBe(faithful.world.concept);
  });

  it('maps each new preset to a distinct build-table motion identity', () => {
    const primary = buildExperiencePlan({
      brandName: 'OpenAI Devs',
      dominantColor: BLOCK_PALETTE.red,
      revealMode: 'faithful',
      visualPresetId: 'primary-play',
    });
    const table = buildExperiencePlan({
      brandName: 'OpenAI Devs',
      dominantColor: BLOCK_PALETTE.blue,
      revealMode: 'faithful',
      visualPresetId: 'build-table',
    });
    const night = buildExperiencePlan({
      brandName: 'OpenAI Devs',
      dominantColor: BLOCK_PALETTE.yellow,
      revealMode: 'faithful',
      visualPresetId: 'night-shift',
    });

    expect(primary.motion.depthPlan).toBe('stud-rise');
    expect(table.motion.depthPlan).toBe('tray-run');
    expect(night.motion.depthPlan).toBe('bench-beam');
  });
});
