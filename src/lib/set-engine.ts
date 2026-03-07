import {
  BLOCK_PALETTE,
  type BlockBuild,
  type BlockCell,
  type BlockColor,
  type VisibleBounds,
} from './block-engine';
import {
  BRICKLINK_BRICK_PARTS,
  BRICKLINK_PLATE_PARTS,
  buildBricklinkManifestPayload,
  getBricklinkColorRef,
  getBricklinkPartRef,
} from './bricklink-snapshot';
import type { ConceptInput } from './concept-input';
import { createStoredZip } from './zip';

export type BuildIntent = {
  brandName: string;
  flagship: boolean;
  promptSummary?: string;
  sourceKind: ConceptInput['kind'];
  targetKind: 'signature-collectible' | 'display-set';
  targetScale: 'desk';
};

export type SetArchetype = 'monolith' | 'badge-plaque' | 'emblem-relief' | 'medallion';

export type BrickSetSpec = {
  sku: string;
  buildId: string;
  collection: string;
  launchLine: string;
  flagshipName: string;
  displayTitle?: string;
  displaySubtitle?: string;
  packagingBrief: string;
  silhouetteGoal: string;
  modelStyle: 'monochrome-signature' | 'color-display';
  instructionTheme: 'airy-sky-blue';
  accentColor: string;
  archetype: SetArchetype;
  packagingAngle: 'three-quarter-left' | 'three-quarter-right';
  targetStuds: {
    width: number;
    depth: number;
  };
  frameMarginStuds: number;
  plinthDepthStuds: number;
  backingLayers: number;
  reliefLayers: number;
  supportStrategy: 'flat-display-plaque' | 'plinth-supported';
};

export type SetSpec = BrickSetSpec;

export type ModelTransform = {
  matrix: [number, number, number, number, number, number, number, number, number];
  x: number;
  y: number;
  z: number;
};

export type ModelAssembly = {
  id: string;
  kind: 'root' | 'backing' | 'frame' | 'art' | 'face' | 'detail' | 'plinth';
  name: string;
  parentId?: string;
};

export type ModelPart = {
  assemblyId: string;
  bricklinkAvailableInColor: boolean;
  bricklinkCatalogUrl: string | null;
  bricklinkColorId: number | null;
  bricklinkColorName: string | null;
  bricklinkItemNo: string | null;
  bricklinkItemType: 'P' | null;
  colorCode: number;
  colorId: BlockColor['id'];
  colorName: string;
  heightPlates: number;
  id: string;
  partId: string;
  partName: string;
  role: 'backing' | 'frame' | 'art';
  studsX: number;
  studsZ: number;
  transform: ModelTransform;
};

export type ModelColorBin = {
  colorCode: number;
  colorId: string;
  colorName: string;
  count: number;
  hex: string;
};

export type ModelBounds = {
  maxX: number;
  maxY: number;
  maxZ: number;
  minX: number;
  minY: number;
  minZ: number;
};

export type ModelIR = {
  assemblies: ModelAssembly[];
  bounds: ModelBounds;
  colorBins: ModelColorBin[];
  parts: ModelPart[];
  studFootprint: {
    depth: number;
    width: number;
  };
  supportStrategy: {
    kind: BrickSetSpec['supportStrategy'];
    notes: string[];
  };
};

export type SetPartManifestItem = {
  bricklinkAvailableInColor: boolean;
  bricklinkCatalogUrl: string | null;
  bricklinkColorId: number | null;
  bricklinkColorName: string | null;
  bricklinkItemNo: string | null;
  bricklinkItemType: 'P' | null;
  colorCode: number;
  colorId: string;
  colorName: string;
  count: number;
  hex: string;
  key: string;
  partId: string;
  partName: string;
  role: ModelPart['role'];
};

export type InstructionPlan = {
  steps: Array<{
    assemblyIds: string[];
    detail: string;
    id: string;
    partsNeeded: Array<{
      colorId: string;
      colorName: string;
      count: number;
      hex: string;
      partId: string;
      partName: string;
    }>;
    partCount: number;
    title: string;
  }>;
};

export type RenderScene = {
  background: 'openai-shell';
  builderCamera: 'front-three-quarter';
  heroCamera: 'isometric';
  lighting: 'studio-soft';
};

export type ModelValidationIssue = {
  code:
    | 'assembly-parent-missing'
    | 'assembly-unknown'
    | 'bricklink-color-unavailable'
    | 'bricklink-part-missing'
    | 'duplicate-part-id'
    | 'invalid-transform'
    | 'missing-part-definition'
    | 'overlap'
    | 'submodel-reference-missing';
  message: string;
};

export type ModelValidationReport = {
  exportChecks: {
    ioBundle: boolean;
    mpdText: boolean;
  };
  issues: ModelValidationIssue[];
  totals: {
    assemblies: number;
    parts: number;
    uniqueColorBins: number;
    uniquePartKinds: number;
  };
  valid: boolean;
};

export type ExportBundle = {
  instructionPlan: InstructionPlan;
  ioEntryNames: string[];
  ioFileBytes: Uint8Array;
  ioFileName: string;
  mpdFileName: string;
  mpdText: string;
  renderScene: RenderScene;
};

export type RealSetBuild = {
  displayGrid: BlockBuild;
  exportBundle: ExportBundle;
  intent: BuildIntent;
  model: ModelIR;
  partManifest: SetPartManifestItem[];
  spec: BrickSetSpec;
  validation: ModelValidationReport;
};

type CatalogPart = {
  category: 'plate' | 'brick';
  id: string;
  name: string;
  studsX: number;
  studsZ: number;
};

