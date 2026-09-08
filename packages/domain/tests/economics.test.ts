import { describe, expect, it } from "vitest";
import {
  calculateCashContribution,
  calculateContributionPerPrinterHour,
  calculateMargin,
  type ProductEconomicsInput
} from "../src/economics.js";

const economics: ProductEconomicsInput = {
  plannedSellingPrice: 40,
  cashCosts: 15,
  printerHoursPerSale: 5
};

describe("product economics", () => {
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