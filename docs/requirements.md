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

7.2 Printer Hours per Finished Unit and per Sale

Printer hours per sale should represent the amount of printer capacity required to produce the quantity needed for one sale.

For a plate:

Printer hours per finished unit =
plannedPlatePrintHours / plannedUsableUnits

Printer hours per sale =
printerHoursPerFinishedUnit * unitsPerSale

Printer hours per finished unit is a production metric representing printer capacity required to produce one planned usable finished unit. Printer hours per sale remains useful for commercial economics, especially when a sale contains multiple units. These are separate derived metrics and must not be conflated.

Plate yield and units required per sale are different concepts and must remain distinct.

V1 economics must use planned plate print time and planned usable yield (plannedUsableUnits), not actual production results. For any per-unit or per-sale calculation, plannedUsableUnits must be greater than zero. Zero or negative plannedUsableUnits is invalid domain data because a plan with no usable output cannot provide a per-unit or per-sale result. The calculation must reject it rather than return 0, even when planned print time or units per sale is zero.

Negative planned values, including planned print time and units per sale, are invalid and must not be silently clamped. With positive plannedUsableUnits, zero planned print time is valid and yields 0 printer hours per finished unit and per sale. Zero units per sale yields 0 printer hours per sale without changing the per-finished-unit metric.

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
Planned print duration for each plate.
Planned usable yield (plannedUsableUnits) for each plate.
Arbitrary planned filament usage associated with each plate.
Purchased components.
Internally manufactured components.
Consumables.
Packaging.
Post-processing work.

A Plate is a manufacturing plan/template for V1 economics. The chosen manufacturing configuration and its planned inputs must be kept distinct from source-model information and from future actual production results.

9. Filament and Material Usage

A plate may use zero, one, or many filament usages, allowing multiple different filaments on the same plate.

The design must not assume a fixed maximum number of filament materials.

For example, the system must not model filament usage as:

filament1
filament2
filament3
...
filament16

Material information belongs to planned production usage in V1 rather than to the abstract source Model.

V1 costing uses planned material grams, planned waste grams, and an already-derived cost per gram for each filament usage. Material and waste must remain separately recorded to distinguish planned useful output from planned waste, while both contribute to cash material cost.

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

Actual Production Results

Actual print time, material consumed, usable units, failures, and waste belong to a future PrintJob or equivalent execution/history concept. Actual production tracking is outside V1 and must not be mixed into the Plate planning definition or required for V1 economics.

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

22. User Experience Requirements
Model-Centered Entry Point

Importing a 3D model is a primary entry point into PrintForge.

The intended user experience begins with a printable design source that the user is considering producing or selling. V1 supports STL and 3MF as original Model source formats. The user can select supported files, review their import information, and confirm creation of a Model from each file. A format supported by Bambu Studio is not automatically supported by PrintForge.

Before confirming import, PrintForge should present information that can reliably be determined from the selected file and clearly identify information that still requires user input. After confirmation, the user proceeds to the Model workspace to continue the evaluation.

The application should progressively build the commercial evaluation around the imported Model rather than requiring the user to understand or manually create the underlying domain hierarchy before beginning an evaluation.

Model Import Review

The intended V1 workflow is:

Select STL/3MF file(s) → upload → backend processing → ready for review → review → confirm → Model workspace

Selecting a supported source file must not immediately create a fully accepted Model without review. Import means validating a supported, parseable file with usable model information, extracting reliable information appropriate to its format, showing what PrintForge knows and what still requires user input, allowing review/editing of import-time metadata, and confirming creation of the Model. PrintForge need not duplicate a slicer's full mesh repair, slicing, or printability validation, invoke Bambu Studio, or prove slicer compatibility during import.

V1 supports selecting multiple STL and/or 3MF files. Each source file is an independent upload/import with an independently understandable state, so a slow or failed import does not obscure the others. While bytes transfer, the file is a transient frontend upload task. Once the backend acknowledges receipt of the complete source file, it owns a persistent ImportDraft and performs supported-file validation, format-aware parsing, geometry extraction, and useful metadata extraction. The user reviews the resulting information and confirms creation of a Model. Review Import displays backend-returned information rather than independently deriving authoritative geometry or metadata in React. Browser-side STL or 3MF parsing is not a V1 requirement.

