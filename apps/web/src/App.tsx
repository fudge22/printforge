// Temporary presentation data, independent of the domain and persistence models.
const sampleModels = [
  {
    id: 'desk-organizer',
    name: 'Desk organizer',
    filename: 'desk-organizer.stl',
    description: 'A compact home for pens and everyday desk essentials.',
  },
  {
    id: 'planter',
    name: 'Geometric planter',
    filename: 'geometric-planter.stl',
    description: 'A small planter with a simple faceted silhouette.',
  },
  {
    id: 'cable-clip',
    name: 'Cable clip',
    filename: 'cable-clip.stl',
    description: 'A minimal clip design for keeping cables together.',
  },
];

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
                </div>
              </article>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
