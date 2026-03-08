import { describe, expect, it } from 'vitest';

import {
  getFlagshipGrammarPack,
  getInstructionsViewModel,
  getKeepsakeViewModel,
  getPackageViewModel,
  getRevealViewModel,
} from './desktopPresentation';

const baseScenePack = {
  box: {
    badge: {
      text: 'BLOCKS',
    },
    heroCaption: 'A premium signal collectible.',
    metadataRail: [
      { label: 'Builder age', value: '18+' },
    ],
    subtitle: 'Collector-grade icon',
    title: 'Signal Monolith',
  },
  builder: {
    accentColor: '#0055BF',
    boardTheme: 'openai-studio',
  },
  copy: {
    tagline: 'From signal to collectible.',
  },
  instructions: {
    bookTitle: 'Signal Monolith Instruction Book',
    countTotals: {
      totalPieces: 412,
      uniqueColors: 5,
    },
  },
  setIdentity: {
    launchLine: 'Series 01',
    sku: 'SIG-0042',
  },
  storyArcs: [
    {
      headline: 'Signal rebuilt in blocks.',
      summary: 'A proof moment for the product.',
    },
  ],
  visual: {
    preset: {
      id: 'primary-play',
      label: 'Signature box',
    },
  },
} as never;

describe('desktop experience presentation', () => {
  it('derives compact route rules from the canonical scene pack', () => {
    const pack = getFlagshipGrammarPack(baseScenePack);

    expect(pack.desktopMinWidth).toBe(1200);
    expect(pack.routes.landing.heroArtifact).toBe('package-stage');
    expect(pack.routes.input.maxPrimaryActions).toBe(2);
    expect(pack.routes.creative.heroArtifact).toBe('direction-stage');
    expect(pack.routes.reveal.maxPrimaryActions).toBe(3);
    expect(pack.routes.studio.heroArtifact).toBe('viewport-stage');
    expect(pack.routes.keepsakes.deferSecondaryTruth).toBe(true);
  });

  it('derives package, reveal, instructions, and keepsake models from the same scene pack', () => {
    const packageModel = getPackageViewModel(baseScenePack);
    const revealModel = getRevealViewModel(baseScenePack);
    const instructionsModel = getInstructionsViewModel(baseScenePack);
    const keepsakeModel = getKeepsakeViewModel(baseScenePack);

    expect(packageModel.title).toBe('Signal Monolith');
    expect(packageModel.pieceCount).toBe('412 pcs');
    expect(packageModel.ageMark).toBe('18+');
    expect(revealModel.storyTitle).toMatch(/signal rebuilt/i);
    expect(revealModel.chips).toHaveLength(3);
    expect(instructionsModel.title).toBe('Signal Monolith Instruction Book');
    expect(keepsakeModel.rawEyebrow).toBe('Build files');
  });
});
