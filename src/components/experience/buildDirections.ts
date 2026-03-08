import type { RevealMode } from '../../lib/experience-plan';
import type { VisualPresetId } from '../../lib/scene-pack';
import type { BuildDirectionId } from './types';

export type BuildDirection = {
  artDirection: string;
  columns: number;
  description: string;
  id: BuildDirectionId;
  label: string;
  revealMode: RevealMode;
  tagline: string;
  visualPresetId: VisualPresetId;
};

export const BUILD_DIRECTIONS: BuildDirection[] = [
  {
    artDirection: 'Crisp box read, clean silhouette, and the strongest flagship presence.',
    columns: 40,
    description: 'The clearest product read and the strongest box reveal.',
    id: 'signature-mosaic',
    label: 'Signature Mosaic',
    revealMode: 'faithful',
    tagline: 'Clean, iconic, immediate.',
    visualPresetId: 'primary-play',
  },
  {
    artDirection: 'Brighter studio mood with a friendlier, more playful bench read.',
    columns: 44,
    description: 'A warmer take that brings the build process closer to the front.',
    id: 'desk-collectible',
    label: 'Desk Collectible',
    revealMode: 'imagination',
    tagline: 'Warmer, brighter, closer.',
    visualPresetId: 'build-table',
  },
  {
    artDirection: 'Late-night spotlight with stronger contrast and calmer drama.',
    columns: 48,
    description: 'A darker bench treatment with a sharper spotlight and more contrast.',
    id: 'night-bench',
    label: 'Night Bench',
    revealMode: 'imagination',
    tagline: 'Sharper, darker, bolder.',
    visualPresetId: 'night-shift',
  },
];

export const getBuildDirectionConfig = (directionId: BuildDirectionId) =>
  BUILD_DIRECTIONS.find((direction) => direction.id === directionId) ?? BUILD_DIRECTIONS[0]!;
