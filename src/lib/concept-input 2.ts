import { z } from 'zod';

const HEX_COLOR_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

export const PromptConceptSchema = z.object({
  brandName: z.string().min(1),
  boxTitle: z.string().min(1),
  boxSubtitle: z.string().min(1),
  promptSummary: z.string().min(1),
  badgeSerial: z.string().min(1),
  metadataFlavor: z.string().min(1),
  coverConcept: z.object({
    motif: z.string().min(1),
    accentColors: z.array(z.string().regex(HEX_COLOR_PATTERN)).min(3).max(4),
    caption: z.string().min(1),
  }),
  worldConcept: z.string().min(1),
});

export type PromptConcept = z.infer<typeof PromptConceptSchema>;

export const ConceptInputSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('image'),
    brandName: z.string().min(1),
    prompt: z.undefined().optional(),
    fileMeta: z
      .object({
        fileName: z.string().min(1),
        mimeType: z.string().optional(),
      })
      .optional(),
    promptConcept: z.undefined().optional(),
  }),
  z.object({
    kind: z.literal('prompt'),
    brandName: z.string().min(1),
    prompt: z.string().min(1),
    fileMeta: z
      .object({
        fileName: z.string().min(1).optional(),
        mimeType: z.string().optional(),
      })
      .optional(),
    promptConcept: PromptConceptSchema.optional(),
  }),
]);

export type ConceptInput = z.infer<typeof ConceptInputSchema>;

const escapeXml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

export const slugToBuilderId = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const normalizeText = (value: string) => value.trim().replace(/\s+/g, ' ');

const titleCase = (value: string) =>
  normalizeText(value)
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');

export const normalizeConceptInput = (input: ConceptInput): ConceptInput => {
  const normalizedBrandName = titleCase(input.brandName);

  if (input.kind === 'image') {
    return {
      ...input,
      brandName: normalizedBrandName,
      fileMeta: input.fileMeta
        ? {
            ...input.fileMeta,
            fileName: normalizeText(input.fileMeta.fileName),
          }
        : undefined,
    };
  }

  return {
    ...input,
    brandName: normalizedBrandName,
    prompt: normalizeText(input.prompt),
    promptConcept: input.promptConcept
      ? {
          ...input.promptConcept,
          brandName: titleCase(input.promptConcept.brandName),
          boxTitle: titleCase(input.promptConcept.boxTitle),
          boxSubtitle: normalizeText(input.promptConcept.boxSubtitle),
          promptSummary: normalizeText(input.promptConcept.promptSummary),
          badgeSerial: normalizeText(input.promptConcept.badgeSerial).toUpperCase(),
          metadataFlavor: normalizeText(input.promptConcept.metadataFlavor),
          coverConcept: {
            ...input.promptConcept.coverConcept,
            motif: normalizeText(input.promptConcept.coverConcept.motif),
            caption: normalizeText(input.promptConcept.coverConcept.caption),
          },
          worldConcept: normalizeText(input.promptConcept.worldConcept),
        }
      : undefined,
  };
};

const fallbackPromptConcept = (input: Extract<ConceptInput, { kind: 'prompt' }>): PromptConcept => {
  const slug = slugToBuilderId(input.brandName || input.prompt);
  const serialSeed = slug
    .split('')
    .reduce((total, character) => total + character.charCodeAt(0), 0)
    .toString()
    .slice(-3)
    .padStart(3, '0');

  return {
    brandName: input.brandName,
    boxTitle: input.brandName,
    boxSubtitle: 'Idea build',
    promptSummary: input.prompt,
    badgeSerial: `B-${serialSeed}`,
    metadataFlavor: 'concept-build',
    coverConcept: {
      motif: 'signal stack',
      accentColors: ['#0055BF', '#FFD500', '#C4281C'],
      caption: 'A custom block build sparked from one idea.',
    },
    worldConcept: `A bright block-set world inspired by ${input.brandName}.`,
  };
};

