"use client";

type Page =
  | "listings"
  | "capacity"
  | "transport-portal"
  | "runs"
  | "map"
  | "requests";

export function PersonaIntroBanner({ page }: { page: Page }) {
  void page;
  return null;
}
