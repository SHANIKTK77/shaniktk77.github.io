import { buildGrid, hexToRgb, createTerrain } from "./terrain";

test("builds one pair of vertices per line segment", () => {
  const grid = buildGrid(3, 5);
  // 3 rows x 4 segments x 2 vertices x 2 floats
  expect(grid).toHaveLength(48);
  expect(grid[0]).toBe(-1);
  expect(grid[2 * 2 * 4 - 2]).toBe(1); // last x of the first row
});

test("parses hex colours into 0-1 channels", () => {
  expect(hexToRgb("#ff8000")).toEqual([1, 128 / 255, 0]);
  expect(hexToRgb(" #000000 ")).toEqual([0, 0, 0]);
  expect(hexToRgb("tomato")).toEqual([0.5, 0.5, 0.5]);
});

test("returns null when WebGL isn't available", () => {
  expect(createTerrain(document.createElement("canvas"))).toBeNull();
});
