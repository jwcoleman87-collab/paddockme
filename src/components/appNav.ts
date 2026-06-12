import {
  Home,
  Mail,
  Map,
  Search,
  Sprout,
  Truck,
  type LucideIcon,
} from "lucide-react";

/**
 * Single source of truth for primary app navigation. The desktop sidebar
 * renders every item; the mobile tab bar renders the five marked mobile.
 * One navigation truth, two presentations (approved nav overhaul, June 2026).
 */
export type AppNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Path prefixes (besides href) that should highlight this item. */
  match?: string[];
  /** Render in the mobile tab bar (max five). */
  mobile: boolean;
};

export const APP_NAV: AppNavItem[] = [
  {
    href: "/agreements",
    label: "My work",
    icon: Home,
    match: ["/agreements", "/home", "/workspace", "/profile"],
    mobile: true,
  },
  {
    href: "/listings",
    label: "Paddocks",
    icon: Sprout,
    match: ["/listings"],
    mobile: true,
  },
  {
    href: "/requests",
    label: "Requests",
    icon: Search,
    match: ["/requests", "/request", "/matches"],
    mobile: true,
  },
  {
    href: "/transport/jobs",
    label: "Transport",
    icon: Truck,
    match: ["/transport"],
    mobile: true,
  },
  {
    href: "/messages",
    label: "Messages",
    icon: Mail,
    match: ["/messages"],
    mobile: true,
  },
  {
    href: "/map",
    label: "Map",
    icon: Map,
    match: ["/map"],
    mobile: false,
  },
];

export function isNavItemActive(item: AppNavItem, pathname: string): boolean {
  const prefixes = item.match ?? [item.href];
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );
}
