PrintForge — Architecture Decisions

This document records significant technical decisions made for PrintForge and the reasoning behind them.

The goal is not to document every implementation choice. Decisions should be recorded here when they materially affect the architecture, technology stack, or long-term development of the application.

ADR-001: Use TypeScript Across the Application

Status: Accepted

Decision

Use TypeScript as the primary application language for both the frontend and backend.

Rationale

Using TypeScript across the application provides:

Static type checking
Strong IDE support
Shared language between frontend and backend
Easier refactoring
Compatibility with the selected frontend, backend, database, and testing tools

Using one primary language also reduces unnecessary context switching while developing PrintForge.

Consequences

Both React and the Fastify backend will use TypeScript.

Database access through Drizzle and domain/business logic will also be written in TypeScript.

ADR-002: Use React for the Frontend

Status: Accepted

Decision

Use React with TypeScript for the PrintForge web application.

Rationale

React provides a mature component model and broad ecosystem for building interactive web applications.

It also provides relevant experience for modern TypeScript frontend development.

Consequences

Frontend code will live in:

apps/web

React will be responsible for presentation and user interaction but will not contain authoritative PrintForge business rules.

ADR-003: Use Fastify for the Backend API

Status: Accepted

Decision

Use Fastify with Node.js and TypeScript for the PrintForge backend.

Rationale

Fastify provides a lightweight backend framework without imposing a large amount of framework-specific architecture.

It allows PrintForge to maintain explicit architectural boundaries while avoiding unnecessary infrastructure.

The backend can use familiar concepts such as routes, services, validation, and data access while remaining relatively lightweight.

Alternatives Considered

Express

Widely used and simple, but provides fewer conventions and would require more architectural decisions to be made manually.

NestJS

Provides strong architectural conventions and concepts similar to structured .NET applications, but introduces more framework-specific structure and complexity than PrintForge currently requires.

Consequences

Backend code will live in:

apps/api

Fastify will handle HTTP concerns while business logic remains outside route handlers where practical.

ADR-004: Use REST for Client/Server Communication

Status: Accepted

Decision

Expose PrintForge backend functionality through a RESTful HTTP API.

Rationale

REST provides a clear separation between the React frontend and backend.

It is widely understood, technology-independent, and allows the frontend and backend to evolve independently while communicating through explicit HTTP contracts.

REST experience is also transferable across backend technologies, including .NET and Node.js.

Alternatives Considered

Potential alternatives include GraphQL, tRPC, and other RPC approaches.

These do not currently solve a PrintForge requirement that justifies introducing them.

Consequences

React will communicate with Fastify through HTTP endpoints.

The frontend will never communicate directly with PostgreSQL or Drizzle.

ADR-005: Use PostgreSQL as the Database

Status: Accepted

Decision

Use PostgreSQL as PrintForge's relational database.

Rationale

The PrintForge domain is strongly relational.

Examples include:

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

This diagram represents the conceptual journey through the domain. It does
not imply a direct one-to-many relationship between Model and Product.
Models and Products have a many-to-many relationship represented through
ProductModelLink, as defined in `docs/domain-model.md`.

PrintForge also contains many-to-many relationships, reusable manufactured components, review records, and shared entities such as filament.

PostgreSQL provides:

Foreign-key enforcement
Strong relational modeling
Constraints
Transactions
Powerful querying
Mature tooling
Support for JSON when flexible data is appropriate
Alternatives Considered

MySQL

A capable relational database that could support PrintForge, but PostgreSQL was preferred for this project.

MongoDB

Its document-oriented model does not align as naturally with PrintForge's highly relational domain.

Consequences

The relational database schema is a significant part of PrintForge's architecture and should preserve appropriate data integrity at the database level.

ADR-006: Use Drizzle for Database Access

Status: Accepted

Decision

Use Drizzle as the TypeScript database access layer for PostgreSQL.

Rationale

Drizzle provides type-safe TypeScript database access while remaining relatively close to SQL and relational database concepts.

This is desirable for PrintForge because it provides application-development productivity without hiding too much of the underlying database behavior.

It also allows the project to exercise transferable PostgreSQL and SQL skills.

Alternatives Considered

Prisma

Prisma provides a higher-level abstraction and strong developer experience.

It was considered seriously, but Drizzle was preferred because its SQL-oriented approach provides greater exposure to relational database concepts while still providing TypeScript type safety.

Raw SQL

PrintForge may use SQL where appropriate, but using raw SQL exclusively would give up useful type safety and schema integration.

Consequences

Drizzle schema definitions and database-specific code will live in:

packages/database

Generated migrations should be reviewed so that database changes remain understandable rather than being treated as a black box.

ADR-007: Use a Monorepo

Status: Accepted

Decision

Store the PrintForge frontend, backend, domain logic, database code, tests, and documentation in one Git repository.

Rationale

PrintForge is one product whose features commonly require coordinated changes across multiple application layers.

For example:

Database
   ↓
Domain
   ↓
