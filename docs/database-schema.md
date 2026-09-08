PrintForge V1 Database Schema
1. Purpose

This document defines the planned persistence model for PrintForge V1.

It translates the conceptual domain model into relational database structures suitable for PostgreSQL and Drizzle.

This document covers:

Tables.
Primary relationships.
Important persisted fields.
Foreign-key intent.
Derived versus persisted data.
Persistence constraints that protect the domain model.

This document does not replace the conceptual domain model.

If there is a conflict between the database schema and docs/domain-model.md, the domain model should be treated as the business source of truth and the schema should be reconsidered.

Application architecture belongs in docs/architecture.md.

Product behavior and V1 scope belong in docs/requirements.md.

2. Database Principles

The V1 database should follow these principles:

Persist durable business state.
Derive values that can be reliably calculated from underlying data.
Preserve the distinction between provenance, product definition, and actual manufacturing configuration.
Preserve one-to-many relationships rather than using numbered/fixed columns.
Use explicit relational structure for entities with independent business meaning.
Avoid adding tables solely for speculative future features.
Keep V2 concerns out of the V1 schema unless V1 genuinely requires them.
3. Primary Tables

The planned V1 schema contains:

models
model_rights_reviews
source_profiles

products
product_model_links
third_party_ip_reviews
third_party_ip_items
safety_reviews

product_variants
production_profiles
plates

filaments
filament_usages

product_components
consumable_usages
post_processing_steps

market_observations

These names are conceptual schema names. Exact Drizzle implementation details may evolve while preserving the relationships and meaning described here.

4. Common Persistence Conventions

Unless there is a strong reason otherwise, persisted entities should generally support:

A unique primary identifier.
Creation timestamp.
Last-updated timestamp where useful.

Identifiers should be opaque to business logic.

The exact PostgreSQL identifier type may be chosen during implementation, but identifiers must not encode business meaning.

Human-readable names must not be relied upon as primary keys.

5. models

Represents digital 3D Models.

Suggested fields
id
name
description
notes
created_at
updated_at

Optional model-file or reference information may be added when needed by the first workflow.

Relationships
models
  ├── 0..many source_profiles
  ├── 0..many model_rights_reviews
  └── 0..many product_model_links
Important rule

Manufacturing material, plate layout, production yield, and actual print configuration do not belong on models.

A Model represents the digital design, not manufacturing truth.

6. source_profiles

Represents source/provenance information associated with a Model.

Suggested fields
id
model_id
source_type
source_name
source_reference
creator_name
suggested_material
suggested_settings
notes
created_at
updated_at

Not every field must be implemented immediately. Fields should be introduced as required by current workflows.

Foreign key
source_profiles.model_id
    → models.id
Important rule

Information recorded here is source-provided or provenance information.

It must not be treated as the current production configuration for costing or capacity calculations.

7. model_rights_reviews

Persists Model Rights Review state.

Suggested fields
id
model_id
review_status
license_name
commercial_use_status
attribution_required
permission_details
unresolved_questions
notes
reviewed_at
created_at
updated_at
Foreign key
model_rights_reviews.model_id
    → models.id
Persistence intent

A rights review is user-entered/reviewed state and should be persisted.

The database records the user's known review state.

It must not encode a claim that PrintForge has made a legal determination.

8. products

Represents the commercial Product concept.

Suggested fields
id
name
description
notes
created_at
updated_at
Relationships
products
  ├── 0..many product_model_links
  ├── 0..many product_variants
  ├── 0..many third_party_ip_reviews
  └── 0..many safety_reviews

The Product is distinct from both the digital Model and the sellable ProductVariant.

9. product_model_links

Join table representing the many-to-many relationship between Products and Models.

Suggested fields
id
product_id
model_id
notes
created_at
Foreign keys
product_model_links.product_id
    → products.id

product_model_links.model_id
    → models.id
Constraint

The same Product/Model relationship should not normally be duplicated unintentionally.

A unique constraint may be used on:

(product_id, model_id)

unless future requirements establish a reason to allow multiple semantically distinct links.

10. third_party_ip_reviews

Persists a Product-level third-party intellectual-property review.

