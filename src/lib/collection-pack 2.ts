import { buildBlockBuildFromImageData, type ImageDataLike } from './block-engine';
import type { ConceptInput } from './concept-input';
import type { RevealMode } from './experience-plan';
import {
  buildScenePack,
  type ScenePack,
  type VisualPresetId,
} from './scene-pack';
import {
  buildRealSet,
  type BrickSetSpec,
  type RealSetBuild,
  type SetArchetype,
} from './set-engine';

export type SetSpec = {
  sku: string;
  accentColor: string;
  archetype: SetArchetype;
  brandName: string;
  collection: string;
  coverTitle: string;
  coverSubtitle: string;
  emblemPattern: string[];
  flagshipName: string;
  heroCaption: string;
  launchLine: string;
  packagingAngle: BrickSetSpec['packagingAngle'];
  shelfBlurb: string;
  targetStuds: BrickSetSpec['targetStuds'];
};

export type CollectionSpec = {
  commissionHeadline: string;
  commissionPrompt: string;
  description: string;
  featuredSku: string;
  launchLine: string;
  name: string;
  sacredLine: string;
  sets: SetSpec[];
  shelfHeadline: string;
  shelfSupport: string;
};

export type PackagingScene = {
  accentColor: string;
  benchProps: string[];
  heroCaption: string;
  heroShotAngle: BrickSetSpec['packagingAngle'];
  metadataRail: Array<{ label: string; value: string }>;
  stickerSystem: string[];
};

export type InstructionBook = {
  coverTitle: string;
  manifestSpreadTitle: string;
  orientationHints: string[];
  spreads: Array<{
    id: string;
    stepIds: string[];
    title: string;
    type: 'build' | 'manifest';
  }>;
  theme: 'airy-sky-blue';
};

export type CollectionTrailerMetadata = {
  beats: string[];
  durationSeconds: number;
  title: string;
};

export type CollectionSetBuild = {
  input: ConceptInput;
  instructionBook: InstructionBook;
  packagingScene: PackagingScene;
  realSet: RealSetBuild;
  scenePack: ScenePack;
  spec: SetSpec;
};

export type CollectionPack = {
  collection: CollectionSpec;
  comparisonRows: Array<{
    accentColor: string;
    archetype: SetArchetype;
    pieces: number;
    sku: string;
    title: string;
  }>;
  sets: CollectionSetBuild[];
  trailer: CollectionTrailerMetadata;
};

const createImageDataFromPattern = (pattern: string[], scale = 6): ImageDataLike => {
  const width = pattern[0]?.length ?? 1;
  const height = pattern.length || 1;
  const data = new Uint8ClampedArray(width * scale * height * scale * 4);

  pattern.forEach((row, rowIndex) => {
    row.split('').forEach((cell, columnIndex) => {
      const isFilled = cell !== '.';

      for (let pixelY = 0; pixelY < scale; pixelY += 1) {
        for (let pixelX = 0; pixelX < scale; pixelX += 1) {
          const targetX = columnIndex * scale + pixelX;
          const targetY = rowIndex * scale + pixelY;
          const offset = (targetY * width * scale + targetX) * 4;

          data[offset] = 17;
          data[offset + 1] = 17;
          data[offset + 2] = 17;
          data[offset + 3] = isFilled ? 255 : 0;
        }
      }
    });
  });

  return {
    width: width * scale,
    height: height * scale,
    data,
  };
};

const createCollectionInput = (spec: SetSpec): ConceptInput => ({
  kind: 'image',
  brandName: spec.brandName,
  fileMeta: {
    fileName: `${spec.sku.toLowerCase()}.png`,
    mimeType: 'image/png',
  },
});

const toBrickSpec = (spec: SetSpec): BrickSetSpec => ({
  sku: spec.sku,
  buildId: spec.sku,
  collection: spec.collection,
  launchLine: spec.launchLine,
  flagshipName: spec.flagshipName,
  displayTitle: spec.coverTitle,
  displaySubtitle: spec.coverSubtitle,
  packagingBrief: spec.heroCaption,
  silhouetteGoal: spec.shelfBlurb,
  modelStyle: 'monochrome-signature',
  instructionTheme: 'airy-sky-blue',
  accentColor: spec.accentColor,
  archetype: spec.archetype,
  packagingAngle: spec.packagingAngle,
  targetStuds: spec.targetStuds,
  frameMarginStuds: 3,
  plinthDepthStuds: 4,
  backingLayers: 2,
  reliefLayers: 2,
  supportStrategy: 'plinth-supported',
});

