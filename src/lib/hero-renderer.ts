import { BLOCK_TABLE_COLORS, OPENAI_SANS_FAMILY } from './brand-system';
import type { BlockCell } from './block-engine';
import type { ScenePack } from './scene-pack';

const hexToRgb = (hex: string): [number, number, number] => {
  const clean = hex.replace('#', '');
  const value = Number.parseInt(clean.length === 3 ? clean.replace(/(.)/g, '$1$1') : clean, 16);

  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
};

const rgba = (hex: string, alpha: number) => {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const mix = (hex: string, target: string, amount: number) => {
  const [r1, g1, b1] = hexToRgb(hex);
  const [r2, g2, b2] = hexToRgb(target);
  const blend = (left: number, right: number) =>
    Math.round(left + (right - left) * amount)
      .toString(16)
      .padStart(2, '0');

  return `#${blend(r1, r2)}${blend(g1, g2)}${blend(b1, b2)}`;
};

const drawRoundedRect = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
};

const drawWrappedText = (
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) => {
  const words = text.split(' ');
  let line = '';
  let cursorY = y;

  words.forEach((word, index) => {
    const next = `${line}${word} `;

    if (context.measureText(next).width > maxWidth && line) {
      context.fillText(line.trimEnd(), x, cursorY);
      line = `${word} `;
      cursorY += lineHeight;
      return;
    }

    line = next;

    if (index === words.length - 1) {
      context.fillText(line.trimEnd(), x, cursorY);
    }
  });
};

const drawStudBar = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  color: string,
) => {
  const studs = Math.max(3, Math.floor(width / 34));

  for (let index = 0; index < studs; index += 1) {
    const studX = x + (index + 0.5) * (width / studs);
    context.beginPath();
    context.arc(studX, y, 9, 0, Math.PI * 2);
    context.fillStyle = mix(color, '#ffffff', 0.22);
    context.fill();
    context.beginPath();
    context.arc(studX - 2, y - 2, 4, 0, Math.PI * 2);
    context.fillStyle = rgba('#ffffff', 0.34);
    context.fill();
  }
};

const drawStandingBrick = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  depth: number,
  color: string,
) => {
  const radius = Math.max(3, size * 0.12);
  const topLift = depth * 0.62;
  const sideInset = depth * 0.8;
  const frontColor = color;
  const topColor = mix(color, '#ffffff', color === '#FFFFFF' ? 0.04 : 0.2);
  const sideColor = mix(color, '#101828', color === '#FFFFFF' ? 0.18 : 0.26);
  const studColor = mix(color, '#ffffff', color === '#FFFFFF' ? 0.02 : 0.16);

  context.save();
  context.translate(x, y);

  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(sideInset, -topLift);
  context.lineTo(size + sideInset, -topLift);
  context.lineTo(size, 0);
  context.closePath();
  context.fillStyle = topColor;
  context.fill();

  context.beginPath();
  context.moveTo(size, 0);
  context.lineTo(size + sideInset, -topLift);
  context.lineTo(size + sideInset, size - topLift);
  context.lineTo(size, size);
  context.closePath();
  context.fillStyle = sideColor;
  context.fill();

  drawRoundedRect(context, 0, 0, size, size, radius);
  context.fillStyle = frontColor;
  context.fill();

  drawRoundedRect(context, size * 0.08, size * 0.08, size * 0.84, size * 0.16, radius * 0.65);
  context.fillStyle = rgba('#ffffff', color === '#FFFFFF' ? 0.08 : 0.24);
  context.fill();

  const studRadius = size * 0.11;
  const studs = size >= 12
    ? ([
        [size * 0.28, -topLift * 0.5],
        [size * 0.52, -topLift * 0.5],
        [size * 0.76, -topLift * 0.5],
      ] as const)
    : ([] as const);

  studs.forEach(([studX, studY]) => {
    context.beginPath();
    context.arc(studX, studY, studRadius, 0, Math.PI * 2);
    context.fillStyle = studColor;
    context.fill();
    context.beginPath();
    context.arc(studX - studRadius * 0.18, studY - studRadius * 0.18, studRadius * 0.52, 0, Math.PI * 2);
    context.fillStyle = rgba('#ffffff', color === '#FFFFFF' ? 0.12 : 0.24);
    context.fill();
  });

  context.restore();
};

