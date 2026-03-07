import { BLOCK_TABLE_COLORS, OPENAI_SANS_FAMILY } from './brand-system';
import type { PartManifestItem, ScenePack } from './scene-pack';

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const easeOutCubic = (value: number) => 1 - (1 - value) ** 3;
const easeInOutCubic = (value: number) =>
  value < 0.5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2;

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

const drawStudStrip = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  color: string,
) => {
  const studs = Math.max(4, Math.floor(width / 36));

  for (let index = 0; index < studs; index += 1) {
    const studX = x + (index + 0.5) * (width / studs);
    context.beginPath();
    context.arc(studX, y, 8, 0, Math.PI * 2);
    context.fillStyle = mix(color, '#ffffff', 0.22);
    context.fill();
    context.beginPath();
    context.arc(studX - 2, y - 2, 3.5, 0, Math.PI * 2);
    context.fillStyle = rgba('#ffffff', 0.34);
    context.fill();
  }
};

const drawBlock = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  depth: number,
  color: string,
  opacity = 1,
) => {
  const radius = Math.max(6, size * 0.18);

  context.save();
  context.globalAlpha = opacity;
  context.translate(x, y);

  drawRoundedRect(context, 0, depth, size, size, radius);
  context.fillStyle = 'rgba(16, 24, 40, 0.2)';
  context.fill();

  drawRoundedRect(context, 0, 0, size, size, radius);
  context.fillStyle = color;
  context.fill();

  drawRoundedRect(context, size * 0.06, size * 0.06, size * 0.88, size * 0.18, radius * 0.7);
  context.fillStyle = rgba('#ffffff', 0.24);
  context.fill();

  const studRadius = size * 0.11;
  const studs = [
    [size * 0.34, size * 0.34],
    [size * 0.66, size * 0.34],
    [size * 0.34, size * 0.66],
    [size * 0.66, size * 0.66],
  ] as const;

  studs.forEach(([studX, studY]) => {
    context.beginPath();
    context.arc(studX, studY, studRadius, 0, Math.PI * 2);
    context.fillStyle = mix(color, '#ffffff', 0.16);
    context.fill();
  });

  context.restore();
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
    const nextLine = `${line}${word} `;

    if (context.measureText(nextLine).width > maxWidth && line) {
      context.fillText(line.trimEnd(), x, cursorY);
      line = `${word} `;
      cursorY += lineHeight;
      return;
    }

    line = nextLine;

    if (index === words.length - 1) {
      context.fillText(line.trimEnd(), x, cursorY);
    }
  });
};

const drawTray = (
  context: CanvasRenderingContext2D,
  item: PartManifestItem,
  index: number,
  sorting: number,
) => {
  const x = 82;
  const y = 210 + index * 118;
  const trayWidth = 236;
  const trayHeight = 84;
  const fillProgress = clamp(sorting * 1.15 - index * 0.12);

  drawRoundedRect(context, x, y, trayWidth, trayHeight, 26);
  context.fillStyle = '#ffffff';
  context.fill();

  drawRoundedRect(context, x + 22, y + 24, (trayWidth - 44) * fillProgress, 28, 16);
  context.fillStyle = item.hex;
  context.fill();
  drawStudStrip(context, x + 34, y + 18, 152, item.hex);

  context.fillStyle = BLOCK_TABLE_COLORS.graphiteInk;
  context.font = `700 26px ${OPENAI_SANS_FAMILY}`;
  context.fillText(String(item.count), x + 24, y + 72);
  context.font = `600 18px ${OPENAI_SANS_FAMILY}`;
  context.fillStyle = rgba(BLOCK_TABLE_COLORS.graphiteInk, 0.68);
  context.fillText(item.colorName.toUpperCase(), x + 86, y + 70);
};

export const REVEAL_DURATION_MS = 10500;
export const POSTER_FRAME_PROGRESS = 0.82;

const REVEAL_RECORDER_MIME_CANDIDATES = [
  'video/webm;codecs=vp9',
  'video/webm;codecs=vp8',
  'video/webm',
  'video/mp4;codecs=h264',
  'video/mp4',
] as const;

type MediaRecorderCapability = Pick<typeof MediaRecorder, 'isTypeSupported'> | undefined;