Imports is a separate area for files that have not become Models. The Models collection contains confirmed Models only. After confirmation, the item leaves Imports and appears in Models. The Imports view clearly distinguishes active frontend uploads, backend imports processing, imports ready for review, and failed imports; its exact layout, section labels, and ordering remain flexible. Backend state changes appear automatically without a manual application reload.

An active upload may show filename, upload state, actual transfer progress and percentage when meaningful, waiting/queued state, failure, and appropriate retry or remove actions. Upload percentage describes transport state, not a domain calculation. Backend processing uses status or indeterminate progress unless the backend provides meaningful real progress; the UI must not invent a processing percentage.

The user receives clear feedback that leaving or closing PrintForge during an active upload may interrupt it. When the platform permits, the application makes a reasonable effort to warn before leaving while uploads are active. After complete upload acknowledgment, backend processing continues without requiring the Imports page or browser to stay open. Interrupted or partial uploads must not retain orphaned file data indefinitely. Resumable or chunked uploads are not required in V1.

ImportDrafts survive navigation, refresh, closing and reopening PrintForge, and normal absence before review. Their backend states are PROCESSING, READY_FOR_REVIEW, and FAILED. A completed upload enters PROCESSING, then becomes READY_FOR_REVIEW or FAILED. A ready draft may be reviewed, confirmed, or discarded. Review edits remain persistent working data. Confirmation creates a Model and consumes/removes the draft from Imports; discard removes the draft and its unclaimed source asset according to application lifecycle behavior. Failed drafts stay visible so failures are understandable. Opening review does not create an IN_REVIEW backend state. Retry behavior is not yet specified.

Abandoned unconfirmed ImportDrafts and their unclaimed assets must eventually be cleaned up under an explicit retention policy. Its duration remains undecided. This durable-draft cleanup is distinct from partial-upload cleanup and does not establish archive, recovery, soft-delete, or long-term import history.

The frontend may collect input, transmit files, construct requests, format returned information, manage transient UI state, and provide basic form feedback. Formatting a returned byte count as a readable file size or formatting numeric values for display is allowed; authoritative validation and business decisions remain on the backend/domain side.

The review step should support:

- Filename.
- File size.
- Geometric/model bounds.
- Editable Model name.
- Editable description.
- Source information when known.
- Creator information when known.
- Commercial-use rights/review status, or an explicit not-reviewed state.
- A confirm/import action.
- A cancel/back action that leaves the ImportDraft unconfirmed; discard is a separate action.

The user should be able to provide or edit information that cannot be reliably inferred. Unknown source, creator, or rights information must be shown as unknown or not reviewed rather than assumed from the file. Extracted metadata may inform review but does not itself approve commercial-use rights or establish commercial readiness, production readiness, or printability.

STL import must not imply that it can reliably determine a useful commercial description, source/creator provenance, license or commercial-use permission, production settings, filament selection, print time, plate yield, selling price, or commercial readiness.

3MF may contain richer information, such as title, description, creator, license, multiple objects, units, previews, project metadata, print profiles, filament, or plate information. These are possibilities, not guaranteed contents or required V1 extraction fields. Pre-populated review information may differ by source format and remains subject to user review; embedded production information does not become PrintForge manufacturing truth automatically. The final extraction field list will be decided after evaluating reliability and usefulness.

ZIP archives are not a V1 Model source format. A ZIP of multiple STLs does not establish that they form one Model: they might be components, alternatives, sizes, or unrelated designs. Users may import individual supported files. V1 does not require ZIP inspection/extraction, grouped ZIP import, component inference, or conversion of unsupported formats to STL or 3MF. OBJ, STEP, AMF, CAD formats, and other formats are not V1 imports; each may be evaluated separately later.

Product pricing, filament selection, production setup, plate configuration, and economics configuration do not belong on the initial import-review step. They belong in the broader Model evaluation workspace after the Model exists.

The import-review UX principle is:

Show what PrintForge knows, ask for what is missing, and let the user confirm before progressing.

Preserve this workflow while keeping exact labels, layout, and screen composition intentionally flexible.

