import { expect, test } from "playwright/test";

/**
 * The landing hero is an introduction, not a marketing presentation.
 *
 * It previously ran 813px tall at 375x812 — taller than the whole phone
 * viewport — so the three journey tiles, which are the point of the page,
 * could not be seen without scrolling past an eyebrow badge, a paragraph,
 * two buttons and a panel restating the four-step journey that the "One
 * connected run" section already explains in full.
 *
 * These tests pin the reduction, not just the wording: content that was
 * removed must stay removed, and the journey chooser must stay reachable
 * within the first viewport.
 */

const REMOVED_FROM_HERO = [
  "Australian agistment and transport", // eyebrow badge
  "The whole job, connected", // explanatory card heading
  "Request → match → agree → move", // card's restated journey
  "Each completed step points clearly to the next one", // card body copy
];

test("the hero states one message, one sentence and one action", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Find feed. Fill paddocks. Move livestock.",
  );
  await expect(
    page.getByText(
      "Match stock with grazing and organise livestock transport in one place.",
    ),
  ).toBeVisible();

  const cta = page.getByRole("link", { name: /Choose your journey/ });
  await expect(cta).toHaveAttribute("href", "#choose-your-path");

  // Exactly one call to action inside the hero — the header keeps its own
  // Log In / Get started pair, which is a separate region.
  const hero = page.locator("section").first();
  await expect(hero.getByRole("link")).toHaveCount(1);
  await expect(hero.getByRole("link", { name: /Create an account/ })).toHaveCount(
    0,
  );
});

test("removed hero content stays removed", async ({ page }) => {
  await page.goto("/");
  const hero = page.locator("section").first();
  for (const text of REMOVED_FROM_HERO) {
    await expect(
      hero.getByText(text, { exact: false }),
      `"${text}" must not return to the hero`,
    ).toHaveCount(0);
  }
});

test("the header keeps its own actions", async ({ page }) => {
  await page.goto("/");
  const header = page.locator("header").first();
  await expect(header.getByRole("link", { name: "Log In" })).toHaveAttribute(
    "href",
    "/sign-in",
  );
  await expect(header.getByRole("link", { name: "Get started" })).toHaveAttribute(
    "href",
    "/sign-up",
  );
});

const WIDTHS = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

for (const vp of WIDTHS) {
  test(`${vp.name} ${vp.width}x${vp.height}: journeys are reachable without scrolling`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("/");

    // The journey heading and the first tile both sit inside the opening
    // viewport, and the hero takes well under half of it.
    const heading = page.getByRole("heading", {
      name: "What needs doing today?",
    });
    await expect(heading).toBeInViewport();
    await expect(
      page.getByRole("link", { name: /I need feed/i }).first(),
    ).toBeInViewport();

    const metrics = await page.evaluate(() => {
      const de = document.documentElement;
      const hero = document.querySelector("section");
      if (!hero) throw new Error("Hero section not found");
      return {
        heroHeight: hero.getBoundingClientRect().height,
        viewportH: window.innerHeight,
        overflowX: de.scrollWidth > de.clientWidth,
      };
    });
    expect(metrics.overflowX, "no horizontal overflow").toBe(false);
    expect(
      metrics.heroHeight,
      "the hero must not dominate the viewport",
    ).toBeLessThan(metrics.viewportH * 0.55);

    // Tappable primary action.
    const cta = page.getByRole("link", { name: /Choose your journey/ });
    const box = await cta.boundingBox();
    expect(box, "the CTA should have a visible layout box").not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });
}

test("the three journey destinations are unchanged", async ({ page }) => {
  await page.goto("/");
  const expected = [
    { name: /I need feed/i, href: "/requests/new" },
    { name: /I have grazing/i, href: "/landowner" },
    { name: /Find transport work/i, href: "/transport/demo" },
  ];
  for (const tile of expected) {
    await expect(
      page.getByRole("link", { name: tile.name }).first(),
    ).toHaveAttribute("href", tile.href);
  }
});

test("the hero call to action takes visible keyboard focus", async ({
  page,
}) => {
  await page.goto("/");
  const cta = page.getByRole("link", { name: /Choose your journey/ });
  await cta.focus();
  await expect(cta).toBeFocused();

  const ring = await cta.evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      outlineStyle: cs.outlineStyle,
      outlineWidth: cs.outlineWidth,
      boxShadow: cs.boxShadow,
    };
  });
  expect(
    ring.outlineStyle !== "none" || ring.boxShadow !== "none",
    `expected a focus indicator, got ${JSON.stringify(ring)}`,
  ).toBe(true);

  // And it still goes where it says.
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#choose-your-path$/);
});
