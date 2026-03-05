import type { FC } from 'react';
import { AbsoluteFill } from 'remotion';
import type { z } from 'zod';

import { ScenePackSchema } from '../lib/scene-pack';
import { BlockGridMark, BlocksBadge, FONT_STACKS, FrameShell, WorldChipCloud } from './shared';

export type BrandStillProps = {
  scenePack: z.infer<typeof ScenePackSchema>;
};

export const BrandStill16x9: FC<BrandStillProps> = ({ scenePack }) => {
  const paletteCounts = Object.entries(scenePack.build.paletteCounts).sort((left, right) => right[1] - left[1]);
  const heroMeta = scenePack.box.metadataRail[0];
  const railMeta = scenePack.box.metadataRail.slice(1);

  return (
    <FrameShell scenePack={scenePack}>
      <AbsoluteFill style={{ padding: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '254px 1fr', gap: 24, height: '100%' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateRows: 'auto 1fr auto',
              gap: 18,
            }}
          >
            <BlocksBadge serial={scenePack.box.badge.serial} />
            <div
              style={{
                display: 'grid',
                gap: 18,
                borderRadius: 34,
                backgroundColor: '#0055BF',
                color: '#FFFDF8',
                padding: 22,
                boxShadow: 'inset 0 -8px 0 rgba(16, 24, 40, 0.14)',
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  opacity: 0.78,
                  textTransform: 'uppercase',
                }}
              >
                {heroMeta?.label ?? 'Builder age'}
              </div>
              <div
                style={{
                  fontFamily: FONT_STACKS.display,
                  fontSize: 96,
                  fontWeight: 700,
                  lineHeight: 0.9,
                }}
              >
                {heroMeta?.value ?? '10+'}
              </div>
              <div style={{ display: 'grid', gap: 16 }}>
                {railMeta.map((item) => (
                  <div key={item.label} style={{ display: 'grid', gap: 4 }}>
                    <span
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        opacity: 0.72,
                        textTransform: 'uppercase',
                      }}
                    >
                      {item.label}
                    </span>
                    <strong
                      style={{
                        fontSize: 32,
                        fontWeight: 700,
                        lineHeight: 1,
                      }}
                    >
                      {item.value}
                    </strong>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                borderRadius: 30,
                backgroundColor: '#FFF4C7',
                color: '#101828',
                padding: 20,
                boxShadow: 'inset 0 -6px 0 rgba(16, 24, 40, 0.1)',
              }}
            >
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  opacity: 0.62,
                  textTransform: 'uppercase',
                }}
              >
                Coming soon
              </div>
              <div
                style={{
                  fontFamily: FONT_STACKS.display,
                  fontSize: 30,
                  fontWeight: 700,
                  lineHeight: 0.98,
                  marginTop: 10,
                }}
              >
                {scenePack.commerce.ctaLabel}
              </div>
              <div style={{ fontSize: 18, lineHeight: 1.35, marginTop: 10, opacity: 0.78 }}>
                {scenePack.commerce.heroMessage}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateRows: 'auto auto 1fr auto', gap: 18 }}>
            <div
              style={{
                borderRadius: 24,
                backgroundColor: '#FFD500',
                color: '#101828',
                padding: '18px 24px',
                boxShadow: 'inset 0 -6px 0 rgba(16, 24, 40, 0.1)',
              }}
            >
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                }}
              >
                Built with GPT-5.4 + Codex
              </div>
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  opacity: 0.58,
                  textTransform: 'uppercase',
                }}
              >
                Just Build with Blocks
              </div>
              <h1
                style={{
                  fontFamily: FONT_STACKS.display,
                  fontSize: 88,
                  fontWeight: 700,
                  letterSpacing: '-0.08em',
                  lineHeight: 0.9,
                  margin: 0,
                }}
              >
                {scenePack.box.title}
              </h1>
              <p style={{ fontSize: 30, fontWeight: 600, lineHeight: 1.22, margin: 0, maxWidth: 820 }}>
                {scenePack.box.subtitle}
              </p>
            </div>

            <div
              style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 38,
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
                  left: 34,
                  right: 34,
                  top: 28,
                  height: 14,
                  borderRadius: 999,
                  background:
                    'radial-gradient(circle at 8px 8px, rgba(255,255,255,0.72) 0 32%, rgba(255,255,255,0.16) 34%, transparent 38%) 0 0 / 52px 14px repeat-x',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  right: 28,
                  top: 28,
                  display: 'grid',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    borderRadius: 24,
                    backgroundColor: '#FFFFFF',
                    color: '#101828',
                    padding: '14px 18px',
                    minWidth: 140,
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.12em', opacity: 0.56, textTransform: 'uppercase' }}>
                    Pieces
                  </div>
                  <div style={{ fontFamily: FONT_STACKS.display, fontSize: 40, fontWeight: 700, lineHeight: 1 }}>
                    {scenePack.instructions.countTotals.totalPieces}
                  </div>
                </div>
                <div
                  style={{
                    borderRadius: 24,
                    backgroundColor: '#FFFFFF',
                    color: '#101828',
                    padding: '14px 18px',
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.12em', opacity: 0.56, textTransform: 'uppercase' }}>
                    Cover mode
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.1 }}>
                    {scenePack.box.coverArtMode === 'prompt-concept' ? 'Prompt concept' : 'Block build'}
                  </div>
                </div>
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '54%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <BlockGridMark isStill scenePack={scenePack} scale={1.5} />
              </div>
              <WorldChipCloud scenePack={scenePack} />
              <div
                style={{
                  position: 'absolute',
                  left: 72,
                  right: 72,
                  bottom: 34,
                  borderRadius: 24,
                  backgroundColor: 'rgba(255,255,255,0.92)',
                  color: '#101828',
                  padding: '16px 22px',
                }}
              >
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    opacity: 0.58,
                    textTransform: 'uppercase',
                  }}
                >
                  Cover caption
                </div>
                <div style={{ fontSize: 24, fontWeight: 600, lineHeight: 1.28, marginTop: 6 }}>
                  {scenePack.box.heroCaption}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 18 }}>
              <div
                style={{
                  borderRadius: 30,
                  backgroundColor: '#FFFFFF',
                  color: '#101828',
                  padding: 22,
                  border: '1px solid rgba(16, 24, 40, 0.08)',
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.12em', opacity: 0.56, textTransform: 'uppercase' }}>
                  Thesis
                </div>
                <div style={{ fontSize: 26, fontWeight: 600, lineHeight: 1.28, marginTop: 10 }}>
                  {scenePack.copy.thesis}
                </div>
              </div>
              <div
                style={{
                  borderRadius: 30,
                  backgroundColor: '#FFFFFF',
                  color: '#101828',
                  padding: 22,
                  border: '1px solid rgba(16, 24, 40, 0.08)',
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.12em', opacity: 0.56, textTransform: 'uppercase' }}>
                  Build counts
                </div>
                <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
                  {paletteCounts.slice(0, 4).map(([id, count]) => {
                    const color =
                      scenePack.build.grid.cells.find((cell) => cell.color.id === id)?.color.hex ?? '#101828';

                    return (
                      <div
                        key={id}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '20px 1fr auto',
                          gap: 12,
                          alignItems: 'center',
                        }}
                      >
                        <span
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: 999,
                            backgroundColor: color,
                            boxShadow: 'inset -2px -3px 0 rgba(16, 24, 40, 0.12)',
                          }}
                        />
                        <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                          {id}
                        </span>
                        <span style={{ fontSize: 28, fontWeight: 700 }}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </FrameShell>
  );
};
