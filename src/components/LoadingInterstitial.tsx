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
          <p className="eyebrow">Signature set in progress</p>
          <h2>Preparing your signature set</h2>
          <p>
            {kind === 'prompt'
              ? 'Shaping your idea into a buildable collectible with box, studio, and instruction-ready structure.'
              : 'Translating your mark into a buildable collectible with clean geometry, wrapper energy, and keepsake-ready outputs.'}
          </p>
        </div>
      </div>
    </div>
  );
}
