import { describe, expect, it } from "vitest";
import {
  calculateCashContribution,
  calculateContributionPerPrinterHour,
  calculateFilamentCostPerGram,
  calculateMargin,
  calculateMaterialCostPerFinishedUnit,
  calculateMaterialCostPerSale,
  calculatePlateMaterialCost,
  calculatePrinterHoursPerFinishedUnit,
  calculatePrinterHoursPerSale,
  calculateProductionProfileMaterialCost,
  calculateProductionProfilePrinterHours,
  derivePlateReadiness,
  isValidFilamentUsage,
  type CalculationResult,
  type FilamentPricingInput,
  type FilamentUsageCostInput,
  type PlateEconomicsInput,
  type ProductionProfileEconomicsInput
} from "../src/index.js";

const filaments = new Map([
  ["pla", { marketPrice: 20, referenceQuantityGrams: 1000 }],
  ["support", { marketPrice: 50, referenceQuantityGrams: 1000 }]
]);

function usage(overrides: Partial<FilamentUsageCostInput> = {}): FilamentUsageCostInput {
  return { filamentId: "pla", modelGrams: 100, supportGrams: 0, purgeGrams: 0, towerGrams: 0, ...overrides };
}

function ghosts(): ProductionProfileEconomicsInput {
  return {
    plannedBatchUnits: 12,
    plates: [
      { plannedPlatePrintHours: 8, filamentUsages: [usage({ modelGrams: 450 })] },
      { plannedPlatePrintHours: 2, filamentUsages: [usage({ modelGrams: 150 })] }
    ]
  };
}

function value(result: CalculationResult): number {
  if (!result.available) throw new Error(result.reason);
  return result.value;
}

function expectUnavailable(result: CalculationResult): void {
  expect(result).toEqual({ available: false, reason: expect.any(String) });
}

const invalidNonnegative = [undefined, null, -1, NaN, Infinity, -Infinity, "0"];
const invalidPositive = [0, ...invalidNonnegative];
const consumptionFields = ["modelGrams", "supportGrams", "purgeGrams", "towerGrams"] as const;

describe("saved FilamentUsage validation", () => {
  it("accepts four explicit zeros for a saved usage, without making its Plate costable", () => {
    const zeroUsage = usage({ modelGrams: 0 });
    expect(isValidFilamentUsage(zeroUsage)).toBe(true);
    expectUnavailable(calculatePlateMaterialCost([zeroUsage], filaments));
  });

  it.each(consumptionFields)("requires finite nonnegative %s", (field) => {
    for (const invalid of invalidNonnegative) {
      const proposed = { ...usage(), [field]: invalid };
      expect(isValidFilamentUsage(proposed)).toBe(false);
      // Simulate invalid external data bypassing TypeScript at runtime.
      expectUnavailable(calculatePlateMaterialCost([proposed as FilamentUsageCostInput], filaments));
    }
    const proposed: Partial<FilamentUsageCostInput> = usage();
    delete proposed[field];
    expect(isValidFilamentUsage(proposed)).toBe(false);
  });

  it.each([null, undefined, {}, { ...usage(), filamentId: "" }, { ...usage(), filamentId: " " }])(
    "rejects malformed or unreferenced usage %#", (proposed) => {
      expect(isValidFilamentUsage(proposed)).toBe(false);
    }
  );
});

describe("Filament market pricing", () => {
  it("derives cost per gram from a positive market price and reference weight", () => {
    expect(value(calculateFilamentCostPerGram({ marketPrice: 20, referenceQuantityGrams: 1000 }))).toBe(0.02);
  });

  it.each(["marketPrice", "referenceQuantityGrams"] as const)("rejects invalid %s", (field) => {
    for (const invalid of invalidPositive) {
      const pricing = { marketPrice: 20, referenceQuantityGrams: 1000, [field]: invalid };
      expectUnavailable(calculateFilamentCostPerGram(pricing as FilamentPricingInput));
      expectUnavailable(calculatePlateMaterialCost([usage()], new Map([["pla", pricing as FilamentPricingInput]])));
    }
  });

  it("uses updated reusable pricing for all dependent Plates without changing usages", () => {
    const profile = ghosts();
    const before = structuredClone(profile);
    const updated = new Map(filaments);
    expect(value(calculateProductionProfileMaterialCost(profile, updated))).toBe(12);
    updated.set("pla", { marketPrice: 40, referenceQuantityGrams: 1000 });
    expect(value(calculatePlateMaterialCost(profile.plates[0].filamentUsages, updated))).toBe(18);
    expect(value(calculatePlateMaterialCost(profile.plates[1].filamentUsages, updated))).toBe(6);
    expect(value(calculateMaterialCostPerFinishedUnit(profile, updated))).toBe(2);
    expect(profile).toEqual(before);
  });

  it("rejects missing references and unrepresentable derived pricing", () => {
    expectUnavailable(calculatePlateMaterialCost([usage({ filamentId: "missing" })], filaments));
    expectUnavailable(calculateFilamentCostPerGram({ marketPrice: Number.MAX_VALUE, referenceQuantityGrams: Number.MIN_VALUE }));
    expectUnavailable(calculateFilamentCostPerGram({ marketPrice: Number.MIN_VALUE, referenceQuantityGrams: Number.MAX_VALUE }));
  });
});

