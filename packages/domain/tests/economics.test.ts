import { describe, expect, it } from "vitest";
import {
  calculateCashContribution,
  calculateContributionPerPrinterHour,
  calculateMargin,
  calculateMaterialCostPerSale,
  calculatePlateMaterialCost,
  calculatePrinterHoursPerFinishedUnit,
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

  it("costs model grams alone", () => {
    expect(calculatePlateMaterialCost([
      { modelGrams: 100, costPerGram: 0.05 }
    ])).toBeCloseTo(5);
  });

  it("includes model and support grams", () => {
    expect(calculatePlateMaterialCost([
      { modelGrams: 100, supportGrams: 20, costPerGram: 0.05 }
    ])).toBeCloseTo(6);
  });

  it("includes all four consumption categories", () => {
    expect(calculatePlateMaterialCost([
      { modelGrams: 100, supportGrams: 20, purgeGrams: 10, towerGrams: 5, costPerGram: 0.05 }
    ])).toBeCloseTo(6.75);
  });

  it("sums multiple filament usages with different specified categories and costs", () => {
    expect(calculatePlateMaterialCost([
      { modelGrams: 100, supportGrams: 20, costPerGram: 0.05 },
      { purgeGrams: 50, towerGrams: 10, costPerGram: 0.02 },
      { modelGrams: 25, towerGrams: 5, costPerGram: 0.1 }
    ])).toBeCloseTo(10.2);
  });

  it("preserves fractional amounts and costs without rounding", () => {
    expect(calculatePlateMaterialCost([
      { modelGrams: 1.25, supportGrams: 0.125, costPerGram: 0.023 }
    ])).toBeCloseTo(0.031625, 8);
  });

  it("omits unspecified categories from the known cost", () => {
    expect(calculatePlateMaterialCost([
      { modelGrams: 10, towerGrams: 2, costPerGram: 0.05 }
    ])).toBeCloseTo(0.6);
  });

  it("returns 0 known cost when all categories are unspecified", () => {
    expect(calculatePlateMaterialCost([{ costPerGram: 0.05 }])).toBe(0);
  });

  it("accepts explicit zero in every category", () => {
    expect(calculatePlateMaterialCost([{
      modelGrams: 0,
      supportGrams: 0,
      purgeGrams: 0,
      towerGrams: 0,
      costPerGram: 0.05
    }])).toBe(0);
  });

  it("accepts zero cost per gram", () => {
    expect(calculatePlateMaterialCost([{
      modelGrams: 10,
      supportGrams: 5,
      purgeGrams: 2,
      towerGrams: 1,
      costPerGram: 0
    }])).toBe(0);
  });

  it.each(["modelGrams", "supportGrams", "purgeGrams", "towerGrams", "costPerGram"] as const)(
    "rejects negative %s even when other inputs are zero",
    (field) => {
      const usage = { costPerGram: 0, [field]: -1 };

      expect(() => calculatePlateMaterialCost([
        { modelGrams: 100, supportGrams: 20, costPerGram: 0.05 },
        usage
      ])).toThrow(new RangeError(`${field} must not be negative`));
    }
  );
});

describe("material cost per sale", () => {
  it.each([
    { plateMaterialCost: 12, plannedUsableUnits: 8, unitsPerSale: 1, expected: 1.5 },
    { plateMaterialCost: 12, plannedUsableUnits: 8, unitsPerSale: 2, expected: 3 },
    { plateMaterialCost: 0, plannedUsableUnits: 8, unitsPerSale: 2, expected: 0 },
    { plateMaterialCost: 12, plannedUsableUnits: 8, unitsPerSale: 0, expected: 0 }
  ])("calculates $expected from $plateMaterialCost cost, $plannedUsableUnits yield, and $unitsPerSale per sale", ({ expected, ...input }) => {
    expect(calculateMaterialCostPerSale(input)).toBe(expected);
  });

  it("preserves fractional material cost per sale without rounding", () => {
    expect(calculateMaterialCostPerSale({
      plateMaterialCost: 2.5,
      plannedUsableUnits: 3,
      unitsPerSale: 2
    })).toBeCloseTo(5 / 3, 10);
  });

  it.each([
    { plateMaterialCost: 12, plannedUsableUnits: 0, unitsPerSale: 2 },
    { plateMaterialCost: 0, plannedUsableUnits: 0, unitsPerSale: 2 },
    { plateMaterialCost: 12, plannedUsableUnits: 0, unitsPerSale: 0 },
    { plateMaterialCost: 12, plannedUsableUnits: -1, unitsPerSale: 2 },
    { plateMaterialCost: 0, plannedUsableUnits: -1, unitsPerSale: 0 }
  ])("rejects invalid yield with $plateMaterialCost cost, $plannedUsableUnits yield, and $unitsPerSale per sale", (input) => {
    expect(() => calculateMaterialCostPerSale(input)).toThrow(
      new RangeError("plannedUsableUnits must be greater than zero")
    );
  });

  it.each([
    { plateMaterialCost: -1, plannedUsableUnits: 8, unitsPerSale: 2, field: "plateMaterialCost" },
    { plateMaterialCost: -1, plannedUsableUnits: 8, unitsPerSale: 0, field: "plateMaterialCost" },
    { plateMaterialCost: 12, plannedUsableUnits: 8, unitsPerSale: -1, field: "unitsPerSale" },
    { plateMaterialCost: 0, plannedUsableUnits: 8, unitsPerSale: -1, field: "unitsPerSale" }
  ])("rejects negative $field with $plateMaterialCost cost and $unitsPerSale per sale", ({ field, ...input }) => {
    expect(() => calculateMaterialCostPerSale(input)).toThrow(
      new RangeError(`${field} must not be negative`)
    );
  });
});

