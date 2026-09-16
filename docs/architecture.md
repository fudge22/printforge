PrintForge — V1 Technical Architecture
1. Purpose

This document defines the technical architecture for PrintForge V1.

PrintForge helps a small 3D-printing seller evaluate the journey from a digital model to a commercially viable physical product. The application combines model and rights information, manufacturing data, costs, market observations, and commercial-readiness rules to help answer:

Should I sell this product, and why?

The V1 architecture should prioritize:

Clear separation of responsibilities
Maintainability
Testability
Strong TypeScript support
Relational data integrity
Simple local development
Incremental development
Avoiding unnecessary abstractions and infrastructure

The architecture should be capable of growing beyond V1 without requiring the initial application to solve future requirements prematurely.

2. Technology Stack
Area	Technology
Language	TypeScript
Frontend	React
Backend	Node.js + Fastify
API	REST
Database	PostgreSQL
Database Access	Drizzle
Repository Structure	Monorepo
Workspace Management	pnpm workspaces
Unit / Integration Testing	Vitest
End-to-End Testing	Playwright
Source Control	Git / GitHub
CI	GitHub Actions

Additional libraries should be introduced only when they solve a concrete application requirement.

3. High-Level Architecture

PrintForge is divided into four primary areas:

┌─────────────────────────────┐
│         React Web           │
│         apps/web            │
└──────────────┬──────────────┘
               │
               │ HTTP / REST
               ▼
┌─────────────────────────────┐
│        Fastify API          │
│         apps/api            │
└───────────┬─────────┬───────┘
            │         │
            ▼         ▼
┌─────────────────┐ ┌─────────────────┐
│     Domain      │ │    Database     │
│ packages/domain │ │packages/database│
└─────────────────┘ └────────┬────────┘
                             │
                             ▼
                       PostgreSQL

The React frontend communicates with the backend exclusively through the REST API.

The frontend does not access PostgreSQL or Drizzle directly.

4. Repository Structure

PrintForge uses a monorepo.

Initial structure:

printforge/
├── apps/
│   ├── web/
│   └── api/
│
├── packages/
│   ├── domain/
│   └── database/
│
├── docs/
│   ├── requirements.md
│   ├── domain-model.md
│   ├── database-schema.md
│   ├── architecture.md
│   └── decisions.md
│
├── AGENTS.md
├── package.json
├── pnpm-workspace.yaml
└── README.md

Additional packages should not be created until a concrete need exists.

In particular, V1 does not initially require a generic shared package or dedicated contracts package.

If repeated API request/response definitions later create duplication between the frontend and backend, a dedicated contracts package may be introduced at that time.

5. Frontend

Location:

apps/web

Technology:

React
TypeScript

The frontend is responsible for:

User interface
Forms and user input
Client-side interaction
Calling the REST API
Presenting API results
User-facing error states

The frontend should not contain authoritative PrintForge business rules.

For example, React should not independently determine whether a product is commercially ready.

Instead:

React
   ↓
GET /variants/:id/readiness
   ↓
Fastify
   ↓
Domain logic
   ↓
Readiness result
   ↓
React displays result

This prevents business rules from being duplicated between the UI and backend.

5.1 Frontend and Backend Authority

The frontend primarily owns presentation, user interaction, and formatting/collecting information for communication with the backend. It may collect input, select and transmit files, construct requests, display backend-returned information, perform presentation-only formatting, manage transient UI interaction state, and provide normal UI-level input handling or basic form feedback.

For example, displaying a backend-returned byte count as a human-friendly file size or formatting an authoritative numeric value for display is presentation work. Such formatting and form feedback do not replace authoritative validation or make React the source of truth.

The backend/domain side is authoritative for STL and 3MF supported-file validation, format-aware parsing, geometry and metadata extraction, geometric/model bounds where derivable, economics calculations, readiness/business-rule evaluation, and other domain calculations and validations. React must not independently reproduce these operations as a second source of truth. API orchestration should remain thin, with business calculations and invariants in packages/domain where practical.

