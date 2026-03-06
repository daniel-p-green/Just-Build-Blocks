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
          <h2 id="rights-confirmation-title">Before we build the set</h2>
          <p id="rights-confirmation-detail">
            This upload flow is for original block-set interpretations of marks and ideas you have
            the right to use. We do not generate official branded retail packaging or counterfeit
            goods.
          </p>
          <ul className="rights-checklist">
            <li>You own the logo, image, or prompt content, or you have permission to use it.</li>
            <li>You want an original collectible interpretation, not an official product clone.</li>
            <li>You understand the result is a custom concept set, not a licensed retail item.</li>
          </ul>
        </div>

        <label className="rights-checkbox">
          <input
            checked={acknowledged}
            onChange={(event) => onAcknowledgeChange(event.target.checked)}
            type="checkbox"
          />
          <span>I confirm I have the rights to use this image or prompt.</span>
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
