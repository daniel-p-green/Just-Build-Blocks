import type { ButtonHTMLAttributes, HTMLAttributes, MutableRefObject, ReactNode, SVGProps } from 'react';

import type { ScenePack } from '../../lib/scene-pack';
import { HeroCanvas } from './HeroCanvas';
import { getPackageViewModel } from './desktopPresentation';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export function BlocksButton({
  children,
  className,
  size = 'md',
  variant = 'primary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: 'lg' | 'md' | 'sm';
  variant?: 'ghost' | 'primary' | 'secondary' | 'text';
}) {
  return (
    <button
      className={cx('blocks-button', `blocks-button--${variant}`, `blocks-button--${size}`, className)}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={cx('blocks-eyebrow', className)}>{children}</p>;
}

export function HeroCopy({
  eyebrow,
  support,
  title,
  className,
}: {
  className?: string;
  eyebrow?: ReactNode;
  support?: ReactNode;
  title: ReactNode;
}) {
  return (
    <div className={cx('hero-copy', className)}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <div className="hero-copy__title">{title}</div>
      {support ? <p className="hero-copy__support">{support}</p> : null}
    </div>
  );
}

export function StageShell({
  children,
  className,
  glow = 'blue',
}: HTMLAttributes<HTMLElement> & {
  glow?: 'blue' | 'ink' | 'warm';
}) {
  return (
    <section className={cx('stage-shell', `stage-shell--${glow}`, className)}>
      <div className="stage-shell__glow" aria-hidden="true" />
      <div className="stage-shell__floor" aria-hidden="true" />
      {children}
    </section>
  );
}

export function SupportRail({
  children,
  className,
}: HTMLAttributes<HTMLElement>) {
  return <aside className={cx('support-rail', className)}>{children}</aside>;
}

export function ActionCluster({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cx('action-cluster', className)}>{children}</div>;
}

export function MetadataChip({
  icon,
  label,
  value,
}: {
  icon?: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <span className="metadata-chip">
      {icon ? <span className="metadata-chip__icon">{icon}</span> : null}
      <span className="metadata-chip__value">{value}</span>
      <span className="metadata-chip__label">{label}</span>
    </span>
  );
}

export function MetadataChips({
  items,
}: {
  items: Array<{ icon?: ReactNode; label: string; value: string }>;
}) {
  return (
    <div className="metadata-chips">
      {items.map((item) => (
        <MetadataChip icon={item.icon} key={`${item.label}-${item.value}`} label={item.label} value={item.value} />
      ))}
    </div>
  );
}

export function DisclosureSection({
  children,
  className,
  open,
  onToggle,
  title,
}: {
  children: ReactNode;
  className?: string;
  onToggle: () => void;
  open: boolean;
  title: string;
}) {
  return (
    <section className={cx('disclosure-section', className)}>
      <button
        aria-expanded={open}
        className="disclosure-section__toggle"
        onClick={onToggle}
        type="button"
      >
        <Eyebrow>Build files</Eyebrow>
        <strong>{title}</strong>
      </button>
      {open ? <div className="disclosure-section__body">{children}</div> : null}
    </section>
  );
}

const BRICK_COLORS: Record<string, string> = {
  black: '#1B2A34',
  blue: '#0055BF',
  green: '#4B9F4A',
  grey: '#A0A5A9',
  red: '#C4281C',
  white: '#F4F4F4',
  yellow: '#F5CD2F',
};

export function BlocksBrick({
  className,
  color = 'blue',
  height = 1,
  width = 2,
}: {
  className?: string;
  color?: string;
  height?: number;
  width?: number;
}) {
  const studs = Array.from({ length: Math.max(1, width * height) });
  const brickColor = BRICK_COLORS[color] ?? color;

  return (
    <div
      className={cx('blocks-brick', className)}
      style={
        {
          '--brick-color': brickColor,
          '--brick-height-units': height,
          '--brick-width-units': width,
        } as never
      }
    >
      <div className="blocks-brick__top" />
      <div className="blocks-brick__face" />
      <div className="blocks-brick__studs" aria-hidden="true">
        {studs.map((_, index) => (
          <span className="blocks-brick__stud" key={`stud-${index}`} />
        ))}
      </div>
    </div>
  );
}

function IconBase({
  children,
  className,
  size = 18,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      {...props}
    >
      {children}
    </svg>
  );
}

export function BrickCountIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <rect height="10" rx="2.5" stroke="currentColor" strokeWidth="1.8" width="16" x="4" y="9" />
      <circle cx="8" cy="7" fill="currentColor" r="1.8" />
      <circle cx="12" cy="7" fill="currentColor" r="1.8" />
      <circle cx="16" cy="7" fill="currentColor" r="1.8" />
    </IconBase>
  );
}

