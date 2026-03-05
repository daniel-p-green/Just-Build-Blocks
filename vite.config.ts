import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import {
  generatePromptConcept,
  isConceptServiceConfigured,
  parseConceptRequest,
} from './server/concept-service';

const conceptApiPlugin = () => ({
  name: 'concept-api',
  configureServer(server: {
    middlewares: {
      use: (
        path: string,
        handler: (
          req: import('node:http').IncomingMessage,
          res: import('node:http').ServerResponse,
        ) => void | Promise<void>,
      ) => void;
    };
  }) {
    server.middlewares.use('/api/concept', async (req, res) => {
      if (req.method === 'GET') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ available: isConceptServiceConfigured() }));
        return;
      }

      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end(JSON.stringify({ error: 'Method not allowed.' }));
        return;
      }

      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });

      req.on('end', async () => {
        try {
          const result = await generatePromptConcept(parseConceptRequest(JSON.parse(body)));

          res.statusCode = result.ok ? 200 : result.status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(result.ok ? { concept: result.concept, model: result.model } : { error: result.error }));
        } catch (error) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              error: error instanceof Error ? error.message : 'Prompt generation failed.',
            }),
          );
        }
      });
    });
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), conceptApiPlugin()],
});
