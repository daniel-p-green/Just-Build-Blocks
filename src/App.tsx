import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';

import './App.css';
import {
  buildBlockBuildFromImageData,
  type ImageDataLike,
} from './lib/block-engine';
import { buildCollectionPack } from './lib/collection-pack';
import {
  buildPromptConceptDataUrl,
  normalizeConceptInput,
  type PromptConcept,
} from './lib/concept-input';
import { buildInstructionArtifactHtml } from './lib/instruction-artifact';
import { getAudioPackBasePath, type AudioPackId } from './lib/audio-pack';
import {
  getRevealClipFileExtension,
  recordRevealClip,
} from './lib/reveal-renderer';
import { drawHeroCanvas } from './lib/hero-renderer';
import { buildScenePack } from './lib/scene-pack';
import {
  buildRealSet,
  createIoBlob,
  createMpdBlob,
  summarizeBricklinkSourcing,
} from './lib/set-engine';
import {
  BUILD_DIRECTIONS,
  getBuildDirectionConfig,
} from './components/experience/buildDirections';
import { CreativePhase } from './components/experience/CreativePhase';
import { getFlagshipGrammarPack } from './components/experience/desktopPresentation';
import { ExperienceProvider } from './components/experience/ExperienceContext';
import {
  FLAGSHIP_SESSION_STORAGE_KEY,
  getGuardedPhase,
  getPhasePath,
  resolvePhaseFromPath,
  type PersistedFlagshipSnapshot,
} from './components/experience/flagshipRoutes';
import { GenerationPhase } from './components/experience/GenerationPhase';
import { InputPhase } from './components/experience/InputPhase';
import { InstructionsPhase } from './components/experience/InstructionsPhase';
import { KeepsakesPhase } from './components/experience/KeepsakesPhase';
import { LandingPhase } from './components/experience/LandingPhase';
import { RevealPhase } from './components/experience/RevealPhase';
import {
  buildStudioHandoffBundle,
  buildStudioValidationReport,
} from './components/experience/studioHandoff';
import { StudioPhase } from './components/experience/StudioPhase';
import type {
  ExperiencePhase,
  ExperienceSession,
  ExperienceState,
  SourceAsset,
} from './components/experience/types';

const GENERATION_STAGES = [
  {
    detail: 'We lock the source and pull out the strongest recognizable shape.',
    id: 'source-loaded',
    label: 'Reading your source',
  },
  {
    detail: 'The mark resolves into a constrained block grid with a believable rhythm.',
    id: 'block-build-ready',
    label: 'Mapping the brick grid',
  },
  {
    detail: 'The object, part logic, and structural order click into place.',
    id: 'real-set-ready',
    label: 'Shaping the object',
  },
  {
    detail: 'The wrapper and studio line up around the same finished set.',
    id: 'scene-pack-ready',
    label: 'Wrapping the set',
  },
  {
    detail: 'Instructions and keepsakes settle in just before the reveal.',
    id: 'artifacts-ready',
    label: 'Preparing the keepsakes',
  },
] as const;

const INITIAL_STATE: ExperienceState = {
  activeInstructionStep: 0,
  buildDirectionId: 'signature-mosaic',
  error: null,
  generationStageId: null,
  inputMode: 'image',
  inputPending: false,
  instructionSync: true,
  phase: 'landing',
  promptAvailable: null,
  promptForm: {
    brandName: '',
    prompt: '',
  },
  rightsConfirmed: false,
  session: null,
  sourceAsset: null,
  studioAutoRotate: false,
  studioExploded: false,
};

type ExperienceAction =
  | { type: 'patch'; patch: Partial<ExperienceState> }
  | { type: 'reset'; nextState?: ExperienceState };

const experienceReducer = (state: ExperienceState, action: ExperienceAction): ExperienceState => {
  if (action.type === 'reset') {
    return action.nextState ?? INITIAL_STATE;
  }

  return {
    ...state,
    ...action.patch,
  };
};

