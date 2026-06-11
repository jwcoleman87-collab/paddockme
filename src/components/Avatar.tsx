"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

const sizeClass: Record<AvatarSize, string> = {
  xs: "h-6 w-6 text-[0.6rem]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-lg",
};

const sizePx: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

type AvatarProps = {
  name: string;
  src?: string;
  size?: AvatarSize;
  className?: string;
  /** Visual ring around the avatar - useful for "currently selected" treatments. */
  ring?: boolean;
};

/**
 * Square-rounded avatar. Renders the supplied src when present; falls back to
 * the name's initials in a sage chip when src is missing or fails to load.
 *
 * Image errors are swallowed silently and the initials show instead - so a
 * missing an avatar image doesn't break the page.
 */
export function Avatar({
  name,
  src,
  size = "md",
  className,
  ring = false,
}: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const initials = computeInitials(name);
  const showImage = !!src && !failed;

  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-sage-deep/15 bg-sage-mist font-bold text-sage-deep",
        sizeClass[size],
        ring && "ring-2 ring-sage-deep/40",
        className
      )}
    >
      {showImage ? (
        <Image
          src={src}
          alt={name}
          width={sizePx[size]}
          height={sizePx[size]}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
          unoptimized
        />
      ) : (
        <span>{initials}</span>
      )}
    </span>
  );
}

function computeInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
