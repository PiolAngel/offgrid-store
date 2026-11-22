"use client";

import { useState } from "react";

interface ItemImageProps {
  src?: string;
  fallbackSrc?: string;
  alt: string;
}

export default function ItemImage({
  src,
  fallbackSrc,
  alt,
}: ItemImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc || "");
  const [failed, setFailed] = useState(false);

  if (!currentSrc || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center text-xs tracking-widest text-[#77716a]">
        OFFGRID
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className="h-full w-full object-cover"
      onError={() => {
        if (fallbackSrc && currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        } else {
          setFailed(true);
        }
      }}
    />
  );
}