import { generatePromptConcept, isConceptServiceConfigured, parseConceptRequest } from '../server/concept-service';

export default async function handler(request: Request) {
  if (request.method === 'GET') {
    return Response.json({
      available: isConceptServiceConfigured(),
    });
  }

  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed.' }, { status: 405 });
  }

  try {
    const payload = await request.json();
    const result = await generatePromptConcept(parseConceptRequest(payload));

    if (!result.ok) {
      return Response.json({ error: result.error }, { status: result.status });
    }

    return Response.json({
      concept: result.concept,
      model: result.model,
    });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Prompt generation failed.',
      },
      { status: 400 },
    );
  }
}
