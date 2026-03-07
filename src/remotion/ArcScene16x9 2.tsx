import type { FC } from 'react';
import type { z } from 'zod';

import type { AudioPackId } from '../lib/audio-pack';
import { ScenePackSchema } from '../lib/scene-pack';
import { RevealScene16x9 } from './RevealScene16x9';

export type ArcSceneProps = {
  arcIndex: 0 | 1 | 2;
  audioPack?: AudioPackId;
  scenePack: z.infer<typeof ScenePackSchema>;
  withCues?: boolean;
};

const ARC_LABELS = ['Instant Magic', 'Nostalgia Bridge', 'World Building'] as const;

export const ArcScene16x9: FC<ArcSceneProps> = ({ arcIndex, audioPack = 'original', scenePack, withCues = true }) => {
  const arc = scenePack.storyArcs[arcIndex];

  return (
    <RevealScene16x9
      audioPack={audioPack}
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