For V1, STL/3MF parsing and authoritative geometry and metadata extraction must happen server-side. Browser-side parsing of either format is not required. The final V1 extraction field list awaits evaluation of what is reliable and useful for each format.

A later version may perform client-side work for purely presentational or responsiveness purposes, such as interactive 3D visualization. Any browser-side parsing or derived preview values must not become authoritative domain state or replace server-side validation/calculation. Client-side STL/3MF parsing and 3D rendering are not V1 requirements.

6. Backend API

Location:

apps/api

Technology:

Node.js
TypeScript
Fastify

Fastify implements PrintForge's REST API.

Example resources may eventually include:

/models
/products
/products/:id
/products/:id/variants
/variants/:id/production-profiles
/variants/:id/economics
/variants/:id/readiness

Exact routes will be designed as features are implemented rather than attempting to define the entire API in advance.

The API layer is responsible for:

Receiving HTTP requests
Validating request input
Authentication/authorization if later required
Calling application/domain/database functionality
Mapping results into HTTP responses
Returning appropriate HTTP status codes
Handling API-level errors

The API should remain relatively thin.

Business calculations should not be implemented directly inside Fastify route handlers.

7. Domain Logic

Location:

packages/domain

The domain package contains business rules that define how PrintForge works.

Examples include:

calculateFilamentCost()
calculatePlateCost()
calculateVariantCost()
calculateCashContribution()
calculateMargin()
calculatePrinterHoursPerSale()
calculateContributionPerPrinterHour()
calculateContributionPerActiveLaborHour()
determineReadiness()

Domain logic should generally be implemented as pure or mostly pure TypeScript functions where practical.

For example:

inputs
   ↓
calculateCashContribution()
   ↓
result

rather than:

database
   ↓
calculation mixed with query
   ↓
HTTP response

This separation makes business rules easier to understand, test, reuse, and change.

The domain package should not depend on React or Fastify.

Where practical, domain calculations should also remain independent of Drizzle and PostgreSQL.

8. Database Layer

Location:

packages/database

Technology:

PostgreSQL
Drizzle

PostgreSQL is the authoritative persistent data store.

Drizzle provides the TypeScript database access layer.

The database package is responsible for:

Drizzle schema definitions
Database configuration
Database connections
Migrations
Database-specific queries
Persistence operations

Example future structure:

packages/database/
├── src/
│   ├── schema/
│   │   ├── models.ts
│   │   ├── products.ts
│   │   ├── production.ts
│   │   └── filament.ts
│   │
│   ├── queries/
│   │   ├── models.ts
│   │   ├── products.ts
│   │   └── production-profiles.ts
│   │
│   └── db.ts
│
└── drizzle/
    └── migrations/

This structure may evolve as implementation reveals actual needs.

The database layer should focus on persistence.

It should not become the primary location for PrintForge business calculations.

9. Data Flow

A typical request should follow this general flow:

User
 ↓
React
 ↓
REST request
 ↓
Fastify
 ↓
Application/domain/database operations
 ↓
PostgreSQL
 ↓
Domain calculations when required
 ↓
Fastify response
 ↓
React
 ↓
User

For example, displaying the economics of a Product Variant might involve:

React
 ↓
GET /variants/42/economics
 ↓
Fastify
 ↓
Retrieve Variant + ProductionProfile
 ↓
Drizzle
 ↓
PostgreSQL
 ↓
Domain economics calculations
 ↓
{
  costPerSale,
  cashContribution,
  margin,
  printerHours,
  contributionPerPrinterHour
}
 ↓
React
10. Domain and Database Separation

Database records and domain concepts are related but should not be treated as identical concerns.

Drizzle answers:

How is this information stored and retrieved?

The domain layer answers:

What does this information mean and what rules apply to it?

For example:

Drizzle/PostgreSQL
──────────────────
plannedSellingPrice
packagingCost
filamentGrams
filamentCostPerGram
printMinutes

can become domain inputs used to calculate:

