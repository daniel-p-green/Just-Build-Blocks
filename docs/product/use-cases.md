# Use Cases: Just Build with Blocks Signature Product

Date: 2026-03-06
Repository: Just-Build-Blocks

## Primary Use Cases

### UC-1: Image to complete set

- Actor: creative builder or brand reviewer
- Trigger: they want to turn a known logo into a premium buildable set
- Preconditions: they have a recognizable image asset ready to upload
- Main flow:
1. User uploads a logo or brand image.
2. The app generates a buildable set identity, premium set-box view, and guided 3D studio state.
3. The app shows instruction phases, manifests, and exports.
4. The user downloads the bundle or renders the film.
- Expected result: the user leaves with a believable set, original wrapper, export bundle, and film-ready artifact set.

### UC-2: Name or prompt to complete set

- Actor: creative reviewer without a prepared image
- Trigger: they want to test a brand name or concept directly
- Preconditions: prompt generation is available
- Main flow:
1. User enters a brand name or short descriptive prompt.
2. The app normalizes the prompt into a set concept and build pipeline.
3. The user reaches the same box, studio, instruction, and export surfaces as image input.
- Expected result: prompt input feels first-class rather than like a weaker fallback.

### UC-3: Internal flagship review

- Actor: internal OpenAI/Codex stakeholder
- Trigger: they want a polished artifact that explains the product without a long walkthrough
- Preconditions: at least one strong set has already been generated
- Main flow:
1. Reviewer opens the generated set.
2. Reviewer inspects the first-frame box art, studio phases, instructions, and exports.
3. Reviewer renders or watches the Remotion film with sound.
- Expected result: the product reads as complete, premium, and memorable.

## Edge Cases

### EC-1

- Scenario: the uploaded image has large transparent regions or awkward empty space.
- System behavior: transparent pixels are ignored and the set composition keeps the hero silhouette centered and readable.
- User-visible response: the object still feels intentional rather than washed out or sparse.

### EC-2

- Scenario: the brand is provided only by name and the prompt is vague.
- System behavior: the pipeline still produces a disciplined set identity with defaults tuned to premium collectible quality.
- User-visible response: the result feels coherent rather than random.

## Failure Cases

### FC-1

- Failure mode: unsupported or unreadable file.
- Detection: file type validation or image decode failure.
- Recovery path: show a short error message and keep the input flow available.

### FC-2

- Failure mode: the generated model is not export-safe because of invalid transforms, missing parts, or broken assembly references.
- Detection: model and export validation checks fail.
- Recovery path: block final export, report the issue clearly, and preserve the rest of the session state for debugging.

### FC-3

- Failure mode: film or sound generation falls short of the quality bar.
- Detection: render failure, missing cues, or obvious sync mismatch during verification.
- Recovery path: keep still, studio, and export surfaces usable while marking film output as incomplete.
