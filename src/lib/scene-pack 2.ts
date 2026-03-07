import { z } from 'zod';

import {
  BLOCK_PALETTE,
  buildStoryArcs,
  type BlockBuild,
  type BlockColor,
  type StoryArc,
} from './block-engine';
import { ConceptInputSchema, type ConceptInput, type PromptConcept } from './concept-input';
import {
  buildExperiencePlan,
  type AssemblyStyle,
  type CameraEmotion,
  type DepthPlan,
  type RevealMode,
  type VisualPresetKey,
  type VoiceMode,
  type WowMode,
} from './experience-plan';
import { buildRealSet, type RealSetBuild, type SetPartManifestItem } from './set-engine';

export const SCENEPACK_VERSION = '3.0.0';

export type VisualPresetId = VisualPresetKey;

export type VisualPreset = {
  id: VisualPresetId;
  label: string;
  description: string;
  recommendedColumns: number;
  backgroundMood: 'white-board' | 'green-mat' | 'dark-bench';
  studTreatment: 'classic-gloss' | 'tray-gloss' | 'night-gloss';
  accentStyle: 'primary-panels' | 'sorter-trays' | 'primary-on-dark';
};

export const VISUAL_PRESETS: VisualPreset[] = [
  {
    id: 'primary-play',
    label: 'Signature box',
    description: 'Clean OpenAI shell, strong blue set box, and premium collectible framing.',
    recommendedColumns: 40,
    backgroundMood: 'white-board',
    studTreatment: 'classic-gloss',
    accentStyle: 'primary-panels',
  },
  {
    id: 'build-table',
    label: 'Workshop cutaway',
    description: 'A brighter making surface with stronger tray and instruction energy.',
    recommendedColumns: 44,
    backgroundMood: 'green-mat',
    studTreatment: 'tray-gloss',
    accentStyle: 'sorter-trays',
  },
  {
    id: 'night-shift',
    label: 'Night bench',
    description: 'Late-night product drama with darker bench surfaces and bright packaging trim.',
    recommendedColumns: 48,
    backgroundMood: 'dark-bench',
    studTreatment: 'night-gloss',
    accentStyle: 'primary-on-dark',
  },
];

export type SoundCueIds = {
  upload: 'upload';
  quantize: 'quantize';
  build: 'build';
  heroReveal: 'hero-reveal';
  sacredLine: 'sacred-line';
  montage: 'montage';
  resolve: 'resolve';
};

export type BoxMetadataItem = {
  label: string;
  value: string;
};

export type BuilderCameraPreset = 'hero-angle' | 'top-down' | 'street-level';
export type BuilderScenePreset = 'signature-plinth' | 'instruction-table' | 'studio-shelf';
export type BuilderBoardTheme = 'openai-studio' | 'playfield' | 'night-bench';
export type BuilderTrayEmphasis = 'balanced' | 'counts-first' | 'color-first';

export type InstructionStep = {
  id: string;
  title: string;
  detail: string;
  assemblyIds: string[];
  partCount: number;
  partsNeeded: Array<{
    colorId: string;
    colorName: string;
    count: number;
    hex: string;
    partId: string;
    partName: string;
  }>;
};

export type PartManifestItem = SetPartManifestItem;

