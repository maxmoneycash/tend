'use client';

/**
 * CoinRain — Falling USDT / USDT0 coin canvas animation.
 *
 * USAGE:
 *
 *   import CoinRain from '@/components/effects/CoinRain';
 *   import type { CoinRainHandle } from '@/components/effects/CoinRain';
 *
 *   // 1. Basic — auto-starts, transparent background, falling coins
 *   <CoinRain />
 *
 *   // 2. With a dark background
 *   <CoinRain bgColor="#0a0a0a" />
 *
 *   // 3. As a background layer behind content
 *   <div className="relative min-h-screen">
 *     <CoinRain bgColor="transparent" zIndex={0} />
 *     <div className="relative z-10">...your content...</div>
 *   </div>
 *
 *   // 4. Imperative control
 *   const coinRef = useRef<CoinRainHandle>(null);
 *   <CoinRain ref={coinRef} />
 *   <button onClick={() => coinRef.current?.explode()}>Explode</button>
 *   <button onClick={() => coinRef.current?.restart()}>Restart</button>
 *   <button onClick={() => coinRef.current?.stop()}>Stop</button>
 *
 * ASSETS REQUIRED:
 *   public/assets/img/coin-usdt.png   (USDT green coin)
 *   public/assets/img/coin-usdt0.png  (USDT0 white coin)
 */

import { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';

// Coins are roughly square (with glow), not rectangular like bills
const COIN_ASPECT = 1.1;

interface Coin {
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

export interface CoinRainHandle {
  start: () => void;
  stop: () => void;
  explode: () => void;
  restart: () => void;
}

export interface CoinRainProps {
  /** Array of coin image URLs */
  coinImages?: string[];
  /** Coin size as fraction of viewport width. Default 0.09 */
  size?: number;
  /** Mobile coin size. Default 0.2 */
  mobileSize?: number;
  /** Mobile breakpoint in px. Default 768 */
  mobileBreakpoint?: number;
  /** Ms between spawns. Default 80 */
  spawnInterval?: number;
  /** Min fall duration in seconds. Default 5 */
  minDuration?: number;
  /** Max fall duration in seconds. Default 7 */
  maxDuration?: number;
  /** Max concurrent coins. Default 80 */
  maxCoins?: number;
  /** Rotation range [min, max] in degrees. Default [-120, 120] */
  rotationRange?: [number, number];
  /** Horizontal drift range [min, max] in px. Default [-30, 30] */
  horizontalDrift?: [number, number];
  /** CSS z-index. Default 10 */
  zIndex?: number;
  /** Background color. Default 'transparent' */
  bgColor?: string;
  /** Extra className for the canvas */
  className?: string;
}

const CoinRain = forwardRef<CoinRainHandle, CoinRainProps>(
  (
    {
      coinImages = ['/assets/img/coin-usdt.png', '/assets/img/coin-usdt0.png'],
      size = 0.09,
      mobileSize = 0.2,
      mobileBreakpoint = 768,
      spawnInterval = 80,
      minDuration = 5,
      maxDuration = 7,
      maxCoins = 80,
      rotationRange = [-120, 120],
      horizontalDrift = [-30, 30],
      zIndex = 10,
      bgColor = 'transparent',
      className,
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const coinsRef = useRef<Coin[]>([]);
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
        coinImages.map(
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
    }, [coinImages]);

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

    const getCoinSize = useCallback(() => {
      const w = window.innerWidth * sizeRef.current;
      return { width: w, height: w / COIN_ASPECT };
    }, []);

    // Spawn
    const spawnCoin = useCallback(() => {
      if (coinsRef.current.length >= maxCoins) return;
      const { height } = getCoinSize();
      const dur = minDuration + Math.random() * (maxDuration - minDuration);
      const rot = rotationRange[0] + Math.random() * (rotationRange[1] - rotationRange[0]);
      const dr = horizontalDrift[0] + Math.random() * (horizontalDrift[1] - horizontalDrift[0]);
      const initialY = -height - 200 * Math.random();
      idCounter.current++;
      coinsRef.current.push({
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
    }, [getCoinSize, maxCoins, minDuration, maxDuration, rotationRange, horizontalDrift]);

    // Update
    const updateCoins = useCallback((dt: number, now: number) => {
      const fallTarget = window.innerHeight + 500;
      coinsRef.current = coinsRef.current.filter((c) => {
        c.elapsed += dt;
        if (c.explodePhase) {
          const el = (now - (c.explodeStartTime || 0)) / 1000;
          if (c.explodePhase === 1) {
            if (el < 0.6) {
              const t = el / 0.6;
              const ease = t * (2 - t);
              c.y = (c.explodeStartY || 0) + ((c.explodeUpY || 0) - (c.explodeStartY || 0)) * ease;
              c.rotation = ((c.explodeTargetRotation || 0) / 2) * ease;
            } else {
              c.explodePhase = 2;
              c.explodeStartY = c.y;
              c.explodeStartTime = now;
            }
          } else if (c.explodePhase === 2 && el < 0.8) {
            const t = el / 0.8;
            const ease = t * t;
            c.y = (c.explodeStartY || 0) + ((c.explodeTargetY || 0) - (c.explodeStartY || 0)) * ease;
            c.x += ((c.explodeTargetX || 0) - c.x) * ease * dt;
            c.rotation =
              ((c.explodeTargetRotation || 0) / 2) + ((c.explodeTargetRotation || 0) / 2) * ease;
          }
        } else {
          const p = Math.min(c.elapsed / c.duration, 1);
          c.y = c.initialY + (fallTarget - c.initialY) * p;
          c.x += (c.drift / c.duration) * dt;
          c.rotation += c.rotationSpeed * dt;
        }
        return c.y < window.innerHeight + 200;
      });
    }, []);

    // Render
    const renderCoins = useCallback(
      (ctx: CanvasRenderingContext2D) => {
        const { width, height } = getCoinSize();
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        coinsRef.current.forEach((c) => {
          const img = imagesRef.current[c.imageIndex];
          if (!img?.complete) return;
          ctx.save();
          ctx.translate(c.x, c.y);
          ctx.rotate((c.rotation * Math.PI) / 180);
          ctx.drawImage(img, -width / 2, -height / 2, width, height);
          ctx.restore();
        });
      },
      [getCoinSize]
    );

    // Animation loop
    useEffect(() => {
      if (!active) return;
      const loop = (time: number) => {
        const dt = lastTimeRef.current ? (time - lastTimeRef.current) / 1000 : 0;
        lastTimeRef.current = time;
        updateCoins(dt, time);
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) renderCoins(ctx);
        frameRef.current = requestAnimationFrame(loop);
      };
      frameRef.current = requestAnimationFrame(loop);
      return () => {
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
      };
    }, [active, updateCoins, renderCoins]);

    // Auto-start when images ready
    useEffect(() => {
      if (!imagesLoaded) return;
      setActive(true);
      lastTimeRef.current = 0;
      spawnRef.current = setInterval(spawnCoin, spawnInterval);
      return () => {
        if (spawnRef.current) clearInterval(spawnRef.current);
      };
    }, [imagesLoaded, spawnCoin, spawnInterval]);

    // ── Imperative API ──

    const stop = useCallback(() => {
      setActive(false);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (spawnRef.current) clearInterval(spawnRef.current);
      coinsRef.current = [];
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }, []);

    const explode = useCallback(() => {
      if (spawnRef.current) {
        clearInterval(spawnRef.current);
        spawnRef.current = null;
      }
      const now = performance.now();
      coinsRef.current.forEach((c) => {
        c.explodePhase = 1;
        c.explodeStartTime = now;
        c.explodeStartY = c.y;
        c.explodeUpY = c.y + (-300 + -300 * Math.random());
        c.explodeTargetY = 0.85 * window.innerHeight + Math.random() * (0.15 * window.innerHeight);
        c.explodeTargetX = c.x + (-150 + 300 * Math.random());
        c.explodeTargetRotation = -720 + 1440 * Math.random();
      });
    }, []);

    const restart = useCallback(() => {
      coinsRef.current.forEach((c) => {
        const dur = minDuration + Math.random() * (maxDuration - minDuration);
        const rot = rotationRange[0] + Math.random() * (rotationRange[1] - rotationRange[0]);
        const dr = horizontalDrift[0] + Math.random() * (horizontalDrift[1] - horizontalDrift[0]);
        Object.assign(c, {
          explodePhase: 0, explodeStartTime: undefined, explodeStartY: undefined,
          explodeUpY: undefined, explodeTargetY: undefined, explodeTargetX: undefined,
          explodeTargetRotation: undefined, initialY: c.y, duration: dur, elapsed: 0,
          drift: dr, rotationSpeed: rot / dur,
        });
      });
      if (!spawnRef.current) spawnRef.current = setInterval(spawnCoin, spawnInterval);
      setActive(true);
    }, [spawnCoin, spawnInterval, minDuration, maxDuration, rotationRange, horizontalDrift]);

    const start = useCallback(() => {
      if (!imagesLoaded || active) return;
      setActive(true);
      lastTimeRef.current = 0;
      spawnRef.current = setInterval(spawnCoin, spawnInterval);
    }, [imagesLoaded, active, spawnCoin, spawnInterval]);

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

CoinRain.displayName = 'CoinRain';
export default CoinRain;
