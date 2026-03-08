import type { ImageDataLike } from '../../lib/block-engine';
import type { ConceptInput } from '../../lib/concept-input';
import type { RealSetBuild } from '../../lib/set-engine';
import type { ScenePack } from '../../lib/scene-pack';
import type { FlagshipGrammarPack } from './desktopPresentation';

export type ExperiencePhase =
  | 'landing'
  | 'input'
  | 'creative'
  | 'generation'
  | 'reveal'
  | 'studio'
  | 'instructions'
  | 'keepsakes';

export type ExperienceInputMode = 'image' | 'prompt';

export type BuildDirectionId = 'signature-mosaic' | 'desk-collectible' | 'night-bench';

export type GenerationStageId =
  | 'source-loaded'
  | 'block-build-ready'
  | 'real-set-ready'
  | 'scene-pack-ready'
  | 'artifacts-ready';

export type SourceAsset = {
  input: ConceptInput;
  brandName: string;
  fileName: string;
  previewUrl: string;
  imageData: ImageDataLike;
};

export type ExperienceSession = {
  buildDirectionId: BuildDirectionId;
  flagshipPack: FlagshipGrammarPack;
  instructionArtifactHtml: string;
  origin: 'custom' | 'example';
  realSetBuild: RealSetBuild;
  scenePack: ScenePack;
  sourceAsset: SourceAsset | null;
};

export type ExperiencePromptForm = {
  brandName: string;
  prompt: string;
};

export type ExperienceState = {
  activeInstructionStep: number;
  buildDirectionId: BuildDirectionId;
  error: string | null;
  generationStageId: GenerationStageId | null;
  inputMode: ExperienceInputMode;
  inputPending: boolean;
  instructionSync: boolean;
  phase: ExperiencePhase;
  promptAvailable: boolean | null;
  promptForm: ExperiencePromptForm;
  rightsConfirmed: boolean;
  session: ExperienceSession | null;
  sourceAsset: SourceAsset | null;
  studioAutoRotate: boolean;
  studioExploded: boolean;
};
