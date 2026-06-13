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
        fill="var(--color-warm-white, #fff)"
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
          transform="rotate(-15 19.2 5.2)"
        />
        {/* ear */}
        <path d="M15.3 5L16.3 1.5 17.4 5.2z" />
        {/* mane */}
        <path d="M12 10L10.5 8 13 8.5z" />
        <path d="M13.2 8L11.7 6 14.2 6.5z" />
        <path d="M14.4 6L12.9 4 15.4 4.5z" />
        {/* legs */}
        <rect x="4" y="16.3" width="1.8" height="6.5" rx="0.9" />
        <rect x="7" y="17.25" width="1.8" height="5.5" rx="0.9" />
        <rect x="10.5" y="17" width="1.8" height="5.8" rx="0.9" />
        <rect x="13" y="15.6" width="1.8" height="7" rx="0.9" />
        {/* tail */}
        <path d="M2.5 12q-3 1-2.5 7q1.5 .5 2-.5q-1-4 1.5-5.5z" />
      </g>
    </svg>
  );
}

/**
 * Filled wheat/grain icon — companion to the livestock icons above, used to
 * represent landowners ("I have feed") with the same solid-silhouette style.
 */
export function WheatIcon({ className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <g fill="currentColor">
        <rect x="11.2" y="7.5" width="1.6" height="14.5" rx="0.8" />
        <path d="M12 5.5l1.6 3h-3.2z" />
        <path d="M12 9.5q.1-2.28-1.75-3.6q-.12 2.28 1.75 3.6z" />
        <path d="M12 9.5q-.11-2.28 1.75-3.6q.12 2.28-1.75 3.6z" />
        <path d="M12 12.5q-.06-2.51-2.2-3.81q-.06 2.5 2.2 3.81z" />
        <path d="M12 12.5q.06-2.51 2.2-3.81q.06 2.5-2.2 3.81z" />
        <path d="M12 15.5q-.26-2.72-2.68-3.98q-.32 2.5 2.68 3.98z" />
        <path d="M12 15.5q.26-2.72 2.68-3.98q.32 2.5-2.68 3.98z" />
      </g>
    </svg>
  );
}

/**
 * Filled side-on delivery truck icon — companion to the livestock icons,
 * used to represent transport providers with the same solid-silhouette
 * style (cargo box, cab with windscreen cut-out, and two wheels).
 */
export function TransportTruckIcon({ className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <g fill="currentColor">
        <rect x="1" y="6.5" width="13" height="8.5" rx="1" />
        <path d="M14 8.5c0-1.1.9-2 2-2h2.3c.7 0 1.4.4 1.7 1l1.9 3.3c.4.6.6 1.3.6 2v2.2h-8.5z" />
        <circle cx="6.5" cy="17.5" r="2.3" />
        <circle cx="17.5" cy="17.5" r="2.3" />
        <rect x="0.5" y="13.5" width="22.5" height="1.5" rx="0.6" />
      </g>
      <circle
        cx="6.5"
        cy="17.5"
        r="1"
        fill="var(--color-warm-white, #fff)"
      />
      <circle
        cx="17.5"
        cy="17.5"
        r="1"
        fill="var(--color-warm-white, #fff)"
      />
      <path
        d="M16 8c0-.6.4-1 1-1h1.3c.4 0 .7.2.9.5l1.2 2c.1.2.2.5.2.7v.8H16z"
        fill="var(--color-warm-white, #fff)"
      />
    </svg>
  );
}
