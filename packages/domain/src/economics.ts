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
