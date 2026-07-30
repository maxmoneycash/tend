"use client";

import { useEffect, useRef, useCallback } from "react";
import { useInViewport } from "@/hooks/useInViewport";
import { usePageVisible } from "@/hooks/usePageVisible";

/* ═══════════════════════════════════════════════════════════════
   PayoutGlobe — Canvas 2D projected globe with animated payout pulses
   Hero visual for the data explorer showing content rewards
   flowing to creators around the world.
   ═══════════════════════════════════════════════════════════════ */

/* ── Data ──────────────────────────────────────────────────────── */

interface PayoutEvent {
  lat: number;
  lng: number;
  amount: number;
  creator: string;
  city: string;
  type: "payout" | "submission";
}

const PAYOUT_EVENTS: PayoutEvent[] = [
  { lat: 40.7, lng: -74.0, amount: 333.93, creator: "0x943d...", city: "New York", type: "payout" },
  { lat: 34.0, lng: -118.2, amount: 291.05, creator: "0x7bbc...", city: "Los Angeles", type: "payout" },
  { lat: 51.5, lng: -0.1, amount: 86.93, creator: "0x196f...", city: "London", type: "payout" },
  { lat: 35.7, lng: 139.7, amount: 28.18, creator: "0xa4c1...", city: "Tokyo", type: "submission" },
  { lat: -33.9, lng: 151.2, amount: 5.58, creator: "0x3a91...", city: "Sydney", type: "payout" },
  { lat: 48.9, lng: 2.35, amount: 0.91, creator: "0x7f2e...", city: "Paris", type: "submission" },
  { lat: 19.4, lng: -99.1, amount: 2.82, creator: "0x5b27...", city: "Mexico City", type: "payout" },
];

/* Campaign source — arcs originate from here */
const SOURCE: [number, number] = [37.4, -122.1]; // Palo Alto

/* ── Floating stat badges ──────────────────────────────────────── */

interface StatBadge {
  label: string;
  value: string;
  angle: number; // starting orbital angle in radians
  distance: number; // distance from center as fraction of radius
}

const STAT_BADGES: StatBadge[] = [
  { label: "payouts", value: "24", angle: -0.8, distance: 1.38 },
  { label: "countries", value: "7", angle: 2.5, distance: 1.42 },
  { label: "avg", value: "3.8s", angle: -2.2, distance: 1.35 },
  { label: "views", value: "2.07M", angle: 0.7, distance: 1.4 },
];

/* ── Pulse state ───────────────────────────────────────────────── */

interface Pulse {
  event: PayoutEvent;
  startTime: number;
  duration: number; // ms
  x: number;
  y: number;
}

/* ── Arc state ─────────────────────────────────────────────────── */

interface Arc {
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
  startTime: number;
  duration: number;
  dashOffset: number;
}

/* ── Helper: degrees to radians ────────────────────────────────── */

const DEG = Math.PI / 180;

/* ── Helper: lat/lng to 2D projection on an orthographic globe ── */

function project(
  lat: number,
  lng: number,
  rotation: number,
  cx: number,
  cy: number,
  r: number,
): { x: number; y: number; visible: boolean } {
  const latR = lat * DEG;
  const lngR = (lng - rotation) * DEG;
  const cosLat = Math.cos(latR);
  const sinLat = Math.sin(latR);
  const cosLng = Math.cos(lngR);
  const sinLng = Math.sin(lngR);

  return {
    x: cx + r * cosLat * sinLng,
    y: cy - r * sinLat,
    visible: cosLat * cosLng > 0,
  };
}

/* ── Helper: draw a great-circle arc between two points ─────── */

