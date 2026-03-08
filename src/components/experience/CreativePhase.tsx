import { BlocksBrick, BlocksButton, Eyebrow, StageShell, SupportRail } from './FlagshipPrimitives';
import { useExperience } from './useExperience';

const getRouteColor = (directionId: string) => {
  if (directionId === 'desk-collectible') {
    return 'red';
  }

  if (directionId === 'night-bench') {
    return 'yellow';
  }

  return 'blue';
};

export function CreativePhase() {
  const { buildDirections, runGeneration, selectBuildDirection, state } = useExperience();
  const activeDirection = buildDirections.find((direction) => direction.id === state.buildDirectionId) ?? buildDirections[0]!;
  const alternateDirections = buildDirections.filter((direction) => direction.id !== activeDirection.id);
  const sourceLabel = state.sourceAsset?.brandName ?? (state.promptForm.brandName || 'Custom concept');

  return (
    <div className="experience-page direction-route flagship-page">
      <div className="flagship-shell flagship-shell--direction">
        <main className="flagship-grid flagship-grid--direction">
          <div className="direction-column">
            <Eyebrow>Choose your build</Eyebrow>
            <StageShell className="direction-stage">
              <div className="direction-stage__visual">
                <div className="direction-stage__brick-cluster">
                  <BlocksBrick className="direction-stage__brick direction-stage__brick--back" color={getRouteColor(activeDirection.id)} width={4} />
                  <BlocksBrick className="direction-stage__brick direction-stage__brick--mid" color="white" width={2} />
                  <BlocksBrick className="direction-stage__brick direction-stage__brick--front" color={getRouteColor(activeDirection.id)} width={1} />
                </div>
              </div>

              <div className="direction-stage__copy">
                <h1>{activeDirection.label}</h1>
                <p>{activeDirection.description}</p>
                <span>{activeDirection.tagline}</span>
              </div>
            </StageShell>

            <div className="direction-stage__footer">
              <div className="source-thumb">
                <div className="source-thumb__preview">
                  {state.sourceAsset ? <img alt="Source preview" src={state.sourceAsset.previewUrl} /> : <BlocksBrick color={getRouteColor(activeDirection.id)} width={2} />}
                </div>
                <span>Source: {sourceLabel}</span>
              </div>
              <BlocksButton
                onClick={() => {
                  void runGeneration();
                }}
                size="lg"
              >
                Build This Set
              </BlocksButton>
            </div>
          </div>

          <SupportRail className="direction-rail">
            <HeroRail directions={alternateDirections} onSelect={selectBuildDirection} />
          </SupportRail>
        </main>
      </div>
    </div>
  );
}

function HeroRail({
  directions,
  onSelect,
}: {
  directions: ReturnType<typeof useExperience>['buildDirections'];
  onSelect: (directionId: ReturnType<typeof useExperience>['buildDirections'][number]['id']) => void;
}) {
  return (
    <>
      <Eyebrow>Alternative lenses</Eyebrow>
      <div className="direction-rail__list">
        {directions.map((direction) => (
          <button className="direction-option" key={direction.id} onClick={() => onSelect(direction.id)} type="button">
            <div className="direction-option__top">
              <span className={`direction-option__dot direction-option__dot--${getRouteColor(direction.id)}`} />
              <strong>{direction.label}</strong>
            </div>
            <p>{direction.description}</p>
            <span>{direction.tagline}</span>
          </button>
        ))}
      </div>
    </>
  );
}