export const pickRevealRecorderMimeType = (mediaRecorder: MediaRecorderCapability = globalThis.MediaRecorder) => {
  if (!mediaRecorder || typeof mediaRecorder.isTypeSupported !== 'function') {
    return undefined;
  }

  return REVEAL_RECORDER_MIME_CANDIDATES.find((mimeType) => mediaRecorder.isTypeSupported(mimeType));
};

export const getRevealClipFileExtension = (mimeType: string | undefined) =>
  mimeType?.toLowerCase().includes('mp4') ? 'mp4' : 'webm';

export const drawRevealFrame = (
  canvas: HTMLCanvasElement,
  scenePack: ScenePack,
  progress: number,
) => {
  const context = canvas.getContext('2d');

  if (!context) {
    return;
  }

  const { width, height } = canvas;
  const t = clamp(progress);
  const sorting = easeOutCubic(clamp(t / 0.18));
  const build = easeInOutCubic(clamp((t - 0.14) / 0.28));
  const sacredLine = easeOutCubic(clamp((t - 0.44) / 0.14));
  const world = easeInOutCubic(clamp((t - 0.62) / 0.2));
  const resolve = easeOutCubic(clamp((t - 0.84) / 0.16));

  context.clearRect(0, 0, width, height);
  context.fillStyle = '#f6f9fc';
  context.fillRect(0, 0, width, height);

  context.save();
  context.shadowColor = 'rgba(16, 24, 40, 0.12)';
  context.shadowBlur = 70;
  context.shadowOffsetY = 26;
  drawRoundedRect(context, 52, 52, width - 104, height - 104, 34);
  context.fillStyle = '#ffffff';
  context.fill();
  context.restore();

  drawRoundedRect(context, 76, 86, width - 152, 86, 24);
  context.fillStyle = BLOCK_TABLE_COLORS.orbitBlue;
  context.fill();
  drawRoundedRect(context, 96, 104, 176, 52, 16);
  context.fillStyle = BLOCK_TABLE_COLORS.signalRed;
  context.fill();
  context.font = `italic 700 40px ${OPENAI_SANS_FAMILY}`;
  context.fillStyle = '#fffef8';
  context.textAlign = 'center';
  context.fillText('BLOCKS', 184, 141);
  context.textAlign = 'left';
  context.fillStyle = '#fffef8';
  context.font = `700 40px ${OPENAI_SANS_FAMILY}`;
  context.fillText(`${scenePack.box.title} Studio`, 302, 144);

  context.fillStyle = rgba(BLOCK_TABLE_COLORS.graphiteInk, 0.08);
  drawRoundedRect(context, 76, 196, 272, 486, 28);
  context.fill();

  scenePack.instructions.partManifest.slice(0, 4).forEach((item, index) => {
    drawTray(context, item, index, sorting);
  });

  drawRoundedRect(context, 384, 208, 724, 444, 30);
  context.fillStyle = '#e8eef5';
  context.fill();
  drawRoundedRect(context, 410, 236, 672, 386, 24);
  context.fillStyle = '#dbe6f2';
  context.fill();

  for (let y = 0; y < 7; y += 1) {
    for (let x = 0; x < 11; x += 1) {
      context.beginPath();
      context.arc(444 + x * 58, 270 + y * 52, 7, 0, Math.PI * 2);
      context.fillStyle = 'rgba(16, 24, 40, 0.06)';
      context.fill();
    }
  }

  const size = Math.min(36, 420 / Math.max(scenePack.build.grid.columns, scenePack.build.grid.rows || 1));
  const startX = 604 - (scenePack.build.grid.columns * size) / 2;
  const startY = 382 - (scenePack.build.grid.rows * size) / 2;

  scenePack.build.grid.cells
    .slice()
    .sort((left, right) => left.y - right.y || left.x - right.x)
    .forEach((cell, index) => {
      const local = clamp(build * 1.22 - index * 0.012);
      const px = startX + cell.x * size + (1 - local) * (cell.x % 2 === 0 ? -90 : 90);
      const py = startY + cell.y * size - (1 - local) * 120;
      drawBlock(context, px, py, size, Math.max(8, size * 0.16), cell.color.hex, local);
    });

  drawRoundedRect(context, 530, 606, 424, 42, 18);
  context.fillStyle = '#ffffff';
  context.fill();
  drawStudStrip(context, 566, 624, 356, '#ffffff');

  const worldPieces = [
    { x: 468, y: 548, color: BLOCK_TABLE_COLORS.builderGreen },
    { x: 482, y: 512, color: BLOCK_TABLE_COLORS.signalRed },
    { x: 944, y: 542, color: BLOCK_TABLE_COLORS.brightYellow },
    { x: 964, y: 502, color: BLOCK_TABLE_COLORS.orbitBlue },
  ];

  worldPieces.forEach((piece, index) => {
    const local = clamp(world * 1.24 - index * 0.12);
    drawBlock(
      context,
      piece.x + (1 - local) * (index < 2 ? -120 : 120),
      piece.y + (1 - local) * 46,
      34,
      10,
      piece.color,
      local * resolve + (1 - resolve),
    );
  });

  context.fillStyle = BLOCK_TABLE_COLORS.graphiteInk;
  context.font = `700 24px ${OPENAI_SANS_FAMILY}`;
  context.fillText('Camera', 1142, 244);
  context.fillText('Scene', 1142, 358);
  context.fillText('Tray focus', 1142, 472);

  context.font = `700 34px ${OPENAI_SANS_FAMILY}`;
  context.fillText(scenePack.builder.cameraPreset, 1142, 284);
  context.fillText(scenePack.builder.scenePreset, 1142, 398);
  context.fillText(scenePack.builder.partTrayEmphasis, 1142, 512);

  drawRoundedRect(context, 1120, 196, 308, 366, 28);
  context.strokeStyle = 'rgba(16, 24, 40, 0.12)';
  context.lineWidth = 2;
  context.stroke();

  if (sacredLine > 0) {
    context.save();
    context.globalAlpha = sacredLine;
    drawRoundedRect(context, 426, 118, 628, 66, 18);
    context.fillStyle = rgba(BLOCK_TABLE_COLORS.brightYellow, 0.92);
    context.fill();
    context.fillStyle = BLOCK_TABLE_COLORS.graphiteInk;
    context.font = `700 34px ${OPENAI_SANS_FAMILY}`;
    context.fillText(scenePack.copy.sacredLine, 452, 160);
    context.restore();
  }

  if (world > 0.1) {
    context.save();
    context.globalAlpha = world;
    context.fillStyle = rgba(BLOCK_TABLE_COLORS.orbitBlue, 0.12);
    drawRoundedRect(context, 448, 250, 108, 84, 24);
    context.fill();
    drawRoundedRect(context, 938, 280, 88, 120, 24);
    context.fill();
    drawRoundedRect(context, 512, 472, 108, 74, 24);
    context.fillStyle = rgba(BLOCK_TABLE_COLORS.builderGreen, 0.14);
    context.fill();
    context.restore();
  }

  context.fillStyle = rgba(BLOCK_TABLE_COLORS.graphiteInk, 0.72);
  context.font = `600 22px ${OPENAI_SANS_FAMILY}`;
  drawWrappedText(context, scenePack.world.concept, 1120, 620, 300, 30);
};

export const recordRevealClip = async (scenePack: ScenePack) => {
  const canvas = document.createElement('canvas');
  canvas.width = scenePack.visual.canvasSize.width;
  canvas.height = scenePack.visual.canvasSize.height;

  if (typeof canvas.captureStream !== 'function' || typeof MediaRecorder !== 'function') {
    throw new Error('Your browser does not support video capture for this clip export.');
  }

  const stream = canvas.captureStream(30);
  const mimeType = pickRevealRecorderMimeType(MediaRecorder);
  const recorder = mimeType
    ? new MediaRecorder(stream, { mimeType })
    : new MediaRecorder(stream);
  const chunks: Blob[] = [];

  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      chunks.push(event.data);
    }
  };

  recorder.start();

  const totalFrames = Math.round((REVEAL_DURATION_MS / 1000) * 30);

  for (let frame = 0; frame < totalFrames; frame += 1) {
    drawRevealFrame(canvas, scenePack, frame / (totalFrames - 1));
    await new Promise((resolve) => window.setTimeout(resolve, 0));
  }

  await new Promise<void>((resolve) => {
    recorder.onstop = () => resolve();
    recorder.stop();
  });

  return new Blob(chunks, { type: mimeType ?? recorder.mimeType ?? 'video/webm' });
};
