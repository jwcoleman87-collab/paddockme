/**
 * Which public site is this build?
 *
 * Two Vercel projects build from this one repo — the showroom demo
 * (paddockme.vercel.app) and the original live site
 * (paddockme-oz51.vercel.app). `metadataBase` used to be hardcoded to the
 * main site, so every canonical link, Open Graph URL and share card served
 * from the demo pointed a visitor at the *other* deployment.
 *
 * Resolution order, most explicit first:
 *
 * 1. `NEXT_PUBLIC_SITE_URL` — set this per Vercel project. It is the only
 *    source that survives custom domains, so it wins.
 * 2. `VERCEL_PROJECT_PRODUCTION_URL` — Vercel's *production* domain for the
 *    project (`paddockme.vercel.app` / `paddockme-oz51.vercel.app`).
 *    Deliberately not `VERCEL_URL`, which is the per-deployment generated
 *    hostname (`paddockme-n2btoyc3i-….vercel.app`) and would put a URL
 *    nobody can share into every canonical tag.
 * 3. `NEXT_PUBLIC_DEMO_MODE` — a demo build with no URL configured is the
 *    demo, not the main site.
 * 4. The main site, as the last resort. Preserves the previous behaviour
 *    rather than inventing a host.
 *
 * Read at call time, not module load, so tests can vary the environment.
 */

export const DEMO_SITE_URL = "https://paddockme.vercel.app";
export const MAIN_SITE_URL = "https://paddockme-oz51.vercel.app";

/** Add a scheme if the value is a bare hostname, and drop a trailing slash. */
function normaliseSiteUrl(value: string): string {
  const trimmed = value.trim().replace(/\/+$/, "");
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function resolveSiteUrl(env: NodeJS.ProcessEnv = process.env): string {
  const explicit = normaliseSiteUrl(env.NEXT_PUBLIC_SITE_URL ?? "");
  if (explicit) return explicit;

  const vercelProduction = normaliseSiteUrl(
    env.VERCEL_PROJECT_PRODUCTION_URL ?? "",
  );
  if (vercelProduction) return vercelProduction;

  if (env.NEXT_PUBLIC_DEMO_MODE === "true") return DEMO_SITE_URL;

  return MAIN_SITE_URL;
}