const IDENTITY_MATRIX: ModelTransform['matrix'] = [1, 0, 0, 0, 1, 0, 0, 0, 1];

const LDU_PER_STUD = 20;
const LDU_PER_PLATE = 8;

const LDR_COLOR_CODES: Record<BlockColor['id'], number> = {
  red: 4,
  blue: 1,
  yellow: 14,
  white: 15,
  green: 10,
  black: 0,
};

const toCatalogPart = (part: (typeof BRICKLINK_PLATE_PARTS | typeof BRICKLINK_BRICK_PARTS)[number]): CatalogPart => ({
  category: part.category,
  id: part.ldrawPartId,
  name: part.bricklinkName,
  studsX: part.studsX,
  studsZ: part.studsZ,
});

const PLATE_PARTS: CatalogPart[] = BRICKLINK_PLATE_PARTS.map(toCatalogPart);

const BRICK_PARTS: CatalogPart[] = BRICKLINK_BRICK_PARTS.map(toCatalogPart);

const PART_CATALOG = [...PLATE_PARTS, ...BRICK_PARTS];

const getColorById = (colorId: string) =>
  Object.values(BLOCK_PALETTE).find((color) => color.id === colorId) ?? BLOCK_PALETTE.green;

const getColorCode = (colorId: BlockColor['id']) => LDR_COLOR_CODES[colorId] ?? 16;

const getBricklinkMetadata = (partId: string, colorId: BlockColor['id']) => {
  const bricklinkPartRef = getBricklinkPartRef(partId);
  const bricklinkColorRef = getBricklinkColorRef(colorId);
  const hasVerifiedColorPairing =
    bricklinkPartRef !== undefined &&
    bricklinkColorRef !== undefined &&
    bricklinkPartRef.allowedBricklinkColorIds.includes(bricklinkColorRef.bricklinkColorId);
  const bricklinkAvailableInColor =
    hasVerifiedColorPairing;

  return {
    bricklinkAvailableInColor,
    bricklinkCatalogUrl: bricklinkPartRef?.bricklinkCatalogUrl ?? null,
    bricklinkColorId: bricklinkAvailableInColor ? bricklinkColorRef?.bricklinkColorId ?? null : null,
    bricklinkColorName: bricklinkAvailableInColor ? bricklinkColorRef?.bricklinkColorName ?? null : null,
    bricklinkItemNo: bricklinkPartRef?.bricklinkItemNo ?? null,
    bricklinkItemType: bricklinkPartRef?.bricklinkItemType ?? null,
  } satisfies Pick<
    ModelPart,
    | 'bricklinkAvailableInColor'
    | 'bricklinkCatalogUrl'
    | 'bricklinkColorId'
    | 'bricklinkColorName'
    | 'bricklinkItemNo'
    | 'bricklinkItemType'
  >;
};

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const createBuildId = (brandName: string) =>
  `CX-${brandName
    .replace(/[^A-Za-z]/g, '')
    .slice(0, 3)
    .toUpperCase()
    .padEnd(3, 'X')}`;

const inferAccentColor = (brandName: string) => {
  if (/codex/i.test(brandName)) {
    return BLOCK_PALETTE.blue.hex;
  }

  if (/bloom|openai/i.test(brandName)) {
    return BLOCK_PALETTE.green.hex;
  }

  if (/collective/i.test(brandName)) {
    return '#6D5EF8';
  }

  if (/kansas city|kc\b/i.test(brandName)) {
    return BLOCK_PALETTE.red.hex;
  }

  return BLOCK_PALETTE.yellow.hex;
};

const getVisibleCells = (build: BlockBuild, bounds: VisibleBounds) =>
  build.cells
    .filter(
      (cell) =>
        cell.x >= bounds.minX &&
        cell.x <= bounds.maxX &&
        cell.y >= bounds.minY &&
        cell.y <= bounds.maxY,
    )
    .map((cell) => ({
      ...cell,
      localX: cell.x - bounds.minX,
      localZ: cell.y - bounds.minY,
    }));

const rebuildBlockBuild = ({
  cells,
  columns,
  rows,
}: {
  cells: BlockCell[];
  columns: number;
  rows: number;
}): BlockBuild => {
  const countsByColor = cells.reduce<Record<string, number>>((counts, cell) => {
    counts[cell.color.id] = (counts[cell.color.id] ?? 0) + 1;
    return counts;
  }, {});

  const dominantColor =
    cells.length === 0
      ? null
      : Object.entries(countsByColor)
          .sort((left, right) => right[1] - left[1])
          .map(([colorId]) => getColorById(colorId))[0] ?? null;

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
    cells,
    columns,
    countsByColor,
    dominantColor,
    rows,
    visibleBounds,
  };
};

const trimBorderBackground = (build: BlockBuild) => {
  const borderCounts = build.cells.reduce<Record<string, number>>((counts, cell) => {
    if (
      cell.x === 0 ||
      cell.y === 0 ||
      cell.x === build.columns - 1 ||
      cell.y === build.rows - 1
    ) {
      counts[cell.color.id] = (counts[cell.color.id] ?? 0) + 1;
    }

    return counts;
  }, {});

  const borderColorId = Object.entries(borderCounts).sort((left, right) => right[1] - left[1])[0]?.[0];

  if (!borderColorId) {
    return build;
  }

  const trimmedCells = build.cells.filter((cell) => cell.color.id !== borderColorId);

  if (trimmedCells.length < Math.max(4, Math.floor(build.cells.length * 0.12))) {
    return build;
  }

  return rebuildBlockBuild({
    cells: trimmedCells,
    columns: build.columns,
    rows: build.rows,
  });
};

