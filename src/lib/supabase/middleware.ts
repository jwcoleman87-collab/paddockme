import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/types/database";
import { isSupabaseConfigured } from "./env";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

/**
 * Refreshes the Supabase session on every request.
 *
 * Refreshes auth cookies and applies the production account gates:
 * - signed-out users are sent to /sign-in before entering the app shell
 * - signed-in users finish onboarding before entering the marketplace
 */
const POST_AUTH_LANDING = "/agreements";
const ONBOARDING_PATH = "/onboarding";

const PUBLIC_PREFIXES = [
  "/auth/callback",
  "/payments/transport",
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/update-password",
];

// Production accounts only: every marketplace surface requires sign-in.
// The old "public browse" exemption (listings/requests/transport/map for
// signed-out visitors) rendered the demo seed world, which is retired.
const APP_PREFIXES = [
  "/agreements",
  "/home",
  "/landowner",
  "/listings",
  "/map",
  "/matches",
  "/messages",
  "/profile",
  "/request",
  "/requests",
  "/runs",
  "/transport",
  "/workspace",
];

// Guided-MVP demo flow (branch: paddockme-guided-mvp-rebuild).
// These are the new customer-journey screens, designed to be walked
// end-to-end with demo data and NO auth. They take precedence over the
// APP_PREFIXES gate so signed-out visitors are never bounced to /sign-in
// mid-flow. Auth itself is untouched — every other marketplace surface
// (the old (app) dashboards: bare /requests, /transport, /workspace,
// /home, /agreements, /listings, /map, /matches, /messages, /profile)
// still requires sign-in. /requests is intentionally scoped to its demo
// sub-routes so the old /requests dashboard index stays gated.
const GUIDED_MVP_PREFIXES = [
  // /login and /register are legacy URLs whose pages now redirect straight
  // to the real /sign-in and /sign-up.
  "/account",
  "/properties",
  "/requests/new",
  "/requests/matches",
  "/requests/sent",
  "/landowner/requests",
  "/workspaces",
  "/transport/demo",
  "/transport/quotes",
  "/transport/rooms",
];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const url = request.nextUrl.clone();
  const path = url.pathname;
  const isAuthRoute =
    path.startsWith("/sign-in") || path.startsWith("/sign-up");
  // /forgot-password and /update-password are intentionally not in
  // isAuthRoute - a signed-in user clicking "Forgot?" should still be able
  // to land on the reset flow. They sit in PUBLIC_PREFIXES below so the
  // signed-out gate keeps strangers out of the app shell but still lets
  // the reset flow render.
  const isOnboardingRoute = path.startsWith(ONBOARDING_PATH);
  const isPublicRoute =
    path === "/" ||
    isOnboardingRoute ||
    GUIDED_MVP_PREFIXES.some((prefix) => path.startsWith(prefix)) ||
    PUBLIC_PREFIXES.some((prefix) => path.startsWith(prefix));
  const isAppRoute = APP_PREFIXES.some((prefix) => path.startsWith(prefix));

  if (!isSupabaseConfigured()) {
    if (isAppRoute && !isPublicRoute) {
      url.pathname = "/sign-in";
      url.search = "";
      url.searchParams.set("next", `${path}${request.nextUrl.search}`);
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isAppRoute && !isPublicRoute) {
    url.pathname = "/sign-in";
    url.search = "";
    url.searchParams.set("next", `${path}${request.nextUrl.search}`);
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    url.pathname = POST_AUTH_LANDING;
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Signed-in accounts always use the shared app shell: the guided demo's
  // /account screen hands over to the real profile surface.
  if (user && path.startsWith("/account")) {
    url.pathname = "/profile";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (user && isPublicRoute && !isOnboardingRoute) {
    return supabaseResponse;
  }

  if (user && isAppRoute) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("account_types")
      .eq("id", user.id)
      .maybeSingle();

    const hasCompletedOnboarding =
      (profile?.account_types?.length ?? 0) > 0;

    if (!hasCompletedOnboarding) {
      url.pathname = ONBOARDING_PATH;
      url.search = "";
      url.searchParams.set("next", `${path}${request.nextUrl.search}`);
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
