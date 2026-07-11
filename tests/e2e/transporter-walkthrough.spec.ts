import { expect, test, type Locator, type Page } from "playwright/test";

const VIEWPORT = { width: 390, height: 844 };
const WAYNE_MESSAGE =
  "E2E Wayne note: western gate and the confirmed pickup window are clear.";
const QUOTE_NOTE =
  "E2E quote note: western gate access is included in the $2,200 total.";

const movementSteps = [
  "Heading to pickup",
  "Arrived at pickup",
  "Livestock loaded",
  "Departed",
  "En route",
  "Arrived at property",
  "Unloaded",
  "Delivery complete",
] as const;

/** The investor walkthrough must never create a sideways-scrolling phone UI. */
async function expectMobileFit(page: Page, primaryAction?: Locator) {
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      ),
    )
    .toBeLessThanOrEqual(1);

  if (!primaryAction) return;

  await expect(primaryAction).toBeVisible();
  await primaryAction.scrollIntoViewIfNeeded();
  const box = await primaryAction.boundingBox();
  expect(box, "primary action should have a rendered bounding box").not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(-1);
  expect(box!.x + box!.width).toBeLessThanOrEqual(VIEWPORT.width + 1);
  expect(box!.height).toBeGreaterThanOrEqual(44);
}

/**
 * Quote controls may be text inputs, native date/time controls, or selects.
 * Keep the walkthrough focused on the accessible label instead of the widget.
 */
async function ensureControlValue(control: Locator, fallback: string) {
  await expect(control).toBeVisible();
  if ((await control.inputValue()) !== "") return;

  const tagName = await control.evaluate((element) => element.tagName);
  if (tagName === "SELECT") {
    const value = await control.evaluate((element) => {
      const select = element as HTMLSelectElement;
      return Array.from(select.options).find(
        (option) => !option.disabled && option.value !== "",
      )?.value;
    });
    expect(value, "select should offer a real quote value").toBeTruthy();
    await control.selectOption(value!);
    return;
  }

  const type = await control.getAttribute("type");
  await control.fill(type === "time" ? "13:30" : fallback);
}

