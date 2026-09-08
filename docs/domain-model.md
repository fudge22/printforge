PrintForge V1 Domain Model
1. Purpose

This document defines the authoritative conceptual domain model for PrintForge V1.

It describes:

Core domain entities.
Relationships between those entities.
Ownership and responsibility boundaries.
Important terminology.
Domain invariants and modeling rules.

This document describes the business domain, not the physical database schema.

Database tables, foreign keys, indexes, and persistence implementation belong in database-schema.md.

Application architecture belongs in architecture.md.

Product behavior and V1 scope belong in requirements.md.

2. Core Domain Hierarchy

The primary PrintForge manufacturing hierarchy is:

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

This hierarchy represents the journey from a digital 3D model to a sellable product and ultimately to the physical manufacturing information needed to produce it.

The relationship between Model and Product is many-to-many and is represented through ProductModelLink.

The diagram above therefore represents the conceptual journey rather than implying a direct one-to-many Model → Product database relationship.

3. Model

A Model represents a digital 3D model that may be used as part of a product.

Examples include:

An STL file.
A 3MF file.
A model downloaded from a model marketplace.
A model created by the user.
An AI-generated model.
A model obtained from another designer.

A Model describes the digital design itself.

It does not describe how the user currently manufactures a product from that design.

3.1 Model Responsibilities

A Model may contain information such as:

Name.
Description.
File or model reference information.
Creator information when known.
General notes.

Model-specific provenance and rights information are represented through related concepts rather than by treating the Model itself as manufacturing configuration.

3.2 Model Must Not Own Manufacturing Material

A Model must not own the actual production filament or material used to manufacture a Product Variant.

The same Model could be manufactured:

In PLA for one product.
In PETG for another.
In different colors.
With different printers.
With different slicer settings.
With different plate layouts.

Actual material usage therefore belongs to manufacturing configuration.

4. Source Profile

A SourceProfile records useful information about how a Model was obtained or originally presented.

Examples may include:

Source marketplace.
Source URL or reference.
Original creator.
Original model description.
Suggested material.
Suggested print settings.
Other source-provided information.
4.1 SourceProfile Is Provenance

A SourceProfile represents:

Where did this Model come from, and what did its source say about it?

It does not represent:

How am I actually manufacturing this Product Variant?

That responsibility belongs to ProductionProfile.

4.2 SourceProfile vs ProductionProfile

This distinction is a domain invariant.

SourceProfile
    = provenance / source information

ProductionProfile
    = actual manufacturing truth

Source-provided print settings may be useful reference information, but they must not silently become the manufacturing configuration used for costing or capacity calculations.

5. Model Rights Review

A ModelRightsReview records the user's current understanding of whether a Model may be appropriate for commercial use.

It may contain information such as:

License information.
Commercial-use permission.
Attribution requirements.
Permission obtained directly from a creator.
Unresolved rights questions.
Review status.
Notes.
5.1 Rights Review Is Recorded Knowledge

PrintForge records what the user knows and what has been reviewed.

It does not make a legal determination.

5.2 AI-Generated Models

A Model being AI-generated does not automatically establish that it is free from intellectual-property concerns.

AI generation may be relevant provenance information but must not automatically produce a commercially-clear rights status.

6. Product

A Product represents the commercial concept the user is considering selling.

Examples:

"Dragon Controller Stand"

"Modular Desk Organizer"

"Wall-Mounted Headphone Holder"

A Product is distinct from the digital Model used to manufacture it.

A single Product may use multiple Models.

A single Model may also be used by multiple Products.

7. ProductModelLink

A ProductModelLink represents the many-to-many relationship between Products and Models.

Conceptually:

Product
   │
   ├── ProductModelLink ── Model A
   │
   ├── ProductModelLink ── Model B
   │
   └── ProductModelLink ── Model C

This allows:

A Product to incorporate multiple Models.
A Model to be reused by multiple Products.

The existence of a Model relationship does not mean that the Model is independently sold.

8. Third-Party IP Review

A ThirdPartyIpReview records intellectual-property concerns associated with the commercial Product that may exist independently of the Model's source license.

This distinction is important.

A Model may have a license permitting commercial printing while the resulting Product still contains third-party intellectual property.

Examples include:

A recognizable fictional character.
A company logo.
A sports-team logo.
Brand artwork.
A trademark or brand name.
Other recognizable third-party material.
8.1 Third-Party IP Items

A ThirdPartyIpReview may contain multiple identified IP items.

Conceptually:

ThirdPartyIpReview
        │
        ├── ThirdPartyIpItem
        ├── ThirdPartyIpItem
        └── ThirdPartyIpItem

This allows a Product to contain more than one potential third-party concern.