export type ScenePack = {
  input: ConceptInput;
  brand: {
    name: string;
    sourceFileName: string;
    uploadedAt: string;
  };
  setIdentity: {
    name: string;
    collection: string;
    launchLine: string;
    sku: string;
    accentColor: string;
    buildId: string;
    heroModel: string;
  };
  build: {
    grid: BlockBuild;
    visibleBlockCount: number;
    paletteCounts: Record<string, number>;
    dominantColor: BlockColor;
  };
  visual: {
    preset: VisualPreset;
    canvasSize: {
      width: number;
      height: number;
    };
  };
  packaging: {
    style: 'signature-box';
    accentColor: string;
    heroShotAngle: RealSetBuild['spec']['packagingAngle'];
    benchProps: string[];
    stickerSystem: string[];
    heroCaption: string;
    coverArtMode: 'signature-set' | 'prompt-concept';
    metadataRail: BoxMetadataItem[];
  };
  box: {
    badge: {
      text: 'BLOCKS';
      serial: string;
    };
    title: string;
    subtitle: string;
    metadataRail: BoxMetadataItem[];
    coverArtMode: 'signature-set' | 'prompt-concept';
    heroCaption: string;
  };
  model: {
    canonical: 'ModelIR';
    style: RealSetBuild['spec']['modelStyle'];
    intent: RealSetBuild['intent'];
    spec: RealSetBuild['spec'];
    ir: RealSetBuild['model'];
    partManifest: PartManifestItem[];
    validation: RealSetBuild['validation'];
  };
  builder: {
    cameraPreset: BuilderCameraPreset;
    scenePreset: BuilderScenePreset;
    boardTheme: BuilderBoardTheme;
    partTrayEmphasis: BuilderTrayEmphasis;
    densityColumns: number;
    accentColor: string;
  };
  instructions: {
    theme: 'airy-sky-blue';
    bookTitle: string;
    steps: InstructionStep[];
    partManifest: PartManifestItem[];
    countTotals: {
      totalPieces: number;
      uniqueColors: number;
      uniqueParts: number;
    };
    colorBins: Array<{
      colorId: string;
      colorName: string;
      count: number;
      hex: string;
    }>;
  };
  experience: {
    revealMode: RevealMode;
    wowMode: WowMode;
    voiceMode: VoiceMode;
  };
  world: {
    concept: string;
    elements: string[];
    cameraEmotion: CameraEmotion;
  };
  copy: {
    title: string;
    tagline: string;
    thesis: string;
    sacredLine: string;
  };
  motion: {
    assemblyStyle: AssemblyStyle;
    depthPlan: DepthPlan;
    heroBeatFrame: number;
    worldRevealFrame: number;
  };
  audio: {
    sourceMode: 'local-cues' | 'generated-voice';
    cueIds: SoundCueIds;
    sacredLineScript: string;
  };
  audioDirection: {
    mood: 'tactile-precise';
    cueSequence: Array<keyof SoundCueIds>;
  };
  storyArcs: StoryArc[];
  exports: {
    stillFileName: string;
    builderStillFileName: string;
    instructionsFileName: string;
    instructionsDataFileName: string;
    manifestFileName: string;
    validationFileName: string;
    filmFileName: string;
    sceneFileName: string;
    handoffFileName: string;
    mpdFileName: string;
    ioFileName: string;
    posterFrameFileName?: string;
  };
  keepsakes: {
    stillFileName: string;
    studioStillFileName: string;
    instructionArtifactFileName: string;
    instructionDataFileName: string;
    mpdFileName: string;
    ioFileName: string;
  };
  commerce: {
    status: 'coming-soon';
    ctaLabel: 'Buy the bricks';
    heroMessage: string;
  };
  exportMeta: {
    version: typeof SCENEPACK_VERSION;
    primaryFormat: '16:9';
  };
};

const StoryArcSchema = z.object({
  id: z.enum(['instant-magic', 'nostalgia-bridge', 'world-building-montage']),
  headline: z.string(),
  summary: z.string(),
  beats: z.array(z.string()),
});

const VisualPresetSchema = z.object({
  id: z.enum(['primary-play', 'build-table', 'night-shift']),
  label: z.string(),
  description: z.string(),
  recommendedColumns: z.number(),
  backgroundMood: z.enum(['white-board', 'green-mat', 'dark-bench']),
  studTreatment: z.enum(['classic-gloss', 'tray-gloss', 'night-gloss']),
  accentStyle: z.enum(['primary-panels', 'sorter-trays', 'primary-on-dark']),
});

const BlockColorSchema = z.object({
  id: z.string(),
  name: z.string(),
  hex: z.string(),
  rgb: z.tuple([z.number(), z.number(), z.number()]),
});

const BlockBuildSchema = z.object({
  columns: z.number(),
  rows: z.number(),
  cells: z.array(
    z.object({
      x: z.number(),
      y: z.number(),
      color: BlockColorSchema,
    }),
  ),
  countsByColor: z.record(z.number()),
  dominantColor: BlockColorSchema.nullable(),
  visibleBounds: z
    .object({
      minX: z.number(),
      maxX: z.number(),
      minY: z.number(),
      maxY: z.number(),
    })
    .nullable(),
});

const BoxMetadataItemSchema = z.object({
  label: z.string(),
  value: z.string(),
});

const PartManifestRoleSchema = z.enum(['backing', 'frame', 'art']);

