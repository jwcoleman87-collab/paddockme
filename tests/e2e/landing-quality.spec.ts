import { expect, test } from "playwright/test";

/**
 * Accessibility and delivery standards for the landing page.
 *
 * PaddockME gets used on a phone in a paddock, so the weight of the entry
 * screen is a product concern, not a nicety. Before this pass the homepage
 * shipped 928KB of imagery to a 375px phone — the hero alone was a 264KB
 * JPEG behind a CSS background-image, which the preload scanner cannot see
 * and which cannot be served responsively. There was also no way for a
 * keyboard user to bypass the header (WCAG 2.4.1, Level A).
 */

test("a keyboard user can bypass the header (WCAG 2.4.1)", async ({ page }) => {
  await page.goto("/");

  // The skip link is the first thing in the tab order.
  await page.keyboard.press("Tab");
  const focused = page.locator(":focus");
  await expect(focused).toHaveAttribute("href", "#main-content");
  await expect(focused).toHaveText(/skip to main content/i);

  // It is genuinely offscreen until focused, then genuinely visible.
  const box = await focused.boundingBox();
  expect(box, "the focused skip link needs a real layout box").not.toBeNull();
  expect(
    box!.height,
    "focused skip link should be a real target, not a 1px sr-only clip",
  ).toBeGreaterThanOrEqual(44);

  // And it moves focus, not just the viewport.
  await expect(page.locator("#main-content")).toHaveCount(1);
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("the hero image is discoverable, responsive and format-negotiated", async ({
  page,
}) => {
  const imageResponses: { url: string; type: string }[] = [];
  page.on("response", (r) => {
    const type = r.headers()["content-type"] ?? "";
    if (type.startsWith("image/")) imageResponses.push({ url: r.url(), type });
  });

  await page.goto("/");

  // A real <img>, not a CSS background, offered at several widths.
  const hero = page.locator('img[src*="hero-homepage"]').first();
  await expect(hero).toHaveCount(1);

  // Pull the lazy journey photos in, then wait on the images themselves
  // rather than on networkidle, which Playwright warns is flaky and which
  // does not settle when the suite runs fully parallel.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForFunction(
    () => Array.from(document.images).every((i) => i.complete),
    null,
    { timeout: 20_000 },
  );
  await expect(hero).toHaveAttribute("srcset", /\d+w/);
  await expect(hero).toHaveAttribute("fetchpriority", "high");

  // The mechanism that actually gets it fetched early: a preload the scanner
  // can act on before the CSS that used to hide it in a background-image.
  await expect(
    page.locator('link[rel="preload"][as="image"][imagesrcset*="hero-homepage"]'),
  ).toHaveCount(1);

  // Every image on the page goes through the optimiser, and none is
  // delivered as the original JPEG.
  const rawJpeg = imageResponses.filter(
    (r) => r.type === "image/jpeg" && r.url.includes("/images/paddockme/"),
  );
  expect(
    rawJpeg.map((r) => r.url),
    "landing images must not bypass the image optimiser",
  ).toEqual([]);
});

test("the page never points at the other deployment", async ({
  page,
  baseURL,
}) => {
  await page.goto("/");

  const origin = new URL(baseURL!).origin;
  const urls = await page.evaluate(() => ({
    canonical: document
      .querySelector('link[rel="canonical"]')
      ?.getAttribute("href"),
    ogUrl: document
      .querySelector('meta[property="og:url"]')
      ?.getAttribute("content"),
    ogImage: document
      .querySelector('meta[property="og:image"]')
      ?.getAttribute("content"),
    twitterImage: document
      .querySelector('meta[name="twitter:image"]')
      ?.getAttribute("content"),
  }));

  // A canonical and an og:url must exist — a missing tag would pass a
  // "does not point at the other site" check vacuously.
  expect(urls.canonical, "canonical link is required").toBeTruthy();
  expect(urls.ogUrl, "og:url is required").toBeTruthy();

  // Whatever host the build resolved to, it must resolve to exactly one.
  // A page advertising two different origins is the bug we are guarding
  // against, whichever way round it happens.
  const origins = new Set(
    Object.values(urls)
      .filter((v): v is string => !!v)
      .map((v) => new URL(v, origin).origin),
  );
  expect(
    [...origins],
    "every absolute URL on the page must share one origin",
  ).toHaveLength(1);
  const declared = [...origins][0];

  // Run against a real deployment, the declared origin must be that
  // deployment. Against localhost the resolver's documented last-resort
  // fallback applies, so there is nothing meaningful to compare.
  const isDemoHost = /\/\/paddockme\.vercel\.app$/.test(origin);
  const isMainHost = /\/\/paddockme-oz51\.vercel\.app$/.test(origin);
  if (isDemoHost || isMainHost) {
    expect(declared, `${origin} must declare itself, not the other site`).toBe(
      origin,
    );
  }

  // The demo must never advertise the main deployment.
  if (isDemoHost) {
    for (const [name, value] of Object.entries(urls)) {
      expect(
        value ?? "",
        `${name} must not mention the main deployment`,
      ).not.toContain("paddockme-oz51");
    }
  }
});

test("hover motion is suppressed when the visitor asks for reduced motion", async ({
  browser,
}) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/");

  const tile = page.getByRole("link", { name: /I need feed/i }).first();
  await tile.hover();

  const transform = await tile
    .locator("img")
    .first()
    .evaluate((el) => getComputedStyle(el).transform);
  expect(
    transform === "none" || transform === "matrix(1, 0, 0, 1, 0, 0)",
    `expected no scale under prefers-reduced-motion, got ${transform}`,
  ).toBe(true);

  await ctx.close();
});