8.2 Rights Review vs Third-Party IP Review

These reviews answer different questions.

ModelRightsReview
    "Do I appear to have permission to commercially use this Model?"

ThirdPartyIpReview
    "Does the Product itself contain or reference third-party IP
     that may create a separate commercial concern?"

Neither review constitutes legal advice or a legal determination.

9. Safety Review

A SafetyReview represents a lightweight assessment of product-safety concerns.

It may identify areas requiring additional consideration before a Product is sold.

The SafetyReview is intentionally advisory.

It is not:

Regulatory certification.
Laboratory testing.
Formal product-safety approval.
A guarantee that a Product is safe.

Safety concerns modeled in V1 may contribute to product readiness.

10. Product Variant

A ProductVariant represents a specific sellable variation of a Product.

Examples might include:

Product: Dragon Controller Stand

Variants:
- Black
- Red
- Large
- Small
- Two-pack

The Product represents the overall commercial concept.

The ProductVariant represents what is actually sold.

10.1 Variant-Level Economics

Commercial and manufacturing calculations should operate at the appropriate sellable-variant level.

Different variants may have different:

Selling prices.
Material requirements.
Components.
Packaging.
Manufacturing time.
Plate configurations.
Production costs.
10.2 Units Per Sale

A ProductVariant must be able to represent how many manufactured units are required for one sale.

unitsPerSale is a commercial quantity.

It must not be confused with plate yield.

Example:

A plate produces:        8 usable pieces
A customer receives:     2 pieces per sale

Plate yield = 8
unitsPerSale = 2

These values represent different concepts and must remain separate.

11. Production Profile

A ProductionProfile represents an actual known way of manufacturing a ProductVariant.

It answers:

How do I currently manufacture this variant?

A ProductionProfile may contain information relevant to a specific manufacturing configuration, such as:

Printer or printer class.
Slicer configuration.
Nozzle or manufacturing settings.
Other production-specific information.

Most importantly, the ProductionProfile owns the collection of Plates required to manufacture the variant under that configuration.

11.1 Production Profiles Over Time

A ProductVariant may have more than one ProductionProfile over time.

This supports manufacturing changes such as:

Moving to another printer.
Changing plate layout.
Changing material.
Improving print settings.
Reducing print time.
Improving yield.

One ProductionProfile may be designated as the current/default/active manufacturing configuration used for current costing and commercial evaluation.

The exact persistence mechanism for identifying that profile belongs in the database design.

11.2 Manufacturing Truth

ProductionProfile is the source of actual manufacturing truth.

Costing and capacity calculations should use the applicable ProductionProfile rather than SourceProfile suggestions.

12. Plate

A Plate is a first-class manufacturing concept representing a printer build plate or print job required as part of manufacturing a ProductVariant.

A ProductionProfile may require one or more Plates.

Example:

Production Profile
   │
   ├── Plate A — main body
   ├── Plate B — lid
   └── Plate C — accessories
12.1 Plate Responsibilities

A Plate owns manufacturing information associated with that print job, including:

Print duration.
Usable output/yield.
Filament usage.

The Plate is the natural location for these values because they describe the actual manufacturing batch.

12.2 Plate Yield

Plate yield represents usable manufactured output produced by the Plate.

Yield must remain distinct from ProductVariant.unitsPerSale.

This distinction allows PrintForge to calculate how much printer capacity is required for each sale.

12.3 Do Not Model Every Printed Object Automatically

PrintForge should not automatically create a separate domain entity for every tiny printed object appearing on a Plate.

A printed item should become independently modeled only when doing so provides meaningful business value, such as when it:

Has its own cost significance.
Has an assembly role that needs tracking.
Is reused elsewhere.
Is independently manufactured.
Improves understanding of the manufacturing process.

The goal is to model meaningful manufacturing concepts rather than reproduce slicer geometry inside the business domain.

13. Filament

A Filament represents a material that may be consumed during printing.

Relevant information may include:

Material type.
Brand.
Color.
Purchase quantity.
Purchase cost.
Other information needed to derive material cost.

Filament represents the reusable material definition.

Actual consumption belongs to FilamentUsage.

14. Filament Usage

A FilamentUsage represents the amount of a particular Filament consumed by a particular Plate.

Conceptually:

Plate
  │
  ├── FilamentUsage ── Black PLA
  ├── FilamentUsage ── White PLA
  └── FilamentUsage ── Red PLA

A Plate may have zero, one, or many FilamentUsage records.

There must not be a fixed number of filament slots.

Incorrect modeling:

filament1
filament2
filament3
...
filament16

Correct modeling:

Plate
   ↓
0..many FilamentUsage

