import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEMO_SITE_URL,
  MAIN_SITE_URL,
  resolveSiteUrl,
} from "../../src/lib/siteUrl";

/**
 * The showroom demo must resolve to its own public URL, never the main
 * deployment's. Each case passes an explicit env object so nothing depends
 * on the machine running the test.
 */

test("an explicit NEXT_PUBLIC_SITE_URL wins", () => {
  assert.equal(
    resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://paddockme.vercel.app" }),
    DEMO_SITE_URL,
  );
  assert.equal(
    resolveSiteUrl({
      NEXT_PUBLIC_SITE_URL: "https://demo.paddockme.com.au",
      VERCEL_PROJECT_PRODUCTION_URL: "paddockme.vercel.app",
    }),
    "https://demo.paddockme.com.au",
    "a custom domain must beat the Vercel-provided one",
  );
});

test("bare hostnames and trailing slashes are normalised", () => {
  assert.equal(
    resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "paddockme.vercel.app" }),
    DEMO_SITE_URL,
  );
  assert.equal(
    resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://paddockme.vercel.app/" }),
    DEMO_SITE_URL,
  );
  assert.equal(
    resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "   " }),
    MAIN_SITE_URL,
    "whitespace is not a configured URL",
  );
});

test("falls back to the project's production domain, not the deployment URL", () => {
  // VERCEL_URL is the per-deployment generated hostname. Using it would put
  // an unshareable URL into canonical tags, so it must be ignored.
  assert.equal(
    resolveSiteUrl({
      VERCEL_PROJECT_PRODUCTION_URL: "paddockme.vercel.app",
      VERCEL_URL: "paddockme-n2btoyc3i-jwcoleman87-collabs-projects.vercel.app",
    }),
    DEMO_SITE_URL,
  );
  assert.equal(
    resolveSiteUrl({
      VERCEL_PROJECT_PRODUCTION_URL: "paddockme-oz51.vercel.app",
    }),
    MAIN_SITE_URL,
  );
  assert.equal(
    resolveSiteUrl({
      VERCEL_URL: "paddockme-n2btoyc3i-jwcoleman87-collabs-projects.vercel.app",
    }),
    MAIN_SITE_URL,
    "VERCEL_URL alone must never become the site URL",
  );
});

test("a demo build with nothing configured is the demo, not the main site", () => {
  assert.equal(
    resolveSiteUrl({ NEXT_PUBLIC_DEMO_MODE: "true" }),
    DEMO_SITE_URL,
  );
  assert.notEqual(
    resolveSiteUrl({ NEXT_PUBLIC_DEMO_MODE: "true" }),
    MAIN_SITE_URL,
  );
});

test("an unconfigured build falls back to the main site", () => {
  assert.equal(resolveSiteUrl({}), MAIN_SITE_URL);
});

test("the two deployments never resolve to the same URL", () => {
  const demo = resolveSiteUrl({
    VERCEL_PROJECT_PRODUCTION_URL: "paddockme.vercel.app",
  });
  const main = resolveSiteUrl({
    VERCEL_PROJECT_PRODUCTION_URL: "paddockme-oz51.vercel.app",
  });
  assert.notEqual(demo, main);
  assert.equal(demo, DEMO_SITE_URL);
  assert.equal(main, MAIN_SITE_URL);
});
