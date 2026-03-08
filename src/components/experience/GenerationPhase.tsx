import { Eyebrow, StageShell, SupportRail } from './FlagshipPrimitives';
import { useExperience } from './useExperience';

export function GenerationPhase() {
  const { currentStageIndex, generationStages, state } = useExperience();
  const currentStage = generationStages[currentStageIndex];

  return (
    <div className="experience-page generation-route flagship-page flagship-page--immersive">
      <div className="flagship-shell flagship-shell--generation">
        <main className="flagship-grid flagship-grid--generation">
          <StageShell className="generation-stage" glow="ink">
            <div className="generation-stage__visual">
              <div className={currentStageIndex >= 3 ? 'generation-stage__package-outline active' : 'generation-stage__package-outline'} />
              <div className="generation-stage__artifact">
                {state.sourceAsset ? (
                  <img alt="Source artifact" className={currentStageIndex >= 2 ? 'active' : ''} src={state.sourceAsset.previewUrl} />
                ) : (
                  <div className="generation-stage__placeholder" />
                )}
              </div>
              <div className="generation-stage__grid" aria-hidden="true" />
            </div>
            <div className="generation-stage__status">
              <Eyebrow>Building your set</Eyebrow>
              <h1>{currentStage?.label ?? 'Preparing your set'}</h1>
              <p>{currentStage?.detail ?? 'Preparing your set.'}</p>
            </div>
          </StageShell>

          <SupportRail className="generation-rail">
            <Eyebrow>Build progress</Eyebrow>
            <ul className="generation-rail__list" aria-label="Generation progress">
              {generationStages.map((stage, index) => (
                <li
                  className={index <= currentStageIndex ? 'generation-rail__item active' : 'generation-rail__item'}
                  key={stage.id}
                >
                  <span className="generation-rail__marker" aria-hidden="true" />
                  <span>{stage.label}</span>
                </li>
              ))}
            </ul>
            {state.error ? <p className="error-banner">{state.error}</p> : null}
          </SupportRail>
        </main>
      </div>
    </div>
  );
}
