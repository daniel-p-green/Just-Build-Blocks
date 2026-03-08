import type { RealSetBuild } from '../../lib/set-engine';
import type { ScenePack } from '../../lib/scene-pack';

export type StudioReviewAsset = {
  description: string;
  fileName: string;
  kind: 'brief' | 'io' | 'ldr' | 'manifest' | 'report' | 'screenshot' | 'validation';
  label: string;
};

export type ValidationReportSummary = {
  issueCount: number;
  status: 'Attention needed' | 'Review-ready';
  summary: string;
};

export type StudioHandoffBundle = {
  buildBrief: string;
  footprint: string;
  ioAsset: StudioReviewAsset | null;
  ldrAsset: StudioReviewAsset | null;
  materialsSummary: string;
  reviewAssets: StudioReviewAsset[];
  reviewChecklist: string[];
  setIdentifier: string;
  setTitle: string;
  shotList: string[];
  validationSummary: ValidationReportSummary;
};

const sentenceCase = (value: string) =>
  value
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^[a-z]/, (character) => character.toUpperCase());

const getFootprint = ({
  realSetBuild,
  scenePack,
}: {
  realSetBuild: RealSetBuild;
  scenePack: ScenePack;
}) => {
  const width = realSetBuild.model?.studFootprint?.width ?? scenePack.model.spec.targetStuds.width;
  const depth = realSetBuild.model?.studFootprint?.depth ?? scenePack.model.spec.targetStuds.depth;

  return `${width} x ${depth} studs`;
};

const getLdrFileName = (realSetBuild: RealSetBuild) => {
  const entryName = realSetBuild.exportBundle.ioEntryNames?.find((fileName) => fileName.endsWith('.ldr'));

  if (entryName) {
    return entryName;
  }

  if (realSetBuild.exportBundle.mpdFileName) {
    return realSetBuild.exportBundle.mpdFileName.replace(/\.mpd$/i, '.ldr');
  }

  return null;
};

const getMaterialsSummary = (realSetBuild: RealSetBuild, scenePack: ScenePack) => {
  const primaryParts = (realSetBuild.partManifest ?? [])
    .slice()
    .sort((left, right) => right.count - left.count)
    .slice(0, 2)
    .map((part) => `${part.count}x ${part.partName} in ${part.colorName}`);

  if (primaryParts.length > 0) {
    return primaryParts.join(', ');
  }

  const totalPieces = scenePack.instructions.countTotals.totalPieces;
  const uniqueColors = scenePack.instructions.countTotals.uniqueColors;

  return `${totalPieces} total parts across ${uniqueColors} colors`;
};

export const buildStudioValidationReport = (bundle: StudioHandoffBundle) => `# ${bundle.setTitle} Studio Review

- Set identifier: ${bundle.setIdentifier}
- Footprint: ${bundle.footprint}
- Validation status: ${bundle.validationSummary.status}
- Validation summary: ${bundle.validationSummary.summary}

## Build brief

${bundle.buildBrief}

## Shot list

${bundle.shotList.map((item) => `- ${item}`).join('\n')}

## Review checklist

${bundle.reviewChecklist.map((item) => `- ${item}`).join('\n')}

## Review assets

${bundle.reviewAssets.map((asset) => `- ${asset.label}: ${asset.fileName}`).join('\n')}
`;

export const buildStudioHandoffBundle = ({
  instructionsHtmlFileName,
  realSetBuild,
  scenePack,
}: {
  instructionsHtmlFileName: string;
  realSetBuild: RealSetBuild;
  scenePack: ScenePack;
}): StudioHandoffBundle => {
  const ldrFileName = getLdrFileName(realSetBuild);
  const issueCount = realSetBuild.validation.issues.length;
  const validationSummary: ValidationReportSummary = {
    issueCount,
    status: realSetBuild.validation.valid ? 'Review-ready' : 'Attention needed',
    summary: realSetBuild.validation.valid
      ? 'The exported set is internally consistent and ready for Studio review.'
      : `${issueCount} validation ${issueCount === 1 ? 'issue needs' : 'issues need'} attention before Studio review.`,
  };

  const ioAsset = realSetBuild.exportBundle.ioFileName
    ? {
        description: 'Editable BrickLink Studio project container.',
        fileName: realSetBuild.exportBundle.ioFileName,
        kind: 'io' as const,
        label: 'Studio project',
      }
    : null;

  const ldrAsset = ldrFileName
    ? {
        description: 'Inspectable LDraw companion export for static review.',
        fileName: ldrFileName,
        kind: 'ldr' as const,
        label: 'LDraw companion',
      }
    : null;

  const reviewAssets: StudioReviewAsset[] = [
    {
      description: 'Studio review brief with scope, footprint, and intent.',
      fileName: `${scenePack.setIdentity.sku.toLowerCase()}-studio-brief.md`,
      kind: 'brief',
      label: 'Build brief',
    },
    ...(ioAsset ? [ioAsset] : []),
    ...(ldrAsset ? [ldrAsset] : []),
    {
      description: 'Canonical parts and sourcing snapshot for the set.',
      fileName: scenePack.exports.manifestFileName,
      kind: 'manifest',
      label: 'Parts manifest',
    },
    {
      description: 'Instruction folio that matches the same build phases.',
      fileName: instructionsHtmlFileName,
      kind: 'brief',
      label: 'Instruction folio',
    },
    {
      description: 'Validation summary for the current build state.',
      fileName: scenePack.exports.validationFileName.replace(/\.json$/i, '.md'),
      kind: 'report',
      label: 'Validation report',
    },
    {
      description: 'Reference still for matching the intended review angle.',
      fileName: scenePack.exports.builderStillFileName,
      kind: 'screenshot',
      label: 'Studio still',
    },
  ];

  const shotList = ['Hero three-quarter view', 'Structural angle', 'Studio bench overview'];

  return {
    buildBrief: sentenceCase(
      `${scenePack.box.title} should read as a believable desk-scale collectible. Keep the silhouette recognizable, the color zoning clean, and the wrapper aligned with ${scenePack.copy.tagline.toLowerCase()}.`,
    ),
    footprint: getFootprint({ realSetBuild, scenePack }),
    ioAsset,
    ldrAsset,
    materialsSummary: getMaterialsSummary(realSetBuild, scenePack),
    reviewAssets,
    reviewChecklist: [
      'Confirm the .io file opens as the editable source of truth.',
      'Export a synced .ldr before external review.',
      'Capture one hero angle and one structural angle in Studio.',
      'Check silhouette, color zoning, and part plausibility against the box art.',
    ],
    setIdentifier: scenePack.setIdentity.sku,
    setTitle: scenePack.box.title,
    shotList,
    validationSummary,
  };
};
