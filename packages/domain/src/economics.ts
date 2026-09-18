export interface ProductEconomicsInput {
  plannedSellingPrice: number;
  cashCosts: number;
  printerHoursPerSale: number;
}

export interface PrinterHoursPerFinishedUnitInput {
  plannedPlatePrintHours: number;
  plannedUsableUnits: number;
}

export interface PrinterHoursPerSaleInput {
  plannedPlatePrintHours: number;
  plannedUsableUnits: number;
  unitsPerSale: number;
}

export interface FilamentUsageCostInput {
  modelGrams?: number;
  supportGrams?: number;
  purgeGrams?: number;
  towerGrams?: number;
  costPerGram: number;
}

export interface MaterialCostPerSaleInput {
  plateMaterialCost: number;
  plannedUsableUnits: number;
  unitsPerSale: number;
}

export function calculateMaterialCostPerSale(
  input: MaterialCostPerSaleInput
): number {
  if (input.plannedUsableUnits <= 0) {
    throw new RangeError("plannedUsableUnits must be greater than zero");
  }
  if (input.plateMaterialCost < 0) {
    throw new RangeError("plateMaterialCost must not be negative");
  }
  if (input.unitsPerSale < 0) {
    throw new RangeError("unitsPerSale must not be negative");
  }

  return (input.plateMaterialCost / input.plannedUsableUnits) * input.unitsPerSale;
}

export function calculatePlateMaterialCost(
  filamentUsages: readonly FilamentUsageCostInput[]
): number {
  let total = 0;

  for (const usage of filamentUsages) {
    if (usage.modelGrams !== undefined && usage.modelGrams < 0) {
      throw new RangeError("modelGrams must not be negative");
    }
    if (usage.supportGrams !== undefined && usage.supportGrams < 0) {
      throw new RangeError("supportGrams must not be negative");
    }
    if (usage.purgeGrams !== undefined && usage.purgeGrams < 0) {
      throw new RangeError("purgeGrams must not be negative");
    }
    if (usage.towerGrams !== undefined && usage.towerGrams < 0) {
      throw new RangeError("towerGrams must not be negative");
    }
    if (usage.costPerGram < 0) {
      throw new RangeError("costPerGram must not be negative");
    }

    const totalConsumptionGrams =
      (usage.modelGrams ?? 0) +
      (usage.supportGrams ?? 0) +
      (usage.purgeGrams ?? 0) +
      (usage.towerGrams ?? 0);

    total += totalConsumptionGrams * usage.costPerGram;
  }

  return total;
}

export function calculatePrinterHoursPerFinishedUnit(
  input: PrinterHoursPerFinishedUnitInput
): number {
  if (input.plannedUsableUnits <= 0) {
    throw new RangeError("plannedUsableUnits must be greater than zero");
  }
  if (input.plannedPlatePrintHours < 0) {
    throw new RangeError("plannedPlatePrintHours must not be negative");
  }

  return input.plannedPlatePrintHours / input.plannedUsableUnits;
}

export function calculatePrinterHoursPerSale(
  input: PrinterHoursPerSaleInput
): number {
  const printerHoursPerFinishedUnit = calculatePrinterHoursPerFinishedUnit(input);

  if (input.unitsPerSale < 0) {
    throw new RangeError("unitsPerSale must not be negative");
  }

  return printerHoursPerFinishedUnit * input.unitsPerSale;
}

export function calculateCashContribution(
  input: ProductEconomicsInput
): number {
  return input.plannedSellingPrice - input.cashCosts;
}

export function calculateMargin(
  input: ProductEconomicsInput
): number {
  if (input.plannedSellingPrice === 0) {
    return 0;
  }

  return calculateCashContribution(input) / input.plannedSellingPrice;
}

export function calculateContributionPerPrinterHour(
  input: ProductEconomicsInput
): number {
  if (input.printerHoursPerSale === 0) {
    return 0;
  }

  return calculateCashContribution(input) / input.printerHoursPerSale;
}