const buildPackagingScene = (spec: SetSpec, scenePack: ScenePack): PackagingScene => ({
  accentColor: spec.accentColor,
  benchProps: ['parts tray', 'collector sticker', 'instruction slip'],
  heroCaption: spec.heroCaption,
  heroShotAngle: spec.packagingAngle,
  metadataRail: scenePack.box.metadataRail,
  stickerSystem: ['launch-line', 'collector-grade', 'desk-display'],
});

const buildInstructionBook = (spec: SetSpec, scenePack: ScenePack): InstructionBook => ({
  coverTitle: `${spec.coverTitle} Instruction Book`,
  manifestSpreadTitle: `${spec.coverTitle} Inventory`,
  orientationHints: [
    'Build on a clean flat surface.',
    'Complete each phase before moving to the next spread.',
    'Use the studio stepper to match the book if you want a guided reveal.',
  ],
  spreads: [
    ...scenePack.instructions.steps.map((step) => ({
      id: `${spec.sku.toLowerCase()}-${step.id}`,
      stepIds: [step.id],
      title: step.title,
      type: 'build' as const,
    })),
    {
      id: `${spec.sku.toLowerCase()}-manifest`,
      stepIds: [],
      title: 'Inventory and final check',
      type: 'manifest' as const,
    },
  ],
  theme: 'airy-sky-blue',
});

const buildCollectionSet = ({
  spec,
  revealMode,
  visualPresetId,
}: {
  spec: SetSpec;
  revealMode: RevealMode;
  visualPresetId: VisualPresetId;
}): CollectionSetBuild => {
  const input = createCollectionInput(spec);
  const imageData = createImageDataFromPattern(spec.emblemPattern);
  const build = buildBlockBuildFromImageData(imageData, {
    columns: spec.emblemPattern[0]?.length ?? 24,
  });
  const realSet = buildRealSet({
    brandName: spec.brandName,
    build,
    input,
    setSpec: toBrickSpec(spec),
  });
  const scenePack = buildScenePack({
    input,
    brandName: spec.brandName,
    fileName: input.fileMeta?.fileName ?? `${spec.sku.toLowerCase()}.png`,
    build,
    revealMode,
    visualPresetId,
    realSet,
  });

  scenePack.box.title = spec.coverTitle;
  scenePack.box.subtitle = spec.coverSubtitle;
  scenePack.box.heroCaption = spec.heroCaption;
  scenePack.packaging.heroCaption = spec.heroCaption;
  scenePack.copy.title = spec.coverTitle;

  return {
    input,
    instructionBook: buildInstructionBook(spec, scenePack),
    packagingScene: buildPackagingScene(spec, scenePack),
    realSet,
    scenePack,
    spec,
  };
};