const titleCase = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');

const stripExtension = (fileName: string) => fileName.replace(/\.[^.]+$/, '');

const deriveBrandName = (fileName: string) =>
  titleCase(stripExtension(fileName).replace(/[-_]+/g, ' '));

const waitForTransitionBeat = (delay = import.meta.env.MODE === 'test' ? 10 : 220) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, delay);
  });

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('We could not read that image.'));
        return;
      }

      resolve(reader.result);
    };

    reader.onerror = () => reject(new Error('We could not read that image.'));
    reader.readAsDataURL(file);
  });

const loadHtmlImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('The image could not be decoded.'));
    image.src = src;
  });

const extractImageData = async (previewUrl: string): Promise<ImageDataLike> => {
  const image = await loadHtmlImage(previewUrl);
  const maxDimension = 720;
  const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Your browser could not prepare an image canvas.');
  }

  canvas.width = width;
  canvas.height = height;
  context.clearRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);
  const extracted = context.getImageData(0, 0, width, height);

  return {
    width: extracted.width,
    height: extracted.height,
    data: extracted.data,
  };
};

const loadSourceAsset = async (file: File): Promise<SourceAsset> => {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please upload a PNG, JPG, SVG, or another image file.');
  }

  const previewUrl = await fileToDataUrl(file);
  const input = normalizeConceptInput({
    kind: 'image',
    brandName: deriveBrandName(file.name),
    fileMeta: {
      fileName: file.name,
      mimeType: file.type,
    },
  });

  return {
    input,
    brandName: input.brandName,
    fileName: file.name,
    previewUrl,
    imageData: await extractImageData(previewUrl),
  };
};