Suggested fields
id
product_id
review_status
notes
reviewed_at
created_at
updated_at
Foreign key
third_party_ip_reviews.product_id
    → products.id
Important distinction

This table is separate from model_rights_reviews.

Model rights answer whether the source Model appears commercially usable.

Third-party IP review records concerns about recognizable IP associated with the Product itself.

11. third_party_ip_items

Represents individual concerns identified within a Third-Party IP Review.

Suggested fields
id
third_party_ip_review_id
item_type
name
description
status
notes
created_at
updated_at
Foreign key
third_party_ip_items.third_party_ip_review_id
    → third_party_ip_reviews.id
Relationship
third_party_ip_reviews
    └── 0..many third_party_ip_items

A Product review must be able to contain multiple identified IP items.

12. safety_reviews

Persists lightweight Product safety-review state.

Suggested fields
id
product_id
review_status
notes
reviewed_at
created_at
updated_at

Additional advisory categories may be added when the V1 workflow requires them.

Foreign key
safety_reviews.product_id
    → products.id
Important rule

The schema stores review state only.

It must not imply regulatory certification, laboratory approval, or formal compliance.

13. product_variants

Represents a specific sellable Product variation.

Suggested fields
id
product_id
name
description
planned_selling_price
units_per_sale
packaging_cost
notes
created_at
updated_at

Optional marketplace or payment-fee inputs may later be associated here if required by V1 economics.

Foreign key
product_variants.product_id
    → products.id
Important rules

planned_selling_price is persisted because it is user-entered commercial intent.

units_per_sale is persisted because it defines the quantity included in one sale.

units_per_sale is not the same as Plate yield.

Calculated profitability metrics must not be stored here merely for convenience.

14. production_profiles

Represents an actual manufacturing configuration for a ProductVariant.

Suggested fields
id
product_variant_id
name
is_active
printer_reference
slicer_reference
settings_notes
created_at
updated_at

The exact mechanism for current/default production configuration may evolve.

For V1, the schema must support determining which ProductionProfile is applicable to current costing and commercial evaluation.

Foreign key
production_profiles.product_variant_id
    → product_variants.id
Relationship
product_variants
    └── 0..many production_profiles
Important rule

ProductionProfile represents actual manufacturing truth.

SourceProfile must not substitute for this entity.

15. plates

Represents a print job/build plate used by a ProductionProfile.

Suggested fields
id
production_profile_id
name
print_hours
usable_units_produced
notes
created_at
updated_at
Foreign key
plates.production_profile_id
    → production_profiles.id
Relationship
production_profiles
    └── 0..many plates
Important rules

Plate owns:

Print duration.
Usable output/yield.
Filament usage.

usable_units_produced is not units_per_sale.

A ProductionProfile may require multiple Plates.

16. filaments

Represents a reusable filament/material definition.

Suggested fields
id
name
material_type
brand
color
purchase_quantity
purchase_cost
notes
created_at
updated_at

The exact unit used for quantity must be explicit and consistent.

If filament cost is calculated from weight, the schema should support deriving a cost per unit weight from purchase quantity and purchase cost.

Important rule

A Filament describes the reusable material definition.

It does not represent consumption by itself.

Actual consumption belongs to filament_usages.

17. filament_usages

Represents filament consumed by a specific Plate.

Suggested fields
id
plate_id
filament_id
quantity_used
created_at
updated_at
Foreign keys
filament_usages.plate_id
    → plates.id

filament_usages.filament_id
    → filaments.id
Relationship
plates
    └── 0..many filament_usages
Important rule

Filament usage must be modeled as a relational collection.

The schema must never introduce fixed columns such as:

filament_1
filament_2
filament_3

Material cost should be derived from actual usage and Filament cost.

18. product_components

Represents additional components required by a ProductVariant.

V1 supports two component types:

PURCHASED
INTERNALLY_MANUFACTURED
Suggested fields
id
product_variant_id
component_type
name
quantity_per_sale

purchased_unit_cost

referenced_product_variant_id

notes
created_at
updated_at

Some fields are applicable only to a particular component type.

Foreign keys
product_components.product_variant_id
    → product_variants.id

For internally manufactured components:

