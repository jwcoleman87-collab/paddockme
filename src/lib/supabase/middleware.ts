import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/types/database";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

/**
 * Refreshes the Supabase session on every request and gates the authenticated routes.
 * The (app) route group in src/app/(app)/* doesn't add "/app" to URLs — Next.js
 * strips parenthesised groups from the path. So protected pages live at /home,
 * /matches, /workspace, /map, /transport, /profile, /request, etc.
 */
const PROTECTED_PREFIXES = [
  "/home",
  "/request",
  "/matches",
  "/workspace",
  "/map",
  "/transport",
  "/profile",
];
const POST_AUTH_LANDING = "/home";

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

  // IMPORTANT: do not put logic between createServerClient and getUser.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const path = url.pathname;

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => path === p || path.startsWith(p + "/")
  );
  const isAuthRoute =
    path.startsWith("/sign-in") || path.startsWith("/sign-up");

  // Unauthenticated → protected route redirects to /sign-in (with ?next= preserved)
  if (!user && isProtected) {
    url.pathname = "/sign-in";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // Already signed in → /sign-in or /sign-up redirects to /home
  if (user && isAuthRoute) {
    url.pathname = POST_AUTH_LANDING;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
