import type { ScenePack } from '../../lib/scene-pack';

type FlagshipHeroArtifact =
  | 'package-stage'
  | 'input-stage'
  | 'direction-stage'
  | 'transformation-stage'
  | 'viewport-stage'
  | 'folio-stage'
  | 'collector-tray';

type FlagshipRouteRules = {
  deferSecondaryTruth: boolean;
  heroArtifact: FlagshipHeroArtifact;
  maxCaptionLines: 1 | 2 | 3;
  maxPrimaryActions: 1 | 2 | 3;
  railMode: 'compact' | 'quiet';
};

export type PackageViewModel = {
  ageMark: string;
  badgeText: string;
  collectorLabel: string;
  heroCaption: string;
  pieceCount: string;
  serial: string;
  subtitle: string;
  title: string;
};

export type RevealViewModel = {
  caption: string;
  chips: Array<{ label: string; value: string }>;
  eyebrow: string;
  storyBody: string;
  storyTitle: string;
  support: string;
  title: string;
};

export type InstructionsViewModel = {
  chips: Array<{ label: string; value: string }>;
  eyebrow: string;
  support: string;
  title: string;
};

export type KeepsakeViewModel = {
  rawEyebrow: string;
  shareableEyebrow: string;
  support: string;
  title: string;
};

export type FlagshipGrammarPack = {
  desktopMinWidth: 1200;
  routes: {
    creative: FlagshipRouteRules;
    generation: FlagshipRouteRules;
    input: FlagshipRouteRules;
    instructions: FlagshipRouteRules;
    keepsakes: FlagshipRouteRules;
    landing: FlagshipRouteRules;
    reveal: FlagshipRouteRules;
    studio: FlagshipRouteRules;
  };
};

const DEFAULT_AGE = '12+';

const findMetadataValue = (scenePack: ScenePack, label: string) =>
  scenePack.box.metadataRail.find((item) => item.label.toLowerCase() === label.toLowerCase())?.value;

const getPackageCollectorLabel = (scenePack: ScenePack) => {
  if (scenePack.visual.preset.label.toLowerCase().includes('night')) {
    return 'Nocturne';
  }

  if (scenePack.visual.preset.label.toLowerCase().includes('workshop')) {
    return 'Workbench';
  }

  return 'Creator';
};

export const getPackageViewModel = (scenePack: ScenePack): PackageViewModel => ({
  ageMark: findMetadataValue(scenePack, 'Builder age') ?? DEFAULT_AGE,
  badgeText: scenePack.box.badge.text,
  collectorLabel: getPackageCollectorLabel(scenePack),
  heroCaption: scenePack.box.heroCaption,
  pieceCount: `${scenePack.instructions.countTotals.totalPieces} pcs`,
  serial: scenePack.setIdentity.sku,
  subtitle: scenePack.box.subtitle,
  title: scenePack.box.title,
});

export const getRevealViewModel = (scenePack: ScenePack): RevealViewModel => {
  const primaryStory = scenePack.storyArcs[0];

  return {
    caption: `${scenePack.setIdentity.sku} • ${scenePack.setIdentity.launchLine}`,
    chips: [
      {
        label: 'Pieces',
        value: String(scenePack.instructions.countTotals.totalPieces),
      },
      {
        label: 'Colors',
        value: String(scenePack.instructions.countTotals.uniqueColors),
      },
      {
        label: 'Mode',
        value: scenePack.visual.preset.label,
      },
    ],
    eyebrow: scenePack.setIdentity.launchLine,
    storyBody: primaryStory?.summary ?? scenePack.box.heroCaption,
    storyTitle: primaryStory?.headline ?? 'Collector notes',
    support: scenePack.copy.tagline,
    title: scenePack.box.title,
  };
};

export const getInstructionsViewModel = (scenePack: ScenePack): InstructionsViewModel => ({
  chips: [
    {
      label: 'Set',
      value: scenePack.setIdentity.sku,
    },
    {
      label: 'Pieces',
      value: String(scenePack.instructions.countTotals.totalPieces),
    },
    {
      label: 'Colors',
      value: String(scenePack.instructions.countTotals.uniqueColors),
    },
  ],
  eyebrow: 'Instruction book',
  support: 'Build the set one clear spread at a time.',
  title: scenePack.instructions.bookTitle,
});

export const getKeepsakeViewModel = (scenePack: ScenePack): KeepsakeViewModel => ({
  rawEyebrow: 'Build files',
  shareableEyebrow: 'Shareables',
  support: `Take ${scenePack.box.title} with you, then open the handoff layer when you need the build files.`,
  title: 'Keep the Set',
});

const isNightMood = (scenePack: ScenePack) =>
  scenePack.visual.preset.id === 'night-shift' || scenePack.builder.boardTheme === 'night-bench';

export const getFlagshipGrammarPack = (scenePack: ScenePack): FlagshipGrammarPack => ({
  desktopMinWidth: 1200,
  routes: {
    creative: {
      deferSecondaryTruth: true,
      heroArtifact: 'direction-stage',
      maxCaptionLines: 1,
      maxPrimaryActions: 1,
      railMode: 'quiet',
    },
    generation: {
      deferSecondaryTruth: true,
      heroArtifact: 'transformation-stage',
      maxCaptionLines: 1,
      maxPrimaryActions: 1,
      railMode: isNightMood(scenePack) ? 'quiet' : 'compact',
    },
    input: {
      deferSecondaryTruth: true,
      heroArtifact: 'input-stage',
      maxCaptionLines: 2,
      maxPrimaryActions: 2,
      railMode: 'quiet',
    },
    instructions: {
      deferSecondaryTruth: false,
      heroArtifact: 'folio-stage',
      maxCaptionLines: 2,
      maxPrimaryActions: 3,
      railMode: 'compact',
    },
    keepsakes: {
      deferSecondaryTruth: true,
      heroArtifact: 'collector-tray',
      maxCaptionLines: 2,
      maxPrimaryActions: 1,
      railMode: 'compact',
    },
    landing: {
      deferSecondaryTruth: true,
      heroArtifact: 'package-stage',
      maxCaptionLines: 2,
      maxPrimaryActions: 2,
      railMode: 'quiet',
    },
    reveal: {
      deferSecondaryTruth: true,
      heroArtifact: 'package-stage',
      maxCaptionLines: 1,
      maxPrimaryActions: 3,
      railMode: 'quiet',
    },
    studio: {
      deferSecondaryTruth: true,
      heroArtifact: 'viewport-stage',
      maxCaptionLines: 1,
      maxPrimaryActions: 3,
      railMode: 'quiet',
    },
  },
});

export const getDesktopExperiencePack = getFlagshipGrammarPack;
export type DesktopExperiencePack = FlagshipGrammarPack;