const createBooleanGrid = (width: number, depth: number, fill = false) =>
  Array.from({ length: depth }, () => Array.from({ length: width }, () => fill));

const fillGrid = (
  width: number,
  depth: number,
  cells: Array<{ localX: number; localZ: number }>,
) => {
  const grid = createBooleanGrid(width, depth);

  cells.forEach((cell) => {
    if (grid[cell.localZ]?.[cell.localX] !== undefined) {
      grid[cell.localZ]![cell.localX] = true;
    }
  });

  return grid;
};

const fillRectangle = (
  width: number,
  depth: number,
  startX: number,
  startZ: number,
  rectangleWidth: number,
  rectangleDepth: number,
) => {
  const grid = createBooleanGrid(width, depth);

  for (let z = startZ; z < startZ + rectangleDepth; z += 1) {
    for (let x = startX; x < startX + rectangleWidth; x += 1) {
      grid[z]![x] = true;
    }
  }

  return grid;
};

const tileGrid = (
  occupancy: boolean[][],
  catalog: CatalogPart[],
) => {
  const filled = occupancy.map((row) => row.slice());
  const placements: Array<{ part: CatalogPart; x: number; z: number }> = [];
  const depth = filled.length;
  const width = filled[0]?.length ?? 0;

  const fits = (part: CatalogPart, startX: number, startZ: number) => {
    if (startX + part.studsX > width || startZ + part.studsZ > depth) {
      return false;
    }

    for (let z = startZ; z < startZ + part.studsZ; z += 1) {
      for (let x = startX; x < startX + part.studsX; x += 1) {
        if (!filled[z]?.[x]) {
          return false;
        }
      }
    }

    return true;
  };

  const clear = (part: CatalogPart, startX: number, startZ: number) => {
    for (let z = startZ; z < startZ + part.studsZ; z += 1) {
      for (let x = startX; x < startX + part.studsX; x += 1) {
        filled[z]![x] = false;
      }
    }
  };

  for (let z = 0; z < depth; z += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!filled[z]?.[x]) {
        continue;
      }

      const candidate =
        catalog.find((part) => fits(part, x, z)) ??
        catalog[catalog.length - 1];

      placements.push({
        part: candidate!,
        x,
        z,
      });
      clear(candidate!, x, z);
    }
  }

  return placements;
};

const addPlacements = ({
  assemblyId,
  color,
  layerStart,
  partPlacements,
  role,
  studFootprint,
}: {
  assemblyId: string;
  color: BlockColor;
  layerStart: number;
  partPlacements: Array<{ part: CatalogPart; x: number; z: number }>;
  role: ModelPart['role'];
  studFootprint: { depth: number; width: number };
}) =>
  partPlacements.map(({ part, x, z }, index): ModelPart => {
    const centerX =
      ((x + part.studsX / 2) - studFootprint.width / 2) * LDU_PER_STUD;
    const centerZ =
      ((z + part.studsZ / 2) - studFootprint.depth / 2) * LDU_PER_STUD;
    const centerY = -((layerStart + (part.category === 'brick' ? 1.5 : 0.5)) * LDU_PER_PLATE);
    const bricklinkMetadata = getBricklinkMetadata(part.id, color.id);

    return {
      assemblyId,
      ...bricklinkMetadata,
      colorCode: getColorCode(color.id),
      colorId: color.id,
      colorName: color.name,
      heightPlates: part.category === 'brick' ? 3 : 1,
      id: `${assemblyId}-${slugify(part.id)}-${index + 1}`,
      partId: part.id,
      partName: part.name,
      role,
      studsX: part.studsX,
      studsZ: part.studsZ,
      transform: {
        matrix: IDENTITY_MATRIX,
        x: centerX,
        y: centerY,
        z: centerZ,
      },
    };
  });

const createCircleCells = ({
  centerX,
  centerZ,
  innerRadius,
  outerRadius,
}: {
  centerX: number;
  centerZ: number;
  innerRadius: number;
  outerRadius: number;
}) => {
  const cells: Array<{ localX: number; localZ: number }> = [];

  for (let localZ = Math.floor(centerZ - outerRadius - 1); localZ <= Math.ceil(centerZ + outerRadius + 1); localZ += 1) {
    for (let localX = Math.floor(centerX - outerRadius - 1); localX <= Math.ceil(centerX + outerRadius + 1); localX += 1) {
      const dx = localX + 0.5 - centerX;
      const dz = localZ + 0.5 - centerZ;
      const distance = Math.sqrt(dx * dx + dz * dz);

      if (distance <= outerRadius && distance >= innerRadius) {
        cells.push({ localX, localZ });
      }
    }
  }

  return cells;
};

const getBoundaryCells = (cells: Array<{ localX: number; localZ: number }>) => {
  const keySet = new Set(cells.map((cell) => `${cell.localX}:${cell.localZ}`));

  return cells.filter((cell) => {
    const neighbors = [
      [cell.localX + 1, cell.localZ],
      [cell.localX - 1, cell.localZ],
      [cell.localX, cell.localZ + 1],
      [cell.localX, cell.localZ - 1],
    ];

    return neighbors.some(([x, z]) => !keySet.has(`${x}:${z}`));
  });
};

const uniqueLocalCells = (cells: Array<{ color: BlockColor; localX: number; localZ: number }>) =>
  Object.values(
    cells.reduce<Record<string, { color: BlockColor; localX: number; localZ: number }>>((map, cell) => {
      map[`${cell.localX}:${cell.localZ}`] = cell;
      return map;
    }, {}),
  );