function projectArc(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
  rotation: number,
  cx: number,
  cy: number,
  r: number,
  steps: number,
): { x: number; y: number; visible: boolean }[] {
  const points: { x: number; y: number; visible: boolean }[] = [];
  const lat1 = fromLat * DEG;
  const lng1 = fromLng * DEG;
  const lat2 = toLat * DEG;
  const lng2 = toLng * DEG;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Spherical linear interpolation (slerp)
    const d = Math.acos(
      Math.sin(lat1) * Math.sin(lat2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1),
    );
    const sd = Math.sin(d) || 1e-10;
    const A = Math.sin((1 - t) * d) / sd;
    const B = Math.sin(t * d) / sd;

    const x3d = A * Math.cos(lat1) * Math.cos(lng1) + B * Math.cos(lat2) * Math.cos(lng2);
    const y3d = A * Math.cos(lat1) * Math.sin(lng1) + B * Math.cos(lat2) * Math.sin(lng2);
    const z3d = A * Math.sin(lat1) + B * Math.sin(lat2);

    const lat = Math.atan2(z3d, Math.sqrt(x3d * x3d + y3d * y3d));
    const lng = Math.atan2(y3d, x3d);

    // Add arc height (lift off globe surface)
    const arcLift = 1 + 0.12 * Math.sin(t * Math.PI);

    const rotR = rotation * DEG;
    const cosLat = Math.cos(lat);
    const sinLat = Math.sin(lat);
    const cosLng = Math.cos(lng - rotR);
    const sinLng = Math.sin(lng - rotR);

    points.push({
      x: cx + r * arcLift * cosLat * sinLng,
      y: cy - r * arcLift * sinLat,
      visible: cosLat * cosLng > 0,
    });
  }

  return points;
}

/* ── Main component ────────────────────────────────────────────── */