PrintForge Domain
─────────────────
materialCost
costPerSale
cashContribution
margin
printerHoursPerSale
contributionPerPrinterHour

Derived values should generally be calculated rather than persisted when persistence would create unnecessary risk of stale data.

11. Testing Strategy

PrintForge uses two primary testing tools.

Vitest

Vitest is used primarily for:

Unit tests
Domain/business-rule tests
Calculation tests
Backend service tests
Appropriate integration tests

The domain layer should receive especially strong unit-test coverage because it contains the rules that determine PrintForge's calculations and commercial-readiness recommendations.

Examples:

calculateFilamentCost.test.ts
calculateCashContribution.test.ts
calculateMargin.test.ts
determineReadiness.test.ts

Important edge cases should be tested explicitly.

Playwright

Playwright is used for end-to-end browser testing.

Playwright tests should focus on important user workflows rather than attempting to duplicate every Vitest test through the UI.

Example future workflow:

Create Model
   ↓
Create Product
   ↓
Create Variant
   ↓
Enter production information
   ↓
Enter selling price
   ↓
View economics
   ↓
View readiness result

The general strategy is:

Many fast Vitest tests and a smaller number of high-value Playwright tests.

12. Continuous Integration

GitHub Actions will provide CI.

The initial CI pipeline should remain simple and may include:

Install dependencies
      ↓
Type checking
      ↓
Linting
      ↓
Vitest
      ↓
Build

Playwright may be incorporated once meaningful end-to-end workflows exist.

CI complexity should grow only as required.

13. V1 Architectural Principles
Keep business logic out of React

React presents results and collects input.

It should not become the authoritative implementation of commercial-readiness or economics rules.

Keep business logic out of database queries

Drizzle retrieves and persists information.

Domain logic determines what that information means.

Keep HTTP concerns out of the domain

The domain should not care whether a calculation was triggered by REST, a future command-line tool, a background process, or another interface.

Prefer explicit code over premature abstraction

Do not introduce generic repositories, service factories, event buses, dependency-injection frameworks, or other abstraction layers until a demonstrated need exists.

Add dependencies intentionally

A library should solve a current problem.

Do not add libraries merely because they are common in other projects.

Prefer derived values over duplicated persisted state

Values such as cash contribution and contribution per printer-hour should generally be calculated from authoritative inputs rather than stored separately.

Design for V1

V2 concepts must not complicate or block V1 implementation.

Examples currently deferred from V1 include:

Shipping calculation
Final QC workflow
Manufactured-component inventory
Advanced bundles/configurations
Detailed material science
Detailed paint inventory
Full accounting
Full order fulfillment

The architecture may leave reasonable extension points for these capabilities, but V1 should not implement infrastructure solely for them.

14. API Contracts and Validation

PrintForge will require runtime validation of external input.

The specific validation library or strategy will be selected when the first REST endpoints are implemented.

Similarly, API request and response types may initially live near their respective features.

If meaningful duplication develops between apps/web and apps/api, a focused package such as:

packages/contracts

may be introduced.

This decision is intentionally deferred rather than introducing additional architecture before it is needed.

15. Initial Vertical Slice

The architecture will first be proven with a thin vertical slice rather than by building every layer independently.

The initial workflow is:

Model
 ↓
Model Rights Review
 ↓
Product
 ↓
Product Variant
 ↓
Production Profile
 ↓
Plate
 ↓
Filament Usage
 ↓
Economics
 ↓
Readiness

The initial implementation should support enough information to calculate:

Material cost
Cost per sale
Cash contribution
Margin
Printer hours per sale
Contribution per printer-hour

It should also derive and explain an initial commercial-readiness result based only on V1 concerns.

Once this vertical slice works through PostgreSQL → Drizzle → domain → Fastify → React, additional V1 functionality can be added incrementally.

16. Guiding Principle

PrintForge should favor the simplest architecture that cleanly supports the current requirements.

When deciding whether to introduce another framework, package, abstraction, or service, ask:

