/**
 * Single source of truth for the Google Maps browser key.
 *
 * Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in Vercel and locally in .env.local.
 * When it is absent, map features degrade to their existing fallback states
 * instead of shipping a hardcoded browser credential.
 */
export const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() || "";
