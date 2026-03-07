export const AUDIO_CUE_IDS = [
  'bed',
  'upload',
  'quantize',
  'build',
  'hero-reveal',
  'sacred-line',
  'montage',
  'resolve',
] as const;

export type AudioCueId = (typeof AUDIO_CUE_IDS)[number];

export const AUDIO_PACK_IDS = ['original', 'cc0-finds-mapped'] as const;

export type AudioPackId = (typeof AUDIO_PACK_IDS)[number];

const ORIGINAL_AUDIO_BASE_PATH = 'audio';

const AUDIO_PACK_BASE_PATHS: Record<AudioPackId, string> = {
  original: ORIGINAL_AUDIO_BASE_PATH,
  'cc0-finds-mapped': 'audio/cc0-finds/mapped',
};

const AUDIO_PACK_MAPPED_CUES: Record<AudioPackId, ReadonlySet<AudioCueId>> = {
  original: new Set(AUDIO_CUE_IDS),
  'cc0-finds-mapped': new Set([
    'upload',
    'quantize',
    'build',
    'hero-reveal',
    'montage',
    'resolve',
  ]),
};

export const AUDIO_PACK_OPTIONS: Array<{
  id: AudioPackId;
  label: string;
  description: string;
}> = [
  {
    id: 'original',
    label: 'Signature soundtrack',
    description: 'The full launch-style cue set for the reveal.',
  },
  {
    id: 'cc0-finds-mapped',
    label: 'Tactile alt mix',
    description: 'A freer percussive mix with the signature voice cues still in place.',
  },
];

const resolveCueBasePath = (cueId: AudioCueId, audioPack: AudioPackId) =>
  AUDIO_PACK_MAPPED_CUES[audioPack].has(cueId)
    ? AUDIO_PACK_BASE_PATHS[audioPack]
    : ORIGINAL_AUDIO_BASE_PATH;

export const resolveStaticCueAudioPath = (cueId: AudioCueId, audioPack: AudioPackId = 'original') =>
  `${resolveCueBasePath(cueId, audioPack)}/${cueId}.wav`;

export const resolveBrowserCueAudioPath = (cueId: AudioCueId, audioPack: AudioPackId = 'original') =>
  `/${resolveStaticCueAudioPath(cueId, audioPack)}`;

export const getAudioPackBasePath = (audioPack: AudioPackId = 'original') => AUDIO_PACK_BASE_PATHS[audioPack];