REST API
   ↓
React

Keeping these pieces in one repository simplifies development, versioning, testing, and feature changes.

Separate repositories would add coordination overhead without providing a meaningful V1 benefit.

Consequences

The repository will initially contain:

apps/
├── web/
└── api/

packages/
├── domain/
└── database/

Additional workspaces should only be introduced when a concrete requirement justifies them.

ADR-008: Use pnpm Workspaces

Status: Accepted

Decision

Use pnpm workspaces to manage the PrintForge monorepo.

Rationale

PrintForge requires lightweight workspace management but does not currently require a larger monorepo platform.

pnpm workspaces allow the applications and packages in the repository to be managed together while retaining clear package boundaries.

Alternatives Considered

More advanced monorepo tooling such as Nx or Turborepo may provide useful capabilities at larger scale.

PrintForge does not currently have requirements that justify adding that complexity.

Consequences

The initial repository will use:

pnpm-workspace.yaml

and root-level scripts where useful for common development operations.

ADR-009: Use Vitest for Unit and Integration Testing

Status: Accepted

Decision

Use Vitest as the primary unit and integration testing framework.

Rationale

Vitest provides strong TypeScript support and fits naturally into a modern TypeScript application.

PrintForge contains significant business logic involving manufacturing costs, economics, and commercial-readiness rules. These rules should be independently testable without requiring the browser or full application stack.

Alternatives Considered

Jest

A mature and widely used testing framework with highly transferable concepts and a similar testing style.

Vitest was selected because it fits the planned modern TypeScript development environment while providing the unit-testing capabilities PrintForge requires.

Consequences

PrintForge should maintain strong automated coverage around domain/business rules.

Tests should emphasize behavior and edge cases rather than implementation details.

ADR-010: Use Playwright for End-to-End Testing

Status: Accepted

Decision

Use Playwright for browser-based end-to-end testing.

Rationale

Playwright allows PrintForge to test important workflows from the user's perspective.

The project should use end-to-end testing strategically rather than duplicating all lower-level tests through the browser.

Consequences

The overall testing strategy is:

Many fast Vitest tests and a smaller number of high-value Playwright tests.

Playwright coverage will be introduced once meaningful end-to-end workflows exist.

ADR-011: Keep Business Logic in a Dedicated Domain Package

Status: Accepted

Decision

Place core PrintForge calculations and business rules in:

packages/domain

rather than implementing them directly in React components, Fastify routes, or Drizzle queries.

Rationale

PrintForge's primary value comes from its domain logic, including:

Manufacturing cost calculations
Cash contribution
Margin
Printer-hour economics
Active-labor economics
Commercial-readiness evaluation

Keeping these rules separate improves:

Testability
Maintainability
Reuse
Clarity
Independence from infrastructure
Consequences

The domain package should remain independent of React and Fastify.

Where practical, calculations should also remain independent of Drizzle and PostgreSQL.

ADR-012: Avoid Premature Shared Packages and Abstractions

Status: Accepted

Decision

Do not initially create generic packages or architectural layers without a demonstrated need.

Examples include:

Generic shared package
Dedicated API contracts package
Generic repository abstraction
Dependency-injection framework
Event bus
Additional monorepo orchestration tools
Rationale

PrintForge should remain understandable and should introduce abstractions in response to actual duplication or complexity rather than anticipated future needs.

For example, if frontend and backend API contract definitions begin to create meaningful duplication, a focused:

packages/contracts

package may be introduced at that point.

Consequences

Some implementation decisions are intentionally deferred.

This is deliberate rather than incomplete architecture.

ADR-013: Keep V2 Concerns Out of V1 Architecture

Status: Accepted

Decision

Features explicitly deferred to V2 must not create mandatory infrastructure or readiness requirements in V1.

Examples currently include:

Shipping calculation
Final QC workflow
Manufactured-component inventory
Advanced bundles/configurations
Detailed material science
Detailed paint inventory
Full accounting
Full order fulfillment
Rationale

Designing infrastructure around future requirements would increase V1 complexity and delay delivery without validating whether those capabilities are actually needed.

Consequences

V1 may leave reasonable extension points for future capabilities, but V2 concepts must not block V1 workflows or commercial-readiness results.

ADR-014: Prefer the Simplest Architecture That Solves the Current Problem

Status: Accepted

Decision

New frameworks, libraries, packages, patterns, and infrastructure should be introduced only when they solve a concrete PrintForge problem.

Rationale

PrintForge is intended to be both a useful product and a development project. Unnecessary architectural complexity would make the code harder to understand while providing little practical value.

When considering a new architectural element, ask:

What current PrintForge problem does this solve?

If there is no concrete answer, defer the decision.

Consequences

The architecture is expected to evolve as real implementation needs are discovered.

Changes to major architectural decisions should be documented in this file.

ADR-015: Prefer Derived Business Metrics Over Persisted Calculated State

Status: Accepted

Decision