const buildDisplayGrid = ({
  build,
  spec,
}: {
  build: BlockBuild;
  spec: BrickSetSpec;
}): BlockBuild => {
  if (spec.modelStyle !== 'monochrome-signature' || !build.visibleBounds) {
    return build;
  }

  const trimmed = trimBorderBackground(build);
  const bounds = trimmed.visibleBounds ?? build.visibleBounds;
  const visibleCells = getVisibleCells(trimmed, bounds);
  const localWidth = bounds.maxX - bounds.minX + 1;
  const localDepth = bounds.maxY - bounds.minY + 1;
  const baseTop = spec.targetStuds.depth - spec.plinthDepthStuds;
  const centerX = spec.targetStuds.width / 2;
  const centerZ = Math.min(baseTop - 2, Math.max(localDepth / 2 + spec.frameMarginStuds, spec.targetStuds.depth / 2 - 1));
  const radius = Math.min(localWidth, baseTop - spec.frameMarginStuds) / 2 + 1;

  const whiteFace = createCircleCells({
    centerX,
    centerZ,
    innerRadius: 0,
    outerRadius: Math.max(2, radius),
  });
  const ring = createCircleCells({
    centerX,
    centerZ,
    innerRadius: Math.max(0, radius - 1.25),
    outerRadius: radius,
  });

  const promptMarks = visibleCells
    .filter((cell) => cell.color.id === 'black' || cell.color.id === 'blue')
    .map((cell) => ({
      color: BLOCK_PALETTE.black,
      localX: cell.localX + spec.frameMarginStuds,
      localZ: cell.localZ + spec.frameMarginStuds,
    }));

  const faceCells = uniqueLocalCells(
    whiteFace.map((cell) => ({
      ...cell,
      color: BLOCK_PALETTE.white,
    })),
  );
  const ringCells = uniqueLocalCells(
    ring.map((cell) => ({
      ...cell,
      color: BLOCK_PALETTE.black,
    })),
  );
  const plinthCells = uniqueLocalCells(
    Array.from({ length: spec.plinthDepthStuds }, (_, depthIndex) => depthIndex).flatMap((depthIndex) =>
      Array.from({ length: Math.max(6, Math.floor(spec.targetStuds.width * 0.62)) }, (_, widthIndex) => ({
        color: depthIndex === 0 ? BLOCK_PALETTE.white : BLOCK_PALETTE.black,
        localX:
          Math.floor((spec.targetStuds.width - Math.max(6, Math.floor(spec.targetStuds.width * 0.62))) / 2) +
          widthIndex,
        localZ: baseTop + depthIndex,
      })),
    ),
  );

  const allCells = uniqueLocalCells([...faceCells, ...ringCells, ...promptMarks, ...plinthCells]).map((cell) => ({
    color: cell.color,
    x: cell.localX,
    y: cell.localZ,
  }));

  return rebuildBlockBuild({
    cells: allCells,
    columns: spec.targetStuds.width,
    rows: spec.targetStuds.depth,
  });
};

const buildArtPlacements = ({
  build,
  color,
  frameMarginStuds,
  studFootprint,
}: {
  build: BlockBuild;
  color: BlockColor;
  frameMarginStuds: number;
  studFootprint: { depth: number; width: number };
}) => {
  const bounds = build.visibleBounds;

  if (!bounds) {
    return [];
  }

  const cells = getVisibleCells(build, bounds)
    .filter((cell) => cell.color.id === color.id)
    .map((cell) => ({
      localX: cell.localX + frameMarginStuds,
      localZ: cell.localZ + frameMarginStuds,
    }));

  return tileGrid(fillGrid(studFootprint.width, studFootprint.depth, cells), PLATE_PARTS);
};

const computeBounds = (parts: ModelPart[]) => {
  const partBounds = parts.flatMap((part) => {
    const halfX = (part.studsX * LDU_PER_STUD) / 2;
    const halfZ = (part.studsZ * LDU_PER_STUD) / 2;
    const height = part.heightPlates * LDU_PER_PLATE;

    return [
      {
        x: part.transform.x - halfX,
        y: part.transform.y - height / 2,
        z: part.transform.z - halfZ,
      },
      {
        x: part.transform.x + halfX,
        y: part.transform.y + height / 2,
        z: part.transform.z + halfZ,
      },
    ];
  });

  return partBounds.reduce<ModelBounds>(
    (bounds, point) => ({
      minX: Math.min(bounds.minX, point.x),
      minY: Math.min(bounds.minY, point.y),
      minZ: Math.min(bounds.minZ, point.z),
      maxX: Math.max(bounds.maxX, point.x),
      maxY: Math.max(bounds.maxY, point.y),
      maxZ: Math.max(bounds.maxZ, point.z),
    }),
    {
      minX: 0,
      minY: 0,
      minZ: 0,
      maxX: 0,
      maxY: 0,
      maxZ: 0,
    },
  );
};

export const buildBuildIntent = ({
  brandName,
  input,
}: {
  brandName: string;
  input: ConceptInput;
}): BuildIntent => ({
  brandName,
  flagship: /codex|openai/i.test(brandName),
  promptSummary: input.kind === 'prompt' ? input.prompt : undefined,
  sourceKind: input.kind,
  targetKind: /codex|openai/i.test(brandName) ? 'signature-collectible' : 'display-set',
  targetScale: 'desk',
});

