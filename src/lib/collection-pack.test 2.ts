import { describe, expect, it } from 'vitest';

import { buildCollectionPack, SIGNATURE_COLLECTION_SPEC } from './collection-pack';
import { ScenePackSchema } from './scene-pack';

describe('buildCollectionPack', () => {
  it('builds the four launch SKUs in the declared order with deterministic trailer metadata', () => {
    const pack = buildCollectionPack();

    expect(pack.collection.name).toBe('BLOCKS Signature Collection');
    expect(pack.collection.featuredSku).toBe('COD-001');
    expect(pack.sets.map((item) => item.spec.sku)).toEqual(
      SIGNATURE_COLLECTION_SPEC.sets.map((item) => item.sku),
    );
    expect(pack.comparisonRows.map((row) => row.sku)).toEqual([
      'COD-001',
      'BLM-001',
      'AIC-001',
      'KC-001',
    ]);
    expect(pack.trailer.title).toBe('BLOCKS Signature Collection Trailer');
    expect(pack.trailer.durationSeconds).toBeGreaterThanOrEqual(45);
  });

  it('produces schema-valid per-set consumer projections with real export bundle data', () => {
    const pack = buildCollectionPack({
      revealMode: 'imagination',
      visualPresetId: 'primary-play',
    });

    pack.sets.forEach((item) => {
      expect(ScenePackSchema.safeParse(item.scenePack).success).toBe(true);
      expect(item.realSet.validation.valid).toBe(true);
      expect(item.scenePack.setIdentity.sku).toBe(item.spec.sku);
      expect(item.scenePack.setIdentity.launchLine).toBe(item.spec.launchLine);
      expect(item.scenePack.setIdentity.accentColor).toBe(item.spec.accentColor);
      expect(item.scenePack.instructions.bookTitle).toContain(item.spec.coverTitle);
      expect(item.realSet.exportBundle.mpdFileName).toContain(item.spec.sku.toLowerCase());
      expect(item.realSet.exportBundle.ioFileName).toContain(item.spec.sku.toLowerCase());
      expect(item.instructionBook.spreads.length).toBe(item.scenePack.instructions.steps.length + 1);
    });
  });
});