Business values that can be reliably calculated from authoritative persisted
inputs should generally be derived rather than stored as independent mutable
state.

Examples include:

- Material cost
- Cost per sale
- Cash Contribution
- Cash Contribution Margin
- Printer hours per sale
- Cash Contribution per printer hour
- Active labor hours per sale
- Cash Contribution per active labor hour
- Current product-readiness assessment

Rationale

Persisting calculated values alongside their source inputs creates the risk
that the calculated value becomes stale or inconsistent when the underlying
data changes.

Keeping calculations in the domain layer provides a single authoritative
implementation of PrintForge business rules and makes those rules easier to
test and explain.

Consequences

Authoritative inputs and user-reviewed state are persisted.

Derived economic metrics are normally calculated by packages/domain from
current authoritative inputs.

Review states, market observations, and other user-entered findings remain
persisted because they cannot be reconstructed from manufacturing data alone.

If calculated values are persisted later for caching, reporting, or history,
they must be treated as derived snapshots rather than the authoritative source
of current business state.

ADR-016: Keep Detailed Slicer Configuration in the Slicer

Status: Accepted

Decision

The slicer is authoritative for printer profiles, nozzle size, layer height, infill, wall count, support configuration, and other detailed slicing settings. The user manages those settings there. PrintForge V1 records the chosen Plate's commercially relevant planned print time, usable finished-unit output, and per-filament consumption; production notes may retain details the user wants to remember. V1 does not duplicate or synchronize detailed slicer configuration.

Rationale

Commercial evaluation needs planned production outputs without recreating a slicer's configuration model. A user can evaluate a minimally prepared slice and refine its Plate inputs after further slicer work.

Consequences

Known Plate-level inputs remain useful during preliminary evaluation. Product-level economics require sufficient production data on every required Plate, as defined in ADR-017; unspecified refinements may still make available estimates preliminary. Missing usage categories remain distinct from explicit zero, and the UI identifies estimates with incomplete relevant inputs. V1 does not include slicer synchronization, Bambu Studio integration, automatic detection of external changes, printer or fleet management, print-job history, or automatic production optimization.

Future consideration: PrintForge may eventually distinguish production plans optimized for production from plans that are not. A possible progression is Model import, initial slice, preliminary economics, slicer optimization, refined economics, then a production-ready plan. V1 has no required optimization status, no productionOptimizationStatus field, no criteria for being optimized, and no automatic optimization determination. More complicated multi-plate production scenarios also remain a separate future design discussion.

ADR-017: Use One Finished-Unit Batch Quantity Across a ProductionProfile's Plates

Status: Accepted

Decision

In V1, every Plate in a ProductionProfile is planned to support the same chosen batch quantity of finished ProductVariant units. plannedUsableUnits records that quantity for each Plate, regardless of how many physical objects the Plate contains. The user arranges those objects in the slicer. PrintForge combines the required Plates' planned costs and printer-time contributions for economics.

Sum the material costs and planned print times of all required Plates, then divide each total by the shared batch quantity to derive material cost and printer hours per finished unit. Keep unitsPerSale separate for conversion to per-sale economics. Printer hours are additive manufacturing capacity consumed, not elapsed wall-clock time, including when Plates print simultaneously.

Retain and display entered Plate-level information while other required Plates are incomplete, identifying the incomplete or missing Plate and the specific information needed. While any required Plate lacks indispensable production data, do not present partial ProductionProfile material cost per finished unit, printer hours per finished unit or per sale, Cash Contribution, Cash Contribution Margin, or Cash Contribution per printer hour as product-level estimates. Guide the user to complete the missing information.

Unlock relevant aggregate calculations once all required Plates have sufficient production data, subject to their other required inputs. Preserve the distinction between unspecified refinement inputs and explicit zero; unknown values must not silently become zero. Available estimates may remain preliminary where refinements are unspecified.

Rationale

This represents the commercially relevant output of a multi-Plate production plan without requiring PrintForge to model physical object counts. For a batch of 12 Knitted Ghosts, a Plate with 12 bodies and a Plate with 24 eyes each support 12 finished Ghosts.

An 8-hour/$9 Body Plate and a 2-hour/$3 Eyes Plate consume 10 printer-hours and $12 in material for that batch, or 5/6 printer-hour and $1 per finished Ghost. Using only the Body Plate would understate the required manufacturing cost and capacity.

Consequences

V1 does not model Plate object/component quantities, leftover component inventory, mismatched Plate-yield balancing, theoretical maximum Plate capacity, or automatic Plate-capacity optimization. Independently manufactured, separately sellable items remain within the existing ProductVariant and INTERNALLY_MANUFACTURED ProductComponent concepts. Optional bundles of independent products remain a future design discussion.

The precise boundary between indispensable production inputs and optional refinements remains to be worked through. This decision establishes aggregate availability without inventing a comprehensive readiness rule or prescribing validation or schema changes prematurely. Aggregates remain derived from authoritative Plate inputs, consistent with ADR-015.
