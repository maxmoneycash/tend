'use client';

/**
 * MoneyRain — Falling dollar bills canvas animation.
 *
 * USAGE:
 *
 *   import MoneyRain from '@/components/effects/MoneyRain';
 *   import type { MoneyRainHandle } from '@/components/effects/MoneyRain';
 *
 *   // 1. Basic — auto-starts, fills viewport, orange background
 *   <MoneyRain />
 *
 *   // 2. Customize colors / speed / density
 *   <MoneyRain bgColor="#000" size={0.08} maxBills={80} spawnInterval={100} zIndex={0} />
 *
 *   // 3. As a background layer behind other content
 *   <div className="relative min-h-screen">
 *     <MoneyRain bgColor="transparent" zIndex={0} />
 *     <div className="relative z-10">...your content...</div>
 *   </div>
 *
 *   // 4. Imperative control (explode / stop / restart)
 *   const moneyRef = useRef<MoneyRainHandle>(null);
 *   <MoneyRain ref={moneyRef} />
 *   <button onClick={() => moneyRef.current?.explode()}>Explode</button>
 *   <button onClick={() => moneyRef.current?.restart()}>Restart</button>
 *   <button onClick={() => moneyRef.current?.stop()}>Stop</button>
 *
 * ASSETS REQUIRED:
 *   Copy public/assets/img/m1.png – m8.png into your public folder.
 *   Or pass your own images via the billImages prop.
 */

import { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';

const BILL_ASPECT = 150 / 105;

interface Bill {
  id: number;
  x: number;
  y: number;
  rotation: number;
  rotationSpeed: number;
  imageIndex: number;
  initialY: number;
  duration: number;
  elapsed: number;
  drift: number;
  explodePhase?: number;
  explodeStartTime?: number;
  explodeStartY?: number;
  explodeUpY?: number;
  explodeTargetY?: number;
  explodeTargetX?: number;
  explodeTargetRotation?: number;
}

export interface MoneyRainHandle {
  start: () => void;
  stop: () => void;
  explode: () => void;
  restart: () => void;
}

export interface MoneyRainProps {
  /** Array of bill image URLs. Defaults to /assets/img/m1.png – m8.png */
  billImages?: string[];
  /** Bill size as fraction of viewport width. Default 0.105 (desktop) */
  size?: number;
  /** Mobile bill size. Default 0.3 */
  mobileSize?: number;
  /** Mobile breakpoint in px. Default 768 */
  mobileBreakpoint?: number;
  /** Ms between spawns. Default 50 */
  spawnInterval?: number;
  /** Min fall duration in seconds. Default 4 */
  minDuration?: number;
  /** Max fall duration in seconds. Default 5 */
  maxDuration?: number;
  /** Max concurrent bills. Default 120 */
  maxBills?: number;
  /** Rotation range [min, max] in degrees. Default [-180, 220] */
  rotationRange?: [number, number];
  /** Horizontal drift range [min, max] in px. Default [-20, 20] */
  horizontalDrift?: [number, number];
  /** CSS z-index. Default 10 */
  zIndex?: number;
  /** Background color. Default '#FD4912' */
  bgColor?: string;
  /** Extra className for the canvas */
  className?: string;
}

const MoneyRain = forwardRef<MoneyRainHandle, MoneyRainProps>(
  (
    {
      billImages = [
        '/assets/img/m1.png', '/assets/img/m2.png', '/assets/img/m3.png', '/assets/img/m4.png',
        '/assets/img/m5.png', '/assets/img/m6.png', '/assets/img/m7.png', '/assets/img/m8.png',
      ],
      size = 0.105,
      mobileSize = 0.3,
      mobileBreakpoint = 768,
      spawnInterval = 50,
      minDuration = 4,
      maxDuration = 5,
      maxBills = 120,
      rotationRange = [-180, 220],
      horizontalDrift = [-20, 20],
      zIndex = 10,
      bgColor = '#FD4912',
      className,
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const billsRef = useRef<Bill[]>([]);
    const imagesRef = useRef<HTMLImageElement[]>([]);
    const frameRef = useRef<number | null>(null);
    const spawnRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const lastTimeRef = useRef(0);
    const idCounter = useRef(0);
    const sizeRef = useRef(size);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [active, setActive] = useState(false);

    // Responsive size
    useEffect(() => {
      const update = () => {
        sizeRef.current = window.innerWidth < mobileBreakpoint ? mobileSize : size;
      };
      update();
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }, [size, mobileSize, mobileBreakpoint]);

    // Load images
    useEffect(() => {
      Promise.all(
        billImages.map(
          (src) =>
            new Promise<HTMLImageElement>((resolve) => {
              const img = new window.Image();
              img.onload = () => resolve(img);
              img.onerror = () => resolve(img);
              img.src = src;
            })
        )
      ).then((imgs) => {
        imagesRef.current = imgs;
        setImagesLoaded(true);
      });
    }, [billImages]);

    // Canvas sizing
    useEffect(() => {
      const resize = () => {
        const c = canvasRef.current;
        if (!c) return;
        const dpr = window.devicePixelRatio || 1;
        const w = window.innerWidth;
        const h = window.innerHeight;
        c.width = w * dpr;
        c.height = h * dpr;
        c.style.width = `${w}px`;
        c.style.height = `${h}px`;
        const ctx = c.getContext('2d');
        if (ctx) {
          ctx.scale(dpr, dpr);
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
        }
      };
      resize();
      window.addEventListener('resize', resize);
      return () => window.removeEventListener('resize', resize);
    }, []);

    const getBillSize = useCallback(() => {
      const w = window.innerWidth * sizeRef.current;
      return { width: w, height: w / BILL_ASPECT };
    }, []);

    // Spawn
    const spawnBill = useCallback(() => {
      if (billsRef.current.length >= maxBills) return;
      const { height } = getBillSize();
      const dur = minDuration + Math.random() * (maxDuration - minDuration);
      const rot = rotationRange[0] + Math.random() * (rotationRange[1] - rotationRange[0]);
      const dr = horizontalDrift[0] + Math.random() * (horizontalDrift[1] - horizontalDrift[0]);
      const initialY = -height - 200 * Math.random();
      idCounter.current++;
      billsRef.current.push({
        id: idCounter.current,
        x: Math.random() * window.innerWidth,
        y: initialY,
        rotation: 0,
        rotationSpeed: rot / dur,
        imageIndex: Math.floor(Math.random() * imagesRef.current.length),
        initialY,
        duration: dur,
        elapsed: 0,
        drift: dr,
      });
    }, [getBillSize, maxBills, minDuration, maxDuration, rotationRange, horizontalDrift]);

    // Update
    const updateBills = useCallback((dt: number, now: number) => {
      const fallTarget = window.innerHeight + 500;
      billsRef.current = billsRef.current.filter((b) => {
        b.elapsed += dt;
        if (b.explodePhase) {
          const el = (now - (b.explodeStartTime || 0)) / 1000;
          if (b.explodePhase === 1) {
            if (el < 0.6) {
              const t = el / 0.6;
              const ease = t * (2 - t);
              b.y = (b.explodeStartY || 0) + ((b.explodeUpY || 0) - (b.explodeStartY || 0)) * ease;
              b.rotation = ((b.explodeTargetRotation || 0) / 2) * ease;
            } else {
              b.explodePhase = 2;
              b.explodeStartY = b.y;
              b.explodeStartTime = now;
            }
          } else if (b.explodePhase === 2 && el < 0.8) {
            const t = el / 0.8;
            const ease = t * t;
            b.y = (b.explodeStartY || 0) + ((b.explodeTargetY || 0) - (b.explodeStartY || 0)) * ease;
            b.x += ((b.explodeTargetX || 0) - b.x) * ease * dt;
            b.rotation =
              ((b.explodeTargetRotation || 0) / 2) + ((b.explodeTargetRotation || 0) / 2) * ease;
          }
        } else {
          const p = Math.min(b.elapsed / b.duration, 1);
          b.y = b.initialY + (fallTarget - b.initialY) * p;
          b.x += (b.drift / b.duration) * dt;
          b.rotation += b.rotationSpeed * dt;
        }
        return b.y < window.innerHeight + 200;
      });
    }, []);

    // Render
    const renderBills = useCallback(
      (ctx: CanvasRenderingContext2D) => {
        const { width, height } = getBillSize();
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        billsRef.current.forEach((b) => {
          const img = imagesRef.current[b.imageIndex];
          if (!img?.complete) return;
          ctx.save();
          ctx.translate(b.x, b.y);
          ctx.rotate((b.rotation * Math.PI) / 180);
          ctx.drawImage(img, -width / 2, -height / 2, width, height);
          ctx.restore();
        });
      },
      [getBillSize]
    );

    // Animation loop
    useEffect(() => {
      if (!active) return;
      const loop = (time: number) => {
        const dt = lastTimeRef.current ? (time - lastTimeRef.current) / 1000 : 0;
        lastTimeRef.current = time;
        updateBills(dt, time);
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) renderBills(ctx);
        frameRef.current = requestAnimationFrame(loop);
      };
      frameRef.current = requestAnimationFrame(loop);
      return () => {
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
      };
    }, [active, updateBills, renderBills]);

    // Auto-start when images ready
    useEffect(() => {
      if (!imagesLoaded) return;
      setActive(true);
      lastTimeRef.current = 0;
      spawnRef.current = setInterval(spawnBill, spawnInterval);
      return () => {
        if (spawnRef.current) clearInterval(spawnRef.current);
      };
    }, [imagesLoaded, spawnBill, spawnInterval]);

    // ── Imperative API ──

    const stop = useCallback(() => {
      setActive(false);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (spawnRef.current) clearInterval(spawnRef.current);
      billsRef.current = [];
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }, []);

    const explode = useCallback(() => {
      if (spawnRef.current) {
        clearInterval(spawnRef.current);
        spawnRef.current = null;
      }
      const now = performance.now();
      billsRef.current.forEach((b) => {
        b.explodePhase = 1;
        b.explodeStartTime = now;
        b.explodeStartY = b.y;
        b.explodeUpY = b.y + (-300 + -300 * Math.random());
        b.explodeTargetY = 0.85 * window.innerHeight + Math.random() * (0.15 * window.innerHeight);
        b.explodeTargetX = b.x + (-150 + 300 * Math.random());
        b.explodeTargetRotation = -720 + 1440 * Math.random();
      });
    }, []);

    const restart = useCallback(() => {
      billsRef.current.forEach((b) => {
        const dur = minDuration + Math.random() * (maxDuration - minDuration);
        const rot = rotationRange[0] + Math.random() * (rotationRange[1] - rotationRange[0]);
        const dr = horizontalDrift[0] + Math.random() * (horizontalDrift[1] - horizontalDrift[0]);
        Object.assign(b, {
          explodePhase: 0, explodeStartTime: undefined, explodeStartY: undefined,
          explodeUpY: undefined, explodeTargetY: undefined, explodeTargetX: undefined,
          explodeTargetRotation: undefined, initialY: b.y, duration: dur, elapsed: 0,
          drift: dr, rotationSpeed: rot / dur,
        });
      });
      if (!spawnRef.current) spawnRef.current = setInterval(spawnBill, spawnInterval);
      setActive(true);
    }, [spawnBill, spawnInterval, minDuration, maxDuration, rotationRange, horizontalDrift]);

    const start = useCallback(() => {
      if (!imagesLoaded || active) return;
      setActive(true);
      lastTimeRef.current = 0;
      spawnRef.current = setInterval(spawnBill, spawnInterval);
    }, [imagesLoaded, active, spawnBill, spawnInterval]);

    useImperativeHandle(ref, () => ({ start, stop, explode, restart }), [start, stop, explode, restart]);

    return (
      <canvas
        ref={canvasRef}
        className={className}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex,
          backgroundColor: bgColor,
        }}
      />
    );
  }
);

MoneyRain.displayName = 'MoneyRain';
export default MoneyRain;
