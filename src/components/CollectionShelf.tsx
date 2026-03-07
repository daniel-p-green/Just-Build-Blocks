import { useEffect, useRef } from 'react';

import { drawHeroCanvas } from '../lib/hero-renderer';
import type { CollectionPack } from '../lib/collection-pack';

type CollectionShelfProps = {
  activeSku: string;
  collectionPack: CollectionPack;
  onOpenCommission: () => void;
  onSelectSet: (sku: string) => void;
};

type CollectionCardProps = {
  active: boolean;
  item: CollectionPack['sets'][number];
  onSelect: () => void;
};

function CollectionCard({ active, item, onSelect }: CollectionCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    drawHeroCanvas(canvas, item.scenePack);
  }, [item.scenePack]);

  return (
    <button
      className={active ? 'collection-card active' : 'collection-card'}
      onClick={onSelect}
      type="button"
    >
      <canvas
        className="collection-card-canvas"
        height={item.scenePack.visual.canvasSize.height}
        ref={canvasRef}
        width={item.scenePack.visual.canvasSize.width}
      />
      <div className="collection-card-copy">
        <span>{item.spec.sku}</span>
        <strong>{item.spec.coverTitle}</strong>
        <p>{item.spec.coverSubtitle}</p>
      </div>
    </button>
  );
}

export function CollectionShelf({
  activeSku,
  collectionPack,
  onOpenCommission,
  onSelectSet,
}: CollectionShelfProps) {
  const featured =
    collectionPack.sets.find((item) => item.spec.sku === activeSku) ?? collectionPack.sets[0];

  if (!featured) {
    return null;
  }

  return (
    <div className="collection-landing">
      <header className="collection-hero">
        <div className="collection-copy">
          <div className="blocks-badge">BLOCKS</div>
          <p className="eyebrow">{collectionPack.collection.launchLine}</p>
          <h1>{collectionPack.collection.shelfHeadline}</h1>
          <p>{collectionPack.collection.shelfSupport}</p>
          <div className="collection-actions">
            <button className="primary-action" onClick={() => onSelectSet(featured.spec.sku)} type="button">
              Open {featured.spec.sku}
            </button>
            <button className="collection-secondary" onClick={onOpenCommission} type="button">
              {collectionPack.collection.commissionHeadline}
            </button>
          </div>
        </div>

        <aside className="collection-feature-card">
          <div className="collection-feature-kicker">
            <span>Featured SKU</span>
            <strong>{featured.spec.sku}</strong>
          </div>
          <h2>{featured.spec.coverTitle}</h2>
          <p>{featured.spec.shelfBlurb}</p>
          <div className="collection-feature-grid">
            <article>
              <span>Pieces</span>
              <strong>{featured.scenePack.instructions.countTotals.totalPieces}</strong>
            </article>
            <article>
              <span>Archetype</span>
              <strong>{featured.spec.archetype}</strong>
            </article>
            <article>
              <span>Line</span>
              <strong>{collectionPack.collection.launchLine}</strong>
            </article>
          </div>
        </aside>
      </header>

      <section className="collection-shelf" aria-label="Signature collection">
        {collectionPack.sets.map((item) => (
          <CollectionCard
            active={item.spec.sku === activeSku}
            item={item}
            key={item.spec.sku}
            onSelect={() => onSelectSet(item.spec.sku)}
          />
        ))}
      </section>

      <section className="collection-comparison" aria-label="Collection comparison">
        {collectionPack.comparisonRows.map((row) => (
          <article className="collection-comparison-card" key={row.sku}>
            <span
              aria-hidden="true"
              className="collection-comparison-accent"
              style={{ backgroundColor: row.accentColor }}
            />
            <div>
              <span className="eyebrow">{row.sku}</span>
              <strong>{row.title}</strong>
            </div>
            <div className="collection-comparison-meta">
              <span>{row.archetype}</span>
              <strong>{row.pieces} pcs</strong>
            </div>
          </article>
        ))}
      </section>

      <section className="collection-footer">
        <article className="collection-note">
          <span className="eyebrow">Collection line</span>
          <strong>{collectionPack.collection.name}</strong>
          <p>{collectionPack.collection.description}</p>
        </article>
        <article className="collection-note">
          <span className="eyebrow">Trailer</span>
          <strong>{collectionPack.trailer.title}</strong>
          <p>{collectionPack.trailer.beats.join(' · ')}</p>
        </article>
      </section>
    </div>
  );
}
