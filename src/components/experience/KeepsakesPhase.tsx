import { useState } from 'react';

import {
  BlocksBrick,
  BlocksButton,
  BlocksPackage,
  DisclosureSection,
  Eyebrow,
  KeepsakeCard,
} from './FlagshipPrimitives';
import { getKeepsakeViewModel } from './desktopPresentation';
import { useExperience } from './useExperience';

export function KeepsakesPhase() {
  const {
    downloadBuilderStill,
    downloadHandoffJson,
    downloadInstructionsArtifact,
    downloadIo,
    downloadLdr,
    downloadMpd,
    downloadPartManifest,
    downloadPosterFrame,
    downloadRevealClip,
    downloadSceneJson,
    downloadStill,
    downloadStudioValidationReport,
    downloadValidationReport,
    downloadingRevealClip,
    setPhase,
    state,
    studioHandoffBundle,
  } = useExperience();
  const [showRaw, setShowRaw] = useState(false);
  const session = state.session;

  if (!session) {
    return null;
  }

  const viewModel = getKeepsakeViewModel(session.scenePack);

  return (
    <div className="experience-page keepsakes-route flagship-page">
      <div className="flagship-shell flagship-shell--keepsakes">
        <div className="floating-actions">
          <BlocksButton onClick={() => setPhase('reveal')} size="sm" variant="secondary">
            Back to Reveal
          </BlocksButton>
        </div>

        <main className="keepsakes-flow">
          <header className="keepsakes-header">
            <Eyebrow>{viewModel.shareableEyebrow}</Eyebrow>
            <h1>{viewModel.title}</h1>
            <p>{viewModel.support}</p>
          </header>

          <section className="keepsake-grid">
            <KeepsakeCard
              actionLabel="Download Hero Still"
              meta="High-res PNG"
              onAction={downloadStill}
              title="Hero Still"
              visual={
                <div className="keepsake-visual keepsake-visual--still">
                  <BlocksBrick color="red" width={4} />
                  <BlocksBrick color="yellow" width={2} />
                  <BlocksBrick color="black" width={1} />
                </div>
              }
            />
            <KeepsakeCard
              actionLabel="Download Box Art"
              meta="Print-ready artwork"
              onAction={downloadPosterFrame}
              title="Box Art"
              visual={<BlocksPackage className="keepsake-grid__package" scenePack={session.scenePack} variant="poster" />}
            />
            <KeepsakeCard
              actionLabel="Download Studio Still"
              meta="Builder view"
              onAction={downloadBuilderStill}
              title="Studio Still"
              visual={
                <div className="keepsake-visual keepsake-visual--studio">
                  <BlocksBrick color="blue" width={4} />
                  <BlocksBrick color="white" width={2} />
                </div>
              }
            />
            <KeepsakeCard
              actionLabel="Download Manual"
              meta="Instruction book"
              onAction={downloadInstructionsArtifact}
              title="Instruction Book"
              visual={<BlocksPackage className="keepsake-grid__package keepsake-grid__package--book" scenePack={session.scenePack} variant="poster" />}
            />
            <KeepsakeCard
              actionLabel="Download Social Card"
              meta="Square share card"
              onAction={downloadPosterFrame}
              title="Social Card"
              visual={
                <div className="keepsake-visual keepsake-visual--social">
                  <div className="keepsake-visual__social-badge">BLOCKS</div>
                  <strong>{session.scenePack.box.title}</strong>
                  <span>{session.scenePack.instructions.countTotals.totalPieces} pcs</span>
                </div>
              }
            />
          </section>

          <DisclosureSection
            onToggle={() => setShowRaw((current) => !current)}
            open={showRaw}
            title={showRaw ? 'Hide build files and handoff exports' : 'Show build files and handoff exports'}
          >
            {studioHandoffBundle ? (
              <article className="handoff-card">
                <Eyebrow>Advanced handoff</Eyebrow>
                <h2>Validate in BrickLink Studio</h2>
                <p>Prepare the Studio project, synced LDraw companion, and review packet for a deeper build pass.</p>
                <div className="handoff-card__meta">
                  <span>{studioHandoffBundle.footprint}</span>
                  <span>{studioHandoffBundle.materialsSummary}</span>
                  <span>{studioHandoffBundle.validationSummary.status}</span>
                </div>
                <div className="handoff-card__actions">
                  <BlocksButton onClick={downloadIo} variant="secondary">Export for Studio Review</BlocksButton>
                  <BlocksButton disabled={!studioHandoffBundle.ldrAsset} onClick={downloadLdr} variant="ghost">
                    Download LDraw Companion
                  </BlocksButton>
                  <BlocksButton onClick={downloadStudioValidationReport} variant="ghost">
                    Download Review Report
                  </BlocksButton>
                </div>
              </article>
            ) : null}

            <div className="raw-export-grid">
              {[
                { label: 'Scene Pack JSON', action: downloadSceneJson },
                { label: 'Parts Manifest', action: downloadPartManifest },
                { label: 'Validation Report', action: downloadValidationReport },
                { label: 'MPD Model', action: downloadMpd },
                { label: 'Studio IO File', action: downloadIo },
                { label: 'Handoff Bundle', action: downloadHandoffJson },
              ].map((item) => (
                <article className="raw-export-card" key={item.label}>
                  <Eyebrow>{viewModel.rawEyebrow}</Eyebrow>
                  <h3>{item.label}</h3>
                  <BlocksButton onClick={item.action} variant="secondary">
                    Download {item.label}
                  </BlocksButton>
                </article>
              ))}
              <article className="raw-export-card">
                <Eyebrow>{viewModel.rawEyebrow}</Eyebrow>
                <h3>Reveal Clip</h3>
                <BlocksButton disabled={downloadingRevealClip} onClick={() => void downloadRevealClip()} variant="secondary">
                  {downloadingRevealClip ? 'Preparing Reveal…' : 'Download Reveal Clip'}
                </BlocksButton>
              </article>
            </div>
          </DisclosureSection>
        </main>
      </div>
    </div>
  );
}
