# CC0 Mapped Cue Pack

This folder contains a cue-sized alternate sound pack cut from the CC0 source previews in the parent folder.

It is intentionally non-destructive:
- the current live cues in `/public/audio` are unchanged
- this pack is ready for A/B listening
- `bed` and `sacred-line` are not replaced here

## Mapping

- `upload.wav`: short intake/latch accent
- `quantize.wav`: crisp click cluster for the sort/quantize moment
- `build.wav`: stronger snap for early assembly
- `hero-reveal.wav`: layered hero accent with a harder attack and light tail
- `montage.wav`: restrained rattle bed for the mid-film tactile passage
- `resolve.wav`: quiet settle with a softer tail

## Notes

- Output format is `48kHz`, stereo, `pcm_s16le` WAV.
- Durations were matched to the current shipped cue lengths so they can drop into the same timing without scene edits.
- Source clips came from Freesound pages that were marked `CC0` when downloaded.

## Trying them live

The app and Remotion compositions now support an `audioPack` switch, so this mapped set can be auditioned without overwriting the original files.