export function RotateIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M19 8V4h-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path
        d="M6.5 18.5A7 7 0 0 1 5 9.5L8 6.5m9.5-1A7 7 0 0 1 19 14.5l-3 3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </IconBase>
  );
}

export function BookletIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path
        d="M7 5.5h9A2.5 2.5 0 0 1 18.5 8v10.5H9A2.5 2.5 0 0 0 6.5 21V8A2.5 2.5 0 0 1 9 5.5H7Zm0 0A2.5 2.5 0 0 0 4.5 8v10.5H7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </IconBase>
  );
}

export function DownloadIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 5v9" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <path d="m8.5 11.5 3.5 3.5 3.5-3.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M5.5 19h13" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </IconBase>
  );
}

export function ChevronLeftIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="m14.5 6-5 6 5 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </IconBase>
  );
}

export function ChevronRightIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="m9.5 6 5 6-5 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </IconBase>
  );
}

export function BlocksPackage({
  canvasRef,
  className,
  scenePack,
  variant = 'hero',
}: {
  canvasRef?: MutableRefObject<HTMLCanvasElement | null>;
  className?: string;
  scenePack: ScenePack;
  variant?: 'hero' | 'poster';
}) {
  const model = getPackageViewModel(scenePack);

  return (
    <div className={cx('blocks-package', `blocks-package--${variant}`, className)}>
      <div className="blocks-package__gloss" aria-hidden="true" />
      <div className="blocks-package__badge">
        <span>{model.badgeText}</span>
      </div>
      <div className="blocks-package__collector-strip" aria-hidden="true">
        <span>{model.collectorLabel}</span>
      </div>
      <div className="blocks-package__hero">
        <HeroCanvas canvasRef={canvasRef} className="blocks-package__hero-canvas" scenePack={scenePack} variant={variant} />
      </div>
      <div className="blocks-package__footer-copy">
        <Eyebrow>{model.serial}</Eyebrow>
        <strong className="blocks-package__title">{model.title}</strong>
        <p>{model.subtitle}</p>
      </div>
      <div className="blocks-package__meta">
        <span>{model.pieceCount}</span>
        <span>{model.ageMark}</span>
      </div>
      <div className="blocks-package__barcode" aria-hidden="true">
        {Array.from({ length: 16 }).map((_, index) => (
          <span
            key={`barcode-${index}`}
            style={{
              width: `${index % 3 === 0 ? 4 : 2}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function KeepsakeCard({
  actionLabel,
  children,
  className,
  meta,
  onAction,
  title,
  visual,
}: {
  actionLabel: string;
  children?: ReactNode;
  className?: string;
  meta: string;
  onAction: () => void;
  title: string;
  visual: ReactNode;
}) {
  return (
    <article className={cx('keepsake-card', className)}>
      <div className="keepsake-card__visual">{visual}</div>
      <div className="keepsake-card__copy">
        <div>
          <h3>{title}</h3>
          <p>{meta}</p>
        </div>
        {children}
      </div>
      <BlocksButton className="keepsake-card__action" onClick={onAction} size="sm" variant="secondary">
        <DownloadIcon size={16} />
        {actionLabel}
      </BlocksButton>
    </article>
  );
}
