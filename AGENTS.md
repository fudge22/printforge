PrintForge Agent Instructions
Purpose

PrintForge manages the journey from a 3D model to a commercially viable
physical product.

The central product question is:

Should I sell this product, and why?

When making changes, prefer the simplest implementation that correctly solves
the current PrintForge requirement.

Do not introduce abstractions, dependencies, packages, or infrastructure only
because they may be useful later.

Authoritative Project Documentation

Before changing business rules, domain entities, persistence, architecture, or
V1 scope, consult the relevant source below.

docs/requirements.md
Product goals.
V1 behavior.
Economics.
Readiness requirements.
V1/V2 scope boundaries.
docs/domain-model.md
Canonical domain terminology.
Entities and relationships.
Domain ownership.
Frozen V1 modeling rules and invariants.
docs/database-schema.md
Persistence model.
Planned tables and relationships.
Derived-versus-persisted data rules.
Referential-integrity expectations.
docs/architecture.md
Application architecture.
Package responsibilities.
Data flow.
Testing strategy.
Dependency and abstraction guidance.
docs/decisions.md
Accepted architectural and technical decisions.
Rationale for major technology choices.

These documents are complementary rather than interchangeable.

Do not redefine a business rule based solely on a database representation or
implementation convenience.

If code, assumptions, or a requested change conflicts with these documents, do
not silently reinterpret the documented design. Surface the conflict before
changing the documented rule.

Technology Stack

Use the established PrintForge stack unless an accepted architectural change
says otherwise:

TypeScript
React
Node.js
Fastify
REST
PostgreSQL
Drizzle
pnpm workspaces
Vitest
Playwright
GitHub Actions

Do not replace or add major frameworks without a concrete current requirement.

Repository Responsibilities
apps/web

Owns:

React user interface.
Forms and user input.
Client-side interaction.
REST API calls.
Presentation of results.
User-facing error states.

Do not place authoritative PrintForge business rules in React.

apps/api

Owns:

Fastify routes.
HTTP request and response handling.
Runtime input validation.
API-level error handling.
Orchestration of persistence and domain operations.

Keep route handlers relatively thin.

Do not implement core economics or readiness rules directly inside route
handlers.

packages/domain

Owns:

Business calculations.
Manufacturing rules.
Economics.
Readiness logic.
Domain invariants.

Prefer pure TypeScript functions where practical.

The domain package must not depend on React or Fastify.

Where practical, domain calculations should also remain independent of Drizzle
and PostgreSQL.

packages/database

Owns:

Drizzle schema definitions.
PostgreSQL configuration.
Connections.
Migrations.
Database-specific queries.
Persistence operations.

Do not make the database package the authoritative implementation of
PrintForge business calculations.

Critical Domain Guardrails

The complete domain rules live in docs/domain-model.md. The following are
high-risk rules that must be preserved during implementation:

Model represents the digital design, not manufacturing configuration.
SourceProfile represents provenance and source-provided information.
ProductionProfile represents actual manufacturing truth.
Product and Model have a many-to-many relationship through
ProductModelLink.
ProductVariant represents the actual sellable variation.
unitsPerSale and Plate yield are different concepts.
Plate is a first-class manufacturing concept.
Plate owns print duration, usable output/yield, and FilamentUsage.
Filament usage is relational and arbitrary in number. Never introduce fixed
fields such as filament1, filament2, etc.
Actual manufacturing material belongs to production usage rather than
Model.
ProductComponent is either PURCHASED or
INTERNALLY_MANUFACTURED in V1.
An internally manufactured component references another ProductVariant,
not a ProductionProfile.
The referenced ProductVariant's applicable current ProductionProfile drives
its current manufacturing economics.
Internally manufactured component relationships must not contain direct or
indirect cycles.
Customer-supplied or non-included compatibility items are not costed
ProductComponents in V1.
Active human labor is distinct from unattended printer time.
Active personal labor is shown separately from cash costs.
Cash Contribution is the primary V1 profitability concept.
Market Observations represent observed comparable asking prices, not proven
sales or market value.
Rights/IP reviews record review state and do not make legal determinations.
Safety review is lightweight and advisory.
Current economic metrics and readiness should generally be derived from
authoritative inputs rather than persisted as independent mutable state.
Readiness must be explainable and may only be blocked by concerns modeled in
V1.
Shipping is V2 and must not block V1 readiness.
Detailed final QC is V2 and must not block V1 readiness.

