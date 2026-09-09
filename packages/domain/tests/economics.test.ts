import { describe, expect, it } from "vitest";
import {
  calculateCashContribution,
  calculateContributionPerPrinterHour,
  calculateMargin,
  calculatePlateMaterialCost,
  calculatePrinterHoursPerSale,
  type ProductEconomicsInput
} from "../src/economics.js";

const economics: ProductEconomicsInput = {
  plannedSellingPrice: 40,
  cashCosts: 15,
  printerHoursPerSale: 5
};

describe("plate material cost", () => {
  it("returns 0 for no filament usages", () => {
    expect(calculatePlateMaterialCost([])).toBe(0);
  });

  it("includes both material and waste in a single usage's cost", () => {
    expect(calculatePlateMaterialCost([
      { materialGrams: 100, wasteGrams: 20, costPerGram: 0.05 }
    ])).toBeCloseTo(6);
  });

  it("sums multiple filament usages with different costs", () => {
    expect(calculatePlateMaterialCost([
      { materialGrams: 100, wasteGrams: 20, costPerGram: 0.05 },
      { materialGrams: 50, wasteGrams: 10, costPerGram: 0.02 },
      { materialGrams: 25, wasteGrams: 5, costPerGram: 0.1 }
    ])).toBeCloseTo(10.2);
  });

  it("preserves fractional amounts and costs without rounding", () => {
    expect(calculatePlateMaterialCost([
      { materialGrams: 1.25, wasteGrams: 0.125, costPerGram: 0.023 }
    ])).toBeCloseTo(0.031625, 8);
  });

  it.each([
    { materialGrams: 0, wasteGrams: 10, costPerGram: 0.05, expected: 0.5 },
    { materialGrams: 10, wasteGrams: 0, costPerGram: 0.05, expected: 0.5 },
    { materialGrams: 10, wasteGrams: 5, costPerGram: 0, expected: 0 },
    { materialGrams: 0, wasteGrams: 0, costPerGram: 0.05, expected: 0 },
    { materialGrams: 0, wasteGrams: 0, costPerGram: 0, expected: 0 }
  ])("handles zero inputs: $materialGrams, $wasteGrams, $costPerGram", ({ expected, ...usage }) => {
    expect(calculatePlateMaterialCost([usage])).toBeCloseTo(expected);
  });

  it.each(["materialGrams", "wasteGrams", "costPerGram"] as const)(
    "rejects negative %s even when other inputs are zero",
    (field) => {
      const usage = { materialGrams: 0, wasteGrams: 0, costPerGram: 0, [field]: -1 };

      expect(() => calculatePlateMaterialCost([
        { materialGrams: 100, wasteGrams: 20, costPerGram: 0.05 },
        usage
      ])).toThrow(new RangeError(`${field} must not be negative`));
    }
  );
});

describe("product economics", () => {
  it("calculates printer hours for a single unit per sale", () => {
    expect(calculatePrinterHoursPerSale({
      totalPlatePrintHours: 12,
      usableUnitsProduced: 8,
      unitsPerSale: 1
    })).toBe(1.5);
  });

  it("scales printer hours by units per sale separately from plate yield", () => {
    expect(calculatePrinterHoursPerSale({
      totalPlatePrintHours: 12,
      usableUnitsProduced: 8,
      unitsPerSale: 2
    })).toBe(3);
  });

  it("preserves fractional printer hours", () => {
    expect(calculatePrinterHoursPerSale({
      totalPlatePrintHours: 2.5,
      usableUnitsProduced: 3,
      unitsPerSale: 2
    })).toBeCloseTo(5 / 3);
  });

  it.each([0, 12])("returns 0 for zero usable units with %s print hours", (totalPlatePrintHours) => {
    expect(calculatePrinterHoursPerSale({
      totalPlatePrintHours,
      usableUnitsProduced: 0,
      unitsPerSale: 2
    })).toBe(0);
  });

  it("returns 0 for zero print hours", () => {
    expect(calculatePrinterHoursPerSale({
      totalPlatePrintHours: 0,
      usableUnitsProduced: 8,
      unitsPerSale: 2
    })).toBe(0);
  });

  it("returns 0 for zero units per sale", () => {
    expect(calculatePrinterHoursPerSale({
      totalPlatePrintHours: 12,
      usableUnitsProduced: 8,
      unitsPerSale: 0
    })).toBe(0);
  });

  it("calculates cash contribution", () => {
    expect(calculateCashContribution(economics)).toBe(25);
  });

  it("calculates margin", () => {
    expect(calculateMargin(economics)).toBe(0.625);
  });

  it("calculates contribution per printer hour", () => {
    expect(calculateContributionPerPrinterHour(economics)).toBe(5);
  });

  it("returns 0 margin when selling price is 0", () => {
    expect(
      calculateMargin({
        ...economics,
        plannedSellingPrice: 0
      })
    ).toBe(0);
  });

  it("returns 0 contribution per printer hour when printer hours are 0", () => {
    expect(
      calculateContributionPerPrinterHour({
        ...economics,
        printerHoursPerSale: 0
      })
    ).toBe(0);
  });
});
