"use client";

import { useEffect } from "react";

/**
 * Scroll-reveal engine, adapted from the huehaus-clean Shell in
 * ~/website-cloner: content ships fully visible; only when JS runs AND the
 * user allows motion does <html> get `.motion`, arming the CSS transitions.
 * IntersectionObserver then flips `.is-in` per element.
 */
export function RevealManager() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    root.classList.add("motion");

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));

    return () => {
      io.disconnect();
      root.classList.remove("motion");
    };
  }, []);

  return null;
}