export const buildBrickSetSpec = ({
  brandName,
  build,
  input,
}: {
  brandName: string;
  build: BlockBuild;
  input: ConceptInput;
}): BrickSetSpec => {
  const visibleWidth =
    build.visibleBounds === null
      ? build.columns
      : build.visibleBounds.maxX - build.visibleBounds.minX + 1;
  const visibleDepth =
    build.visibleBounds === null
      ? build.rows
      : build.visibleBounds.maxY - build.visibleBounds.minY + 1;
  const flagship = /codex|openai/i.test(brandName);
  const frameMarginStuds = flagship ? 3 : 2;
  const plinthDepthStuds = flagship ? 4 : 0;

  return {
    sku: createBuildId(brandName),
    buildId: createBuildId(brandName),
    collection: flagship
      ? 'Codex Signature Set'
      : 'Custom Creator Series',
    launchLine: flagship ? 'Signature Collection' : 'Commissioned Builds',
    flagshipName: flagship
      ? 'Codex Monolith'
      : `${brandName} Display Set`,
    packagingBrief:
      flagship
        ? 'Treat the set like a premium monochrome collectible on a small display plinth.'
        : input.kind === 'prompt'
          ? 'Treat the set like a premium Codex-era flagship with desk-display confidence.'
          : 'Frame the mark like a premium collectible plaque with real parts behind the hero shot.',
    silhouetteGoal:
      flagship
        ? 'Hold the Codex mark as a crisp monochrome silhouette with a premium black-and-white face and a stable plinth.'
        : 'Hold the mark silhouette cleanly at desk scale while keeping the model physically plausible.',
    modelStyle: flagship ? 'monochrome-signature' : 'color-display',
    instructionTheme: 'airy-sky-blue',
    accentColor: inferAccentColor(brandName),
    archetype: flagship ? 'medallion' : 'badge-plaque',
    packagingAngle: flagship ? 'three-quarter-left' : 'three-quarter-right',
    targetStuds: {
      width: visibleWidth + frameMarginStuds * 2,
      depth: visibleDepth + frameMarginStuds * 2 + plinthDepthStuds,
    },
    frameMarginStuds,
    plinthDepthStuds,
    backingLayers: 2,
    reliefLayers: flagship ? 2 : 1,
    supportStrategy: flagship ? 'plinth-supported' : 'flat-display-plaque',
  };
};

export const buildPartManifest = (model: ModelIR): SetPartManifestItem[] =>
  Object.values(
    model.parts.reduce<Record<string, SetPartManifestItem>>((manifest, part) => {
      const key = `${part.partId}:${part.colorId}:${part.role}`;
      const existing = manifest[key];

      if (existing) {
        existing.count += 1;
        return manifest;
      }

      manifest[key] = {
        bricklinkAvailableInColor: part.bricklinkAvailableInColor,
        bricklinkCatalogUrl: part.bricklinkCatalogUrl,
        bricklinkColorId: part.bricklinkColorId,
        bricklinkColorName: part.bricklinkColorName,
        bricklinkItemNo: part.bricklinkItemNo,
        bricklinkItemType: part.bricklinkItemType,
        colorCode: part.colorCode,
        colorId: part.colorId,
        colorName: part.colorName,
        count: 1,
        hex: getColorById(part.colorId).hex,
        key,
        partId: part.partId,
        partName: part.partName,
        role: part.role,
      };

      return manifest;
    }, {}),
  ).sort((left, right) => right.count - left.count || left.partId.localeCompare(right.partId));

export const summarizeBricklinkSourcing = <
  T extends Pick<SetPartManifestItem, 'bricklinkAvailableInColor' | 'bricklinkItemNo'>
>(
  items: T[],
) =>
  buildBricklinkManifestPayload(items);

export const buildInstructionPlan = (model: ModelIR): InstructionPlan => {
  const countForAssembly = (assemblyId: string) =>
    model.parts.filter((part) => part.assemblyId === assemblyId).length;
  const partsForAssembly = (assemblyIds: string[]) =>
    Object.values(
      model.parts
        .filter((part) => assemblyIds.includes(part.assemblyId))
        .reduce<
          Record<
            string,
            {
              colorId: string;
              colorName: string;
              count: number;
              hex: string;
              partId: string;
              partName: string;
            }
          >
        >((parts, part) => {
          const key = `${part.partId}:${part.colorId}`;
          const existing = parts[key];

          if (existing) {
            existing.count += 1;
            return parts;
          }

          parts[key] = {
            colorId: part.colorId,
            colorName: part.colorName,
            count: 1,
            hex: getColorById(part.colorId).hex,
            partId: part.partId,
            partName: part.partName,
          };

          return parts;
        }, {}),
    ).sort((left, right) => right.count - left.count || left.partId.localeCompare(right.partId));

  const baseAssemblies = model.assemblies.some((assembly) => assembly.id === 'plinth')
    ? ['plinth']
    : ['backing'];
  const faceAssemblies = model.assemblies.some((assembly) => assembly.id === 'face')
    ? ['backing', 'face']
    : ['frame'];
  const detailAssemblies = model.assemblies.some((assembly) => assembly.id === 'detail')
    ? ['detail']
    : ['art'];

  return {
    steps: [
      {
        id: 'foundation-01',
        title: 'Start the base',
        detail: 'Build the display foundation first so the collectible has a stable footing before the silhouette rises.',
        assemblyIds: baseAssemblies,
        partsNeeded: partsForAssembly(baseAssemblies),
        partCount: baseAssemblies.reduce((total, assemblyId) => total + countForAssembly(assemblyId), 0),
      },
      {
        id: 'face-02',
        title: 'Raise the face',
        detail: 'Layer the main face and backing so the object reads as one clean iconic form.',
        assemblyIds: faceAssemblies,
        partsNeeded: partsForAssembly(faceAssemblies),
        partCount: faceAssemblies.reduce((total, assemblyId) => total + countForAssembly(assemblyId), 0),
      },
      {
        id: 'detail-03',
        title: 'Snap the details',
        detail: 'Lock the final details last so the Codex mark resolves cleanly and the silhouette stays crisp.',
        assemblyIds: detailAssemblies,
        partsNeeded: partsForAssembly(detailAssemblies),
        partCount: detailAssemblies.reduce((total, assemblyId) => total + countForAssembly(assemblyId), 0),
      },
    ],
  };
};

