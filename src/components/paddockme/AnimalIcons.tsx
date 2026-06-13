/**
 * Simple filled-silhouette livestock icons (24x24 viewBox) used for the
 * livestock type picker and summary rows. Designed to read clearly as a
 * cow, sheep, or horse even at small sizes — no faces, no character,
 * just a recognisable side-on animal outline.
 */

type IconProps = React.SVGProps<SVGSVGElement>;

export function CattleIcon({ className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <g fill="currentColor">
        <ellipse cx="10" cy="13" rx="7.5" ry="4.5" />
        <circle cx="17.5" cy="10.5" r="3.3" />
        <ellipse cx="17.5" cy="7" rx="1.5" ry="1.1" />
        <rect x="4" y="15" width="1.8" height="6.5" rx="0.9" />
        <rect x="7.5" y="16" width="1.8" height="5.5" rx="0.9" />
        <rect x="12" y="16" width="1.8" height="5.5" rx="0.9" />
        <rect x="15.5" y="14.5" width="1.8" height="7" rx="0.9" />
        <path d="M2.5 11q-2 1-1.5 6l1.8-.4q-.8-4 1-5.2z" />
      </g>
      {/* horns */}
      <path
        d="M15.3 8.5q-2-2.3-1-4.3"
        stroke="currentColor"
        strokeWidth="1.7"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M19.7 8.5q2-2.3 1-4.3"
        stroke="currentColor"
        strokeWidth="1.7"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SheepIcon({ className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <g fill="currentColor">
        {/* woolly body */}
        <circle cx="6" cy="10.5" r="3.2" />
        <circle cx="10" cy="9" r="3.8" />
        <circle cx="14.5" cy="9" r="3.8" />
        <circle cx="18" cy="10.5" r="3.2" />
        <ellipse cx="12" cy="13" rx="9" ry="4" />
        {/* legs */}
        <rect x="4" y="14.5" width="1.8" height="6" rx="0.9" />
        <rect x="8" y="15.8" width="1.8" height="5.5" rx="0.9" />
        <rect x="13" y="15.9" width="1.8" height="5.5" rx="0.9" />
        <rect x="17.5" y="15" width="1.8" height="6" rx="0.9" />
      </g>
      {/* smooth face, cut out from the wool */}
      <circle
        cx="20"
        cy="13"
        r="3"
        fill="var(--color-pm-cream-50, #fff)"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M19 11l-1.5-1.5"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function HorseIcon({ className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <g fill="currentColor">
        <ellipse cx="8" cy="14.5" rx="6" ry="3.8" />
        {/* neck */}
        <path d="M11 12L14.5 4.5 18 5.5 13.5 13z" />
        {/* head */}
        <ellipse
          cx="19.2"
          cy="5.2"
          rx="3.8"
          ry="2.2"
          transform="rotate(-15 19.2 