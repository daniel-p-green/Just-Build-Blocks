import './test-support/happy-dom';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App';

const { mockCollectionPack, mockScenePack } = vi.hoisted(() => {
  const mockScenePack = {
    audio: {
      cueIds: {
        build: 'build',
        heroReveal: 'hero-reveal',
        montage: 'montage',
        quantize: 'quantize',
        resolve: 'resolve',
        sacredLine: 'sacred-line',
        upload: 'upload',
      },
      sacredLineScript: 'Start with a mark. End with a set.',
      sourceMode: 'local-cues',
    },
    audioDirection: {
      cueSequence: ['upload', 'build', 'resolve'],
      mood: 'tactile-precise',
    },
    box: {
      badge: {
        serial: 'COD-001',
        text: 'BLOCKS',
      },
      coverArtMode: 'signature-set',
      heroCaption: 'A premium Codex collectible.',
      metadataRail: [
        { label: 'Builder age', value: '10+' },
        { label: 'Pieces', value: '320' },
        { label: 'Line', value: 'Series 01' },
      ],
      subtitle: 'Collector-grade terminal icon',
      title: 'Codex Signature Set',
    },
    brand: {
      name: 'Codex',
      sourceFileName: 'codex.png',
      uploadedAt: '2026-03-06T00:00:00.000Z',
    },
    build: {
      dominantColor: { hex: '#101828', id: 'black', label: 'Black' },
      grid: { cells: [], columns: 20, rows: 20 },
      paletteCounts: {},
      visibleBlockCount: 320,
    },
    builder: {
      accentColor: '#0055BF',
      boardTheme: 'openai-studio',
      cameraPreset: 'hero-angle',
      densityColumns: 36,
      partTrayEmphasis: 'balanced',
      scenePreset: 'signature-plinth',
    },
    commerce: {
      ctaLabel: 'Buy the bricks',
      heroMessage: 'Coming soon.',
      status: 'coming-soon',
    },
    copy: {
      sacredLine: 'Start with a mark. End with a set.',
      tagline: 'Collector-grade build.',
      thesis: 'The software is the board.',
      title: 'Codex Signature Set',
    },
    experience: {
      revealMode: 'faithful',
      voiceMode: 'sacred-line',
      wowMode: 'cinematic',
    },
    exportMeta: {
      primaryFormat: '16:9',
      version: '3.0.0',
    },
    exports: {
      builderStillFileName: 'builder.png',
      filmFileName: 'film.mp4',
      handoffFileName: 'handoff.json',
      instructionsDataFileName: 'instructions.json',
      instructionsFileName: 'instructions.html',
      ioFileName: 'codex.io',
      manifestFileName: 'manifest.json',
      mpdFileName: 'codex.mpd',
      posterFrameFileName: 'poster.png',
      sceneFileName: 'scene.json',
      stillFileName: 'still.png',
      validationFileName: 'validation.json',
    },
    input: {
      brandName: 'Codex',
      fileMeta: { fileName: 'codex.png' },
      kind: 'image',
    },
    instructions: {
      bookTitle: 'Codex Signature Set Instruction Book',
      colorBins: [],
      countTotals: {
        totalPieces: 320,
        uniqueColors: 2,
        uniqueParts: 4,
      },
      partManifest: [
        {
          bricklinkAvailableInColor: true,
          bricklinkCatalogUrl: 'https://www.bricklink.com/v2/catalog/catalogitem.page?P=3020',
          bricklinkColorId: 1,
          bricklinkColorName: 'White',
          bricklinkItemNo: '3020',
          bricklinkItemType: 'P',
          colorCode: 15,
          colorId: 'white',
          colorName: 'Studio White',
          count: 8,
          hex: '#FFFFFF',
          key: '3020.dat:white:art',
          partId: '3020.dat',
          partName: 'Plate 2 x 4',
          role: 'art',
        },
      ],
      steps: [
        {
          assemblyIds: ['foundation-01'],
          detail: 'Build the plinth.',
          id: 'foundation-01',
          partCount: 12,
          partsNeeded: [
            {
              colorId: 'white',
              colorName: 'Studio White',
              count: 8,
              hex: '#FFFFFF',
              partId: '3020.dat',
              partName: 'Plate 2 x 4',
            },
          ],
          title: 'Foundation',
        },
        {
          assemblyIds: ['face-02'],
          detail: 'Add the face.',
          id: 'face-02',
          partCount: 24,
          partsNeeded: [
            {
              colorId: 'black',
              colorName: 'Midnight Plate',
              count: 6,
              hex: '#111111',
              partId: '3004.dat',
              partName: 'Brick 1 x 2',
            },
          ],
          title: 'Face',
        },
      ],
      theme: 'airy-sky-blue',
    },
    keepsakes: {
      instructionArtifactFileName: 'instructions.html',
      instructionDataFileName: 'instructions.json',
      ioFileName: 'codex.io',
      mpdFileName: 'codex.mpd',
      stillFileName: 'still.png',
      studioStillFileName: 'builder.png',
    },
    model: {
      canonical: 'ModelIR',
      intent: { targetKind: 'signature-collectible' },
      ir: { assemblies: [], bounds: {}, colorBins: [], parts: [] },
      partManifest: [
        {
          bricklinkAvailableInColor: true,
          bricklinkCatalogUrl: 'https://www.bricklink.com/v2/catalog/catalogitem.page?P=3020',
          bricklinkColorId: 1,
          bricklinkColorName: 'White',
          bricklinkItemNo: '3020',
          bricklinkItemType: 'P',
          colorCode: 15,
          colorId: 'white',
          colorName: 'Studio White',
          count: 8,
          hex: '#FFFFFF',
          key: '3020.dat:white:art',
          partId: '3020.dat',
          partName: 'Plate 2 x 4',
          role: 'art',
        },
        {
          bricklinkAvailableInColor: true,
          bricklinkCatalogUrl: 'https://www.bricklink.com/v2/catalog/catalogitem.page?P=3004',
          bricklinkColorId: 11,
          bricklinkColorName: 'Black',
          bricklinkItemNo: '3004',
          bricklinkItemType: 'P',
          colorCode: 0,
          colorId: 'black',
          colorName: 'Midnight Plate',
          count: 6,
          hex: '#111111',
          key: '3004.dat:black:art',
          partId: '3004.dat',
          partName: 'Brick 1 x 2',
          role: 'art',
        },
      ],
      spec: {
        accentColor: '#0055BF',
        archetype: 'medallion',
        buildId: 'codex-signature',
        collection: 'BLOCKS Signature Collection',
        flagshipName: 'Codex Monolith',
        instructionTheme: 'airy-sky-blue',
        launchLine: 'Series 01',
        modelStyle: 'monochrome-signature',
        packagingAngle: 'three-quarter-left',
        packagingBrief: 'A premium Codex collectible.',
        silhouetteGoal: 'Clean medallion silhouette.',
        sku: 'COD-001',
        supportStrategy: 'plinth-supported',
        targetStuds: { depth: 24, width: 24 },
      },
      validation: {
        exportChecks: {
          ioBundle: true,
          mpdText: true,
        },
        issues: [],
        totals: {
          assemblies: 4,
          parts: 14,
          uniqueColorBins: 2,
          uniquePartKinds: 2,
        },
        valid: true,
      },
    },
    motion: {
      assemblyStyle: 'staged',
      depthPlan: 'monument',
      heroBeatFrame: 20,
      worldRevealFrame: 40,
    },
    packaging: {
      accentColor: '#0055BF',
      benchProps: ['parts tray'],
      coverArtMode: 'signature-set',
      heroCaption: 'A premium Codex collectible.',
      heroShotAngle: 'three-quarter-left',
      metadataRail: [],
      stickerSystem: ['launch-line'],
      style: 'signature-box',
    },
    setIdentity: {
      accentColor: '#0055BF',
      buildId: 'codex-signature',
      collection: 'BLOCKS Signature Collection',
      heroModel: 'Codex Monolith',
      launchLine: 'Series 01',
      name: 'Codex Signature Set',
      sku: 'COD-001',
    },
    storyArcs: [],
    visual: {
      canvasSize: { height: 720, width: 1280 },
      preset: {
        accentStyle: 'primary-panels',
        backgroundMood: 'white-board',
        description: 'Signature box',
        id: 'primary-play',
        label: 'Signature box',
        recommendedColumns: 40,
        studTreatment: 'classic-gloss',
      },
    },
    world: {
      cameraEmotion: 'monument',
      concept: 'A premium collector set.',
      elements: [],
    },
  };

  return {
    mockScenePack,
    mockCollectionPack: {
      collection: {
        commissionHeadline: 'Commission your set',
        commissionPrompt: 'Bring a new mark into the line.',
        description: 'Collector-grade monochrome identity sets.',
        featuredSku: 'COD-001',
        launchLine: 'Series 01',
        name: 'BLOCKS Signature Collection',
        sacredLine: 'Start with a mark. End with a set.',
        sets: [],
        shelfHeadline: 'Signature Collection',
        shelfSupport: 'Collector-grade builds.',
      },
      comparisonRows: [
        {
          accentColor: '#0055BF',
          archetype: 'medallion',
          pieces: 320,
          sku: 'COD-001',
          title: 'Codex Signature Set',
        },
      ],
      sets: [
        {
          input: mockScenePack.input,
          instructionBook: {
            coverTitle: 'Codex Signature Set Instruction Book',
            manifestSpreadTitle: 'Codex Inventory',
            orientationHints: [],
            spreads: [],
            theme: 'airy-sky-blue',
          },
          packagingScene: {
            accentColor: '#0055BF',
            benchProps: ['parts tray'],
            heroCaption: 'A premium Codex collectible.',
            heroShotAngle: 'three-quarter-left',
            metadataRail: [],
            stickerSystem: ['launch-line'],
          },
          realSet: {
            exportBundle: {
              ioFileName: 'codex.io',
              mpdFileName: 'codex.mpd',
            },
            validation: { valid: true },
          },
          scenePack: mockScenePack,
          spec: {
            accentColor: '#0055BF',
            archetype: 'medallion',
            brandName: 'Codex',
            collection: 'BLOCKS Signature Collection',
            coverSubtitle: 'Collector-grade terminal icon',
            coverTitle: 'Codex Signature Set',
            emblemPattern: [],
            flagshipName: 'Codex Monolith',
            heroCaption: 'A premium Codex collectible.',
            launchLine: 'Series 01',
            packagingAngle: 'three-quarter-left',
            shelfBlurb: 'A crisp Codex terminal emblem.',
            sku: 'COD-001',
            targetStuds: { depth: 24, width: 24 },
          },
        },
      ],
      trailer: {
        beats: ['Shelf reveal', 'Box closeups'],
        durationSeconds: 54,
        title: 'BLOCKS Signature Collection Trailer',
      },
    },
  };
});