const ldrawLineForPart = (part: ModelPart) =>
  [
    '1',
    String(part.colorCode),
    String(Math.round(part.transform.x)),
    String(Math.round(part.transform.y)),
    String(Math.round(part.transform.z)),
    ...part.transform.matrix.map((value) => String(value)),
    part.partId,
  ].join(' ');

export const serializeModelToMpd = ({
  brandName,
  model,
}: {
  brandName: string;
  model: ModelIR;
}) => {
  const title = `${brandName} Flagship Set`;
  const files: string[] = [];
  const assemblyFiles = model.assemblies.filter((assembly) => assembly.id !== 'root');

  files.push('0 FILE model.ldr');
  files.push(`0 Name: ${title}`);
  files.push('0 Author: Codex');
  assemblyFiles.forEach((assembly) => {
    files.push(`1 16 0 0 0 1 0 0 0 1 0 0 0 1 ${assembly.id}.ldr`);
  });
  files.push('');

  assemblyFiles.forEach((assembly) => {
    files.push(`0 FILE ${assembly.id}.ldr`);
    files.push(`0 Name: ${assembly.name}`);
    model.parts
      .filter((part) => part.assemblyId === assembly.id)
      .forEach((part) => files.push(ldrawLineForPart(part)));
    files.push('');
  });

  return files.join('\n').trim();
};

export const buildStudioIoBundle = ({
  brandName,
  instructionPlan,
  mpdText,
  spec,
}: {
  brandName: string;
  instructionPlan: InstructionPlan;
  mpdText: string;
  spec: BrickSetSpec;
}) => {
  const metadata = JSON.stringify(
    {
      buildId: spec.buildId,
      collection: spec.collection,
      flagshipName: spec.flagshipName,
      brandName,
      packagingBrief: spec.packagingBrief,
    },
    null,
    2,
  );
  const instructions = JSON.stringify(instructionPlan, null, 2);

  const entries = [
    { name: 'model.ldr', data: mpdText },
    { name: 'metadata.json', data: metadata },
    { name: 'instructions.json', data: instructions },
  ];

  return {
    entryNames: entries.map((entry) => entry.name),
    ioFileBytes: createStoredZip(entries),
  };
};

export const validateModelIR = ({
  ioEntryNames,
  model,
  mpdText,
}: {
  ioEntryNames: string[];
  model: ModelIR;
  mpdText: string;
}): ModelValidationReport => {
  const issues: ModelValidationIssue[] = [];
  const assemblyIds = new Set(model.assemblies.map((assembly) => assembly.id));
  const partIds = new Set<string>();
  const occupied = new Set<string>();
  const warningCodes = new Set<ModelValidationIssue['code']>([
    'bricklink-color-unavailable',
    'bricklink-part-missing',
  ]);

  model.assemblies.forEach((assembly) => {
    if (assembly.parentId && !assemblyIds.has(assembly.parentId)) {
      issues.push({
        code: 'assembly-parent-missing',
        message: `Assembly ${assembly.id} references missing parent ${assembly.parentId}.`,
      });
    }
  });

  model.parts.forEach((part) => {
    if (!assemblyIds.has(part.assemblyId)) {
      issues.push({
        code: 'assembly-unknown',
        message: `Part ${part.id} references missing assembly ${part.assemblyId}.`,
      });
    }

    if (!PART_CATALOG.find((catalogPart) => catalogPart.id === part.partId)) {
      issues.push({
        code: 'missing-part-definition',
        message: `Part ${part.id} uses unknown catalog part ${part.partId}.`,
      });
    }

    if (!part.bricklinkItemNo || !part.bricklinkItemType) {
      issues.push({
        code: 'bricklink-part-missing',
        message: `Part ${part.id} is missing BrickLink catalog mapping for ${part.partId}.`,
      });
    }

    if (!part.bricklinkAvailableInColor) {
      issues.push({
        code: 'bricklink-color-unavailable',
        message: `Part ${part.id} does not have a verified BrickLink color pairing for ${part.colorName}.`,
      });
    }

    if (
      !Number.isFinite(part.transform.x) ||
      !Number.isFinite(part.transform.y) ||
      !Number.isFinite(part.transform.z) ||
      part.transform.matrix.some((value) => !Number.isFinite(value))
    ) {
      issues.push({
        code: 'invalid-transform',
        message: `Part ${part.id} has an invalid transform.`,
      });
    }

    if (partIds.has(part.id)) {
      issues.push({
        code: 'duplicate-part-id',
        message: `Part id ${part.id} is duplicated.`,
      });
    }
    partIds.add(part.id);

    const occupancyKey = [
      part.assemblyId,
      part.partId,
      part.colorId,
      part.transform.x,
      part.transform.y,
      part.transform.z,
    ].join(':');
    if (occupied.has(occupancyKey)) {
      issues.push({
        code: 'overlap',
        message: `Part ${part.id} overlaps an existing part placement.`,
      });
    }
    occupied.add(occupancyKey);
  });

  const missingSubmodels = model.assemblies
    .filter((assembly) => assembly.id !== 'root')
    .map((assembly) => `${assembly.id}.ldr`)
    .filter((fileName) => !mpdText.includes(`0 FILE ${fileName}`));

  missingSubmodels.forEach((fileName) => {
    issues.push({
      code: 'submodel-reference-missing',
      message: `MPD export is missing submodel ${fileName}.`,
    });
  });

  return {
    exportChecks: {
      ioBundle: ioEntryNames.includes('model.ldr') && ioEntryNames.includes('instructions.json'),
      mpdText: mpdText.includes('0 FILE model.ldr') && mpdText.includes('1 16 0 0 0'),
    },
    issues,
    totals: {
      assemblies: model.assemblies.length,
      parts: model.parts.length,
      uniqueColorBins: model.colorBins.length,
      uniquePartKinds: new Set(model.parts.map((part) => part.partId)).size,
    },
    valid: issues.every((issue) => warningCodes.has(issue.code)),
  };
};

