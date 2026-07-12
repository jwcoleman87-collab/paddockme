import { PaddockHomepage } from "./PaddockHomepage";

/**
 * Screen 1 — Homepage, and the real entry point for the guided MVP.
 *
 * Everyone (signed in or not) lands on the same guided homepage with three
 * obvious paths: Need Feed / Have Feed / Transport. We deliberately do NOT
 * redirect signed-in users elsewhere — "/" is the start of the flow, never
 * a bounce into an older dashboard.
 */
export default function HomePage() {
  return <PaddockHomepage />;
}
