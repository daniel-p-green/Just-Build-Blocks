import type { InputGuideExample } from '../lib/input-guidance';

type InputOnboardingShowcaseProps = {
  activeIndex: number;
  examples: InputGuideExample[];
  onNext: () => void;
  onPrevious: () => void;
  onSelectExample: (index: number) => void;
};

export function InputOnboardingShowcase({
  activeIndex,
  examples,
  onNext,
  onPrevious,
  onSelectExample,
}: InputOnboardingShowcaseProps) {
  const activeExample = examples[activeIndex] ?? examples[0];

  if (!activeExample) {
    return null;
  }

  return (
    <div className="onboarding-showcase">
      <div className="onboarding-preview-shell">
        <div
          className={
            activeExample.verdict === 'pass'
              ? 'onboarding-preview-frame is-pass'
              : 'onboarding-preview-frame is-fail'
          }
        >
          <img
            alt={`${activeExample.title} processed build preview`}
            className="onboarding-preview-image"
            src={activeExample.buildPreviewUrl}
          />
        </div>

        <div className="onboarding-thumbnail-row" role="list" aria-label="Guidance examples">
          {examples.map((example, index) => (
            <button
              aria-current={index === activeIndex ? 'true' : undefined}
              aria-label={`View ${example.title} example`}
              className={
                index === activeIndex
                  ? `onboarding-thumb ${example.verdict} active`
                  : `onboarding-thumb ${example.verdict}`
              }
              key={example.id}
              onClick={() => onSelectExample(index)}
              type="button"
            >
              <img alt={example.sourceAlt} src={example.sourcePreviewUrl} />
              <span className="onboarding-thumb-status" aria-hidden="true">
                {example.verdict === 'pass' ? '✓' : '×'}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="onboarding-guide-panel">
        <div className="onboarding-guide-copy">
          <p className="eyebrow">Input guidance</p>
          <span
            className={
              activeExample.verdict === 'pass'
                ? 'onboarding-verdict pass'
                : 'onboarding-verdict fail'
            }
          >
            {activeExample.verdictLabel}
          </span>
          <h3>{activeExample.title}</h3>
          <p>{activeExample.reason}</p>
          <strong>Use this rule:</strong>
          <p>{activeExample.guidance}</p>
        </div>

        <div className="onboarding-guide-actions">
          <button aria-label="Previous example" className="guide-arrow" onClick={onPrevious} type="button">
            ‹
          </button>
          <button aria-label="Next example" className="guide-arrow active" onClick={onNext} type="button">
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
