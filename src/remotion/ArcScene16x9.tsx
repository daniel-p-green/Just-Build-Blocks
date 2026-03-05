import type { FC } from 'react';
import type { z } from 'zod';

import { ScenePackSchema } from '../lib/scene-pack';
import { RevealScene16x9 } from './RevealScene16x9';

export type ArcSceneProps = {
  arcIndex: 0 | 1 | 2;
  scenePack: z.infer<typeof ScenePackSchema>;
  withCues?: boolean;
};

const ARC_LABELS = ['Instant Magic', 'Nostalgia Bridge', 'World Building'] as const;

export const ArcScene16x9: FC<ArcSceneProps> = ({ arcIndex, scenePack, withCues = true }) => {
  const arc = scenePack.storyArcs[arcIndex];

  return (
    <RevealScene16x9
      lensText={{
        label: ARC_LABELS[arcIndex],
        headline: arc.headline,
        summary: arc.summary,
      }}
      revealMode={arcIndex === 2 ? 'imagination' : 'faithful'}
      scenePack={scenePack}
      withCues={withCues}
    />
  );
};
