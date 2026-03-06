export type InputGuideExample = {
  id: string;
  title: string;
  verdict: 'pass' | 'fail';
  verdictLabel: string;
  reason: string;
  guidance: string;
  sourceAlt: string;
  sourcePreviewUrl: string;
  buildPreviewUrl: string;
};

const toDataUrl = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

const studOverlay = (fill: string) =>
  Array.from({ length: 18 }, (_, row) =>
    Array.from({ length: 18 }, (_, column) => {
      const cx = 18 + column * 20;
      const cy = 18 + row * 20;

      return `
        <circle cx="${cx}" cy="${cy}" r="6.7" fill="${fill}" opacity="0.96" />
        <circle cx="${cx - 2}" cy="${cy - 2}" r="2.4" fill="rgba(255,255,255,0.28)" />
      `;
    }).join(''),
  ).join('');

const buildPreviewSvg = ({
  background,
  overlay,
  accent,
  pattern,
  frame,
}: {
  background: string;
  overlay: string;
  accent: string;
  pattern: string;
  frame: string;
}) => `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
    <rect width="400" height="400" rx="28" fill="${background}" />
    <rect x="14" y="14" width="372" height="372" rx="24" fill="${overlay}" stroke="${frame}" stroke-width="10" />
    ${studOverlay('rgba(255,255,255,0.82)')}
    <g transform="translate(42 42)">
      ${pattern}
    </g>
    <rect x="18" y="18" width="364" height="364" rx="26" fill="none" stroke="${accent}" stroke-width="4" opacity="0.55" />
  </svg>
`;

const sourcePreviewSvg = ({
  background,
  pattern,
}: {
  background: string;
  pattern: string;
}) => `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
    <rect width="240" height="240" rx="28" fill="${background}" />
    ${pattern}
  </svg>
`;