export const SIGNATURE_COLLECTION_SPEC: CollectionSpec = {
  commissionHeadline: 'Commission your set',
  commissionPrompt: 'Bring a new mark or idea into the same premium product line.',
  description: 'A premium collector-grade line of monochrome identity sets with original BLOCKS packaging, guided studio views, and real export bundles.',
  featuredSku: 'COD-001',
  launchLine: 'Series 01',
  name: 'BLOCKS Signature Collection',
  sacredLine: 'Start with a mark. End with a set.',
  shelfHeadline: 'Signature Collection',
  shelfSupport: 'Collector-grade builds for the logos and identities that matter most.',
  sets: [
    {
      sku: 'COD-001',
      accentColor: '#0055BF',
      archetype: 'medallion',
      brandName: 'Codex',
      collection: 'BLOCKS Signature Collection',
      coverTitle: 'Codex Signature Set',
      coverSubtitle: 'Collector-grade terminal icon',
      emblemPattern: [
        '....................',
        '....................',
        '..##................',
        '..###...............',
        '...###..............',
        '....###.............',
        '.....###............',
        '....###.............',
        '...###..............',
        '..###................',
        '..##......######....',
        '..........######....',
        '..........######....',
        '....................',
        '....................',
      ],
      flagshipName: 'Codex Monolith',
      heroCaption: 'A monochrome Codex collectible with a medallion face, premium plinth, and launch-line packaging.',
      launchLine: 'Series 01',
      packagingAngle: 'three-quarter-left',
      shelfBlurb: 'A crisp Codex terminal emblem on a premium medallion-like collectible silhouette.',
      targetStuds: {
        width: 24,
        depth: 24,
      },
    },
    {
      sku: 'BLM-001',
      accentColor: '#00C853',
      archetype: 'medallion',
      brandName: 'OpenAI Bloom',
      collection: 'BLOCKS Signature Collection',
      coverTitle: 'Bloom Signature Set',
      coverSubtitle: 'Botanical launch-line relief',
      emblemPattern: [
        '....................',
        '........##..........',
        '......######........',
        '.....###..###.......',
        '....###....###......',
        '.....###..###.......',
        '..##..######..##....',
        '.####..####..####...',
        '..##..######..##....',
        '.....###..###.......',
        '....###....###......',
        '.....###..###.......',
        '......######........',
        '........##..........',
        '....................',
      ],
      flagshipName: 'Bloom Medallion',
      heroCaption: 'A monochrome bloom relief with clean floral geometry and a restrained green launch accent.',
      launchLine: 'Series 01',
      packagingAngle: 'three-quarter-right',
      shelfBlurb: 'A floral bloom emblem held in a premium medallion format with symmetrical relief.',
      targetStuds: {
        width: 24,
        depth: 24,
      },
    },
    {
      sku: 'AIC-001',
      accentColor: '#6D5EF8',
      archetype: 'emblem-relief',
      brandName: 'AI Collective',
      collection: 'BLOCKS Signature Collection',
      coverTitle: 'AI Collective Set',
      coverSubtitle: 'Network-emblem collector build',
      emblemPattern: [
        '....................',
        '........##..........',
        '......##..##........',
        '....##......##......',
        '....##......##......',
        '......##..##........',
        '........##..........',
        '......######........',
        '....##..##..##......',
        '..##....##....##....',
        '....##..##..##......',
        '......######........',
        '....................',
        '....................',
      ],
      flagshipName: 'Collective Emblem',
      heroCaption: 'A monochrome network emblem with a restrained violet accent and premium collector packaging.',
      launchLine: 'Series 01',
      packagingAngle: 'three-quarter-left',
      shelfBlurb: 'An emblem-relief collectible shaped around a shared network mark and unified geometry.',
      targetStuds: {
        width: 24,
        depth: 24,
      },
    },
    {
      sku: 'KC-001',
      accentColor: '#C4281C',
      archetype: 'badge-plaque',
      brandName: 'Kansas City',
      collection: 'BLOCKS Signature Collection',
      coverTitle: 'Kansas City Set',
      coverSubtitle: 'Monogram collector plaque',
      emblemPattern: [
        '....................',
        '..##......######....',
        '..##.....##.........',
        '..##....##..........',
        '..##...##...........',
        '..#######...........',
        '..#######...........',
        '..##...##...........',
        '..##....##..........',
        '..##.....##.........',
        '..##......######....',
        '....................',
        '....................',
      ],
      flagshipName: 'Kansas City Plaque',
      heroCaption: 'A monochrome KC collector plaque with restrained city-red packaging accents and desk-display confidence.',
      launchLine: 'Series 01',
      packagingAngle: 'three-quarter-right',
      shelfBlurb: 'A letterform-led badge plaque that keeps the KC silhouette clean at desk scale.',
      targetStuds: {
        width: 24,
        depth: 24,
      },
    },
  ],
};

export const buildCollectionPack = ({
  revealMode = 'faithful',
  visualPresetId = 'primary-play',
}: {
  revealMode?: RevealMode;
  visualPresetId?: VisualPresetId;
} = {}): CollectionPack => {
  const sets = SIGNATURE_COLLECTION_SPEC.sets.map((spec) =>
    buildCollectionSet({
      spec,
      revealMode,
      visualPresetId,
    }),
  );

  return {
    collection: SIGNATURE_COLLECTION_SPEC,
    comparisonRows: sets.map((item) => ({
      accentColor: item.spec.accentColor,
      archetype: item.spec.archetype,
      pieces: item.scenePack.instructions.countTotals.totalPieces,
      sku: item.spec.sku,
      title: item.spec.coverTitle,
    })),
    sets,
    trailer: {
      beats: [
        'Shelf reveal',
        'Box closeups',
        'Monochrome object turntables',
        'Instruction spreads',
        'Commission flow tease',
      ],
      durationSeconds: 54,
      title: 'BLOCKS Signature Collection Trailer',
    },
  };
};
