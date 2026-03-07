export const OPENAI_SANS_FAMILY =
  '"OpenAI Sans", "Avenir Next", "Helvetica Neue", Arial, sans-serif';

export const BLOCK_TABLE_COLORS = {
  studioWhite: '#FFFFFF',
  graphiteInk: '#101828',
  signalRed: '#C4281C',
  orbitBlue: '#0055BF',
  brightYellow: '#FFD500',
  builderGreen: '#00C853',
  warmTray: '#F7F3EC',
  softShadow: '#C9D0D8',
  darkBench: '#121826',
  greenMat: '#2E7D32',
} as const;

export type BuildTableAppearance = {
  appBackground: string;
  boardFrame: string;
  boardInset: string;
  trayFill: string;
  trayShadow: string;
  ink: string;
  mutedInk: string;
  trim: [string, string, string];
  accent: string;
  chipFill: string;
  chipInk: string;
};

export const BUILD_TABLE_APPEARANCE = {
  'primary-play': {
    appBackground: '#FFF9EA',
    boardFrame: '#F7F3EC',
    boardInset: '#0E1829',
    trayFill: '#FFFFFF',
    trayShadow: '#D7DFE8',
    ink: BLOCK_TABLE_COLORS.graphiteInk,
    mutedInk: 'rgba(16, 24, 40, 0.68)',
    trim: [
      BLOCK_TABLE_COLORS.signalRed,
      BLOCK_TABLE_COLORS.orbitBlue,
      BLOCK_TABLE_COLORS.brightYellow,
    ],
    accent: BLOCK_TABLE_COLORS.signalRed,
    chipFill: '#FFF7E8',
    chipInk: BLOCK_TABLE_COLORS.graphiteInk,
  },
  'build-table': {
    appBackground: '#DFF0D7',
    boardFrame: '#EAF7E1',
    boardInset: '#1A2B1D',
    trayFill: '#FCFBF7',
    trayShadow: '#C7D8C4',
    ink: BLOCK_TABLE_COLORS.graphiteInk,
    mutedInk: 'rgba(16, 24, 40, 0.68)',
    trim: [
      BLOCK_TABLE_COLORS.builderGreen,
      BLOCK_TABLE_COLORS.signalRed,
      BLOCK_TABLE_COLORS.orbitBlue,
    ],
    accent: BLOCK_TABLE_COLORS.builderGreen,
    chipFill: '#F2FAEE',
    chipInk: BLOCK_TABLE_COLORS.graphiteInk,
  },
  'night-shift': {
    appBackground: '#111827',
    boardFrame: '#192235',
    boardInset: '#0A101C',
    trayFill: '#182238',
    trayShadow: '#060A12',
    ink: '#FFFDF8',
    mutedInk: 'rgba(255, 253, 248, 0.72)',
    trim: [
      BLOCK_TABLE_COLORS.orbitBlue,
      BLOCK_TABLE_COLORS.brightYellow,
      BLOCK_TABLE_COLORS.signalRed,
    ],
    accent: BLOCK_TABLE_COLORS.brightYellow,
    chipFill: '#1D2942',
    chipInk: '#FFFDF8',
  },
} as const satisfies Record<string, BuildTableAppearance>;

export const getBuildTableAppearance = (
  presetId: keyof typeof BUILD_TABLE_APPEARANCE,
) => BUILD_TABLE_APPEARANCE[presetId];
