PrintForge V1 Requirements
1. Purpose

PrintForge manages the journey from a 3D model to a commercially viable physical product.

The primary question PrintForge is designed to answer is:

Should I sell this product, and why?

PrintForge V1 should help a user evaluate whether a 3D-printed product appears commercially viable by combining manufacturing information, costs, production capacity, market observations, and lightweight business-risk reviews.

PrintForge is not intended to be a complete accounting, e-commerce, legal-compliance, shipping, or manufacturing-execution system.

2. V1 Goals

PrintForge V1 should allow a user to:

Record a 3D model that may be used in a commercial product.
Record the known source and rights information associated with that model.
Define a product and one or more sellable product variants.
Describe how a product variant is manufactured.
Represent one or more printer plates used to manufacture a variant.
Record filament usage for each plate.
Account for purchased and internally manufactured components.
Account for consumables and packaging.
Record post-processing work.
Estimate the product's relevant cash costs.
Estimate active labor separately from cash costs.
Calculate commercial viability metrics.
Record comparable market observations.
Record lightweight intellectual-property and safety reviews.
Derive a readiness assessment based only on concerns modeled in V1.
Explain why a product received its readiness assessment.
3. V1 Non-Goals

The following areas are outside the scope of V1:

Full accounting or bookkeeping.
General-ledger integration.
Inventory management.
Order management.
Customer management.
E-commerce storefront functionality.
Tax calculation.
Shipping-rate calculation.
Shipping-label creation.
Detailed final quality-control workflows.
Formal legal determinations.
Formal regulatory certification.
Enterprise manufacturing execution.

These areas may be considered for later versions but must not unnecessarily complicate V1.

4. Core Commercial Evaluation

PrintForge should evaluate a product using both financial and production-capacity information.

The primary profitability concept in V1 is Cash Contribution.

4.1 Cash Contribution

Cash Contribution is:

Cash Contribution =
Planned Selling Price
- Relevant V1 Cash Costs

Cash Contribution represents the cash remaining from a sale after the product's relevant V1 cash costs.

It is not intended to represent complete accounting profit.

5. Relevant V1 Cash Costs

Relevant V1 cash costs may include:

Filament and other manufacturing material costs.
Purchased component costs.
Costs of internally manufactured components.
Consumables used during production or finishing.
Packaging.
Marketplace fees, when applicable.
Payment-processing fees, when applicable.

General business overhead should not be forced into per-product costs in V1.

Examples of costs that should not automatically be allocated to an individual product include:

General software subscriptions.
Rent.
Broad utility expenses.
General equipment ownership.
Business insurance.
Other shared overhead without a clear product-specific relationship.

PrintForge may support broader overhead analysis in a later version.

6. Active Labor

Active human labor should be tracked separately from cash costs.

Examples include:

Assembly.
Support removal.
Sanding.
Painting.
Finishing.
Packaging.
Other hands-on post-processing work.

V1 should make active labor visible without automatically treating the user's own labor as a cash expense.

This allows PrintForge to distinguish between:

A product that produces adequate cash contribution but requires excessive personal labor.
A product that produces adequate cash contribution with little active labor.
7. Required Economic Metrics

Where sufficient data exists, PrintForge should calculate or derive:

Cost per sale.
Cash Contribution.
Cash Contribution Margin.
Printer hours per sale.
Cash Contribution per printer hour.
Active labor hours per sale.
Cash Contribution per active labor hour.
7.1 Cash Contribution Margin

Cash Contribution Margin is:

Cash Contribution Margin =
Cash Contribution / Planned Selling Price

When planned selling price is zero, the system must handle the calculation safely rather than producing an invalid result.

7.2 Printer Hours per Sale

Printer hours per sale should represent the amount of printer capacity required to produce the quantity needed for one sale.

For a plate:

Printer Hours per Sale =
(Total Plate Print Hours / Usable Units Produced)
× Units Required per Sale

