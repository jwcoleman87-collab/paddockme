import {
  CattleIcon,
  HorseIcon,
  SheepIcon,
} from "@/components/paddockme/AnimalIcons";

/** Pick the right livestock silhouette from a free-text stock description. */
export function AnimalIconFor({
  livestock,
  className,
}: {
  livestock: string;
  className?: string;
}) {
  const value = livestock.toLowerCase();
  if (/sheep|ewe|lamb|wether|merino/.test(value)) {
    return <SheepIcon className={className} />;
  }
  if (/horse|mare|gelding|stallion/.test(value)) {
    return <HorseIcon className={className} />;
  }
  return <CattleIcon className={className} />;
}
