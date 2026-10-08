export type CalculationResult =
  | { available: true; value: number }
  | { available: false; reason: string };

export interface FilamentPricingInput {
  marketPrice: number;
  referenceQuantityGrams: number;
}

// Resolve usage references against current reusable Filament definitions, not snapshots.
export type FilamentCatalog = ReadonlyMap<string, FilamentPricingInput>;

export interface FilamentUsageCostInput {
  filamentId: string;
  modelGrams: number;
  supportGrams: number;
  purgeGrams: number;
  towerGrams: number;
}

export interface PlateEconomicsInput {
  plannedPlatePrintHours?: number | null;
  filamentUsages: readonly FilamentUsageCostInput[];
}

export interface ProductionProfileEconomicsInput {
  plannedBatchUnits?: number | null;
  // Include every required Plate, even if its inputs are unfinished.
  plates: readonly PlateEconomicsInput[];
}

export type PrinterHoursPerFinishedUnitInput = ProductionProfileEconomicsInput;

export interface PrinterHoursPerSaleInput extends ProductionProfileEconomicsInput {
  unitsPerSale?: number | null;
}

export type MaterialCostPerSaleInput = PrinterHoursPerSaleInput;

export interface ProductEconomicsInput {
  plannedSellingPrice?: number | null;
  // The complete relevant cash cost, not just the known subset or material cost.
  cashCosts?: number | null;
  printerHoursPerSale?: number | null;
}

