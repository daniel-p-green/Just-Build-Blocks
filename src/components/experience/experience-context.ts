import { createContext } from 'react';

import type { CollectionPack } from '../../lib/collection-pack';
import type { BuildDirection } from './buildDirections';
import type { StudioHandoffBundle } from './studioHandoff';
import type {
  BuildDirectionId,
  ExperienceInputMode,
  ExperienceState,
  GenerationStageId,
} from './types';

export type ExperienceContextValue = {
  buildDirections: BuildDirection[];
  collectionPack: CollectionPack;
  continueFromInput: () => Promise<void>;
  currentStageIndex: number;
  downloadBuilderStill: () => void;
  downloadHandoffJson: () => void;
  downloadInstructionsArtifact: () => void;
  downloadInstructionsData: () => void;
  downloadIo: () => void;
  downloadLdr: () => void;
  downloadMpd: () => void;
  downloadPartManifest: () => void;
  downloadPosterFrame: () => void;
  downloadRevealClip: () => Promise<void>;
  downloadSceneJson: () => void;
  downloadStill: () => void;
  downloadStudioValidationReport: () => void;
  downloadValidationReport: () => void;
  downloadingRevealClip: boolean;
  generationStages: ReadonlyArray<{ detail: string; id: GenerationStageId; label: string }>;
  handleImageFile: (file: File | null) => Promise<void>;
  openExample: (sku: string) => void;
  openInput: () => void;
  promptAvailabilityCopy: string;
  resetExperience: () => void;
  runGeneration: () => Promise<void>;
  selectBuildDirection: (directionId: BuildDirectionId) => void;
  setActiveInstructionStep: (step: number) => void;
  setInputMode: (mode: ExperienceInputMode) => void;
  setInstructionSync: (next: boolean) => void;
  setPhase: (phase: ExperienceState['phase']) => void;
  setPromptField: (field: 'brandName' | 'prompt', value: string) => void;
  setRightsConfirmed: (next: boolean) => void;
  setStudioAutoRotate: (next: boolean) => void;
  setStudioExploded: (next: boolean) => void;
  state: ExperienceState;
  studioHandoffBundle: StudioHandoffBundle | null;
};

export const ExperienceContext = createContext<ExperienceContextValue | null>(null);