export const buildPromptConceptPlaceholder = (input: ConceptInput) => {
  if (input.kind !== 'prompt') {
    throw new Error('Prompt placeholder art requires a prompt-based concept input.');
  }

  const normalized = normalizeConceptInput(input) as Extract<ConceptInput, { kind: 'prompt' }>;
  const promptConcept = normalized.promptConcept ?? fallbackPromptConcept(normalized);
  const [primary, secondary, accent] = promptConcept.coverConcept.accentColors;
  const badge = escapeXml(promptConcept.badgeSerial);
  const title = escapeXml(promptConcept.boxTitle);
  const subtitle = escapeXml(promptConcept.boxSubtitle);
  const caption = escapeXml(promptConcept.coverConcept.caption);
  const motif = escapeXml(promptConcept.coverConcept.motif.toUpperCase());

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img" aria-label="${title}">
  <defs>
    <linearGradient id="shell" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#f9fbfd" />
      <stop offset="100%" stop-color="#edf2f7" />
    </linearGradient>
    <linearGradient id="stage" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#0b4ca8" />
      <stop offset="100%" stop-color="#0055BF" />
    </linearGradient>
    <linearGradient id="badge" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#f44336" />
      <stop offset="100%" stop-color="#C4281C" />
    </linearGradient>
  </defs>
  <rect width="1200" height="675" rx="40" fill="url(#shell)" />
  <rect x="88" y="76" width="1024" height="523" rx="44" fill="url(#stage)" />
  <rect x="120" y="112" width="196" height="126" rx="26" fill="url(#badge)" stroke="#101828" stroke-opacity="0.16" />
  <text x="218" y="186" fill="#fffef8" font-family="OpenAI Sans, Avenir Next, Arial, sans-serif" font-size="58" font-style="italic" font-weight="700" text-anchor="middle">BLOCKS</text>
  <text x="140" y="286" fill="#ffffff" fill-opacity="0.95" font-family="OpenAI Sans, Avenir Next, Arial, sans-serif" font-size="28" font-weight="700">Builder age</text>
  <text x="140" y="330" fill="#ffffff" font-family="OpenAI Sans, Avenir Next, Arial, sans-serif" font-size="92" font-weight="700">12+</text>
  <text x="140" y="384" fill="#ffffff" fill-opacity="0.9" font-family="OpenAI Sans, Avenir Next, Arial, sans-serif" font-size="28">${badge}</text>
  <text x="140" y="434" fill="#ffffff" fill-opacity="0.78" font-family="OpenAI Sans, Avenir Next, Arial, sans-serif" font-size="22">${motif}</text>
  <g transform="translate(390 118)">
    <rect x="0" y="0" width="650" height="370" rx="34" fill="#0b1320" fill-opacity="0.16" />
    <rect x="34" y="28" width="582" height="318" rx="28" fill="#ffffff" fill-opacity="0.08" />
    <rect x="104" y="192" width="122" height="122" rx="28" fill="${primary}" />
    <rect x="220" y="126" width="138" height="188" rx="30" fill="${secondary}" />
    <rect x="338" y="164" width="126" height="150" rx="28" fill="${accent}" />
    <rect x="454" y="102" width="98" height="212" rx="28" fill="#ffffff" />
    <circle cx="170" cy="138" r="18" fill="#ffffff" fill-opacity="0.36" />
    <circle cx="286" cy="76" r="18" fill="#ffffff" fill-opacity="0.36" />
    <circle cx="404" cy="114" r="18" fill="#ffffff" fill-opacity="0.36" />
    <circle cx="504" cy="54" r="18" fill="#ffffff" fill-opacity="0.36" />
  </g>
  <text x="392" y="540" fill="#ffffff" font-family="OpenAI Sans, Avenir Next, Arial, sans-serif" font-size="82" font-weight="700">${title}</text>
  <text x="394" y="584" fill="#dce7ff" font-family="OpenAI Sans, Avenir Next, Arial, sans-serif" font-size="28" font-weight="600">${subtitle}</text>
  <text x="392" y="622" fill="#dce7ff" font-family="OpenAI Sans, Avenir Next, Arial, sans-serif" font-size="22">${caption}</text>
</svg>`.trim();
};

export const buildPromptConceptDataUrl = (input: ConceptInput) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(buildPromptConceptPlaceholder(input))}`;
