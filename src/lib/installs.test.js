import { parseInstalls, installTier, installScale } from "./installs";
import { games } from "../data";

test("parses Play Store tiers", () => {
  expect(parseInstalls("100M+ downloads")).toBe(100e6);
  expect(parseInstalls("500K+ downloads")).toBe(500e3);
  expect(parseInstalls("1M+ downloads")).toBe(1e6);
  expect(parseInstalls("Personal project")).toBeNull();
  expect(parseInstalls(undefined)).toBeNull();
});

test("extracts the tier label", () => {
  expect(installTier("50M+ downloads")).toBe("50M+");
  expect(installTier("Personal project")).toBeNull();
});

test("scale is ordered and stays within the bar", () => {
  const values = [100e3, 500e3, 1e6, 5e6, 10e6, 50e6, 100e6].map(installScale);
  values.forEach((v) => {
    expect(v).toBeGreaterThan(0);
    expect(v).toBeLessThanOrEqual(1);
  });
  expect([...values].sort((a, b) => a - b)).toEqual(values);
  expect(installScale(100e6)).toBe(1);
});

test("the tiers add up to the 325M+ headline", () => {
  const total = games.reduce((sum, g) => sum + (parseInstalls(g.badge) || 0), 0);
  expect(total).toBeGreaterThanOrEqual(325e6);
});
