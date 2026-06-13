import { chromium } from "playwright";

const DEFAULT_BASE_URL = "https://paddockme-oz51.vercel.app";
const baseUrl = (process.env.DEMO_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");
const headless = process.env.DEMO_HEADLESS !== "false";

let failures = 0;

async function step(name, action) {
  try {
    await action();
    console.log(`PASS ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${name}`);
    console.error(`  ${error instanceof Error ? error.message : String(error)}`);
  }
}

function url(path) {
  return `${baseUrl}${path}`;
}

async function expectText(path, text) {
  const response = await fetch(url(path));
  const body = await response.text();
  if (!response.ok) throw new Error(`${path} returned ${response.status}`);
  if (!body.includes(text)) throw new Error(`${path} missing "${text}"`);
}

await step("Payment success page renders", async () => {
  await expectText(
    "/payments/transport/success?session_id=cs_test_smoke&transport_job_id=transport-glenbarra",
    "Transport payment recorded"
  );
});

await step("Payment cancel page renders", async () => {
  await expectText(
    "/payments/transport/cancel?transport_job_id=transport-glenbarra",
    "Transport payment still awaiting action"
  );
});

await step("Checkout API rejects invalid JSON", async () => {
  const response = await fetch(url("/api/payments/transport/checkout"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{",
  });
  if (response.status !== 400) {
    throw new Error(`Expected 400, got ${response.status}`);
  }
});

await step("Checkout API rejects missing fields", async () => {
  const response = await fetch(url("/api/payments/transport/checkout"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  if (response.status !== 400) {
    throw new Error(`Expected 400, got ${response.status}`);
  }
});

await step("Checkout API rejects unknown payable", async () => {
  const response = await fetch(url("/api/payments/transport/checkout"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      transportJobId: "transport-glenbarra",
      quoteId: "quote-not-real",
    }),
  });
  if (response.status !== 404) {
    throw new Error(`Expected 404, got ${response.status}`);
  }
});

let checkoutApiStatus = 0;
let checkoutUrl = "";

await step("Checkout API handles accepted transport payable", async () => {
  const response = await fetch(url("/api/payments/transport/checkout"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      transportJobId: "transport-glenbarra",
      quoteId: "quote-glenbarra-1",
    }),
  });
  checkoutApiStatus = response.status;
  const payload = await response.json();
  checkoutUrl = typeof payload.url === "string" ? payload.url : "";

  if (response.status === 503) {
    if (payload.error !== "Stripe test mode is not configured yet") {
      throw new Error(`Unexpected 503 response: ${JSON.stringify(payload)}`);
    }
    return;
  }

  if (!response.ok) {
    throw new Error(`Expected 2xx or 503, got ${response.status}`);
  }

  const isStripeCheckout = checkoutUrl.includes("checkout.stripe.com");
  const isSandboxCheckout = checkoutUrl.includes("/payments/transport/sandbox");
  if (!isStripeCheckout && !isSandboxCheckout) {
    throw new Error(`Unexpected checkout URL: ${JSON.stringify(payload)}`);
  }
});

await step("Sandbox checkout page renders without moving money", async () => {
  await expectText(
    "/payments/transport/sandbox?transport_job_id=transport-glenbarra&quote_id=quote-glenbarra-1",
    "Payment demo only"
  );
});

await step("Sandbox success page is clearly labelled", async () => {
  await expectText(
    "/payments/transport/success?session_id=sandbox_transport-glenbarra_quote-glenbarra-1&transport_job_id=transport-glenbarra&mode=sandbox",
    "Transport payment demo recorded"
  );
});

await step("Stripe webhook rejects missing configuration or signature safely", async () => {
  const response = await fetch(url("/api/webhooks/stripe"), {
    method: "POST",
    body: "{}",
  });

  if (response.status !== 400 && response.status !== 503) {
    throw new Error(`Expected 400 or 503, got ${response.status}`);
  }
});

const browser = await chromium.launch({ headless });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await step("Transport room surfaces payment action immediately", async () => {
  await page.goto(url("/transport/transport-glenbarra"), { waitUntil: "networkidle" });
  await page.getByRole("radio", { name: "Farmer A Livestock owner (Dale)", exact: true }).click();
  await page.getByRole("heading", { name: "Transport payment ready", exact: true }).waitFor();
  await page.getByText("$850 AUD payable to Wayne Hayes", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Pay transport", exact: true }).waitFor();

  if (checkoutApiStatus === 503) {
    await page.getByRole("button", { name: "Pay transport", exact: true }).click();
    await page.getByText("Stripe test mode is not configured yet", { exact: true }).waitFor();
  } else if (checkoutUrl.includes("/payments/transport/sandbox")) {
    await page.getByRole("button", { name: "Pay transport", exact: true }).click();
    await page.getByRole("heading", { name: "Sandbox transport checkout", exact: true }).waitFor();
    await page.getByText("No money moves", { exact: true }).waitFor();
    await page.getByRole("link", { name: "Record demo payment", exact: true }).click();
    await page.getByRole("heading", { name: "Transport payment demo recorded", exact: true }).waitFor();
    await page.getByRole("link", { name: "Back to transport room", exact: true }).click();
    await page.getByRole("heading", { name: "Transport payment ready", exact: true }).waitFor();
  }
});

await step("Transport rate tab keeps the settlement record", async () => {
  await page.getByRole("tab", { name: "Rate", exact: true }).click();
  await page.getByRole("heading", { name: "Settlement record", exact: true }).waitFor();
  await page.getByText("$850 AUD estimated total", { exact: true }).waitFor();
});

await step("Landowner cannot see transport payment action", async () => {
  await page.getByRole("radio", { name: "Farmer B Landowner (Brett)", exact: true }).click();
  const rateTabs = await page.getByRole("tab", { name: "Rate", exact: true }).count();
  if (rateTabs !== 0) throw new Error(`Farmer B can see ${rateTabs} Rate tab(s)`);
  const paymentButtons = await page.getByRole("button", { name: "Pay transport", exact: true }).count();
  if (paymentButtons !== 0) throw new Error(`Farmer B can see ${paymentButtons} payment button(s)`);
});

await browser.close();

if (failures > 0) {
  console.error("");
  console.error(`${failures} payment smoke check(s) failed for ${baseUrl}`);
  process.exit(1);
}

console.log("");
console.log(`All payment smoke checks passed for ${baseUrl}`);
