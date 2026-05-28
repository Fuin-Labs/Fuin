"use client";

import { useEffect } from "react";
import Lenis from "lenis";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export function LenisProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  useEffect(() => {
    // Honor reduced-motion: native scroll only, no smooth interpolation.
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });
    window.__lenis = lenis;

    let raf: number;
    const tick = (time: number): void => {
      lenis.raf(time);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // If the user toggles reduced-motion mid-session, tear down.
    const onChange = (e: MediaQueryListEvent): void => {
      if (e.matches) {
        cancelAnimationFrame(raf);
        lenis.destroy();
        delete window.__lenis;
      }
    };
    mq.addEventListener("change", onChange);

    return () => {
      mq.removeEventListener("change", onChange);
      cancelAnimationFrame(raf);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  return <>{children}</>;
}
