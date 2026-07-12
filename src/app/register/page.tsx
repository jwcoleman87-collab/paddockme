import { redirect } from "next/navigation";

/**
 * Legacy private-beta registration URL. Real account creation lives at
 * /sign-up, which onboards accounts into the shared app shell.
 */
export default function RegisterPage() {
  redirect("/sign-up");
}
