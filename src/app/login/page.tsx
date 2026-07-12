import { redirect } from "next/navigation";
import { getSafeRedirectPath } from "@/lib/redirect";

/**
 * Legacy private-beta login URL. Real authentication lives at /sign-in,
 * which lands accounts in the shared app shell.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const target = next
    ? `/sign-in?next=${encodeURIComponent(getSafeRedirectPath(next))}`
    : "/sign-in";
  redirect(target);
}
