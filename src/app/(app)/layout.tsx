import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Home,
  Search,
  Layers,
  MessageSquare,
  Map as MapIcon,
  User,
} from "lucide-react";

/**
 * Authenticated app shell.
 * Top header + sticky bottom nav (mobile-first; full-width on desktop).
 * Auth gate is enforced in middleware, but we double-check here as belt + braces.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="min-h-screen flex flex-col bg-warm-white">
      <header className="border-b border-mist bg-cream">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/home"
            className="font-display italic text-2xl text-sage-deep"
          >
            PaddockME
          </Link>
          <Link
            href="/profile"
            className="text-sm text-bark/80 hover:text-sage-deep"
          >
            {user.email}
          </Link>
        </div>
      </header>

      <main className="flex-1 pb-24">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 border-t border-mist bg-warm-white">
        <div className="mx-auto grid max-w-6xl grid-cols-5 px-2 py-2">
          <BottomNavItem href="/home" icon={<Home className="h-5 w-5" />} label="Home" />
          <BottomNavItem href="/request/new" icon={<Search className="h-5 w-5" />} label="Request" />
          <BottomNavItem href="/matches" icon={<Layers className="h-5 w-5" />} label="Matches" />
          <BottomNavItem href="/workspace" icon={<MessageSquare className="h-5 w-5" />} label="Workspace" />
          <BottomNavItem href="/map" icon={<MapIcon className="h-5 w-5" />} label="Map" />
        </div>
      </nav>
    </div>
  );
}

function BottomNavItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1 py-2 text-xs text-bark/70 hover:text-sage-deep transition"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
