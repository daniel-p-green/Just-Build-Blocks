import type { FC } from 'react';
import { AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import type { z } from 'zod';

import { ScenePackSchema } from '../lib/scene-pack';
import { RevealScene16x9 } from './RevealScene16x9';
import { BlocksBadge, CueLayer, FONT_STACKS, FrameShell } from './shared';

export type MasterConceptFilmProps = {
  scenePack: z.infer<typeof ScenePackSchema>;
};

export const MasterConceptFilm16x9: FC<MasterConceptFilmProps> = ({ scenePack }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const outroFrame = Math.max(0, frame - 28 * fps);
  const outroReveal = spring({
    fps,
    frame: outroFrame,
    config: { damping: 16, stiffness: 140 },
  });

  return (
    <AbsoluteFill>
      <CueLayer mode="master" />
      <Sequence durationInFrames={12 * fps} from={0}>
        <RevealScene16x9
          lensText={{
            label: 'Instant Magic',
            headline: scenePack.storyArcs[0]?.headline ?? '',
            summary: scenePack.storyArcs[0]?.summary ?? '',
          }}
          revealMode="faithful"
          scenePack={scenePack}
          withCues={false}
        />
      </Sequence>
      <Sequence durationInFrames={10 * fps} from={12 * fps}>
        <RevealScene16x9
          lensText={{
            label: 'Nostalgia Bridge',
            headline: scenePack.storyArcs[1]?.headline ?? '',
            summary: scenePack.storyArcs[1]?.summary ?? '',
          }}
          revealMode="faithful"
          scenePack={scenePack}
          withCues={false}
        />
      </Sequence>
      <Sequence durationInFrames={6 * fps} from={22 * fps}>
        <RevealScene16x9
          lensText={{
            label: 'World Building',
            headline: scenePack.storyArcs[2]?.headline ?? '',
            summary: scenePack.storyArcs[2]?.summary ?? '',
          }}
          revealMode="imagination"
          scenePack={scenePack}
          withCues={false}
        />
      </Sequence>
      <Sequence durationInFrames={4 * fps} from={28 * fps}>
        <FrameShell scenePack={scenePack}>
          <AbsoluteFill
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              padding: 88,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                display: 'grid',
                gap: 24,
                justifyItems: 'center',
                transform: `scale(${0.92 + outroReveal * 0.08})`,
                opacity: outroReveal,
              }}
            >
              <BlocksBadge serial={scenePack.box.badge.serial} size="lg" />
              <div
                style={{
                  borderRadius: 34,
                  backgroundColor: '#0055BF',
                  color: '#FFFDF8',
                  padding: '40px 48px',
                  minWidth: 920,
                  boxShadow: 'inset 0 -10px 0 rgba(16, 24, 40, 0.12)',
                }}
              >
                <div
                  style={{
                    fontFamily: FONT_STACKS.display,
                    fontSize: 80,
                    fontWeight: 700,
                    letterSpacing: '-0.08em',
                    lineHeight: 0.92,
                  }}
                >
                  {scenePack.copy.thesis}
                </div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    marginTop: 20,
                    opacity: 0.78,
                    textTransform: 'uppercase',
                  }}
                >
                  {scenePack.commerce.ctaLabel} coming soon
                </div>
              </div>
            </div>
          </AbsoluteFill>
        </FrameShell>
      </Sequence>
    </AbsoluteFill>
  );
};
