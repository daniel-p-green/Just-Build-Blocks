import './test-support/happy-dom';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App';
import { getFlagshipGrammarPack } from './components/experience/desktopPresentation';

vi.mock('./components/BuilderStudio3D', () => ({
  BuilderStudio3D: () => <div data-testid="builder-studio">builder studio</div>,
}));

vi.mock('./lib/hero-renderer', () => ({
  drawHeroCanvas: vi.fn(),
}));

vi.mock('./lib/instruction-artifact', () => ({
  buildInstructionArtifactHtml: vi.fn(() => '<html><body>instruction artifact</body></html>'),
}));

vi.mock('./lib/reveal-renderer', () => ({
  REVEAL_DURATION_MS: 1200,
  getRevealClipFileExtension: vi.fn(() => 'webm'),
  recordRevealClip: vi.fn(async () => new Blob(['clip'], { type: 'video/webm' })),
}));

vi.mock('./lib/audio-pack', () => ({
  AUDIO_PACK_OPTIONS: [
    { id: 'original', label: 'Original', description: 'Original soundtrack.' },
  ],
  getAudioPackBasePath: vi.fn(() => '/audio'),
  resolveBrowserCueAudioPath: vi.fn(() => '/audio/cue.wav'),
}));

const mockBuild = {
  cells: [{ color: { id: 'blue', hex: '#0055BF', name: 'Orbit Blue' }, x: 0, y: 0 }],
  columns: 40,
  rows: 40,
  countsByColor: { blue: 10 },
  dominantColor: { id: 'blue', hex: '#0055BF', name: 'Orbit Blue', rgb: [0, 85, 191] },
  visibleBounds: { maxX: 10, maxY: 10, minX: 0, minY: 0 },
};

const mockRealSetBuild = {
  exportBundle: {
    ioFileName: 'signal.io',
    mpdFileName: 'signal.mpd',
  },
  validation: {
    issues: [],
    valid: true,
  },
};

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
  box: {
    badge: {
      serial: 'SIG-0042',
      text: 'BLOCKS',
    },
    coverArtMode: 'signature-set',
    heroCaption: 'A premium signal collectible.',
    metadataRail: [
      { label: 'Builder age', value: '12+' },
      { label: 'Pieces', value: '412' },
      { label: 'Mode', value: 'Signature' },
    ],
    subtitle: 'Collector-grade icon',
    title: 'Signal Monolith',
  },
  builder: {
    accentColor: '#0055BF',
    boardTheme: 'openai-studio',
    cameraPreset: 'hero-angle',
    densityColumns: 40,
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
    tagline: 'From signal to collectible.',
    thesis: 'The software is the board.',
    title: 'Signal Monolith',
  },
  exports: {
    builderStillFileName: 'studio-still.png',
    filmFileName: 'signal-film.mp4',
    handoffFileName: 'signal-handoff.json',
    instructionsDataFileName: 'instructions.json',
    instructionsFileName: 'instructions.html',
    ioFileName: 'signal.io',
    manifestFileName: 'manifest.json',
    mpdFileName: 'signal.mpd',
    posterFrameFileName: 'poster.png',
    sceneFileName: 'scene.json',
    stillFileName: 'hero.png',
    validationFileName: 'validation.json',
  },
  instructions: {
    bookTitle: 'Signal Monolith Instruction Book',
    colorBins: [{ colorId: 'blue', colorName: 'Orbit Blue', count: 24, hex: '#0055BF' }],
    countTotals: {
      totalPieces: 412,
      uniqueColors: 5,
      uniqueParts: 8,
    },
    partManifest: [],
    steps: [
      {
        assemblyIds: ['foundation-01'],
        detail: 'Build the foundation.',
        id: 'foundation-01',
        partCount: 18,
        partsNeeded: [
          {
            colorId: 'blue',
            colorName: 'Orbit Blue',
            count: 4,
            hex: '#0055BF',
            partId: '3001.dat',
            partName: 'Brick 2 x 4',
          },
        ],
        title: 'Foundation',
      },
      {
        assemblyIds: ['crown-02'],
        detail: 'Crown the silhouette.',
        id: 'crown-02',
        partCount: 12,
        partsNeeded: [
          {
            colorId: 'yellow',
            colorName: 'Bright Yellow',
            count: 2,
            hex: '#FFD500',
            partId: '3022.dat',
            partName: 'Plate 2 x 2',
          },
        ],
        title: 'Crown',
      },
    ],
    theme: 'airy-sky-blue',
  },
  keepsakes: {
    instructionArtifactFileName: 'instructions.html',
    instructionDataFileName: 'instructions.json',
    ioFileName: 'signal.io',
    mpdFileName: 'signal.mpd',
    stillFileName: 'hero.png',
    studioStillFileName: 'studio-still.png',
  },
  model: {
    partManifest: [],
    spec: {
      targetStuds: {
        depth: 30,
        height: 18,
        width: 30,
      },
    },
    validation: {
      issues: [],
      valid: true,
    },
  },
  packaging: {
    accentColor: '#0055BF',
    heroCaption: 'A premium signal collectible.',
    metadataRail: [
      { label: 'Builder age', value: '12+' },
      { label: 'Pieces', value: '412' },
      { label: 'Mode', value: 'Signature' },
    ],
  },
  setIdentity: {
    buildId: 'signal-0042',
    collection: 'Series 01',
    heroModel: 'Signal Monolith',
    launchLine: 'Series 01',
    name: 'Signal Monolith',
    sku: 'SIG-0042',
  },
  storyArcs: [
    {
      beats: ['Drop the mark.', 'Watch it click.', 'Hold on the finished collectible.'],
      headline: 'Signal rebuilt in blocks.',
      id: 'instant-magic',
      summary: 'A proof moment for the product.',
    },
  ],
  visual: {
    canvasSize: {
      height: 675,
      width: 1200,
    },
    preset: {
      id: 'primary-play',
      label: 'Signature box',
    },
  },
};