product_components.referenced_product_variant_id
    → product_variants.id
PURCHASED rule

A PURCHASED component should have the information necessary to derive its contribution to cost per sale.

Conceptually:

Purchased Component Cost per Sale =
quantity_per_sale × purchased_unit_cost
INTERNALLY_MANUFACTURED rule

An INTERNALLY_MANUFACTURED component references another ProductVariant.

It must not directly reference a ProductionProfile as the identity of the component.

Conceptually:

Current ProductVariant
      ↓
ProductComponent
      ↓
Referenced ProductVariant
      ↓
Applicable ProductionProfile

This allows manufacturing configuration to change without changing what component the parent ProductVariant requires.

Cycle constraint

Internally manufactured component relationships must not create direct or indirect cycles.

A standard relational foreign key cannot prevent all recursive cycles.

Cycle detection should therefore be enforced in domain/application logic before a relationship is persisted.

Database safeguards may be added where practical, but the business rule must not rely solely on simple foreign-key constraints.

19. consumable_usages

Represents expendable consumables used in producing a ProductVariant.

Suggested fields
id
product_variant_id
name
quantity_used
unit_cost
cost_per_sale
notes
created_at
updated_at

Where possible, cost_per_sale should be derived from lower-level quantities rather than independently stored.

If V1 does not require reusable consumable definitions, a separate consumables catalog table is unnecessary.

The simplest representation that supports current costing should be preferred.

Foreign key
consumable_usages.product_variant_id
    → product_variants.id
20. post_processing_steps

Represents active production/finishing work.

Suggested fields
id
product_variant_id
name
description
active_labor_hours_per_sale
sequence
notes
created_at
updated_at
Foreign key
post_processing_steps.product_variant_id
    → product_variants.id
Persistence intent

User-entered process definition and active labor estimates are persisted.

Calculated total active labor should normally be derived by combining the applicable post-processing steps.

21. market_observations

Represents observed comparable market listings or offers.

Suggested fields
id
product_id
product_variant_id
marketplace
seller_name
comparable_description
asking_price
observed_at
source_reference
notes
created_at
updated_at

The schema may associate an observation with a Product or, when meaningful, a particular ProductVariant.

The exact nullable relationship should be implemented consistently.

Important rule

The stored price represents an observed asking price.

It must not be labeled in persistence or application logic as:

market_value
verified_sale_price
expected_sale_price

unless a future feature actually establishes that information.

22. Derived Economic Values

The following values should generally not be persisted as independent mutable fields:

material_cost
manufacturing_cost
cost_per_sale
cash_contribution
cash_contribution_margin
printer_hours_per_sale
contribution_per_printer_hour
active_labor_hours_per_sale
contribution_per_active_labor_hour

They should be calculated from authoritative underlying records.

For example:

Filament purchase information
        +
FilamentUsage
        ↓
Material Cost

and:

Planned Selling Price
        -
Relevant V1 Cash Costs
        ↓
Cash Contribution

Storing both source values and mutable calculated copies creates a risk of stale or contradictory data.

23. Persisted Review State

Unlike calculated economic metrics, review state represents user-entered business information and should be persisted.

Examples include:

Model Rights Review status.
Third-Party IP Review status.
Third-Party IP Items.
Safety Review status.
Review notes.
Review dates.
Market Observations.

These values cannot be recreated solely from manufacturing data.

24. Product Readiness Persistence

Product readiness should generally be derived from authoritative V1 state.

A mutable readiness_status field should not become the sole source of truth if the status can be calculated from:

Review states.
Manufacturing completeness.
Economics.
Other modeled V1 criteria.

If readiness results are persisted later for audit/history purposes, they should be treated as snapshots or assessment history rather than replacing the derivation logic.

The initial V1 implementation should prefer deriving current readiness.

25. Delete and Referential Integrity Behavior

Delete behavior should be intentional.

The implementation should avoid accidental cascading deletion of meaningful business history.

Examples:

Deleting a Product must not silently leave invalid ProductModelLinks.
Deleting a Model must respect existing Product relationships.
Deleting a ProductVariant referenced as an internally manufactured component must not create broken component relationships.
Deleting a ProductionProfile should account for its Plates and FilamentUsage records.
Deleting a Plate should account for its FilamentUsage records.

