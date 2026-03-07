import { describe, expect, it } from 'vitest';

import {
  buildPromptConceptPlaceholder,
  normalizeConceptInput,
  slugToBuilderId,
} from './concept-input';

describe('normalizeConceptInput', () => {
  it('normalizes image uploads into a shared source contract', () => {
    const normalized = normalizeConceptInput({
      kind: 'image',
      brandName: 'OpenAI Blocks',
      fileMeta: {
        fileName: 'openai-blocks.png',
      },
    });

    expect(normalized.kind).toBe('image');
    expect(normalized.brandName).toBe('OpenAI Blocks');
    expect(normalized.fileMeta?.fileName).toBe('openai-blocks.png');
  });

  it('keeps prompt concepts deterministic and ready for placeholder art generation', () => {
    const normalized = normalizeConceptInput({
      kind: 'prompt',
      prompt: 'A confident block-built weather station for OpenAI.',
      brandName: 'OpenAI Weather',
      promptConcept: {
        brandName: 'OpenAI Weather',
        boxTitle: 'OpenAI Weather',
        boxSubtitle: 'Forecast builder',
        promptSummary: 'A blue and yellow signal tower with playful weather pieces.',
        badgeSerial: 'B-205',
        metadataFlavor: 'signal-build',
        coverConcept: {
          motif: 'signal tower',
          accentColors: ['#0055BF', '#FFD500', '#FFFFFF'],
          caption: 'A buildable forecast machine with bright signal lines.',
        },
        worldConcept: 'A rooftop weather station made from crisp primary blocks.',
      },
    });

    expect(normalized.kind).toBe('prompt');
    expect(normalized.promptConcept?.boxTitle).toBe('OpenAI Weather');
    expect(slugToBuilderId(normalized.brandName)).toBe('openai-weather');
    expect(buildPromptConceptPlaceholder(normalized)).toContain('<svg');
    expect(buildPromptConceptPlaceholder(normalized)).toContain('OpenAI Weather');
  });
});
