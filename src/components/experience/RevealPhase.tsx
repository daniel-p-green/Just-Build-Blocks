import type { MutableRefObject } from 'react';

import {
  ActionCluster,
  BlocksButton,
  BlocksPackage,
  BrickCountIcon,
  BookletIcon,
  HeroCopy,
  MetadataChips,
  RotateIcon,
  StageShell,
  SupportRail,
} from './FlagshipPrimitives';
import { getRevealViewModel } from './desktopPresentation';
import { useExperience } from './useExperience';

export function RevealPhase({
  heroCanvasRef,
}: {
  heroCanvasRef: MutableRefObject<HTMLCanvasElement | null>;
}) {
  const { resetExperience, setActiveInstructionStep, setPhase, setStudioAutoRotate, state } = useExperience();
  const session = state.session;

  if (!session) {
    return null;
  }

  const viewModel = getRevealViewModel(session.scenePack);
  const chipIcons = [<BrickCountIcon key="pieces" />, null, null];

  return (
    <div className="experience-page reveal-route flagship-page">
      <div className="flagship-shell flagship-shell--reveal">
        <main className="flagship-grid flagship-grid--reveal">
          <StageShell className="reveal-stage">
            <div className="reveal-stage__package">
              <BlocksPackage canvasRef={heroCanvasRef} className="reveal-stage__package-card" scenePack={session.scenePack} />
            </div>
            <p className="stage-caption">{viewModel.caption}</p>
          </StageShell>

          <SupportRail className="reveal-rail">
            <HeroCopy
              eyebrow={viewModel.eyebrow}
              support={viewModel.support}
              title={<h1>{viewModel.title}</h1>}
            />

            <MetadataChips
              items={viewModel.chips.map((chip, index) => ({
                icon: chipIcons[index] ?? undefined,
                label: chip.label,
                value: chip.value,
              }))}
            />

            <article className="story-card">
              <strong>{viewModel.storyTitle}</strong>
              <p>{viewModel.storyBody}</p>
            </article>

            <ActionCluster>
              <BlocksButton
                onClick={() => {
                  setActiveInstructionStep(session.scenePack.instructions.steps.length - 1);
                  setStudioAutoRotate(true);
                  setPhase('studio');
                }}
                size="lg"
              >
                <RotateIcon size={18} />
                Explore Build
              </BlocksButton>
              <div className="action-cluster__row">
                <BlocksButton onClick={() => setPhase('instructions')} variant="secondary">
                  <BookletIcon size={18} />
                  Read the Manual
                </BlocksButton>
                <BlocksButton onClick={() => setPhase('keepsakes')} variant="secondary">
                  Keep the Set
                </BlocksButton>
              </div>
              <BlocksButton className="reveal-rail__reset" onClick={resetExperience} variant="text">
                Build Another Set
              </BlocksButton>
            </ActionCluster>
          </SupportRail>
        </main>
      </div>
    </div>
  );
}