const PartManifestItemSchema = z.object({
  bricklinkAvailableInColor: z.boolean(),
  bricklinkCatalogUrl: z.string().nullable(),
  bricklinkColorId: z.number().nullable(),
  bricklinkColorName: z.string().nullable(),
  bricklinkItemNo: z.string().nullable(),
  bricklinkItemType: z.literal('P').nullable(),
  colorCode: z.number(),
  colorId: z.string(),
  colorName: z.string(),
  count: z.number(),
  hex: z.string(),
  key: z.string(),
  partId: z.string(),
  partName: z.string(),
  role: PartManifestRoleSchema,
});

const InstructionStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  detail: z.string(),
  assemblyIds: z.array(z.string()),
  partCount: z.number(),
  partsNeeded: z.array(
    z.object({
      colorId: z.string(),
      colorName: z.string(),
      count: z.number(),
      hex: z.string(),
      partId: z.string(),
      partName: z.string(),
    }),
  ),
});

export const ScenePackSchema = z.object({
  input: ConceptInputSchema,
  brand: z.object({
    name: z.string(),
    sourceFileName: z.string(),
    uploadedAt: z.string(),
  }),
  setIdentity: z.object({
    name: z.string(),
    collection: z.string(),
    launchLine: z.string(),
    sku: z.string(),
    accentColor: z.string(),
    buildId: z.string(),
    heroModel: z.string(),
  }),
  build: z.object({
    grid: BlockBuildSchema,
    visibleBlockCount: z.number(),
    paletteCounts: z.record(z.number()),
    dominantColor: BlockColorSchema,
  }),
  visual: z.object({
    preset: VisualPresetSchema,
    canvasSize: z.object({
      width: z.number(),
      height: z.number(),
    }),
  }),
  packaging: z.object({
    style: z.literal('signature-box'),
    accentColor: z.string(),
    heroShotAngle: z.enum(['three-quarter-left', 'three-quarter-right']),
    benchProps: z.array(z.string()),
    stickerSystem: z.array(z.string()),
    heroCaption: z.string(),
    coverArtMode: z.enum(['signature-set', 'prompt-concept']),
    metadataRail: z.array(BoxMetadataItemSchema),
  }),
  box: z.object({
    badge: z.object({
      text: z.literal('BLOCKS'),
      serial: z.string(),
    }),
    title: z.string(),
    subtitle: z.string(),
    metadataRail: z.array(BoxMetadataItemSchema),
    coverArtMode: z.enum(['signature-set', 'prompt-concept']),
    heroCaption: z.string(),
  }),
  model: z.object({
    canonical: z.literal('ModelIR'),
    style: z.enum(['monochrome-signature', 'color-display']),
    intent: z.custom<RealSetBuild['intent']>(),
    spec: z.custom<RealSetBuild['spec']>(),
    ir: z.custom<RealSetBuild['model']>(),
    partManifest: z.array(PartManifestItemSchema),
    validation: z.custom<RealSetBuild['validation']>(),
  }),
  builder: z.object({
    cameraPreset: z.enum(['hero-angle', 'top-down', 'street-level']),
    scenePreset: z.enum(['signature-plinth', 'instruction-table', 'studio-shelf']),
    boardTheme: z.enum(['openai-studio', 'playfield', 'night-bench']),
    partTrayEmphasis: z.enum(['balanced', 'counts-first', 'color-first']),
    densityColumns: z.number(),
    accentColor: z.string(),
  }),
  instructions: z.object({
    theme: z.literal('airy-sky-blue'),
    bookTitle: z.string(),
    steps: z.array(InstructionStepSchema),
    partManifest: z.array(PartManifestItemSchema),
    countTotals: z.object({
      totalPieces: z.number(),
      uniqueColors: z.number(),
      uniqueParts: z.number(),
    }),
    colorBins: z.array(
      z.object({
        colorId: z.string(),
        colorName: z.string(),
        count: z.number(),
        hex: z.string(),
      }),
    ),
  }),
  experience: z.object({
    revealMode: z.enum(['faithful', 'imagination']),
    wowMode: z.enum(['still-only', 'cinematic']),
    voiceMode: z.literal('sacred-line'),
  }),
  world: z.object({
    concept: z.string(),
    elements: z.array(z.string()),
    cameraEmotion: z.enum(['monument', 'curiosity', 'expansion']),
  }),
  copy: z.object({
    title: z.string(),
    tagline: z.string(),
    thesis: z.string(),
    sacredLine: z.string(),
  }),
  motion: z.object({
    assemblyStyle: z.enum(['snap-stack', 'tray-build', 'night-lift']),
    depthPlan: z.enum(['stud-rise', 'tray-run', 'bench-beam']),
    heroBeatFrame: z.number(),
    worldRevealFrame: z.number(),
  }),
  audio: z.object({
    sourceMode: z.enum(['local-cues', 'generated-voice']),
    cueIds: z.object({
      upload: z.literal('upload'),
      quantize: z.literal('quantize'),
      build: z.literal('build'),
      heroReveal: z.literal('hero-reveal'),
      sacredLine: z.literal('sacred-line'),
      montage: z.literal('montage'),
      resolve: z.literal('resolve'),
    }),
    sacredLineScript: z.string(),
  }),
  audioDirection: z.object({
    mood: z.literal('tactile-precise'),
    cueSequence: z.array(z.enum(['upload', 'quantize', 'build', 'heroReveal', 'sacredLine', 'montage', 'resolve'])),
  }),
  storyArcs: z.array(StoryArcSchema),
  exports: z.object({
    stillFileName: z.string(),
    builderStillFileName: z.string(),
    instructionsFileName: z.string(),
    instructionsDataFileName: z.string(),
    manifestFileName: z.string(),
    validationFileName: z.string(),
    filmFileName: z.string(),
    sceneFileName: z.string(),
    handoffFileName: z.string(),
    mpdFileName: z.string(),
    ioFileName: z.string(),
    posterFrameFileName: z.string().optional(),
  }),
  keepsakes: z.object({
    stillFileName: z.string(),
    studioStillFileName: z.string(),
    instructionArtifactFileName: z.string(),
    instructionDataFileName: z.string(),
    mpdFileName: z.string(),
    ioFileName: z.string(),
  }),
  commerce: z.object({
    status: z.literal('coming-soon'),
    ctaLabel: z.literal('Buy the bricks'),
    heroMessage: z.string(),
  }),
  exportMeta: z.object({
    version: z.literal(SCENEPACK_VERSION),
    primaryFormat: z.literal('16:9'),
  }),
});