const layoutStandingCells = (
  cells: BlockCell[],
  columns: number,
  rows: number,
  area: { x: number; y: number; width: number; height: number },
) => {
  const margin = 0.18;
  const depthInset = 0.92;
  const size = Math.min(
    area.width / Math.max(columns + margin * 2 + depthInset, 1),
    area.height / Math.max(rows + margin * 2 + depthInset, 1.2),
  );
  const depth = Math.max(8, size * 0.34);
  const modelWidth = columns * size + depth;
  const modelHeight = rows * size + depth;
  const startX = area.x + (area.width - modelWidth) / 2;
  const startY = area.y + (area.height - modelHeight) / 2 + depth * 0.35;

  return cells.map((cell) => ({
    ...cell,
    px: startX + cell.x * size,
    py: startY + cell.y * size,
    size,
    depth,
  }));
};

export const drawHeroCanvas = (
  canvas: HTMLCanvasElement,
  scenePack: ScenePack,
  options?: { variant?: 'hero' | 'poster' },
) => {
  const context = canvas.getContext('2d');

  if (!context) {
    return;
  }

  const { width, height } = canvas;
  const variant = options?.variant ?? 'hero';
  const primaryBlue = BLOCK_TABLE_COLORS.orbitBlue;
  const red = BLOCK_TABLE_COLORS.signalRed;
  const yellow = BLOCK_TABLE_COLORS.brightYellow;
  const white = BLOCK_TABLE_COLORS.studioWhite;
  const graphite = BLOCK_TABLE_COLORS.graphiteInk;

  context.clearRect(0, 0, width, height);
  context.fillStyle = '#edf3f9';
  context.fillRect(0, 0, width, height);

  context.save();
  context.shadowColor = 'rgba(16, 24, 40, 0.12)';
  context.shadowBlur = 70;
  context.shadowOffsetY = 26;
  drawRoundedRect(context, 52, 52, width - 104, height - 104, 34);
  context.fillStyle = white;
  context.fill();
  context.restore();

  drawRoundedRect(context, 88, 82, width - 176, height - 164, 28);
  const boxGradient = context.createLinearGradient(88, 82, width - 88, height - 82);
  boxGradient.addColorStop(0, mix(primaryBlue, '#0b2c75', 0.06));
  boxGradient.addColorStop(0.58, primaryBlue);
  boxGradient.addColorStop(1, mix(primaryBlue, '#081427', 0.12));
  context.fillStyle = boxGradient;
  context.fill();

  const glow = context.createRadialGradient(width * 0.68, height * 0.32, 40, width * 0.68, height * 0.32, 420);
  glow.addColorStop(0, rgba('#ffffff', 0.2));
  glow.addColorStop(1, rgba('#ffffff', 0));
  context.fillStyle = glow;
  context.fillRect(88, 82, width - 176, height - 164);

  drawRoundedRect(context, 122, 118, 216, 134, 24);
  context.fillStyle = red;
  context.fill();
  context.font = `italic 700 58px ${OPENAI_SANS_FAMILY}`;
  context.fillStyle = '#fffef8';
  context.textAlign = 'center';
  context.fillText('BLOCKS', 230, 198);
  context.textAlign = 'left';

  drawRoundedRect(context, 122, 274, 220, 286, 28);
  context.fillStyle = rgba('#ffffff', 0.16);
  context.fill();

  drawStudBar(context, 150, 296, 164, rgba('#ffffff', 0.6));
  context.fillStyle = white;
  context.font = `700 26px ${OPENAI_SANS_FAMILY}`;
  context.fillText(scenePack.box.metadataRail[0]?.label ?? 'Builder age', 150, 346);
  context.font = `700 88px ${OPENAI_SANS_FAMILY}`;
  context.fillText(scenePack.box.metadataRail[0]?.value ?? '10+', 150, 430);

  context.font = `700 24px ${OPENAI_SANS_FAMILY}`;
  let railY = 476;
  scenePack.box.metadataRail.slice(1).forEach((item) => {
    context.fillStyle = rgba('#ffffff', 0.72);
    context.fillText(item.label.toUpperCase(), 150, railY);
    context.fillStyle = white;
    context.font = `700 32px ${OPENAI_SANS_FAMILY}`;
    context.fillText(item.value, 150, railY + 38);
    context.font = `700 24px ${OPENAI_SANS_FAMILY}`;
    railY += 82;
  });

  drawRoundedRect(context, 374, 120, 670, 72, 18);
  context.fillStyle = yellow;
  context.fill();
  drawStudBar(context, 402, 156, 612, yellow);

  context.fillStyle = graphite;
  context.font = `700 28px ${OPENAI_SANS_FAMILY}`;
  context.fillText('Built with GPT-5.4 + Codex', 398, 166);

  context.fillStyle = white;
  context.font = `700 96px ${OPENAI_SANS_FAMILY}`;
  context.fillText(scenePack.box.title, 388, 286);
  context.font = `600 34px ${OPENAI_SANS_FAMILY}`;
  context.fillStyle = rgba('#ffffff', 0.82);
  drawWrappedText(context, scenePack.box.subtitle, 390, 336, 608, 40);

  drawRoundedRect(context, 364, 346, 692, 334, 34);
  context.fillStyle = rgba('#ffffff', 0.08);
  context.fill();

  drawRoundedRect(context, 406, 390, 608, 224, 26);
  context.fillStyle = 'rgba(255, 255, 255, 0.93)';
  context.fill();
  context.save();
  context.globalAlpha = 0.22;
  drawStudBar(context, 452, 416, 516, '#dbe5ef');
  context.restore();

  const plinthShadow = context.createRadialGradient(700, 610, 40, 700, 610, 220);
  plinthShadow.addColorStop(0, 'rgba(16, 24, 40, 0.16)');
  plinthShadow.addColorStop(1, 'rgba(16, 24, 40, 0)');
  context.fillStyle = plinthShadow;
  context.fillRect(470, 560, 460, 120);

  const projectedCells = layoutStandingCells(scenePack.build.grid.cells, scenePack.build.grid.columns, scenePack.build.grid.rows, {
    x: 486,
    y: 430,
    width: 430,
    height: 178,
  });

  projectedCells
    .sort((left, right) => right.y - left.y || left.x - right.x)
    .forEach((cell) => {
      drawStandingBrick(
        context,
        cell.px,
        cell.py,
        cell.size,
        Math.max(8, cell.depth),
        cell.color.hex,
      );
    });

  context.fillStyle = white;
  context.font = `600 24px ${OPENAI_SANS_FAMILY}`;
  drawWrappedText(context, scenePack.box.heroCaption, 388, 716, 590, 34);

  drawRoundedRect(context, 1060, 118, 164, 164, 28);
  context.fillStyle = rgba('#ffffff', 0.14);
  context.fill();
  context.fillStyle = white;
  context.font = `700 32px ${OPENAI_SANS_FAMILY}`;
  context.fillText('PIECES', 1092, 170);
  context.font = `700 74px ${OPENAI_SANS_FAMILY}`;
  context.fillText(String(scenePack.instructions.countTotals.totalPieces), 1092, 248);

  drawRoundedRect(context, 1060, 308, 164, 164, 28);
  context.fillStyle = rgba('#ffffff', 0.14);
  context.fill();
  context.fillStyle = white;
  context.font = `700 32px ${OPENAI_SANS_FAMILY}`;
  context.fillText('MODE', 1092, 360);
  context.font = `700 38px ${OPENAI_SANS_FAMILY}`;
  drawWrappedText(context, scenePack.experience.revealMode === 'faithful' ? 'Faithful' : 'Imagine', 1092, 418, 112, 40);

  drawRoundedRect(context, 1060, 498, 164, 120, 28);
  context.fillStyle = rgba('#ffffff', 0.14);
  context.fill();
  context.fillStyle = white;
  context.font = `700 26px ${OPENAI_SANS_FAMILY}`;
  context.fillText(scenePack.input.kind === 'prompt' ? 'FROM TEXT' : 'FROM IMAGE', 1088, 564);

  drawRoundedRect(context, 1060, 644, 164, 92, 28);
  context.fillStyle = rgba('#ffffff', 0.14);
  context.fill();
  context.fillStyle = white;
  context.font = `700 22px ${OPENAI_SANS_FAMILY}`;
  context.fillText(scenePack.setIdentity.buildId, 1088, 698);

  if (variant === 'poster') {
    context.fillStyle = rgba('#101828', 0.08);
    context.fillRect(0, height - 80, width, 80);
    context.fillStyle = graphite;
    context.font = `700 28px ${OPENAI_SANS_FAMILY}`;
    context.fillText(scenePack.copy.thesis, 90, height - 30);
  }
};
