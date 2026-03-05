import { Audio } from '@remotion/media';
import type { FC, ReactNode } from 'react';
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

import {
  OPENAI_SANS_FAMILY,
  getBuildTableAppearance,
} from '../lib/brand-system';
import { type ScenePack } from '../lib/scene-pack';

export const FONT_STACKS = {
  display: OPENAI_SANS_FAMILY,
  body: OPENAI_SANS_FAMILY,
  mono: OPENAI_SANS_FAMILY,
};

export const SCENE_BACKGROUNDS: Record<
  ScenePack['visual']['preset']['backgroundMood'],
  { base: string; frame: string; board: string; tray: string; ink: string; muted: string }
> = {
  'white-board': {
    base: '#EDF3F8',
    frame: '#FFFFFF',
    board: '#0055BF',
    tray: '#FFFFFF',
    ink: '#101828',
    muted: 'rgba(16, 24, 40, 0.72)',
  },
  'green-mat': {
    base: '#E8F1EB',
    frame: '#FFFFFF',
    board: '#2F7D32',
    tray: '#FFFFFF',
    ink: '#101828',
    muted: 'rgba(16, 24, 40, 0.72)',
  },
  'dark-bench': {
    base: '#E8EEF6',
    frame: '#FFFFFF',
    board: '#182238',
    tray: '#F8FBFF',
    ink: '#101828',
    muted: 'rgba(16, 24, 40, 0.72)',
  },
};

export const BlocksBadge: FC<{
  serial?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ serial, size = 'md' }) => {
  const dimensions = {
    sm: {
      borderRadius: 20,
      fontSize: 28,
      minWidth: 126,
      padding: '16px 22px 18px',
      serialSize: 12,
    },
    md: {
      borderRadius: 26,
      fontSize: 38,
      minWidth: 170,
      padding: '20px 28px 22px',
      serialSize: 13,
    },
    lg: {
      borderRadius: 30,
      fontSize: 48,
      minWidth: 220,
      padding: '24px 34px 26px',
      serialSize: 14,
    },
  }[size];

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: dimensions.minWidth,
        padding: dimensions.padding,
        borderRadius: dimensions.borderRadius,
        background: 'linear-gradient(180deg, #F54A3A 0%, #C4281C 100%)',
        boxShadow:
          'inset 0 -8px 0 rgba(16, 24, 40, 0.14), 0 18px 36px rgba(196, 40, 28, 0.26)',
        color: '#FFFDF8',
        fontFamily: FONT_STACKS.display,
        fontSize: dimensions.fontSize,
        fontStyle: 'italic',
        fontWeight: 700,
        letterSpacing: '-0.06em',
      }}
    >
      BLOCKS
      {serial ? (
        <span
          style={{
            position: 'absolute',
            right: 16,
            bottom: 10,
            fontSize: dimensions.serialSize,
            fontStyle: 'normal',
            letterSpacing: '0.12em',
            opacity: 0.9,
          }}
        >
          {serial}
        </span>
      ) : null}
    </div>
  );
};