export const compileModelIR = ({
  displayGrid,
  dominantColor,
  spec,
}: {
  displayGrid: BlockBuild;
  dominantColor: BlockColor;
  spec: BrickSetSpec;
}) => {
  const studFootprint = {
    width: spec.targetStuds.width,
    depth: spec.targetStuds.depth,
  };
  if (spec.modelStyle === 'monochrome-signature') {
    const assemblies: ModelAssembly[] = [
      { id: 'root', kind: 'root', name: 'Signature Root' },
      { id: 'plinth', kind: 'plinth', name: 'Display Plinth', parentId: 'root' },
      { id: 'backing', kind: 'backing', name: 'Backing Shape', parentId: 'root' },
      { id: 'face', kind: 'face', name: 'Signature Face', parentId: 'root' },
      { id: 'detail', kind: 'detail', name: 'Signature Details', parentId: 'root' },
    ];

    const localCells = displayGrid.cells.map((cell) => ({
      color: cell.color,
      localX: cell.x,
      localZ: cell.y,
    }));
    const plinthStart = spec.targetStuds.depth - spec.plinthDepthStuds;
    const silhouetteCells = localCells.filter((cell) => cell.localZ < plinthStart);
    const plinthCells = localCells.filter((cell) => cell.localZ >= plinthStart);
    const boundaryKeys = new Set(
      getBoundaryCells(silhouetteCells.map((cell) => ({ localX: cell.localX, localZ: cell.localZ }))).map(
        (cell) => `${cell.localX}:${cell.localZ}`,
      ),
    );
    const whiteCells = silhouetteCells.filter((cell) => cell.color.id === 'white');
    const detailCells = silhouetteCells.filter(
      (cell) => cell.color.id === 'black' || boundaryKeys.has(`${cell.localX}:${cell.localZ}`),
    );

    const backingPlacements = tileGrid(
      fillGrid(
        studFootprint.width,
        studFootprint.depth,
        silhouetteCells.map((cell) => ({
          localX: cell.localX,
          localZ: cell.localZ,
        })),
      ),
      BRICK_PARTS,
    );
    const facePlacements = tileGrid(
      fillGrid(
        studFootprint.width,
        studFootprint.depth,
        whiteCells.map((cell) => ({
          localX: cell.localX,
          localZ: cell.localZ,
        })),
      ),
      PLATE_PARTS,
    );
    const detailPlacements = tileGrid(
      fillGrid(
        studFootprint.width,
        studFootprint.depth,
        detailCells.map((cell) => ({
          localX: cell.localX,
          localZ: cell.localZ,
        })),
      ),
      PLATE_PARTS,
    );
    const plinthPlacements = tileGrid(
      fillGrid(
        studFootprint.width,
        studFootprint.depth,
        plinthCells.map((cell) => ({
          localX: cell.localX,
          localZ: cell.localZ,
        })),
      ),
      BRICK_PARTS,
    );

    const parts = [
      ...addPlacements({
        assemblyId: 'backing',
        color: BLOCK_PALETTE.black,
        layerStart: 0,
        partPlacements: backingPlacements,
        role: 'backing',
        studFootprint,
      }),
      ...addPlacements({
        assemblyId: 'face',
        color: BLOCK_PALETTE.white,
        layerStart: spec.backingLayers,
        partPlacements: facePlacements,
        role: 'art',
        studFootprint,
      }),
      ...addPlacements({
        assemblyId: 'detail',
        color: BLOCK_PALETTE.black,
        layerStart: spec.backingLayers + 1,
        partPlacements: detailPlacements,
        role: 'art',
        studFootprint,
      }),
      ...addPlacements({
        assemblyId: 'plinth',
        color: BLOCK_PALETTE.black,
        layerStart: 0,
        partPlacements: plinthPlacements,
        role: 'frame',
        studFootprint,
      }),
    ];

    const colorBins = Object.values(
      parts.reduce<Record<string, ModelColorBin>>((bins, part) => {
        const existing = bins[part.colorId];

        if (existing) {
          existing.count += 1;
          return bins;
        }

        bins[part.colorId] = {
          colorCode: part.colorCode,
          colorId: part.colorId,
          colorName: part.colorName,
          count: 1,
          hex: getColorById(part.colorId).hex,
        };

        return bins;
      }, {}),
    ).sort((left, right) => right.count - left.count);

    return {
      assemblies,
      bounds: computeBounds(parts),
      colorBins,
      parts,
      studFootprint,
      supportStrategy: {
        kind: spec.supportStrategy,
        notes: [
          'Signature milestone uses a monochrome face with a dedicated display plinth.',
          'The backing and plinth share the same canonical model data used by exports and instructions.',
        ],
      },
    } satisfies ModelIR;
  }

  const assemblies: ModelAssembly[] = [
    { id: 'root', kind: 'root', name: 'Flagship Root' },
    { id: 'backing', kind: 'backing', name: 'Backing Board', parentId: 'root' },
    { id: 'frame', kind: 'frame', name: 'Display Frame', parentId: 'root' },
    { id: 'art', kind: 'art', name: 'Hero Mark', parentId: 'root' },
  ];
  const backingPlacements = tileGrid(
    fillRectangle(studFootprint.width, studFootprint.depth, 0, 0, studFootprint.width, studFootprint.depth),
    BRICK_PARTS,
  );
  const backingTopPlacements = tileGrid(
    fillRectangle(studFootprint.width, studFootprint.depth, 0, 0, studFootprint.width, studFootprint.depth),
    PLATE_PARTS,
  );

  const frameCells: Array<{ localX: number; localZ: number }> = [];
  for (let z = 0; z < studFootprint.depth; z += 1) {
    for (let x = 0; x < studFootprint.width; x += 1) {
      const edge =
        x === 0 ||
        z === 0 ||
        x === studFootprint.width - 1 ||
        z === studFootprint.depth - 1;

      if (edge) {
        frameCells.push({ localX: x, localZ: z });
      }
    }
  }

  const framePlacements = tileGrid(
    fillGrid(studFootprint.width, studFootprint.depth, frameCells),
    PLATE_PARTS,
  );

  const artColors = Object.values(BLOCK_PALETTE).filter((color) =>
    displayGrid.cells.some((cell) => cell.color.id === color.id),
  );
  const artPlacements = artColors.flatMap((color) =>
    addPlacements({
      assemblyId: 'art',
      color,
      layerStart: spec.backingLayers,
      partPlacements: buildArtPlacements({
        build: displayGrid,
        color,
        frameMarginStuds: spec.frameMarginStuds,
        studFootprint,
      }),
      role: 'art',
      studFootprint,
    }),
  );

  const parts = [
    ...addPlacements({
      assemblyId: 'backing',
      color: BLOCK_PALETTE.black,
      layerStart: 0,
      partPlacements: backingPlacements,
      role: 'backing',
      studFootprint,
    }),
    ...addPlacements({
      assemblyId: 'backing',
      color: dominantColor.id === 'white' ? BLOCK_PALETTE.black : BLOCK_PALETTE.white,
      layerStart: spec.backingLayers - 1,
      partPlacements: backingTopPlacements,
      role: 'backing',
      studFootprint,
    }),
    ...addPlacements({
      assemblyId: 'frame',
      color: BLOCK_PALETTE.white,
      layerStart: spec.backingLayers,
      partPlacements: framePlacements,
      role: 'frame',
      studFootprint,
    }),
    ...artPlacements,
  ];

  const colorBins = Object.values(
    parts.reduce<Record<string, ModelColorBin>>((bins, part) => {
      const existing = bins[part.colorId];

      if (existing) {
        existing.count += 1;
        return bins;
      }

      bins[part.colorId] = {
        colorCode: part.colorCode,
        colorId: part.colorId,
        colorName: part.colorName,
        count: 1,
        hex: getColorById(part.colorId).hex,
      };

      return bins;
    }, {}),
  ).sort((left, right) => right.count - left.count);

  return {
    assemblies,
    bounds: computeBounds(parts),
    colorBins,
    parts,
    studFootprint,
    supportStrategy: {
      kind: spec.supportStrategy,
      notes: [
        'Flagship milestone uses a rigid flat plaque geometry so the silhouette stays clean.',
        'Studio desktop stand rendering is optional and can be layered later without changing the IR.',
      ],
    },
  } satisfies ModelIR;
};

