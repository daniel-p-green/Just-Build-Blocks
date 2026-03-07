import { BLOCK_PALETTE, type BlockBuild, type BlockCell, type VisibleBounds } from '../lib/block-engine';
import { buildScenePack } from '../lib/scene-pack';

const GRID_TEMPLATE = [
  '....gggg....',
  '...grrrg....',
  '..ggryygg...',
  '..gb....bg..',
  '..gb....bg..',
  '...gbyyg....',
  '....gggg....',
  '............',
] as const;

const CELL_COLORS = {
  g: BLOCK_PALETTE.green,
  r: BLOCK_PALETTE.red,
  y: BLOCK_PALETTE.yellow,
  b: BLOCK_PALETTE.blue,
} as const;

const buildSampleCells = (): BlockCell[] => {
  const cells: BlockCell[] = [];

  GRID_TEMPLATE.forEach((row, y) => {
    row.split('').forEach((token, x) => {
      const color = CELL_COLORS[token as keyof typeof CELL_COLORS];

      if (!color) {
        return;
      }

      cells.push({
        x,
        y,
        color,
      });
    });
  });

  return cells;
};

const buildVisibleBounds = (cells: BlockCell[]): VisibleBounds => {
  return cells.reduce<VisibleBounds>(
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
};

const SAMPLE_CELLS = buildSampleCells();

const SAMPLE_BUILD: BlockBuild = {
  columns: GRID_TEMPLATE[0].length,
  rows: GRID_TEMPLATE.length,
  cells: SAMPLE_CELLS,
  countsByColor: SAMPLE_CELLS.reduce<Record<string, number>>((counts, cell) => {
    counts[cell.color.id] = (counts[cell.color.id] ?? 0) + 1;
    return counts;
  }, {}),
  dominantColor: BLOCK_PALETTE.green,
  visibleBounds: buildVisibleBounds(SAMPLE_CELLS),
};

export const sampleScenePack = buildScenePack({
  brandName: 'OpenAI Devs',
  fileName: 'openai-devs.png',
  build: SAMPLE_BUILD,
  input: {
    kind: 'image',
    brandName: 'OpenAI Devs',
    fileMeta: {
      fileName: 'openai-devs.png',
    },
  },
  revealMode: 'imagination',
  visualPresetId: 'build-table',
});