const loadPromptAsset = async ({
  brandName,
  prompt,
}: {
  brandName: string;
  prompt: string;
}): Promise<SourceAsset> => {
  const response = await fetch('/api/concept', {
    body: JSON.stringify({
      brandName,
      prompt,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });
  const payload = (await response.json()) as {
    concept?: PromptConcept;
    error?: string;
  };

  if (!response.ok || !payload.concept) {
    throw new Error(payload.error ?? 'Prompt generation is unavailable right now.');
  }

  const input = normalizeConceptInput({
    kind: 'prompt',
    brandName: payload.concept.brandName || brandName,
    prompt,
    promptConcept: payload.concept,
  });
  const previewUrl = buildPromptConceptDataUrl(input);

  return {
    input,
    brandName: input.brandName,
    fileName: `${input.brandName.replace(/\s+/g, '-').toLowerCase()}.prompt.svg`,
    previewUrl,
    imageData: await extractImageData(previewUrl),
  };
};

const readPersistedSnapshot = (): PersistedFlagshipSnapshot | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(FLAGSHIP_SESSION_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as PersistedFlagshipSnapshot;

    if (!parsed?.session) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

const createInitialExperienceState = (): ExperienceState => {
  const restored = readPersistedSnapshot();
  const requestedPhase = resolvePhaseFromPath(window.location.pathname);

  if (!restored?.session) {
    return {
      ...INITIAL_STATE,
      phase: getGuardedPhase(requestedPhase, {
        session: null,
        sourceAsset: null,
      }),
    };
  }

  const nextState: ExperienceState = {
    ...INITIAL_STATE,
    activeInstructionStep: restored.activeInstructionStep,
    buildDirectionId: restored.buildDirectionId,
    instructionSync: restored.instructionSync,
    promptForm: restored.promptForm,
    rightsConfirmed: restored.rightsConfirmed,
    session: restored.session,
    studioAutoRotate: restored.studioAutoRotate,
    studioExploded: restored.studioExploded,
  };

  return {
    ...nextState,
    phase: getGuardedPhase(requestedPhase, {
      session: nextState.session,
      sourceAsset: nextState.sourceAsset,
    }),
  };
};

function App() {
  const [state, dispatch] = useReducer(experienceReducer, INITIAL_STATE, createInitialExperienceState);
  const [downloadingRevealClip, setDownloadingRevealClip] = useState(false);
  const heroCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const studioCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioPack: AudioPackId = 'original';

  const collectionPack = useMemo(
    () => buildCollectionPack({ revealMode: 'faithful', visualPresetId: 'primary-play' }),
    [],
  );
  const currentStageIndex = Math.max(
    0,
    GENERATION_STAGES.findIndex((stage) => stage.id === state.generationStageId),
  );
  const promptAvailabilityCopy =
    state.promptAvailable === null
      ? 'Checking description mode…'
      : state.promptAvailable
        ? 'Description mode is ready.'
        : 'Description mode is unavailable right now.';

  const commitPhase = useCallback((
    phase: ExperiencePhase,
    options?: {
      patch?: Partial<ExperienceState>;
      replace?: boolean;
    },
  ) => {
    const nextState = {
      ...state,
      ...(options?.patch ?? {}),
    };
    const guardedPhase = getGuardedPhase(phase, {
      session: nextState.session,
      sourceAsset: nextState.sourceAsset,
    });
    const nextPath = getPhasePath(guardedPhase);

    if (window.location.pathname !== nextPath) {
      window.history[options?.replace ? 'replaceState' : 'pushState']({}, '', nextPath);
    }

    dispatch({
      type: 'patch',
      patch: {
        ...(options?.patch ?? {}),
        error: options?.patch?.error ?? null,
        phase: guardedPhase,
      },
    });
  }, [state]);

  useEffect(() => {
    void fetch('/api/concept')
      .then(async (response) => {
        if (!response.ok) {
          dispatch({ type: 'patch', patch: { promptAvailable: false } });
          return;
        }

        const payload = (await response.json()) as { available?: boolean };
        dispatch({ type: 'patch', patch: { promptAvailable: Boolean(payload.available) } });
      })
      .catch(() => {
        dispatch({ type: 'patch', patch: { promptAvailable: false } });
      });
  }, []);

  useEffect(() => {
    const syncFromLocation = () => {
      const requestedPhase = resolvePhaseFromPath(window.location.pathname);
      const guardedPhase = getGuardedPhase(requestedPhase, {
        session: state.session,
        sourceAsset: state.sourceAsset,
      });
      const guardedPath = getPhasePath(guardedPhase);

      if (window.location.pathname !== guardedPath) {
        window.history.replaceState({}, '', guardedPath);
      }

      dispatch({
        type: 'patch',
        patch: {
          error: null,
          phase: guardedPhase,
        },
      });
    };

    window.addEventListener('popstate', syncFromLocation);

    return () => {
      window.removeEventListener('popstate', syncFromLocation);
    };
  }, [state.session, state.sourceAsset]);

  useEffect(() => {
    const expectedPath = getPhasePath(getGuardedPhase(state.phase, {
      session: state.session,
      sourceAsset: state.sourceAsset,
    }));

    if (window.location.pathname !== expectedPath) {
      window.history.replaceState({}, '', expectedPath);
    }
  }, [state.phase, state.session, state.sourceAsset]);

  useEffect(() => {
    if (state.phase !== 'studio' || !state.session) {
      return;
    }

    const lastStepIndex = Math.max(0, state.session.scenePack.instructions.steps.length - 1);

    if (state.activeInstructionStep !== lastStepIndex || !state.studioAutoRotate) {
      dispatch({
        type: 'patch',
        patch: {
          activeInstructionStep: lastStepIndex,
          studioAutoRotate: true,
        },
      });
    }
  }, [state.activeInstructionStep, state.phase, state.session, state.studioAutoRotate]);

  useEffect(() => {
    if (!state.session) {
      window.localStorage.removeItem(FLAGSHIP_SESSION_STORAGE_KEY);
      return;
    }

    const persisted: PersistedFlagshipSnapshot = {
      activeInstructionStep: state.activeInstructionStep,
      buildDirectionId: state.buildDirectionId,
      instructionSync: state.instructionSync,
      promptForm: state.promptForm,
      rightsConfirmed: state.rightsConfirmed,
      route: getPhasePath(state.phase),
      session: {
        ...state.session,
        sourceAsset: null,
      },
      studioAutoRotate: state.studioAutoRotate,
      studioExploded: state.studioExploded,
    };

    window.localStorage.setItem(FLAGSHIP_SESSION_STORAGE_KEY, JSON.stringify(persisted));
  }, [
    state.activeInstructionStep,
    state.buildDirectionId,
    state.instructionSync,
    state.phase,
    state.promptForm,
    state.rightsConfirmed,
    state.session,
    state.studioAutoRotate,
    state.studioExploded,
  ]);

  const setPhase = useCallback((phase: ExperiencePhase) => {
    commitPhase(phase);
  }, [commitPhase]);

  const openInput = useCallback(() => {
    commitPhase('input', {
      patch: {
        activeInstructionStep: 0,
        buildDirectionId: 'signature-mosaic',
        generationStageId: null,
        inputMode: 'image',
        inputPending: false,
        promptForm: INITIAL_STATE.promptForm,
        rightsConfirmed: false,
        session: null,
        sourceAsset: null,
        studioAutoRotate: false,
        studioExploded: false,
      },
    });
  }, [commitPhase]);

  const setInputMode = useCallback((mode: ExperienceState['inputMode']) => {
    dispatch({
      type: 'patch',
      patch: {
        error: null,
        inputMode: mode,
      },
    });
  }, []);

  const setPromptField = useCallback((field: 'brandName' | 'prompt', value: string) => {
    dispatch({
      type: 'patch',
      patch: {
        promptForm: {
          ...state.promptForm,
          [field]: value,
        },
      },
    });
  }, [state.promptForm]);

  const setRightsConfirmed = useCallback((next: boolean) => {
    dispatch({ type: 'patch', patch: { rightsConfirmed: next } });
  }, []);

  const setActiveInstructionStep = useCallback((step: number) => {
    const maxStep = Math.max(0, (state.session?.scenePack.instructions.steps.length ?? 1) - 1);
    dispatch({
      type: 'patch',
      patch: {
        activeInstructionStep: Math.max(0, Math.min(step, maxStep)),
      },
    });
  }, [state.session]);

  const setStudioAutoRotate = useCallback((next: boolean) => {
    dispatch({ type: 'patch', patch: { studioAutoRotate: next } });
  }, []);

  const setStudioExploded = useCallback((next: boolean) => {
    dispatch({ type: 'patch', patch: { studioExploded: next } });
  }, []);

  const setInstructionSync = useCallback((next: boolean) => {
    dispatch({ type: 'patch', patch: { instructionSync: next } });
  }, []);

  const selectBuildDirection = useCallback((buildDirectionId: ExperienceState['buildDirectionId']) => {
    dispatch({ type: 'patch', patch: { buildDirectionId } });
  }, []);

  const handleImageFile = useCallback(async (file: File | null) => {
    if (!file) {
      return;
    }

    dispatch({ type: 'patch', patch: { error: null, inputPending: true } });

    try {
      const sourceAsset = await loadSourceAsset(file);

      dispatch({
        type: 'patch',
        patch: {
          sourceAsset,
        },
      });
    } catch (error) {
      dispatch({
        type: 'patch',
        patch: {
          error: error instanceof Error ? error.message : 'We could not load that image.',
        },
      });
    } finally {
      dispatch({ type: 'patch', patch: { inputPending: false } });
    }
  }, []);

  const continueFromInput = useCallback(async () => {
    dispatch({ type: 'patch', patch: { error: null } });

    if (!state.rightsConfirmed) {
      dispatch({
        type: 'patch',
        patch: { error: 'Confirm you have permission to use the artwork or description first.' },
      });
      return;
    }

    if (state.inputMode === 'image') {
      if (!state.sourceAsset) {
        dispatch({ type: 'patch', patch: { error: 'Upload artwork before continuing.' } });
        return;
      }

      commitPhase('creative');
      return;
    }

    if (!state.promptForm.prompt.trim()) {
      dispatch({ type: 'patch', patch: { error: 'Describe what you want to build first.' } });
      return;
    }

    dispatch({ type: 'patch', patch: { inputPending: true } });

    try {
      const sourceAsset = await loadPromptAsset({
        brandName: state.promptForm.brandName.trim() || 'Custom Blocks',
        prompt: state.promptForm.prompt.trim(),
      });

      commitPhase('creative', {
        patch: {
          inputPending: false,
          sourceAsset,
        },
      });
    } catch (error) {
      dispatch({
        type: 'patch',
        patch: {
          error: error instanceof Error ? error.message : 'We could not prepare that prompt.',
          inputPending: false,
        },
      });
    }
  }, [commitPhase, state.inputMode, state.promptForm, state.rightsConfirmed, state.sourceAsset]);

  const openExample = useCallback((sku: string) => {
    const item = collectionPack.sets.find((candidate) => candidate.spec.sku === sku) ?? collectionPack.sets[0];

    if (!item) {
      return;
    }

    const session: ExperienceSession = {
      buildDirectionId: 'signature-mosaic',
      flagshipPack: getFlagshipGrammarPack(item.scenePack),
      instructionArtifactHtml: buildInstructionArtifactHtml(item.scenePack),
      origin: 'example',
      realSetBuild: item.realSet,
      scenePack: item.scenePack,
      sourceAsset: null,
    };

    commitPhase('reveal', {
      patch: {
        activeInstructionStep: 0,
        buildDirectionId: 'signature-mosaic',
        inputPending: false,
        instructionSync: true,
        session,
        sourceAsset: null,
        studioAutoRotate: false,
        studioExploded: false,
      },
    });
  }, [collectionPack.sets, commitPhase]);

  const runGeneration = useCallback(async () => {
    if (!state.sourceAsset) {
      dispatch({ type: 'patch', patch: { error: 'Pick a source before building the set.' } });
      return;
    }

    const sourceAsset = state.sourceAsset;
    const buildDirection = getBuildDirectionConfig(state.buildDirectionId);

    commitPhase('generation', {
      patch: {
        activeInstructionStep: 0,
        generationStageId: 'source-loaded',
        session: null,
        studioAutoRotate: false,
        studioExploded: false,
      },
    });

    try {
      await waitForTransitionBeat();

      const build = buildBlockBuildFromImageData(sourceAsset.imageData, {
        columns: buildDirection.columns,
      });
      dispatch({ type: 'patch', patch: { generationStageId: 'block-build-ready' } });

      await waitForTransitionBeat();

      const realSetBuild = buildRealSet({
        brandName: sourceAsset.brandName,
        build,
        input: sourceAsset.input,
      });
      dispatch({ type: 'patch', patch: { generationStageId: 'real-set-ready' } });

      await waitForTransitionBeat();

      const scenePack = buildScenePack({
        brandName: sourceAsset.brandName,
        build,
        fileName: sourceAsset.fileName,
        input: sourceAsset.input,
        realSet: realSetBuild,
        revealMode: buildDirection.revealMode,
        visualPresetId: buildDirection.visualPresetId,
      });
      dispatch({ type: 'patch', patch: { generationStageId: 'scene-pack-ready' } });

      await waitForTransitionBeat();

      const instructionArtifactHtml = buildInstructionArtifactHtml(scenePack);
      const session: ExperienceSession = {
        buildDirectionId: buildDirection.id,
        flagshipPack: getFlagshipGrammarPack(scenePack),
        instructionArtifactHtml,
        origin: 'custom',
        realSetBuild,
        scenePack,
        sourceAsset,
      };
      dispatch({ type: 'patch', patch: { generationStageId: 'artifacts-ready' } });

      await waitForTransitionBeat(180);

      commitPhase('reveal', {
        patch: {
          activeInstructionStep: 0,
          generationStageId: null,
          instructionSync: true,
          session,
        },
      });
    } catch (error) {
      commitPhase('creative', {
        patch: {
          error: error instanceof Error ? error.message : 'We could not build that set.',
          generationStageId: null,
        },
        replace: true,
      });
    }
  }, [commitPhase, state.buildDirectionId, state.sourceAsset]);

  const resetExperience = useCallback(() => {
    window.localStorage.removeItem(FLAGSHIP_SESSION_STORAGE_KEY);
    window.history.pushState({}, '', getPhasePath('landing'));
    dispatch({ type: 'reset', nextState: INITIAL_STATE });
  }, []);

  const downloadBlob = useCallback((blob: Blob, fileName: string) => {
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = fileName;
    link.href = objectUrl;
    link.click();
    URL.revokeObjectURL(objectUrl);
  }, []);

  const downloadStill = useCallback(() => {
    if (!heroCanvasRef.current || !state.session) {
      return;
    }

    const stillFileName = state.session.scenePack.exports.stillFileName;

    heroCanvasRef.current.toBlob((blob) => {
      if (!blob) {
        return;
      }

      downloadBlob(blob, stillFileName);
    });
  }, [downloadBlob, state.session]);

  const downloadBuilderStill = useCallback(() => {
    if (!studioCanvasRef.current || !state.session) {
      return;
    }

    const builderStillFileName = state.session.scenePack.exports.builderStillFileName;

    studioCanvasRef.current.toBlob((blob) => {
      if (!blob) {
        return;
      }

      downloadBlob(blob, builderStillFileName);
    });
  }, [downloadBlob, state.session]);

  const downloadPosterFrame = useCallback(() => {
    if (!state.session) {
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = state.session.scenePack.visual.canvasSize.width;
    canvas.height = state.session.scenePack.visual.canvasSize.height;
    const scenePack = state.session.scenePack;

    drawHeroCanvas(canvas, scenePack, { variant: 'poster' });
    canvas.toBlob((blob) => {
      if (!blob) {
        return;
      }

      downloadBlob(blob, scenePack.exports.posterFrameFileName ?? 'poster-frame.png');
    });
  }, [downloadBlob, state.session]);

  const downloadSceneJson = useCallback(() => {
    if (!state.session) {
      return;
    }

    const blob = new Blob([JSON.stringify(state.session.scenePack, null, 2)], {
      type: 'application/json',
    });
    downloadBlob(blob, state.session.scenePack.exports.sceneFileName);
  }, [downloadBlob, state.session]);

  const downloadInstructionsArtifact = useCallback(() => {
    if (!state.session) {
      return;
    }

    const blob = new Blob([state.session.instructionArtifactHtml], {
      type: 'text/html;charset=utf-8',
    });
    downloadBlob(blob, state.session.scenePack.exports.instructionsFileName);
  }, [downloadBlob, state.session]);

  const downloadInstructionsData = useCallback(() => {
    if (!state.session) {
      return;
    }

    const blob = new Blob([JSON.stringify(state.session.scenePack.instructions, null, 2)], {
      type: 'application/json',
    });
    downloadBlob(blob, state.session.scenePack.exports.instructionsDataFileName);
  }, [downloadBlob, state.session]);

  const downloadPartManifest = useCallback(() => {
    if (!state.session) {
      return;
    }

    const manifest = summarizeBricklinkSourcing(state.session.scenePack.model.partManifest);
    const blob = new Blob([JSON.stringify(manifest, null, 2)], {
      type: 'application/json',
    });
    downloadBlob(blob, state.session.scenePack.exports.manifestFileName);
  }, [downloadBlob, state.session]);

  const downloadValidationReport = useCallback(() => {
    if (!state.session) {
      return;
    }

    const blob = new Blob([JSON.stringify(state.session.scenePack.model.validation, null, 2)], {
      type: 'application/json',
    });
    downloadBlob(blob, state.session.scenePack.exports.validationFileName);
  }, [downloadBlob, state.session]);

  const studioHandoffBundle = useMemo(
    () =>
      state.session
        ? buildStudioHandoffBundle({
            instructionsHtmlFileName: state.session.scenePack.exports.instructionsFileName,
            realSetBuild: state.session.realSetBuild,
            scenePack: state.session.scenePack,
          })
        : null,
    [state.session],
  );

  const downloadMpd = useCallback(() => {
    if (!state.session) {
      return;
    }

    downloadBlob(
      createMpdBlob(state.session.realSetBuild.exportBundle),
      state.session.realSetBuild.exportBundle.mpdFileName,
    );
  }, [downloadBlob, state.session]);

  const downloadLdr = useCallback(() => {
    if (!state.session) {
      return;
    }

    const fileName =
      state.session.realSetBuild.exportBundle.ioEntryNames?.find((entry) => entry.endsWith('.ldr'))
      ?? state.session.realSetBuild.exportBundle.mpdFileName.replace(/\.mpd$/i, '.ldr');
    const ldrawSource = state.session.realSetBuild.exportBundle.mpdText;

    if (!ldrawSource) {
      return;
    }

    downloadBlob(
      new Blob([ldrawSource], {
        type: 'text/plain;charset=utf-8',
      }),
      fileName,
    );
  }, [downloadBlob, state.session]);

  const downloadIo = useCallback(() => {
    if (!state.session) {
      return;
    }

    downloadBlob(
      createIoBlob(state.session.realSetBuild.exportBundle),
      state.session.realSetBuild.exportBundle.ioFileName,
    );
  }, [downloadBlob, state.session]);

  const downloadHandoffJson = useCallback(() => {
    if (!state.session) {
      return;
    }

    const manifest = summarizeBricklinkSourcing(state.session.scenePack.model.partManifest);
    const blob = new Blob([JSON.stringify({
      audioPack,
      audioPackBasePath: getAudioPackBasePath(audioPack),
      filmFile: state.session.scenePack.exports.filmFileName,
      handoffFile: state.session.scenePack.exports.handoffFileName,
      instructionArtifactFile: state.session.scenePack.exports.instructionsFileName,
      instructionDataFile: state.session.scenePack.exports.instructionsDataFileName,
      ioFile: state.session.realSetBuild.exportBundle.ioFileName,
      manifestFile: state.session.scenePack.exports.manifestFileName,
      mappedPartCoverage: manifest.mappedPartCoverage,
      mpdFile: state.session.realSetBuild.exportBundle.mpdFileName,
      sacredLine: state.session.scenePack.copy.sacredLine,
      sceneFile: state.session.scenePack.exports.sceneFileName,
      stillFile: state.session.scenePack.exports.stillFileName,
      storyArcs: state.session.scenePack.storyArcs,
      studioStillFile: state.session.scenePack.exports.builderStillFileName,
      unavailablePartColorCount: manifest.unavailablePartColorCount,
      validation: state.session.realSetBuild.validation,
    }, null, 2)], {
      type: 'application/json',
    });

    downloadBlob(blob, state.session.scenePack.exports.handoffFileName);
  }, [audioPack, downloadBlob, state.session]);

  const downloadStudioValidationReport = useCallback(() => {
    if (!state.session || !studioHandoffBundle) {
      return;
    }

    const markdown = buildStudioValidationReport(studioHandoffBundle);
    const fileName = state.session.scenePack.exports.validationFileName.replace(/\.json$/i, '.md');

    downloadBlob(
      new Blob([markdown], {
        type: 'text/markdown;charset=utf-8',
      }),
      fileName,
    );
  }, [downloadBlob, state.session, studioHandoffBundle]);

  const downloadRevealClip = useCallback(async () => {
    if (!state.session) {
      return;
    }

    setDownloadingRevealClip(true);

    try {
      const blob = await recordRevealClip(state.session.scenePack);
      const extension = getRevealClipFileExtension(blob.type);
      const revealFileName = /\.[a-z0-9]+$/i.test(state.session.scenePack.exports.filmFileName)
        ? state.session.scenePack.exports.filmFileName.replace(/\.[a-z0-9]+$/i, `.${extension}`)
        : `${state.session.scenePack.exports.filmFileName}.${extension}`;

      downloadBlob(blob, revealFileName);
    } catch (error) {
      dispatch({
        type: 'patch',
        patch: {
          error: error instanceof Error ? error.message : 'The reveal clip could not be exported.',
        },
      });
    } finally {
      setDownloadingRevealClip(false);
    }
  }, [downloadBlob, state.session]);

  const experienceValue = useMemo(
    () => ({
      buildDirections: BUILD_DIRECTIONS,
      collectionPack,
      continueFromInput,
      currentStageIndex,
      downloadBuilderStill,
      downloadHandoffJson,
      downloadInstructionsArtifact,
      downloadInstructionsData,
      downloadIo,
      downloadLdr,
      downloadMpd,
      downloadPartManifest,
      downloadPosterFrame,
      downloadRevealClip,
      downloadSceneJson,
      downloadStill,
      downloadStudioValidationReport,
      downloadValidationReport,
      downloadingRevealClip,
      generationStages: GENERATION_STAGES,
      handleImageFile,
      openExample,
      openInput,
      promptAvailabilityCopy,
      resetExperience,
      runGeneration,
      selectBuildDirection,
      setActiveInstructionStep,
      setInputMode,
      setInstructionSync,
      setPhase,
      setPromptField,
      setRightsConfirmed,
      setStudioAutoRotate,
      setStudioExploded,
      state,
      studioHandoffBundle,
    }),
    [
      collectionPack,
      continueFromInput,
      currentStageIndex,
      downloadBuilderStill,
      downloadHandoffJson,
      downloadInstructionsArtifact,
      downloadInstructionsData,
      downloadIo,
      downloadLdr,
      downloadMpd,
      downloadPartManifest,
      downloadPosterFrame,
      downloadRevealClip,
      downloadSceneJson,
      downloadStill,
      downloadStudioValidationReport,
      downloadValidationReport,
      downloadingRevealClip,
      handleImageFile,
      openExample,
      openInput,
      promptAvailabilityCopy,
      resetExperience,
      runGeneration,
      selectBuildDirection,
      setActiveInstructionStep,
      setInputMode,
      setInstructionSync,
      setPhase,
      setPromptField,
      setRightsConfirmed,
      setStudioAutoRotate,
      setStudioExploded,
      state,
      studioHandoffBundle,
    ],
  );

  return (
    <ExperienceProvider value={experienceValue}>
      {state.phase === 'landing' ? <LandingPhase /> : null}
      {state.phase === 'input' ? <InputPhase /> : null}
      {state.phase === 'creative' ? <CreativePhase /> : null}
      {state.phase === 'generation' ? <GenerationPhase /> : null}
      {state.phase === 'reveal' ? <RevealPhase heroCanvasRef={heroCanvasRef} /> : null}
      {state.phase === 'studio' ? <StudioPhase studioCanvasRef={studioCanvasRef} /> : null}
      {state.phase === 'instructions' ? <InstructionsPhase /> : null}
      {state.phase === 'keepsakes' ? <KeepsakesPhase /> : null}
    </ExperienceProvider>
  );
}

export default App;
