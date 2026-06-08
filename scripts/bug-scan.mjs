/**
 * PaddockMe live-site bug scan (Playwright, Chromium)
 * Visits public + semi-public routes and captures console errors,
 * network failures, broken images, and mobile layout notes.
 *
 * Usage: node scripts/bug-scan.mjs
 */

import { chromium } from "playwright";

const BASE = "https://paddockme-oz51.vercel.app";

// Routes to scan without auth (public / redirect targets)
const PUBLIC_ROUTES = [
  "/",
  "/sign-in",
  "/sign-up",
];

// Routes to scan while trying to stay auth-gated
// (best-effort after demo persona is set via localStorage)
const APP_ROUTES = [
  "/agreements",
  "/home",
  "/matches",
  "/request/new",
  "/workspace",
  "/map",
  "/map?mode=driver",
  "/transport",
  "/transport/available",
  "/transport/jobs",
  "/runs",
  "/profile",
  "/listings",
  "/messages",
];

// A sandboxed test account; if sign-up fails, fall through to unauth scan
const TEST_EMAIL = "bug-scan@example.com";
const TEST_PASSWORD = "BugScan2026!";

const DESKTOP = { width: 1280, height: 800 };
const MOBILE  = { width: 375,  height: 667 };

function ms(start) {
  return `${Date.now() - start} ms`;
}

async function scanPage(page, url, label) {
  const consoleMessages = [];
  const networkFails = [];
  const brokenImages = [];

  page.on("console", (msg) => {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
  });
  page.on("response", (response) => {
    const status = response.status();
    if (status >= 400) {
      networkFails.push({ url: response.url(), status });
    }
  });

  const start = Date.now();
  let crashed = false;
  try {
    const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
    const finalUrl = page.url();
    const tti = Date.now() - start;

    // Check for broken images after a short settle
    await page.waitForTimeout(1500);
    const imgResults = await page.evaluate(() => {
      return Array.from(document.images).map((img) => ({
        src: img.src,
        broken: img.naturalWidth === 0 && img.complete,
      }));
    });
    for (const img of imgResults) {
      if (img.broken) brokenImages.push(img.src);
    }

    // Mobile viewport check
    await page.setViewportSize(MOBILE);
    await page.waitForTimeout(500);
    const mobileTitle = await page.title();
    await page.setViewportSize(DESKTOP);

    const errors = consoleMessages.filter(
      (m) => m.type === "error" || m.type === "warning"
    );
    const httpErrors = networkFails.filter((n) => n.status >= 400);

    return {
      route: label,
      url,
      finalUrl,
      status: res?.status() ?? "unknown",
      tti,
      fast: tti < 3000,
      consoleErrors: errors,
      networkFails: httpErrors,
      brokenImages,
      mobileTitle,
      crashed: false,
    };
  } catch (e) {
    return {
      route: label,
      url,
      finalUrl: url,
      status: "crash",
      tti: Date.now() - start,
      fast: false,
      consoleErrors: [{ type: "error", text: String(e) }],
      networkFails: [],
      brokenImages: [],
      mobileTitle: null,
      crashed: true,
    };
  }
}

async function trySignIn(page) {
  try {
    await page.goto(`${BASE}/sign-in`, { waitUntil: "domcontentloaded", timeout: 10000 });
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL((url) => !url.pathname.includes("sign-in"), { timeout: 8000 });
    return true;
  } catch {
    return false;
  }
}