Original Source Asset and Editable Metadata

While an ImportDraft exists, its complete uploaded STL or 3MF is an unconfirmed original source asset. Confirmation associates that same unchanged file with the resulting Model, without requiring another upload, regeneration, or conversion. Ownership or reference may change without physically copying or moving the binary. After confirmation, the asset is long-term Model source data. PrintForge does not edit, rewrite, or overwrite the original source file or convert a 3MF to STL as its authoritative original.

Model metadata remains editable independently of that immutable source asset. Model name, description, notes, source information, creator information, rights-review information, and other user-entered or reviewed metadata may be updated without implying that the original source file changed.

Original filename, source format, file size, storage reference, geometric/model bounds where derivable, and other metadata derived directly from parsing the immutable source file are authoritative source/file information. Supported V1 source format is STL or 3MF. They may be reformatted for presentation, but should not be casually editable as user-entered business facts. Editing a Model's name does not rename its recorded original filename.

V1 does not require source-file versioning because PrintForge updates metadata and related business information rather than the underlying source file. A meaningfully different source file should be imported as a separate Model. Source-file revision history, file version tables, overwrite workflows, and geometry editing are outside V1.

The original source file is stored as a file/object asset rather than inside ordinary relational business columns. PostgreSQL stores durable ImportDraft state and its asset reference, then the confirmed Model's reference and relevant file metadata. The exact storage provider and mechanism remain undecided.

Model metadata can be edited, the associated original source asset is immutable, and deleting a Model may eventually remove its file asset according to application deletion behavior. ImportDraft retention is specified separately above; neither lifecycle establishes recovery, archive, soft-delete, or file-history systems.

The source asset, editable Model metadata, authoritative file metadata, and Product/Production/economics data remain distinct. Product, ProductionProfile, Plate, FilamentUsage, and economics concerns must not move into the Model record.

Future Slicer Handoff

A later version may let the user hand off or export the preserved original Model source asset for use in Bambu Studio or another slicer. PrintForge manages and evaluates the Model; the slicer handles mesh repair, detailed printability, slicing, support generation, orientation, and printer-job execution. This is a future direction only, not a V1 integration requirement; its integration mechanism remains undecided.

Future Import Review Extensions

Later versions may enrich import review with:

- Interactive 3D preview.
- Source/listing metadata assistance.
- Duplicate-model detection.
- Richer validation warnings.
- AI-assisted description suggestions.
- Import-time guidance or recommendations.
- Richer file-format support.

These are future directions only and must not become V1 requirements. Basic validation of the supported file remains part of V1 import; richer warning and assistance capabilities are deferred.

Future browser-side parsing, visualization, or derived preview values may support presentation and responsiveness, but must not become authoritative domain state or replace server-side validation/calculation. Client-side STL/3MF parsing and 3D rendering are not V1 requirements.

Model Library

Users need a browsable collection of the Models they have added to PrintForge.

Only confirmed Models appear in this collection; unconfirmed files remain in Imports.

The Model library should allow users to:

Import a new Model.
View previously imported Models.
Identify Models visually where preview information is available.
Search or otherwise locate a Model as the collection grows.
Open a Model to view and continue its evaluation.
See useful high-level information about a Model without opening every detail.

The exact presentation of the Model library, including cards, tables, lists, filters, sorting, and navigation, is intentionally not specified for V1 and may evolve as the application is developed.

Model Workspace

A user should be able to open an imported Model and work with the information related to evaluating that Model for commercial use.

The workspace should make it easy to distinguish between:

Information PrintForge can determine or derive.
Information the user has already provided.
Information still needed to complete the evaluation.

Relevant information may include:

Model file information and geometry.
Source and commercial-use rights information.
Products that use the Model.
Production configuration.
Plates and planned production yield.
Filament usage.
Additional production costs.
Planned selling price.
Calculated economics.
Commercial readiness and the reasons behind that assessment.

The exact grouping, navigation, tabs, panels, and screen layout are intentionally flexible.

Model Description and Technical Metadata

The UI should prioritize useful descriptive and source context over low-value mesh statistics such as triangle count. Triangle count may exist as technical metadata, but it is not an important V1 commercial-evaluation field.

