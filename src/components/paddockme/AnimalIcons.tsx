/**
 * Simple line-art animal icons matching the lucide-react icon style
 * (24x24 viewBox, stroke-based) used for the livestock type picker.
 */

type IconProps = {
  className?: string;
};

export function CattleIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* horns */}
      <path d="M7.5 4.5c-1.7-.8-3.3.3-2.7 2 .2.6 0 1.3-.5 1.8" />
      <path d="M16.5 4.5c1.7-.8 3.3.3 2.7 2-.2.6 0 1.3.5 1.8" />
      {/* head */}
      <path d="M5 10.5c0-1.9 1.6-3.5 3.5-3.5h7c1.9 0 3.5 1.6 3.5 3.5 0 4.4-3.1 8-7 8s-7-3.6-7-8Z" />
      {/* ears */}
      <path d="M4.3 8.3c-1.1.4-1.6 1.7-1 2.7.4.7 1.2 1 2 .9" />
      <path d="M19.7 8.3c1.1.4 1.6 1.7 1 2.7-.4.7-1.2 1-2 .9" />
      {/* muzzle */}
      <rect x="8.5" y="14.5" width="7" height="3.5" rx="1.75" />
      {/* nostrils */}
      <circle cx="10" cy="16.2" r=".6" fill="currentColor" />
      <circle cx="14" cy="16.2" r=".6" fill="currentColor" />
      {/* eyes */}
      <circle cx="9" cy="11" r=".6" fill="currentColor" />
      <circle cx="15" cy="11" r=".6" fill="currentColor" />
    </svg>
  );
}

export function SheepIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* fluffy wool outline */}
      <path d="M3 11c-.8 0-1.5-.7-1.5-1.5S2.2 8 3 8c0-1.1.9-2 2-2 .2-1.1 1.2-2 2.5-2s2.3.9 2.5 2h2c.2-1.1 1.2-2 2.5-2s2.3.9 2.5 2c1.1 0 2 .9 2 2 .8 0 1.5.7 1.5 1.5S19.8 11 19 11" />
      {/* body */}
      <path d="M3 11h16v.5c0 1.9-1.6 3.5-3.5 3.5h-9C4.6 15 3 13.4 3 11.5Z" />
      {/* head */}
      <circle cx="20.5" cy="13" r="1.5" />
      <circle cx="21" cy="12.5" r=".4" fill="currentColor" />
      {/* legs */}
      <path d="M6.5 15v3" />
      <path d="M9.5 15v3" />
      <path d="M14.5 15v3" />
      <path d="M17.5 15v3" />
    </svg>
  );
}

export function HorseIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* neck */}
      <path d="M14 21v-3.5" />
      {/* head + mane */}
      <path d="M14 17.5c-2.5 0-4.5-2-4.5-4.5v-2c0-.8-.4-1.5-1-2C7.5 8 7 7 7.5 6c.8-1.6 2.8-2.5 4.5-2 1-1 2.7-1 3.7.2.9-.3 2 .1 2.5 1 .7 0 1.3.6 1.3 1.3 0 .9-.7 1.7-1.6 1.7H17l1 2.5c.6 1.5-.5 3.3-2 3.3H14Z" />
      {/* eye */}
      <circle cx="9.3" cy="9.3" r=".6" fill="currentColor" />
      {/* forelock */}
      <path d="M13.5 4.5c.8.3 1.4 1 1.7 1.8" />
      {/* front leg */}
      <path d="M9 17.5v3.5" />
    </svg>
  );
}