Material cost should be derived from actual filament consumption and the relevant filament cost.

15. Product Component

A ProductComponent represents an additional component required for a ProductVariant.

Components have two V1 categories:

PURCHASED

INTERNALLY_MANUFACTURED
15.1 Purchased Component

A PURCHASED component represents something obtained externally and included with the sold ProductVariant.

Examples might include:

Screws.
Magnets.
Bearings.
Adhesive pads.
Rubber feet.
Electronic components.
Hardware.

Its applicable purchase cost contributes to the ProductVariant's V1 cash cost.

15.2 Internally Manufactured Component

An INTERNALLY_MANUFACTURED component represents another ProductVariant manufactured by PrintForge and used as a component of the current ProductVariant.

The relationship is:

ProductVariant
      │
      └── ProductComponent
               │
               └── referenced ProductVariant

The ProductComponent must reference the other ProductVariant, not one of that variant's ProductionProfiles directly.

The referenced ProductVariant's applicable active/default ProductionProfile determines its current manufacturing cost and capacity requirements.

This preserves the distinction between:

What component do I need?
        ↓
ProductVariant

How is that component currently manufactured?
        ↓
ProductionProfile
15.3 Manufactured Component Cycles

Internally manufactured components must not form circular dependencies.

Invalid example:

Variant A
   requires Variant B

Variant B
   requires Variant A

Longer indirect cycles are also invalid.

The domain must prevent or reject such cycles.

16. Customer-Supplied and Non-Included Items

An item should not become a ProductComponent merely because the Product interacts with it.

Examples include:

A controller placed into a printed controller stand.
A phone placed into a phone holder.
A customer-provided container.
An object shown in product photographs but not included.

If the item is not included in the sale and does not contribute to the ProductVariant's production cost, it should generally be represented through:

Compatibility information.
Description.
Notes.

It should not contribute to V1 product cost.

17. Consumable Usage

A ConsumableUsage represents consumable material used while manufacturing, assembling, finishing, or preparing a ProductVariant.

Examples may include:

Glue.
Paint.
Sandpaper.
Cleaning supplies.
Resin used during finishing.
Other expendable supplies.

Consumables differ from ProductComponents because they are consumed during the manufacturing process rather than functioning as independently meaningful included components.

Applicable consumable cost contributes to V1 cash cost.

18. Post-Processing Step

A PostProcessingStep represents hands-on work required after or around printing.

Examples include:

Support removal.
Sanding.
Painting.
Gluing.
Assembly.
Cleaning.
Curing.
Packaging preparation.

Post-processing may contribute active labor time and may use ConsumableUsage.

Active labor should remain visible separately from cash expenses.

19. Packaging

Packaging cost contributes to V1 product cash cost.

V1 does not require packaging to become a complex inventory or shipping subsystem.

Packaging represents the cost of preparing the sellable ProductVariant for delivery or sale.

Shipping itself remains outside the V1 domain boundary.

20. Market Observation

A MarketObservation records an observed comparable product or offer that may help evaluate the commercial potential of a Product.

It may contain information such as:

Comparable product.
Marketplace or seller.
Asking price.
Observation date.
Notes.
Comparison details.

A MarketObservation represents observed market evidence.

It does not establish:

A completed sale.
Proven demand.
Verified market value.
Guaranteed achievable price.

Market observations help inform judgment rather than replace it.

21. Economics as Derived Domain Values

Commercial metrics should generally be derived from underlying domain data rather than independently stored as mutable business state.

Important derived values include:

Material cost.
Manufacturing cost.
Cost per sale.
Cash Contribution.
Cash Contribution Margin.
Printer hours per sale.
Cash Contribution per printer hour.
Active labor hours per sale.
Cash Contribution per active labor hour.

This avoids stale calculated values becoming inconsistent with their source data.

22. Cash Contribution

The primary V1 profitability concept is Cash Contribution.

Cash Contribution =
Planned Selling Price
- Relevant V1 Cash Costs

Relevant cash costs include applicable:

Manufacturing materials.
Purchased components.
Internally manufactured components.
Consumables.
Packaging.
Marketplace/payment fees when modeled.

Active personal labor is shown separately rather than automatically treated as a cash expense.

General business overhead is not automatically allocated to each ProductVariant.

Cash Contribution is not equivalent to accounting profit.

23. Printer Capacity

Printer capacity is a first-class commercial concern because two products with similar margins may consume dramatically different amounts of printer time.

For a Plate:

Printer Hours per Sale =
(Total Plate Print Hours / Usable Units Produced)
× Units Required per Sale

For manufacturing configurations involving multiple required Plates, the applicable printer-time contribution from the required Plates must be combined.