What current PrintForge problem does this solve?

If there is no concrete answer, defer the decision until the need exists.

17. Frontend and UX Evolution

The React frontend should be developed iteratively alongside the domain and API rather than after the entire backend is complete.

Early UI implementations are expected to evolve as real workflows expose better ways to organize and present information. Components should therefore favor clear responsibilities and composition over abstractions that assume the final screen structure is already known.

The initial frontend direction includes:

A browsable Models experience.
Model import as a primary user action.
A Model-focused workspace for progressively completing an evaluation.
Access to reusable filament information.
Product and commercial evaluation information as the domain workflow grows.

These are workflow directions rather than fixed page layouts.

Workspace refinements should preserve meaning and intent without freezing exact labels, card layouts, or workspace composition. Prioritize useful descriptive/source context over low-value mesh statistics. Present model bounds distinctly from production footprint, and printer hours per finished unit distinctly from printer hours per sale, as defined in docs/domain-model.md and docs/requirements.md. Presentation choices must not relocate production information or authoritative calculations into the Model or React layer.

The current UI mockups are design references only. They do not define required navigation, exact screen composition, styling, tabs, cards, or field placement.

UI and Domain Boundaries

The frontend is responsible for presentation and user interaction, but it should not become the authoritative implementation of PrintForge business rules.

React components may:

Collect and display user input.
Display calculated and derived information.
Manage presentation-specific state.
Communicate with the API.
Adapt domain concepts into user-friendly terminology.

React components should not become the canonical implementation of:

Cost formulas.
Commercial viability rules.
Readiness rules.
Manufacturing economics.
Domain validation that must remain consistent outside the UI.

Business calculations and rules should continue to live in packages/domain where practical.

The UI may use friendlier labels than the domain model. For example, a domain property such as plannedUsableUnits may be presented to the user as "Usable pieces per plate." User-facing terminology does not require renaming an otherwise appropriate domain concept.

Model Import Review Workflow

V1 follows select STL/3MF file(s) → upload → backend processing → ready for review → review → confirm → Model workspace. Imports is a separate area for unconfirmed files; the Models collection contains confirmed Models only. Each selected source file is tracked independently so one slow or failed import does not obscure the others. The review presents reliable format-aware information and editable import-time metadata, with explicit confirmation and the ability to leave it unconfirmed, as specified in docs/requirements.md.

The conceptual responsibility flow is:

User selects STL and/or 3MF file(s)
→ frontend tracks each active byte transfer as a transient upload task
→ backend acknowledges complete receipt and owns a persistent ImportDraft per file
→ backend processes supported-file validation, format-aware parsing, and authoritative geometry and metadata extraction
→ each ImportDraft becomes READY_FOR_REVIEW or FAILED
→ frontend reflects backend changes automatically and presents ready drafts for review
→ user supplies or edits appropriate import-time metadata
→ frontend submits confirmation
→ backend creates the Model and consumes/removes the ImportDraft

ImportDraft backend states are PROCESSING, READY_FOR_REVIEW, and FAILED; opening review is UI state, not an IN_REVIEW backend state. Failed drafts remain visible. Ready drafts can be confirmed or discarded; persistent review edits remain draft working data until confirmation. Discard removes the draft and its unclaimed asset according to application lifecycle behavior. Retry semantics remain undecided. Drafts survive navigation, refresh, browser closure, and normal absence. Backend processing continues after complete source-file upload acknowledgment without keeping the browser open or remaining on Imports. The Imports view updates automatically without manual application reload; its synchronization mechanism remains undecided.

The Imports UI distinguishes active frontend uploads, backend processing, ready drafts, and failures without fixing layout or section labels. An active upload may show actual byte-transfer progress and percentage when meaningful, plus waiting, failure, retry, or remove state as appropriate. Backend processing uses status or indeterminate progress unless the backend supplies meaningful real progress; invented percentages are not shown. Users receive clear feedback that leaving during upload may interrupt it, and the application makes a reasonable effort to warn before leaving while uploads are active when the platform permits. Interrupted/partial upload data must not be retained indefinitely. Resumable or chunked upload is not required in V1.

