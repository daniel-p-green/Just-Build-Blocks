import {
  BlocksButton,
  Eyebrow,
  HeroCopy,
  StageShell,
  SupportRail,
} from './FlagshipPrimitives';
import { useExperience } from './useExperience';

export function InputPhase() {
  const {
    continueFromInput,
    handleImageFile,
    promptAvailabilityCopy,
    setInputMode,
    setPromptField,
    setRightsConfirmed,
    state,
  } = useExperience();

  return (
    <div className="experience-page start-route flagship-page">
      <div className="flagship-shell flagship-shell--input">
        <main className="flagship-grid flagship-grid--input">
          <div className="input-column">
            <div className="input-mode-header" role="tablist" aria-label="Choose an input mode">
              <button
                aria-pressed={state.inputMode === 'image'}
                className={state.inputMode === 'image' ? 'input-mode-header__tab active' : 'input-mode-header__tab'}
                onClick={() => setInputMode('image')}
                type="button"
              >
                Upload Image
              </button>
              <span aria-hidden="true">/</span>
              <button
                aria-pressed={state.inputMode === 'prompt'}
                className={state.inputMode === 'prompt' ? 'input-mode-header__tab active' : 'input-mode-header__tab'}
                onClick={() => setInputMode('prompt')}
                type="button"
              >
                Describe Concept
              </button>
            </div>

            <StageShell className="input-stage" glow="warm">
              {state.inputMode === 'image' ? (
                <label className={state.sourceAsset ? 'upload-stage has-preview' : 'upload-stage'}>
                  <input
                    accept="image/*"
                    onChange={(event) => {
                      void handleImageFile(event.target.files?.[0] ?? null);
                      event.target.value = '';
                    }}
                    type="file"
                  />
                  {state.sourceAsset ? (
                    <div className="upload-stage__preview">
                      <img alt="Uploaded artwork preview" src={state.sourceAsset.previewUrl} />
                      <div className="upload-stage__meta">
                        <Eyebrow>{state.sourceAsset.brandName}</Eyebrow>
                        <strong>{state.sourceAsset.fileName}</strong>
                      </div>
                    </div>
                  ) : (
                    <div className="upload-stage__placeholder">
                      <div className="upload-stage__plus" aria-hidden="true">
                        <span />
                        <span />
                      </div>
                      <strong>Drop your mark here</strong>
                      <span>PNG, JPG, SVG, or WebP. Clear shapes give the strongest read.</span>
                    </div>
                  )}
                </label>
              ) : (
                <div className="prompt-stage">
                  <label className="prompt-stage__field">
                    <span>Brand or subject name</span>
                    <input
                      autoComplete="off"
                      name="brandName"
                      onChange={(event) => setPromptField('brandName', event.target.value)}
                      placeholder="Signal, Monolith, Studio…"
                      spellCheck={false}
                      type="text"
                      value={state.promptForm.brandName}
                    />
                  </label>
                  <label className="prompt-stage__field">
                    <span>What should we build?</span>
                    <textarea
                      autoComplete="off"
                      name="conceptPrompt"
                      onChange={(event) => setPromptField('prompt', event.target.value)}
                      placeholder="A premium signal icon collectible with a bright accent stripe and a sharp silhouette…"
                      value={state.promptForm.prompt}
                    />
                  </label>
                  <p className="prompt-stage__status">{promptAvailabilityCopy}</p>
                </div>
              )}
            </StageShell>

            <div className="input-stage__footer">
              <label className="rights-row">
                <input
                  checked={state.rightsConfirmed}
                  onChange={(event) => setRightsConfirmed(event.target.checked)}
                  type="checkbox"
                />
                <span>I have the rights to use this mark or concept.</span>
              </label>

              <BlocksButton
                disabled={
                  state.inputPending
                  || !state.rightsConfirmed
                  || (state.inputMode === 'image' ? !state.sourceAsset : !state.promptForm.prompt.trim())
                }
                onClick={() => {
                  void continueFromInput();
                }}
                size="lg"
              >
                {state.inputPending ? 'Preparing source…' : 'Choose your build'}
              </BlocksButton>
            </div>
          </div>

          <SupportRail className="guidance-rail">
            <HeroCopy
              eyebrow="Guidance"
              support="The best builds start with a clear signal. We handle the translation into bricks."
              title={<h2>Pick a strong starting point.</h2>}
            />
            <ol className="guidance-rail__list">
              <li>
                <strong>High contrast</strong>
                <span>Bold silhouettes beat fine detail.</span>
              </li>
              <li>
                <strong>Simple shape</strong>
                <span>Logos, icons, and objects with a distinct profile work best.</span>
              </li>
              <li>
                <strong>Object first</strong>
                <span>Describe the thing first and the mood second.</span>
              </li>
            </ol>
            {state.error ? <p className="error-banner">{state.error}</p> : null}
          </SupportRail>
        </main>
      </div>
    </div>
  );
}
