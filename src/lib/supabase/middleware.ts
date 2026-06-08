import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/types/database";

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
  "/preview",
];

function isPublicBrowseRoute(path: string): boolean {
  return (
    path === "/listings" ||
    (path.startsWith("/listings/") && !path.startsWith("/listings/new")) ||
    path === "/requests" ||
    path === "/transport" ||
    path === "/transport/jobs" ||
    path === "/transport/available" ||
    path === "/map"
  );
}

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

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

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
    PUBLIC_PREFIXES.some((prefix) => path.startsWith(prefix)) ||
    isPublicBrowseRoute(path);
  const isAppRoute = APP_PREFIXES.some((prefix) => path.startsWith(prefix));

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

  if (user && isPublicRoute && !isOnboardingRoute) {
    return supabaseResponse;
  }

  if (user && isAppRoute && !isPublicBrowseRoute(path)) {
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
