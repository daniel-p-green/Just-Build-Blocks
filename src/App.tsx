import {
  Suspense,
  lazy,
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ChangeEvent, FormEvent } from 'react';

import './App.css';
import { buildBlockBuildFromImageData, type ImageDataLike } from './lib/block-engine';
import { CollectionShelf } from './components/CollectionShelf';
import { InputOnboardingShowcase } from './components/InputOnboardingShowcase';
import { LoadingInterstitial } from './components/LoadingInterstitial';
import { RightsConfirmationModal } from './components/RightsConfirmationModal';
import {
  SIGNATURE_COLLECTION_SPEC,
  buildCollectionPack,
} from './lib/collection-pack';
import {
  buildPromptConceptDataUrl,
  normalizeConceptInput,
  type ConceptInput,
  type PromptConcept,
} from './lib/concept-input';
import type { RevealMode } from './lib/experience-plan';
import { drawHeroCanvas } from './lib/hero-renderer';
import { INPUT_GUIDE_EXAMPLES } from './lib/input-guidance';
import { buildInstructionArtifactHtml } from './lib/instruction-artifact';
import {
  AUDIO_PACK_OPTIONS,
  getAudioPackBasePath,
  resolveBrowserCueAudioPath,
  type AudioCueId,
  type AudioPackId,
} from './lib/audio-pack';
import {
  getRevealClipFileExtension,
  REVEAL_DURATION_MS,
  recordRevealClip,
} from './lib/reveal-renderer';
import {
  VISUAL_PRESETS,
  buildScenePack,
  type ScenePack,
} from './lib/scene-pack';
import {
  buildRealSet,
  createIoBlob,
  createMpdBlob,
  summarizeBricklinkSourcing,
  type RealSetBuild,
} from './lib/set-engine';

const BuilderStudio3D = lazy(async () => {
  const module = await import('./components/BuilderStudio3D');
  return { default: module.BuilderStudio3D };
});

type WizardStep = 'collection' | 'input' | 'box' | 'studio' | 'instructions' | 'keep';
type ExperienceMode = 'collection' | 'commission';

type SourceAsset = {
  input: ConceptInput;
  brandName: string;
  fileName: string;
  previewUrl: string;
  imageData: ImageDataLike;
};

type PendingStartAction = 'file-picker' | 'prompt-submit';

type DensityPreset = {
  id: 'chunky' | 'balanced' | 'detailed';
  label: string;
  description: string;
  columns: number;
};

const WIZARD_STEPS: Array<{ id: WizardStep; label: string; eyebrow: string }> = [
  { id: 'input', label: 'Input', eyebrow: '01' },
  { id: 'box', label: 'Set box', eyebrow: '02' },
  { id: 'studio', label: 'Studio', eyebrow: '03' },
  { id: 'instructions', label: 'Instructions', eyebrow: '04' },
  { id: 'keep', label: 'Keep', eyebrow: '05' },
];

const DENSITY_PRESETS: DensityPreset[] = [
  { id: 'chunky', label: 'Chunky', description: 'Big block silhouette and fast read.', columns: 24 },
  { id: 'balanced', label: 'Balanced', description: 'Best overall set-box density.', columns: 36 },
  { id: 'detailed', label: 'Detailed', description: 'Sharper edges and finer tray rhythm.', columns: 48 },
];

const REVEAL_AUDIO_SCHEDULE = [
  { cue: 'upload', at: 0, volume: 0.2 },
  { cue: 'quantize', at: 850, volume: 0.18 },
  { cue: 'build', at: 1600, volume: 0.26 },
  { cue: 'heroReveal', at: 3400, volume: 0.34 },
  { cue: 'sacredLine', at: 4700, volume: 0.42 },
  { cue: 'montage', at: 6700, volume: 0.18 },
  { cue: 'resolve', at: 9300, volume: 0.18 },
] as const;

const stripExtension = (fileName: string) => fileName.replace(/\.[^.]+$/, '');

const titleCase = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');

const deriveBrandName = (fileName: string) =>
  titleCase(stripExtension(fileName).replace(/[-_]+/g, ' '));

const buildCatalogReferenceLinks = (partManifest: ScenePack['model']['partManifest']) => {
  const seenPartIds = new Set<string>();

  return partManifest.filter((item) => {
    if (!item.bricklinkCatalogUrl || seenPartIds.has(item.partId)) {
      return false;
    }

    seenPartIds.add(item.partId);
    return true;
  }).slice(0, 4);
};

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
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      brandName,
      prompt,
    }),
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

const canVisitStep = (step: WizardStep, _sourceAsset: SourceAsset | null, scenePack: ScenePack | null) => {
  if (step === 'collection') {
    return true;
  }

  if (step === 'input') {
    return true;
  }

  if (!scenePack) {
    return false;
  }

  return true;
};

