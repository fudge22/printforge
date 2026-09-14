// Display labels for the canonical readiness states in docs/domain-model.md.
const readinessLabels = {
  BLOCKED: 'Blocked',
  REVIEW_REQUIRED: 'Needs Review',
  QUESTIONABLE: 'Questionable',
  PROMISING: 'Promising',
  READY: 'Ready',
};

// Temporary presentation data, independent of the domain and persistence models.
// Evaluation snapshots describe illustrative products using each design.
// All labels and metrics are supplied for display, not calculated or persisted.
const sampleModels = [
  {
    id: 'desk-organizer',
    name: 'Desk organizer',
    filename: 'desk-organizer.stl',
    description: 'A compact home for pens and everyday desk essentials.',
    readinessStatus: 'READY',
    productionSetupStatus: 'Ready',
    materialCostPerSale: '$1.85 USD',
    printerHoursPerSale: '2.4 hours',
    evaluationNote: 'Sample product evaluation is complete, including production and reviews.',
  },
  {
    id: 'planter',
    name: 'Geometric planter',
    filename: 'geometric-planter.stl',
    description: 'A small planter with a simple faceted silhouette.',
    readinessStatus: 'REVIEW_REQUIRED',
    productionSetupStatus: 'Ready',
    materialCostPerSale: '$2.60 USD',
    printerHoursPerSale: '3.8 hours',
    evaluationNote: 'Production is configured; commercial-use rights still need review.',
  },
  {
    id: 'cable-clip',
    name: 'Cable clip',
    filename: 'cable-clip.stl',
    description: 'A minimal clip design for keeping cables together.',
    readinessStatus: 'BLOCKED',
    productionSetupStatus: 'Incomplete',
    materialCostPerSale: 'Not available',
    printerHoursPerSale: 'Not available',
    evaluationNote: 'Add production setup details before per-sale estimates are available.',
  },
] as const;

export default function App() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#models">Skip to content</a>
      <header className="app-header">
        <span className="brand">PrintForge</span>
        <nav aria-label="Main navigation">
          <a href="#models" aria-current="page">Models</a>
          <button type="button" disabled>Products</button>
          <button type="button" disabled>Filaments</button>
        </nav>
      </header>

      <main id="models" tabIndex={-1}>
        <div className="page-heading">
          <div>
            <p className="eyebrow">Your model library</p>
            <h1>Models</h1>
            <p>Explore the digital designs behind your next product.</p>
          </div>
          <button className="import-button" type="button" disabled aria-describedby="sample-note">
            Import Model
          </button>
        </div>

        <p className="sample-note" id="sample-note">
          Sample models for now. Model import, Products, and Filaments are coming later.
          {' '}Evaluation snapshots are illustrative sample values.
        </p>

        <ul className="model-grid" aria-label="Sample models">
          {sampleModels.map((model) => (
            <li key={model.id}>
              <article className="model-card">
                <div className="model-placeholder" aria-hidden="true">STL</div>
                <div className="model-details">
                  <h2>{model.name}</h2>
                  <p>{model.description}</p>
                  <p className="filename">{model.filename}</p>
                  <h3 className="snapshot-heading">Sample product evaluation</h3>
                  <dl className="evaluation-snapshot">
                    <div>
                      <dt>Readiness</dt>
                      <dd><span className="status-label" data-status={readinessLabels[model.readinessStatus]}>{readinessLabels[model.readinessStatus]}</span></dd>
                    </div>
                    <div>
                      <dt>Production setup</dt>
                      <dd><span className="status-label" data-status={model.productionSetupStatus}>{model.productionSetupStatus}</span></dd>
                    </div>
                    <div>
                      <dt>Material cost per sale</dt>
                      <dd>{model.materialCostPerSale}</dd>
                    </div>
                    <div>
                      <dt>Printer hours per sale</dt>
                      <dd>{model.printerHoursPerSale}</dd>
                    </div>
                  </dl>
                  <p className="evaluation-note">{model.evaluationNote}</p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
