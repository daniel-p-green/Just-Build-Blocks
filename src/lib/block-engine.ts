export type Pixel = {
  r: number;
  g: number;
  b: number;
  a: number;
};

export type BlockColor = {
  id: string;
  name: string;
  hex: string;
  rgb: [number, number, number];
};

export type BlockCell = {
  x: number;
  y: number;
  color: BlockColor;
};

export type ImageDataLike = {
  width: number;
  height: number;
  data: Uint8ClampedArray;
};

export type VisibleBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

export type BlockBuild = {
  columns: number;
  rows: number;
  cells: BlockCell[];
  countsByColor: Record<string, number>;
  dominantColor: BlockColor | null;
  visibleBounds: VisibleBounds | null;
};

export type BlockifyOptions = {
  columns: number;
  transparencyThreshold?: number;
  palette?: BlockColor[];
};

export type StoryArc = {
  id: 'instant-magic' | 'nostalgia-bridge' | 'world-building-montage';
  headline: string;
  summary: string;
  beats: string[];
};

export const BLOCK_PALETTE = {
  red: {
    id: 'red',
    name: 'Signal Red',
    hex: '#C4281C',
    rgb: [196, 40, 28],
  },
  blue: {
    id: 'blue',
    name: 'Orbit Blue',
    hex: '#0055BF',
    rgb: [0, 85, 191],
  },
  yellow: {
    id: 'yellow',
    name: 'Bright Yellow',
    hex: '#FFD500',
    rgb: [255, 213, 0],
  },
  white: {
    id: 'white',
    name: 'Studio White',
    hex: '#FFFFFF',
    rgb: [255, 255, 255],
  },
  green: {
    id: 'green',
    name: 'Builder Green',
    hex: '#00C853',
    rgb: [0, 200, 83],
  },
  black: {
    id: 'black',
    name: 'Midnight Plate',
    hex: '#111111',
    rgb: [17, 17, 17],
  },
} satisfies Record<string, BlockColor>;

const DEFAULT_PALETTE = Object.values(BLOCK_PALETTE);

const squaredDistance = (pixel: Pixel, color: BlockColor) => {
  const [r, g, b] = color.rgb;

  return (
    (pixel.r - r) * (pixel.r - r) +
    (pixel.g - g) * (pixel.g - g) +
    (pixel.b - b) * (pixel.b - b)
  );
};

export const quantizeToPalette = (
  pixel: Pixel,
  palette: BlockColor[] = DEFAULT_PALETTE,
): BlockColor =>
  palette.reduce((closest, candidate) =>
    squaredDistance(pixel, candidate) < squaredDistance(pixel, closest)
      ? candidate
      : closest,
  );

const averageCellPixel = (
  imageData: ImageDataLike,
  startX: number,
  endX: number,
  startY: number,
  endY: number,
  transparencyThreshold: number,
): Pixel | null => {
  let rTotal = 0;
  let gTotal = 0;
  let bTotal = 0;
  let aTotal = 0;
  let visiblePixels = 0;

  for (let y = startY; y < endY; y += 1) {
    for (let x = startX; x < endX; x += 1) {
      const offset = (y * imageData.width + x) * 4;
      const alpha = imageData.data[offset + 3] ?? 0;

      if (alpha < transparencyThreshold) {
        continue;
      }

      rTotal += imageData.data[offset] ?? 0;
      gTotal += imageData.data[offset + 1] ?? 0;
      bTotal += imageData.data[offset + 2] ?? 0;
      aTotal += alpha;
      visiblePixels += 1;
    }
  }

  if (visiblePixels === 0) {
    return null;
  }

  return {
    r: Math.round(rTotal / visiblePixels),
    g: Math.round(gTotal / visiblePixels),
    b: Math.round(bTotal / visiblePixels),
    a: Math.round(aTotal / visiblePixels),
  };
};

export const buildBlockBuildFromImageData = (
  imageData: ImageDataLike,
  options: BlockifyOptions,
): BlockBuild => {
  const palette = options.palette ?? DEFAULT_PALETTE;
  const transparencyThreshold = options.transparencyThreshold ?? 32;
  const columns = Math.max(1, options.columns);
  const rows = Math.max(1, Math.round((imageData.height / imageData.width) * columns));
  const cellWidth = imageData.width / columns;
  const cellHeight = imageData.height / rows;
  const countsByColor: Record<string, number> = {};
  const cells: BlockCell[] = [];

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) {
      const startX = Math.floor(x * cellWidth);
      const endX = Math.max(startX + 1, Math.floor((x + 1) * cellWidth));
      const startY = Math.floor(y * cellHeight);
      const endY = Math.max(startY + 1, Math.floor((y + 1) * cellHeight));
      const averagePixel = averageCellPixel(
        imageData,
        startX,
        endX,
        startY,
        endY,
        transparencyThreshold,
      );

      if (!averagePixel) {
        continue;
      }

      const color = quantizeToPalette(averagePixel, palette);
      cells.push({ x, y, color });
      countsByColor[color.id] = (countsByColor[color.id] ?? 0) + 1;
    }
  }

  const dominantColor =
    cells.length === 0
      ? null
      : Object.entries(countsByColor)
          .sort((left, right) => (right[1] ?? 0) - (left[1] ?? 0))
          .map(([id]) => palette.find((color) => color.id === id) ?? null)[0];
  const visibleBounds =
    cells.length === 0
      ? null
      : cells.reduce<VisibleBounds>(
          (bounds, cell) => ({
            minX: Math.min(bounds.minX, cell.x),
            maxX: Math.max(bounds.maxX, cell.x),
            minY: Math.min(bounds.minY, cell.y),
            maxY: Math.max(bounds.maxY, cell.y),
          }),
          {
            minX: cells[0]!.x,
            maxX: cells[0]!.x,
            minY: cells[0]!.y,
            maxY: cells[0]!.y,
          },
        );

  return {
    columns,
    rows,
    cells,
    countsByColor,
    dominantColor,
    visibleBounds,
  };
};

export const buildStoryArcs = ({
  brandName,
  dominantColor,
}: {
  brandName: string;
  dominantColor: BlockColor;
}): StoryArc[] => {
  const colorCue = dominantColor.name.toLowerCase();

  return [
    {
      id: 'instant-magic',
      headline: `${brandName}, rebuilt in blocks.`,
      summary: 'A bright proof moment that starts with the mark and lands on a finished build.',
      beats: [
        'Drop the mark on the board.',
        `Watch it click into a ${colorCue} block build.`,
        'Hold on the finished board with one clear invitation to build.',
      ],
    },
    {
      id: 'nostalgia-bridge',
      headline: `What if ${brandName} felt like building blocks again?`,
      summary: 'The memory of stacking simple pieces becomes the bridge into Codex.',
      beats: [
        'Open with the feeling of learning by stacking one simple piece after another.',
        'Bridge from the build table to modern creation tools.',
        `Reveal ${brandName} as the proof that creativity compounds.`,
      ],
    },
    {
      id: 'world-building-montage',
      headline: `${brandName} is only the first thing you can build.`,
      summary: 'Zoom out from one finished build to a whole table of possibilities.',
      beats: [
        'Show the mark as the first finished artifact on the table.',
        'Expand the board into ramps, worlds, products, and scenes.',
        'Land on a simple line about building with blocks and GPT.',
      ],
    },
  ];
};
