import { describe, expect, it } from "vitest";
import {
  calculateCashContribution,
  calculateContributionPerPrinterHour,
  calculateMargin,
  calculatePrinterHoursPerSale,
  type ProductEconomicsInput
} from "../src/economics.js";

const economics: ProductEconomicsInput = {
  plannedSellingPrice: 40,
  cashCosts: 15,
  printerHoursPerSale: 5
};

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
