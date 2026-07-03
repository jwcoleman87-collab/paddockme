/**
 * Filled side-on livestock silhouettes (24x24 viewBox) used for the
 * livestock type picker and summary rows. Drawn as realistic animal
 * outlines — lowered cow head with horn and tail switch, woolly sheep
 * with a distinct face, arched-neck horse with a flowing tail — so each
 * species reads instantly, even at 24px.
 */

type IconProps = React.SVGProps<SVGSVGElement>;

export function CattleIcon({ className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {/* body, lowered head and legs */}
      <path
        d="M5 7.6
        C7.6 7.1 11.3 7.1 13.7 7.5
        L16.2 7
        C16.6 6.4 17.3 6.1 18 6.2
        C19.3 6.5 20.6 7.3 21.6 8.4
        C22.3 9.1 22.5 9.9 22.3 10.6
        L22.1 11.3 C22 11.8 21.4 12.1 20.9 11.9
        L19.2 11.4
        C18.9 11.2 18.7 10.9 18.6 10.5
        C18.2 11.2 17.9 12 17.8 12.9
        L17.4 14.2
        L17.2 20.5 L17.3 21.4 L15.7 21.4 L15.6 20.5 L15.2 15.9
        L14.4 15.9 L14.3 20.5 L14.4 21.4 L12.9 21.4 L12.9 20.5 L12.7 15.6
        C11.4 15.9 9.6 15.9 8.5 15.6
        L8.3 20.5 L8.4 21.4 L6.9 21.4 L6.9 20.5 L6.6 16.3
        L6 16 L5.7 20.5 L5.7 21.4 L4.2 21.4 L4.2 20.4 L4.4 14.9
        C3.9 13.7 3.7 12.1 3.8 10.6
        C3.9 9 4.2 7.8 5 7.6 Z"
      />
      {/* ear */}
      <path d="M16.7 6.7 L15 6 C14.7 5.85 14.75 5.4 15.1 5.4 L17.1 5.6 Z" />
      {/* horn */}
      <path d="M17.7 6.1 C17.4 5 17.8 3.9 18.8 3.5 C18.6 4.4 18.7 5.3 19.2 6.1 Z" />
      {/* tail with switch */}
      <path d="M4.2 8.4 C3.4 8.7 3 9.4 2.9 10.2 L2.5 15.3 C2.45 15.9 3.3 16.1 3.5 15.5 L4.6 11.2 Z" />
    </svg>
  );
}

export function SheepIcon({ className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {/* woolly body and legs */}
      <path
        d="M5.6 8.6
        C6.2 7.2 8 6.4 9.4 6.9
        C10.3 6 12 5.8 13 6.4
        C14.2 5.9 15.9 6.3 16.6 7.3
        C18 7.3 19.2 8.3 19.4 9.6
        C20.4 10.4 20.6 11.9 19.9 12.9
        C20 14.2 19.1 15.3 17.8 15.6
        L17.6 20.4 L17.7 21.3 L16.2 21.3 L16.2 20.4 L15.9 15.9
        L14.5 15.9 L14.3 20.4 L14.4 21.3 L12.9 21.3 L12.9 20.4 L12.7 15.9
        L9.9 15.9 L9.7 20.4 L9.8 21.3 L8.3 21.3 L8.3 20.4 L8.1 15.8
        L6.7 15.7 L6.5 20.4 L6.6 21.3 L5.1 21.3 L5.1 20.4 L4.9 15.3
        C3.8 14.7 3.3 13.4 3.7 12.2
        C3.2 11 3.7 9.6 4.9 9
        C5.1 8.9 5.3 8.7 5.6 8.6 Z"
      />
      {/* head, dipped to graze height */}
      <path
        d="M16.4 8.6
        C17.2 8.2 18.2 8.3 18.9 8.9
        L21.3 11 C21.7 11.4 21.9 11.9 21.8 12.4
        L21.5 13.7 C21.4 14.3 20.8 14.7 20.2 14.6
        L18.5 14.3 C17.9 14.2 17.4 13.8 17.2 13.2 Z"
      />
      {/* ear */}
      <path d="M17.9 9.3 L19.9 8.7 C20.3 8.6 20.5 9 20.3 9.3 L19.3 10.5 Z" />
    </svg>
  );
}

export function HorseIcon({ className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {/* body, arched neck, long head and legs */}
      <path
        d="M5.4 9.2
        C7.2 8.6 9.8 8.5 11.9 8.8
        L13.2 8.5
        L15.9 4.9
        L16 3.6 L16.7 4.6
        C17.4 4.5 18.2 4.8 18.7 5.4
        L21.3 8.2 C21.6 8.6 21.5 9.1 21 9.1
        L19.9 9.1 C19.4 9.1 18.9 8.9 18.6 8.5
        L18 7.8
        C17.8 8.7 17.3 9.5 16.7 10.1
        C15.9 11.2 15.5 12.6 15.4 13.9
        L15.3 14.5
        L15.2 20.6 L15.3 21.6 L13.8 21.6 L13.7 20.6 L13.4 16
        L12.8 16 L12.6 20.6 L12.7 21.6 L11.2 21.6 L11.2 20.6 L11.1 15.5
        C10 15.8 8.6 15.8 7.7 15.5
        L7.5 20.6 L7.6 21.6 L6.1 21.6 L6.1 20.6 L5.9 16.1
        L5.4 15.7 L5.3 20.6 L5.4 21.6 L3.9 21.6 L3.9 20.5 L4.1 14.9
        C3.7 13.6 3.6 11.9 3.9 10.6
        C4.1 9.7 4.6 9.3 5.4 9.2 Z"
      />
      {/* neck fill under the mane line */}
      <path d="M15.8 5.1 C14.9 6.4 14 7.7 13 8.6 C14 9.1 14.9 9.9 15.5 10.9 C16.1 9.1 16 6.9 15.8 5.1 Z" />
      {/* flowing tail */}
      <path d="M4.5 9.8 C3.4 10.5 2.9 11.8 2.7 13 L2.2 17.4 C2.1 18.1 3 18.5 3.4 17.9 L5 14.9 Z" />
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
