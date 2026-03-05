import type { FC } from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import type { z } from 'zod';

import { buildExperiencePlan } from '../lib/experience-plan';
import { ScenePackSchema } from '../lib/scene-pack';
import { BlockGridMark, BlocksBadge, CueLayer, FONT_STACKS, FrameShell, WorldChipCloud } from './shared';

export type RevealSceneProps = {
  revealMode?: 'faithful' | 'imagination';
  scenePack: z.infer<typeof ScenePackSchema>;
  withCues?: boolean;
  lensText?: {
    label: string;
    headline: string;
    summary: string;
  };
};

export const RevealScene16x9: FC<RevealSceneProps> = ({
  revealMode,
  scenePack,
  withCues = true,
  lensText,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const headerReveal = spring({
    fps,
    frame,
    config: { damping: 18, stiffness: 120 },
  });
  const sacredLineReveal = spring({
    fps,
    frame: Math.max(0, frame - 140),
    config: { damping: 16, stiffness: 120 },
  });
  const thesisReveal = spring({
    fps,
    frame: Math.max(0, frame - 250),
    config: { damping: 20, stiffness: 110 },
  });

  const revealScenePack =
    revealMode && revealMode !== scenePack.experience.revealMode
      ? (() => {
          const nextPlan = buildExperiencePlan({
            brandName: scenePack.brand.name,
            dominantColor: scenePack.build.dominantColor,
            revealMode,
            visualPresetId: scenePack.visual.preset.id,
          });

          return {
            ...scenePack,
            experience: { ...scenePack.experience, revealMode },
            world: nextPlan.world,
            motion: nextPlan.motion,
            copy: {
              ...scenePack.copy,
              sacredLine: nextPlan.copy.sacredLine,
            },
            audio: {
              ...scenePack.audio,
              sacredLineScript: nextPlan.copy.sacredLine,
            },
          };
        })()
      : scenePack;

  return (
    <FrameShell scenePack={revealScenePack}>
      {withCues ? <CueLayer mode={lensText ? 'arc' : 'reveal'} /> : null}
      <AbsoluteFill style={{ padding: 8 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateRows: 'auto 1fr auto',
            gap: 20,
            height: '100%',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr auto',
              gap: 22,
              alignItems: 'center',
            }}
          >
            <BlocksBadge serial={revealScenePack.box.badge.serial} size="sm" />
            <div style={{ transform: `translateY(${(1 - headerReveal) * 18}px)`, opacity: headerReveal }}>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  opacity: 0.58,
                  textTransform: 'uppercase',
                }}
              >
                Build Studio
              </div>
              <h1
                style={{
                  fontFamily: FONT_STACKS.display,
                  fontSize: 70,
                  fontWeight: 700,
                  letterSpacing: '-0.08em',
                  lineHeight: 0.9,
                  margin: '12px 0 8px',
                }}
              >
                {revealScenePack.copy.title}
              </h1>
              <p style={{ fontSize: 24, fontWeight: 500, margin: 0, opacity: 0.78, maxWidth: 900 }}>
                {revealScenePack.world.concept}
              </p>
            </div>
            <div
              style={{
                borderRadius: 999,
                backgroundColor: '#101828',
                color: '#FFFDF8',
                padding: '14px 18px',
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                boxShadow: '0 12px 24px rgba(16, 24, 40, 0.18)',
              }}
            >
              {revealScenePack.experience.revealMode}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '248px 1fr 270px', gap: 22 }}>
            <div
              style={{
                display: 'grid',
                alignContent: 'start',
                gap: 16,
                borderRadius: 34,
                backgroundColor: '#FFFFFF',
                border: '1px solid rgba(16, 24, 40, 0.08)',
                padding: 20,
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.12em', opacity: 0.58, textTransform: 'uppercase' }}>
                Sorting trays
              </div>
              {revealScenePack.instructions.partManifest.slice(0, 4).map((item) => (
                <div
                  key={item.colorId}
                  style={{
                    borderRadius: 24,
                    background: 'linear-gradient(180deg, #FFFFFF, #F1F6FB)',
                    padding: 16,
                    boxShadow: 'inset 0 -5px 0 rgba(16, 24, 40, 0.06)',
                  }}
                >
                  <div
                    style={{
                      height: 14,
                      borderRadius: 999,
                      backgroundColor: item.hex,
                      boxShadow: 'inset 0 -3px 0 rgba(16, 24, 40, 0.12)',
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 12 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.72 }}>
                      {item.colorName}
                    </span>
                    <strong style={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{item.count}</strong>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 36,
                backgroundColor: '#0055BF',
                boxShadow: 'inset 0 -12px 0 rgba(16, 24, 40, 0.12)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 24,
                  borderRadius: 30,
                  border: '1px solid rgba(255,255,255,0.18)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: 26,
                  right: 26,
                  top: 24,
                  height: 14,
                  borderRadius: 999,
                  background:
                    'radial-gradient(circle at 8px 8px, rgba(255,255,255,0.72) 0 32%, rgba(255,255,255,0.16) 34%, transparent 38%) 0 0 / 52px 14px repeat-x',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '53%',
                  transform: `translate(-50%, -50%) scale(${0.92 + headerReveal * 0.08})`,
                }}
              >
                <BlockGridMark scenePack={revealScenePack} scale={1.24} />
              </div>
              <WorldChipCloud scenePack={revealScenePack} />

              <div
                style={{
                  position: 'absolute',
                  left: 40,
                  right: 40,
                  bottom: 38,
                  textAlign: 'center',
                  transform: `translateY(${(1 - sacredLineReveal) * 24}px)`,
                  opacity: sacredLineReveal,
                }}
              >
                <div
                  style={{
                    display: 'inline-block',
                    borderRadius: 22,
                    backgroundColor: '#FFD500',
                    color: '#101828',
                    padding: '16px 22px',
                    boxShadow: '0 18px 36px rgba(16, 24, 40, 0.14)',
                  }}
                >
                  <div
                    style={{
                      fontFamily: FONT_STACKS.display,
                      fontSize: 38,
                      fontWeight: 700,
                      lineHeight: 1,
                    }}
                  >
                    {revealScenePack.copy.sacredLine}
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                alignContent: 'start',
                gap: 16,
                borderRadius: 34,
                backgroundColor: '#FFFFFF',
                border: '1px solid rgba(16, 24, 40, 0.08)',
                padding: 20,
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.12em', opacity: 0.58, textTransform: 'uppercase' }}>
                Studio controls
              </div>
              {[
                ['Camera', revealScenePack.builder.cameraPreset],
                ['Scene', revealScenePack.builder.scenePreset],
                ['Board', revealScenePack.builder.boardTheme],
                ['Tray focus', revealScenePack.builder.partTrayEmphasis],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    borderRadius: 24,
                    backgroundColor: '#F4F7FB',
                    padding: 16,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', opacity: 0.54, textTransform: 'uppercase' }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.12, marginTop: 8 }}>
                    {value}
                  </div>
                </div>
              ))}

              {lensText ? (
                <div
                  style={{
                    borderRadius: 26,
                    backgroundColor: '#FFF4C7',
                    color: '#101828',
                    padding: 18,
                    boxShadow: 'inset 0 -5px 0 rgba(16, 24, 40, 0.08)',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', opacity: 0.56, textTransform: 'uppercase' }}>
                    {lensText.label}
                  </div>
                  <div style={{ fontFamily: FONT_STACKS.display, fontSize: 28, fontWeight: 700, lineHeight: 0.98, marginTop: 10 }}>
                    {lensText.headline}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.3, marginTop: 10, opacity: 0.78 }}>
                    {lensText.summary}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              alignItems: 'center',
              gap: 22,
              opacity: thesisReveal,
              transform: `translateY(${(1 - thesisReveal) * 16}px)`,
            }}
          >
            <div
              style={{
                borderRadius: 28,
                backgroundColor: '#FFFFFF',
                padding: '18px 22px',
                border: '1px solid rgba(16, 24, 40, 0.08)',
                fontSize: 22,
                fontWeight: 600,
              }}
            >
              {revealScenePack.copy.thesis}
            </div>
            <div
              style={{
                borderRadius: 999,
                backgroundColor: '#FFFFFF',
                padding: '14px 18px',
                border: '1px solid rgba(16, 24, 40, 0.08)',
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              {revealScenePack.motion.depthPlan}
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </FrameShell>
  );
};
