import { describe, expect, it } from 'vitest';

import { OPENAI_SANS_FAMILY } from './brand-system';
import { BLOCK_PALETTE, buildBlockBuildFromImageData } from './block-engine';
import type { ConceptInput } from './concept-input';
import {
  SCENEPACK_VERSION,
  ScenePackSchema,
  VISUAL_PRESETS,
  buildScenePack,
} from './scene-pack';

const flattenPixels = (pixels: Array<[number, number, number, number]>) =>
  new Uint8ClampedArray(pixels.flat());

describe('VISUAL_PRESETS', () => {
  it('exposes the three canonical looks from the brand system', () => {
    expect(VISUAL_PRESETS.map((preset) => preset.id)).toEqual([
      'primary-play',
      'build-table',
      'night-shift',
    ]);
  });

  it('uses build-table surface tokens and OpenAI Sans as the shared sophistication signal', () => {
    expect(OPENAI_SANS_FAMILY).toContain('OpenAI Sans');
    expect(VISUAL_PRESETS.map((preset) => preset.backgroundMood)).toEqual([
      'white-board',
      'green-mat',
      'dark-bench',
    ]);
    expect(VISUAL_PRESETS.map((preset) => preset.studTreatment)).toEqual([
      'classic-gloss',
      'tray-gloss',
      'night-gloss',
    ]);
  });
});

describe('buildScenePack', () => {
  it('builds a ritual-ready scene contract with experience, motion, audio, and export defaults', () => {
    const build = buildBlockBuildFromImageData(
      {
        width: 2,
        height: 2,
        data: flattenPixels([
          [196, 40, 28, 255],
          [0, 85, 191, 255],
          [255, 205, 0, 255],
          [255, 255, 255, 255],
        ]),
      },
      { columns: 2 },
    );

    const scenePack = buildScenePack({
      brandName: 'Codex Blocks',
      fileName: 'codex-blocks.png',
      build,
      input: {
        kind: 'image',
        brandName: 'Codex Blocks',
        fileMeta: {
          fileName: 'codex-blocks.png',
        },
      },
      revealMode: 'faithful',
      visualPresetId: 'primary-play',
    });

    expect(scenePack.exportMeta.version).toBe(SCENEPACK_VERSION);
    expect(scenePack.exportMeta.primaryFormat).toBe('16:9');
    expect(scenePack.visual.preset.id).toBe('primary-play');
    expect(scenePack.experience.revealMode).toBe('faithful');
    expect(scenePack.experience.voiceMode).toBe('sacred-line');
    expect(scenePack.copy.sacredLine).toContain('build');
    expect(scenePack.audio.cueIds.heroReveal).toBe('hero-reveal');
    expect(scenePack.audio.cueIds.sacredLine).toBe('sacred-line');
    expect(scenePack.motion.heroBeatFrame).toBeLessThan(scenePack.motion.worldRevealFrame);
    expect(scenePack.exports.filmFileName).toBe('codex-blocks-reveal-film.mp4');
    expect(scenePack.build.visibleBlockCount).toBe(4);
    expect(scenePack.input.kind).toBe('image');
    expect(scenePack.box.badge.text).toBe('BLOCKS');
    expect(scenePack.builder.cameraPreset).toBe('hero-angle');
    expect(scenePack.instructions.steps.length).toBeGreaterThan(2);
    expect(scenePack.commerce.status).toBe('coming-soon');
  });

  it('produces schema-valid JSON payloads for remotion', () => {
    const build = buildBlockBuildFromImageData(
      {
        width: 2,
        height: 2,
        data: flattenPixels([
          [0, 200, 83, 255],
          [0, 200, 83, 255],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ]),
      },
      { columns: 1 },
    );

    const scenePack = buildScenePack({
      brandName: 'OpenAI Devs',
      fileName: 'openai-devs.png',
      build,
      dominantColor: BLOCK_PALETTE.green,
      input: {
        kind: 'image',
        brandName: 'OpenAI Devs',
        fileMeta: {
          fileName: 'openai-devs.png',
        },
      },
      revealMode: 'imagination',
      visualPresetId: 'night-shift',
    });

    expect(ScenePackSchema.safeParse(scenePack).success).toBe(true);
  });

  it('keeps the build deterministic across reveal modes while changing the world plan', () => {
    const build = buildBlockBuildFromImageData(
      {
        width: 2,
        height: 2,
        data: flattenPixels([
          [0, 200, 83, 255],
          [0, 85, 191, 255],
          [0, 200, 83, 255],
          [0, 85, 191, 255],
        ]),
      },
      { columns: 2 },
    );

    const faithful = buildScenePack({
      brandName: 'OpenAI Devs',
      fileName: 'openai-devs.png',
      build,
      dominantColor: BLOCK_PALETTE.green,
      input: {
        kind: 'image',
        brandName: 'OpenAI Devs',
        fileMeta: {
          fileName: 'openai-devs.png',
        },
      },
      revealMode: 'faithful',
      visualPresetId: 'build-table',
    });
    const imagination = buildScenePack({
      brandName: 'OpenAI Devs',
      fileName: 'openai-devs.png',
      build,
      dominantColor: BLOCK_PALETTE.green,
      input: {
        kind: 'image',
        brandName: 'OpenAI Devs',
        fileMeta: {
          fileName: 'openai-devs.png',
        },
      },
      revealMode: 'imagination',
      visualPresetId: 'build-table',
    });

    expect(faithful.build.grid).toEqual(imagination.build.grid);
    expect(faithful.world.cameraEmotion).toBe('monument');
    expect(imagination.world.cameraEmotion).toBe('expansion');
    expect(faithful.world.concept).not.toBe(imagination.world.concept);
    expect(faithful.instructions.partManifest).toEqual(imagination.instructions.partManifest);
    expect(faithful.box.metadataRail[0]?.label).toBe('Builder age');
  });

  it('normalizes prompt concepts into the same top-level contract shape as uploaded images', () => {
    const build = buildBlockBuildFromImageData(
      {
        width: 2,
        height: 2,
        data: flattenPixels([
          [196, 40, 28, 255],
          [255, 213, 0, 255],
          [0, 85, 191, 255],
          [255, 255, 255, 255],
        ]),
      },
      { columns: 2 },
    );
    const input: ConceptInput = {
      kind: 'prompt',
      brandName: 'Fries Truck',
      prompt: 'A joyful fries truck built from blocks rolling through a tiny city.',
      promptConcept: {
        brandName: 'Fries Truck',
        boxTitle: 'Fries Truck',
        boxSubtitle: 'Street snack sprint',
        promptSummary: 'A red and black fries truck cruising through a bright block city.',
        badgeSerial: 'B-114',
        metadataFlavor: 'street-build',
        coverConcept: {
          motif: 'truck',
          accentColors: ['#C4281C', '#FFD500', '#0055BF'],
          caption: 'Hot fries. Sharp turns. Block-city energy.',
        },
        worldConcept: 'A tiny downtown build with a snack truck at the center.',
      },
    };

    const scenePack = buildScenePack({
      brandName: 'Fries Truck',
      fileName: 'fries-truck.prompt',
      build,
      input,
      revealMode: 'imagination',
      visualPresetId: 'primary-play',
    });

    expect(scenePack.input.kind).toBe('prompt');
    expect(scenePack.input.prompt).toContain('fries truck');
    expect(scenePack.box.title).toBe('Fries Truck');
    expect(scenePack.box.subtitle).toBe('Street snack sprint');
    expect(scenePack.box.coverArtMode).toBe('prompt-concept');
    expect(scenePack.commerce.ctaLabel).toBe('Buy the bricks');
  });
});