const mockFlagshipPack = getFlagshipGrammarPack(mockScenePack as never);

vi.mock('./lib/block-engine', () => ({
  BLOCK_PALETTE: {
    blue: { hex: '#0055BF', id: 'blue', name: 'Orbit Blue' },
    yellow: { hex: '#FFD500', id: 'yellow', name: 'Bright Yellow' },
  },
  buildBlockBuildFromImageData: vi.fn(() => mockBuild),
}));

vi.mock('./lib/set-engine', () => ({
  buildRealSet: vi.fn(() => mockRealSetBuild),
  createIoBlob: vi.fn(() => new Blob(['io'])),
  createMpdBlob: vi.fn(() => new Blob(['mpd'])),
  summarizeBricklinkSourcing: vi.fn(() => ({
    bricklinkSnapshotVersion: '2026-03-07',
    items: [],
    mappedPartCoverage: { percentage: 100 },
    unavailablePartColorCount: 0,
  })),
}));

vi.mock('./lib/scene-pack', () => ({
  VISUAL_PRESETS: [
    { description: 'Signature box', id: 'primary-play', label: 'Signature box' },
    { description: 'Workshop', id: 'build-table', label: 'Workshop cutaway' },
    { description: 'Night bench', id: 'night-shift', label: 'Night bench' },
  ],
  buildScenePack: vi.fn(() => mockScenePack),
}));

vi.mock('./lib/collection-pack', () => ({
  SIGNATURE_COLLECTION_SPEC: {
    featuredSku: 'SIG-0042',
  },
  buildCollectionPack: vi.fn(() => ({
    collection: {
      description: 'Collector-grade examples.',
      launchLine: 'Series 01',
      name: 'BLOCKS Signature Collection',
      shelfHeadline: 'Signature Collection',
      shelfSupport: 'Collector-grade builds.',
    },
    sets: [
      {
        realSet: mockRealSetBuild,
        scenePack: mockScenePack,
        spec: {
          accentColor: '#0055BF',
          archetype: 'medallion',
          coverSubtitle: 'Collector-grade icon',
          coverTitle: 'Signal Monolith',
          shelfBlurb: 'A strong example.',
          sku: 'SIG-0042',
        },
      },
    ],
  })),
}));

vi.mock('./lib/concept-input', () => ({
  buildPromptConceptDataUrl: vi.fn(() => 'data:image/svg+xml,<svg></svg>'),
  normalizeConceptInput: vi.fn((input) => ({
    ...input,
    brandName: input.brandName ?? 'Prompt Build',
  })),
}));

const STORAGE_KEY = 'just-build-blocks.flagship-session';