function App() {
  const heroCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const studioCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const revealAnimationFrameRef = useRef<number | null>(null);
  const revealAudioTimerRef = useRef<number[]>([]);
  const [currentStep, setCurrentStep] = useState<WizardStep>('collection');
  const [experienceMode, setExperienceMode] = useState<ExperienceMode>('collection');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [sourceAsset, setSourceAsset] = useState<SourceAsset | null>(null);
  const [scenePack, setScenePack] = useState<ScenePack | null>(null);
  const [realSetBuild, setRealSetBuild] = useState<RealSetBuild | null>(null);
  const [visualPresetId] = useState<'primary-play' | 'build-table' | 'night-shift'>('primary-play');
  const [densityColumns, setDensityColumns] = useState<number>(36);
  const [revealMode, setRevealMode] = useState<RevealMode>('faithful');
  const [revealPlaying, setRevealPlaying] = useState(false);
  const [downloadingRevealClip, setDownloadingRevealClip] = useState(false);
  const [activeInstructionStep, setActiveInstructionStep] = useState(0);
  const [studioExploded, setStudioExploded] = useState(false);
  const [instructionSync, setInstructionSync] = useState(true);
  const [studioAutoRotate, setStudioAutoRotate] = useState(false);
  const [rightsAccepted, setRightsAccepted] = useState(false);
  const [rightsModalOpen, setRightsModalOpen] = useState(false);
  const [rightsAcknowledged, setRightsAcknowledged] = useState(false);
  const [pendingStartAction, setPendingStartAction] = useState<PendingStartAction | null>(null);
  const [studioGuideDismissed, setStudioGuideDismissed] = useState(false);
  const [activeGuideIndex, setActiveGuideIndex] = useState(0);
  const [loadingKind, setLoadingKind] = useState<'image' | 'prompt' | null>(null);
  const [audioPack, setAudioPack] = useState<AudioPackId>('original');
  const [promptForm, setPromptForm] = useState({
    brandName: '',
    prompt: '',
  });
  const [promptAvailable, setPromptAvailable] = useState<boolean | null>(null);
  const deferredColumns = useDeferredValue(densityColumns);
  const [selectedCollectionSku, setSelectedCollectionSku] = useState(
    SIGNATURE_COLLECTION_SPEC.featuredSku,
  );

  const activeVisualPreset = VISUAL_PRESETS.find((preset) => preset.id === visualPresetId) ?? VISUAL_PRESETS[0]!;
  const activeDensityPreset =
    DENSITY_PRESETS.find((preset) => preset.columns === densityColumns) ?? DENSITY_PRESETS[1]!;
  const activeAudioPack = AUDIO_PACK_OPTIONS.find((option) => option.id === audioPack) ?? AUDIO_PACK_OPTIONS[0]!;
  const collectionPack = useMemo(() => buildCollectionPack({
    revealMode,
    visualPresetId,
  }), [revealMode, visualPresetId]);
  const activeCollectionItem =
    collectionPack.sets.find((item) => item.spec.sku === selectedCollectionSku) ??
    collectionPack.sets[0] ??
    null;
  const currentScenePack =
    experienceMode === 'collection' && currentStep !== 'collection'
      ? activeCollectionItem?.scenePack ?? null
      : scenePack;
  const currentRealSetBuild =
    experienceMode === 'collection' && currentStep !== 'collection'
      ? activeCollectionItem?.realSet ?? null
      : realSetBuild;

  const cycleGuideIndex = useCallback((direction: 1 | -1) => {
    setActiveGuideIndex((current) => {
      const next = current + direction;

      if (next < 0) {
        return INPUT_GUIDE_EXAMPLES.length - 1;
      }

      if (next >= INPUT_GUIDE_EXAMPLES.length) {
        return 0;
      }

      return next;
    });
  }, []);

  const clearRevealPlayback = useCallback(() => {
    if (revealAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(revealAnimationFrameRef.current);
      revealAnimationFrameRef.current = null;
    }

    revealAudioTimerRef.current.forEach((timer) => window.clearTimeout(timer));
    revealAudioTimerRef.current = [];
    setRevealPlaying(false);
  }, []);

  const queueRightsGate = useCallback((action: PendingStartAction) => {
    setPendingStartAction(action);
    setRightsAcknowledged(false);
    setRightsModalOpen(true);
  }, []);

  const rebuildScenePack = useCallback((asset: SourceAsset, columns: number) => {
    const build = buildBlockBuildFromImageData(asset.imageData, { columns });
    const nextRealSet = buildRealSet({
      brandName: asset.brandName,
      build,
      input: asset.input,
    });
    const nextScenePack = buildScenePack({
      input: asset.input,
      brandName: asset.brandName,
      fileName: asset.fileName,
      build,
      realSet: nextRealSet,
      revealMode,
      visualPresetId,
    });

    startTransition(() => {
      setRealSetBuild(nextRealSet);
      setScenePack(nextScenePack);
      setStatus('ready');
      setError(null);
    });
  }, [revealMode, visualPresetId]);

  const startPromptBuild = useCallback(async () => {
    if (!promptForm.prompt.trim()) {
      setError('Describe what you want to build first.');
      return;
    }

    clearRevealPlayback();
    setExperienceMode('commission');
    setStatus('loading');
    setLoadingKind('prompt');
    setError(null);
    setCurrentStep('input');
    setSourceAsset(null);
    setScenePack(null);
    setRealSetBuild(null);

    try {
      const asset = await loadPromptAsset({
        brandName: promptForm.brandName.trim() || 'Custom Blocks',
        prompt: promptForm.prompt,
      });
      setSourceAsset(asset);
      setActiveInstructionStep(0);
      setPromptForm((current) => ({
        ...current,
        brandName: asset.brandName,
      }));
      setCurrentStep('box');
    } catch (promptError) {
      setStatus('error');
      setError(promptError instanceof Error ? promptError.message : 'We could not build that prompt yet.');
    }
  }, [clearRevealPlayback, promptForm]);

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const resumePendingStartAction = useCallback(() => {
    if (pendingStartAction === 'file-picker') {
      openFilePicker();
    }

    if (pendingStartAction === 'prompt-submit') {
      void startPromptBuild();
    }

    setPendingStartAction(null);
  }, [openFilePicker, pendingStartAction, startPromptBuild]);

  const handleRightsContinue = useCallback(() => {
    setRightsAccepted(true);
    setRightsModalOpen(false);
    setRightsAcknowledged(false);
    resumePendingStartAction();
  }, [resumePendingStartAction]);

  const handleRightsCancel = useCallback(() => {
    setRightsModalOpen(false);
    setRightsAcknowledged(false);
    setPendingStartAction(null);
  }, []);

  const paintHero = useCallback((pack: ScenePack, variant: 'hero' | 'poster' = 'hero') => {
    const canvas = heroCanvasRef.current;

    if (!canvas) {
      return;
    }

    const render = () => drawHeroCanvas(canvas, pack, { variant });
    const fontReady = document.fonts?.ready;

    if (fontReady) {
      void fontReady.then(render);
      return;
    }

    render();
  }, []);

  const scheduleAudioCue = useCallback((cue: AudioCueId, delayMs: number, volume: number) => {
    const timer = window.setTimeout(() => {
      const audio = new Audio(resolveBrowserCueAudioPath(cue, audioPack));
      audio.volume = volume;
      void audio.play().catch(() => undefined);
    }, delayMs);

    revealAudioTimerRef.current.push(timer);
  }, [audioPack]);

  const playReveal = useCallback((pack: ScenePack) => {
    clearRevealPlayback();
    setRevealPlaying(true);
    setCurrentStep('studio');
    setInstructionSync(true);
    setActiveInstructionStep(0);

    REVEAL_AUDIO_SCHEDULE.forEach((item) => {
      scheduleAudioCue(pack.audio.cueIds[item.cue], item.at, item.volume);
    });

    const start = performance.now();
    const finalStepIndex = Math.max(0, pack.instructions.steps.length - 1);
    let lastStepIndex = -1;

    const animate = (now: number) => {
      const progress = Math.min(1, (now - start) / REVEAL_DURATION_MS);
      const nextStepIndex = Math.min(
        finalStepIndex,
        Math.floor(progress * (finalStepIndex + 1)),
      );

      if (nextStepIndex !== lastStepIndex) {
        lastStepIndex = nextStepIndex;
        setActiveInstructionStep(nextStepIndex);
      }

      if (progress < 1) {
        revealAnimationFrameRef.current = window.requestAnimationFrame(animate);
        return;
      }

      revealAnimationFrameRef.current = null;
      setActiveInstructionStep(finalStepIndex);
      setRevealPlaying(false);
    };

    revealAnimationFrameRef.current = window.requestAnimationFrame(animate);
  }, [clearRevealPlayback, scheduleAudioCue]);

  useEffect(() => {
    return () => {
      clearRevealPlayback();
    };
  }, [clearRevealPlayback]);

  useEffect(() => {
    void fetch('/api/concept')
      .then(async (response) => {
        if (!response.ok) {
          setPromptAvailable(false);
          return;
        }

        const payload = (await response.json()) as { available?: boolean };
        setPromptAvailable(Boolean(payload.available));
      })
      .catch(() => {
        setPromptAvailable(false);
      });
  }, []);

  useEffect(() => {
    if (!sourceAsset) {
      return;
    }

    rebuildScenePack(sourceAsset, deferredColumns);
  }, [deferredColumns, rebuildScenePack, revealMode, sourceAsset, visualPresetId]);

  useEffect(() => {
    if (!currentScenePack) {
      return;
    }

    paintHero(currentScenePack);
  }, [currentScenePack, paintHero]);

  useEffect(() => {
    if (status !== 'loading') {
      setLoadingKind(null);
    }
  }, [status]);

  const handleUploadButtonClick = () => {
    if (!rightsAccepted) {
      queueRightsGate('file-picker');
      return;
    }

    openFilePicker();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    clearRevealPlayback();
    setExperienceMode('commission');
    setStatus('loading');
    setLoadingKind('image');
    setError(null);
    setCurrentStep('input');
    setSourceAsset(null);
    setScenePack(null);
    setRealSetBuild(null);

    try {
      const asset = await loadSourceAsset(file);
      setSourceAsset(asset);
      setActiveInstructionStep(0);
      setCurrentStep('box');
    } catch (uploadError) {
      setStatus('error');
      setError(uploadError instanceof Error ? uploadError.message : 'We could not load that image.');
    }
  };

  const handlePromptSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!rightsAccepted) {
      queueRightsGate('prompt-submit');
      return;
    }

    await startPromptBuild();
  };

  const openCollectionSet = (sku: string) => {
    clearRevealPlayback();
    setExperienceMode('collection');
    setSelectedCollectionSku(sku);
    setCurrentStep('box');
    setStatus('ready');
    setError(null);
    setActiveInstructionStep(0);
    setStudioExploded(false);
    setInstructionSync(true);
    setStudioAutoRotate(false);
  };

  const openCommissionFlow = () => {
    clearRevealPlayback();
    setExperienceMode('commission');
    setCurrentStep('input');
    setStatus('idle');
    setError(null);
    setSourceAsset(null);
    setScenePack(null);
    setRealSetBuild(null);
    setActiveInstructionStep(0);
    setStudioExploded(false);
    setInstructionSync(true);
    setStudioAutoRotate(false);
  };

  const resetBuild = () => {
    clearRevealPlayback();
    setCurrentStep('collection');
    setExperienceMode('collection');
    setStatus('idle');
    setError(null);
    setSourceAsset(null);
    setScenePack(null);
    setRealSetBuild(null);
    setPromptForm({
      brandName: '',
      prompt: '',
    });
    setDensityColumns(36);
    setRevealMode('faithful');
    setActiveInstructionStep(0);
    setStudioExploded(false);
    setInstructionSync(true);
    setStudioAutoRotate(false);
    setRightsAccepted(false);
    setRightsModalOpen(false);
    setRightsAcknowledged(false);
    setPendingStartAction(null);
    setActiveGuideIndex(0);
    setLoadingKind(null);
    setAudioPack('original');
  };

  const moveToNextStep = () => {
    if (!currentScenePack) {
      return;
    }

    if (currentStep === 'collection' || currentStep === 'input') {
      setCurrentStep('box');
      return;
    }

    if (currentStep === 'box') {
      setCurrentStep('studio');
      return;
    }

    if (currentStep === 'studio') {
      setCurrentStep('instructions');
      return;
    }

    if (currentStep === 'instructions') {
      setCurrentStep('keep');
    }
  };

  const moveToPreviousStep = () => {
    if (currentStep === 'keep') {
      setCurrentStep('instructions');
      return;
    }

    if (currentStep === 'instructions') {
      setCurrentStep('studio');
      return;
    }

    if (currentStep === 'studio') {
      setCurrentStep('box');
      return;
    }

    if (currentStep === 'box') {
      setCurrentStep(experienceMode === 'collection' ? 'collection' : 'input');
    }
  };

  const downloadBlob = (blob: Blob, fileName: string) => {
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(objectUrl);
  };

  const downloadStill = () => {
    const canvas = heroCanvasRef.current;

    if (!canvas || !currentScenePack) {
      return;
    }

    canvas.toBlob((blob) => {
      if (!blob) {
        return;
      }

      downloadBlob(blob, currentScenePack.exports.stillFileName);
    });
  };

  const downloadBuilderStill = () => {
    const canvas = studioCanvasRef.current;

    if (!canvas || !currentScenePack) {
      return;
    }

    canvas.toBlob((blob) => {
      if (!blob) {
        return;
      }

      downloadBlob(blob, currentScenePack.exports.builderStillFileName);
    });
  };

  const downloadPosterFrame = () => {
    if (!currentScenePack) {
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = currentScenePack.visual.canvasSize.width;
    canvas.height = currentScenePack.visual.canvasSize.height;
    drawHeroCanvas(canvas, currentScenePack, { variant: 'poster' });

    canvas.toBlob((blob) => {
      if (!blob) {
        return;
      }

      downloadBlob(blob, currentScenePack.exports.posterFrameFileName ?? 'poster-frame.png');
    });
  };

  const downloadSceneJson = () => {
    if (!currentScenePack) {
      return;
    }

    const blob = new Blob([JSON.stringify(currentScenePack, null, 2)], {
      type: 'application/json',
    });
    downloadBlob(blob, currentScenePack.exports.sceneFileName);
  };

  const downloadHandoffJson = () => {
    if (!currentScenePack || !currentRealSetBuild) {
      return;
    }

    const bricklinkManifest = summarizeBricklinkSourcing(currentScenePack.model.partManifest);

    const blob = new Blob(
      [
        JSON.stringify(
          {
            sceneFile: currentScenePack.exports.sceneFileName,
            stillFile: currentScenePack.exports.stillFileName,
            builderStillFile: currentScenePack.exports.builderStillFileName,
            instructionArtifactFile: currentScenePack.exports.instructionsFileName,
            instructionDataFile: currentScenePack.exports.instructionsDataFileName,
            manifestFile: currentScenePack.exports.manifestFileName,
            filmFile: currentScenePack.exports.filmFileName,
            mpdFile: currentRealSetBuild.exportBundle.mpdFileName,
            ioFile: currentRealSetBuild.exportBundle.ioFileName,
            validation: currentRealSetBuild.validation,
            sacredLine: currentScenePack.copy.sacredLine,
            storyArcs: currentScenePack.storyArcs,
            bricklinkSnapshotVersion: bricklinkManifest.bricklinkSnapshotVersion,
            mappedPartCoverage: bricklinkManifest.mappedPartCoverage,
            unavailablePartColorCount: bricklinkManifest.unavailablePartColorCount,
            partManifest: bricklinkManifest.items,
            audioPack,
            audioPackBasePath: getAudioPackBasePath(audioPack),
          },
          null,
          2,
        ),
      ],
      {
        type: 'application/json',
      },
    );

    downloadBlob(blob, currentScenePack.exports.handoffFileName);
  };

  const downloadInstructionsArtifact = () => {
    if (!currentScenePack) {
      return;
    }

    const blob = new Blob([buildInstructionArtifactHtml(currentScenePack)], {
      type: 'text/html;charset=utf-8',
    });
    downloadBlob(blob, currentScenePack.exports.instructionsFileName);
  };

  const downloadInstructionsData = () => {
    if (!currentScenePack) {
      return;
    }

    const blob = new Blob([JSON.stringify(currentScenePack.instructions, null, 2)], {
      type: 'application/json',
    });
    downloadBlob(blob, currentScenePack.exports.instructionsDataFileName);
  };

  const downloadPartManifest = () => {
    if (!currentScenePack) {
      return;
    }

    const bricklinkManifest = summarizeBricklinkSourcing(currentScenePack.model.partManifest);
    const blob = new Blob([JSON.stringify(bricklinkManifest, null, 2)], {
      type: 'application/json',
    });
    downloadBlob(blob, currentScenePack.exports.manifestFileName);
  };

  const downloadValidationReport = () => {
    if (!currentScenePack) {
      return;
    }

    const blob = new Blob([JSON.stringify(currentScenePack.model.validation, null, 2)], {
      type: 'application/json',
    });
    downloadBlob(blob, currentScenePack.exports.validationFileName);
  };

  const downloadMpd = () => {
    if (!currentRealSetBuild) {
      return;
    }

    downloadBlob(createMpdBlob(currentRealSetBuild.exportBundle), currentRealSetBuild.exportBundle.mpdFileName);
  };

  const downloadIo = () => {
    if (!currentRealSetBuild) {
      return;
    }

    downloadBlob(createIoBlob(currentRealSetBuild.exportBundle), currentRealSetBuild.exportBundle.ioFileName);
  };

  const downloadRevealClip = async () => {
    if (!currentScenePack) {
      return;
    }

    setDownloadingRevealClip(true);

    try {
      const blob = await recordRevealClip(currentScenePack);
      const revealExtension = getRevealClipFileExtension(blob.type);
      const revealFileName = /\.[a-z0-9]+$/i.test(currentScenePack.exports.filmFileName)
        ? currentScenePack.exports.filmFileName.replace(/\.[a-z0-9]+$/i, `.${revealExtension}`)
        : `${currentScenePack.exports.filmFileName}.${revealExtension}`;

      downloadBlob(
        blob,
        revealFileName,
      );
    } catch (clipError) {
      setError(clipError instanceof Error ? clipError.message : 'The reveal clip could not be exported.');
    } finally {
      setDownloadingRevealClip(false);
    }
  };

  const counts = currentScenePack?.instructions.colorBins ?? [];
  const activeInstruction = currentScenePack?.instructions.steps[activeInstructionStep] ?? null;
  const instructionPreviewHtml = currentScenePack ? buildInstructionArtifactHtml(currentScenePack) : '';
  const studioStepParts = activeInstruction?.partsNeeded.slice(0, 4) ?? [];
  const bricklinkManifest = currentScenePack
    ? summarizeBricklinkSourcing(currentScenePack.model.partManifest)
    : null;
  const catalogReferenceLinks = currentScenePack
    ? buildCatalogReferenceLinks(currentScenePack.model.partManifest)
    : [];
  const bricklinkUnavailableCount = bricklinkManifest?.unavailablePartColorCount ?? 0;
  const bricklinkCoverage = bricklinkManifest?.mappedPartCoverage.percentage ?? 0;
  const promptAvailabilityCopy =
    promptAvailable === null
      ? 'Checking description mode...'
      : promptAvailable
        ? 'Description mode is ready'
        : 'Description mode is unavailable right now.';
  const showDebug = import.meta.env.DEV && new URLSearchParams(window.location.search).get('debug') === '1';
  const renderAudioPackSelector = (title = 'Reveal soundtrack') => (
    <>
      <div className="card-heading compact">
        <h3>{title}</h3>
        <span>{activeAudioPack.label}</span>
      </div>
      <div className="density-row">
        {AUDIO_PACK_OPTIONS.map((option) => (
          <button
            aria-pressed={audioPack === option.id}
            className={audioPack === option.id ? 'choice-pill active' : 'choice-pill'}
            key={option.id}
            onClick={() => setAudioPack(option.id)}
            type="button"
          >
            <strong>{option.label}</strong>
            <span>{option.description}</span>
          </button>
        ))}
      </div>
    </>
  );

  useEffect(() => {
    if (currentStep === 'studio') {
      setStudioGuideDismissed(false);
    }
  }, [currentStep, currentScenePack?.setIdentity.sku]);

  if (currentStep === 'collection') {
    return (
      <div className="collection-page">
        <CollectionShelf
          activeSku={selectedCollectionSku}
          collectionPack={collectionPack}
          onOpenCommission={openCommissionFlow}
          onSelectSet={openCollectionSet}
        />
        <RightsConfirmationModal
          acknowledged={rightsAcknowledged}
          onAcknowledgeChange={setRightsAcknowledged}
          onCancel={handleRightsCancel}
          onContinue={handleRightsContinue}
          open={rightsModalOpen}
        />
        <LoadingInterstitial kind={loadingKind} open={status === 'loading'} />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className="shell-panel">
        <div className="shell-brand">
          <div className="blocks-badge">BLOCKS</div>
          <div>
            <p className="eyebrow">
              {experienceMode === 'collection' ? collectionPack.collection.name : 'Commission your set'}
            </p>
            <h1>
              {experienceMode === 'collection'
                ? 'Open the line. Inspect the build. Keep the set.'
                : 'Turn your artwork into a set worth keeping.'}
            </h1>
          </div>
        </div>
        <p className="shell-intro">
          {experienceMode === 'collection'
            ? `${collectionPack.collection.description} Choose a launch SKU, inspect the studio build, and keep the full export bundle.`
            : 'Start with artwork or a short description. We will turn it into a premium set reveal, a guided build, and a keepsake-ready bundle.'}
        </p>

        <nav aria-label="Build ritual" className="wizard-nav">
          {(experienceMode === 'commission'
            ? WIZARD_STEPS.filter((step) => step.id !== 'collection')
            : WIZARD_STEPS.filter((step) => step.id !== 'collection' && step.id !== 'input')
          ).map((step) => {
            const available = canVisitStep(step.id, sourceAsset, currentScenePack);
            const isActive = currentStep === step.id;

            return (
              <button
                className={isActive ? 'wizard-step active' : 'wizard-step'}
                disabled={!available}
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                type="button"
              >
                <span>{step.eyebrow}</span>
                <strong>{step.label}</strong>
              </button>
            );
          })}
        </nav>

        {currentStep === 'input' && experienceMode === 'commission' ? (
          <section className="rail-card">
            <div className="card-heading">
              <h2>Start a set</h2>
              <span>Artwork first</span>
            </div>
            <div className="input-launcher">
              <input
                ref={fileInputRef}
                accept="image/*"
                aria-hidden="true"
                className="visually-hidden"
                onChange={handleFileChange}
                tabIndex={-1}
                type="file"
              />
              <div className="upload-tray">
                <strong>Upload artwork</strong>
                <span>Best for logos, icons, emblems, and other clean silhouettes with strong contrast.</span>
                <button className="upload-launcher-button" onClick={handleUploadButtonClick} type="button">
                  Upload image
                </button>
              </div>
              <div className="input-meta-row">
                <span>PNG, JPG, or SVG. Use artwork you own or have permission to transform.</span>
                <button
                  className="input-guidance-link"
                  onClick={() => setActiveGuideIndex(0)}
                  type="button"
                >
                  How to get a good result
                </button>
              </div>
            </div>

            <form className="prompt-card" onSubmit={handlePromptSubmit}>
              <div className="card-heading compact">
                <h3>Or describe the set</h3>
                <span>{promptAvailabilityCopy}</span>
              </div>
              <label className="field-stack">
                <span>Set name</span>
                <input
                  className="shell-input"
                  onChange={(event) =>
                    setPromptForm((current) => ({
                      ...current,
                      brandName: event.target.value,
                    }))
                  }
                  placeholder="Optional brand or set name"
                  type="text"
                  value={promptForm.brandName}
                />
              </label>
              <label className="field-stack">
                <span>Describe the set</span>
                <textarea
                  className="shell-textarea"
                  onChange={(event) =>
                    setPromptForm((current) => ({
                      ...current,
                      prompt: event.target.value,
                    }))
                  }
                  placeholder="A joyful fries truck built from blocks rolling through a tiny city..."
                  rows={5}
                  value={promptForm.prompt}
                />
              </label>
              <button disabled={promptAvailable === false || status === 'loading'} type="submit">
                Generate the set
              </button>
            </form>

            {sourceAsset ? (
              <div className="source-preview">
                <img alt={`${sourceAsset.brandName} preview`} src={sourceAsset.previewUrl} />
                <div>
                  <strong>{sourceAsset.brandName}</strong>
                  <span>{sourceAsset.input.kind === 'image' ? 'Source artwork' : 'Concept artwork'}</span>
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        {currentStep === 'box' && currentScenePack ? (
          <section className="rail-card">
            <div className="card-heading">
              <h2>Set reveal</h2>
              <span>{currentScenePack.box.coverArtMode === 'prompt-concept' ? 'Concept artwork' : 'Collector preview'}</span>
            </div>
            <div className="summary-panel">
              <strong>{currentScenePack.box.title}</strong>
              <p>{currentScenePack.box.subtitle}</p>
            </div>
            <div className="info-grid">
              {currentScenePack.box.metadataRail.map((item) => (
                <article key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </article>
              ))}
            </div>
            <p className="summary-copy">{currentScenePack.box.heroCaption}</p>
            <div className="builder-summary">
              <span>{currentScenePack.instructions.countTotals.totalPieces} pieces</span>
              <span>{currentScenePack.model.validation.valid ? 'Build check passed' : 'Build check needs review'}</span>
              <span>{currentScenePack.setIdentity.collection}</span>
            </div>
          </section>
        ) : null}

        {currentStep === 'studio' && currentScenePack ? (
          <section className="rail-card studio-control-card">
            <div className="card-heading">
              <h2>Studio companion</h2>
              <span>Guided 3D</span>
            </div>
            <div className="summary-panel studio-summary-panel">
              <strong>Keep the studio playful and readable</strong>
              <p>
                This is the calm build desk, not a dense editor. Pick a phase, adjust the view, and keep the
                reveal ready for the big moment.
              </p>
            </div>

            <div className="density-row">
              {currentScenePack.instructions.steps.map((step, index) => (
                <button
                  className={activeInstructionStep === index ? 'choice-pill active' : 'choice-pill'}
                  key={step.id}
                  onClick={() => setActiveInstructionStep(index)}
                  type="button"
                >
                  <strong>{index + 1}</strong>
                  <span>{step.title}</span>
                </button>
              ))}
            </div>

            <div className="toggle-row">
              <label className="toggle-chip">
                <input
                  checked={instructionSync}
                  onChange={(event) => setInstructionSync(event.target.checked)}
                  type="checkbox"
                />
                <span>Follow the book</span>
              </label>
              <label className="toggle-chip">
                <input
                  checked={studioExploded}
                  onChange={(event) => setStudioExploded(event.target.checked)}
                  type="checkbox"
                />
                <span>Exploded view</span>
              </label>
              <label className="toggle-chip">
                <input
                  checked={studioAutoRotate}
                  onChange={(event) => setStudioAutoRotate(event.target.checked)}
                  type="checkbox"
                />
                <span>Slow rotate</span>
              </label>
            </div>

            <div className="builder-summary">
              <span>Step {activeInstructionStep + 1} of {currentScenePack.instructions.steps.length}</span>
              <span>{activeInstruction?.partCount ?? 0} pieces in this phase</span>
              <span>{instructionSync ? 'Following the instruction book' : 'Free explore mode'}</span>
            </div>

            {renderAudioPackSelector('Studio soundtrack')}

            <button
              className="primary-action"
              disabled={revealPlaying}
              onClick={() => {
                setStudioAutoRotate(true);
                playReveal(currentScenePack);
              }}
              type="button"
            >
              {revealPlaying ? 'Playing reveal…' : 'Play the reveal'}
            </button>
          </section>
        ) : null}

        {currentStep === 'instructions' && currentScenePack ? (
          <section className="rail-card">
            <div className="card-heading">
              <h2>Instruction book</h2>
              <span>{currentScenePack.instructions.countTotals.totalPieces} pieces</span>
            </div>
            <p className="summary-copy">Clear phases, readable parts calls, and a final check before you keep the set.</p>
            <ol className="instruction-list">
              {currentScenePack.instructions.steps.map((step) => (
                <li key={step.id}>
                  <strong>{step.title}</strong>
                  <span>{step.detail}</span>
                  <small>{step.partsNeeded.slice(0, 3).map((part) => `${part.count}x ${part.partName}`).join(' • ')}</small>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {currentStep === 'keep' && currentScenePack ? (
          <section className="rail-card">
            <div className="card-heading">
              <h2>Take it with you</h2>
              <span>Share, source, and keep</span>
            </div>
            {renderAudioPackSelector()}
            <div className="keep-grid">
              <section className="keep-section">
                <div className="card-heading compact">
                  <h3>Share it</h3>
                  <span>Stills + reveal</span>
                </div>
                <div className="export-grid">
                  <button onClick={downloadStill} type="button">Download set box</button>
                  <button onClick={downloadBuilderStill} type="button">Download studio still</button>
                  <button onClick={downloadPosterFrame} type="button">Download poster frame</button>
                  <button disabled={downloadingRevealClip} onClick={downloadRevealClip} type="button">
                    {downloadingRevealClip ? 'Rendering clip…' : 'Download reveal clip'}
                  </button>
                </div>
              </section>
              <section className="keep-section">
                <div className="card-heading compact">
                  <h3>Build with it</h3>
                  <span>Instructions + model files</span>
                </div>
                <div className="export-grid">
                  <button onClick={downloadInstructionsArtifact} type="button">Download instruction book</button>
                  <button onClick={downloadPartManifest} type="button">Download part manifest</button>
                  <button onClick={downloadMpd} type="button">Download MPD</button>
                  <button onClick={downloadIo} type="button">Download IO bundle</button>
                </div>
              </section>
              <section className="keep-section keep-section-sourcing">
                <div className="card-heading compact">
                  <h3>Catalog-backed sourcing</h3>
                  <span>{bricklinkCoverage}% linked</span>
                </div>
                <p className="summary-copy">
                  Reference links only. Use them to research parts and color pairings after export, not as a
                  fulfillment, pricing, or stock guarantee.
                </p>
                <div className="sourcing-metric-grid">
                  <article>
                    <span>Mapped line items</span>
                    <strong>
                      {bricklinkManifest?.mappedPartCoverage.mappedLineItems ?? 0}
                      {' '}of{' '}
                      {bricklinkManifest?.mappedPartCoverage.totalLineItems ?? 0}
                    </strong>
                  </article>
                  <article>
                    <span>Unavailable pairings</span>
                    <strong>{bricklinkUnavailableCount}</strong>
                  </article>
                </div>
                {catalogReferenceLinks.length > 0 ? (
                  <div className="sourcing-link-list">
                    {catalogReferenceLinks.map((item) => (
                      <a
                        href={item.bricklinkCatalogUrl ?? undefined}
                        key={item.key}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <strong>{item.partName}</strong>
                        <span>{item.bricklinkColorName ?? item.colorName}</span>
                        <small>
                          {item.count} needed
                          {item.bricklinkItemNo ? ` • Item ${item.bricklinkItemNo}` : ''}
                        </small>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="sourcing-empty-state">
                    Catalog links will appear here when the current set has BrickLink part mappings attached.
                  </div>
                )}
              </section>
              {showDebug ? (
                <section className="keep-section keep-section-debug">
                  <div className="card-heading compact">
                    <h3>Debug diagnostics</h3>
                    <span>Raw bundle files</span>
                  </div>
                  <div className="export-grid">
                    <button onClick={downloadInstructionsData} type="button">Download instructions JSON</button>
                    <button onClick={downloadValidationReport} type="button">Download validation report</button>
                    <button onClick={downloadSceneJson} type="button">Download scene JSON</button>
                    <button onClick={downloadHandoffJson} type="button">Download handoff pack</button>
                  </div>
                </section>
              ) : null}
            </div>
            <div className="commerce-card">
              <strong>Build the real set</strong>
              <span>{currentScenePack.commerce.heroMessage}</span>
              <small>Start with the instruction book, then move into the model files when you want more control.</small>
            </div>
          </section>
        ) : null}

        <div className="wizard-actions">
          <button
            className="secondary"
            disabled={currentStep === 'input' && experienceMode === 'commission'}
            onClick={moveToPreviousStep}
            type="button"
          >
            Back
          </button>
          <button
            disabled={!currentScenePack || currentStep === 'keep'}
            onClick={moveToNextStep}
            type="button"
          >
            Next
          </button>
          <button className="secondary" onClick={resetBuild} type="button">
            Reset
          </button>
        </div>

        <p className={error ? 'status error' : 'status'}>
          {error
            ? error
            : status === 'loading'
              ? 'Preparing your signature set'
              : currentScenePack
                ? `${currentScenePack.brand.name} is ready to explore.`
                : 'Upload artwork or describe a set to begin.'}
        </p>
      </aside>

      <main className="stage-column">
        <section className="stage-card">
          <div className="stage-header">
            <div>
              <p className="eyebrow">Stage</p>
              <h2>
                {currentStep === 'input'
                  ? 'Choose your starting point'
                  : currentStep === 'box'
                    ? 'Your set reveal'
                    : currentStep === 'studio'
                      ? 'Build studio'
                      : currentStep === 'instructions'
                        ? 'Instruction book'
                        : 'Take it with you'}
              </h2>
            </div>
            {currentScenePack ? <span className="stage-chip">{currentScenePack.box.badge.serial}</span> : null}
          </div>

          {currentScenePack ? (
            <>
              {(currentStep === 'input' || currentStep === 'box' || currentStep === 'keep') && (
                <canvas
                  className="hero-canvas"
                  height={currentScenePack.visual.canvasSize.height}
                  ref={heroCanvasRef}
                  width={currentScenePack.visual.canvasSize.width}
                />
              )}
              {currentStep === 'studio' && (
                <div className="studio-stage-layout">
                  <div className="studio-stage-shell">
                    {!studioGuideDismissed ? (
                      <section className="studio-guide-card">
                        <div className="studio-guide-heading">
                          <div>
                            <p className="eyebrow">Studio companion</p>
                            <h3>Welcome to your build studio</h3>
                          </div>
                          <button
                            className="studio-guide-toggle"
                            onClick={() => setStudioGuideDismissed(true)}
                            type="button"
                          >
                            Hide guide
                          </button>
                        </div>
                        <p>
                          Orbit the set, keep one eye on the book, and open the spacing only when you want
                          a clearer read on the build.
                        </p>
                        <div className="studio-guide-grid">
                          <article>
                            <span>01</span>
                            <strong>Orbit for shape</strong>
                            <p>Drag around the model to understand the silhouette before you step in closer.</p>
                          </article>
                          <article>
                            <span>02</span>
                            <strong>Follow one phase</strong>
                            <p>Use the step pills to stay with the current phase instead of scanning the whole set.</p>
                          </article>
                          <article>
                            <span>03</span>
                            <strong>Play the reveal</strong>
                            <p>Turn on the soundtrack when you want the full cinematic walkthrough of the build.</p>
                          </article>
                        </div>
                      </section>
                    ) : (
                      <button
                        className="studio-guide-toggle studio-guide-toggle-inline"
                        onClick={() => setStudioGuideDismissed(false)}
                        type="button"
                      >
                        Show studio guide
                      </button>
                    )}

                    <div className="studio-canvas-shell">
                      <Suspense
                        fallback={(
                          <div className="studio-loading" role="status">
                            Loading studio…
                          </div>
                        )}
                      >
                        <BuilderStudio3D
                          activeStepIndex={activeInstructionStep}
                          autoRotate={studioAutoRotate}
                          canvasRef={studioCanvasRef}
                          exploded={studioExploded}
                          instructionSync={instructionSync}
                          scenePack={currentScenePack}
                        />
                      </Suspense>
                    </div>

                    <div className="studio-stage-footer">
                      <span>{instructionSync ? 'Book sync on' : 'Free explore mode'}</span>
                      <span>{studioExploded ? 'Exploded view enabled' : 'Tight assembly view'}</span>
                      <span>{activeAudioPack.label}</span>
                    </div>
                  </div>

                  <aside className="studio-inspector-card" aria-label="Current build step">
                    <div className="card-heading compact">
                      <h3>Current build step</h3>
                      <span>Step {activeInstructionStep + 1} of {currentScenePack.instructions.steps.length}</span>
                    </div>
                    <div className="studio-inspector-callout">
                      <strong>{activeInstruction?.title ?? 'Preview the full set'}</strong>
                      <p>{activeInstruction?.detail ?? 'Move through the phases to see how the set comes together.'}</p>
                    </div>
                    <div className="studio-inspector-metrics">
                      <article>
                        <span>Pieces in phase</span>
                        <strong>{activeInstruction?.partCount ?? 0}</strong>
                      </article>
                      <article>
                        <span>Camera</span>
                        <strong>{studioAutoRotate ? 'Slow orbit' : 'Manual orbit'}</strong>
                      </article>
                    </div>
                    <div className="studio-inspector-parts">
                      <span>Next parts to notice</span>
                      {studioStepParts.length > 0 ? (
                        <ul>
                          {studioStepParts.map((part) => (
                            <li key={`${part.partId}-${part.colorId}`}>
                              <strong>{part.count}x {part.partName}</strong>
                              <span>{part.colorName}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>The active phase will list its main parts here as soon as step data is available.</p>
                      )}
                    </div>
                  </aside>
                </div>
              )}
              {currentStep === 'instructions' && (
                <div className="instructions-layout">
                  <iframe
                    className="instruction-preview-frame"
                    srcDoc={instructionPreviewHtml}
                    title="Instruction preview"
                  />
                  <div className="parts-panel">
                    <div className="parts-heading">
                      <strong>Part manifest</strong>
                      <span>{currentScenePack.instructions.countTotals.uniqueParts} part kinds</span>
                    </div>
                    <div className="builder-summary">
                      <span>Theme: {currentScenePack.instructions.theme}</span>
                      <span>Phases: {currentScenePack.instructions.steps.length}</span>
                      <span>Pieces: {currentScenePack.instructions.countTotals.totalPieces}</span>
                    </div>
                    <div className="count-grid">
                      {counts.map((matchedColor) => {
                        return (
                          <article className="count-card" key={matchedColor.colorId}>
                            <span className="swatch" style={{ backgroundColor: matchedColor.hex }} />
                            <div>
                              <strong>{matchedColor.count}</strong>
                              <span>{matchedColor.colorName}</span>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            currentStep === 'input' ? (
              <InputOnboardingShowcase
                activeIndex={activeGuideIndex}
                examples={INPUT_GUIDE_EXAMPLES}
                onNext={() => cycleGuideIndex(1)}
                onPrevious={() => cycleGuideIndex(-1)}
                onSelectExample={setActiveGuideIndex}
              />
            ) : (
              <div className="stage-placeholder">
                <div className="placeholder-box">
                  <div className="blocks-badge floating">BLOCKS</div>
                  <div className="placeholder-hero" />
                </div>
                <div className="placeholder-copy">
                  <strong>Your set reveal will appear here.</strong>
                  <p>
                    Start with artwork or a short description. We will turn it into a boxed set
                    preview, a guided build, and a bundle you can keep.
                  </p>
                </div>
              </div>
            )
          )}
        </section>

        {currentScenePack ? (
          <section className="lower-grid">
            <article className="story-card">
              <div className="card-heading compact">
                <h3>Reveal highlights</h3>
                <span>What the set is promising</span>
              </div>
              <div className="story-list">
                {currentScenePack.storyArcs.map((arc) => (
                  <div key={arc.id}>
                    <strong>{arc.headline}</strong>
                    <p>{arc.summary}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="story-card">
              <div className="card-heading compact">
                <h3>Build at a glance</h3>
                <span>{currentScenePack.setIdentity.name}</span>
              </div>
              <div className="fact-grid">
                <div>
                  <span>Pieces</span>
                  <strong>{currentScenePack.instructions.countTotals.totalPieces}</strong>
                </div>
                <div>
                  <span>Part kinds</span>
                  <strong>{currentScenePack.instructions.countTotals.uniqueParts}</strong>
                </div>
                <div>
                  <span>Line</span>
                  <strong>{currentScenePack.setIdentity.launchLine}</strong>
                </div>
                <div>
                  <span>Set number</span>
                  <strong>{currentScenePack.setIdentity.sku}</strong>
                </div>
              </div>
            </article>
            {showDebug ? (
              <article className="story-card debug-card">
                <div className="card-heading compact">
                  <h3>Debug diagnostics</h3>
                  <span>{activeVisualPreset.label}</span>
                </div>
                <div className="fact-grid">
                  <div>
                    <span>Build ID</span>
                    <strong>{currentScenePack.setIdentity.buildId}</strong>
                  </div>
                  <div>
                    <span>Input kind</span>
                    <strong>{currentScenePack.input.kind}</strong>
                  </div>
                  <div>
                    <span>Camera</span>
                    <strong>{currentScenePack.builder.cameraPreset}</strong>
                  </div>
                  <div>
                    <span>Density</span>
                    <strong>{activeDensityPreset.label}</strong>
                  </div>
                </div>
              </article>
            ) : null}
          </section>
        ) : null}
      </main>

      <RightsConfirmationModal
        acknowledged={rightsAcknowledged}
        onAcknowledgeChange={setRightsAcknowledged}
        onCancel={handleRightsCancel}
        onContinue={handleRightsContinue}
        open={rightsModalOpen}
      />
      <LoadingInterstitial kind={loadingKind} open={status === 'loading'} />
    </div>
  );
}

export default App;