Plate yield and units required per sale are different concepts and must remain distinct.

The system must safely handle a plate with zero usable units.

7.3 Cash Contribution per Printer Hour
Cash Contribution per Printer Hour =
Cash Contribution / Printer Hours per Sale

This metric helps compare products competing for limited printer capacity.

The system must safely handle zero printer hours.

7.4 Cash Contribution per Active Labor Hour
Cash Contribution per Active Labor Hour =
Cash Contribution / Active Labor Hours per Sale

This metric helps compare products based on the user's required hands-on effort.

The system must safely handle zero active labor hours.

8. Manufacturing Requirements

A Product Variant must be able to describe how it is currently manufactured.

Manufacturing information should support:

One or more production profiles over time.
One or more printer plates associated with a production profile.
Print duration for each plate.
Usable output/yield from each plate.
Arbitrary filament usage associated with each plate.
Purchased components.
Internally manufactured components.
Consumables.
Packaging.
Post-processing work.

Actual manufacturing information must be kept distinct from information describing the original source model.

9. Filament and Material Usage

A plate may use zero, one, or many filament usages, allowing multiple different filaments on the same plate.

The design must not assume a fixed maximum number of filament materials.

For example, the system must not model filament usage as:

filament1
filament2
filament3
...
filament16

Material information belongs to actual production usage rather than to the abstract source Model.

V1 costing uses material grams, waste grams, and an already-derived cost per gram for each filament usage. Material and waste must remain separately recorded to distinguish useful output from waste, while both contribute to cash material cost.

Plate material cost sums the cost of material and waste across all usages. An empty collection produces 0. Zero amounts and zero cost per gram are valid; negative amounts or costs are invalid and must not be silently converted to zero. The canonical formula and input rules are defined in domain-model.md, section 14.1.

10. Components

A Product Variant may require additional components.

Components may be:

PURCHASED
INTERNALLY_MANUFACTURED

Purchased components contribute their purchase cost to the product's cash cost.

An internally manufactured component should derive its cost and manufacturing requirements from the referenced Product Variant used to produce that component.

Internally manufactured component relationships must not create circular manufacturing dependencies.

11. Customer-Supplied or Non-Included Items

Some products may be designed to work with items that:

The customer already owns.
The customer supplies separately.
Are shown for compatibility or demonstration but are not included with the sale.

These items should not be treated as costed Product Components in V1.

They may instead be represented through compatibility information, descriptions, or notes.

12. Post-Processing

PrintForge should support recording post-processing activities associated with manufacturing a product.

Examples include:

Removing supports.
Sanding.
Painting.
Gluing.
Assembly.
Cleaning.
Curing.
Packaging preparation.

Post-processing may contribute:

Active labor.
Consumable costs.
Other relevant production information.
13. Market Observations

PrintForge should allow users to record observations about comparable products in the market.

A Market Observation may include information such as:

Comparable product description.
Seller or marketplace.
Asking price.
Observation date.
Notes.
Relevant comparison details.

Market observations represent observed comparable asking prices.

They must not be described as:

Proven sales.
Verified market value.
Guaranteed achievable prices.

Market observations are evidence that may help a user make a commercial judgment, not a formal appraisal.

14. Model Rights Review

PrintForge should allow the user to record a lightweight review of whether a Model may be appropriate for commercial use.

The review may record information such as:

Known source.
License information.
Permission information.
Commercial-use status.
Unresolved questions.
Review notes.

PrintForge records the user's known information and review state.

It does not make a legal determination about whether commercial use is permitted.

An AI-generated model must not automatically be assumed to be free of intellectual-property concerns.

15. Third-Party Intellectual Property Review

A Product may contain or reference third-party intellectual property independently of the license or rights associated with the underlying 3D model.

Examples may include:

Logos.
Characters.
Brand names.
Artwork.
Trade dress.
Other recognizable protected material.

