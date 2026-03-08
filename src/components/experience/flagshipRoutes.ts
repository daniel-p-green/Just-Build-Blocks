import type { ExperiencePromptForm, ExperienceSession, ExperiencePhase } from './types';

export const FLAGSHIP_SESSION_STORAGE_KEY = 'just-build-blocks.flagship-session';

export const PHASE_PATHS: Record<ExperiencePhase, string> = {
  creative: '/direction',
  generation: '/generation',
  input: '/start',
  instructions: '/instructions',
  keepsakes: '/keepsakes',
  landing: '/',
  reveal: '/reveal',
  studio: '/studio',
};

const PATH_PHASES = Object.entries(PHASE_PATHS).reduce<Record<string, ExperiencePhase>>((lookup, [phase, path]) => {
  lookup[path] = phase as ExperiencePhase;
  return lookup;
}, {});

export type PersistedFlagshipSnapshot = {
  activeInstructionStep: number;
  buildDirectionId: ExperienceSession['buildDirectionId'];
  instructionSync: boolean;
  promptForm: ExperiencePromptForm;
  rightsConfirmed: boolean;
  route: string;
  session: ExperienceSession;
  studioAutoRotate: boolean;
  studioExploded: boolean;
};

export const getPhasePath = (phase: ExperiencePhase) => PHASE_PATHS[phase];

export const resolvePhaseFromPath = (pathname: string): ExperiencePhase =>
  PATH_PHASES[pathname] ?? 'landing';

export const canAccessPhase = (
  phase: ExperiencePhase,
  {
    session,
    sourceAsset,
  }: {
    session: ExperienceSession | null;
    sourceAsset: { previewUrl: string } | null;
  },
) => {
  if (phase === 'landing' || phase === 'input') {
    return true;
  }

  if (phase === 'creative' || phase === 'generation') {
    return Boolean(sourceAsset);
  }

  return Boolean(session);
};

export const getGuardedPhase = (
  requestedPhase: ExperiencePhase,
  {
    session,
    sourceAsset,
  }: {
    session: ExperienceSession | null;
    sourceAsset: { previewUrl: string } | null;
  },
) => {
  if (canAccessPhase(requestedPhase, { session, sourceAsset })) {
    return requestedPhase;
  }

  if (sourceAsset) {
    return 'creative';
  }

  if (session) {
    return 'reveal';
  }

  return 'landing';
};