const DEFAULT_COPY = {
  tagline: 'Upload an image or describe it. Build the set.',
  thesis: 'The software is the board. The blocks are the possibilities.',
};

const DEFAULT_SOUND_CUES: SoundCueIds = {
  upload: 'upload',
  quantize: 'quantize',
  build: 'build',
  heroReveal: 'hero-reveal',
  sacredLine: 'sacred-line',
  montage: 'montage',
  resolve: 'resolve',
};

export const slugifyBrandName = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const findVisualPreset = (presetId: VisualPresetId) =>
  VISUAL_PRESETS.find((preset) => preset.id === presetId) ?? VISUAL_PRESETS[0]!;

const buildPromptBoxFields = (promptConcept: PromptConcept | undefined, brandName: string, realSet: RealSetBuild) => ({
  title: promptConcept?.boxTitle ?? realSet.spec.displayTitle ?? realSet.spec.flagshipName,
  subtitle:
    promptConcept?.boxSubtitle ??
    (realSet.spec.displaySubtitle ??
      (realSet.spec.collection === 'BLOCKS Signature Collection'
      ? realSet.spec.launchLine
      : realSet.spec.modelStyle === 'monochrome-signature'
        ? 'Signature monochrome collectible'
        : 'Custom display set')),
  serial:
    promptConcept?.badgeSerial ??
    realSet.spec.buildId,
  caption:
    promptConcept?.coverConcept.caption ??
    (realSet.spec.packagingBrief ||
      (realSet.spec.modelStyle === 'monochrome-signature'
        ? 'A premium black-and-white collectible with real parts, instructions, and exports.'
        : `A collectible build set sparked by ${brandName}.`)),
});

const toColorBins = (partManifest: PartManifestItem[]) =>
  Object.values(
    partManifest.reduce<Record<string, { colorId: string; colorName: string; count: number; hex: string }>>(
      (bins, item) => {
        const existing = bins[item.colorId];

        if (existing) {
          existing.count += item.count;
          return bins;
        }

        bins[item.colorId] = {
          colorId: item.colorId,
          colorName: item.colorName,
          count: item.count,
          hex: item.hex,
        };

        return bins;
      },
      {},
    ),
  ).sort((left, right) => right.count - left.count);

