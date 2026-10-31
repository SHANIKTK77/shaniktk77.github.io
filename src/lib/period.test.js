import { parsePoint, parsePeriod, formatSpan } from "./period";

const now = new Date(2026, 9, 31); // 31 Oct 2026

test("parses month-year, year and Present", () => {
  expect(parsePoint("Oct 2022")).toBeCloseTo(2022.75);
  expect(parsePoint("2020")).toBe(2020);
  expect(parsePoint("Present", now)).toBeCloseTo(2026 + 9 / 12);
  expect(parsePoint("someday")).toBeNull();
});

test("parses a period with an en dash or a hyphen", () => {
  expect(parsePeriod("Jul 2021 – Oct 2022")).toEqual({ start: 2021.5, end: 2022.75, current: false });
  expect(parsePeriod("2017 - 2021")).toEqual({ start: 2017, end: 2021, current: false });
  expect(parsePeriod("Oct 2022 – Present", now).current).toBe(true);
  expect(parsePeriod("2022 – 2020")).toBeNull();
});

test("formats a span in years and months", () => {
  expect(formatSpan(4)).toBe("4y");
  expect(formatSpan(1.25)).toBe("1y 3m");
  expect(formatSpan(0.5)).toBe("6m");
});
