import { useEffect, useState } from 'react';
import type { MutableRefObject } from 'react';

import { BuilderStudio3D } from '../BuilderStudio3D';
import {
  BlocksBrick,
  BlocksButton,
  BookletIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Eyebrow,
  HeroCopy,
  RotateIcon,
  StageShell,
  SupportRail,
} from './FlagshipPrimitives';
import { useExperience } from './useExperience';

export function StudioPhase({
  studioCanvasRef,
}: {
  studioCanvasRef: MutableRefObject<HTMLCanvasElement | null>;
}) {
  const {
    setActiveInstructionStep,
    setInstructionSync,
    setPhase,
    setStudioAutoRotate,
    setStudioExploded,
    state,
  } = useExperience();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const session = state.session;

  useEffect(() => {
    if (!session || !isPlaying) {
      return;
    }

    const lastIndex = session.scenePack.instructions.steps.length - 1;
    const timer = window.setInterval(() => {
      const next = Math.min(state.activeInstructionStep + 1, lastIndex);
      setActiveInstructionStep(next);

      if (next >= lastIndex) {
        window.clearInterval(timer);
        setIsPlaying(false);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isPlaying, session, setActiveInstructionStep, state.activeInstructionStep]);

  if (!session) {
    return null;
  }

  const activeInstruction = session.scenePack.instructions.steps[state.activeInstructionStep];
  const stepParts = activeInstruction?.partsNeeded ?? [];
  const totalSteps = session.scenePack.instructions.steps.length;
  const progress = ((state.activeInstructionStep + 1) / totalSteps) * 100;

  return (
    <div className="experience-page studio-route flagship-page">
      <div className="flagship-shell flagship-shell--studio">
        <main className="flagship-grid flagship-grid--studio">
          <StageShell className="studio-stage" glow="warm">
            <div className="studio-stage__topbar">
              <BlocksButton onClick={() => setPhase('reveal')} size="sm" variant="secondary">
                <ChevronLeftIcon size={16} />
                Back
              </BlocksButton>
              <div
                aria-label={`Step ${state.activeInstructionStep + 1} of ${totalSteps}`}
                className="studio-stage__counter"
              >
                <Eyebrow>Step</Eyebrow>
                <strong>{state.activeInstructionStep + 1}</strong>
                <span>/ {totalSteps}</span>
              </div>
              <div className="studio-stage__options">
                <BlocksButton onClick={() => setShowOptions((current) => !current)} size="sm" variant="secondary">
                  <RotateIcon size={16} />
                  View Options
                </BlocksButton>
                {showOptions ? (
                  <div className="studio-stage__popover">
                    <label>
                      <input
                        checked={state.studioExploded}
                        onChange={(event) => setStudioExploded(event.target.checked)}
                        type="checkbox"
                      />
                      <span>Exploded view</span>
                    </label>
                    <label>
                      <input
                        checked={state.studioAutoRotate}
                        onChange={(event) => setStudioAutoRotate(event.target.checked)}
                        type="checkbox"
                      />
                      <span>Turntable</span>
                    </label>
                    <label>
                      <input
                        checked={state.instructionSync}
                        onChange={(event) => setInstructionSync(event.target.checked)}
                        type="checkbox"
                      />
                      <span>Instruction sync</span>
                    </label>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="studio-stage__viewport">
              <BuilderStudio3D
                activeStepIndex={state.activeInstructionStep}
                autoRotate={state.studioAutoRotate}
                canvasRef={studioCanvasRef}
                exploded={state.studioExploded}
                instructionSync={state.instructionSync}
                scenePack={session.scenePack}
              />
            </div>

            <div className="studio-stage__scrubber">
              <button className="studio-stage__play" onClick={() => setIsPlaying((current) => !current)} type="button">
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <div className="studio-stage__nav">
                <button
                  disabled={state.activeInstructionStep === 0}
                  onClick={() => setActiveInstructionStep(state.activeInstructionStep - 1)}
                  type="button"
                >
                  <ChevronLeftIcon size={18} />
                </button>
                <div className="studio-stage__track">
                  <span style={{ width: `${progress}%` }} />
                </div>
                <button
                  disabled={state.activeInstructionStep >= totalSteps - 1}
                  onClick={() => setActiveInstructionStep(state.activeInstructionStep + 1)}
                  type="button"
                >
                  <ChevronRightIcon size={18} />
                </button>
              </div>
            </div>
          </StageShell>

          <SupportRail className="studio-rail">
            <HeroCopy
              eyebrow="Current step"
              support={activeInstruction?.detail ?? 'Inspect the current step and parts callout.'}
              title={<h2>{activeInstruction?.title ?? 'Build step'}</h2>}
            />

            <div className="studio-rail__parts">
              <Eyebrow>Parts needed</Eyebrow>
              <div className="studio-rail__parts-grid">
                {stepParts.map((part) => (
                  <div className="studio-part-card" key={`${part.partId}-${part.colorId}`}>
                    <div className="studio-part-card__brick">
                      <BlocksBrick color={part.hex} width={2} />
                    </div>
                    <div>
                      <strong>{part.count}x {part.partName}</strong>
                      <span>{part.colorName}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <BlocksButton onClick={() => setPhase('instructions')} variant="secondary">
              <BookletIcon size={18} />
              Read the Manual
            </BlocksButton>
          </SupportRail>
        </main>
      </div>
    </div>
  );
}