const buildMetadataRail = ({
  partManifest,
  realSet,
  revealMode,
}: {
  partManifest: PartManifestItem[];
  realSet: RealSetBuild;
  revealMode: RevealMode;
}): BoxMetadataItem[] => [
  { label: 'Builder age', value: realSet.spec.modelStyle === 'monochrome-signature' ? '14+' : '10+' },
  { label: 'Build ID', value: realSet.spec.buildId },
  { label: 'Pieces', value: String(partManifest.reduce((total, item) => total + item.count, 0)) },
  { label: 'Mode', value: revealMode === 'faithful' ? 'Signature' : 'Expanded' },
];

const buildBuilderPlan = ({
  preset,
  realSet,
}: {
  preset: VisualPreset;
  realSet: RealSetBuild;
}): ScenePack['builder'] => ({
  cameraPreset: realSet.spec.modelStyle === 'monochrome-signature' ? 'hero-angle' : 'top-down',
  scenePreset: realSet.spec.modelStyle === 'monochrome-signature' ? 'signature-plinth' : 'instruction-table',
  boardTheme:
    preset.id === 'night-shift'
      ? 'night-bench'
      : preset.id === 'build-table'
        ? 'playfield'
        : 'openai-studio',
  partTrayEmphasis: realSet.spec.modelStyle === 'monochrome-signature' ? 'counts-first' : 'balanced',
  densityColumns: realSet.displayGrid.columns,
  accentColor: realSet.spec.accentColor,
});