When implementing or changing one of these areas, read the applicable sections
of docs/domain-model.md and docs/requirements.md rather than relying only on
this summary.

V1 Scope Discipline

Do not introduce V2 functionality as a prerequisite for V1.

Examples of currently deferred concerns include:

Shipping calculation and fulfillment.
Detailed final QC workflows.
Inventory management.
Advanced bundles and selling configurations.
Detailed material-science systems.
Full accounting.
Full order management.
Printer telemetry and print queues.

Reasonable extension points are acceptable.

Infrastructure built solely for hypothetical future requirements is not.

Derived Data

Prefer authoritative inputs plus domain calculations over duplicated calculated
state.

Examples of values that should normally be derived include:

Material cost.
Cost per sale.
Cash Contribution.
Cash Contribution Margin.
Printer hours per sale.
Cash Contribution per printer hour.
Active labor hours per sale.
Cash Contribution per active labor hour.
Current readiness assessment.

Persist review state, observations, user-entered assumptions, and other durable
information that cannot be reconstructed from existing source data.

Consult docs/database-schema.md before changing what is persisted.

Testing Expectations

Use Vitest for unit, domain, calculation, backend-service, and appropriate
integration tests.

Business rules in packages/domain should receive strong unit-test coverage.

Test behavior and important edge cases rather than implementation details.

Use Playwright for a smaller number of important end-to-end user workflows.

Do not duplicate every unit-level rule through browser tests.

When changing a business calculation or invariant:

Understand the documented rule.
Add or update tests that demonstrate the expected behavior.
Implement the smallest change needed.
Run relevant tests and type checking.
Change Discipline

Before modifying code:

Inspect the existing implementation.
Inspect existing tests.
Read the relevant authoritative documentation.
Understand the current behavior before replacing it.

While modifying code:

Keep changes small and reviewable.
Avoid unrelated refactoring.
Follow existing naming and package conventions.
Do not invent requirements.
Do not silently expand scope.
Do not add dependencies unless they solve a concrete current problem.
Do not create generic abstractions before actual duplication or complexity
justifies them.

After modifying code:

Run relevant tests.
Run relevant type checking.
Review the diff for unrelated changes.
Update documentation when a change legitimately alters documented
architecture, domain behavior, persistence design, or scope.

Do not change authoritative documentation merely to make an implementation
mistake appear correct.

Working With Ambiguity or Conflict

If an implementation detail is not specified by the documentation, choose the
simplest approach consistent with the existing architecture and domain model.

If two authoritative documents appear to conflict:

Do not guess which rule should win.
Identify the conflicting statements.
Surface the conflict before changing the documented design.

For business/domain meaning, docs/domain-model.md is the canonical conceptual
source.

For V1 product behavior and scope, use docs/requirements.md.

For persistence details, use docs/database-schema.md, while preserving the
domain model.

For application structure, use docs/architecture.md.

For accepted architectural choices and rationale, use docs/decisions.md.

Preserve Learning Value

PrintForge is both a working product and a software-development learning
project.

When assisting with implementation:

Prefer clear, understandable code over unnecessarily clever code.
Explain significant design choices when useful.
Avoid hiding simple behavior behind excessive abstractions.
Keep changes narrow enough that a developer can review and understand them.
Do not replace learning opportunities with large unexplained rewrites.
Guiding Question

Before adding a dependency, framework, package, abstraction, service, table, or
major new concept, ask:

What current PrintForge problem does this solve?

If there is no concrete answer, defer it.