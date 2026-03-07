type LoadingInterstitialProps = {
  kind: 'image' | 'prompt' | null;
  open: boolean;
};

export function LoadingInterstitial({ kind, open }: LoadingInterstitialProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="loading-overlay" role="status" aria-live="polite">
      <div className="loading-card">
        <div className="loading-figure" aria-hidden="true">
          <div className="loading-figure-head" />
          <div className="loading-figure-body" />
          <div className="loading-figure-plinth" />
        </div>

        <div className="loading-copy">
          <p className="eyebrow">Building your set</p>
          <h2>Preparing your signature set</h2>
          <p>
            {kind === 'prompt'
              ? 'Turning your description into box art, build phases, and a finished collectible you can keep.'
              : 'Turning your artwork into a set reveal, a guided build, and a finished bundle you can keep.'}
          </p>
        </div>
      </div>
    </div>
  );
}
