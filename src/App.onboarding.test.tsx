// @vitest-environment jsdom

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App';

vi.mock('./components/BuilderStudio3D', () => ({
  BuilderStudio3D: () => null,
}));

vi.mock('./lib/block-engine', () => ({
  buildBlockBuildFromImageData: vi.fn(),
}));

vi.mock('./lib/concept-input', () => ({
  buildPromptConceptDataUrl: vi.fn(() => 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"></svg>'),
  normalizeConceptInput: vi.fn((input: unknown) => input),
}));

vi.mock('./lib/hero-renderer', () => ({
  drawHeroCanvas: vi.fn(),
}));

vi.mock('./lib/instruction-artifact', () => ({
  buildInstructionArtifactHtml: vi.fn(() => '<html></html>'),
}));

vi.mock('./lib/reveal-renderer', () => ({
  POSTER_FRAME_PROGRESS: 0.82,
  REVEAL_DURATION_MS: 10_500,
  drawRevealFrame: vi.fn(),
  recordRevealClip: vi.fn(),
}));

vi.mock('./lib/scene-pack', () => ({
  VISUAL_PRESETS: [
    { id: 'primary-play', label: 'Signature box' },
    { id: 'build-table', label: 'Workshop cutaway' },
    { id: 'night-shift', label: 'Night bench' },
  ],
  buildScenePack: vi.fn(),
}));

vi.mock('./lib/set-engine', () => ({
  buildRealSet: vi.fn(),
  createIoBlob: vi.fn(),
  createMpdBlob: vi.fn(),
}));

const createFetchResponse = ({
  ok = true,
  status = 200,
  payload,
}: {
  ok?: boolean;
  status?: number;
  payload: unknown;
}) =>
  Promise.resolve({
    ok,
    status,
    json: async () => payload,
  });

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

describe('App onboarding flow', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal(
      'Image',
      class {
        naturalHeight = 400;
        naturalWidth = 400;
        onerror: ((event: string | Event) => void) | null = null;
        onload: (() => void) | null = null;

        set src(_value: string) {
          queueMicrotask(() => {
            this.onload?.();
          });
        }
      },
    );
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((contextId: string) => {
      if (contextId !== '2d') {
        return null;
      }

      return {
        clearRect: vi.fn(),
        drawImage: vi.fn(),
        getImageData: vi.fn(() => ({
          width: 400,
          height: 400,
          data: new Uint8ClampedArray(400 * 400 * 4),
        })),
      } as unknown as CanvasRenderingContext2D;
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the onboarding showcase and updates the active guidance example', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        if (String(input).includes('/api/concept')) {
          return createFetchResponse({ payload: { available: true } });
        }

        return createFetchResponse({ ok: false, status: 404, payload: { error: 'Missing' } });
      }),
    );

    render(<App />);

    expect(await screen.findByText('How to get a good result')).toBeTruthy();
    expect(screen.getByText('Strong silhouette')).toBeTruthy();

    await userEvent.click(screen.getByRole('button', { name: /next example/i }));

    expect(screen.getByText('Transparent icon')).toBeTruthy();
  });

  it('opens the rights gate before upload instead of clicking the file input', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        if (String(input).includes('/api/concept')) {
          return createFetchResponse({ payload: { available: true } });
        }

        return createFetchResponse({ ok: false, status: 404, payload: { error: 'Missing' } });
      }),
    );

    const { container } = render(<App />);
    const fileInput = container.querySelector('input[type="file"]');

    expect(fileInput).toBeTruthy();

    const clickSpy = vi.spyOn(fileInput as HTMLInputElement, 'click');

    await userEvent.click(screen.getByRole('button', { name: /^upload image$/i }));

    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText('Before we build the set')).toBeTruthy();
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('accepts the rights gate and resumes the queued file-picker action', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        if (String(input).includes('/api/concept')) {
          return createFetchResponse({ payload: { available: true } });
        }

        return createFetchResponse({ ok: false, status: 404, payload: { error: 'Missing' } });
      }),
    );

    const { container } = render(<App />);
    const fileInput = container.querySelector('input[type="file"]');
    const clickSpy = vi.spyOn(fileInput as HTMLInputElement, 'click');

    await userEvent.click(screen.getByRole('button', { name: /^upload image$/i }));
    await userEvent.click(screen.getByRole('checkbox', { name: /i confirm i have the rights/i }));
    await userEvent.click(screen.getByRole('button', { name: /^continue$/i }));

    await waitFor(() => expect(clickSpy).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('cancels the rights gate without changing the input-step state', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        if (String(input).includes('/api/concept')) {
          return createFetchResponse({ payload: { available: false } });
        }

        return createFetchResponse({ ok: false, status: 404, payload: { error: 'Missing' } });
      }),
    );

    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: /^upload image$/i }));
    await userEvent.click(screen.getByRole('button', { name: /not now/i }));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByText('Start a set')).toBeTruthy();
    expect(screen.queryByText('Preparing your signature set')).toBeNull();
  });

  it('resumes prompt generation after rights acceptance and clears the loading interstitial on error', async () => {
    const postRequest = deferred<{
      ok: boolean;
      status: number;
      json: () => Promise<{ error: string }>;
    }>();
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      if (!init?.method || init.method === 'GET') {
        return createFetchResponse({ payload: { available: true } });
      }

      return postRequest.promise;
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<App />);

    await userEvent.type(
      screen.getByLabelText(/describe the set/i),
      'A bold geometric icon built into a premium desk collectible.',
    );

    await userEvent.click(screen.getByRole('button', { name: /generate the set/i }));
    await userEvent.click(screen.getByRole('checkbox', { name: /i confirm i have the rights/i }));
    await userEvent.click(screen.getByRole('button', { name: /^continue$/i }));

    expect(await screen.findByText('Preparing your signature set')).toBeTruthy();

    postRequest.resolve({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Prompt generation is unavailable right now.' }),
    });

    await waitFor(() =>
      expect(screen.queryByText('Preparing your signature set')).toBeNull(),
    );
    expect(await screen.findByText('Prompt generation is unavailable right now.')).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('clears session rights acceptance when the user resets the build', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        if (String(input).includes('/api/concept')) {
          return createFetchResponse({ payload: { available: true } });
        }

        return createFetchResponse({ ok: false, status: 404, payload: { error: 'Missing' } });
      }),
    );

    const { container } = render(<App />);
    const fileInput = container.querySelector('input[type="file"]');
    const clickSpy = vi.spyOn(fileInput as HTMLInputElement, 'click');

    await userEvent.click(screen.getByRole('button', { name: /^upload image$/i }));
    await userEvent.click(screen.getByRole('checkbox', { name: /i confirm i have the rights/i }));
    await userEvent.click(screen.getByRole('button', { name: /^continue$/i }));
    await waitFor(() => expect(clickSpy).toHaveBeenCalledTimes(1));

    await userEvent.click(screen.getByRole('button', { name: /^upload image$/i }));
    await waitFor(() => expect(clickSpy).toHaveBeenCalledTimes(2));
    expect(screen.queryByRole('dialog')).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: /^reset$/i }));
    await userEvent.click(screen.getByRole('button', { name: /^upload image$/i }));

    expect(screen.getByRole('dialog')).toBeTruthy();
  });
});