describe("Plate material cost", () => {
  it("includes all four categories and multiple filaments, including support-only usage", () => {
    const usages = [
      usage({ modelGrams: 100, supportGrams: 20, purgeGrams: 10, towerGrams: 5 }),
      usage({ filamentId: "support", modelGrams: 0, supportGrams: 30 })
    ];
    expect(value(calculatePlateMaterialCost(usages, filaments))).toBeCloseTo(4.2);
  });

  it("preserves fractional consumption without rounding", () => {
    expect(value(calculatePlateMaterialCost([
      usage({ modelGrams: 1.25, supportGrams: 0.125 })
    ], filaments))).toBeCloseTo(0.0275, 10);
  });

  it("does not cost an empty or support-only Plate as zero", () => {
    expectUnavailable(calculatePlateMaterialCost([], filaments));
    expectUnavailable(calculatePlateMaterialCost([usage({ modelGrams: 0, supportGrams: 20 })], filaments));
  });

  it("does not sum a known subset when another usage is invalid", () => {
    expectUnavailable(calculatePlateMaterialCost([
      usage(), usage({ towerGrams: NaN })
    ], filaments));
  });

  it("does not expose numeric overflow as an available cost", () => {
    expectUnavailable(calculatePlateMaterialCost([
      usage({ modelGrams: Number.MAX_VALUE, supportGrams: Number.MAX_VALUE })
    ], filaments));
  });
});

describe("shared ProductionProfile batch economics", () => {
  it("aggregates Body and Eyes for 12 Ghosts before dividing by the shared batch", () => {
    const profile = ghosts();
    expect(value(calculateProductionProfileMaterialCost(profile, filaments))).toBe(12);
    expect(value(calculateProductionProfilePrinterHours(profile))).toBe(10);
    expect(value(calculateMaterialCostPerFinishedUnit(profile, filaments))).toBe(1);
    expect(value(calculatePrinterHoursPerFinishedUnit(profile))).toBeCloseTo(5 / 6);
    expect(value(calculateMaterialCostPerSale({ ...profile, unitsPerSale: 2 }, filaments))).toBe(2);
    expect(value(calculatePrinterHoursPerSale({ ...profile, unitsPerSale: 2 }))).toBeCloseTo(5 / 3);
  });

  it("changes the batch denominator without scaling or mutating Plate inputs", () => {
    const profile = ghosts();
    const before = structuredClone(profile.plates);
    const changed = { ...profile, plannedBatchUnits: 20 };
    expect(value(calculateMaterialCostPerFinishedUnit(changed, filaments))).toBe(0.6);
    expect(value(calculatePrinterHoursPerFinishedUnit(changed))).toBe(0.5);
    expect(value(calculateProductionProfileMaterialCost(changed, filaments))).toBe(12);
    expect(changed.plates).toEqual(before);
  });

  it.each(invalidPositive)("rejects invalid batch quantity %s even with zero time or units per sale", (invalid) => {
    const profile = { ...ghosts(), plannedBatchUnits: invalid } as ProductionProfileEconomicsInput;
    const sale = { ...profile, unitsPerSale: 0 };
    expectUnavailable(calculateMaterialCostPerFinishedUnit(profile, filaments));
    expectUnavailable(calculatePrinterHoursPerFinishedUnit(profile));
    expectUnavailable(calculateMaterialCostPerSale(sale, filaments));
    expectUnavailable(calculatePrinterHoursPerSale({ ...sale, plates: [{ plannedPlatePrintHours: 0, filamentUsages: [usage()] }] }));
    expect(value(calculateProductionProfileMaterialCost(profile, filaments))).toBe(12);
    expect(value(calculateProductionProfilePrinterHours(profile))).toBe(10);
  });

  it.each(invalidNonnegative)("rejects invalid unitsPerSale %s", (invalid) => {
    const input = { ...ghosts(), unitsPerSale: invalid as number };
    expectUnavailable(calculateMaterialCostPerSale(input, filaments));
    expectUnavailable(calculatePrinterHoursPerSale(input));
  });

  it("accepts zero time and zero units per sale with otherwise sufficient inputs", () => {
    const profile = { plannedBatchUnits: 12, plates: [{ plannedPlatePrintHours: 0, filamentUsages: [usage()] }] };
    expect(value(calculatePrinterHoursPerFinishedUnit(profile))).toBe(0);
    expect(value(calculatePrinterHoursPerSale({ ...profile, unitsPerSale: 2 }))).toBe(0);
    expect(value(calculateMaterialCostPerSale({ ...ghosts(), unitsPerSale: 0 }, filaments))).toBe(0);
    expect(value(calculatePrinterHoursPerSale({ ...ghosts(), unitsPerSale: 0 }))).toBe(0);
    expect(value(calculateMaterialCostPerFinishedUnit(ghosts(), filaments))).toBe(1);
  });

  it("does not treat a profile without Plates as known zero production", () => {
    const empty = { plannedBatchUnits: 12, plates: [] };
    expectUnavailable(calculateProductionProfileMaterialCost(empty, filaments));
    expectUnavailable(calculateProductionProfilePrinterHours(empty));
  });
});

