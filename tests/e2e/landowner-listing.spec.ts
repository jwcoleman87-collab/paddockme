import { expect, test } from "playwright/test";

/**
 * Farmer B's (landowner) new front door: /landowner shows a "list your
 * paddock" prompt until he does, then the hub reflects the listing and
 * lets him edit it — persisted the same way the rest of the guided demo
 * persists state (localStorage via usePaddockmeWorkflow), so it survives
 * a reload.
 */
test("landowner lists a paddock, sees it on the hub, and can edit it", async ({
  page,
}) => {
  await page.goto("/landowner");
  await expect(page.getByRole("heading", { name: "John Smith" })).toBeVisible();
  await expect(
    page.getByText("List your paddock capacity so incoming requests"),
  ).toBeVisible();

  await page.getByRole("link", { name: "List your paddock" }).click();
  await expect(
    page.getByRole("heading", { name: "List your paddock capacity" }),
  ).toBeVisible();

  // Sheep is off by default (only Cattle is preselected); switch it on and
  // set a distinctive acreage + rate so we can assert they round-trip.
  await page.getByRole("button", { name: "Sheep" }).click();
  await page.getByLabel("Acres available").fill("240");
  await page.getByLabel("Rate per head, per week").fill("$9");
  await page.getByLabel("Water availability").selectOption("Tank");
  await page.getByRole("button", { name: "List paddock" }).click();

  await expect(page).toHaveURL(/\/landowner\/?$/);
  await expect(page.getByText("240")).toBeVisible();
  await expect(page.getByText("Cattle, Sheep")).toBeVisible();
  await expect(page.getByText("$9/head/week")).toBeVisible();
  await expect(page.getByText("Tank")).toBeVisible();
  await expect(
    page.getByText("List your paddock capacity so incoming requests"),
  ).not.toBeVisible();

  // Persists across a reload.
  await page.reload();
  await expect(page.getByText("240")).toBeVisible();

  // Editing prefills the existing values rather than starting blank.
  await page.getByRole("link", { name: "Edit listing" }).click();
  await expect(
    page.getByRole("heading", { name: "Edit your paddock listing" }),
  ).toBeVisible();
  await expect(page.getByLabel("Acres available")).toHaveValue("240");
  await expect(page.getByRole("button", { name: "Save changes" })).toBeVisible();

  // The other two hub sections link where they say they do.
  await page.goto("/landowner");
  await expect(
    page.getByRole("link", { name: "Review request" }),
  ).toHaveAttribute("href", "/landowner/requests/1023");
  await expect(
    page.getByRole("link", { name: "Open workspace" }),
  ).toHaveAttribute("href", "/workspaces/1023");
});
