import { describe, expect, it, vi } from 'vitest';

import { getRevealClipFileExtension, pickRevealRecorderMimeType } from './reveal-renderer';

describe('pickRevealRecorderMimeType', () => {
  it('prefers vp9 when the browser reports support for it', () => {
    const mediaRecorder = {
      isTypeSupported: vi.fn((mimeType: string) => mimeType === 'video/webm;codecs=vp9'),
    };

    expect(pickRevealRecorderMimeType(mediaRecorder as unknown as typeof MediaRecorder)).toBe(
      'video/webm;codecs=vp9',
    );
  });

  it('falls back through the candidate list when newer codecs are unavailable', () => {
    const mediaRecorder = {
      isTypeSupported: vi.fn((mimeType: string) => mimeType === 'video/webm'),
    };

    expect(pickRevealRecorderMimeType(mediaRecorder as unknown as typeof MediaRecorder)).toBe('video/webm');
  });

  it('returns undefined when capability detection is not available', () => {
    expect(pickRevealRecorderMimeType(undefined)).toBeUndefined();
  });
});

describe('getRevealClipFileExtension', () => {
  it('maps mp4 recorder output to an mp4 download extension', () => {
    expect(getRevealClipFileExtension('video/mp4;codecs=h264')).toBe('mp4');
  });

  it('defaults to webm when the recorder type is absent or webm-based', () => {
    expect(getRevealClipFileExtension(undefined)).toBe('webm');
    expect(getRevealClipFileExtension('video/webm;codecs=vp8')).toBe('webm');
  });
});
