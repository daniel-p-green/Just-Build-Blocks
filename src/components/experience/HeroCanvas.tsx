import { useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';

import { drawHeroCanvas } from '../../lib/hero-renderer';
import type { ScenePack } from '../../lib/scene-pack';

export function HeroCanvas({
  canvasRef: externalCanvasRef,
  className,
  scenePack,
  variant = 'hero',
}: {
  canvasRef?: MutableRefObject<HTMLCanvasElement | null>;
  className?: string;
  scenePack: ScenePack;
  variant?: 'hero' | 'poster';
}) {
  const localCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const resolvedCanvasRef = externalCanvasRef ?? localCanvasRef;

  useEffect(() => {
    const canvas = resolvedCanvasRef.current;

    if (!canvas) {
      return;
    }

    const render = () => drawHeroCanvas(canvas, scenePack, { variant });
    const fontReady = document.fonts?.ready;

    if (fontReady) {
      void fontReady.then(render);
      return;
    }

    render();
  }, [resolvedCanvasRef, scenePack, variant]);

  return (
    <canvas
      aria-label={`${scenePack.box.title} ${variant === 'poster' ? 'poster' : 'hero'} artwork`}
      className={className}
      height={scenePack.visual.canvasSize.height}
      ref={resolvedCanvasRef}
      width={scenePack.visual.canvasSize.width}
    />
  );
}
