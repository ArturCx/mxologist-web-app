"use client";

import { useEffect, useState } from "react";

// True when the viewport is at or below `breakpoint` (default 640px). Starts
// `false` on the server and first client render (desktop-first) to avoid a
// hydration mismatch, then updates on mount and on resize.
export function useIsMobile(breakpoint = 640): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);

  return isMobile;
}