function isNonnegative(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isPositive(value: unknown): value is number {
  return isNonnegative(value) && value > 0;
}

function unavailable(reason: string): CalculationResult {
  return { available: false, reason };
}

function calculated(value: number): CalculationResult {
  return Number.isFinite(value)
    ? { available: true, value }
    : unavailable("Calculation exceeds the supported numeric range");
}

/** Validate a proposed saved usage; an unfinished Plate may instead have no usages. */
export function isValidFilamentUsage(value: unknown): value is FilamentUsageCostInput {
  if (typeof value !== "object" || value === null) return false;
  const usage = value as Partial<FilamentUsageCostInput>;
  return typeof usage.filamentId === "string" && usage.filamentId.trim().length > 0 &&
    isNonnegative(usage.modelGrams) && isNonnegative(usage.supportGrams) &&
    isNonnegative(usage.purgeGrams) && isNonnegative(usage.towerGrams);
}

export function calculateFilamentCostPerGram(
  filament: FilamentPricingInput
): CalculationResult {
  if (!isPositive(filament.marketPrice) || !isPositive(filament.referenceQuantityGrams)) {
    return unavailable("Filament requires a positive finite market price and reference quantity");
  }
  const costPerGram = filament.marketPrice / filament.referenceQuantityGrams;
  return isPositive(costPerGram)
    ? calculated(costPerGram)
    : unavailable("Filament cost per gram is outside the supported numeric range");
}

function hasModelConsumption(usages: readonly FilamentUsageCostInput[]): boolean {
  // With nonnegative amounts, at least one positive amount means a positive total.
  return usages.length > 0 && usages.every(isValidFilamentUsage) &&
    usages.some((usage) => usage.modelGrams > 0);
}

export function calculatePlateMaterialCost(
  filamentUsages: readonly FilamentUsageCostInput[],
  filaments: FilamentCatalog
): CalculationResult {
  if (!hasModelConsumption(filamentUsages)) {
    return unavailable("Plate requires complete valid usages and positive total model consumption");
  }
  let total = 0;
  for (const usage of filamentUsages) {
    const filament = filaments.get(usage.filamentId);
    if (!filament) return unavailable(`Missing Filament: ${usage.filamentId}`);
    const price = calculateFilamentCostPerGram(filament);
    if (!price.available) return price;
    const grams = usage.modelGrams + usage.supportGrams + usage.purgeGrams + usage.towerGrams;
    total += grams * price.value;
  }
  return calculated(total);
}

export function derivePlateReadiness(
  plate: PlateEconomicsInput,
  profile: Pick<ProductionProfileEconomicsInput, "plannedBatchUnits">
): "PRINT_READY" | "STILL_EDITING" {
  return isNonnegative(plate.plannedPlatePrintHours) &&
    isPositive(profile.plannedBatchUnits) && hasModelConsumption(plate.filamentUsages)
    ? "PRINT_READY"
    : "STILL_EDITING";
}

function sumPlateResults(results: readonly CalculationResult[]): CalculationResult {
  if (results.length === 0) return unavailable("ProductionProfile requires Plates");
  let total = 0;
  for (const [index, result] of results.entries()) {
    if (!result.available) return unavailable(`Plate ${index + 1}: ${result.reason}`);
    total += result.value;
  }
  return calculated(total);
}

export function calculateProductionProfileMaterialCost(
  profile: ProductionProfileEconomicsInput,
  filaments: FilamentCatalog
): CalculationResult {
  return sumPlateResults(profile.plates.map((plate) =>
    calculatePlateMaterialCost(plate.filamentUsages, filaments)));
}

export function calculateProductionProfilePrinterHours(
  profile: ProductionProfileEconomicsInput
): CalculationResult {
  return sumPlateResults(profile.plates.map((plate) =>
    isNonnegative(plate.plannedPlatePrintHours)
      ? calculated(plate.plannedPlatePrintHours)
      : unavailable("Planned print time must be specified, finite, and nonnegative")));
}

function perFinishedUnit(total: CalculationResult, plannedBatchUnits: unknown): CalculationResult {
  if (!isPositive(plannedBatchUnits)) {
    return unavailable("plannedBatchUnits must be specified, finite, and positive");
  }
  return total.available ? calculated(total.value / plannedBatchUnits) : total;
}

function perSale(perUnit: CalculationResult, unitsPerSale: unknown): CalculationResult {
  if (!isNonnegative(unitsPerSale)) {
    return unavailable("unitsPerSale must be specified, finite, and nonnegative");
  }
  return perUnit.available ? calculated(perUnit.value * unitsPerSale) : perUnit;
}

export function calculateMaterialCostPerFinishedUnit(
  profile: ProductionProfileEconomicsInput,
  filaments: FilamentCatalog
): CalculationResult {
  return perFinishedUnit(calculateProductionProfileMaterialCost(profile, filaments), profile.plannedBatchUnits);
}

export function calculateMaterialCostPerSale(
  input: MaterialCostPerSaleInput,
  filaments: FilamentCatalog
): CalculationResult {
  return perSale(calculateMaterialCostPerFinishedUnit(input, filaments), input.unitsPerSale);
}

export function calculatePrinterHoursPerFinishedUnit(
  input: PrinterHoursPerFinishedUnitInput
): CalculationResult {
  return perFinishedUnit(calculateProductionProfilePrinterHours(input), input.plannedBatchUnits);
}

export function calculatePrinterHoursPerSale(input: PrinterHoursPerSaleInput): CalculationResult {
  return perSale(calculatePrinterHoursPerFinishedUnit(input), input.unitsPerSale);
}

export function calculateCashContribution(input: ProductEconomicsInput): CalculationResult {
  if (!isNonnegative(input.plannedSellingPrice) || !isNonnegative(input.cashCosts)) {
    return unavailable("Selling price and complete cash costs must be specified, finite, and nonnegative");
  }
  return calculated(input.plannedSellingPrice - input.cashCosts);
}

export function calculateMargin(input: ProductEconomicsInput): CalculationResult {
  const contribution = calculateCashContribution(input);
  if (!contribution.available) return contribution;
  if (!isPositive(input.plannedSellingPrice)) {
    return unavailable("Margin requires a positive selling price");
  }
  return calculated(contribution.value / input.plannedSellingPrice);
}

export function calculateContributionPerPrinterHour(input: ProductEconomicsInput): CalculationResult {
  const contribution = calculateCashContribution(input);
  if (!contribution.available) return contribution;
  if (!isPositive(input.printerHoursPerSale)) {
    return unavailable("Contribution per printer hour requires positive finite printer hours");
  }
  return calculated(contribution.value / input.printerHoursPerSale);
}
