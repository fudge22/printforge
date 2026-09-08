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
GET /products/:id/readiness
   ↓
Fastify
   ↓
Domain logic
   ↓
Readiness result
   ↓
React displays result

This prevents business rules from being duplicated between the UI and backend.

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