const BlockTile: FC<{
  color: string;
  delay: number;
  depthPlan: ScenePack['motion']['depthPlan'];
  isStill?: boolean;
  size: number;
  x: number;
  y: number;
}> = ({ color, delay, depthPlan, isStill = false, size, x, y }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reveal = isStill
    ? 1
    : spring({
        fps,
        frame: Math.max(0, frame - delay),
        config: {
          damping: 16,
          mass: 0.8,
          stiffness: 150,
        },
      });
  const depth = depthPlan === 'bench-beam' ? size * 0.2 : depthPlan === 'tray-run' ? size * 0.16 : size * 0.18;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        transform: `translateY(${(1 - reveal) * 28}px) translateX(${(1 - reveal) * -10}px) scale(${0.48 + reveal * 0.52})`,
        opacity: reveal,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translate(${depth * 0.14}px, ${depth}px)`,
          borderRadius: 12,
          backgroundColor: 'rgba(16, 24, 40, 0.22)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 12,
          backgroundColor: color,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: size * 0.08,
          top: size * 0.08,
          width: size * 0.84,
          height: size * 0.18,
          borderRadius: 999,
          backgroundColor: 'rgba(255,255,255,0.24)',
        }}
      />
      {[0, 1, 2, 3].map((stud) => {
        const offsets = [
          { left: 9, top: 9 },
          { left: 25, top: 9 },
          { left: 9, top: 25 },
          { left: 25, top: 25 },
        ][stud]!;

        return (
          <div
            key={stud}
            style={{
              position: 'absolute',
              width: size * (7 / 42),
              height: size * (7 / 42),
              left: offsets.left * (size / 42),
              top: offsets.top * (size / 42),
              borderRadius: 999,
              backgroundColor: 'rgba(255,255,255,0.28)',
            }}
          />
        );
      })}
    </div>
  );
};

export const BlockGridMark: FC<{
  scenePack: ScenePack;
  isStill?: boolean;
  scale?: number;
}> = ({ scenePack, isStill = false, scale = 1 }) => {
  const bounds = scenePack.build.grid.visibleBounds;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!bounds || scenePack.build.grid.cells.length === 0) {
    return (
      <div
        style={{
          alignItems: 'center',
          border: '2px dashed rgba(255,255,255,0.24)',
          borderRadius: 24,
          color: 'rgba(255,255,255,0.72)',
          display: 'flex',
          fontFamily: FONT_STACKS.body,
          fontSize: 18,
          fontWeight: 700,
          height: 180 * scale,
          justifyContent: 'center',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          width: 240 * scale,
        }}
      >
        No visible blocks
      </div>
    );
  }

  const visibleCells = scenePack.build.grid.cells.filter(
    (cell) =>
      cell.x >= bounds.minX &&
      cell.x <= bounds.maxX &&
      cell.y >= bounds.minY &&
      cell.y <= bounds.maxY,
  );
  const columns = bounds.maxX - bounds.minX + 1;
  const rows = bounds.maxY - bounds.minY + 1;
  const tileSize = 42 * scale;
  const width = columns * tileSize;
  const height = rows * tileSize;
  const monumentLift = isStill
    ? 1
    : spring({
        fps,
        frame,
        config: { damping: 18, stiffness: 120 },
      });

  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        transform: `translateY(${(1 - monumentLift) * 24}px) scale(${0.92 + monumentLift * 0.14})`,
      }}
    >
      {visibleCells.map((cell, index) => (
        <BlockTile
          color={cell.color.hex}
          delay={index * 2}
          depthPlan={scenePack.motion.depthPlan}
          isStill={isStill}
          key={`${cell.x}-${cell.y}`}
          size={tileSize}
          x={(cell.x - bounds.minX) * tileSize}
          y={(cell.y - bounds.minY) * tileSize}
        />
      ))}
    </div>
  );
};

export const WorldChipCloud: FC<{
  scenePack: ScenePack;
}> = ({ scenePack }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const appearBase = spring({
    fps,
    frame: Math.max(0, frame - 140),
    config: { damping: 18, stiffness: 120 },
  });
  const positions =
    scenePack.experience.revealMode === 'faithful'
      ? [
          { left: '12%', top: '72%' },
          { left: '73%', top: '16%' },
          { left: '67%', top: '74%' },
          { left: '16%', top: '14%' },
        ]
      : [
          { left: '4%', top: '74%' },
          { left: '76%', top: '10%' },
          { left: '69%', top: '78%' },
          { left: '11%', top: '8%' },
        ];
  const appearance = getBuildTableAppearance(scenePack.visual.preset.id);

  return (
    <>
      {scenePack.world.elements.map((element, index) => {
        const appear = interpolate(appearBase, [0, 1], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const position = positions[index] ?? positions[0]!;

        return (
          <div
            key={element}
            style={{
              position: 'absolute',
              left: position.left,
              top: position.top,
              transform: `translateY(${(1 - appear) * (scenePack.experience.revealMode === 'faithful' ? 18 : 36)}px)`,
              opacity: appear * (scenePack.experience.revealMode === 'faithful' ? 0.78 : 0.94),
              borderRadius: 999,
              border: `2px solid ${appearance.trim[index % appearance.trim.length] ?? scenePack.build.dominantColor.hex}`,
              backgroundColor: index % 2 === 0 ? appearance.chipFill : '#FFFFFF',
              color: appearance.chipInk,
              fontFamily: FONT_STACKS.body,
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: '0.08em',
              padding: '14px 20px',
              boxShadow: '0 10px 20px rgba(16, 24, 40, 0.12)',
              textTransform: 'uppercase',
            }}
          >
            {element}
          </div>
        );
      })}
    </>
  );
};

export const FrameShell: FC<{
  scenePack: ScenePack;
  children: ReactNode;
}> = ({ scenePack, children }) => {
  const palette = SCENE_BACKGROUNDS[scenePack.visual.preset.backgroundMood];
  const appearance = getBuildTableAppearance(scenePack.visual.preset.id);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: palette.base,
        color: palette.ink,
        fontFamily: FONT_STACKS.body,
      }}
    >
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.76), rgba(255,255,255,0)) 0 0 / 100% 280px no-repeat, radial-gradient(circle at 18px 18px, rgba(0,85,191,0.08) 0 20%, rgba(0,85,191,0) 24%) 0 0 / 64px 64px repeat',
        }}
      />
      <AbsoluteFill
        style={{
          left: 40,
          top: 36,
          right: 40,
          bottom: 36,
          borderRadius: 42,
          backgroundColor: palette.frame,
          border: '1px solid rgba(16, 24, 40, 0.08)',
          boxShadow: '0 28px 60px rgba(16, 24, 40, 0.14)',
          padding: 34,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 18,
            borderRadius: 34,
            border: '1px solid rgba(16, 24, 40, 0.04)',
            pointerEvents: 'none',
          }}
        />
        {appearance.trim.map((trim, index) => (
          <div
            key={trim}
            style={{
              position: 'absolute',
              right: 42 + index * 126,
              top: 26,
              width: 114,
              height: 18,
              borderRadius: 999,
              backgroundColor: trim,
              boxShadow: 'inset 0 -3px 0 rgba(16, 24, 40, 0.12)',
            }}
          />
        ))}
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const CueLayer: FC<{ mode: 'reveal' | 'arc' | 'master' }> = ({ mode }) => {
  const { fps } = useVideoConfig();

  return (
    <>
      {mode === 'master' ? <Audio src={staticFile('audio/bed.wav')} volume={0.12} /> : null}
      <Audio src={staticFile('audio/upload.wav')} volume={0.28} />
      <Sequence from={Math.round(0.7 * fps)}>
        <Audio src={staticFile('audio/quantize.wav')} volume={0.22} />
      </Sequence>
      <Sequence from={Math.round(1.5 * fps)}>
        <Audio src={staticFile('audio/build.wav')} volume={0.3} />
      </Sequence>
      <Sequence from={Math.round((mode === 'master' ? 4.4 : 3.6) * fps)}>
        <Audio src={staticFile('audio/hero-reveal.wav')} volume={0.34} />
      </Sequence>
      <Sequence from={Math.round((mode === 'master' ? 10.1 : 5.4) * fps)}>
        <Audio src={staticFile('audio/sacred-line.wav')} volume={0.42} />
      </Sequence>
      <Sequence from={Math.round((mode === 'master' ? 14.2 : 7.2) * fps)}>
        <Audio src={staticFile('audio/montage.wav')} volume={0.2} />
      </Sequence>
      <Sequence from={Math.round((mode === 'master' ? 28 : 13.5) * fps)}>
        <Audio src={staticFile('audio/resolve.wav')} volume={0.22} />
      </Sequence>
    </>
  );
};