export const buildScenePack = ({
  input,
  brandName,
  fileName,
  build,
  dominantColor,
  uploadedAt = new Date().toISOString(),
  revealMode,
  visualPresetId,
  wowMode = 'cinematic',
  realSet,
}: {
  input: ConceptInput;
  brandName: string;
  fileName: string;
  build: BlockBuild;
  dominantColor?: BlockColor;
  uploadedAt?: string;
  revealMode: RevealMode;
  visualPresetId: VisualPresetId;
  wowMode?: WowMode;
  realSet?: RealSetBuild;
}): ScenePack => {
  const lockedRealSet =
    realSet ??
    buildRealSet({
      brandName,
      build,
      dominantColor,
      input,
    });
  const lockedDominantColor = dominantColor ?? lockedRealSet.displayGrid.dominantColor ?? BLOCK_PALETTE.black;
  const preset = findVisualPreset(visualPresetId);
  const experiencePlan = buildExperiencePlan({
    brandName,
    dominantColor: lockedDominantColor,
    revealMode,
    visualPresetId,
  });
  const slug = slugifyBrandName(brandName);
  const promptConcept = input.kind === 'prompt' ? input.promptConcept : undefined;
  const partManifest = lockedRealSet.partManifest;
  const colorBins = toColorBins(partManifest);
  const instructionSteps = lockedRealSet.exportBundle.instructionPlan.steps as InstructionStep[];
  const boxFields = buildPromptBoxFields(promptConcept, brandName, lockedRealSet);
  const metadataRail = buildMetadataRail({
    partManifest,
    realSet: lockedRealSet,
    revealMode,
  });
  const totalPieces = partManifest.reduce((total, item) => total + item.count, 0);
  const silhouetteDepth = lockedRealSet.spec.targetStuds.depth - lockedRealSet.spec.plinthDepthStuds;
  const visibleDisplayCells = lockedRealSet.displayGrid.cells.filter((cell) => cell.y < silhouetteDepth).length;

  return {
    input,
    brand: {
      name: brandName,
      sourceFileName: fileName,
      uploadedAt,
    },
    setIdentity: {
      name: lockedRealSet.spec.displayTitle ?? lockedRealSet.spec.flagshipName,
      collection: lockedRealSet.spec.collection,
      launchLine: lockedRealSet.spec.launchLine,
      sku: lockedRealSet.spec.sku,
      accentColor: lockedRealSet.spec.accentColor,
      buildId: lockedRealSet.spec.buildId,
      heroModel: lockedRealSet.spec.flagshipName,
    },
    build: {
      grid: lockedRealSet.displayGrid,
      visibleBlockCount: visibleDisplayCells,
      paletteCounts: lockedRealSet.displayGrid.countsByColor,
      dominantColor: lockedDominantColor,
    },
    visual: {
      preset,
      canvasSize: {
        width: 1600,
        height: 900,
      },
    },
    packaging: {
      style: 'signature-box',
      accentColor: lockedRealSet.spec.accentColor,
      heroShotAngle: lockedRealSet.spec.packagingAngle,
      benchProps: ['parts tray', 'collector card', 'instruction slip'],
      stickerSystem: ['launch-line', 'collector-grade', 'desk-display'],
      heroCaption: boxFields.caption,
      coverArtMode: input.kind === 'prompt' ? 'prompt-concept' : 'signature-set',
      metadataRail,
    },
    box: {
      badge: {
        text: 'BLOCKS',
        serial: boxFields.serial,
      },
      title: boxFields.title,
      subtitle: boxFields.subtitle,
      metadataRail,
      coverArtMode: input.kind === 'prompt' ? 'prompt-concept' : 'signature-set',
      heroCaption: boxFields.caption,
    },
    model: {
      canonical: 'ModelIR',
      style: lockedRealSet.spec.modelStyle,
      intent: lockedRealSet.intent,
      spec: lockedRealSet.spec,
      ir: lockedRealSet.model,
      partManifest,
      validation: lockedRealSet.validation,
    },
    builder: buildBuilderPlan({
      preset,
      realSet: lockedRealSet,
    }),
    instructions: {
      theme: 'airy-sky-blue',
      bookTitle: `${boxFields.title} Instruction Book`,
      steps: instructionSteps,
      partManifest,
      countTotals: {
        totalPieces,
        uniqueColors: colorBins.length,
        uniqueParts: new Set(partManifest.map((item) => item.partId)).size,
      },
      colorBins,
    },
    experience: {
      revealMode,
      wowMode,
      voiceMode: 'sacred-line',
    },
    world: promptConcept
      ? {
          ...experiencePlan.world,
          concept: promptConcept.worldConcept,
        }
      : {
          ...experiencePlan.world,
          concept:
            lockedRealSet.spec.modelStyle === 'monochrome-signature'
              ? revealMode === 'faithful'
                ? 'A premium monochrome Codex collectible on a display plinth.'
                : 'A premium monochrome Codex collectible staged like a launch-ready signature set with trays, studio cues, and quiet motion.'
              : experiencePlan.world.concept,
        },
    copy: {
      title: boxFields.title,
      tagline: DEFAULT_COPY.tagline,
      thesis: DEFAULT_COPY.thesis,
      sacredLine:
        lockedRealSet.spec.modelStyle === 'monochrome-signature'
          ? 'You can just build it.'
          : experiencePlan.copy.sacredLine,
    },
    motion: experiencePlan.motion,
    audio: {
      sourceMode: 'local-cues',
      cueIds: DEFAULT_SOUND_CUES,
      sacredLineScript:
        lockedRealSet.spec.modelStyle === 'monochrome-signature'
          ? 'You can just build it.'
          : experiencePlan.copy.sacredLine,
    },
    audioDirection: {
      mood: 'tactile-precise',
      cueSequence: ['upload', 'quantize', 'build', 'heroReveal', 'sacredLine', 'resolve'],
    },
    storyArcs: buildStoryArcs({
      brandName,
      dominantColor: lockedDominantColor,
    }),
    exports: {
      stillFileName: `${slug}-set-box-16x9.png`,
      builderStillFileName: `${slug}-builder-still-16x9.png`,
      instructionsFileName: `${slug}-instruction-book.html`,
      instructionsDataFileName: `${slug}-instructions.json`,
      manifestFileName: `${slug}-part-manifest.json`,
      validationFileName: `${slug}-validation-report.json`,
      filmFileName: `${slug}-reveal-film.mp4`,
      sceneFileName: `${slug}-scene-pack.json`,
      handoffFileName: `${slug}-film-handoff.json`,
      mpdFileName: lockedRealSet.exportBundle.mpdFileName,
      ioFileName: lockedRealSet.exportBundle.ioFileName,
      posterFrameFileName: `${slug}-poster-frame.png`,
    },
    keepsakes: {
      stillFileName: `${slug}-set-box-16x9.png`,
      studioStillFileName: `${slug}-builder-still-16x9.png`,
      instructionArtifactFileName: `${slug}-instruction-book.html`,
      instructionDataFileName: `${slug}-instructions.json`,
      mpdFileName: lockedRealSet.exportBundle.mpdFileName,
      ioFileName: lockedRealSet.exportBundle.ioFileName,
    },
    commerce: {
      status: 'coming-soon',
      ctaLabel: 'Buy the bricks',
      heroMessage:
        'Buy the bricks is coming soon. For now, keep the collectible stills, the instruction book, and the export bundle.',
    },
    exportMeta: {
      version: SCENEPACK_VERSION,
      primaryFormat: '16:9',
    },
  };
};
