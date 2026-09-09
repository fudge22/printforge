export interface ProductEconomicsInput {
  plannedSellingPrice: number;
  cashCosts: number;
  printerHoursPerSale: number;
}

export interface PrinterHoursPerSaleInput {
  totalPlatePrintHours: number;
  usableUnitsProduced: number;
  unitsPerSale: number;
}

export interface FilamentUsageCostInput {
  materialGrams: number;
  wasteGrams: number;
  costPerGram: number;
}

export function calculatePlateMaterialCost(
  filamentUsages: readonly FilamentUsageCostInput[]
): number {
  let total = 0;

  for (const usage of filamentUsages) {
    if (usage.materialGrams < 0) {
      throw new RangeError("materialGrams must not be negative");
    }
    if (usage.wasteGrams < 0) {
      throw new RangeError("wasteGrams must not be negative");
    }
    if (usage.costPerGram < 0) {
      throw new RangeError("costPerGram must not be negative");
    }

    total += (usage.materialGrams + usage.wasteGrams) * usage.costPerGram;
  }

  return total;
}

export function calculatePrinterHoursPerSale(
  input: PrinterHoursPerSaleInput
): number {
  if (input.usableUnitsProduced === 0) {
    return 0;
  }

  return (input.totalPlatePrintHours / input.usableUnitsProduced) * input.unitsPerSale;
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