PrintForge should support a lightweight Third-Party IP Review and multiple identified IP items when necessary.

The purpose of the review is to surface possible commercial concerns.

PrintForge must not represent the review as formal legal advice or a legal determination.

16. Safety Review

PrintForge should support a lightweight product safety review.

The review should help users identify obvious areas that may deserve additional consideration before selling a product.

Safety categories should remain lightweight and advisory in V1.

PrintForge should not attempt to act as:

A regulatory-certification system.
A product-safety laboratory.
A formal compliance determination.

A safety concern may influence product readiness when the concern is within the scope modeled by V1.

17. Product Readiness

PrintForge should derive a readiness assessment that helps answer:

Should I sell this product, and why?

Supported readiness states are:

BLOCKED
REVIEW_REQUIRED
QUESTIONABLE
PROMISING
READY

The system should provide an explanation for the derived readiness state rather than presenting only a label.

Readiness should consider relevant V1 information such as:

Rights-review state.
Third-party intellectual-property review state.
Safety-review state.
Availability and completeness of manufacturing information.
Product economics.
Other commercial-evaluation information explicitly modeled in V1.

Readiness should be derived from current product information rather than manually stored as an unexplained final conclusion where practical.

18. V1/V2 Boundary

A concern that is intentionally outside V1 must not prevent a product from becoming READY in V1.

In particular:

Shipping

Shipping is a V2 concern.

Lack of shipping-cost data, shipping configuration, or shipping workflow must not block V1 readiness.

Packaging cost may still be included in V1 economics.

Final Quality Control

Detailed final QC is a V2 concern.

The absence of a formal final-QC workflow must not block V1 readiness.

Normal manufacturing information and safety concerns that are already part of V1 may still affect readiness.

Filament Catalog and Inventory

The richer filament type and specific filament/spool distinction described in domain-model.md, section 13.1, is deferred. Full spool inventory and purchase-history modeling remain outside V1.

V1 plate material-cost calculations must work from usage amounts and an already-derived cost per gram without requiring or prematurely implementing this future catalog/inventory model.

This boundary is intentional: future concerns must not prevent V1 from delivering useful commercial evaluation.

19. Calculated Versus Recorded Information

Values that can reliably be calculated from underlying data should generally be derived rather than independently stored.

Examples include:

Material cost.
Cost per sale.
Cash Contribution.
Cash Contribution Margin.
Printer hours per sale.
Cash Contribution per printer hour.
Cash Contribution per active labor hour.

This reduces the risk of calculated values becoming inconsistent with their source data.

In particular, Plate material cost is derived business data and must not be persisted as authoritative state.

Review state, user-entered observations, and other information representing actual user decisions or findings should be persisted.

20. Initial Vertical Slice

The first usable PrintForge workflow should intentionally be small.

The initial vertical slice should support:

Create a Model.
Record a Model Rights Review.
Create a Product.
Create one Product Variant.
Create one Production Profile.
Create one Plate.
Record one Filament Usage.
Enter a planned selling price.
Enter packaging cost.
Calculate material cost.
Calculate cost per sale.
Calculate Cash Contribution.
Calculate Cash Contribution Margin.
Calculate printer hours per sale.
Calculate Cash Contribution per printer hour.
Derive a product-readiness assessment.
Explain the readiness assessment.

The purpose of this vertical slice is to establish an end-to-end path through the application's most important business question before expanding into secondary features.

After this vertical slice is working, V1 may incrementally add:

Multiple plates.
Multiple filament usages.
Purchased components.
Internally manufactured components.
Consumables.
Post-processing.
Active labor metrics.
Market observations.
Third-party intellectual-property reviews.
Safety reviews.
21. Design Principle

When considering a requirement, dependency, abstraction, or feature, ask:

What current PrintForge problem does this solve?

V1 should prefer the simplest implementation that correctly represents the current business requirement.

Future possibilities should not add unnecessary complexity to the current system.
