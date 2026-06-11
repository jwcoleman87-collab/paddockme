import { chromium } from "playwright";

const DEFAULT_BASE_URL = "https://paddockme-oz51.vercel.app";
const baseUrl = (process.env.DEMO_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");
const headless = process.env.DEMO_HEADLESS !== "false";

const browser = await chromium.launch({ headless });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const consoleErrors = [];

page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});

async function step(name, action) {
  try {
    await action();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(`  ${error instanceof Error ? error.message : String(error)}`);
    await browser.close();
    process.exit(1);
  }
}

function url(path) {
  return `${baseUrl}${path}`;
}

async function goto(path) {
  await page.goto(url(path), { waitUntil: "networkidle" });
}

async function clickRole(role, name) {
  await page.getByRole(role, { name, exact: true }).click();
}

await step("Landing action opens request flow", async () => {
  await goto("/");
  await page.getByRole("link", { name: /Need agistment/ }).click();
  await page.waitForURL("**/request/new", { waitUntil: "networkidle" });
  await goto("/agreements");
});

await step("Sections to confirm opens Glenbarra workspace", async () => {
  await page.getByText("Sections to confirm", { exact: true }).click();
  await page.waitForURL("**/workspace/agreement-glenbarra", { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Glenbarra River Paddocks" }).waitFor();
});

await step("Dale can agree the rate section", async () => {
  await clickRole("tab", "Terms");
  await page.getByRole("button", { name: "Rate and terms pending Weekly rate still being agreed" }).click();
  const agreedBefore = await page.getByRole("button", { name: "Farmer A: Agreed", exact: true }).count();
  await clickRole("button", "Farmer A: Tap to agree");
  await page.waitForFunction((before) => {
    const buttons = Array.from(document.querySelectorAll("button"));
    return buttons.filter((button) => button.textContent?.includes("Farmer A: Agreed")).length > before;
  }, agreedBefore);
});

await step("Brett can agree the same section", async () => {
  await clickRole("radio", "Farmer B (Brett) Landowner");
  await page.getByRole("button", { name: "Rate and terms pending Weekly rate still being agreed" }).click();
  const brettAgreeButtons = page.getByRole("button", { name: "Farmer B: Tap to agree", exact: true });
  const count = await brettAgreeButtons.count();
  if (count < 1) throw new Error("Could not find Brett agreement controls");
  await brettAgreeButtons.nth(Math.min(1, count - 1)).click();
  await page.getByText("Both parties agree on Rate and terms.").waitFor();
});

await step("Open transport room from workspace", async () => {
  await clickRole("link", "Open transport room");
  await page.waitForURL("**/transport/transport-glenbarra", { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.body.textContent?.includes("Central West NSW"));
  await page.waitForFunction(() => document.body.textContent?.includes("Southern NSW"));
});

await step("Driver view shows transport economics", async () => {
  await clickRole("radio", "Driver Transporter (Wayne)");
  await page.waitForFunction(() => document.body.textContent?.includes("Viewing as Wayne"));
  await page.getByText("Open RFTs nearby", { exact: false }).waitFor();
});

await step("Farmer A can open rate state", async () => {
  await clickRole("radio", "Farmer A Livestock owner (Dale)");
  await clickRole("tab", "Rate");
  const acceptRate = page.getByRole("button", { name: "Accept rate", exact: true });
  if (await acceptRate.count()) await acceptRate.click();
  await page.getByRole("heading", { name: "Rate accepted", exact: true }).waitFor();
});

await step("Brett can open paddock offer picker", async () => {
  await goto("/agreements");
  await page.getByText("Welcome back, Brett.", { exact: true }).waitFor();
  await goto("/requests");
  const offerButtons = page.getByRole("button", { name: "Offer a paddock", exact: true });
  const count = await offerButtons.count();
  if (count < 1) throw new Error("Could not find Offer a paddock buttons");
  await offerButtons.first().click();
  await page.getByText("Pick a paddock to offer", { exact: true }).waitFor();
});

await step("Wayne pipeline is reachable", async () => {
  await page.evaluate(() => {
    window.localStorage.setItem("paddockme.profile.persona", "driver-1");
    window.localStorage.setItem("paddockme.agreements.persona", "driver-1");
    document.cookie = "paddockme_persona=driver-1; path=/; max-age=31536000; SameSite=Lax";
  });
  await goto("/runs");
  await page.waitForFunction(() => document.body.textContent?.includes("Wayne"));
});

if (consoleErrors.length > 0) {
  console.error("");
  console.error("Console errors observed during click rehearsal:");
  for (const error of consoleErrors) console.error(`- ${error}`);
  await browser.close();
  process.exit(1);
}

console.log("");
console.log(`All browser click checks passed for ${baseUrl}`);
await browser.close();