describe("independent metric availability", () => {
  it.each(invalidNonnegative)("keeps material and profitability available when Eyes print time is %s", (invalid) => {
    const profile = ghosts();
    profile.plates[1].plannedPlatePrintHours = invalid as number;
    expectUnavailable(calculateProductionProfilePrinterHours(profile));
    expectUnavailable(calculatePrinterHoursPerSale({ ...profile, unitsPerSale: 1 }));
    const material = calculateMaterialCostPerSale({ ...profile, unitsPerSale: 1 }, filaments);
    expect(value(material)).toBe(1);
    // This example has no other cash costs; time is intentionally unknown.
    const product = { plannedSellingPrice: 5, cashCosts: value(material) };
    expect(value(calculateCashContribution(product))).toBe(4);
    expect(value(calculateMargin(product))).toBe(0.8);
    expectUnavailable(calculateContributionPerPrinterHour(product));
  });

  it("keeps capacity available but not profitability when Eyes has no usages", () => {
    const profile = ghosts();
    profile.plates[1].filamentUsages = [];
    const material = calculateMaterialCostPerSale({ ...profile, unitsPerSale: 1 }, filaments);
    expectUnavailable(material);
    const hours = calculatePrinterHoursPerSale({ ...profile, unitsPerSale: 1 });
    expect(value(hours)).toBeCloseTo(5 / 6);
    const product = { plannedSellingPrice: 5, cashCosts: material.available ? material.value : undefined, printerHoursPerSale: value(hours) };
    expectUnavailable(calculateCashContribution(product));
    expectUnavailable(calculateMargin(product));
    expectUnavailable(calculateContributionPerPrinterHour(product));
    expectUnavailable(calculateMaterialCostPerSale({ ...profile, unitsPerSale: 0 }, filaments));
  });

  it("retains printer capacity when current filament pricing is invalid", () => {
    const profile = ghosts();
    const invalidCatalog = new Map([["pla", { marketPrice: 0, referenceQuantityGrams: 1000 }]]);
    expectUnavailable(calculateProductionProfileMaterialCost(profile, invalidCatalog));
    expect(value(calculateProductionProfilePrinterHours(profile))).toBe(10);
  });
});