export function PayoutGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const stateRef = useRef({
    rotation: 0,
    pulses: [] as Pulse[],
    arcs: [] as Arc[],
    nextPulseIndex: 0,
    lastPulseTime: 0,
    totalDistributed: 0,
    distributedTarget: 789.59,
    distributedCurrent: 0,
  });

  const isInViewport = useInViewport(containerRef, { threshold: 0.15 });
  const isPageVisible = usePageVisible();
  const isActive = isInViewport && isPageVisible;

  /* ── Draw the globe wireframe (latitude / longitude lines) ──── */
  const drawGlobe = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      r: number,
      rotation: number,
    ) => {
      // Ambient glow behind globe
      const glowGrad = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 1.5);
      glowGrad.addColorStop(0, "rgba(59, 130, 246, 0.07)");
      glowGrad.addColorStop(0.5, "rgba(59, 130, 246, 0.03)");
      glowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(cx - r * 1.5, cy - r * 1.5, r * 3, r * 3);

      // Globe fill
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(59, 130, 246, 0.05)";
      ctx.fill();

      // Outer rim glow
      const rimGrad = ctx.createRadialGradient(cx, cy, r * 0.92, cx, cy, r * 1.02);
      rimGrad.addColorStop(0, "transparent");
      rimGrad.addColorStop(0.5, "rgba(59, 130, 246, 0.12)");
      rimGrad.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = rimGrad;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Globe outline
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(59, 130, 246, 0.2)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Save clip
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();

      // Latitude lines
      ctx.strokeStyle = "rgba(59, 130, 246, 0.1)";
      ctx.lineWidth = 0.5;
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        const latR = lat * DEG;
        const cosLat = Math.cos(latR);
        const sinLat = Math.sin(latR);
        const y = cy - r * sinLat;
        const localR = r * cosLat;
        // Draw ellipse for latitude line
        if (localR > 0) {
          ctx.beginPath();
          ctx.ellipse(cx, y, localR, localR * 0.08 + 0.5, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Longitude lines (curved as seen on orthographic projection)
      ctx.strokeStyle = "rgba(59, 130, 246, 0.08)";
      ctx.lineWidth = 0.5;
      for (let lng = -180; lng < 180; lng += 30) {
        ctx.beginPath();
        let started = false;
        for (let lat = -90; lat <= 90; lat += 2) {
          const p = project(lat, lng, rotation, cx, cy, r);
          if (p.visible) {
            if (!started) {
              ctx.moveTo(p.x, p.y);
              started = true;
            } else {
              ctx.lineTo(p.x, p.y);
            }
          } else {
            started = false;
          }
        }
        ctx.stroke();
      }

      // Latitude lines (proper curved lines)
      ctx.strokeStyle = "rgba(59, 130, 246, 0.08)";
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        let started = false;
        for (let lng = -180; lng < 180; lng += 2) {
          const p = project(lat, lng, rotation, cx, cy, r);
          if (p.visible) {
            if (!started) {
              ctx.moveTo(p.x, p.y);
              started = true;
            } else {
              ctx.lineTo(p.x, p.y);
            }
          } else {
            started = false;
          }
        }
        ctx.stroke();
      }

      ctx.restore();
    },
    [],
  );

  /* ── Draw connection arcs ───────────────────────────────────── */
  const drawArcs = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      r: number,
      rotation: number,
      now: number,
    ) => {
      const state = stateRef.current;
      state.arcs = state.arcs.filter((arc) => now - arc.startTime < arc.duration);

      for (const arc of state.arcs) {
        const elapsed = now - arc.startTime;
        const progress = elapsed / arc.duration;
        const alpha = progress < 0.2
          ? progress / 0.2
          : progress > 0.7
            ? 1 - (progress - 0.7) / 0.3
            : 1;

        const points = projectArc(
          arc.fromLat,
          arc.fromLng,
          arc.toLat,
          arc.toLng,
          rotation,
          cx,
          cy,
          r,
          40,
        );

        // Draw with animated dash pattern
        ctx.save();
        ctx.strokeStyle = `rgba(59, 130, 246, ${0.25 * alpha})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.lineDashOffset = -(now * 0.03 + arc.dashOffset);

        ctx.beginPath();
        let started = false;
        for (const pt of points) {
          if (pt.visible) {
            if (!started) {
              ctx.moveTo(pt.x, pt.y);
              started = true;
            } else {
              ctx.lineTo(pt.x, pt.y);
            }
          } else {
            started = false;
          }
        }
        ctx.stroke();

        // Draw a traveling bright dot along the arc
        const dotIndex = Math.floor(progress * points.length);
        if (dotIndex < points.length && points[dotIndex].visible) {
          const dp = points[dotIndex];
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.arc(dp.x, dp.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(96, 165, 250, ${0.8 * alpha})`;
          ctx.shadowColor = "rgba(96, 165, 250, 0.6)";
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        ctx.setLineDash([]);
        ctx.restore();
      }
    },
    [],
  );

  /* ── Draw payout pulse rings ─────────────────────────────────── */
  const drawPulses = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      r: number,
      rotation: number,
      now: number,
    ) => {
      const state = stateRef.current;
      state.pulses = state.pulses.filter((p) => now - p.startTime < p.duration);

      for (const pulse of state.pulses) {
        const p = project(pulse.event.lat, pulse.event.lng, rotation, cx, cy, r);
        if (!p.visible) continue;

        const elapsed = now - pulse.startTime;
        const t = elapsed / pulse.duration;
        const color =
          pulse.event.type === "payout"
            ? { r: 34, g: 197, b: 94 }   // green #22c55e
            : { r: 249, g: 115, b: 22 }; // orange #f97316

        // Core bright dot (fades out over first half)
        const dotAlpha = t < 0.5 ? 1 - t * 1.2 : Math.max(0, 0.4 - (t - 0.5) * 0.8);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 * (1 - t * 0.3), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${dotAlpha})`;
        ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${dotAlpha * 0.6})`;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Expanding concentric rings (3 rings, staggered)
        for (let ring = 0; ring < 3; ring++) {
          const ringDelay = ring * 0.15;
          const ringT = Math.max(0, t - ringDelay);
          if (ringT <= 0 || ringT >= 1) continue;

          const ringRadius = ringT * r * 0.18 * (1 + ring * 0.3);
          const ringAlpha = (1 - ringT) * (0.5 - ring * 0.12);

          if (ringAlpha <= 0) continue;

          ctx.beginPath();
          ctx.arc(p.x, p.y, ringRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${ringAlpha})`;
          ctx.lineWidth = 1.5 - ring * 0.3;
          ctx.stroke();
        }

        // Label: "$333.93 -> New York"
        const labelAlpha = t < 0.15 ? t / 0.15 : t > 0.65 ? 1 - (t - 0.65) / 0.35 : 1;
        if (labelAlpha > 0.05) {
          const labelX = p.x + 12;
          const labelY = p.y - 10;

          // Background pill
          const text = `$${pulse.event.amount.toFixed(2)}`;
          const cityText = pulse.event.city;
          ctx.font = "600 10px 'Geist Mono', monospace";
          const textWidth = ctx.measureText(text + "  " + cityText).width;

          ctx.fillStyle = `rgba(0, 0, 0, ${0.7 * labelAlpha})`;
          const pillW = textWidth + 18;
          const pillH = 20;
          const pillX = labelX - 4;
          const pillY = labelY - 13;
          ctx.beginPath();
          ctx.roundRect(pillX, pillY, pillW, pillH, 4);
          ctx.fill();

          // Border
          ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${0.3 * labelAlpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();

          // Amount text
          ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${labelAlpha})`;
          ctx.fillText(text, labelX, labelY);

          // Arrow + city
          ctx.fillStyle = `rgba(255, 255, 255, ${0.5 * labelAlpha})`;
          const arrowX = labelX + ctx.measureText(text).width + 4;
          ctx.fillText("\u2192 " + cityText, arrowX, labelY);
        }
      }
    },
    [],
  );

  /* ── Draw floating stat badges ──────────────────────────────── */
  const drawBadges = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      r: number,
      now: number,
    ) => {
      const orbitSpeed = 0.0001; // radians per ms

      for (const badge of STAT_BADGES) {
        const angle = badge.angle + now * orbitSpeed;
        const floatY = Math.sin(now * 0.002 + badge.angle * 2) * 4;
        const bx = cx + Math.cos(angle) * r * badge.distance;
        const by = cy + Math.sin(angle) * r * badge.distance + floatY;

        // No card background -- just floating text with text shadow for readability

        // Value
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
        ctx.shadowBlur = 8;
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.font = "700 14px 'Geist Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillText(badge.value, bx, by - 1);

        // Label
        ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        ctx.font = "500 9px 'Space Grotesk', system-ui, sans-serif";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ctxBadge = ctx as any;
        if ("letterSpacing" in ctx) ctxBadge.letterSpacing = "0.06em";
        ctx.fillText(badge.label.toUpperCase(), bx, by + 12);
        if ("letterSpacing" in ctx) ctxBadge.letterSpacing = "0px";
        ctx.restore();
      }
      ctx.textAlign = "start";
    },
    [],
  );

  /* ── Draw title and total counter ───────────────────────────── */
  const drawOverlays = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      r: number,
      _now: number,
    ) => {
      const state = stateRef.current;

      // Smoothly animate the counter towards target
      state.distributedCurrent +=
        (state.distributedTarget - state.distributedCurrent) * 0.02;

      // Title - top — minimal, just text, no container
      ctx.textAlign = "center";
      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
      ctx.shadowBlur = 6;
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.font = "600 13px 'Space Grotesk', system-ui, sans-serif";
      // Use letterSpacing if supported (modern browsers)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ctxAny = ctx as any;
      if ("letterSpacing" in ctx) ctxAny.letterSpacing = "0.1em";
      ctx.fillText("CONTENT REWARDS", cx, cy - r - 36);
      if ("letterSpacing" in ctx) ctxAny.letterSpacing = "0px";

      // Subtitle
      ctx.fillStyle = "rgba(59, 130, 246, 0.5)";
      ctx.font = "500 11px 'Space Grotesk', system-ui, sans-serif";
      ctx.fillText("Global Distribution", cx, cy - r - 20);
      ctx.restore();

      // Total distributed - bottom — no card background, just text with shadow
      const totalText = `$${state.distributedCurrent.toFixed(2)} USDT`;

      ctx.font = "700 22px 'Space Grotesk', system-ui, sans-serif";
      const totalY = cy + r + 24;

      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = 10;

      // "Total distributed:" label
      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      ctx.font = "500 9px 'Space Grotesk', system-ui, sans-serif";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ctxTotal = ctx as any;
      if ("letterSpacing" in ctx) ctxTotal.letterSpacing = "0.06em";
      ctx.fillText("TOTAL DISTRIBUTED", cx, totalY);
      if ("letterSpacing" in ctx) ctxTotal.letterSpacing = "0px";

      // Amount — large, Space Grotesk, tracking-tight
      ctx.fillStyle = "rgba(34, 197, 94, 0.9)";
      ctx.font = "700 22px 'Space Grotesk', system-ui, sans-serif";
      if ("letterSpacing" in ctx) ctxTotal.letterSpacing = "-0.02em";
      ctx.fillText(totalText, cx, totalY + 20);
      if ("letterSpacing" in ctx) ctxTotal.letterSpacing = "0px";

      ctx.restore();
      ctx.textAlign = "start";
    },
    [],
  );

  /* ── Subtle background star particles ────────────────────────── */
  const starPositions = useRef<{ x: number; y: number; size: number; speed: number }[]>([]);

  const drawStarfield = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, now: number) => {
      // Initialize stars once
      if (starPositions.current.length === 0) {
        for (let i = 0; i < 40; i++) {
          starPositions.current.push({
            x: Math.random() * w,
            y: Math.random() * h,
            size: 0.3 + Math.random() * 0.8,
            speed: 0.5 + Math.random() * 1.5,
          });
        }
      }

      for (const star of starPositions.current) {
        const twinkle = 0.15 + Math.sin(now * 0.002 * star.speed + star.x) * 0.1;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${twinkle})`;
        ctx.fill();
      }
    },
    [],
  );

  /* ── Main animation loop ─────────────────────────────────────── */
  const animate = useCallback(
    (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
      const state = stateRef.current;

      const draw = (now: number) => {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;

        // Resize canvas if needed
        if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
          canvas.width = w * dpr;
          canvas.height = h * dpr;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        // Globe parameters — responsive
        const cx = w / 2;
        const cy = h / 2;
        const r = Math.min(w, h) * 0.32;

        // Rotation: 1 revolution per 30 seconds = 360 / 30000 deg/ms = 0.012 deg/ms
        state.rotation = (now * 0.012) % 360;

        // Clear
        ctx.clearRect(0, 0, w, h);

        // Background
        ctx.fillStyle = "#050505";
        ctx.fillRect(0, 0, w, h);

        // Subtle star field / particle dots in the background (drawn first, behind globe)
        drawStarfield(ctx, w, h, now);

        // Subtle vignette
        const vignette = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, w * 0.8);
        vignette.addColorStop(0, "transparent");
        vignette.addColorStop(1, "rgba(0, 0, 0, 0.4)");
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, w, h);

        // Draw globe wireframe
        drawGlobe(ctx, cx, cy, r, state.rotation);

        // Spawn new pulse every 3-4 seconds
        const pulseInterval = 3000 + Math.sin(now * 0.001) * 500; // varies 2.5-3.5s
        if (now - state.lastPulseTime > pulseInterval) {
          const event = PAYOUT_EVENTS[state.nextPulseIndex % PAYOUT_EVENTS.length];
          const p = project(event.lat, event.lng, state.rotation, cx, cy, r);

          state.pulses.push({
            event,
            startTime: now,
            duration: 2500,
            x: p.x,
            y: p.y,
          });

          // Also create a connection arc from source
          state.arcs.push({
            fromLat: SOURCE[0],
            fromLng: SOURCE[1],
            toLat: event.lat,
            toLng: event.lng,
            startTime: now,
            duration: 3500,
            dashOffset: Math.random() * 100,
          });

          // Increment total
          state.distributedTarget =
            789.59 + (state.nextPulseIndex + 1) * 0.01 * Math.random();

          state.nextPulseIndex++;
          state.lastPulseTime = now;
        }

        // Draw arcs
        drawArcs(ctx, cx, cy, r, state.rotation, now);

        // Draw pulses
        drawPulses(ctx, cx, cy, r, state.rotation, now);

        // Draw floating stat badges
        drawBadges(ctx, cx, cy, r, now);

        // Draw title and counter overlays
        drawOverlays(ctx, cx, cy, r, now);

        rafRef.current = requestAnimationFrame(draw);
      };

      rafRef.current = requestAnimationFrame(draw);
    },
    [drawGlobe, drawArcs, drawPulses, drawBadges, drawOverlays, drawStarfield],
  );

  /* ── Canvas setup and lifecycle ──────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (isActive) {
      // Reset star positions on resize
      starPositions.current = [];
      animate(canvas, ctx);
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, [isActive, animate]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 800,
        margin: "0 auto",
        background: "transparent",
        overflow: "hidden",
      }}
    >
      {/* Canvas takes full area */}
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: 560,
        }}
      />

      {/* Scoped CSS for potential hover states */}
      <style>{`
        @keyframes payout-globe-fade-in {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