export const INPUT_GUIDE_EXAMPLES: InputGuideExample[] = [
  {
    id: 'strong-silhouette',
    title: 'Strong silhouette',
    verdict: 'pass',
    verdictLabel: 'Great fit',
    reason: 'Simple, bold marks survive the jump from source image to collectible set geometry.',
    guidance: 'Use logos with clear outer shape, strong contrast, and no tiny interior detail.',
    sourceAlt: 'Bold circular mark with a clean monogram silhouette',
    sourcePreviewUrl: toDataUrl(
      sourcePreviewSvg({
        background: '#f5f7fb',
        pattern: `
          <circle cx="120" cy="120" r="78" fill="#0f1728" />
          <path d="M86 80h68c18 0 30 12 30 28 0 11-5 19-14 24 12 5 20 16 20 31 0 23-18 37-45 37H86V80zm28 23v23h33c8 0 13-5 13-12s-5-11-13-11h-33zm0 43v31h38c10 0 16-6 16-15s-7-16-18-16h-36z" fill="#ffffff" />
        `,
      }),
    ),
    buildPreviewUrl: toDataUrl(
      buildPreviewSvg({
        background: '#eef2f7',
        overlay: '#ffffff',
        accent: '#00c853',
        frame: '#2f8b38',
        pattern: `
          <circle cx="160" cy="160" r="120" fill="#101828" opacity="0.9" />
          <path d="M110 92h106c28 0 48 18 48 44 0 18-8 30-24 38 21 8 34 28 34 53 0 39-29 61-75 61H110V92zm44 38v40h50c12 0 20-8 20-20s-8-20-20-20h-50zm0 74v54h58c17 0 28-10 28-27s-12-27-31-27h-55z" fill="#ffffff" />
        `,
      }),
    ),
  },
  {
    id: 'transparent-icon',
    title: 'Transparent icon',
    verdict: 'pass',
    verdictLabel: 'Great fit',
    reason: 'Icons with one focal shape and clean edges translate well into an original set face.',
    guidance: 'Transparent PNGs work best when the icon is centered and the silhouette is easy to read.',
    sourceAlt: 'Centered geometric icon on a clean transparent-like field',
    sourcePreviewUrl: toDataUrl(
      sourcePreviewSvg({
        background: '#f7fafc',
        pattern: `
          <rect x="44" y="44" width="152" height="152" rx="32" fill="#ffffff" stroke="#d8e1ee" stroke-width="8" stroke-dasharray="12 10" />
          <path d="M120 64l50 28v56l-50 28-50-28V92l50-28zm0 36l-20 12v24l20 12 20-12v-24l-20-12z" fill="#0055bf" />
        `,
      }),
    ),
    buildPreviewUrl: toDataUrl(
      buildPreviewSvg({
        background: '#eef4f9',
        overlay: '#ffffff',
        accent: '#00c853',
        frame: '#2f8b38',
        pattern: `
          <rect x="48" y="48" width="224" height="224" rx="54" fill="#ffffff" opacity="0.94" />
          <path d="M160 72l86 48v96l-86 48-86-48v-96l86-48zm0 50l-36 22v44l36 20 36-20v-44l-36-22z" fill="#0f1728" />
          <path d="M160 92l46 26v52l-46 26-46-26v-52l46-26z" fill="#ffd500" opacity="0.88" />
        `,
      }),
    ),
  },
  {
    id: 'low-contrast',
    title: 'Low contrast',
    verdict: 'fail',
    verdictLabel: 'Weak result',
    reason: 'When foreground and background values are too close, the build collapses into mush.',
    guidance: 'Avoid pale-on-pale marks and low-contrast photos. The set needs edges it can hold onto.',
    sourceAlt: 'Pale logo with weak separation from its background',
    sourcePreviewUrl: toDataUrl(
      sourcePreviewSvg({
        background: '#f1f1ea',
        pattern: `
          <rect x="34" y="34" width="172" height="172" rx="30" fill="#e9e1bf" />
          <path d="M74 84h92c22 0 38 16 38 40 0 17-8 30-22 37 16 8 26 21 26 40 0 29-22 47-58 47H74V84zm34 32v32h39c11 0 18-6 18-16 0-11-7-16-18-16h-39zm0 58v40h46c14 0 24-8 24-19 0-14-10-21-27-21h-43z" fill="#d4c78f" />
        `,
      }),
    ),
    buildPreviewUrl: toDataUrl(
      buildPreviewSvg({
        background: '#efede1',
        overlay: '#e9dfb3',
        accent: '#d62839',
        frame: '#d62839',
        pattern: `
          <path d="M48 86h258v208H48z" fill="rgba(201,187,136,0.68)" />
          <path d="M84 120h174v144H84z" fill="rgba(216,202,150,0.8)" />
          <path d="M110 142h126c18 0 30 12 30 28 0 12-7 21-20 26 14 8 22 18 22 32 0 27-22 40-56 40H110V142z" fill="rgba(221,208,156,0.94)" />
        `,
      }),
    ),
  },
  {
    id: 'too-much-detail',
    title: 'Too much detail',
    verdict: 'fail',
    verdictLabel: 'Weak result',
    reason: 'Busy source art loses hierarchy fast when the build has to simplify into larger forms.',
    guidance: 'Skip noisy badges, dense illustrations, and logos that only work at full print size.',
    sourceAlt: 'Busy badge-style source with too many tiny details',
    sourcePreviewUrl: toDataUrl(
      sourcePreviewSvg({
        background: '#fff5ea',
        pattern: `
          <rect x="26" y="26" width="188" height="188" rx="26" fill="#111827" />
          <circle cx="120" cy="120" r="72" fill="#ffd500" />
          <path d="M58 74h124M58 96h124M58 118h124M58 140h124M58 162h124" stroke="#c4281c" stroke-width="10" />
          <path d="M78 58l84 124M162 58L78 182" stroke="#0055bf" stroke-width="8" />
        `,
      }),
    ),
    buildPreviewUrl: toDataUrl(
      buildPreviewSvg({
        background: '#eef2f6',
        overlay: '#111827',
        accent: '#d62839',
        frame: '#d62839',
        pattern: `
          <rect x="36" y="36" width="248" height="248" rx="26" fill="#101828" opacity="0.96" />
          <circle cx="160" cy="160" r="98" fill="#ffd500" opacity="0.82" />
          <path d="M64 88h192M64 120h192M64 152h192M64 184h192M64 216h192" stroke="rgba(196,40,28,0.78)" stroke-width="14" />
          <path d="M88 66l144 188M232 66L88 254" stroke="rgba(0,85,191,0.65)" stroke-width="12" />
        `,
      }),
    ),
  },
];