vi.mock('./components/BuilderStudio3D', () => ({
  BuilderStudio3D: () => null,
}));

vi.mock('./lib/block-engine', () => ({
  buildBlockBuildFromImageData: vi.fn(() => ({ cells: [], columns: 20, rows: 20 })),
}));

vi.mock('./lib/collection-pack', () => ({
  SIGNATURE_COLLECTION_SPEC: {
    featuredSku: 'COD-001',
  },
  buildCollectionPack: vi.fn(() => mockCollectionPack),
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
  REVEAL_DURATION_MS: 10_500,
  recordRevealClip: vi.fn(),
}));

vi.mock('./lib/scene-pack', () => ({
  VISUAL_PRESETS: [
    { id: 'primary-play', label: 'Signature box' },
    { id: 'build-table', label: 'Workshop cutaway' },
    { id: 'night-shift', label: 'Night bench' },
  ],
  buildScenePack: vi.fn(() => mockScenePack),
}));

vi.mock('./lib/set-engine', () => ({
  buildRealSet: vi.fn(() => ({
    exportBundle: {
      ioFileName: 'codex.io',
      mpdFileName: 'codex.mpd',
    },
    validation: { valid: true },
  })),
  createIoBlob: vi.fn(),
  createMpdBlob: vi.fn(),
  summarizeBricklinkSourcing: vi.fn((items: Array<{ bricklinkAvailableInColor: boolean; bricklinkItemNo: string | null }>) => ({
    bricklinkSnapshotVersion: '2026-03-06-local-subset',
    mappedPartCoverage: {
      mappedLineItems: items.filter((item) => Boolean(item.bricklinkItemNo)).length,
      percentage:
        items.length === 0
          ? 0
          : Math.round((items.filter((item) => Boolean(item.bricklinkItemNo)).length / items.length) * 100),
      totalLineItems: items.length,
    },
    unavailablePartColorCount: items.filter((item) => item.bricklinkAvailableInColor === false).length,
    items,
  })),
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
  return { promise, reject, resolve };
};

describe('App onboarding flow', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.history.pushState({}, '', '/');
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
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
      ((contextId: string) => {
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
      }) as typeof HTMLCanvasElement.prototype.getContext,
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('renders the collection landing first and opens the commission flow', async () => {
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

    expect(await screen.findByText('Signature Collection')).toBeTruthy();
    expect(screen.getByRole('button', { name: /commission your set/i })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /commission your set/i }));

    expect(await screen.findByText('Start a set')).toBeTruthy();
    expect(screen.getByText('How to get a good result')).toBeTruthy();
  });

  it('uses customer-facing availability copy and idle guidance in the commission flow', async () => {
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
    fireEvent.click(await screen.findByRole('button', { name: /commission your set/i }));

    expect(await screen.findByText('Description mode is unavailable right now.')).toBeTruthy();
    expect(screen.getByText('Upload artwork or describe a set to begin.')).toBeTruthy();
    expect(screen.queryByText(/api key needed/i)).toBeNull();
    expect(screen.queryByText(/local-first/i)).toBeNull();
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
    fireEvent.click(await screen.findByRole('button', { name: /commission your set/i }));

    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toBeTruthy();

    const clickSpy = vi.spyOn(fileInput as HTMLInputElement, 'click');

    fireEvent.click(screen.getByRole('button', { name: /^upload image$/i }));

    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText('Before we start')).toBeTruthy();
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
    fireEvent.click(await screen.findByRole('button', { name: /commission your set/i }));

    const fileInput = container.querySelector('input[type="file"]');
    const clickSpy = vi.spyOn(fileInput as HTMLInputElement, 'click');

    fireEvent.click(screen.getByRole('button', { name: /^upload image$/i }));
    fireEvent.click(screen.getByRole('checkbox', { name: /i confirm i have permission/i }));
    fireEvent.click(screen.getByRole('button', { name: /^continue$/i }));

    await waitFor(() => expect(clickSpy).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('cancels the rights gate without changing the commission input state', async () => {
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
    fireEvent.click(await screen.findByRole('button', { name: /commission your set/i }));

    fireEvent.click(screen.getByRole('button', { name: /^upload image$/i }));
    fireEvent.click(screen.getByRole('button', { name: /not now/i }));

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
    const fetchMock = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
      if (!init?.method || init.method === 'GET') {
        return createFetchResponse({ payload: { available: true } });
      }

      return postRequest.promise;
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: /commission your set/i }));

    fireEvent.change(screen.getByLabelText(/describe the set/i), {
      target: { value: 'A bold geometric icon built into a premium desk collectible.' },
    });

    fireEvent.click(screen.getByRole('button', { name: /generate the set/i }));
    fireEvent.click(screen.getByRole('checkbox', { name: /i confirm i have permission/i }));
    fireEvent.click(screen.getByRole('button', { name: /^continue$/i }));

    expect(
      await screen.findByRole('heading', { name: 'Preparing your signature set' }),
    ).toBeTruthy();

    postRequest.resolve({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Prompt generation is unavailable right now.' }),
    });

    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: 'Preparing your signature set' })).toBeNull(),
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
    fireEvent.click(await screen.findByRole('button', { name: /commission your set/i }));

    const fileInput = container.querySelector('input[type="file"]');
    const clickSpy = vi.spyOn(fileInput as HTMLInputElement, 'click');

    fireEvent.click(screen.getByRole('button', { name: /^upload image$/i }));
    fireEvent.click(screen.getByRole('checkbox', { name: /i confirm i have permission/i }));
    fireEvent.click(screen.getByRole('button', { name: /^continue$/i }));
    await waitFor(() => expect(clickSpy).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: /^upload image$/i }));
    await waitFor(() => expect(clickSpy).toHaveBeenCalledTimes(2));
    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /^reset$/i }));
    fireEvent.click(await screen.findByRole('button', { name: /commission your set/i }));
    fireEvent.click(screen.getByRole('button', { name: /^upload image$/i }));

    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('keeps internal export files out of the default keep screen', async () => {
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
    fireEvent.click(await screen.findByRole('button', { name: /open cod-001/i }));
    fireEvent.click(screen.getByRole('button', { name: /^next$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^next$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^next$/i }));

    expect((await screen.findAllByRole('heading', { name: /take it with you/i })).length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: /download scene json/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /download handoff pack/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /download validation report/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /download instructions json/i })).toBeNull();
    expect(screen.queryByText(/debug diagnostics/i)).toBeNull();
  });

  it('reveals debug exports only when debug mode is enabled', async () => {
    window.history.pushState({}, '', '/?debug=1');
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
    fireEvent.click(await screen.findByRole('button', { name: /open cod-001/i }));
    fireEvent.click(screen.getByRole('button', { name: /^next$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^next$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^next$/i }));

    expect((await screen.findAllByText('Debug diagnostics')).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /download scene json/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /download handoff pack/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /download validation report/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /download instructions json/i })).toBeTruthy();
  });

  it('adds a guided studio companion without showing BrickLink sourcing in the studio step', async () => {
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
    fireEvent.click(await screen.findByRole('button', { name: /open cod-001/i }));
    fireEvent.click(screen.getByRole('button', { name: /^next$/i }));

    expect(await screen.findByText('Welcome to your build studio')).toBeTruthy();
    expect(screen.getByText('Current build step')).toBeTruthy();
    expect(screen.queryByText('Catalog-backed sourcing')).toBeNull();
  });

  it('steps from the box preview into instructions before the keep surface', async () => {
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
    fireEvent.click(await screen.findByRole('button', { name: /open cod-001/i }));

    expect(screen.getAllByText('Codex Signature Set').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /^next$/i }));
    expect(await screen.findByText('Welcome to your build studio')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /^next$/i }));

    expect(await screen.findByTitle('Instruction preview')).toBeTruthy();
    expect(screen.getByText('Part manifest')).toBeTruthy();
    expect(screen.getByText('Theme: airy-sky-blue')).toBeTruthy();
    expect(screen.queryByText(/take it with you/i)).toBeNull();
  });

  it('shows BrickLink-backed sourcing readiness only in the keep surface', async () => {
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
    fireEvent.click(await screen.findByRole('button', { name: /open cod-001/i }));
    fireEvent.click(screen.getByRole('button', { name: /^next$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^next$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^next$/i }));

    expect(await screen.findByText('Catalog-backed sourcing')).toBeTruthy();
    expect(screen.getByRole('link', { name: /plate 2 x 4/i })).toBeTruthy();
    expect(screen.getByText(/reference links only/i)).toBeTruthy();
  });

  it('walks the visible collection journey from landing to keep and back to the shelf', async () => {
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

    expect(await screen.findByText('Signature Collection')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /open cod-001/i }));

    expect(await screen.findByRole('heading', { name: 'Set reveal' })).toBeTruthy();
    expect(screen.getByText('A premium Codex collectible.')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /^next$/i }));
    expect(await screen.findByText('Welcome to your build studio')).toBeTruthy();
    expect(screen.getAllByText(/step 1 of 2/i).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /^next$/i }));
    expect((await screen.findAllByRole('heading', { name: 'Instruction book' })).length).toBeGreaterThan(0);
    expect(screen.getByText(/clear phases, readable parts calls/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /^next$/i }));
    expect((await screen.findAllByRole('heading', { name: 'Take it with you' })).length).toBeGreaterThan(0);
    expect(screen.getByText('Catalog-backed sourcing')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /^back$/i }));
    expect((await screen.findAllByRole('heading', { name: 'Instruction book' })).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /^reset$/i }));
    expect(await screen.findByText('Signature Collection')).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Set reveal' })).toBeNull();
  });
});
