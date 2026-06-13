import { PaddockHomepage } from "./PaddockHomepage";

/**
 * Screen 1 — Homepage (guided-workflow MVP rebuild).
 *
 * Note: the old landing redirected signed-in users to /agreements. During
 * the rebuild everyone sees the new guided homepage so the full demo flow
 * is always reachable. Re-introduce the signed-in redirect once the new
 * flow is wired to auth.
 */
export default function HomePage() {
  return <PaddockHomepage />;
}