async function trySignUp(page) {
  try {
    await page.goto(`${BASE}/sign-up`, { waitUntil: "domcontentloaded", timeout: 10000 });
    const nameField = await page.$('input[name="name"], input[placeholder*="Pat Murphy"]');
    if (nameField) await nameField.fill("Bug Scanner");
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  // ── Desktop context ──────────────────────────────────────────────────
  const ctx = await browser.newContext({ viewport: DESKTOP });
  const page = await ctx.newPage();

  console.log("Scanning public routes...");
  for (const route of PUBLIC_ROUTES) {
    const r = await scanPage(page, `${BASE}${route}`, route);
    results.push(r);
    console.log(`  ${r.fast ? "✓" : "⚠"} ${route}  ${r.tti} ms  HTTP ${r.status}  final:${r.finalUrl}`);
  }

  // Try sign-in, then sign-up as fallback
  console.log("Attempting sign-in...");
  let authed = await trySignIn(page);
  if (!authed) {
    console.log("Sign-in failed, trying sign-up...");
    authed = await trySignUp(page);
    if (authed) {
      console.log("Sign-up submitted - waiting for email verification...");
      authed = false; // likely needs email confirmation
    }
  }

  if (authed) {
    console.log("Signed in. Scanning app routes...");
  } else {
    console.log("Could not authenticate. Scanning app routes unauth'd (redirect behaviour only)...");
    // Set the demo persona so the prototype renders
    await page.goto(`${BASE}/agreements`, { waitUntil: "domcontentloaded", timeout: 10000 }).catch(() => {});
    await page.evaluate(() => {
      try {
        localStorage.setItem("paddockme.agreements.persona", "farmer-a");
        localStorage.setItem("paddockme.profile.persona", "farmer-a");
      } catch {}
    });
  }

  for (const route of APP_ROUTES) {
    const r = await scanPage(page, `${BASE}${route}`, route);
    results.push(r);
    const authStatus = r.finalUrl.includes("sign-in") ? "→ sign-in" : "rendered";
    console.log(`  ${r.fast ? "✓" : "⚠"} ${route}  ${r.tti} ms  HTTP ${r.status}  ${authStatus}`);
  }

  await browser.close();

  // ── Report output ─────────────────────────────────────────────────────
  console.log("\n\n========== SCAN RESULTS ==========\n");

  let findings = 0;
  for (const r of results) {
    const issues = [];
    if (r.crashed) issues.push(`CRASH: ${r.consoleErrors[0]?.text}`);
    if (!r.fast) issues.push(`Slow TTI: ${r.tti} ms (> 3 s)`);
    for (const e of r.consoleErrors) {
      if (e.type === "error") issues.push(`Console error: ${e.text.slice(0, 200)}`);
    }
    for (const w of r.consoleErrors) {
      if (w.type === "warning") issues.push(`Console warn: ${w.text.slice(0, 200)}`);
    }
    for (const n of r.networkFails) issues.push(`HTTP ${n.status}: ${n.url.slice(0, 120)}`);
    for (const img of r.brokenImages) issues.push(`Broken image: ${img.slice(0, 120)}`);
    if (r.finalUrl.includes("sign-in") && !r.route.includes("sign-in")) {
      issues.push("Redirected to sign-in (auth gate active)");
    }

    if (issues.length > 0) {
      findings++;
      console.log(`\n[${r.route}]  TTI=${r.tti} ms  final=${r.finalUrl}`);
      for (const issue of issues) console.log(`  • ${issue}`);
    }
  }

  if (findings === 0) {
    console.log("No obvious runtime issues found.");
  }

  // Output structured JSON for the report
  const outputPath = new URL("../scan-results.json", import.meta.url);
  const { writeFileSync } = await import("fs");
  writeFileSync(
    outputPath,
    JSON.stringify(
      {
        scannedAt: new Date().toISOString(),
        authenticated: authed,
        pages: results.map((r) => ({
          route: r.route,
          finalUrl: r.finalUrl,
          status: r.status,
          tti: r.tti,
          fast: r.fast,
          consoleErrors: r.consoleErrors.filter((m) => m.type === "error"),
          consoleWarnings: r.consoleErrors.filter((m) => m.type === "warning"),
          networkFails: r.networkFails,
          brokenImages: r.brokenImages,
          redirectedToSignIn: r.finalUrl.includes("sign-in") && !r.route.includes("sign-in"),
          crashed: r.crashed,
        })),
      },
      null,
      2
    )
  );
  console.log(`\nJSON results saved to scan-results.json`);
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
