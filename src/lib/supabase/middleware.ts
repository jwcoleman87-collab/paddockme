import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/types/database";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

/**
 * Refreshes the Supabase session on every request.
 *
 * Foundation Build 01 uses dummy data so the personas can click through the product
 * skeleton without needing a real account. Auth route redirects stay in place,
 * but app routes are intentionally browseable until real data gates return.
 */
const POST_AUTH_LANDING = "/agreements";

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

  if (user && isAuthRoute) {
    url.pathname = POST_AUTH_LANDING;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