export const buildRealSet = ({
  brandName,
  build,
  dominantColor,
  input,
  setSpec,
}: {
  brandName: string;
  build: BlockBuild;
  dominantColor?: BlockColor;
  input: ConceptInput;
  setSpec?: BrickSetSpec;
}): RealSetBuild => {
  const workingBuild = /codex|openai/i.test(brandName) ? trimBorderBackground(build) : build;
  const intent = buildBuildIntent({ brandName, input });
  const spec = setSpec ?? buildBrickSetSpec({ brandName, build: workingBuild, input });
  const lockedDominantColor = dominantColor ?? workingBuild.dominantColor ?? BLOCK_PALETTE.green;
  const displayGrid = buildDisplayGrid({
    build: workingBuild,
    spec,
  });
  const model = compileModelIR({
    displayGrid,
    dominantColor: lockedDominantColor,
    spec,
  });
  const instructionPlan = buildInstructionPlan(model);
  const mpdText = serializeModelToMpd({
    brandName,
    model,
  });
  const ioBundle = buildStudioIoBundle({
    brandName,
    instructionPlan,
    mpdText,
    spec,
  });
  const validation = validateModelIR({
    ioEntryNames: ioBundle.entryNames,
    model,
    mpdText,
  });

  return {
    displayGrid,
    exportBundle: {
      instructionPlan,
      ioEntryNames: ioBundle.entryNames,
      ioFileBytes: ioBundle.ioFileBytes,
      ioFileName: `${slugify(brandName)}-${slugify(spec.sku)}.io`,
      mpdFileName: `${slugify(brandName)}-${slugify(spec.sku)}.mpd`,
      mpdText,
      renderScene: {
        background: 'openai-shell',
        builderCamera: 'front-three-quarter',
        heroCamera: 'isometric',
        lighting: 'studio-soft',
      },
    },
    intent,
    model,
    partManifest: buildPartManifest(model),
    spec,
    validation,
  };
};

export const createIoBlob = (bundle: ExportBundle) =>
  {
    const bytes = new Uint8Array(bundle.ioFileBytes.byteLength);
    bytes.set(bundle.ioFileBytes);

    return new Blob([bytes], {
      type: 'application/octet-stream',
    });
  };

export const createMpdBlob = (bundle: ExportBundle) =>
  new Blob([bundle.mpdText], {
    type: 'text/plain;charset=utf-8',
  });
