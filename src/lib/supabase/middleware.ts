import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/types/database";

/**
 * Refreshes the Supabase session on every request and gates the /app/* routes.
 * Unauthenticated users hitting /app/* get bounced to /sign-in.
 */
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
        setAll(cookiesToSet) {
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

  const isAppRoute = path.startsWith("/app");
  const isAuthRoute =
    path.startsWith("/sign-in") || path.startsWith("/sign-up");

  // Unauthenticated → /app/* redirects to /sign-in
  if (!user && isAppRoute) {
    url.pathname = "/sign-in";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // Already signed in → /sign-in or /sign-up redirects to /app/home
  if (user && isAuthRoute) {
    url.pathname = "/app/home";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