describe("printer hours per finished unit", () => {
  it("calculates printer capacity for one planned usable finished unit", () => {
    expect(calculatePrinterHoursPerFinishedUnit({
      plannedPlatePrintHours: 12,
      plannedUsableUnits: 8
    })).toBe(1.5);
  });

  it("preserves fractional printer hours without rounding", () => {
    expect(calculatePrinterHoursPerFinishedUnit({
      plannedPlatePrintHours: 2.5,
      plannedUsableUnits: 3
    })).toBeCloseTo(5 / 6, 10);
  });

  it("returns 0 for zero planned print time with positive yield", () => {
    expect(calculatePrinterHoursPerFinishedUnit({
      plannedPlatePrintHours: 0,
      plannedUsableUnits: 8
    })).toBe(0);
  });

  it.each([
    { plannedPlatePrintHours: 12, plannedUsableUnits: 0 },
    { plannedPlatePrintHours: 0, plannedUsableUnits: 0 },
    { plannedPlatePrintHours: 12, plannedUsableUnits: -1 },
    { plannedPlatePrintHours: 0, plannedUsableUnits: -1 }
  ])("rejects invalid yield: $plannedPlatePrintHours hours, $plannedUsableUnits units", (input) => {
    expect(() => calculatePrinterHoursPerFinishedUnit(input)).toThrow(
      new RangeError("plannedUsableUnits must be greater than zero")
    );
  });

  it("rejects negative planned print time", () => {
    expect(() => calculatePrinterHoursPerFinishedUnit({
      plannedPlatePrintHours: -1,
      plannedUsableUnits: 8
    })).toThrow(new RangeError("plannedPlatePrintHours must not be negative"));
  });
});

describe("product economics", () => {
  it.each([
    { plannedPlatePrintHours: -1, plannedUsableUnits: 0, unitsPerSale: -1, message: "plannedUsableUnits must be greater than zero" },
    { plannedPlatePrintHours: -1, plannedUsableUnits: 8, unitsPerSale: -1, message: "plannedPlatePrintHours must not be negative" }
  ])("preserves validation priority: $message", ({ message, ...input }) => {
    expect(() => calculatePrinterHoursPerSale(input)).toThrow(new RangeError(message));
  });

  it("calculates printer hours for a single unit per sale", () => {
    expect(calculatePrinterHoursPerSale({
      plannedPlatePrintHours: 12,
      plannedUsableUnits: 8,
      unitsPerSale: 1
    })).toBe(1.5);
  });

  it("scales printer hours by units per sale separately from plate yield", () => {
    expect(calculatePrinterHoursPerSale({
      plannedPlatePrintHours: 12,
      plannedUsableUnits: 8,
      unitsPerSale: 2
    })).toBe(3);
  });

  it("preserves fractional printer hours", () => {
    expect(calculatePrinterHoursPerSale({
      plannedPlatePrintHours: 2.5,
      plannedUsableUnits: 3,
      unitsPerSale: 2
    })).toBeCloseTo(5 / 3);
  });

  it.each([
    { plannedPlatePrintHours: 12, plannedUsableUnits: 0, unitsPerSale: 2 },
    { plannedPlatePrintHours: 0, plannedUsableUnits: 0, unitsPerSale: 2 },
    { plannedPlatePrintHours: 12, plannedUsableUnits: 0, unitsPerSale: 0 },
    { plannedPlatePrintHours: 0, plannedUsableUnits: 0, unitsPerSale: 0 },
    { plannedPlatePrintHours: 12, plannedUsableUnits: -1, unitsPerSale: 2 },
    { plannedPlatePrintHours: 0, plannedUsableUnits: -1, unitsPerSale: 0 }
  ])("rejects invalid planned yield: $plannedPlatePrintHours hours, $plannedUsableUnits units, $unitsPerSale per sale", (input) => {
    expect(() => calculatePrinterHoursPerSale(input)).toThrow(
      new RangeError("plannedUsableUnits must be greater than zero")
    );
  });

  it.each([
    { plannedPlatePrintHours: -1, plannedUsableUnits: 8, unitsPerSale: 2, field: "plannedPlatePrintHours" },
    { plannedPlatePrintHours: -1, plannedUsableUnits: 8, unitsPerSale: 0, field: "plannedPlatePrintHours" },
    { plannedPlatePrintHours: 12, plannedUsableUnits: 8, unitsPerSale: -1, field: "unitsPerSale" },
    { plannedPlatePrintHours: 0, plannedUsableUnits: 8, unitsPerSale: -1, field: "unitsPerSale" }
  ])("rejects negative $field with $plannedPlatePrintHours hours and $unitsPerSale per sale", ({ field, ...input }) => {
    expect(() => calculatePrinterHoursPerSale(input)).toThrow(
      new RangeError(`${field} must not be negative`)
    );
  });

  it("returns 0 for zero planned print hours with positive planned yield", () => {
    expect(calculatePrinterHoursPerSale({
      plannedPlatePrintHours: 0,
      plannedUsableUnits: 8,
      unitsPerSale: 2
    })).toBe(0);
  });

  it("returns 0 for zero units per sale", () => {
    expect(calculatePrinterHoursPerSale({
      plannedPlatePrintHours: 12,
      plannedUsableUnits: 8,
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
