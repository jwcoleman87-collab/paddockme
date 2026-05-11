import { cn } from "@/lib/utils";

export type StateMiniMapState =
  | "NSW"
  | "QLD"
  | "VIC"
  | "SA"
  | "WA"
  | "TAS"
  | "NT"
  | "ACT";

type DotPosition = {
  x: number;
  y: number;
};

type StateMiniMapProps = {
  state: StateMiniMapState;
  regionLabel?: string;
  dotPosition?: DotPosition;
  className?: string;
};

const statePaths: Record<StateMiniMapState, string> = {
  NSW: "M30 14 L70 17 L82 31 L78 47 L86 61 L74 80 L55 77 L35 88 L18 72 L22 55 L13 42 L24 29 Z",
  QLD: "M29 7 L62 11 L79 25 L86 49 L75 70 L70 92 L52 83 L35 75 L18 78 L21 55 L12 41 L23 27 Z",
  VIC: "M21 37 L43 29 L62 36 L77 31 L89 44 L80 58 L60 63 L43 73 L27 65 L13 53 Z",
  SA: "M27 14 L72 14 L78 35 L72 84 L51 78 L31 85 L24 58 Z",
  WA: "M29 9 L75 18 L76 80 L47 89 L24 72 L17 50 L24 29 Z",
  TAS: "M26 37 L46 28 L70 34 L80 50 L66 67 L42 73 L24 60 Z",
  NT: "M31 9 L76 12 L74 84 L35 82 L24 56 L30 34 Z",
  ACT: "M35 22 L72 28 L80 56 L58 80 L30 68 L24 42 Z",
};

export function StateMiniMap({
  state,
  regionLabel,
  dotPosition = { x: 50, y: 50 },
  className,
}: StateMiniMapProps) {
  const label = regionLabel ? `${regionLabel}, ${state}` : state;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-mist bg-warm-white p-2 text-sage-deep shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]",
        className,
      )}
    >
      <svg
        viewBox="0 0 100 100"
        role="img"
        aria-label={`${label} location indicator`}
        className="h-full w-full"
      >
        <title>{label} location indicator</title>
        <path
          d={statePaths[state]}
          fill="var(--color-cream)"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />
        <circle
          cx={dotPosition.x}
          cy={dotPosition.y}
          r="18"
          fill="var(--color-sage-glow)"
          opacity="0.72"
        />
        <circle
          cx={dotPosition.x}
          cy={dotPosition.y}
          r="4.5"
          fill="var(--color-sage-deep)"
          stroke="var(--color-warm-white)"
          strokeWidth="2"
        />
      </svg>

      <span className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate rounded-full bg-cream/90 px-2 py-0.5 text-[0.65rem] font-semibold leading-4 text-sage-deep shadow-sm">
        {regionLabel ?? state}
      </span>
    </div>
  );
}
