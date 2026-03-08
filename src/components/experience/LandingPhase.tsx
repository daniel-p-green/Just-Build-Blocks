import { useRef } from 'react';

import {
  BlocksButton,
  BlocksPackage,
  Eyebrow,
  HeroCopy,
  StageShell,
} from './FlagshipPrimitives';
import { useExperience } from './useExperience';

export function LandingPhase() {
  const { collectionPack, openExample, openInput } = useExperience();
  const examplesRef = useRef<HTMLElement | null>(null);
  const featuredSet = collectionPack.sets[0];

  return (
    <div className="experience-page landing-route flagship-page">
      <div className="flagship-shell flagship-shell--landing">
        <main className="flagship-grid flagship-grid--landing">
          <div className="route-copy route-copy--landing">
            <HeroCopy
              eyebrow="Just Build with Blocks"
              support="Turn a logo, icon, or concept into a believable collectible set with packaging, instructions, and keepsakes."
              title={<h1>Start with a mark. End with a set.</h1>}
            />

            <div className="route-copy__actions">
              <BlocksButton onClick={openInput} size="lg">
                Start Building
              </BlocksButton>
              <BlocksButton
                onClick={() => examplesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                size="lg"
                variant="ghost"
              >
                See Examples
              </BlocksButton>
            </div>
          </div>

          <StageShell className="landing-stage">
            {featuredSet ? (
              <>
                <div className="landing-stage__package">
                  <BlocksPackage className="landing-stage__package-card" scenePack={featuredSet.scenePack} />
                </div>
                <p className="stage-caption">
                  {featuredSet.scenePack.setIdentity.sku} • {featuredSet.scenePack.box.heroCaption}
                </p>
              </>
            ) : null}
          </StageShell>
        </main>

        <section className="examples-strip" ref={examplesRef}>
          <div className="examples-strip__header">
            <Eyebrow>Featured Builds</Eyebrow>
            <h2>Three ways the same product line can land.</h2>
          </div>
          <div className="examples-strip__grid">
            {collectionPack.sets.slice(0, 3).map((item) => (
              <article className="example-card" key={item.spec.sku}>
                <div className="example-card__visual">
                  <BlocksPackage className="example-card__package" scenePack={item.scenePack} variant="poster" />
                </div>
                <div className="example-card__copy">
                  <div>
                    <Eyebrow>{item.spec.sku}</Eyebrow>
                    <h3>{item.spec.coverTitle}</h3>
                  </div>
                  <p>{item.spec.archetype}</p>
                  <span>{item.scenePack.instructions.countTotals.totalPieces} pcs</span>
                </div>
                <BlocksButton onClick={() => openExample(item.spec.sku)} size="sm" variant="text">
                  View {item.spec.coverTitle}
                </BlocksButton>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
