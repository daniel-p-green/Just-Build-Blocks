import type { ScenePack } from './scene-pack';

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

export const buildInstructionArtifactHtml = (scenePack: ScenePack) => {
  const steps = scenePack.instructions.steps
    .map(
      (step, index) => `
        <section class="step-card">
          <div class="step-parts">
            ${step.partsNeeded
              .slice(0, 6)
              .map(
                (part) => `
                  <article class="part-chip compact">
                    <span class="swatch" style="background:${part.hex}"></span>
                    <strong>${part.count}x</strong>
                    <span>${escapeHtml(part.partName)}</span>
                  </article>
                `,
              )
              .join('')}
          </div>
          <div class="step-body">
            <div class="step-figure">
              <div class="step-number">${index + 1}</div>
              <div class="figure-board">
                <div class="figure-build">
                  <span class="figure-block wide"></span>
                  <span class="figure-block tall"></span>
                  <span class="figure-block"></span>
                  <span class="figure-arrow">→</span>
                  <span class="figure-block wide accent"></span>
                </div>
                <p class="figure-caption">${escapeHtml(step.title)}</p>
              </div>
            </div>
            <div class="step-copy">
              <div class="step-kicker">Phase ${index + 1}</div>
              <h2>${escapeHtml(step.title)}</h2>
              <p>${escapeHtml(step.detail)}</p>
              <div class="assembly-tags">
                ${step.assemblyIds
                  .map((assemblyId) => `<span>${escapeHtml(assemblyId)}</span>`)
                  .join('')}
              </div>
            </div>
            <aside class="step-inset">
              <span class="inset-label">Completion</span>
              <strong>${step.partCount} parts</strong>
              <span>${step.partsNeeded.length} callouts</span>
            </aside>
          </div>
        </section>
      `,
    )
    .join('');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(scenePack.box.title)} Instruction Book</title>
    <style>
      body {
        margin: 0;
        font-family: "OpenAI Sans", "Avenir Next", Arial, sans-serif;
        background: #d8ebf6;
        color: #101828;
      }
      main {
        max-width: 1180px;
        margin: 0 auto;
        padding: 32px;
      }
      header, .step-card, .manifest-card {
        background: rgba(255,255,255,0.94);
        border-radius: 28px;
        border: 1px solid rgba(16,24,40,0.08);
        box-shadow: 0 18px 36px rgba(16,24,40,0.08);
      }
      header {
        padding: 28px 32px;
        margin-bottom: 20px;
      }
      h1, h2, h3, p {
        margin: 0;
      }
      .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.14em;
        font-size: 12px;
        font-weight: 700;
        color: rgba(16,24,40,0.56);
        margin-bottom: 12px;
      }
      .meta {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
        margin-top: 20px;
      }
      .meta article {
        background: #f5fbff;
        border-radius: 18px;
        padding: 14px 16px;
      }
      .meta span {
        display: block;
        color: rgba(16,24,40,0.56);
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: 8px;
      }
      .meta strong {
        font-size: 24px;
      }
      .steps {
        display: grid;
        gap: 18px;
      }
      .step-card {
        padding: 20px 22px 22px;
      }
      .step-parts {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
        margin-bottom: 18px;
      }
      .step-body {
        display: grid;
        grid-template-columns: minmax(220px, 320px) minmax(0, 1fr) 180px;
        gap: 18px;
        align-items: start;
      }
      .step-figure {
        display: grid;
        gap: 14px;
      }
      .step-number {
        display: inline-flex;
        width: 68px;
        height: 68px;
        align-items: center;
        justify-content: center;
        border-radius: 18px;
        background: #ffffff;
        font-size: 34px;
        font-weight: 700;
        box-shadow: inset 0 -4px 0 rgba(16,24,40,0.08);
      }
      .figure-board {
        display: grid;
        gap: 14px;
        min-height: 220px;
        padding: 18px;
        border-radius: 24px;
        background: #eef7fc;
        border: 1px solid rgba(16,24,40,0.06);
      }
      .figure-build {
        display: grid;
        grid-template-columns: repeat(5, auto);
        gap: 10px;
        align-content: center;
        justify-content: center;
        min-height: 150px;
      }
      .figure-block {
        width: 40px;
        height: 24px;
        border-radius: 10px;
        background: linear-gradient(180deg, #ffffff 0%, #eef3f7 100%);
        border: 1px solid rgba(16,24,40,0.08);
        box-shadow: inset 0 -3px 0 rgba(16,24,40,0.05);
      }
      .figure-block.tall {
        height: 54px;
        align-self: end;
      }
      .figure-block.wide {
        width: 64px;
      }
      .figure-block.accent {
        background: linear-gradient(180deg, #101828 0%, #1d2737 100%);
      }
      .figure-arrow {
        font-size: 28px;
        align-self: center;
        color: rgba(16,24,40,0.46);
      }
      .figure-caption {
        font-size: 14px;
        color: rgba(16,24,40,0.62);
      }
      .step-copy {
        display: grid;
        gap: 10px;
      }
      .step-kicker,
      .inset-label {
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-size: 12px;
        color: rgba(16,24,40,0.56);
        font-weight: 700;
      }
      .step-copy p {
        line-height: 1.5;
        color: rgba(16,24,40,0.76);
      }
      .assembly-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .assembly-tags span {
        padding: 6px 10px;
        border-radius: 999px;
        background: #edf4fb;
        font-size: 12px;
        color: rgba(16,24,40,0.72);
      }
      .step-inset {
        display: grid;
        gap: 8px;
        align-content: start;
        padding: 14px;
        border-radius: 22px;
        background: #f5fbff;
        min-height: 120px;
      }
      .step-inset strong {
        font-size: 28px;
      }
      .part-chip {
        display: grid;
        grid-template-columns: auto auto 1fr;
        gap: 12px;
        align-items: center;
        padding: 12px 14px;
        border-radius: 16px;
        background: #f7fbfe;
      }
      .part-chip.compact {
        min-height: 54px;
      }
      .swatch {
        width: 22px;
        height: 22px;
        border-radius: 999px;
        border: 1px solid rgba(16,24,40,0.14);
      }
      .manifest-card {
        padding: 22px 24px;
        margin-top: 18px;
      }
      .manifest-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 12px;
        margin-top: 18px;
      }
      @media (max-width: 980px) {
        .meta,
        .step-parts,
        .step-body {
          grid-template-columns: 1fr;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <header>
        <p class="eyebrow">Signature set instruction book</p>
        <h1>${escapeHtml(scenePack.box.title)}</h1>
        <p>${escapeHtml(scenePack.box.subtitle)}</p>
        <div class="meta">
          ${scenePack.box.metadataRail
            .map(
              (item) => `
                <article>
                  <span>${escapeHtml(item.label)}</span>
                  <strong>${escapeHtml(item.value)}</strong>
                </article>
              `,
            )
            .join('')}
        </div>
      </header>
      <section class="steps">${steps}</section>
      <section class="manifest-card">
        <p class="eyebrow">Part manifest</p>
        <h2>${scenePack.instructions.countTotals.totalPieces} pieces</h2>
        <div class="manifest-grid">
          ${scenePack.instructions.partManifest
            .map(
              (part) => `
                <article class="part-chip">
                  <span class="swatch" style="background:${part.hex}"></span>
                  <strong>${part.count}x</strong>
                  <span>${escapeHtml(part.partName)} • ${escapeHtml(part.colorName)}</span>
                </article>
              `,
            )
            .join('')}
        </div>
      </section>
    </main>
  </body>
</html>`;
};
