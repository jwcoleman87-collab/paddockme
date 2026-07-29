/**
 * The three customer journeys the homepage offers, in one place.
 *
 * Problem this solves: a visitor picked "I have grazing" on the homepage and
 * the next screen never mentioned it again — the choice stopped following
 * them. Every lane entry screen now labels itself with the same wording the
 * tile used, so "where am I" is answerable without reading the URL.
 *
 * `lane` mirrors GUIDED_DEMO_LANES in demoMode.ts — that constant stays the
 * source of truth for middleware redirects; this one adds the customer-facing
 * wording. `intent` matches the sign-up role param consumed by
 * guidedDemoPathFor().
 */
import { GUIDED_DEMO_LANES } from "./demoMode";

export type JourneyIntent = "livestock" | "landowner" | "transport";

export type Journey = {
  intent: JourneyIntent;
  /** The homepage tile label — repeated on the lane so the choice carries. */
  label: string;
  /** What the person is here to do, in their words. */
  task: string;
  lane: string;
};

export const JOURNEYS: Record<JourneyIntent, Journey> = {
  livestock: {
    intent: "livestock",
    label: "I need feed",
    task: "Find a paddock for your stock",
    lane: GUIDED_DEMO_LANES.livestock,
  },
  landowner: {
    intent: "landowner",
    label: "I have grazing",
    task: "Fill your paddock",
    lane: GUIDED_DEMO_LANES.landowner,
  },
  transport: {
    intent: "transport",
    label: "Find transport work",
    task: "Move livestock for both farmers",
    lane: GUIDED_DEMO_LANES.transport,
  },
};

/** Eyebrow text for a lane entry screen, e.g. "I need feed · Your journey". */
export function journeyEyebrow(intent: JourneyIntent): string {
  return `${JOURNEYS[intent].label} · ${JOURNEYS[intent].task}`;
}
