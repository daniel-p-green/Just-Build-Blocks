import { PromptConceptSchema, type PromptConcept } from '../src/lib/concept-input';

const PROMPT_CONCEPT_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'brandName',
    'boxTitle',
    'boxSubtitle',
    'promptSummary',
    'badgeSerial',
    'metadataFlavor',
    'coverConcept',
    'worldConcept',
  ],
  properties: {
    brandName: { type: 'string' },
    boxTitle: { type: 'string' },
    boxSubtitle: { type: 'string' },
    promptSummary: { type: 'string' },
    badgeSerial: { type: 'string' },
    metadataFlavor: { type: 'string' },
    worldConcept: { type: 'string' },
    coverConcept: {
      type: 'object',
      additionalProperties: false,
      required: ['motif', 'accentColors', 'caption'],
      properties: {
        motif: { type: 'string' },
        accentColors: {
          type: 'array',
          minItems: 3,
          maxItems: 4,
          items: { type: 'string' },
        },
        caption: { type: 'string' },
      },
    },
  },
} as const;

const SYSTEM_PROMPT = `
You turn plain-language product ideas into delightful custom building-block set concepts.

Return JSON only. Never reference LEGO or copy real product packaging language.
The result must feel like an original "BLOCKS" set designed with OpenAI clarity and playful building energy.

Rules:
- Keep titles short and memorable.
- Make the subtitle feel like an original set name, not a tagline.
- Make the prompt summary concrete and cinematic.
- badgeSerial must look like B-123.
- metadataFlavor should be 1-3 lowercase words joined with hyphens.
- coverConcept.accentColors must be 3 or 4 hex colors chosen from primary-friendly tones.
- Keep worldConcept one sentence.
- Avoid trademarks and official toy-brand terms.
`.trim();

export type ConceptRequest = {
  brandName?: string;
  prompt: string;
};

export type ConceptServiceResult =
  | {
      ok: true;
      concept: PromptConcept;
      model: string;
    }
  | {
      ok: false;
      status: number;
      error: string;
    };

const normalizeBrandName = (brandName: string | undefined, prompt: string) => {
  if (brandName?.trim()) {
    return brandName.trim();
  }

  const words = prompt
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .map((word) => word.replace(/[^a-z0-9]/gi, ''))
    .filter(Boolean)
    .map((word) => word[0]!.toUpperCase() + word.slice(1).toLowerCase());

  return words.join(' ') || 'Custom Blocks';
};

const extractOutputText = (payload: unknown): string | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const response = payload as {
    output_text?: unknown;
    output?: Array<{
      content?: Array<{
        type?: string;
        text?: string;
      }>;
    }>;
  };

  if (typeof response.output_text === 'string' && response.output_text.trim()) {
    return response.output_text;
  }

  return (
    response.output
      ?.flatMap((item) => item.content ?? [])
      .find((content) => content.type === 'output_text' || typeof content.text === 'string')
      ?.text ?? null
  );
};

export const isConceptServiceConfigured = (environment = process.env) =>
  Boolean(environment.OPENAI_API_KEY);

export const generatePromptConcept = async (
  request: ConceptRequest,
  environment = process.env,
): Promise<ConceptServiceResult> => {
  const brandName = normalizeBrandName(request.brandName, request.prompt);

  if (!isConceptServiceConfigured(environment)) {
    return {
      ok: false,
      status: 503,
      error: 'Prompt generation is unavailable until OPENAI_API_KEY is configured.',
    };
  }

  const response = await fetch(`${environment.OPENAI_BASE_URL ?? 'https://api.openai.com/v1'}/responses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${environment.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: environment.OPENAI_TEXT_MODEL ?? 'gpt-5.4',
      reasoning: {
        effort: 'low',
      },
      input: [
        {
          role: 'system',
          content: [{ type: 'input_text', text: SYSTEM_PROMPT }],
        },
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: JSON.stringify(
                {
                  brandName,
                  prompt: request.prompt.trim(),
                },
                null,
                2,
              ),
            },
          ],
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'blocks_prompt_concept',
          schema: PROMPT_CONCEPT_JSON_SCHEMA,
        },
      },
      prompt_cache_key: `blocks:${brandName.toLowerCase()}`,
    }),
  });

  if (!response.ok) {
    const failure = await response.text();

    return {
      ok: false,
      status: response.status,
      error: failure || 'OpenAI request failed.',
    };
  }

  const payload = await response.json();
  const outputText = extractOutputText(payload);

  if (!outputText) {
    return {
      ok: false,
      status: 502,
      error: 'OpenAI did not return structured output text.',
    };
  }

  const concept = PromptConceptSchema.parse(JSON.parse(outputText));

  return {
    ok: true,
    concept,
    model: environment.OPENAI_TEXT_MODEL ?? 'gpt-5.4',
  };
};

export const parseConceptRequest = (input: unknown): ConceptRequest => {
  if (
    !input ||
    typeof input !== 'object' ||
    typeof (input as { prompt?: unknown }).prompt !== 'string'
  ) {
    throw new Error('Prompt requests must include a prompt string.');
  }

  return {
    brandName:
      typeof (input as { brandName?: unknown }).brandName === 'string'
        ? (input as { brandName: string }).brandName
        : undefined,
    prompt: (input as { prompt: string }).prompt,
  };
};
