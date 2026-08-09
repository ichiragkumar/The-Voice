import { describe, it, expect } from "vitest";
import {
  normalizeHindiNumber,
  normalizeHindiTime,
  normalizeHindiDate,
  normalizeSpokenDigits,
  fuzzyAmountMatch,
  fuzzyDateMatch,
} from "../src/lib/engine/entity-truth";

describe("Hindi number normalization", () => {
  it("normalizes basic numbers", () => {
    expect(normalizeHindiNumber("ek")).toBe(1);
    expect(normalizeHindiNumber("das")).toBe(10);
    expect(normalizeHindiNumber("pachaas")).toBe(50);
    expect(normalizeHindiNumber("ninyanve")).toBe(99);
  });

  it("normalizes hundreds", () => {
    expect(normalizeHindiNumber("ek sau")).toBe(100);
    expect(normalizeHindiNumber("do sau")).toBe(200);
    expect(normalizeHindiNumber("paanch sau")).toBe(500);
    expect(normalizeHindiNumber("nau sau ninyanve")).toBe(999);
  });

  it("normalizes thousands", () => {
    expect(normalizeHindiNumber("ek hazaar")).toBe(1000);
    expect(normalizeHindiNumber("teen hazaar")).toBe(3000);
    expect(normalizeHindiNumber("do hazaar paanch sau")).toBe(2500);
    expect(normalizeHindiNumber("chaudah sau ninyanve")).toBe(1499);
  });

  it("normalizes lakhs and crores", () => {
    expect(normalizeHindiNumber("ek lakh")).toBe(100000);
    expect(normalizeHindiNumber("ek crore")).toBe(10000000);
  });

  it("normalizes special amounts", () => {
    expect(normalizeHindiNumber("dedh sau")).toBe(150);
    expect(normalizeHindiNumber("dhai sau")).toBe(250);
    expect(normalizeHindiNumber("dedh hazaar")).toBe(1500);
    expect(normalizeHindiNumber("dhai hazaar")).toBe(2500);
    expect(normalizeHindiNumber("dedh lakh")).toBe(150000);
    expect(normalizeHindiNumber("dhai lakh")).toBe(250000);
  });

  it("handles numeric strings", () => {
    expect(normalizeHindiNumber("5000")).toBe(5000);
    expect(normalizeHindiNumber("1200")).toBe(1200);
  });

  it("returns null for empty or unrecognized", () => {
    expect(normalizeHindiNumber("")).toBeNull();
    expect(normalizeHindiNumber("hello")).toBeNull();
  });
});

describe("Hindi time normalization", () => {
  it("normalizes saade (half past)", () => {
    expect(normalizeHindiTime("saade chaar")).toBe("04:30");
    expect(normalizeHindiTime("saade das")).toBe("10:30");
    expect(normalizeHindiTime("saade baarah")).toBe("12:30");
  });

  it("normalizes paune (quarter to)", () => {
    expect(normalizeHindiTime("paune paanch")).toBe("04:45");
    expect(normalizeHindiTime("paune das")).toBe("09:45");
  });

  it("normalizes sawa (quarter past)", () => {
    expect(normalizeHindiTime("sawa teen")).toBe("03:15");
    expect(normalizeHindiTime("sawa nau")).toBe("09:15");
  });

  it("applies PM context for shaam", () => {
    expect(normalizeHindiTime("shaam saade chaar")).toBe("16:30");
  });

  it("normalizes basic baje times", () => {
    expect(normalizeHindiTime("das baje")).toBe("10:00");
    expect(normalizeHindiTime("paanch baje")).toBe("05:00");
    expect(normalizeHindiTime("shaam paanch baje")).toBe("17:00");
  });
});

describe("Hindi date normalization", () => {
  const ref = new Date("2026-08-08T10:00:00Z");

  it("normalizes aaj (today)", () => {
    expect(normalizeHindiDate("aaj", ref)).toBe("2026-08-08");
  });

  it("normalizes kal (tomorrow)", () => {
    expect(normalizeHindiDate("kal", ref)).toBe("2026-08-09");
  });

  it("normalizes parson (day after tomorrow)", () => {
    expect(normalizeHindiDate("parson", ref)).toBe("2026-08-10");
  });

  it("normalizes uske agle din", () => {
    expect(normalizeHindiDate("uske agle din", ref)).toBe("2026-08-10");
  });

  it("normalizes next weekday", () => {
    const result = normalizeHindiDate("next Monday", ref);
    expect(result).toBe("2026-08-10");
  });

  it("normalizes aakhri tareekh (last day of month)", () => {
    expect(normalizeHindiDate("is mahine ki aakhri tareekh", ref)).toBe("2026-08-31");
  });

  it("returns null for unrecognized", () => {
    expect(normalizeHindiDate("random text", ref)).toBeNull();
  });
});

describe("Spoken digit normalization", () => {
  it("normalizes double pattern", () => {
    expect(normalizeSpokenDigits("one four double nine")).toBe("1499");
  });

  it("normalizes triple pattern", () => {
    expect(normalizeSpokenDigits("triple two")).toBe("222");
  });

  it("normalizes basic digits", () => {
    expect(normalizeSpokenDigits("one two three four")).toBe("1234");
  });

  it("preserves numeric strings", () => {
    expect(normalizeSpokenDigits("9 8 7 6")).toBe("9876");
  });
});

describe("Fuzzy matching", () => {
  it("exact amount match", () => {
    expect(fuzzyAmountMatch(1500, 1500)).toBe(true);
  });

  it("within 1% tolerance", () => {
    expect(fuzzyAmountMatch(1500, 1510)).toBe(true);
    expect(fuzzyAmountMatch(1500, 1600)).toBe(false);
  });

  it("exact date match", () => {
    expect(fuzzyDateMatch("2026-08-10", "2026-08-10")).toBe(true);
  });

  it("adjacent dates within tolerance", () => {
    expect(fuzzyDateMatch("2026-08-10", "2026-08-11")).toBe(true);
  });

  it("distant dates fail", () => {
    expect(fuzzyDateMatch("2026-08-10", "2026-08-15")).toBe(false);
  });
});