Review Import displays metadata returned by the backend rather than deriving authoritative geometry information in React. Transfer percentage is frontend transport state, not an authoritative domain calculation. Confirmation creates the Model; it does not imply commercial readiness, production readiness, or rights approval.

The ImportDraft holds the unchanged uploaded STL or 3MF as an unconfirmed original source asset. Confirmation associates that same source asset with the Model as long-term source data without re-upload, regeneration, or conversion; a reference or ownership change need not move or copy the binary. The binary is stored as a file/object asset rather than inside ordinary relational business columns; PostgreSQL persists draft state and asset reference, then the Model record, its asset reference, and relevant file metadata. Abandoned drafts and their unclaimed assets require eventual cleanup under an explicit retention policy, separate from partial-upload cleanup; the duration remains undecided. This does not establish archive, recovery, soft-delete, or long-term import history.

Exact API endpoints and schemas, upload protocol and multipart implementation, concurrency, maximum file size, STL/3MF parsing libraries, extracted metadata fields, 3MF object representation, source-asset/ImportDraft database columns, storage provider and key/layout, background job or worker technology, polling versus push updates, retention duration, and resumable-upload implementation remain undecided. Do not introduce infrastructure solely for future capabilities.

V1 edits Model metadata and related business information, not the original source file. Model name, description, notes, source/creator information, and rights-review information remain editable independently of the immutable asset. Original filename, source format (STL or 3MF), file size, storage reference, model bounds where derivable, and other file-derived metadata remain authoritative source/file information rather than casually editable business facts; presentation formatting is allowed.

PrintForge retains the original STL or 3MF unchanged in V1; a 3MF is not converted to STL as its authoritative original. No source-file versioning, revision history, file version tables, or overwrite workflow is required. A meaningfully different source file is imported as a separate Model. Deleting a Model may eventually remove its associated asset according to application deletion behavior, without introducing recovery, archive, soft-delete, retention-period, or file-history systems.

A future handoff may export or provide the preserved original Model source asset for use in Bambu Studio or another slicer. PrintForge manages and evaluates the Model and retains the original source; the slicer owns mesh repair, detailed printability, slicing, supports, orientation, and printer-job execution. This handoff is not a V1 integration requirement; local launching, URI/protocols, file associations, APIs, automation, and print-job submission remain future design questions.

The UI should distinguish information determined from the file from information supplied by the user or known source context. STL may offer little descriptive metadata; 3MF may offer richer embedded information, but neither guarantees complete or correct PrintForge business information. Selection or extracted metadata must not establish provenance, commercial-use permission, manufacturing configuration, commercial or production readiness, or printability without appropriate review. Product pricing, filament selection, production setup, plate configuration, and economics configuration remain in the broader evaluation workspace after Model creation.

Show what PrintForge knows, ask for what is missing, and let the user confirm before progressing. This workflow is intentional; exact labels, layout, and screen composition remain flexible.

Interactive 3D preview, source/listing assistance, duplicate detection, richer validation warnings, AI-assisted descriptions, import-time recommendations, and formats beyond STL and 3MF are future directions, not V1 prerequisites. ZIP archives are not a V1 source format: packaging does not establish a single Model or infer component relationships. ZIP inspection/extraction, grouped ZIP import, conversion from unsupported formats, and support for OBJ, STEP, AMF, CAD, or other formats are not V1 requirements. PrintForge validates supported, parseable files with usable model information; full slicer validation and launching Bambu Studio during import are not required. Do not build infrastructure solely for these future extensions.

Initial Frontend Development

The first frontend implementation may use representative sample data while the API, database, and source-file import pipeline are still being developed.

This allows the Models experience and Model workspace to be explored without prematurely coupling UI development to unfinished persistence or import infrastructure.

Sample data is temporary presentation scaffolding and should not introduce duplicate business rules that later compete with the domain layer.
