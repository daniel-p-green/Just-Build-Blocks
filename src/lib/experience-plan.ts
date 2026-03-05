import type { BlockColor } from './block-engine';

export type VisualPresetKey = 'primary-play' | 'build-table' | 'night-shift';
export type RevealMode = 'faithful' | 'imagination';
export type WowMode = 'still-only' | 'cinematic';
export type VoiceMode = 'sacred-line';
export type CameraEmotion = 'monument' | 'curiosity' | 'expansion';
export type AssemblyStyle = 'snap-stack' | 'tray-build' | 'night-lift';
export type DepthPlan = 'stud-rise' | 'tray-run' | 'bench-beam';

export type ExperiencePlan = {
  world: {
    concept: string;
    elements: string[];
    cameraEmotion: CameraEmotion;
  };
  motion: {
    assemblyStyle: AssemblyStyle;
    depthPlan: DepthPlan;
    heroBeatFrame: number;
    worldRevealFrame: number;
  };
  copy: {
    sacredLine: string;
  };
};

const FAITHFUL_WORLD_ELEMENTS = [
  'pedestal',
  'guide rail',
  'board edge',
  'stud lane',
  'color bin',
  'tray wall',
  'base plate',
  'signal tower',
] as const;

const IMAGINATION_WORLD_ELEMENTS = [
  'launch ramp',
  'bridge span',
  'maker plaza',
  'signal arch',
  'stack tower',
  'curiosity lane',
  'build horizon',
  'idea crane',
] as const;

const PRESET_MOTION = {
  'primary-play': {
    assemblyStyle: 'snap-stack',
    depthPlan: 'stud-rise',
  },
  'build-table': {
    assemblyStyle: 'tray-build',
    depthPlan: 'tray-run',
  },
  'night-shift': {
    assemblyStyle: 'night-lift',
    depthPlan: 'bench-beam',
  },
} satisfies Record<
  VisualPresetKey,
  {
    assemblyStyle: AssemblyStyle;
    depthPlan: DepthPlan;
  }
>;

const hashValue = (value: string) =>
  value.split('').reduce((total, character) => total + character.charCodeAt(0), 0);

const buildElementSet = (
  bank: readonly string[],
  seed: string,
  count = 4,
) => {
  const start = hashValue(seed) % bank.length;

  return Array.from({ length: count }, (_, index) => bank[(start + index) % bank.length] ?? bank[0]!);
};

const colorCue = (color: BlockColor) =>
  color.name.replace(/^(signal|orbit|bright|studio|builder|midnight)\s+/i, '').toLowerCase();

export const buildExperiencePlan = ({
  brandName,
  dominantColor,
  revealMode,
  visualPresetId,
}: {
  brandName: string;
  dominantColor: BlockColor;
  revealMode: RevealMode;
  visualPresetId: VisualPresetKey;
}): ExperiencePlan => {
  const colorName = colorCue(dominantColor);
  const motion = PRESET_MOTION[visualPresetId];
  const worldElements = buildElementSet(
    revealMode === 'faithful' ? FAITHFUL_WORLD_ELEMENTS : IMAGINATION_WORLD_ELEMENTS,
    `${brandName}:${visualPresetId}:${revealMode}:${dominantColor.id}`,
  );

  return {
    world: {
      concept:
        revealMode === 'faithful'
          ? `${brandName} clicks into a ${colorName} block monument on the build table.`
          : `${brandName} opens into a ${colorName} block world of ramps, bridges, and fresh pieces.`,
      elements: worldElements,
      cameraEmotion: revealMode === 'faithful' ? 'monument' : 'expansion',
    },
    motion: {
      ...motion,
      heroBeatFrame: 300,
      worldRevealFrame: 420,
    },
    copy: {
      sacredLine:
        revealMode === 'faithful'
          ? 'You already know how to build.'
          : 'Start with one block, then build farther.',
    },
  };
};
