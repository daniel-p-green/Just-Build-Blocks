import type { BlockColor } from './block-engine';

type SnapshotPartEntry = {
  category: 'plate' | 'brick';
  ldrawPartId: string;
  bricklinkItemType: 'P';
  bricklinkItemNo: string;
  bricklinkName: string;
  bricklinkCategoryPath: string;
  studsX: number;
  studsZ: number;
  allowedBricklinkColorIds: number[];
};

export type BricklinkPartRef = SnapshotPartEntry & {
  bricklinkCatalogUrl: string;
};

export type BricklinkColorRef = {
  internalColorId: string;
  bricklinkColorId: number;
  bricklinkColorName: string;
};

export type BricklinkLineItem = {
  bricklinkAvailableInColor: boolean;
  bricklinkItemNo: string | null;
};

export type BricklinkManifestPayload<T extends BricklinkLineItem> = {
  bricklinkSnapshotVersion: typeof BRICKLINK_SNAPSHOT_VERSION;
  mappedPartCoverage: {
    mappedLineItems: number;
    percentage: number;
    totalLineItems: number;
  };
  unavailablePartColorCount: number;
  items: T[];
};

export const BRICKLINK_SNAPSHOT_VERSION = '2026-03-06-local-subset';

const ALL_COLOR_IDS = [1, 3, 5, 6, 7, 11] as const;

const PART_SNAPSHOT: SnapshotPartEntry[] = [
  {
    category: 'plate',
    ldrawPartId: '3034.dat',
    bricklinkItemType: 'P',
    bricklinkItemNo: '3034',
    bricklinkName: 'Plate 2 x 8',
    bricklinkCategoryPath: 'Parts > Plate',
    studsX: 2,
    studsZ: 8,
    allowedBricklinkColorIds: [...ALL_COLOR_IDS],
  },
  {
    category: 'plate',
    ldrawPartId: '3795.dat',
    bricklinkItemType: 'P',
    bricklinkItemNo: '3795',
    bricklinkName: 'Plate 2 x 6',
    bricklinkCategoryPath: 'Parts > Plate',
    studsX: 2,
    studsZ: 6,
    allowedBricklinkColorIds: [...ALL_COLOR_IDS],
  },
  {
    category: 'plate',
    ldrawPartId: '3020.dat',
    bricklinkItemType: 'P',
    bricklinkItemNo: '3020',
    bricklinkName: 'Plate 2 x 4',
    bricklinkCategoryPath: 'Parts > Plate',
    studsX: 2,
    studsZ: 4,
    allowedBricklinkColorIds: [...ALL_COLOR_IDS],
  },
  {
    category: 'plate',
    ldrawPartId: '3021.dat',
    bricklinkItemType: 'P',
    bricklinkItemNo: '3021',
    bricklinkName: 'Plate 2 x 3',
    bricklinkCategoryPath: 'Parts > Plate',
    studsX: 2,
    studsZ: 3,
    allowedBricklinkColorIds: [...ALL_COLOR_IDS],
  },
  {
    category: 'plate',
    ldrawPartId: '3022.dat',
    bricklinkItemType: 'P',
    bricklinkItemNo: '3022',
    bricklinkName: 'Plate 2 x 2',
    bricklinkCategoryPath: 'Parts > Plate',
    studsX: 2,
    studsZ: 2,
    allowedBricklinkColorIds: [...ALL_COLOR_IDS],
  },
  {
    category: 'plate',
    ldrawPartId: '3710.dat',
    bricklinkItemType: 'P',
    bricklinkItemNo: '3710',
    bricklinkName: 'Plate 1 x 4',
    bricklinkCategoryPath: 'Parts > Plate',
    studsX: 1,
    studsZ: 4,
    allowedBricklinkColorIds: [...ALL_COLOR_IDS],
  },
  {
    category: 'plate',
    ldrawPartId: '3623.dat',
    bricklinkItemType: 'P',
    bricklinkItemNo: '3623',
    bricklinkName: 'Plate 1 x 3',
    bricklinkCategoryPath: 'Parts > Plate',
    studsX: 1,
    studsZ: 3,
    allowedBricklinkColorIds: [...ALL_COLOR_IDS],
  },
  {
    category: 'plate',
    ldrawPartId: '3023.dat',
    bricklinkItemType: 'P',
    bricklinkItemNo: '3023',
    bricklinkName: 'Plate 1 x 2',
    bricklinkCategoryPath: 'Parts > Plate',
    studsX: 1,
    studsZ: 2,
    allowedBricklinkColorIds: [...ALL_COLOR_IDS],
  },
  {
    category: 'plate',
    ldrawPartId: '3024.dat',
    bricklinkItemType: 'P',
    bricklinkItemNo: '3024',
    bricklinkName: 'Plate 1 x 1',
    bricklinkCategoryPath: 'Parts > Plate',
    studsX: 1,
    studsZ: 1,
    allowedBricklinkColorIds: [...ALL_COLOR_IDS],
  },
  {
    category: 'brick',
    ldrawPartId: '3007.dat',
    bricklinkItemType: 'P',
    bricklinkItemNo: '3007',
    bricklinkName: 'Brick 2 x 8',
    bricklinkCategoryPath: 'Parts > Brick',
    studsX: 2,
    studsZ: 8,
    allowedBricklinkColorIds: [...ALL_COLOR_IDS],
  },
  {
    category: 'brick',
    ldrawPartId: '2456.dat',
    bricklinkItemType: 'P',
    bricklinkItemNo: '2456',
    bricklinkName: 'Brick 2 x 6',
    bricklinkCategoryPath: 'Parts > Brick',
    studsX: 2,
    studsZ: 6,
    allowedBricklinkColorIds: [...ALL_COLOR_IDS],
  },
  {
    category: 'brick',
    ldrawPartId: '3001.dat',
    bricklinkItemType: 'P',
    bricklinkItemNo: '3001',
    bricklinkName: 'Brick 2 x 4',
    bricklinkCategoryPath: 'Parts > Brick',
    studsX: 2,
    studsZ: 4,
    allowedBricklinkColorIds: [...ALL_COLOR_IDS],
  },
  {
    category: 'brick',
    ldrawPartId: '3003.dat',
    bricklinkItemType: 'P',
    bricklinkItemNo: '3003',
    bricklinkName: 'Brick 2 x 2',
    bricklinkCategoryPath: 'Parts > Brick',
    studsX: 2,
    studsZ: 2,
    allowedBricklinkColorIds: [...ALL_COLOR_IDS],
  },
  {
    category: 'brick',
    ldrawPartId: '3010.dat',
    bricklinkItemType: 'P',
    bricklinkItemNo: '3010',
    bricklinkName: 'Brick 1 x 4',
    bricklinkCategoryPath: 'Parts > Brick',
    studsX: 1,
    studsZ: 4,
    allowedBricklinkColorIds: [...ALL_COLOR_IDS],
  },
  {
    category: 'brick',
    ldrawPartId: '3004.dat',
    bricklinkItemType: 'P',
    bricklinkItemNo: '3004',
    bricklinkName: 'Brick 1 x 2',
    bricklinkCategoryPath: 'Parts > Brick',
    studsX: 1,
    studsZ: 2,
    allowedBricklinkColorIds: [...ALL_COLOR_IDS],
  },
  {
    category: 'brick',
    ldrawPartId: '3005.dat',
    bricklinkItemType: 'P',
    bricklinkItemNo: '3005',
    bricklinkName: 'Brick 1 x 1',
    bricklinkCategoryPath: 'Parts > Brick',
    studsX: 1,
    studsZ: 1,
    allowedBricklinkColorIds: [...ALL_COLOR_IDS],
  },
];

