type RightsConfirmationModalProps = {
  acknowledged: boolean;
  onAcknowledgeChange: (next: boolean) => void;
  onCancel: () => void;
  onContinue: () => void;
  open: boolean;
};

export function RightsConfirmationModal({
  acknowledged,
  onAcknowledgeChange,
  onCancel,
  onContinue,
  open,
}: RightsConfirmationModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <div
        aria-describedby="rights-confirmation-detail"
        aria-labelledby="rights-confirmation-title"
        aria-modal="true"
        className="rights-modal"
        role="dialog"
      >
        <button aria-label="Close rights confirmation" className="modal-close" onClick={onCancel} type="button">
          ×
        </button>

        <div className="rights-modal-copy">
          <p className="eyebrow">Rights confirmation</p>
          <h2 id="rights-confirmation-title">Before we start</h2>
          <p id="rights-confirmation-detail">
            This experience turns artwork and ideas you have permission to use into an original
            collectible set. It is built for custom interpretations, not official licensed retail
            products.
          </p>
          <ul className="rights-checklist">
            <li>You own the artwork or text, or you have permission to use it.</li>
            <li>You want an original set interpretation rather than an official retail copy.</li>
            <li>You understand the result is a custom concept set, not a licensed product.</li>
          </ul>
        </div>

        <label className="rights-checkbox">
          <input
            checked={acknowledged}
            onChange={(event) => onAcknowledgeChange(event.target.checked)}
            type="checkbox"
          />
          <span>I confirm I have permission to use this artwork or description.</span>
        </label>

        <div className="rights-modal-actions">
          <button className="secondary" onClick={onCancel} type="button">
            Not now
          </button>
          <button disabled={!acknowledged} onClick={onContinue} type="button">
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