describe("derived Plate readiness", () => {
  it("remains print-ready when invalid Filament pricing makes material cost unavailable", () => {
    const profile = ghosts();
    const plate = profile.plates[0];
    const currentFilaments = new Map(filaments);

    expect(derivePlateReadiness(plate, profile)).toBe("PRINT_READY");
    expect(value(calculatePlateMaterialCost(plate.filamentUsages, currentFilaments))).toBe(9);

    currentFilaments.set("pla", { marketPrice: 0, referenceQuantityGrams: 1000 });

    expectUnavailable(calculatePlateMaterialCost(plate.filamentUsages, currentFilaments));
    expect(derivePlateReadiness(plate, profile)).toBe("PRINT_READY");
  });

  it("transitions from unfinished to ready and back using saved inputs", () => {
    const profile = { plannedBatchUnits: 12 };
    const plate: PlateEconomicsInput = { filamentUsages: [] };
    expect(derivePlateReadiness(plate, profile)).toBe("STILL_EDITING");
    plate.plannedPlatePrintHours = 0;
    plate.filamentUsages = [usage()];
    expect(derivePlateReadiness(plate, profile)).toBe("PRINT_READY");
    plate.filamentUsages = [];
    expect(derivePlateReadiness(plate, profile)).toBe("STILL_EDITING");
    plate.filamentUsages = [usage()];
    expect(derivePlateReadiness(plate, profile)).toBe("PRINT_READY");
    plate.plannedPlatePrintHours = null;
    expect(derivePlateReadiness(plate, profile)).toBe("STILL_EDITING");
  });

  it.each(invalidPositive)("requires a positive finite parent batch: %s", (invalid) => {
    expect(derivePlateReadiness(ghosts().plates[0], { plannedBatchUnits: invalid as number })).toBe("STILL_EDITING");
  });

  it.each(invalidNonnegative)("requires finite nonnegative print time: %s", (invalid) => {
    expect(derivePlateReadiness({ ...ghosts().plates[0], plannedPlatePrintHours: invalid as number }, ghosts())).toBe("STILL_EDITING");
  });

  it.each(consumptionFields)("rejects incomplete %s for readiness", (field) => {
    const plate = { plannedPlatePrintHours: 1, filamentUsages: [{ ...usage(), [field]: undefined } as unknown as FilamentUsageCostInput] };
    expect(derivePlateReadiness(plate, ghosts())).toBe("STILL_EDITING");
  });

  it("requires positive model consumption, but allows individual support-only usages", () => {
    const plate = { plannedPlatePrintHours: 1, filamentUsages: [usage({ modelGrams: 0, supportGrams: 5 })] };
    expect(derivePlateReadiness(plate, ghosts())).toBe("STILL_EDITING");
    plate.filamentUsages.push(usage());
    expect(derivePlateReadiness(plate, ghosts())).toBe("PRINT_READY");
  });

  it("does not use an unresolved batch review as a completeness condition", () => {
    const profile = { ...ghosts(), plannedBatchUnits: 20, outstandingBatchReview: true };
    expect(derivePlateReadiness(profile.plates[0], profile)).toBe("PRINT_READY");
  });
});

describe("product economics", () => {
  const product = { plannedSellingPrice: 40, cashCosts: 15, printerHoursPerSale: 5 };

  it("preserves contribution, margin, and contribution per printer hour", () => {
    expect(value(calculateCashContribution(product))).toBe(25);
    expect(value(calculateMargin(product))).toBe(0.625);
    expect(value(calculateContributionPerPrinterHour(product))).toBe(5);
    expect(value(calculateCashContribution({ plannedSellingPrice: 5, cashCosts: 10 }))).toBe(-5);
    expect(value(calculateMargin({ plannedSellingPrice: 5, cashCosts: 10 }))).toBe(-1);
  });

  it.each(["plannedSellingPrice", "cashCosts"] as const)("requires known valid %s", (field) => {
    for (const invalid of invalidNonnegative) {
      const input = { ...product, [field]: invalid as number };
      expectUnavailable(calculateCashContribution(input));
      expectUnavailable(calculateMargin(input));
      expectUnavailable(calculateContributionPerPrinterHour(input));
    }
  });

  it.each(invalidPositive)("does not return misleading contribution per hour for %s hours", (invalid) => {
    expectUnavailable(calculateContributionPerPrinterHour({ ...product, printerHoursPerSale: invalid as number }));
  });

  it("keeps known zero cash cost distinct from unknown cost and undefined ratios", () => {
    expect(value(calculateCashContribution({ ...product, cashCosts: 0 }))).toBe(40);
    expect(value(calculateCashContribution({ ...product, plannedSellingPrice: 0 }))).toBe(-15);
    expectUnavailable(calculateMargin({ ...product, plannedSellingPrice: 0 }));
    expectUnavailable(calculateMargin({ plannedSellingPrice: 0 }));
  });
});
