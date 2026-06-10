/**
 * Single source of truth for the Google Maps browser key.
 *
 * SECURITY TODO (owner action required):
 * 1. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in Vercel (Project Settings ->
 *    Environment Variables) and locally in .env.local.
 * 2. Rotate the key below in Google Cloud Console (it is committed to git
 *    history, so treat it as public) and keep the HTTP-referrer restriction.
 * 3. Delete the fallback string so a missing env var degrades to the static
 *    map instead of shipping a hardcoded credential.
 */
export const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ??
  "AIzaSyAG3EVoUUNfk0amP7J40Dy1NpmGG3_1L18";
