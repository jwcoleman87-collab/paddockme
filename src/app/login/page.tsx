import { redirect } from "next/navigation";

/**
 * Old demo login page — superseded by the real Supabase-backed sign-in at
 * /sign-in. Kept as a redirect so any old links/bookmarks land in the right
 * place instead of the old "type anything and you're in" demo form.
 */
export default function LoginPage() {
  redirect("/sign-in");
}
