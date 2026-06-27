"use client";

import Image from "next/image";

// Overlays a drink's real photo on top of the monogram tile/artwork using
// next/image (automatic resize/optimization + lazy loading). The parent must
// be `position: relative` with `overflow: hidden`. If the image fails to load
// it hides itself, revealing the monogram fallback underneath.
//
// `sizes` should reflect the rendered box so next/image fetches a right-sized
// file — tiny for card tiles, larger for the detail artwork.
export default function DrinkImage({
  src,
  alt,
  sizes = "64px",
}: {
  src: string | null;
  alt: string;
  sizes?: string;
}) {
  if (!src) return null;
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
      style={{ objectFit: "cover" }}
    />
  );
}
