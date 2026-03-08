import { BlocksBrick, BlocksButton, BlocksPackage, Eyebrow, MetadataChips } from './FlagshipPrimitives';
import { getInstructionsViewModel } from './desktopPresentation';
import { useExperience } from './useExperience';

export function InstructionsPhase() {
  const { downloadInstructionsArtifact, setPhase, state } = useExperience();
  const session = state.session;

  if (!session) {
    return null;
  }

  const viewModel = getInstructionsViewModel(session.scenePack);

  return (
    <div className="experience-page instructions-route flagship-page">
      <div className="flagship-shell flagship-shell--instructions">
        <div className="floating-actions">
          <BlocksButton onClick={() => setPhase('studio')} size="sm" variant="secondary">
            Back to Studio
          </BlocksButton>
          <div className="floating-actions__row">
            <BlocksButton onClick={downloadInstructionsArtifact} size="sm" variant="secondary">
              Download PDF
            </BlocksButton>
            <BlocksButton onClick={() => setPhase('keepsakes')} size="sm">
              Keep the Set
            </BlocksButton>
          </div>
        </div>

        <main className="instructions-flow">
          <section className="instruction-cover">
            <div className="instruction-cover__copy">
              <Eyebrow>{viewModel.eyebrow}</Eyebrow>
              <h1>{viewModel.title}</h1>
              <p>{viewModel.support}</p>
              <MetadataChips items={viewModel.chips} />
            </div>
            <div className="instruction-cover__art">
              <BlocksPackage className="instruction-cover__package" scenePack={session.scenePack} variant="poster" />
            </div>
          </section>

          <section className="instruction-steps">
            {session.scenePack.instructions.steps.map((step, index) => (
              <article className="instruction-step" key={step.id}>
                <div className="instruction-step__header">
                  <span className="instruction-step__number">{index + 1}</span>
                  <div className="instruction-step__copy">
                    <h2>{step.title}</h2>
                    <p>{step.detail}</p>
                  </div>
                  <div className="instruction-step__parts">
                    {step.partsNeeded.map((part) => (
                      <div className="instruction-part-chip" key={`${step.id}-${part.partId}-${part.colorId}`}>
                        <BlocksBrick color={part.hex} width={1} />
                        <span>{part.count}x {part.partName}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="instruction-step__diagram">
                  <div className="instruction-step__diagram-cluster">
                    {step.partsNeeded.slice(0, 3).map((part, partIndex) => (
                      <BlocksBrick
                        className={`instruction-step__diagram-brick instruction-step__diagram-brick--${partIndex}`}
                        color={part.hex}
                        key={`${step.id}-diagram-${part.partId}-${partIndex}`}
                        width={Math.min(4, Math.max(1, part.count))}
                      />
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}
