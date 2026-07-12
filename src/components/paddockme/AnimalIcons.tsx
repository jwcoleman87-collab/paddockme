import {
  PawPrint,
  Truck,
  Wheat,
  type LucideProps,
} from "lucide-react";

/**
 * Central livestock and role icon mapping.
 *
 * PaddockME uses Lucide exclusively for operational interface icons. Labels
 * carry the exact species meaning; the icon provides a familiar category
 * cue without introducing novelty silhouettes or a second drawing style.
 */
export function CattleIcon(props: LucideProps) {
  return <PawPrint aria-hidden="true" {...props} />;
}

export function SheepIcon(props: LucideProps) {
  return <PawPrint aria-hidden="true" {...props} />;
}

export function HorseIcon(props: LucideProps) {
  return <PawPrint aria-hidden="true" {...props} />;
}

export function WheatIcon(props: LucideProps) {
  return <Wheat aria-hidden="true" {...props} />;
}

export function TransportTruckIcon(props: LucideProps) {
  return <Truck aria-hidden="true" {...props} />;
}
