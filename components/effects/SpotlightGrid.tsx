"use client";

import { useRef, useCallback } from "react";

interface SpotlightGridProps {
  children: React.ReactNode;
  className?: string;
}

export function SpotlightGrid({ children, className }: SpotlightGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    containerRef.current.style.setProperty(
      "--mouse-x",
      `${e.clientX - rect.left}px`
    );
    containerRef.current.style.setProperty(
      "--mouse-y",
      `${e.clientY - rect.top}px`
    );
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`spotlight-grid ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
