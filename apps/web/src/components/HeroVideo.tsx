'use client';

import { useEffect, useState } from 'react';

/**
 * Background hero video, mounted only after hydration so the heavy media file
 * never blocks the initial page load / `load` event. Until then a CSS gradient
 * (rendered by the parent) stands in.
 */
export function HeroVideo() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
  }, []);

  if (!show) return null;

  return (
    <video
      className="absolute inset-0 -z-10 h-full w-full object-cover opacity-90"
      src="/media/hero.mp4"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden
    />
  );
}
