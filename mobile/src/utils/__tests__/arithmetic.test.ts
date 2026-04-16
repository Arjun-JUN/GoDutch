import { roundToTwo, splitEqually, calculatePercentage } from "../arithmetic";

describe("Arithmetic Utilities", () => {
  describe("roundToTwo", () => {
    it("rounds 10.555 to 10.56", () => {
      expect(roundToTwo(10.555)).toBe(10.56);
    });

    it("rounds 10.554 to 10.55", () => {
      expect(roundToTwo(10.554)).toBe(10.55);
    });

    it("handles integers correctly", () => {
      expect(roundToTwo(10)).toBe(10);
    });
  });

  describe("splitEqually", () => {
    it("splits 100 into 3 parts correctly (33.34, 33.33, 33.33)", () => {
      const result = splitEqually(100, 3);
      expect(result).toEqual([33.34, 33.33, 33.33]);
      expect(result.reduce((a, b) => a + b, 0)).toBe(100);
    });

    it("splits 10 into 4 parts correctly (2.5, 2.5, 2.5, 2.5)", () => {
      const result = splitEqually(10, 4);
      expect(result).toEqual([2.5, 2.5, 2.5, 2.5]);
      expect(result.reduce((a, b) => a + b, 0)).toBe(10);
    });

    it("returns empty array for 0 parts", () => {
      expect(splitEqually(100, 0)).toEqual([]);
    });

    it("handles large numbers and precision", () => {
      const total = 1000000.01;
      const parts = 3;
      const result = splitEqually(total, parts);
      expect(result.reduce((a, b) => a + b, 0)).toBe(total);
    });
  });

  describe("calculatePercentage", () => {
    it("calculates 10% of 100 as 10", () => {
      expect(calculatePercentage(100, 10)).toBe(10);
    });

    it("calculates 33.33% of 100 correctly", () => {
      expect(calculatePercentage(100, 33.33)).toBe(33.33);
    });

    it("rounds result to 2 decimals", () => {
      // 10.555% of 100 is 10.555, rounds to 10.56
      expect(calculatePercentage(100, 10.555)).toBe(10.56);
    });
  });
});