test("Wayne completes the transporter journey, persists it, and resets cleanly", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await page.setViewportSize(VIEWPORT);

  // 1. The homepage transport choice opens Wayne's own Available-jobs lane.
  await page.goto("/");
  const transportEntry = page.getByRole("link", {
    name: /View available jobs/i,
  });
  await expect(page.getByText("Find transport work", { exact: true })).toBeVisible();
  await expect(
    page.getByText(/Browse livestock movements, discuss jobs with both farmers/i),
  ).toBeVisible();
  await expectMobileFit(page, transportEntry);
  await transportEntry.click();

  await expect(page).toHaveURL(/\/transport\/demo\/?$/);
  await expect(
    page.getByRole("heading", { name: "Transport work for Wayne" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Available/i })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(page.getByText("Available jobs", { exact: true })).toBeVisible();

  // 2. Open the canonical James-John-Wayne RFT, not one of the filler jobs.
  const primaryJob = page
    .locator("article")
    .filter({ hasText: /120 Cattle/i })
    .filter({ hasText: /Dubbo NSW/i })
    .first();
  await expect(primaryJob).toContainText("Bungendore NSW");
  await expect(primaryJob).toContainText("320 km");
  await expect(primaryJob).toContainText("Preferred pickup");
  await expect(primaryJob).toContainText("Quotes close");
  await expect(primaryJob).toContainText("7 discussion updates");
  const viewJob = primaryJob.getByRole("link", { name: "View job details" });
  await expectMobileFit(page, viewJob);
  await viewJob.click();

  await expect(page).toHaveURL(/\/transport\/demo\/jobs\/1023\/?$/);
  await expect(
    page.getByRole("heading", { name: /120 Cattle/i }),
  ).toBeVisible();
  await expect(page.getByText(/Dubbo NSW/).first()).toBeVisible();
  await expect(page.getByText(/Green Hills Farm.*Bungendore NSW/i).first()).toBeVisible();
  await expect(page.getByText("320 km", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/full-size stock crate/i).first()).toBeVisible();
  const discussJob = page.getByRole("link", { name: "Discuss job" });
  await expect(page.getByRole("link", { name: "Submit quote" })).toBeVisible();
  await expectMobileFit(page, discussJob);
  await discussJob.click();

  // 3-4. Wayne discusses the job privately with both farmers, and the
  // practical outcomes shown below the thread match what they agreed.
  await expect(page).toHaveURL(
    /\/transport\/demo\/jobs\/1023\/discussion\/?$/,
  );
  await expect(
    page.getByRole("heading", { name: "Discuss job with both farmers" }),
  ).toBeVisible();
  const discussionRegion = page.getByRole("region", { name: "Shared updates" });
  await expect(discussionRegion.getByText("James Coleman", { exact: true }).first()).toBeVisible();
  await expect(discussionRegion.getByText(/John (Smith|— Green Hills Farm)/).first()).toBeVisible();
  await expect(discussionRegion.getByText("Wayne Transport", { exact: true }).first()).toBeVisible();
  await expect(discussionRegion.getByText("Livestock owner", { exact: true }).first()).toBeVisible();
  await expect(discussionRegion.getByText(/Property owner|Landowner/).first()).toBeVisible();
  await expect(discussionRegion.getByText("Transporter", { exact: true }).first()).toBeVisible();

  for (const detail of [
    "Pickup date confirmed",
    "Receiving window confirmed",
    "Western gate access confirmed",
    "Loading ramp confirmed",
    "Full-size stock crate confirmed",
  ]) {
    await expect(page.getByText(detail, { exact: true })).toBeVisible();
  }
  await expect(page.getByText(/western gate/i).first()).toBeVisible();
  await expect(page.getByText(/full-size stock crate/i).first()).toBeVisible();

  const discussionInput = page.getByLabel("Message James and John as Wayne");
  await discussionInput.fill(WAYNE_MESSAGE);
  await page.getByRole("button", { name: "Send message" }).click();
  const wayneMessage = page.locator("article").filter({ hasText: WAYNE_MESSAGE });
  await expect(wayneMessage).toContainText("Wayne Transport");
  const continueToQuote = page.getByRole("button", {
    name: "Use confirmed details and continue",
  });
  await expectMobileFit(page, continueToQuote);
  await continueToQuote.click();

  // 5. Quote from the confirmed facts, then prove the quote survives refresh
  // and appears under Wayne's My quotes view.
  await expect(page).toHaveURL(/\/transport\/demo\/jobs\/1023\/quote\/?$/);
  await expect(
    page.getByRole("heading", { name: "Quote with confidence" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Confirmed movement details" }),
  ).toBeVisible();

  const price = page.getByLabel("Total price (inc. GST)");
  const availability = page.getByLabel("Availability", { exact: true });
  const arrival = page.getByLabel("Estimated arrival", { exact: true });
  const equipment = page.getByLabel("Truck or trailer", { exact: true });
  const conditions = page.getByLabel("Conditions or notes", { exact: true });
  await price.fill("2200");
  await ensureControlValue(availability, "Available on the confirmed pickup date");
  await ensureControlValue(arrival, "1:30 PM");
  await ensureControlValue(equipment, "Full-size cattle stock crate");
  await conditions.fill(QUOTE_NOTE);

  const submitQuote = page.getByRole("button", { name: "Submit quote" });
  await expectMobileFit(page, submitQuote);
  await submitQuote.click();

  await expect(
    page.getByRole("heading", { name: "Quote submitted" }),
  ).toBeVisible();
  await expect(page.getByText(/\$2,200(?:\.00)?/).first()).toBeVisible();
  await expect(page.getByText(QUOTE_NOTE, { exact: true })).toBeVisible();

  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Quote submitted" }),
  ).toBeVisible();
  await expect(page.getByText(/\$2,200(?:\.00)?/).first()).toBeVisible();
  await expect(page.getByText(QUOTE_NOTE, { exact: true })).toBeVisible();

  await page.getByRole("link", { name: /My quotes/i }).click();
  await expect(page).toHaveURL(/\/transport\/demo\?view=quotes$/);
  await expect(
    page.getByRole("heading", { name: "My quotes" }),
  ).toBeVisible();
  const quotedJob = page.locator("article").filter({ hasText: /120 Cattle/i }).first();
  await expect(quotedJob).toContainText(/Quote submitted/i);
  await expect(quotedJob).toContainText(/\$2,200/);

  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "Quote submitted" }),
  ).toBeVisible();

  // 6-7. The scripted outcome awards Wayne the work and carries the same
  // pre-quote discussion into the operational room.
  await page.getByRole("button", { name: "See quote outcome" }).click();
  await expect(page).toHaveURL(
    /\/transport\/demo\/jobs\/1023\/awarded\/?$/,
  );
  await expect(
    page.getByRole("heading", { name: "You've been awarded this job" }),
  ).toBeVisible();
  await expect(page.getByText(/\$2,200(?:\.00)?/).first()).toBeVisible();
  await expect(page.getByText("120 Cattle", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/Dubbo NSW/).first()).toBeVisible();
  const openRoom = page.getByRole("link", { name: "Open shared job room" });
  await expectMobileFit(page, openRoom);
  await openRoom.click();

  await expect(page).toHaveURL(/\/transport\/demo\/jobs\/1023\/room\/?$/);
  await expect(
    page.getByRole("heading", { name: "Shared job room" }),
  ).toBeVisible();
  const roomRegion = page.getByRole("region", { name: "Shared updates" });
  await expect(roomRegion.getByText("James Coleman", { exact: true }).first()).toBeVisible();
  await expect(roomRegion.getByText(/John (Smith|— Green Hills Farm)/).first()).toBeVisible();
  await expect(roomRegion.getByText("Wayne Transport", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(WAYNE_MESSAGE, { exact: true })).toBeVisible();
  await expect(page.getByText("Western gate access confirmed", { exact: true })).toBeVisible();

  // 8-9. Wayne advances one realistic action at a time. Each action creates
  // a visible shared update, and a mid-movement refresh retains both state
  // and the original RFT discussion.
  const sharedUpdates = page.getByRole("region", { name: "Shared updates" });
  await expect(sharedUpdates).toBeVisible();

  for (const step of movementSteps) {
    const update = page.getByRole("button", {
      name: `Update: ${step}`,
      exact: true,
    });
    await expectMobileFit(page, update);
    await update.click();
    await expect(sharedUpdates.getByText(step, { exact: false }).last()).toBeVisible();

    if (step === "En route") {
      await page.reload();
      await expect(
        page.getByRole("heading", { name: "Shared job room" }),
      ).toBeVisible();
      await expect(page.getByText(WAYNE_MESSAGE, { exact: true })).toBeVisible();
      await expect(
        page.getByRole("button", {
          name: "Update: Arrived at property",
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        page
          .getByRole("region", { name: "Shared updates" })
          .getByText("En route", { exact: false })
          .last(),
      ).toBeVisible();
    }
  }

  await expect(
    page
      .getByRole("region", { name: "Shared updates" })
      .getByText("Heading to pickup", { exact: false })
      .last(),
  ).toBeVisible();
  const viewDelivery = page.getByRole("link", { name: "View delivery record" });
  await expectMobileFit(page, viewDelivery);
  await viewDelivery.click();

  // 10-11. Wayne gets a transporter-specific commercial ending, which also
  // survives refresh, then returns to Available work and can find the record
  // under Completed.
  await expect(page).toHaveURL(
    /\/transport\/demo\/jobs\/1023\/complete\/?$/,
  );
  await expect(
    page.getByRole("heading", { name: "Delivery complete" }),
  ).toBeVisible();
  await expect(page.getByText(/120 cattle/i).first()).toBeVisible();
  await expect(page.getByText(/\$2,200(?:\.00)?/).first()).toBeVisible();
  await expect(page.getByText(/invoice|payment/i).first()).toBeVisible();
  await expect(page.getByText(/completed|delivered/i).first()).toBeVisible();
  await expect(page.getByText(/shared record/i).first()).toBeVisible();

  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Delivery complete" }),
  ).toBeVisible();
  await expect(page.getByText(/\$2,200(?:\.00)?/).first()).toBeVisible();

  // The whole conversation — RFT clarification, Wayne's note, road updates
  // and the arrival confirmation — remains one shared record for the job.
  await page.getByRole("link", { name: "Shared movement record" }).click();
  await expect(page).toHaveURL(/\/transport\/demo\/jobs\/1023\/room\/?$/);
  await expect(page.getByText(WAYNE_MESSAGE, { exact: true })).toBeVisible();
  await expect(
    page
      .getByRole("region", { name: "Shared updates" })
      .getByText("Delivery complete", { exact: false })
      .last(),
  ).toBeVisible();
  await page.getByRole("link", { name: "View delivery record" }).click();
  await expect(
    page.getByRole("heading", { name: "Delivery complete" }),
  ).toBeVisible();

  const findMoreJobs = page.getByRole("link", { name: "Find more jobs" });
  await expectMobileFit(page, findMoreJobs);
  await findMoreJobs.click();
  await expect(page).toHaveURL(/\/transport\/demo\/?$/);
  await expect(page.getByRole("link", { name: /Available/i })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await page.getByRole("link", { name: /Completed/i }).click();
  await expect(page).toHaveURL(/\/transport\/demo\?view=completed$/);
  await expect(page.getByText("Completed", { exact: true })).toBeVisible();
  await expect(
    page.locator("article").filter({ hasText: /120 Cattle/i }).first(),
  ).toContainText(/Delivery complete|Completed/i);

  // Reopen the completed record to use the shared guided-demo reset action.
  await page.goto("/transport/demo/jobs/1023/complete");
  await expect(
    page.getByRole("heading", { name: "Delivery complete" }),
  ).toBeVisible();

  // 12. Reset clears workflow, discussion, quote, award, active movement,
  // completion and view state without assuming the fresh default workflow
  // key stays absent after the homepage provider hydrates.
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Reset Demo" }).click();
  await page.waitForURL("**/");
  await expect(
    page.getByText("Find Feed. Find Stock. Move Livestock."),
  ).toBeVisible();

  const resetStorage = await page.evaluate(
    ({ wayneMessageText, quoteNoteText }) => {
      const local = Object.fromEntries(Object.entries(window.localStorage));
      const serialized = JSON.stringify(local);
      return {
        threadKeys: Object.keys(local).filter((key) =>
          key.startsWith("paddockme-demo-thread:"),
        ),
        requestDraft: window.sessionStorage.getItem("pm-request-draft"),
        hasWayneMessage: serialized.includes(wayneMessageText),
        hasQuoteNote: serialized.includes(quoteNoteText),
      };
    },
    { wayneMessageText: WAYNE_MESSAGE, quoteNoteText: QUOTE_NOTE },
  );
  expect(resetStorage.threadKeys).toEqual([]);
  expect(resetStorage.requestDraft).toBeNull();
  expect(resetStorage.hasWayneMessage).toBe(false);
  expect(resetStorage.hasQuoteNote).toBe(false);

  // The entry starts Wayne cleanly on Available again; later buckets are 0.
  await page.getByRole("link", { name: /View available jobs/i }).click();
  await expect(page).toHaveURL(/\/transport\/demo\/?$/);
  await expect(page.getByLabel("0 my quotes")).toBeVisible();
  await expect(page.getByLabel("0 awarded")).toBeVisible();
  await expect(page.getByLabel("0 active")).toBeVisible();
  await expect(page.getByLabel("0 completed")).toBeVisible();
  await expect(
    page.locator("article").filter({ hasText: /120 Cattle/i }).first(),
  ).toBeVisible();

  // 13. Direct later-stage URLs after reset tell the truth instead of
  // reconstructing a phantom quote, award, movement or completion.
  const honestRoutes = [
    {
      path: "/transport/demo/jobs/1023/discussion",
      heading: /Open this job before discussing it|Start with the job details/i,
    },
    {
      path: "/transport/demo/jobs/1023/quote",
      heading: /Discuss this job before quoting/i,
    },
    {
      path: "/transport/demo/jobs/1023/awarded",
      heading: /No submitted quote yet/i,
    },
    {
      path: "/transport/demo/jobs/1023/room",
      heading: /This job has not been awarded yet/i,
    },
    {
      path: "/transport/demo/jobs/1023/complete",
      heading: /Delivery is not complete yet/i,
    },
  ] as const;

  for (const guard of honestRoutes) {
    await page.goto(guard.path);
    await expect(page.getByRole("heading", { name: guard.heading })).toBeVisible();
    await expectMobileFit(page);
  }

  // The older owner-side direct routes remain honest after a transporter run.
  await page.goto("/transport/quotes/1023");
  await expect(page.getByText("No transport request yet")).toBeVisible();
  await page.goto("/transport/rooms/1023");
  await expect(page.getByText("No transport underway")).toBeVisible();
});
