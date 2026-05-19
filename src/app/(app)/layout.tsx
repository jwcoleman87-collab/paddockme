import { AppShell } from "@/components/AppShell";
import { ModeIndicator } from "@/components/shared/ModeIndicator";

/**
 * Main application shell for the Foundation Build 01 clickable skeleton.
 * The real auth/data gates remain scaffolded in lib/supabase, but these
 * dummy-data workflow screens stay browseable while we shape the product.
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      <ModeIndicator />
      {children}
    </AppShell>
  );
}
