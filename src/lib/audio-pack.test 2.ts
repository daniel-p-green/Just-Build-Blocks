import { describe, expect, it } from 'vitest';

import {
  AUDIO_PACK_OPTIONS,
  resolveBrowserCueAudioPath,
  resolveStaticCueAudioPath,
} from './audio-pack';

describe('audio pack resolver', () => {
  it('resolves browser paths for the original cue pack', () => {
    expect(resolveBrowserCueAudioPath('upload', 'original')).toBe('/audio/upload.wav');
    expect(resolveBrowserCueAudioPath('hero-reveal', 'original')).toBe('/audio/hero-reveal.wav');
  });

  it('resolves mapped CC0 paths for cues that exist in the alternate pack', () => {
    expect(resolveBrowserCueAudioPath('upload', 'cc0-finds-mapped')).toBe('/audio/cc0-finds/mapped/upload.wav');
    expect(resolveStaticCueAudioPath('resolve', 'cc0-finds-mapped')).toBe('audio/cc0-finds/mapped/resolve.wav');
  });

  it('falls back to the original pack for cues not remapped in the alternate set', () => {
    expect(resolveBrowserCueAudioPath('bed', 'cc0-finds-mapped')).toBe('/audio/bed.wav');
    expect(resolveStaticCueAudioPath('sacred-line', 'cc0-finds-mapped')).toBe('audio/sacred-line.wav');
  });

  it('exposes both selectable audio pack options', () => {
    expect(AUDIO_PACK_OPTIONS.map((option) => option.id)).toEqual(['original', 'cc0-finds-mapped']);
  });
});
