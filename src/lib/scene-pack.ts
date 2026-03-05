import { z } from 'zod';

import {
  BLOCK_PALETTE,
  buildStoryArcs,
  type BlockBuild,
  type BlockColor,
  type StoryArc,
} from './block-engine';
import {
  ConceptInputSchema,
  type ConceptInput,
  type PromptConcept,
} from './concept-input';
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

export const SCENEPACK_VERSION = '2.0.0';

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
    label: 'Primary play',
    description: 'White shell, strong primaries, and a classic set-box read.',
    recommendedColumns: 36,
    backgroundMood: 'white-board',
    studTreatment: 'classic-gloss',
    accentStyle: 'primary-panels',
  },
  {
    id: 'build-table',
    label: 'Build table',
    description: 'Green tray energy with stronger sorting logic and maker-desk confidence.',
    recommendedColumns: 40,
    backgroundMood: 'green-mat',
    studTreatment: 'tray-gloss',
    accentStyle: 'sorter-trays',
  },
  {
    id: 'night-shift',
    label: 'Night shift',
    description: 'Dark bench drama with bright pieces and late-night momentum.',
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
export type BuilderScenePreset = 'monument-plaza' | 'micro-city' | 'studio-shelf';
export type BuilderBoardTheme = 'openai-studio' | 'playfield' | 'night-bench';
export type BuilderTrayEmphasis = 'balanced' | 'counts-first' | 'color-first';

export type InstructionStep = {
  id: string;
  title: string;
  detail: string;
};

export type PartManifestItem = {
  colorId: string;
  colorName: string;
  hex: string;
  count: number;
};

export type ScenePack = {
  input: ConceptInput;
  brand: {
    name: string;
    sourceFileName: string;
    uploadedAt: string;
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
  box: {
    badge: {
      text: 'BLOCKS';
      serial: string;
    };
    title: string;
    subtitle: string;
    metadataRail: BoxMetadataItem[];
    coverArtMode: 'block-build' | 'prompt-concept';
    heroCaption: string;
  };
  builder: {
    cameraPreset: BuilderCameraPreset;
    scenePreset: BuilderScenePreset;
    boardTheme: BuilderBoardTheme;
    partTrayEmphasis: BuilderTrayEmphasis;
    densityColumns: number;
  };
  instructions: {
    steps: InstructionStep[];
    partManifest: PartManifestItem[];
    countTotals: {
      totalPieces: number;
      uniqueColors: number;
    };
    colorBins: PartManifestItem[];
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
  storyArcs: StoryArc[];
  exports: {
    stillFileName: string;
    builderStillFileName: string;
    instructionsFileName: string;
    filmFileName: string;
    sceneFileName: string;
    handoffFileName: string;
    posterFrameFileName?: string;
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

const BlockColorSchema = z.object({
  id: z.string(),
  name: z.string(),
  hex: z.string(),
  rgb: z.tuple([z.number(), z.number(), z.number()]),
});

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

const ExperienceSchema = z.object({
  revealMode: z.enum(['faithful', 'imagination']),
  wowMode: z.enum(['still-only', 'cinematic']),
  voiceMode: z.literal('sacred-line'),
});

const WorldSchema = z.object({
  concept: z.string(),
  elements: z.array(z.string()).min(3).max(5),
  cameraEmotion: z.enum(['monument', 'curiosity', 'expansion']),
});

const CopySchema = z.object({
  title: z.string(),
  tagline: z.string(),
  thesis: z.string(),
  sacredLine: z.string(),
});

const MotionSchema = z.object({
  assemblyStyle: z.enum(['snap-stack', 'tray-build', 'night-lift']),
  depthPlan: z.enum(['stud-rise', 'tray-run', 'bench-beam']),
  heroBeatFrame: z.number(),
  worldRevealFrame: z.number(),
});

const AudioSchema = z.object({
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
});

const BoxMetadataItemSchema = z.object({
  label: z.string(),
  value: z.string(),
});

const PartManifestItemSchema = z.object({
  colorId: z.string(),
  colorName: z.string(),
  hex: z.string(),
  count: z.number(),
});

export const ScenePackSchema = z.object({
  input: ConceptInputSchema,
  brand: z.object({
    name: z.string(),
    sourceFileName: z.string(),
    uploadedAt: z.string(),
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
  box: z.object({
    badge: z.object({
      text: z.literal('BLOCKS'),
      serial: z.string(),
    }),
    title: z.string(),
    subtitle: z.string(),
    metadataRail: z.array(BoxMetadataItemSchema).min(4).max(4),
    coverArtMode: z.enum(['block-build', 'prompt-concept']),
    heroCaption: z.string(),
  }),
  builder: z.object({
    cameraPreset: z.enum(['hero-angle', 'top-down', 'street-level']),
    scenePreset: z.enum(['monument-plaza', 'micro-city', 'studio-shelf']),
    boardTheme: z.enum(['openai-studio', 'playfield', 'night-bench']),
    partTrayEmphasis: z.enum(['balanced', 'counts-first', 'color-first']),
    densityColumns: z.number(),
  }),
  instructions: z.object({
    steps: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        detail: z.string(),
      }),
    ),
    partManifest: z.array(PartManifestItemSchema),
    countTotals: z.object({
      totalPieces: z.number(),
      uniqueColors: z.number(),
    }),
    colorBins: z.array(PartManifestItemSchema),
  }),
  experience: ExperienceSchema,
  world: WorldSchema,
  copy: CopySchema,
  motion: MotionSchema,
  audio: AudioSchema,
  storyArcs: z.array(StoryArcSchema),
  exports: z.object({
    stillFileName: z.string(),
    builderStillFileName: z.string(),
    instructionsFileName: z.string(),
    filmFileName: z.string(),
    sceneFileName: z.string(),
    handoffFileName: z.string(),
    posterFrameFileName: z.string().optional(),
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

const buildPromptBoxFields = (promptConcept: PromptConcept | undefined, brandName: string) => ({
  title: promptConcept?.boxTitle ?? brandName,
  subtitle: promptConcept?.boxSubtitle ?? 'Custom build set',
  serial:
    promptConcept?.badgeSerial ??
    `B-${slugifyBrandName(brandName).slice(0, 3).toUpperCase().padEnd(3, '0')}`,
  caption:
    promptConcept?.coverConcept.caption ??
    'A custom block build sparked from one image and finished with clean OpenAI clarity.',
});

const buildPartManifest = (build: BlockBuild): PartManifestItem[] =>
  Object.entries(build.countsByColor)
    .map(([colorId, count]) => {
      const matchedColor = Object.values(BLOCK_PALETTE).find((color) => color.id === colorId);

      if (!matchedColor) {
        return null;
      }

      return {
        colorId: matchedColor.id,
        colorName: matchedColor.name,
        hex: matchedColor.hex,
        count: count ?? 0,
      };
    })
    .filter((item): item is PartManifestItem => item !== null)
    .sort((left, right) => right.count - left.count);

const buildInstructionSteps = (
  brandName: string,
  build: BlockBuild,
  partManifest: PartManifestItem[],
  revealMode: RevealMode,
): InstructionStep[] => {
  const primary = partManifest[0]?.colorName ?? 'Studio White';
  const secondary = partManifest[1]?.colorName ?? primary;
  const accent = partManifest[2]?.colorName ?? secondary;
  const shapeCue =
    build.visibleBounds === null
      ? 'keep the footprint compact'
      : `let the footprint hold at ${build.visibleBounds.maxX - build.visibleBounds.minX + 1} columns wide`;

  return [
    {
      id: 'tray-01',
      title: 'Sort the trays',
      detail: `Group the ${primary} and ${secondary} pieces first so the silhouette clicks in fast.`,
    },
    {
      id: 'base-02',
      title: 'Lock the base build',
      detail: `Build the widest planes first and ${shapeCue} before you reach for the accent colors.`,
    },
    {
      id: 'edge-03',
      title: 'Snap the hero edges',
      detail: `Use the ${accent} pieces to sharpen the mark and make ${brandName} read at a glance.`,
    },
    {
      id: 'world-04',
      title: 'Stage the reveal',
      detail:
        revealMode === 'faithful'
          ? 'Frame the finished mark like a monument on the build table with rails, trays, and one clear focal lane.'
          : 'Open the finished mark into a playful micro-world so the set feels larger than the logo that started it.',
    },
  ];
};

const buildMetadataRail = ({
  build,
  promptConcept,
  revealMode,
}: {
  build: BlockBuild;
  promptConcept?: PromptConcept;
  revealMode: RevealMode;
}): BoxMetadataItem[] => [
  {
    label: 'Builder age',
    value: promptConcept ? '12+' : '10+',
  },
  {
    label: 'Build ID',
    value:
      promptConcept?.badgeSerial ??
      `JBB-${Math.max(101, build.cells.length).toString().padStart(3, '0')}`,
  },
  {
    label: 'Pieces',
    value: String(build.cells.length),
  },
  {
    label: 'Mode',
    value: revealMode === 'faithful' ? 'Faithful reveal' : 'Imagination reveal',
  },
];

const buildBuilderPlan = ({
  preset,
  revealMode,
  columns,
}: {
  preset: VisualPreset;
  revealMode: RevealMode;
  columns: number;
}): ScenePack['builder'] => ({
  cameraPreset:
    revealMode === 'faithful'
      ? 'hero-angle'
      : preset.id === 'night-shift'
        ? 'street-level'
        : 'top-down',
  scenePreset:
    revealMode === 'faithful'
      ? 'monument-plaza'
      : preset.id === 'primary-play'
        ? 'micro-city'
        : 'studio-shelf',
  boardTheme:
    preset.id === 'night-shift'
      ? 'night-bench'
      : preset.id === 'build-table'
        ? 'playfield'
        : 'openai-studio',
  partTrayEmphasis:
    preset.id === 'build-table'
      ? 'counts-first'
      : revealMode === 'imagination'
        ? 'color-first'
        : 'balanced',
  densityColumns: columns,
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
}): ScenePack => {
  const lockedDominantColor = dominantColor ?? build.dominantColor ?? BLOCK_PALETTE.green;
  const preset = findVisualPreset(visualPresetId);
  const experiencePlan = buildExperiencePlan({
    brandName,
    dominantColor: lockedDominantColor,
    revealMode,
    visualPresetId,
  });
  const slug = slugifyBrandName(brandName);
  const promptConcept = input.kind === 'prompt' ? input.promptConcept : undefined;
  const partManifest = buildPartManifest(build);
  const instructionSteps = buildInstructionSteps(brandName, build, partManifest, revealMode);
  const boxFields = buildPromptBoxFields(promptConcept, brandName);
  const metadataRail = buildMetadataRail({
    build,
    promptConcept,
    revealMode,
  });

  return {
    input,
    brand: {
      name: brandName,
      sourceFileName: fileName,
      uploadedAt,
    },
    build: {
      grid: build,
      visibleBlockCount: build.cells.length,
      paletteCounts: build.countsByColor,
      dominantColor: lockedDominantColor,
    },
    visual: {
      preset,
      canvasSize: {
        width: 1600,
        height: 900,
      },
    },
    box: {
      badge: {
        text: 'BLOCKS',
        serial: boxFields.serial,
      },
      title: boxFields.title,
      subtitle: boxFields.subtitle,
      metadataRail,
      coverArtMode: input.kind === 'prompt' ? 'prompt-concept' : 'block-build',
      heroCaption: boxFields.caption,
    },
    builder: buildBuilderPlan({
      preset,
      revealMode,
      columns: build.columns,
    }),
    instructions: {
      steps: instructionSteps,
      partManifest,
      countTotals: {
        totalPieces: build.cells.length,
        uniqueColors: partManifest.length,
      },
      colorBins: partManifest,
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
      : experiencePlan.world,
    copy: {
      title: boxFields.title,
      tagline: DEFAULT_COPY.tagline,
      thesis: DEFAULT_COPY.thesis,
      sacredLine: experiencePlan.copy.sacredLine,
    },
    motion: experiencePlan.motion,
    audio: {
      sourceMode: 'local-cues',
      cueIds: DEFAULT_SOUND_CUES,
      sacredLineScript: experiencePlan.copy.sacredLine,
    },
    storyArcs: buildStoryArcs({
      brandName,
      dominantColor: lockedDominantColor,
    }),
    exports: {
      stillFileName: `${slug}-set-box-16x9.png`,
      builderStillFileName: `${slug}-builder-still-16x9.png`,
      instructionsFileName: `${slug}-build-sheet.txt`,
      filmFileName: `${slug}-reveal-film.mp4`,
      sceneFileName: `${slug}-scene-pack.json`,
      handoffFileName: `${slug}-film-handoff.json`,
      posterFrameFileName: `${slug}-poster-frame.png`,
    },
    commerce: {
      status: 'coming-soon',
      ctaLabel: 'Buy the bricks',
      heroMessage:
        'Buy the bricks is coming soon. For now, keep the still, the clip, and the set story.',
    },
    exportMeta: {
      version: SCENEPACK_VERSION,
      primaryFormat: '16:9',
    },
  };
};
