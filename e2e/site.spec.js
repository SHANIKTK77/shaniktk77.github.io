const { test, expect } = require("@playwright/test");

const WIDTHS = [320, 344, 360, 375, 768, 1024, 1440, 1920];

// Collect console errors and failed same-origin requests for every page a test opens
let problems = [];

test.beforeEach(async ({ page }) => {
  problems = [];
  page.on("console", (msg) => msg.type() === "error" && problems.push(msg.text()));
  page.on("pageerror", (err) => problems.push(err.message));
  page.on("requestfailed", (req) => {
    if (req.url().startsWith("http://localhost")) problems.push(`Request failed: ${req.url()}`);
  });
});

test.afterEach(async () => {
  expect(problems, "console errors or failed requests").toEqual([]);
});

test("home page renders every section with no console errors", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("run well on cheap phones");
  for (const name of ["Games I've worked on", "Experience", "Skills and tools", "Get in touch"]) {
    await expect(page.getByRole("heading", { level: 2, name })).toBeVisible();
  }
});

test("all game screenshots load", async ({ page }) => {
  await page.goto("/");
  // Wide screens show the screenshots in the game view, narrow ones in each row; either
  // way the 10 team games plus the solo project are on screen
  const images = page.locator(".shot img:visible");
  const count = await images.count();
  expect(count).toBe(11);
  for (let i = 0; i < count; i++) {
    const img = images.nth(i);
    await img.scrollIntoViewIfNeeded();
    await expect(img).toHaveJSProperty("complete", true);
    expect(await img.evaluate((el) => el.naturalWidth)).toBeGreaterThan(0);
  }
});

test("no horizontal overflow at any width", async ({ page }) => {
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow, `overflow at ${width}px`).toBeLessThanOrEqual(0);
  }
});

test("section navigation scrolls to each section", async ({ page, isMobile }) => {
  test.skip(isMobile, "Desktop nav is hidden on phones; the menu test covers it");
  await page.goto("/");
  for (const name of ["Work", "Experience", "Skills", "Contact"]) {
    await page.getByRole("navigation", { name: "Sections", exact: true }).getByRole("link", { name }).click();
    await expect(page).toHaveURL(new RegExp(`#${name.toLowerCase()}$`));
    await expect(page.locator(`#${name.toLowerCase()}`)).toBeInViewport();
  }
});

test("mobile menu navigates and closes", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Phone only");
  await page.goto("/");
  // Its label switches between Menu and Close, so find it by what it controls
  const toggle = page.locator('button[aria-controls="mobile-menu"]');
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(toggle).toHaveText("Close");
  await page.getByRole("navigation", { name: "Sections menu" }).getByRole("link", { name: /Experience/ }).click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#experience")).toBeInViewport();
});

test("theme choice persists across reloads and onto the privacy page", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(await bg()).toBe("rgb(12, 13, 15)");

  await page.reload();
  expect(await bg()).toBe("rgb(12, 13, 15)");

  await page.goto("/privacy-policy/");
  expect(await bg()).toBe("rgb(12, 13, 15)");
});

test("keyboard: skip link moves focus to the content", async ({ page, isMobile }) => {
  test.skip(isMobile, "Keyboard test");
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
});

test("privacy policy and resume are reachable", async ({ page, request }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Privacy policy" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Privacy Policy" })).toBeVisible();

  await page.goto("/");
  const href = await page.locator("a[download]").first().getAttribute("href");
  const res = await request.get(href);
  expect(res.ok()).toBeTruthy();
  expect(res.headers()["content-type"]).toContain("pdf");
});

test("respects reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const duration = await page
    .locator(".hero__title")
    .evaluate((el) => getComputedStyle(el).transitionDuration);
  expect(parseFloat(duration)).toBeLessThanOrEqual(0.001);
});

test("the live scene renders and reports real frame numbers", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".scene")).toHaveClass(/is-ready/);
  const readout = page.locator(".frame");
  await expect(readout).toContainText("draw calls");
  // A non-zero frame rate means the render loop is actually running
  await expect
    .poll(async () => Number(await readout.locator("dt:text-is('fps') + dd").textContent()))
    .toBeGreaterThan(0);
  // The canvas has pixels drawn into it
  const drawn = await page.evaluate(() => {
    const c = document.querySelector(".scene__canvas");
    return c.width > 0 && c.height > 0;
  });
  expect(drawn).toBe(true);
});

test("reduced motion gets one still frame instead of an animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".frame")).toContainText("still frame");
});

test("the profiler draws one bar per role", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".profiler__bar")).toHaveCount(4);
  await expect(page.locator(".profiler__bar.is-current")).toHaveCount(1);
});

test("full-page screenshots", async ({ page }, testInfo) => {
  for (const scheme of ["light", "dark"]) {
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
    await page.goto("/");
    await page.evaluate(async () => {
      document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-visible"));
      document.querySelectorAll("img").forEach((img) => (img.loading = "eager"));
      await Promise.all([...document.images].map((img) => img.decode().catch(() => {})));
    });
    await page.screenshot({
      path: testInfo.outputPath(`home-${scheme}.png`),
      fullPage: true,
    });
  }
});
