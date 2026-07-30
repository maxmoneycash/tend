"use client";

import { useRef, useEffect } from "react";
import type { BotSignal } from "@/lib/rewards-types";

const KEYS = [
  "view_velocity",
  "engagement_ratio",
  "account_age",
  "view_follower_ratio",
  "share_ratio",
];
const LABELS = ["Velocity", "Engagement", "Acct Age", "View/Follow", "Shares"];

export function BotRadar({ signals }: { signals: Record<string, BotSignal> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 200;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + "px";
    canvas.style.height = size + "px";
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const r = 70;
    const n = 5;

    ctx.clearRect(0, 0, size, size);

    // Grid rings
    for (let ring = 1; ring <= 4; ring++) {
      const rr = (r * ring) / 4;
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        const x = cx + rr * Math.cos(angle);
        const y = cy + rr * Math.sin(angle);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Spokes
    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Data polygon
    ctx.beginPath();
    KEYS.forEach((key, i) => {
      const val = signals[key].score / 100;
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const x = cx + r * val * Math.cos(angle);
      const y = cy + r * val * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = "rgba(139,92,246,0.15)";
    ctx.fill();
    ctx.strokeStyle = "#FA4616";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Data points
    KEYS.forEach((key, i) => {
      const val = signals[key].score / 100;
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const x = cx + r * val * Math.cos(angle);
      const y = cy + r * val * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = signals[key].flag ? "#FA4616" : "#FA4616";
      ctx.fill();
    });

    // Threshold ring at 85%
    const tr = r * 0.85;
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      i === 0
        ? ctx.moveTo(cx + tr * Math.cos(angle), cy + tr * Math.sin(angle))
        : ctx.lineTo(cx + tr * Math.cos(angle), cy + tr * Math.sin(angle));
    }
    ctx.strokeStyle = "rgba(248,113,113,0.3)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Labels
    ctx.font = "500 9px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    LABELS.forEach((label, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const lx = cx + (r + 18) * Math.cos(angle);
      const ly = cy + (r + 18) * Math.sin(angle);
      ctx.fillStyle = signals[KEYS[i]].flag
        ? "#FA4616"
        : "rgba(255,255,255,0.35)";
      ctx.fillText(label, lx, ly);
    });
  }, [signals]);

  return <canvas ref={canvasRef} className="block mx-auto" />;
}
