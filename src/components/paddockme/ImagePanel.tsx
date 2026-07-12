import { cn } from "@/lib/utils";

/**
 * Decorative side image panel used in the request flow / review screens.
 * Hidden on mobile by default (decorative only — primary actions stay visible).
 */
export function ImagePanel({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cn("h-full w-full object-cover", className)}
    />
  );
}
