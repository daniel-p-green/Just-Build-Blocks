import { describe, expect, it } from 'vitest';

import { BLOCK_TABLE_COLORS, OPENAI_SANS_FAMILY } from './brand-system';

describe('brand system', () => {
  it('pins the app to OpenAI Sans and the core primary-color block palette', () => {
    expect(OPENAI_SANS_FAMILY).toContain('OpenAI Sans');
    expect(BLOCK_TABLE_COLORS.signalRed).toBe('#C4281C');
    expect(BLOCK_TABLE_COLORS.orbitBlue).toBe('#0055BF');
    expect(BLOCK_TABLE_COLORS.brightYellow).toBe('#FFD500');
    expect(BLOCK_TABLE_COLORS.builderGreen).toBe('#00C853');
  });
});