The system must safely handle zero usable output.

Cash Contribution per printer hour is:

Cash Contribution / Printer Hours per Sale

This provides a way to compare products competing for finite printer capacity.

24. Active Labor

Active labor represents hands-on human work required to produce a sale.

Active labor is distinct from unattended printer time.

For example:

8 hours of printing

does not mean:

8 hours of active labor

Post-processing and assembly may contribute active labor even while printer time is comparatively low.

PrintForge should preserve this distinction so users can evaluate both:

Printer capacity.
Personal time requirements.
25. Product Readiness

Product readiness is a derived assessment, not merely an arbitrary user-entered label.

Supported readiness states are:

BLOCKED
REVIEW_REQUIRED
QUESTIONABLE
PROMISING
READY

Readiness should be explainable.

The system should be capable of identifying the factors that caused a particular readiness result.

Relevant V1 factors may include:

Model-rights review.
Third-party IP review.
Safety review.
Manufacturing completeness.
Product economics.
Other commercial information explicitly modeled by V1.

The exact readiness algorithm may evolve as V1 is implemented, but it must respect the domain and scope boundaries defined here and in requirements.md.

26. V1/V2 Domain Boundary

Future domain concerns must not silently become V1 requirements.

26.1 Shipping

Shipping is V2.

Shipping cost, carrier selection, shipping labels, and shipping workflows must not be required for V1 readiness.

Packaging remains part of V1.

26.2 Final Quality Control

Detailed final QC is V2.

PrintForge V1 does not require a formal final-QC workflow for a Product to become READY.

This does not prevent existing V1 safety or manufacturing concerns from affecting readiness.

27. Domain Relationship Summary

The primary relationships can be summarized as:

Model
├── SourceProfile
└── ModelRightsReview

Model
   ↑
ProductModelLink
   ↓
Product
├── ThirdPartyIpReview
│   └── ThirdPartyIpItem(s)
├── SafetyReview
└── ProductVariant(s)
    ├── ProductionProfile(s)
    │   └── Plate(s)
    │       └── FilamentUsage(s)
    │           └── Filament
    │
    ├── ProductComponent(s)
    │   ├── PURCHASED
    │   └── INTERNALLY_MANUFACTURED
    │          └── referenced ProductVariant
    │
    ├── ConsumableUsage(s)
    ├── PostProcessingStep(s)
    └── MarketObservation(s)

This diagram communicates conceptual relationships and does not prescribe database-table ownership or exact foreign-key placement.

28. Core Domain Invariants

The following rules are considered part of the frozen V1 domain model and must not be casually changed during implementation:

Model represents the digital design, not manufacturing configuration.
SourceProfile represents provenance/source information.
ProductionProfile represents actual manufacturing truth.
Source-provided settings must not silently become actual production settings.
Product and Model have a many-to-many relationship through ProductModelLink.
Commercial Model rights and Product-level third-party IP concerns are separate review concepts.
AI-generated Models are not automatically considered free of IP concerns.
ProductVariant represents the actual sellable variation.
unitsPerSale and Plate yield are separate concepts.
A ProductionProfile may require multiple Plates.
Plate owns print duration, usable output/yield, and FilamentUsage.
Filament usage is one-to-many and must not use fixed filament slots.
Manufacturing material belongs to actual production usage rather than Model.
Not every printed object requires its own domain entity.
ProductComponents are either PURCHASED or INTERNALLY_MANUFACTURED in V1.
An internally manufactured ProductComponent references another ProductVariant, not a ProductionProfile.
The referenced ProductVariant's applicable current ProductionProfile determines its manufacturing economics.
Internally manufactured component relationships must not contain cycles.
Customer-supplied or non-included compatibility items are not costed ProductComponents.
Active labor remains distinct from unattended printer time.
Active personal labor is shown separately from cash cost.
Cash Contribution is the primary V1 profitability concept.
Market Observations represent comparable asking-price evidence, not proven sales or market value.
Rights and IP reviews record review state; they do not make legal determinations.
Safety review is lightweight and advisory.
Calculated economic values should generally be derived rather than persisted as independent mutable state.
Readiness is derived and should be explainable.
Readiness considers only concerns represented within the V1 domain.
Shipping is V2 and must not block V1 readiness.
Detailed final QC is V2 and must not block V1 readiness.
29. Modeling Principle

When deciding whether a new entity, relationship, or abstraction belongs in the PrintForge domain, ask:

Does this concept have independent business meaning that PrintForge currently needs to reason about?

Do not create domain entities merely because something exists physically or could theoretically matter later.

The domain model should remain rich enough to answer PrintForge's central question:

Should I sell this product, and why?

while remaining as simple as the current requirements allow.