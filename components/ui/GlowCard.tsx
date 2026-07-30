"use client";

import { useRef, useCallback, type ReactNode } from "react";

export function GlowCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current || !glowRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    glowRef.current.style.setProperty("--glow-x", `${e.clientX - rect.left}px`);
    glowRef.current.style.setProperty("--glow-y", `${e.clientY - rect.top}px`);
  }, []);

  return (
    <div ref={cardRef} onMouseMove={handleMouseMove} className={`relative group ${className}`}>
      <div
        ref={glowRef}
        className="absolute -inset-px rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(200px circle at var(--glow-x, 50%) var(--glow-y, 50%), rgba(249,115,22,0.8), transparent 70%)",
        }}
      />
      <div className="relative rounded-xl border border-[var(--card-border)] bg-[var(--background)] overflow-hidden group-hover:border-transparent transition-[border-color] duration-500">
        {children}
      </div>
    </div>
  );
}
