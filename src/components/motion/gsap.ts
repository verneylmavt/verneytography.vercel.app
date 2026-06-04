"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

/**
 * Idempotently registers GSAP plugins + project defaults.
 * Safe to call from any client effect; only runs in the browser.
 */
export function ensureGsap() {
  if (!registered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    gsap.defaults({ ease: "expo.out", duration: 0.9 });
    registered = true;
  }
  return gsap;
}

export { gsap, ScrollTrigger };
