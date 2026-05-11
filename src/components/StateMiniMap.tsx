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

type NearbyPlace = DotPosition & {
  label: string;
};

type StateMiniMapProps = {
  state: StateMiniMapState;
  regionLabel?: string;
  placeLabel?: string;
  dotPosition?: DotPosition;
  nearbyPlaces?: NearbyPlace[];
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
  placeLabel,
  dotPosition = { x: 50, y: 50 },
  nearbyPlaces = [],
  className,
}: StateMiniMapProps) {
  const locationLabel = placeLabel ?? regionLabel ?? state;
  const label = regionLabel
    ? `${locationLabel}, ${regionLabel}, ${state}`
    : locationLabel;

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

        <path
          d={buildRoutePath(dotPosition, nearbyPlaces)}
          fill="none"
          stroke="var(--color-ochre)"
          strokeDasharray="3 4"
          strokeLinecap="round"
          strokeWidth="1.4"
          opacity="0.58"
        />

        <ellipse
          cx={dotPosition.x}
          cy={dotPosition.y}
          rx="21"
          ry="15"
          fill="var(--color-sage-glow)"
          opacity="0.72"
        />

        {nearbyPlaces.map((place) => (
          <g key={place.label}>
            <circle
              cx={place.x}
              cy={place.y}
              r="2.1"
              fill="var(--color-sage)"
              opacity="0.62"
            />
            <text
              x={place.x}
              y={place.y - 4}
              textAnchor={getTextAnchor(place.x)}
              className="fill-bark/70 text-[0.42rem] font-bold"
            >
              {place.label}
            </text>
          </g>
        ))}

        <circle
          cx={dotPosition.x}
          cy={dotPosition.y}
          r="4.5"
          fill="var(--color-sage-deep)"
          stroke="var(--color-warm-white)"
          strokeWidth="2"
        />
        <text
          x={dotPosition.x}
          y={dotPosition.y - 8}
          textAnchor={getTextAnchor(dotPosition.x)}
          className="fill-sage-deep text-[0.55rem] font-black"
        >
          {locationLabel}
        </text>
      </svg>

      <span className="absolute left-2 top-2 rounded-full bg-cream/90 px-2 py-0.5 text-[0.62rem] font-bold leading-4 text-sage-deep shadow-sm">
        {state}
      </span>
      <span className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate rounded-full bg-cream/95 px-2 py-0.5 text-[0.68rem] font-bold leading-4 text-sage-deep shadow-sm">
        {placeLabel ? `${placeLabel} area` : regionLabel ?? state}
      </span>
    </div>
  );
}

function getTextAnchor(x: number) {
  if (x > 74) return "end";
  if (x < 26) return "start";
  return "middle";
}

function buildRoutePath(origin: DotPosition, places: NearbyPlace[]) {
  if (places.length === 0) return "";
  const points = [origin, ...places.slice(0, 3)];
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}