const COLOR_SNAPSHOT: Record<BlockColor['id'], BricklinkColorRef> = {
  white: {
    internalColorId: 'white',
    bricklinkColorId: 1,
    bricklinkColorName: 'White',
  },
  yellow: {
    internalColorId: 'yellow',
    bricklinkColorId: 3,
    bricklinkColorName: 'Yellow',
  },
  red: {
    internalColorId: 'red',
    bricklinkColorId: 5,
    bricklinkColorName: 'Red',
  },
  green: {
    internalColorId: 'green',
    bricklinkColorId: 6,
    bricklinkColorName: 'Green',
  },
  blue: {
    internalColorId: 'blue',
    bricklinkColorId: 7,
    bricklinkColorName: 'Blue',
  },
  black: {
    internalColorId: 'black',
    bricklinkColorId: 11,
    bricklinkColorName: 'Black',
  },
};

const PART_INDEX = new Map(
  PART_SNAPSHOT.map((part) => [
    part.ldrawPartId,
    {
      ...part,
      bricklinkCatalogUrl: `https://www.bricklink.com/v2/catalog/catalogitem.page?P=${part.bricklinkItemNo}`,
    } satisfies BricklinkPartRef,
  ]),
);

export const BRICKLINK_CATALOG_PARTS = [...PART_INDEX.values()];

export const BRICKLINK_PLATE_PARTS = BRICKLINK_CATALOG_PARTS.filter(
  (part) => part.category === 'plate',
);

export const BRICKLINK_BRICK_PARTS = BRICKLINK_CATALOG_PARTS.filter(
  (part) => part.category === 'brick',
);

export const getBricklinkPartRef = (ldrawPartId: string) => PART_INDEX.get(ldrawPartId);

export const getBricklinkColorRef = (internalColorId: string) =>
  COLOR_SNAPSHOT[internalColorId as keyof typeof COLOR_SNAPSHOT];

export const buildBricklinkManifestPayload = <T extends BricklinkLineItem>(
  items: T[],
): BricklinkManifestPayload<T> => {
  const mappedLineItems = items.filter((item) => Boolean(item.bricklinkItemNo)).length;
  const totalLineItems = items.length;
  const percentage =
    totalLineItems === 0 ? 0 : Math.round((mappedLineItems / totalLineItems) * 100);

  return {
    bricklinkSnapshotVersion: BRICKLINK_SNAPSHOT_VERSION,
    mappedPartCoverage: {
      mappedLineItems,
      percentage,
      totalLineItems,
    },
    unavailablePartColorCount: items.filter((item) => item.bricklinkAvailableInColor === false)
      .length,
    items,
  };
};
