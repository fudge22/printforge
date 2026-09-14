type ModelWorkspaceProps = {
  model: {
    name: string;
    filename: string;
    description: string;
    readinessStatus: 'BLOCKED' | 'REVIEW_REQUIRED' | 'QUESTIONABLE' | 'PROMISING' | 'READY';
    productionSetupStatus: string;
    materialCostPerSale: string;
    printerHoursPerSale: string;
  };
  readinessLabel: string;
  onBack: () => void;
};

// Fixed presentation examples for Plate 1, not manufacturing inputs or calculations.
const sampleFilamentUsages = [
  { id: 'body', label: 'Planter body', type: 'PLA Matte', color: 'Terracotta', material: '180 g', waste: '10 g', cost: '$3.80 USD' },
  { id: 'accent', label: 'Accent band', type: 'PLA', color: 'Ivory', material: '60 g', waste: '10 g', cost: '$1.40 USD' },
];

// Authored examples, not tasks derived from readiness or business rules.
const sampleNextSteps = [
  'Confirm the creator’s commercial-use permission and record any attribution requirements.',
  'Add packaging and any applicable selling fees to complete the cost estimate.',
  'Record comparable asking prices to help evaluate the planned selling price.',
];

export default function ModelWorkspace({ model, readinessLabel, onBack }: ModelWorkspaceProps) {
  return (
    <>
      <button className="workspace-button back-button" type="button" onClick={onBack}>Back to Models</button>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Model evaluation workspace</p>
          <h1 id="page-title">{model.name}</h1>
          <p>Explore the design, its sample product, and what still needs attention.</p>
        </div>
      </div>
      <p className="sample-note">Sample information only. Values, review status, and next steps are illustrative; editing is not available yet.</p>

      <div className="workspace-grid">
        <section className="workspace-section" aria-labelledby="model-heading">
          <h2 id="model-heading">Model</h2>
          <div className="model-placeholder workspace-preview">Preview placeholder</div>
          <dl className="workspace-details">
            <div><dt>Model name</dt><dd>{model.name}</dd></div>
            <div><dt>Filename</dt><dd>{model.filename}</dd></div>
            <div><dt>Description</dt><dd>{model.description}</dd></div>
            <div><dt>File information</dt><dd>STL · 2.4 MB</dd></div>
            <div><dt>Model bounds</dt><dd>100 × 100 × 90 mm (sample geometric bounds)</dd></div>
            <div><dt>Source / creator</dt><dd>Creator download / Studio Fern (sample)</dd></div>
            <div><dt>Commercial-use rights</dt><dd><span className="status-label" data-status="Needs Review">Needs Review</span></dd></div>
          </dl>
          <p>Permission and attribution requirements have not been recorded.</p>
        </section>

        <section className="workspace-section" aria-labelledby="product-heading">
          <h2 id="product-heading">Product</h2>
          <p>The sample physical product being evaluated using this design.</p>
          <dl className="workspace-details">
            <div><dt>Associated product</dt><dd>Faceted desk planter</dd></div>
            <div><dt>Sellable variation</dt><dd>Small · Terracotta with ivory accent</dd></div>
            <div><dt>Planned selling price</dt><dd>$18.00 USD</dd></div>
            <div><dt>Units per sale</dt><dd>1 planter</dd></div>
          </dl>
          <p>Plant shown in the product concept is customer-supplied and not included.</p>
        </section>

        <section className="workspace-section" aria-labelledby="production-heading">
          <h2 id="production-heading">Production</h2>
          <p>Current sample manufacturing plan for the small planter variation.</p>
          <dl className="workspace-details">
            <div><dt>Production setup</dt><dd><span className="status-label" data-status={model.productionSetupStatus}>{model.productionSetupStatus}</span></dd></div>
            <div><dt>Print setup</dt><dd>Two-color FDM · 0.4 mm nozzle · 0.2 mm layers</dd></div>
            <div><dt>Plate</dt><dd>Plate 1 · Two complete planters</dd></div>
            <div><dt>Planned print time per plate</dt><dd>7.6 hours</dd></div>
            <div><dt>Planned usable units per plate</dt><dd>2 planters</dd></div>
            <div><dt>Printer hours per finished unit</dt><dd>3.8 hours</dd></div>
          </dl>
        </section>

        <section className="workspace-section" aria-labelledby="materials-heading">
          <h2 id="materials-heading">Materials</h2>
          <p>Planned filament usage for Plate 1, including both planters.</p>
          <ul className="filament-list">
            {sampleFilamentUsages.map((usage) => (
              <li key={usage.id}>
                <h3>{usage.label}</h3>
                <dl className="workspace-details">
                  <div><dt>Filament</dt><dd>{usage.type} · {usage.color}</dd></div>
                  <div><dt>Material grams</dt><dd>{usage.material}</dd></div>
                  <div><dt>Waste grams</dt><dd>{usage.waste}</dd></div>
                  <div><dt>Sample cost including waste</dt><dd>{usage.cost}</dd></div>
                </dl>
              </li>
            ))}
          </ul>
          <p>Sample total material cost per plate: <strong>$5.20 USD</strong></p>
        </section>

        <section className="workspace-section" aria-labelledby="economics-heading">
          <h2 id="economics-heading">Economics</h2>
          <p>Per sale of the small planter variation. All figures are sample values.</p>
          <dl className="workspace-details">
            <div><dt>Material cost per sale</dt><dd>{model.materialCostPerSale}</dd></div>
            <div><dt>Printer hours per sale</dt><dd>{model.printerHoursPerSale}</dd></div>
            <div><dt>Total cost per sale</dt><dd>Not available yet</dd></div>
            <div><dt>Cash contribution</dt><dd>Not available yet</dd></div>
            <div><dt>Cash contribution margin</dt><dd>Not available yet</dd></div>
            <div><dt>Cash contribution per printer hour</dt><dd>Not available yet</dd></div>
          </dl>
          <p>Packaging and selling fees still need attention. The remaining metrics are placeholders for future evaluation.</p>
        </section>

        <div className="workspace-summary">
          <section className="workspace-section" aria-labelledby="readiness-heading">
            <h2 id="readiness-heading">Readiness</h2>
            <p><span className="status-label" data-status={readinessLabel} data-readiness={model.readinessStatus}>{readinessLabel}</span></p>
            <p>The sample product has a production plan, but commercial-use permission needs review and the cost evaluation is unfinished.</p>
          </section>
          <section className="workspace-section" aria-labelledby="next-steps-heading">
            <h2 id="next-steps-heading">Next steps</h2>
            <p>Sample actions to continue this evaluation.</p>
            <ol className="next-steps">
              {sampleNextSteps.map((step) => <li key={step}>{step}</li>)}
            </ol>
          </section>
        </div>
      </div>
    </>
  );
}
