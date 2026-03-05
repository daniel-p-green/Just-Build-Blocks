# Use Cases: Just Build with Blocks MVP

Date: 2026-03-05
Repository: Just-Build-Blocks

## Primary Use Cases

### UC-1: Happy Path

- Actor: creative non-technical user
- Trigger: they want to see a logo transformed into something playful and cinematic
- Preconditions: they have a supported logo file ready to upload
- Main flow:
1. User uploads a logo image.
2. The app computes a block grid, renders a hero still, and displays block counts.
3. The app shows three story arcs and lets the user export the generated assets.
- Expected result: the user leaves with a polished still and Remotion-ready concept data.

### UC-2: Common Variation

- Actor: internal OpenAI/Codex reviewer
- Trigger: they want a fast concept proof for a storytelling review
- Preconditions: they have an example brand mark to test with
- Main flow:
1. Reviewer uploads a recognizable logo.
2. Reviewer tweaks density or visual preset if needed.
3. Reviewer exports the still and uses the storyboard output to plan a concept film.
- Expected result: the idea is tangible enough to discuss direction without debating implementation details.

## Edge Cases

### EC-1

- Scenario: the uploaded logo has a transparent background and a lot of empty space.
- System behavior: transparent pixels are ignored during color averaging.
- User-visible response: the brand mark stays crisp instead of being washed out by transparent regions.

### EC-2

- Scenario: the uploaded logo is extremely wide or tall.
- System behavior: the grid preserves aspect ratio and scales the hero layout to fit.
- User-visible response: the result still feels composed rather than stretched or cropped awkwardly.

## Failure Cases

### FC-1

- Failure mode: unsupported or unreadable file.
- Detection: file type validation or image decode failure.
- Recovery path: show a short error message and keep the upload action available.

### FC-2

- Failure mode: the generated still is too sparse because the source image is mostly transparent or low resolution.
- Detection: low visible block count or empty grid after processing.
- Recovery path: prompt the user to try a larger or less transparent source asset.
