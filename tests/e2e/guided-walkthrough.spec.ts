import { expect, test, type Page } from "playwright/test";

/**
 * The full guided-demo story, end to end, the way a presenter walks it:
 * request → matches → property → landowner accept → workspace → negotiate →
 * review + RFT → quotes → coordination room → book → live agreement →
 * transport progresses to Delivered → agistment active → reset → clean slate.
 *
 * Also covers the brief's reliability requirements: refresh persistence
 * mid-flow, reset-after-completion, and direct navigation after reset.
 */

async function acceptAllTerms(page: Page) {
  // Three negotiation steps, each with an "Accept" button that locks the
  // term and disappears. Click until none remain.
  for (let i = 0; i < 3; i++) {
    await page
      .getByRole("button", { name: "Accept", exact: true })
      .first()
      .click();
  }
  await expect(
    page.getByRole("button", { name: "Accept", exact: true }),
  ).toHaveCount(0);
}

test("owner completes the full journey through delivery, then resets", async ({
  page,
}) => {
  test.setTimeout(120_000);

  // 1. Homepage → start a request.
  await page.goto("/");
  await expect(
    page.getByText("Match stock with feed. Then get them there."),
  ).toBeVisible();
  await page.getByRole("link", { name: /I need feed/i }).click();

  // 2. Request — stock step (defaults: 120 Cattle at Dubbo NSW).
  await expect(page.getByText("What stock do you have?")).toBeVisible();
  await page.getByRole("link", { name: /^Next/ }).click();

  // 3. Request — requirements step.
  await expect(page.getByText("Feed Requirements")).toBeVisible();
  const requestEndDate = await page
    .locator('input[name="needUntil"]')
    .inputValue();
  const requestEndDateLabel = new Date(
    `${requestEndDate}T00:00:00`,
  ).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  await page.getByRole("link", { name: /Find Matches/ }).click();

  // 4. Matches → property detail.
  await expect(page.getByText("Suitable Properties Found")).toBeVisible();
  await page
    .getByRole("link", { name: /View Property/ })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: "Green Hills Farm" }),
  ).toBeVisible();

  // 5. Request a discussion → switch to the landowner → accept → workspace.
  await page.getByRole("link", { name: /Request Discussion/ }).click();
  await expect(page.getByText("Request Sent!")).toBeVisible();
  await page.getByRole("link", { name: /Continue as John/ }).click();
  await expect(page.getByText("New Request Received")).toBeVisible();
  await page.getByRole("link", { name: /Accept Discussion/ }).click();

  // 6. Workspace → agreement. Seeded chat must describe the same mob the
  //    request carries (120 cattle), not a contradictory backstory.
  await expect(page.getByText("120 Cattle").first()).toBeVisible();
  await expect(page.getByText(/120 cattle at Dubbo NSW/).first()).toBeVisible();
  await expect(page.getByText("2 participants")).toBeVisible();

  const persistedMessage = "Yards are ready for the demo run.";
  await page
    .getByRole("textbox", { name: "Write a message" })
    .fill(persistedMessage);
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText(persistedMessage)).toBeVisible();
  const sentMessage = page.locator("article").filter({ hasText: persistedMessage });
  await expect(sentMessage.getByText("James Coleman")).toBeVisible();
  await expect(sentMessage.getByText("Livestock owner")).toBeVisible();
  await page.reload();
  await expect(page.getByText(persistedMessage)).toBeVisible();

  await page.getByRole("link", { name: /Continue to Agreement/ }).click();

  // 7. Negotiate all three terms.
  await expect(page.getByText("Agree the terms")).toBeVisible();
  await expect(
    page.getByText(requestEndDateLabel, { exact: false }).first(),
  ).toBeVisible();
  await acceptAllTerms(page);

  // Refresh persistence: agreed terms survive a reload.
  await page.reload();
  await expect(page.getByText("Agreement terms complete")).toBeVisible();

  // 8. Review and accept — sends the RFT.
  await page
    .getByRole("link", { name: /Review Agreement & Request Transport/ })
    .click();
  await expect(
    page.getByRole("heading", { name: "Review Agreement" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: /Accept Agreement & Send RFT/ })
    .click();

  // 9. Quotes are in → coordination room → book Wayne.
  await expect(page.getByText("Transport RFT Sent")).toBeVisible();
  await expect(page.getByText("Wayne Transport").first()).toBeVisible();
  await page
    .getByRole("link", { name: /Chat with Driver/ })
    .first()
    .click();
  await expect(page.getByText("Transport Coordination Room")).toBeVisible();
  await page.getByRole("button", { name: /Accept Wayne Quote/ }).click();

  // 10. Workspace shows the booked deal → live agreement.
  await expect(
    page.getByText("Everything's agreed and transport is booked."),
  ).toBeVisible();
  await expect(page.getByText("3 participants")).toBeVisible();
  await expect(page.getByText(persistedMessage)).toBeVisible();
  await page.getByRole("link", { name: /View Live Agreement/ }).click();
  await expect(
    page.getByRole("heading", { name: "Live Agreement" }),
  ).toBeVisible();
  await expect(page.getByText("Booked").first()).toBeVisible();

  // 11. Track the movement: booked → picked up → en route → delivered.
  await page.getByRole("link", { name: /Track Transport/ }).click();
  await expect(page.getByText("Movement status")).toBeVisible();
  await page.getByRole("button", { name: /Next update: Picked up/ }).click();
  await page.getByRole("button", { name: /Next update: En route/ }).click();
  await page.getByRole("button", { name: /Next update: Delivered/ }).click();

  // The scripted arrival lands in the shared thread and the room concludes.
  await expect(
    page.getByText(/off-loaded into the yards at Green Hills Farm/),
  ).toBeVisible();
  await expect(
    page.getByText("Stock delivered to Green Hills Farm", { exact: false }),
  ).toBeVisible();

  // Refresh persistence after completion: still delivered, updates intact.
  await page.reload();
  await expect(
    page.getByText(/off-loaded into the yards at Green Hills Farm/),
  ).toBeVisible();

  // 12. Live agreement reflects the arrival — the agistment is active.
  await page.getByRole("link", { name: /View Live Agreement/ }).click();
  await expect(
    page.getByText(/Your stock have arrived at Green Hills Farm/),
  ).toBeVisible();
  await expect(page.getByText("Delivered — arrival confirmed.")).toBeVisible();

  // 13. Reset from the end of the flow (confirm dialog) → clean slate.
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: /Reset Demo/ }).click();
  await page.waitForURL("**/");
  await expect(
    page.getByText("Match stock with feed. Then get them there."),
  ).toBeVisible();
  const remainingThreadKeys = await page.evaluate(() =>
    Object.keys(window.localStorage).filter((key) =>
      key.startsWith("paddockme-demo-thread:"),
    ),
  );
  expect(remainingThreadKeys).toEqual([]);

  await page.goto("/workspaces/1023");
  await expect(page.getByText(persistedMessage)).toHaveCount(0);
  await expect(page.getByText("2 participants")).toBeVisible();

  // Direct navigation after reset must not expose a half-reset deal.
  await page.goto("/transport/quotes/1023");
  await expect(page.getByText("No transport request yet")).toBeVisible();
  await page.goto("/transport/rooms/1023");
  await expect(page.getByText("No transport underway")).toBeVisible();
  await page.goto("/workspaces/1023/live");
  await expect(page.getByText("Nothing live yet")).toBeVisible();
  await page.goto("/workspaces/1023/agreement");
  await expect(page.getByText("Agree the terms")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Accept", exact: true }),
  ).toHaveCount(3);

  // And the walkthrough starts cleanly again.
  await page.goto("/");
  await page.getByRole("link", { name: /I need feed/i }).click();
  await expect(page.getByText("What stock do you have?")).toBeVisible();
});
