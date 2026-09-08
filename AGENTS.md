PrintForge Agent Instructions
Project Purpose

PrintForge helps a small 3D-printing seller evaluate the journey from a digital model to a commercially viable physical product.

The application should help answer:

Should I sell this product, and why?

PrintForge considers areas such as:

Model and source provenance
Recorded commercial-use rights
Third-party intellectual property review
Manufacturing configuration
Plates and print time
Filament usage and waste
Components and consumables
Post-processing labor
Packaging and applicable fees
Planned selling price
Comparable asking prices
Cash contribution and profitability
Printer utilization
Commercial readiness

PrintForge is not intended to become a full accounting, e-commerce, legal-compliance, or manufacturing ERP system.

Read Project Documentation First

Before making significant architectural, domain, or data-model changes, review the relevant documentation in docs/.

Important documents include:

docs/requirements.md
docs/domain-model.md
docs/architecture.md
docs/decisions.md

Treat these documents as the authoritative description of the current V1 product and architecture.

Do not silently contradict documented decisions.

If an implementation appears to require changing a documented decision, identify the conflict and explain the tradeoff before making the architectural change.

Current Technology Stack

PrintForge currently uses the following technical direction:

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
Git / GitHub

Do not replace these technologies or introduce competing frameworks without a concrete requirement and explicit approval.

Repository Structure

The initial repository structure is:

apps/
├── web/
└── api/

packages/
├── domain/
└── database/

docs/

Responsibilities should remain clearly separated.

apps/web

Contains the React frontend.

Responsibilities include:

User interface
Forms
Client-side interaction
REST API calls
Presentation of results
User-facing error states

Do not place authoritative PrintForge business calculations or readiness rules in React components.

apps/api

Contains the Fastify REST API.

Responsibilities include:

HTTP routes
Request handling
Input validation
Application orchestration
HTTP responses
API-level error handling

Keep route handlers reasonably thin.

Do not implement significant business calculations directly inside route handlers.

packages/domain

Contains PrintForge business rules and calculations.

Examples include:

Filament cost calculations
Plate cost calculations
Product Variant economics
Cash contribution
Margin
Printer-hour economics
Active-labor economics
Commercial-readiness rules

Prefer pure TypeScript functions for domain calculations when practical.

The domain package should not depend on React or Fastify.

Where practical, domain logic should remain independent of Drizzle and PostgreSQL.

packages/database

Contains persistence concerns.

Responsibilities include:

Drizzle schemas
PostgreSQL configuration
Database connections
Migrations
Database-specific queries
Persistence operations

Do not make the database layer the primary implementation location for PrintForge business rules.

Core Domain Model

Preserve the following primary manufacturing hierarchy:

Model
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

Important related concepts include:

ModelRightsReview
SourceProfile
ProductModelLink
ThirdPartyIpReview
SafetyReview
ProductComponent
ConsumableUsage
PostProcessingStep
MarketObservation

Do not collapse these concepts together merely to reduce the number of entities.

Their distinctions are intentional and documented in the domain model.

Important Domain Rules
Model and Product Are Different Concepts

A Model represents the underlying digital design.

A Product represents a marketed physical offering.

A Product may use multiple Models, and a Model may be used by multiple Products.

SourceProfile and ProductionProfile Are Different Concepts

A SourceProfile represents provenance or historical information about an external/source print profile.

A ProductionProfile represents the user's actual manufacturing recipe.

ProductionProfile is the source of truth for PrintForge manufacturing calculations.

Editing a ProductionProfile must not alter its SourceProfile.

Plate Is a First-Class Manufacturing Entity

A Plate represents one slicer/build-plate manufacturing batch.

A Plate owns information such as:

Print time
Useful output/yield
Filament usage
Waste

Do not automatically model every physical part printed on a Plate as a separate database entity.

Model manufacturing detail only when it affects costing, assembly, reuse, understanding, or a commercial/production decision.

Filament Usage Must Support Multiple Filaments

Do not create fixed fields such as:

filament1
filament2
filament3
filament4

Filament usage is a one-to-many relationship.

The design must support arbitrary numbers of filament/material/color usages without schema redesign.

Track product material and waste separately where required.

Internally Manufactured Components Reference Product Variants

An internally manufactured ProductComponent references another ProductVariant.

It does not directly reference a ProductionProfile.

The referenced ProductVariant provides its active/default ProductionProfile for V1 costing.

Prevent direct and indirect circular manufactured-component dependencies.

Units Per Sale and Plate Yield Are Different

unitsPerSale describes how many units are included in a customer purchase.

Plate yield describes how many useful units or outputs are produced by a manufacturing Plate.

Do not treat these values as interchangeable.

Economics Rules

Use Cash Contribution as the primary V1 profitability term.

Conceptually:

Cash Contribution =
Planned Selling Price
- Relevant V1 Cash Costs

Relevant V1 cash costs may include:

Manufacturing/material costs
Purchased components
Internally manufactured components
Consumables
Packaging
Applicable marketplace/payment fees

