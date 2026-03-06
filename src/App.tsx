import { startTransition, useDeferredValue, useEffect, useEffectEvent, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';

import './App.css';
import { buildBlockBuildFromImageData, type ImageDataLike } from './lib/block-engine';
import { BuilderStudio3D } from './components/BuilderStudio3D';
import { InputOnboardingShowcase } from './components/InputOnboardingShowcase';
import { LoadingInterstitial } from './components/LoadingInterstitial';
import { RightsConfirmationModal } from './components/RightsConfirmationModal';
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
  REVEAL_DURATION_MS,
  recordRevealClip,
} from './lib/reveal-renderer';
import {
  VISUAL_PRESETS,
  buildScenePack,
  type ScenePack,
} from './lib/scene-pack';
import { buildRealSet, createIoBlob, createMpdBlob, type RealSetBuild } from './lib/set-engine';

type WizardStep = 'input' | 'box' | 'studio' | 'instructions' | 'keep';

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
  { id: 'instructions', label: 'Build sheet', eyebrow: '04' },
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

const canVisitStep = (step: WizardStep, sourceAsset: SourceAsset | null, scenePack: ScenePack | null) => {
  if (step === 'input') {
    return true;
  }

  if (!sourceAsset || !scenePack) {
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
  const [currentStep, setCurrentStep] = useState<WizardStep>('input');
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
  const [activeGuideIndex, setActiveGuideIndex] = useState(0);
  const [loadingKind, setLoadingKind] = useState<'image' | 'prompt' | null>(null);
  const [promptForm, setPromptForm] = useState({
    brandName: '',
    prompt: '',
  });
  const [promptAvailable, setPromptAvailable] = useState<boolean | null>(null);
  const deferredColumns = useDeferredValue(densityColumns);

  const activeVisualPreset = VISUAL_PRESETS.find((preset) => preset.id === visualPresetId) ?? VISUAL_PRESETS[0]!;
  const activeDensityPreset =
    DENSITY_PRESETS.find((preset) => preset.columns === densityColumns) ?? DENSITY_PRESETS[1]!;

  const cycleGuideIndex = useEffectEvent((direction: 1 | -1) => {
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
  });

  const clearRevealPlayback = useEffectEvent(() => {
    if (revealAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(revealAnimationFrameRef.current);
      revealAnimationFrameRef.current = null;
    }

    revealAudioTimerRef.current.forEach((timer) => window.clearTimeout(timer));
    revealAudioTimerRef.current = [];
    setRevealPlaying(false);
  });

  const queueRightsGate = useEffectEvent((action: PendingStartAction) => {
    setPendingStartAction(action);
    setRightsAcknowledged(false);
    setRightsModalOpen(true);
  });

  const rebuildScenePack = useEffectEvent((asset: SourceAsset, columns: number) => {
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
  });

  const startPromptBuild = useEffectEvent(async () => {
    if (!promptForm.prompt.trim()) {
      setError('Describe what you want to build first.');
      return;
    }

    clearRevealPlayback();
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
  });

  const openFilePicker = useEffectEvent(() => {
    fileInputRef.current?.click();
  });

  const resumePendingStartAction = useEffectEvent(() => {
    if (pendingStartAction === 'file-picker') {
      openFilePicker();
    }

    if (pendingStartAction === 'prompt-submit') {
      void startPromptBuild();
    }

    setPendingStartAction(null);
  });

  const handleRightsContinue = useEffectEvent(() => {
    setRightsAccepted(true);
    setRightsModalOpen(false);
    setRightsAcknowledged(false);
    resumePendingStartAction();
  });

  const handleRightsCancel = useEffectEvent(() => {
    setRightsModalOpen(false);
    setRightsAcknowledged(false);
    setPendingStartAction(null);
  });

  const paintHero = useEffectEvent((pack: ScenePack, variant: 'hero' | 'poster' = 'hero') => {
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
  });

  const scheduleAudioCue = useEffectEvent((cue: string, delayMs: number, volume: number) => {
    const timer = window.setTimeout(() => {
      const audio = new Audio(`/audio/${cue}.wav`);
      audio.volume = volume;
      void audio.play().catch(() => undefined);
    }, delayMs);

    revealAudioTimerRef.current.push(timer);
  });

  const playReveal = useEffectEvent((pack: ScenePack) => {
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
  });

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
    if (!scenePack) {
      return;
    }

    paintHero(scenePack);
  }, [paintHero, scenePack]);

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

  const resetBuild = () => {
    clearRevealPlayback();
    setCurrentStep('input');
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
  };

  const moveToNextStep = () => {
    if (!scenePack) {
      return;
    }

    if (currentStep === 'input') {
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
      setCurrentStep('input');
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

    if (!canvas || !scenePack) {
      return;
    }

    canvas.toBlob((blob) => {
      if (!blob) {
        return;
      }

      downloadBlob(blob, scenePack.exports.stillFileName);
    });
  };

  const downloadBuilderStill = () => {
    const canvas = studioCanvasRef.current;

    if (!canvas || !scenePack) {
      return;
    }

    canvas.toBlob((blob) => {
      if (!blob) {
        return;
      }

      downloadBlob(blob, scenePack.exports.builderStillFileName);
    });
  };

  const downloadPosterFrame = () => {
    if (!scenePack) {
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = scenePack.visual.canvasSize.width;
    canvas.height = scenePack.visual.canvasSize.height;
    drawHeroCanvas(canvas, scenePack, { variant: 'poster' });

    canvas.toBlob((blob) => {
      if (!blob) {
        return;
      }

      downloadBlob(blob, scenePack.exports.posterFrameFileName ?? 'poster-frame.png');
    });
  };

  const downloadSceneJson = () => {
    if (!scenePack) {
      return;
    }

    const blob = new Blob([JSON.stringify(scenePack, null, 2)], {
      type: 'application/json',
    });
    downloadBlob(blob, scenePack.exports.sceneFileName);
  };

  const downloadHandoffJson = () => {
    if (!scenePack || !realSetBuild) {
      return;
    }

    const blob = new Blob(
      [
        JSON.stringify(
          {
            sceneFile: scenePack.exports.sceneFileName,
            stillFile: scenePack.exports.stillFileName,
            builderStillFile: scenePack.exports.builderStillFileName,
            instructionArtifactFile: scenePack.exports.instructionsFileName,
            instructionDataFile: scenePack.exports.instructionsDataFileName,
            manifestFile: scenePack.exports.manifestFileName,
            filmFile: scenePack.exports.filmFileName,
            mpdFile: realSetBuild.exportBundle.mpdFileName,
            ioFile: realSetBuild.exportBundle.ioFileName,
            validation: realSetBuild.validation,
            sacredLine: scenePack.copy.sacredLine,
            storyArcs: scenePack.storyArcs,
          },
          null,
          2,
        ),
      ],
      {
        type: 'application/json',
      },
    );

    downloadBlob(blob, scenePack.exports.handoffFileName);
  };

  const downloadInstructionsArtifact = () => {
    if (!scenePack) {
      return;
    }

    const blob = new Blob([buildInstructionArtifactHtml(scenePack)], {
      type: 'text/html;charset=utf-8',
    });
    downloadBlob(blob, scenePack.exports.instructionsFileName);
  };

  const downloadInstructionsData = () => {
    if (!scenePack) {
      return;
    }

    const blob = new Blob([JSON.stringify(scenePack.instructions, null, 2)], {
      type: 'application/json',
    });
    downloadBlob(blob, scenePack.exports.instructionsDataFileName);
  };

  const downloadPartManifest = () => {
    if (!scenePack) {
      return;
    }

    const blob = new Blob([JSON.stringify(scenePack.model.partManifest, null, 2)], {
      type: 'application/json',
    });
    downloadBlob(blob, scenePack.exports.manifestFileName);
  };

  const downloadValidationReport = () => {
    if (!scenePack) {
      return;
    }

    const blob = new Blob([JSON.stringify(scenePack.model.validation, null, 2)], {
      type: 'application/json',
    });
    downloadBlob(blob, scenePack.exports.validationFileName);
  };

  const downloadMpd = () => {
    if (!realSetBuild) {
      return;
    }

    downloadBlob(createMpdBlob(realSetBuild.exportBundle), realSetBuild.exportBundle.mpdFileName);
  };

  const downloadIo = () => {
    if (!realSetBuild) {
      return;
    }

    downloadBlob(createIoBlob(realSetBuild.exportBundle), realSetBuild.exportBundle.ioFileName);
  };

  const downloadRevealClip = async () => {
    if (!scenePack) {
      return;
    }

    setDownloadingRevealClip(true);

    try {
      const blob = await recordRevealClip(scenePack);
      downloadBlob(blob, scenePack.exports.filmFileName.replace(/\.mp4$/i, '.webm'));
    } catch (clipError) {
      setError(clipError instanceof Error ? clipError.message : 'The reveal clip could not be exported.');
    } finally {
      setDownloadingRevealClip(false);
    }
  };

  const counts = scenePack?.instructions.colorBins ?? [];
  const instructionPreviewHtml = scenePack ? buildInstructionArtifactHtml(scenePack) : '';

  return (
    <div className="app-shell">
      <aside className="shell-panel">
        <div className="shell-brand">
          <div className="blocks-badge">BLOCKS</div>
          <div>
            <p className="eyebrow">Just Build with Blocks</p>
            <h1>Upload it. Or describe it. Build the set.</h1>
          </div>
        </div>
        <p className="shell-intro">
          OpenAI owns the shell. Blocks own the delight. Start with a mark or an idea, reveal a
          custom set box, then step into the builder studio and keep the parts, the story, and the
          clip.
        </p>

        <nav aria-label="Build ritual" className="wizard-nav">
          {WIZARD_STEPS.map((step) => {
            const available = canVisitStep(step.id, sourceAsset, scenePack);
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

        {currentStep === 'input' ? (
          <section className="rail-card">
            <div className="card-heading">
              <h2>Start a set</h2>
              <span>Image or prompt</span>
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
                <strong>Image-first upload</strong>
                <span>Best for logos, icons, transparent PNGs, and simple marks with clean contrast.</span>
                <button className="upload-launcher-button" onClick={handleUploadButtonClick} type="button">
                  Upload image
                </button>
              </div>
              <div className="input-meta-row">
                <span>PNG, JPG, or SVG. Original marks only.</span>
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
                <h3>Or describe it</h3>
                <span>{promptAvailable ? 'GPT path ready' : 'API key needed for live prompt builds'}</span>
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
                  <span>{sourceAsset.input.kind === 'image' ? 'Uploaded source' : 'Prompt concept cover art'}</span>
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        {currentStep === 'box' && scenePack ? (
          <section className="rail-card">
            <div className="card-heading">
              <h2>Set box reveal</h2>
              <span>{scenePack.box.coverArtMode === 'prompt-concept' ? 'Prompt concept' : 'Signature set'}</span>
            </div>
            <div className="info-grid">
              {scenePack.box.metadataRail.map((item) => (
                <article key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </article>
              ))}
            </div>
            <p className="summary-copy">{scenePack.box.heroCaption}</p>
            <div className="builder-summary">
              <span>Model: {scenePack.model.style}</span>
              <span>Validation: {scenePack.model.validation.valid ? 'pass' : 'review'}</span>
              <span>Collection: {scenePack.setIdentity.collection}</span>
            </div>
          </section>
        ) : null}

        {currentStep === 'studio' && scenePack ? (
          <section className="rail-card">
            <div className="card-heading">
              <h2>Builder studio</h2>
              <span>Guided 3D</span>
            </div>

            <div className="density-row">
              {scenePack.instructions.steps.map((step, index) => (
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
                <span>Instruction sync</span>
              </label>
              <label className="toggle-chip">
                <input
                  checked={studioExploded}
                  onChange={(event) => setStudioExploded(event.target.checked)}
                  type="checkbox"
                />
                <span>Explode view</span>
              </label>
              <label className="toggle-chip">
                <input
                  checked={studioAutoRotate}
                  onChange={(event) => setStudioAutoRotate(event.target.checked)}
                  type="checkbox"
                />
                <span>Auto rotate</span>
              </label>
            </div>

            <div className="builder-summary">
              <span>Camera: {scenePack.builder.cameraPreset}</span>
              <span>Scene: {scenePack.builder.scenePreset}</span>
              <span>Step {activeInstructionStep + 1} / {scenePack.instructions.steps.length}</span>
            </div>

            <button
              className="primary-action"
              disabled={revealPlaying}
              onClick={() => {
                setStudioAutoRotate(true);
                playReveal(scenePack);
              }}
              type="button"
            >
              {revealPlaying ? 'Playing reveal…' : 'Play reveal'}
            </button>
          </section>
        ) : null}

        {currentStep === 'instructions' && scenePack ? (
          <section className="rail-card">
            <div className="card-heading">
              <h2>Build sheet</h2>
              <span>{scenePack.instructions.countTotals.totalPieces} pieces</span>
            </div>
            <ol className="instruction-list">
              {scenePack.instructions.steps.map((step) => (
                <li key={step.id}>
                  <strong>{step.title}</strong>
                  <span>{step.detail}</span>
                  <small>{step.partsNeeded.slice(0, 3).map((part) => `${part.count}x ${part.partName}`).join(' • ')}</small>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {currentStep === 'keep' && scenePack ? (
          <section className="rail-card">
            <div className="card-heading">
              <h2>Keep the set</h2>
              <span>Exports + tease</span>
            </div>
            <div className="export-grid">
              <button onClick={downloadStill} type="button">Download set box</button>
              <button onClick={downloadBuilderStill} type="button">Download studio still</button>
              <button onClick={downloadInstructionsArtifact} type="button">Download instruction book</button>
              <button onClick={downloadInstructionsData} type="button">Download instructions JSON</button>
              <button onClick={downloadPartManifest} type="button">Download part manifest</button>
              <button onClick={downloadValidationReport} type="button">Download validation report</button>
              <button onClick={downloadMpd} type="button">Download MPD</button>
              <button onClick={downloadIo} type="button">Download IO bundle</button>
              <button disabled={downloadingRevealClip} onClick={downloadRevealClip} type="button">
                {downloadingRevealClip ? 'Rendering clip…' : 'Download reveal clip'}
              </button>
              <button onClick={downloadPosterFrame} type="button">Download poster frame</button>
              <button onClick={downloadSceneJson} type="button">Download scene JSON</button>
              <button onClick={downloadHandoffJson} type="button">Download handoff pack</button>
            </div>
            <div className="commerce-card">
              <strong>{scenePack.commerce.ctaLabel}</strong>
              <span>{scenePack.commerce.heroMessage}</span>
            </div>
          </section>
        ) : null}

        <div className="wizard-actions">
          <button
            className="secondary"
            disabled={currentStep === 'input'}
            onClick={moveToPreviousStep}
            type="button"
          >
            Back
          </button>
          <button
            disabled={!scenePack || currentStep === 'keep'}
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
              : scenePack
                ? `${scenePack.brand.name} is ready.`
                : 'This shell is local-first. Prompt mode wakes up when the server has an OpenAI key.'}
        </p>
      </aside>

      <main className="stage-column">
        <section className="stage-card">
          <div className="stage-header">
            <div>
              <p className="eyebrow">Stage</p>
              <h2>
                {currentStep === 'input'
                  ? 'Set preview'
                  : currentStep === 'box'
                    ? 'Custom set box'
                    : currentStep === 'studio'
                      ? 'Builder studio'
                      : currentStep === 'instructions'
                        ? 'Instructions and parts'
                        : 'Keepsake exports'}
              </h2>
            </div>
            {scenePack ? <span className="stage-chip">{scenePack.box.badge.serial}</span> : null}
          </div>

          {scenePack ? (
            <>
              {(currentStep === 'input' || currentStep === 'box' || currentStep === 'keep') && (
                <canvas
                  className="hero-canvas"
                  height={scenePack.visual.canvasSize.height}
                  ref={heroCanvasRef}
                  width={scenePack.visual.canvasSize.width}
                />
              )}
              {currentStep === 'studio' && (
                <BuilderStudio3D
                  activeStepIndex={activeInstructionStep}
                  autoRotate={studioAutoRotate}
                  canvasRef={studioCanvasRef}
                  exploded={studioExploded}
                  instructionSync={instructionSync}
                  scenePack={scenePack}
                />
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
                      <span>{scenePack.instructions.countTotals.uniqueParts} part kinds</span>
                    </div>
                    <div className="builder-summary">
                      <span>Theme: {scenePack.instructions.theme}</span>
                      <span>Phases: {scenePack.instructions.steps.length}</span>
                      <span>Pieces: {scenePack.instructions.countTotals.totalPieces}</span>
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
                  <strong>Set-box first.</strong>
                  <p>
                    The first frame should already feel like a product: blue packaging field, red
                    badge, clean OpenAI type, and one bright block-built hero image people want to
                    share.
                  </p>
                </div>
              </div>
            )
          )}
        </section>

        {scenePack ? (
          <section className="lower-grid">
            <article className="story-card">
              <div className="card-heading compact">
                <h3>Story arcs</h3>
                <span>Film handoff</span>
              </div>
              <div className="story-list">
                {scenePack.storyArcs.map((arc) => (
                  <div key={arc.id}>
                    <strong>{arc.headline}</strong>
                    <p>{arc.summary}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="story-card">
              <div className="card-heading compact">
                <h3>Builder facts</h3>
                <span>{activeVisualPreset.label}</span>
              </div>
              <div className="fact-grid">
                <div>
                  <span>Density</span>
                  <strong>{activeDensityPreset.label}</strong>
                </div>
                <div>
                  <span>World</span>
                  <strong>{scenePack.world.cameraEmotion}</strong>
                </div>
                <div>
                  <span>Sacred line</span>
                  <strong>{scenePack.copy.sacredLine}</strong>
                </div>
                <div>
                  <span>Prompt mode</span>
                  <strong>{scenePack.input.kind}</strong>
                </div>
              </div>
            </article>
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
