import { expect, test } from "playwright/test";

/**
 * The three homepage journeys, from the tile to the first real screen.
 *
 * This is the transition that used to feel clunky: "I have grazing" pointed
 * at a signed-in-only route and only worked because a demo-host middleware
 * redirect caught it; none of the lanes repeated the choice the visitor had
 * just made; and the bottom nav lit up two items at once because one of its
 * destinations was nested underneath another.
 */

const JOURNEYS = [
  {
    tile: /I need feed/i,
    lane: "/requests/new",
    task: "What stock do you have?",
    journey: "I need feed",
  },
  {
    tile: /I have grazing/i,
    lane: "/landowner",
    task: "Your paddock, requests and agreements",
    journey: "I have grazing",
  },
  {
    tile: /Find transport work/i,
    lane: "/transport/demo",
    task: "Transport work for Wayne",
    journey: "Wayne Transport",
  },
] as const;

for (const j of JOURNEYS) {
  test(`${j.lane}: the tile lands on its own lane and keeps the choice`, async ({
    page,
  }) => {
    const redirects: string[] = [];
    page.on("response", (r) => {
      if ([301, 302, 307, 308].includes(r.status())) {
        redirects.push(`${r.url()} -> ${r.status()}`);
      }
    });

    await page.goto("/");
    await page.getByRole("link", { name: j.tile }).first().click();

    await expect(page).toHaveURL(new RegExp(`${j.lane}$`));
    expect(redirects, "the tile should not need a redirect hop").toEqual([]);
    await expect(page.getByText(j.task, { exact: false }).first()).toBeVisible();
    await expect(
      page.getByText(j.journey, { exact: false }).first(),
      "the lane repeats the journey the visitor chose",
    ).toBeVisible();

    // Back, Forward and Refresh all behave.
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await page.goForward();
    await expect(page).toHaveURL(new RegExp(`${j.lane}$`));
    await page.reload();
    await expect(page.getByText(j.task, { exact: false }).first()).toBeVisible();
  });
}

test("the request flow has one exit, and it keeps the answers", async ({
  page,
}) => {
  await page.goto("/requests/new");

  // "Cancel" and "Save & Exit" used to sit on the same screen pointing at the
  // same place while promising opposite things. Only the honest one remains.
  await expect(page.getByRole("link", { name: "Cancel" })).toHaveCount(0);

  await page.locator('input[name="headCount"]').fill("87");
  await page.locator('input[name="location"]').fill("Wagga Wagga NSW");
  await page.getByRole("link", { name: "Save & exit" }).click();
  await expect(page).toHaveURL(/\/$/);

  await page.getByRole("link", { name: /I need feed/i }).first().click();
  await expect(page.locator('input[name="headCount"]')).toHaveValue("87");
  await expect(page.locator('input[name="location"]')).toHaveValue(
    "Wagga Wagga NSW",
  );
});

const NAV_LOCATIONS = [
  { path: "/requests/matches", active: "Requests" },
  { path: "/workspaces/1023", active: "Workspaces" },
  { path: "/workspaces/1023/live", active: "Agreement" },
  { path: "/account", active: "Profile" },
] as const;

for (const loc of NAV_LOCATIONS) {
  test(`${loc.path}: exactly one nav item is marked current`, async ({
    page,
  }) => {
    await page.goto(loc.path);
    const current = page.locator(
      'nav[aria-label="App"] a[aria-current="page"]',
    );
    await expect(current).toHaveCount(1);
    await expect(current).toHaveText(new RegExp(loc.active));
  });
}

test("the Agreement nav destination explains itself before anything is live", async ({
  page,
}) => {
  await page.goto("/workspaces/1023/live");
  await expect(page.getByText("Nothing live yet")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Continue the Agreement/ }),
  ).toBeVisible();
});

test("the Agreement route is not blank before client state hydrates", async ({
  browser,
}) => {
  const page = await browser.newPage({ javaScriptEnabled: false });
  await page.goto("/workspaces/1023/live");
  await expect(page.getByRole("status")).toContainText("Loading agreement");
  await page.close();
});