Exact ON DELETE behavior should be chosen during implementation based on the expected user workflow.

Do not use cascading deletes merely because they are convenient.

26. Numeric Data and Precision

Financial and production values must use types that avoid unnecessary floating-point errors in persisted monetary data.

For PostgreSQL, monetary values should generally use an appropriate fixed-precision numeric/decimal representation rather than binary floating-point.

Examples include:

Planned selling price.
Packaging cost.
Purchased component cost.
Filament purchase cost.
Consumable cost.
Market asking price.

Production measurements such as:

Print hours.
Weight.
Quantity used.
Labor hours.

should use numeric representations with precision appropriate to the measurement.

Exact PostgreSQL precision and scale may be chosen when the Drizzle schema is implemented.

27. Enum-Like Values

Values with a known finite domain should be represented consistently.

Examples include:

ProductComponent.component_type

PURCHASED
INTERNALLY_MANUFACTURED

and review/readiness states.

Whether these are represented using PostgreSQL enums, constrained text, or application-level unions should be decided based on migration flexibility and implementation simplicity.

The chosen persistence representation must preserve the domain vocabulary.

28. Current/Active Production Profile

A ProductVariant may have multiple ProductionProfiles over time, but current economic calculations need an applicable production configuration.

The schema must support determining the current/default/active ProductionProfile.

Possible implementation approaches include:

production_profiles.is_active

or a reference from ProductVariant to the current profile.

The implementation should preserve these invariants:

At most one current/default profile should drive current economics for a ProductVariant.
Historical profiles may remain available.
Changing the current profile must not rewrite historical source data.
ProductComponents referencing a ProductVariant continue referencing the ProductVariant rather than a particular ProductionProfile.

The exact mechanism should be finalized when the Drizzle schema is implemented.

29. Relationship Summary

Conceptually:

models
├── source_profiles
├── model_rights_reviews
└── product_model_links
         │
         └── products
             ├── third_party_ip_reviews
             │   └── third_party_ip_items
             │
             ├── safety_reviews
             │
             ├── market_observations
             │
             └── product_variants
                 ├── production_profiles
                 │   └── plates
                 │       └── filament_usages
                 │           └── filaments
                 │
                 ├── product_components
                 │   └── referenced product_variant
                 │       when INTERNALLY_MANUFACTURED
                 │
                 ├── consumable_usages
                 └── post_processing_steps

This diagram communicates persistence relationships, not exact deletion rules or cardinalities for every optional relationship.

30. V1 Tables Intentionally Omitted

V1 should not add persistence structures merely to anticipate later functionality.

The initial schema does not require dedicated tables for:

Orders.
Customers.
Shipments.
Shipping rates.
Shipping labels.
Taxes.
Inventory transactions.
Accounting entries.
Final QC inspections.
Regulatory certification.
General overhead allocation.
E-commerce listings.
Sales history.

These may become valid concepts in later versions.

Their absence must not prevent V1 from evaluating whether a product appears commercially viable.

31. First Vertical Slice Persistence

The first end-to-end workflow does not require every V1 table to be implemented immediately.

The initial persistence path should support enough schema to:

Model
  ↓
ModelRightsReview

Product
  ↓
ProductVariant
  ↓
ProductionProfile
  ↓
Plate
  ↓
FilamentUsage
  ↓
Filament

and enough ProductVariant information to persist:

Planned selling price.
Packaging cost.
Units per sale.

From that data, the domain should be able to derive:

Material cost.
Cost per sale.
Cash Contribution.
Cash Contribution Margin.
Printer hours per sale.
Cash Contribution per printer hour.
Initial readiness assessment.

Additional tables should be introduced incrementally as their workflows are implemented.

32. Schema Change Principle

A database change should follow the domain requirement, not create one.

Before adding a new table, field, relationship, or persisted calculated value, ask:

What current PrintForge business requirement requires this data to be persisted?

If the value can be derived reliably, prefer deriving it.

If the concept belongs to V2, defer it.

If the proposed schema contradicts domain-model.md, resolve the domain question before implementing the schema change.