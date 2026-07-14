import { Truck, Wheat, type LucideProps } from "lucide-react";

/**
 * Central livestock and role icon mapping.
 *
 * Lucide does not provide distinct cattle, sheep and horse glyphs, so these
 * three small line icons use the same 24px stroke language as the Lucide set.
 * Keeping them here gives every PaddockME surface one recognisable species
 * mapping instead of falling back to a generic paw print.
 */
export function CattleIcon({
  size = 24,
  color = "currentColor",
  strokeWidth = 2,
  ...props
}: LucideProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M7.5 6 4 3.5 4.8 8" />
      <path d="M16.5 6 20 3.5 19.2 8" />
      <path d="M7.5 7c0-2 1.8-3 4.5-3s4.5 1 4.5 3v6c0 4-1.8 7-4.5 7s-4.5-3-4.5-7Z" />
      <path d="m7.5 8-3-.5M16.5 8l3-.5" />
      <path d="M9 13.5c1.5-1 4.5-1 6 0V16c-1.5 1.3-4.5 1.3-6 0Z" />
      <path d="M10.5 15h.01M13.5 15h.01" />
    </svg>
  );
}

export function SheepIcon({
  size = 24,
  color = "currentColor",
  strokeWidth = 2,
  ...props
}: LucideProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M8 9a3 3 0 0 1 1-5.8A3.5 3.5 0 0 1 15 4a3 3 0 0 1 1 5" />
      <path d="m8.5 10-4-1.5c-.4 2.3 1 4 4 4.5M15.5 10l4-1.5c.4 2.3-1 4-4 4.5" />
      <path d="M8.5 9.5c0 6.5 1.2 10.5 3.5 10.5s3.5-4 3.5-10.5c-2-1.3-5-1.3-7 0Z" />
      <path d="M10.5 13h.01M13.5 13h.01M11 17h2" />
    </svg>
  );
}

export function HorseIcon({
  size = 24,
  color = "currentColor",
  strokeWidth = 2,
  ...props
}: LucideProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m9 7 1-4 2.5 3L16 4l-.2 5c2.4 2 3.2 5.2 1.6 7.7L15 20H7c1.6-3 1.7-5.8.8-8.5Z" />
      <path d="M9 7c2.4 1 4.4 1.2 6.8 2M8 11.5l-2-1M14 11h.01M13.5 16.5h3" />
      <path d="M8.2 8.5c-1.4 1.8-2 4-1.5 6.5" />
    </svg>
  );
}

export function WheatIcon(props: LucideProps) {
  return <Wheat aria-hidden="true" {...props} />;
}

export function TransportTruckIcon(props: LucideProps) {
  return <Truck aria-hidden="true" {...props} />;
}