A Model description may come from user input, source/listing metadata, or other import context when available. Do not assume STL files contain a meaningful human-readable description.

Model Dimensions

Dimensions derived from a model file represent the model's geometric bounds (bounding box). They do not represent the complete production footprint. Supports, brim, orientation, spacing, plate arrangement, and other slicer/manufacturing effects belong to Production/Plate planning.

User-facing terminology must avoid implying that model bounds equal the required print-bed footprint.

Model and Product Distinction

The user interface should preserve the distinction between a Model and a Product without requiring the user to understand the internal domain model.

A Model represents an imported design or design asset.

A Product represents something the user is evaluating for sale.

A Model may contribute to multiple Products, and a Product may use multiple Models.

The UI should present these relationships naturally rather than treating an imported source file and a sellable Product as the same concept.

Filament Selection

Users should be able to maintain reusable filament information so that material details do not need to be re-entered for every production configuration.

When configuring planned filament usage, the user should be able to select from previously entered filament information and specify the amount required by the Plate.

For V1 economics, filament usage continues to provide or derive the costPerGram required by the domain calculations.

A richer distinction between reusable material types, purchased spools, inventory, and purchase history remains future scope as described in the domain model.

Progressive Evaluation

PrintForge should allow an evaluation to be incomplete.

Users should be able to import a Model and return to it later without supplying every piece of commercial and manufacturing information immediately.

As information is added, PrintForge should progressively provide more useful economics and readiness information.

Missing information should be communicated to the user rather than replaced with misleading calculated defaults.

Responsive Calculations

Derived economics should update from the current production and pricing inputs without requiring the user to manually initiate a separate calculation process.

The backend/domain side remains authoritative for economics, readiness/business-rule evaluation, and other domain calculations and validations. React requests and displays those results, with presentation formatting and UI-level input handling as useful; it must not reproduce the calculations as a second source of truth.

Where a calculation cannot be performed because required information is missing or invalid, the UI should communicate what is needed rather than presenting a misleading numeric result.

UX Flexibility

The V1 user interface is intentionally iterative.

Requirements describe user capabilities and domain meaning, not a fixed screen layout. Navigation, cards, tables, tabs, forms, field placement, visual styling, and information grouping may change as workflows are implemented and evaluated.

UI implementation decisions should remain easy to change unless a specific interaction becomes a confirmed product requirement.

These refinements document meaning and intent, not a final screen design. Exact labels, card layouts, and workspace composition remain flexible while preserving the distinctions between design information, production planning, and per-unit versus per-sale metrics.

The guiding UX principle is:

Start with the model, show what PrintForge knows, ask for what is missing, and progressively explain whether the resulting product appears commercially viable.

The Model workspace should be capable of eventually presenting actionable next steps alongside missing information and readiness explanations.

23. Future Guided Evaluation

A future version of PrintForge should be able to guide a user from an imported 3D model toward a commercially sellable state.

The long-term workflow may include:

Import a supported 3D model such as an STL.
Analyze information that can be determined automatically.
Identify required or useful information that is missing.
Evaluate commercial, manufacturing, economic, rights, intellectual-property, and safety concerns.
Present actionable suggestions or a prioritized to-do list.
Update the guidance as the user provides additional information or resolves concerns.

Examples of future guidance may include:

Review the model's commercial-use rights.
Configure a Production Profile.
Add planned plate yield and print time.
Add filament usage.
Add packaging or component costs.
Review third-party intellectual-property concerns.
Address safety concerns.
Adjust planned selling price or production assumptions when economics appear weak.

A later version may also suggest useful filament colors based on real-world examples, product category, visual conventions, or comparable products. For example, planters may commonly be shown in white, terracotta, or green tones.

Color suggestions are future guidance only, not a V1 requirement. Do not introduce color-recommendation logic in V1; existing user-selected or preselected colors remain sufficient.

Guidance should be derived from authoritative PrintForge domain information rather than from UI state alone.

This capability is intentionally deferred beyond V1. V1 should focus on collecting reliable domain information, calculating economics, and producing explainable readiness results in ways that can support future guided recommendations without requiring a recommendation engine today.