Active labor should be shown separately rather than silently treated as a cash expense.

Important derived metrics include:

Material cost
Cost per sale
Cash contribution
Margin
Printer hours per sale
Contribution per printer-hour
Active labor hours
Contribution per active-labor hour

Prefer calculating derived values from authoritative inputs rather than persisting duplicate calculated state.

Commercial Readiness

Commercial readiness should be derived from V1-modeled concerns.

Examples of relevant concerns include:

Model commercial-rights status
Third-party IP review
V1 safety review
Product economics

Readiness should explain why a Product or Product Variant received its result.

Potential outcomes include concepts such as:

BLOCKED
REVIEW_REQUIRED
QUESTIONABLE
PROMISING
READY

Exact labels and thresholds may evolve as implementation proceeds.

Do not make legal determinations.

PrintForge records rights and review information and helps identify unresolved issues.

V1 / V2 Boundary

Do not implement V2 features merely because the current architecture could support them.

Examples currently deferred from V1 include:

Shipping calculation and shipping rules
Final QC workflow
Manufactured-component inventory
Spool inventory
Advanced bundles/configurations
Detailed material-science rules
Detailed paint inventory
Full sales/order management
Printer integrations
Automatic Bambu Studio imports
Marketplace integrations
Full accounting
Full fulfillment workflows

Most importantly:

V2-only concepts must not block V1 commercial readiness.

If a feature is documented as V2, do not introduce V1 validation or readiness requirements that depend on it.

Testing Expectations

Use Vitest for:

Unit tests
Domain tests
Calculation tests
Appropriate service/integration tests

Domain/business rules should receive strong automated test coverage.

Test meaningful edge cases, not only happy paths.

Use Playwright for a smaller number of high-value end-to-end workflows.

Do not duplicate every unit test through the browser.

General strategy:

Many fast Vitest tests and fewer high-value Playwright tests.

When fixing a defect in testable business logic, prefer adding a regression test that demonstrates the failure before or alongside the fix.

Development Principles
Prefer Small, Reviewable Changes

Do not make broad unrelated changes when implementing a focused task.

Keep changes small enough that a developer can reasonably review and understand them.

Do Not Invent Requirements

If the existing requirements are ambiguous and the ambiguity materially affects product behavior or architecture, surface the question rather than silently choosing a major new product rule.

Reasonable low-risk implementation details may be chosen when they do not alter documented product behavior.

Avoid Premature Abstraction

Do not introduce abstractions simply because they might become useful later.

Examples include:

Generic repository frameworks
Dependency-injection frameworks
Event buses
Generic shared packages
Generic utility packages
Complex plugin architectures
Additional monorepo orchestration platforms

Before introducing an abstraction, identify the concrete current problem it solves.

Add Dependencies Intentionally

Do not add a third-party dependency when the standard platform or existing stack can reasonably solve the problem.

When proposing a significant new dependency, explain:

What problem it solves
Why existing tools are insufficient
What tradeoffs it introduces
Prefer Clarity Over Cleverness

Code should be understandable by a developer reading it later.

Prefer:

Explicit names
Small focused functions
Clear control flow
Clear domain terminology
Straightforward TypeScript

Avoid unnecessary metaprogramming, indirection, or clever abstractions.

Preserve Domain Terminology

Use the terminology defined by PrintForge consistently.

For example, do not casually rename:

Product Variant to Item
Production Profile to Print Settings
Plate to Job
Cash Contribution to Profit
SourceProfile to ProductionProfile

These terms have specific meanings in the PrintForge domain.

Learning-Oriented Development

PrintForge is both a useful application and a software-development learning/portfolio project.

When acting as a coding agent:

Do not optimize solely for producing the maximum amount of code as quickly as possible.
Prefer implementations that can be understood and explained by the developer.
Keep significant architectural decisions visible.
Explain non-obvious patterns or tradeoffs when appropriate.
Avoid hiding important behavior behind unnecessary abstractions.
Do not rewrite large areas of working code without a concrete reason.
Prefer incremental implementation over generating the entire application at once.

When multiple reasonable approaches exist and the choice would materially affect architecture or learning value, present the tradeoff rather than silently selecting a substantially different direction.

Working With Existing Code

Before modifying existing code:

Inspect the relevant implementation.
Inspect relevant tests.
Check applicable project documentation.
Understand existing naming and patterns.
Make the smallest coherent change that satisfies the requirement.

Do not assume a file or abstraction exists without checking the repository.

Do not replace existing patterns merely with personally preferred patterns unless there is a demonstrated problem.

Documentation

Update documentation when a change materially alters:

Architecture
Domain behavior
Database relationships
V1 requirements
Technology decisions

Significant architectural decisions should be recorded in:

docs/decisions.md

Do not allow implementation and documentation to silently diverge.

Guiding Question

When considering additional complexity, ask:

What current PrintForge problem does this solve?

If there is no concrete answer, prefer the simpler implementation and defer the complexity until it is needed.