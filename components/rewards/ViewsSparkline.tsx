"use client";

import { useRef, useEffect } from "react";
import type { EvidenceReport } from "@/lib/rewards-types";
import { fmtViews } from "@/lib/rewards-mock";

export function ViewsSparkline({ evidence }: { evidence: EvidenceReport[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const views = evidence.map((e) => e.views);
  const max = Math.max(...views);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.parentElement?.offsetWidth || 300;
    const h = 48;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    if (views.length < 2) return;

    // Fill gradient
    ctx.beginPath();
    views.forEach((v, i) => {
      const x = (i / (views.length - 1)) * (w - 24) + 12;
      const y = h - 8 - (v / max) * (h - 16);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.lineTo((views.length - 1) / (views.length - 1) * (w - 24) + 12, h);
    ctx.lineTo(12, h);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "rgba(34,197,94,0.2)");
    grad.addColorStop(1, "rgba(34,197,94,0.02)");
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    views.forEach((v, i) => {
      const x = (i / (views.length - 1)) * (w - 24) + 12;
      const y = h - 8 - (v / max) * (h - 16);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.stroke();

    // Dots
    views.forEach((v, i) => {
      const x = (i / (views.length - 1)) * (w - 24) + 12;
      const y = h - 8 - (v / max) * (h - 16);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = i === views.length - 1 ? "#22c55e" : "#0f0f0f";
      ctx.fill();
      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }, [evidence, views, max]);

  if (evidence.length < 2) return null;

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="block w-full" />
      <div className="flex justify-between mt-1 font-mono text-[8px] text-zinc-600">
        {evidence.map((e, i) => (
          <span key={i}>{fmtViews(e.views)}</span>
        ))}
      </div>
    </div>
  );
}