describe('App flagship route flow', () => {
  const createCanvasContext = () => ({
    clearRect: vi.fn(),
    drawImage: vi.fn(),
    getImageData: vi.fn(() => ({
      data: new Uint8ClampedArray([0, 85, 191, 255]),
      height: 1,
      width: 1,
    })),
  });

  beforeEach(() => {
    window.history.replaceState({}, '', '/');
    window.localStorage.clear();

    globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.includes('/api/concept') && init?.method === 'POST') {
        return {
          json: async () => ({
            concept: {
              badgeSerial: 'SIG-0042',
              boxSubtitle: 'Collector-grade icon',
              boxTitle: 'Signal Monolith',
              brandName: 'Signal',
              coverConcept: {
                accentColors: ['#0055BF', '#FFD500', '#C4281C'],
                caption: 'From signal to collectible.',
                motif: 'signal stack',
              },
              metadataFlavor: 'signal-build',
              promptSummary: 'A signal icon turned into a collectible.',
              worldConcept: 'A signal build world.',
            },
          }),
          ok: true,
        } as Response;
      }

      return {
        json: async () => ({ available: true }),
        ok: true,
      } as Response;
    }) as typeof fetch;

    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: { ready: Promise.resolve() },
    });

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => createCanvasContext() as never);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(function toBlob(callback) {
      callback?.(new Blob(['image'], { type: 'image/png' }));
    });

    class MockFileReader {
      onerror: null | (() => void) = null;
      onload: null | (() => void) = null;
      result: string | ArrayBuffer | null = null;

      readAsDataURL() {
        this.result = 'data:image/png;base64,preview';
        this.onload?.();
      }
    }

    class MockImage {
      onerror: null | (() => void) = null;
      onload: null | (() => void) = null;
      naturalHeight = 32;
      naturalWidth = 32;

      set src(_value: string) {
        this.onload?.();
      }
    }

    vi.stubGlobal('FileReader', MockFileReader);
    vi.stubGlobal('Image', MockImage);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders the landing route and keeps the url at root', async () => {
    render(<App />);

    expect(window.location.pathname).toBe('/');
    expect(screen.getByRole('heading', { name: /start with a mark\. end with a set\./i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /start building/i })).toBeTruthy();
  });

  it('moves image flow onto /start and then /direction once rights are confirmed', async () => {
    const { container } = render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /start building/i }));
    expect(window.location.pathname).toBe('/start');

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, {
      target: {
        files: [new File(['signal'], 'signal.png', { type: 'image/png' })],
      },
    });

    fireEvent.click(await screen.findByLabelText(/i have the rights? to use this/i));
    fireEvent.click(screen.getByRole('button', { name: /choose your build/i }));

    await waitFor(() => {
      expect(window.location.pathname).toBe('/direction');
    });
  });

  it('supports prompt flow to /direction and shows unavailability copy when prompt mode is off', async () => {
    globalThis.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ available: false }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      })) as typeof fetch;

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /start building/i }));
    fireEvent.click(screen.getByRole('button', { name: /describe concept/i }));

    await waitFor(() => {
      expect(screen.getByText(/description mode is unavailable right now/i)).toBeTruthy();
    });
  });

  it('guards direct reveal routes without a built session', async () => {
    window.history.replaceState({}, '', '/reveal');

    render(<App />);

    await waitFor(() => {
      expect(window.location.pathname).toBe('/');
    });
  });

  it('keeps one real session across /reveal, /studio, /instructions, and /keepsakes', async () => {
    const { container } = render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /start building/i }));

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, {
      target: {
        files: [new File(['signal'], 'signal.png', { type: 'image/png' })],
      },
    });

    fireEvent.click(await screen.findByLabelText(/i have the rights? to use this/i));
    fireEvent.click(screen.getByRole('button', { name: /choose your build/i }));
    fireEvent.click(await screen.findByRole('button', { name: /build this set/i }));

    await waitFor(() => {
      expect(window.location.pathname).toBe('/reveal');
      expect(screen.getByRole('heading', { level: 1, name: /signal monolith/i })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: /explore build/i }));
    await waitFor(() => {
      expect(window.location.pathname).toBe('/studio');
    });
    expect(screen.getByTestId('builder-studio')).toBeTruthy();
    expect(screen.getByLabelText(/step 2 of 2/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /read the manual/i }));
    await waitFor(() => {
      expect(window.location.pathname).toBe('/instructions');
    });
    expect(screen.getByRole('heading', { name: /signal monolith instruction book/i })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /keep the set/i }));
    await waitFor(() => {
      expect(window.location.pathname).toBe('/keepsakes');
    });
    expect(screen.getByRole('heading', { name: /keep the set/i })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /download scene pack json/i })).toBeNull();
    expect(screen.queryByText(/validate in bricklink studio/i)).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /show build files and handoff exports/i }));

    expect(screen.getByRole('button', { name: /download scene pack json/i })).toBeTruthy();
    expect(screen.getByText(/validate in bricklink studio/i)).toBeTruthy();
    expect(screen.getByText(/export for studio review/i)).toBeTruthy();
  });

  it('restores the last valid reveal route from persisted session state after refresh', async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        route: '/reveal',
        session: {
          buildDirectionId: 'signature-mosaic',
          flagshipPack: mockFlagshipPack,
          instructionArtifactHtml: '<html><body>instruction artifact</body></html>',
          origin: 'custom',
          realSetBuild: mockRealSetBuild,
          scenePack: mockScenePack,
          sourceAsset: null,
        },
      }),
    );
    window.history.replaceState({}, '', '/reveal');

    render(<App />);

    await waitFor(() => {
      expect(window.location.pathname).toBe('/reveal');
      expect(screen.getByRole('heading', { level: 1, name: /signal monolith/i })).toBeTruthy();
    });
  });

  it('restores studio routes onto the completed build state instead of an awkward partial step', async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        activeInstructionStep: 0,
        buildDirectionId: 'signature-mosaic',
        instructionSync: true,
        promptForm: {
          brandName: '',
          prompt: '',
        },
        rightsConfirmed: true,
        route: '/studio',
        session: {
          buildDirectionId: 'signature-mosaic',
          flagshipPack: mockFlagshipPack,
          instructionArtifactHtml: '<html><body>instruction artifact</body></html>',
          origin: 'custom',
          realSetBuild: mockRealSetBuild,
          scenePack: mockScenePack,
          sourceAsset: null,
        },
        studioAutoRotate: false,
        studioExploded: false,
      }),
    );
    window.history.replaceState({}, '', '/studio');

    render(<App />);

    await waitFor(() => {
      expect(window.location.pathname).toBe('/studio');
      expect(screen.getByLabelText(/step 2 of 2/i)).toBeTruthy();
    });
  });
});
