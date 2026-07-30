// @ts-nocheck — Animation component: complex canvas + ref orchestration
"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════
   Payout Flow Particle System
   A mesmerizing canvas animation showing USDT particles flowing
   from campaign escrow through the smart contract to creator wallets.
   Like a financial circulatory system.
   ═══════════════════════════════════════════════════════════════ */

/* ── Data ──────────────────────────────────────────────── */

const CAMPAIGN = {
  name: "Yunakin Land Tax",
  budgetTotal: 2000.0,
  remaining: 1210.41,
};

const CREATORS = [
  { address: "0x943d...oracle", amount: 333.93 },
  { address: "0x7bbc...5ff3", amount: 291.05 },
  { address: "0x196f...a3c1", amount: 86.93 },
  { label: "Others", amount: 78.09 },
] as const;

const PLATFORM_FEE = 41.56;
const TOTAL_DISTRIBUTED = 789.59;
const TOTAL_PAYOUTS = 24;
const TOTAL_CREATORS = 8;

const USDT_GREEN = "#22c55e";
const USDT_GREEN_GLOW = "rgba(34, 197, 94, 0.6)";
const USDT_GREEN_DIM = "rgba(34, 197, 94, 0.15)";
const ESCROW_ORANGE = "#f97316";
const ESCROW_ORANGE_GLOW = "rgba(249, 115, 22, 0.5)";
const CONTRACT_BLUE = "#60a5fa";
const CONTRACT_BLUE_GLOW = "rgba(96, 165, 250, 0.5)";
const TREASURY_AMBER = "#eab308";

/* ── Bezier helpers ────────────────────────────────────── */

function cubicBezier(
  t: number,
  p0: number,
  p1: number,
  p2: number,
  p3: number
): number {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}

interface BezierPath {
  x0: number; y0: number;
  x1: number; y1: number;
  x2: number; y2: number;
  x3: number; y3: number;
}

function evalBezier(path: BezierPath, t: number): { x: number; y: number } {
  return {
    x: cubicBezier(t, path.x0, path.x1, path.x2, path.x3),
    y: cubicBezier(t, path.y0, path.y1, path.y2, path.y3),
  };
}

/* ── Particle class ────────────────────────────────────── */

interface Particle {
  path: BezierPath;
  progress: number;
  speed: number;
  size: number;
  opacity: number;
  targetIndex: number; // which wallet (0-3) or -1 for treasury
  trail: { x: number; y: number; opacity: number }[];
}

/* ── Node positions (normalized 0-1, scaled to canvas) ── */

interface NodeLayout {
  escrow: { x: number; y: number };
  contract: { x: number; y: number };
  wallets: { x: number; y: number }[];
  treasury: { x: number; y: number };
}

function computeLayout(w: number, h: number): NodeLayout {
  const padX = w * 0.12;
  const centerY = h * 0.45;

  const escrowX = padX;
  const contractX = w * 0.5;
  const walletX = w - padX;
  const treasuryY = h * 0.88;

  // Wallets stacked vertically, centered on right
  const walletSpacing = Math.min(h * 0.16, 52);
  const walletStartY = centerY - (walletSpacing * 1.5);
  const wallets = Array.from({ length: 4 }, (_, i) => ({
    x: walletX,
    y: walletStartY + i * walletSpacing,
  }));

  return {
    escrow: { x: escrowX, y: centerY },
    contract: { x: contractX, y: centerY },
    wallets,
    treasury: { x: contractX, y: treasuryY },
  };
}

function makePathEscrowToContract(
  layout: NodeLayout,
  jitter: number
): BezierPath {
  const { escrow, contract } = layout;
  const midX = (escrow.x + contract.x) / 2;
  return {
    x0: escrow.x,
    y0: escrow.y + (Math.random() - 0.5) * 8,
    x1: midX - 20 + Math.random() * 40,
    y1: escrow.y - 30 - Math.random() * 30 + jitter,
    x2: midX + 20 + Math.random() * 40,
    y2: contract.y - 20 - Math.random() * 20 + jitter,
    x3: contract.x,
    y3: contract.y + (Math.random() - 0.5) * 6,
  };
}

function makePathContractToWallet(
  layout: NodeLayout,
  walletIdx: number,
  jitter: number
): BezierPath {
  const { contract, wallets } = layout;
  const wallet = wallets[walletIdx];
  const midX = (contract.x + wallet.x) / 2;
  return {
    x0: contract.x,
    y0: contract.y + (Math.random() - 0.5) * 6,
    x1: midX - 30 + Math.random() * 30,
    y1: contract.y + (wallet.y - contract.y) * 0.3 + jitter,
    x2: midX + 30 + Math.random() * 30,
    y2: wallet.y + (Math.random() - 0.5) * 10 + jitter,
    x3: wallet.x,
    y3: wallet.y + (Math.random() - 0.5) * 4,
  };
}

function makePathContractToTreasury(
  layout: NodeLayout,
  jitter: number
): BezierPath {
  const { contract, treasury } = layout;
  return {
    x0: contract.x + (Math.random() - 0.5) * 6,
    y0: contract.y + 8,
    x1: contract.x - 15 + Math.random() * 30 + jitter,
    y1: (contract.y + treasury.y) * 0.45,
    x2: treasury.x + (Math.random() - 0.5) * 20 + jitter,
    y2: (contract.y + treasury.y) * 0.65,
    x3: treasury.x,
    y3: treasury.y - 10,
  };
}

/* ── Weighted random wallet pick ───────────────────────── */

const WALLET_WEIGHTS = CREATORS.map((c) => c.amount);
const TOTAL_WEIGHT = WALLET_WEIGHTS.reduce((a, b) => a + b, 0);

function pickWalletIndex(): number {
  let r = Math.random() * TOTAL_WEIGHT;
  for (let i = 0; i < WALLET_WEIGHTS.length; i++) {
    r -= WALLET_WEIGHTS[i];
    if (r <= 0) return i;
  }
  return WALLET_WEIGHTS.length - 1;
}

/* ── Verification flash texts ──────────────────────────── */

const VERIFY_STAGES = ["Verify", "Calculate", "Transfer"];

/* ═══════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════ */

export function PayoutParticles() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const layoutRef = useRef<NodeLayout | null>(null);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const burstTimerRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const [isVisible, setIsVisible] = useState(false);
  const [nodesReady, setNodesReady] = useState(false);
  const [hoveredWallet, setHoveredWallet] = useState<number | null>(null);
  const [verifyStage, setVerifyStage] = useState<string | null>(null);
  const [displayRemaining, setDisplayRemaining] = useState(CAMPAIGN.remaining);
  const [canvasDims, setCanvasDims] = useState({ w: 800, h: 400 });

  const hoveredWalletRef = useRef<number | null>(null);
  useEffect(() => {
    hoveredWalletRef.current = hoveredWallet;
  }, [hoveredWallet]);

  /* ── Intersection Observer ────────────────────────────── */

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* ── Spawn helpers (stable via ref) ───────────────────── */

  const spawnParticle = useCallback(
    (layout: NodeLayout, particles: Particle[], phase: "left" | "right" | "fee") => {
      const jitter = (Math.random() - 0.5) * 16;
      const speed = 0.003 + Math.random() * 0.004; // 0.003-0.007 progress/frame
      const size = 2 + Math.random() * 2;

      if (phase === "left") {
        particles.push({
          path: makePathEscrowToContract(layout, jitter),
          progress: 0,
          speed: speed * (0.7 + Math.random() * 0.6),
          size,
          opacity: 0.85 + Math.random() * 0.15,
          targetIndex: -2, // mid-flight to contract
          trail: [],
        });
      } else if (phase === "right") {
        const walletIdx = pickWalletIndex();
        particles.push({
          path: makePathContractToWallet(layout, walletIdx, jitter),
          progress: 0,
          speed: speed * (0.7 + Math.random() * 0.6),
          size,
          opacity: 0.85 + Math.random() * 0.15,
          targetIndex: walletIdx,
          trail: [],
        });
      } else {
        // fee particle
        particles.push({
          path: makePathContractToTreasury(layout, jitter),
          progress: 0,
          speed: speed * 0.6,
          size: size * 0.7,
          opacity: 0.6 + Math.random() * 0.2,
          targetIndex: -1, // treasury
          trail: [],
        });
      }
    },
    []
  );

  const spawnBurst = useCallback(
    (layout: NodeLayout, particles: Particle[], count: number) => {
      // Burst from escrow to contract
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          spawnParticle(layout, particles, "left");
        }, i * 40); // stagger over 40ms each
      }

      // After a delay, burst from contract to wallets
      setTimeout(() => {
        const walletCount = Math.max(4, count - 2);
        for (let i = 0; i < walletCount; i++) {
          setTimeout(() => {
            spawnParticle(layout, particles, "right");
          }, i * 50);
        }
        // 1-2 fee particles
        spawnParticle(layout, particles, "fee");
        if (Math.random() > 0.5) {
          setTimeout(() => spawnParticle(layout, particles, "fee"), 80);
        }
      }, 600);
    },
    [spawnParticle]
  );

  /* ── Canvas Animation Loop ───────────────────────────── */

  useEffect(() => {
    if (!isVisible) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Sizing
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const W = rect.width;
    const H = Math.min(rect.width * 0.52, 420);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.scale(dpr, dpr);
    setCanvasDims({ w: W, h: H });

    const layout = computeLayout(W, H);
    layoutRef.current = layout;

    const particles = particlesRef.current;
    particles.length = 0; // reset

    let lastTime = performance.now();
    startTimeRef.current = lastTime;
    burstTimerRef.current = lastTime + 1000; // first burst after 1s
    let verifyTimeout: ReturnType<typeof setTimeout> | null = null;

    // Trigger stagger reveal of nodes
    setTimeout(() => setNodesReady(true), 200);

    function drawNode(
      x: number,
      y: number,
      radius: number,
      color: string,
      glowColor: string,
      pulse: number
    ) {
      // Outer glow
      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius * 2.5);
      grad.addColorStop(0, glowColor);
      grad.addColorStop(0.5, glowColor.replace(/[\d.]+\)$/, "0.15)"));
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, radius * 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Pulsing ring
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.3 + pulse * 0.2;
      ctx.beginPath();
      ctx.arc(x, y, radius + 4 + pulse * 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Core circle
      const coreGrad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      coreGrad.addColorStop(0, color);
      coreGrad.addColorStop(1, color.replace(/[\d.]+\)$/, "") || color);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Inner highlight
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.beginPath();
      ctx.arc(x - radius * 0.2, y - radius * 0.25, radius * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawHexagon(x: number, y: number, r: number, color: string, glowColor: string, pulse: number) {
      // Outer glow
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
      grad.addColorStop(0, glowColor);
      grad.addColorStop(0.4, glowColor.replace(/[\d.]+\)$/, "0.1)"));
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r * 3, 0, Math.PI * 2);
      ctx.fill();

      // Hexagon shape
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const px = x + r * Math.cos(angle);
        const py = y + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();

      // Fill
      const hGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
      hGrad.addColorStop(0, color);
      hGrad.addColorStop(1, color);
      ctx.fillStyle = hGrad;
      ctx.fill();

      // Border glow
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Pulsing outer hexagon
      ctx.globalAlpha = 0.15 + pulse * 0.15;
      ctx.beginPath();
      const outerR = r + 6 + pulse * 8;
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const px = x + outerR * Math.cos(angle);
        const py = y + outerR * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Inner highlight
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.beginPath();
      ctx.arc(x, y - r * 0.15, r * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawContractIcon(x: number, y: number, size: number, pulse: number) {
      // Glow backdrop
      const grad = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
      grad.addColorStop(0, CONTRACT_BLUE_GLOW);
      grad.addColorStop(0.4, "rgba(96, 165, 250, 0.08)");
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, size * 3, 0, Math.PI * 2);
      ctx.fill();

      // Rounded square body
      const s = size;
      const r = s * 0.25;
      ctx.beginPath();
      ctx.moveTo(x - s + r, y - s);
      ctx.lineTo(x + s - r, y - s);
      ctx.quadraticCurveTo(x + s, y - s, x + s, y - s + r);
      ctx.lineTo(x + s, y + s - r);
      ctx.quadraticCurveTo(x + s, y + s, x + s - r, y + s);
      ctx.lineTo(x - s + r, y + s);
      ctx.quadraticCurveTo(x - s, y + s, x - s, y + s - r);
      ctx.lineTo(x - s, y - s + r);
      ctx.quadraticCurveTo(x - s, y - s, x - s + r, y - s);
      ctx.closePath();

      ctx.fillStyle = "rgba(96, 165, 250, 0.15)";
      ctx.fill();
      ctx.strokeStyle = CONTRACT_BLUE;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Lock icon inside
      const lockW = s * 0.5;
      const lockH = s * 0.45;
      const lockY = y + s * 0.1;
      // Lock body
      ctx.fillStyle = CONTRACT_BLUE;
      ctx.beginPath();
      ctx.roundRect(x - lockW / 2, lockY, lockW, lockH, 2);
      ctx.fill();
      // Lock shackle
      ctx.strokeStyle = CONTRACT_BLUE;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, lockY, lockW * 0.38, Math.PI, 0);
      ctx.stroke();

      // Pulsing ring
      ctx.globalAlpha = 0.2 + pulse * 0.15;
      const outerSize = s + 8 + pulse * 10;
      const rr = outerSize * 0.25;
      ctx.beginPath();
      ctx.moveTo(x - outerSize + rr, y - outerSize);
      ctx.lineTo(x + outerSize - rr, y - outerSize);
      ctx.quadraticCurveTo(x + outerSize, y - outerSize, x + outerSize, y - outerSize + rr);
      ctx.lineTo(x + outerSize, y + outerSize - rr);
      ctx.quadraticCurveTo(x + outerSize, y + outerSize, x + outerSize - rr, y + outerSize);
      ctx.lineTo(x - outerSize + rr, y + outerSize);
      ctx.quadraticCurveTo(x - outerSize, y + outerSize, x - outerSize, y + outerSize - rr);
      ctx.lineTo(x - outerSize, y - outerSize + rr);
      ctx.quadraticCurveTo(x - outerSize, y - outerSize, x - outerSize + rr, y - outerSize);
      ctx.closePath();
      ctx.strokeStyle = CONTRACT_BLUE;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    function drawParticle(p: Particle, _now: number) {
      const pos = evalBezier(p.path, p.progress);
      const hovered = hoveredWalletRef.current;
      const isHighlighted =
        hovered === null ||
        p.targetIndex === hovered ||
        p.targetIndex === -2; // mid-flight always visible

      const alpha = isHighlighted ? p.opacity : p.opacity * 0.12;
      const isTreasury = p.targetIndex === -1;
      const color = isTreasury ? TREASURY_AMBER : USDT_GREEN;

      // Draw trail
      for (let i = p.trail.length - 1; i >= 0; i--) {
        const t = p.trail[i];
        const trailAlpha = t.opacity * alpha;
        if (trailAlpha < 0.01) continue;
        ctx.fillStyle = isTreasury
          ? `rgba(234, 179, 8, ${trailAlpha})`
          : `rgba(34, 197, 94, ${trailAlpha})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, p.size * (0.4 + (i / p.trail.length) * 0.4), 0, Math.PI * 2);
        ctx.fill();
      }

      // Glow
      const glowGrad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, p.size * 4);
      glowGrad.addColorStop(0, isTreasury
        ? `rgba(234, 179, 8, ${0.4 * alpha})`
        : `rgba(34, 197, 94, ${0.4 * alpha})`);
      glowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, p.size * 4, 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.fillStyle = isTreasury
        ? `rgba(234, 179, 8, ${alpha})`
        : `rgba(34, 197, 94, ${alpha})`;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      // Bright center
      ctx.fillStyle = `rgba(255, 255, 255, ${0.6 * alpha})`;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, p.size * 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Update trail
      p.trail.unshift({ x: pos.x, y: pos.y, opacity: 0.5 });
      if (p.trail.length > 6) p.trail.pop();
      // Fade trail
      for (let i = 0; i < p.trail.length; i++) {
        p.trail[i].opacity *= 0.7;
      }
    }

    function drawConnectionLines(layout: NodeLayout, alpha: number) {
      ctx.setLineDash([4, 6]);
      ctx.lineWidth = 1;

      // Escrow to Contract
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.06 * alpha})`;
      ctx.beginPath();
      ctx.moveTo(layout.escrow.x + 24, layout.escrow.y);
      ctx.lineTo(layout.contract.x - 20, layout.contract.y);
      ctx.stroke();

      // Contract to each wallet
      for (const w of layout.wallets) {
        ctx.beginPath();
        ctx.moveTo(layout.contract.x + 20, layout.contract.y);
        ctx.lineTo(w.x - 10, w.y);
        ctx.stroke();
      }

      // Contract to treasury
      ctx.strokeStyle = `rgba(234, 179, 8, ${0.06 * alpha})`;
      ctx.beginPath();
      ctx.moveTo(layout.contract.x, layout.contract.y + 20);
      ctx.lineTo(layout.treasury.x, layout.treasury.y - 14);
      ctx.stroke();

      ctx.setLineDash([]);
    }

    function drawWalletNode(
      x: number,
      y: number,
      idx: number,
      pulse: number,
      hovered: number | null
    ) {
      const isHovered = hovered === idx;
      const isDimmed = hovered !== null && hovered !== idx;
      const alpha = isDimmed ? 0.25 : 1;
      const r = isHovered ? 8 : 6;

      // Glow
      if (!isDimmed) {
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 3.5);
        grad.addColorStop(0, `rgba(34, 197, 94, ${0.35 * alpha})`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r * 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Core
      ctx.fillStyle = `rgba(34, 197, 94, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      // Ring
      if (isHovered) {
        ctx.strokeStyle = USDT_GREEN;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, r + 4 + pulse * 4, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Inner
      ctx.fillStyle = `rgba(255,255,255, ${0.35 * alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, r * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawTreasuryNode(x: number, y: number, pulse: number) {
      const r = 6;
      // Glow
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
      grad.addColorStop(0, "rgba(234, 179, 8, 0.3)");
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r * 3, 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.fillStyle = TREASURY_AMBER;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.beginPath();
      ctx.arc(x, y, r * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ambient particle spawning to maintain 15-25 in flight
    let ambientTimer = 0;
    const AMBIENT_INTERVAL = 180; // ms

    function draw(now: number) {
      const elapsed = now - startTimeRef.current;
      const dt = Math.min(now - lastTime, 33); // cap at ~30fps minimum
      lastTime = now;

      ctx.clearRect(0, 0, W, H);

      const pulse = (Math.sin(now * 0.003) + 1) / 2; // 0-1 smooth pulse

      // Draw subtle connection lines
      drawConnectionLines(layout, Math.min(1, elapsed / 1500));

      // Draw nodes
      if (elapsed > 200) {
        drawHexagon(
          layout.escrow.x,
          layout.escrow.y,
          20,
          ESCROW_ORANGE,
          ESCROW_ORANGE_GLOW,
          pulse
        );
      }
      if (elapsed > 500) {
        drawContractIcon(
          layout.contract.x,
          layout.contract.y,
          18,
          pulse
        );
      }
      if (elapsed > 800) {
        const hovered = hoveredWalletRef.current;
        for (let i = 0; i < layout.wallets.length; i++) {
          drawWalletNode(
            layout.wallets[i].x,
            layout.wallets[i].y,
            i,
            pulse,
            hovered
          );
        }
        drawTreasuryNode(layout.treasury.x, layout.treasury.y, pulse);
      }

      // Spawn ambient particles after initial delay
      if (elapsed > 1200) {
        ambientTimer += dt;
        if (ambientTimer >= AMBIENT_INTERVAL) {
          ambientTimer -= AMBIENT_INTERVAL;
          const inFlight = particles.length;
          if (inFlight < 20) {
            // Alternate between left and right phase
            if (Math.random() > 0.35) {
              spawnParticle(layout, particles, "right");
            } else {
              spawnParticle(layout, particles, "left");
            }
            // Occasional fee particle
            if (Math.random() > 0.85) {
              spawnParticle(layout, particles, "fee");
            }
          }
        }
      }

      // Burst timer
      if (elapsed > 1000 && now >= burstTimerRef.current) {
        const burstCount = 8 + Math.floor(Math.random() * 5); // 8-12
        spawnBurst(layout, particles, burstCount);
        burstTimerRef.current = now + 3000 + Math.random() * 2000; // 3-5s

        // Trigger verify animation
        setVerifyStage(VERIFY_STAGES[0]);
        let stageIdx = 1;
        const stageInterval = setInterval(() => {
          if (stageIdx < VERIFY_STAGES.length) {
            setVerifyStage(VERIFY_STAGES[stageIdx]);
            stageIdx++;
          } else {
            setVerifyStage(null);
            clearInterval(stageInterval);
          }
        }, 400);
        verifyTimeout = stageInterval;

        // Animate remaining balance decrease
        setDisplayRemaining((prev) => Math.max(prev - 0.5 - Math.random() * 2, 0));
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.progress += p.speed * (dt / 16.67); // normalize to 60fps

        if (p.progress >= 1) {
          // If this was an escrow-to-contract particle, spawn a contract-to-wallet
          if (p.targetIndex === -2) {
            const walletIdx = pickWalletIndex();
            const jitter = (Math.random() - 0.5) * 16;
            particles[i] = {
              path: makePathContractToWallet(layout, walletIdx, jitter),
              progress: 0,
              speed: 0.003 + Math.random() * 0.004,
              size: p.size,
              opacity: p.opacity,
              targetIndex: walletIdx,
              trail: [],
            };
            continue;
          }
          // Otherwise remove
          particles.splice(i, 1);
          continue;
        }

        drawParticle(p, now);
      }

      animFrameRef.current = requestAnimationFrame(draw);
    }

    animFrameRef.current = requestAnimationFrame(draw);

    // Resize handler
    const handleResize = () => {
      const newRect = container.getBoundingClientRect();
      const nW = newRect.width;
      const nH = Math.min(newRect.width * 0.52, 420);
      canvas.width = nW * dpr;
      canvas.height = nH * dpr;
      canvas.style.width = nW + "px";
      canvas.style.height = nH + "px";
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      const newLayout = computeLayout(nW, nH);
      layoutRef.current = newLayout;
      // Update the closed-over layout
      Object.assign(layout, newLayout);
      setCanvasDims({ w: nW, h: nH });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", handleResize);
      if (verifyTimeout) clearInterval(verifyTimeout);
    };
  }, [isVisible, spawnParticle, spawnBurst]);

  /* ── Trigger manual payout burst ──────────────────────── */

  const triggerPayout = useCallback(() => {
    const layout = layoutRef.current;
    const particles = particlesRef.current;
    if (!layout) return;
    spawnBurst(layout, particles, 12);

    setVerifyStage(VERIFY_STAGES[0]);
    let stageIdx = 1;
    const stageInterval = setInterval(() => {
      if (stageIdx < VERIFY_STAGES.length) {
        setVerifyStage(VERIFY_STAGES[stageIdx]);
        stageIdx++;
      } else {
        setVerifyStage(null);
        clearInterval(stageInterval);
      }
    }, 400);

    setDisplayRemaining((prev) => Math.max(prev - 1 - Math.random() * 3, 0));
  }, [spawnBurst]);

  /* ── Mouse hover detection for wallet nodes ───────────── */

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const layout = layoutRef.current;
      if (!layout) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      let found: number | null = null;
      for (let i = 0; i < layout.wallets.length; i++) {
        const w = layout.wallets[i];
        const dx = mx - w.x;
        const dy = my - w.y;
        if (dx * dx + dy * dy < 900) {
          // 30px radius hit area
          found = i;
          break;
        }
      }
      setHoveredWallet(found);
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredWallet(null);
  }, []);

  /* ── Compute label positions from canvas dims ─────────── */

  const layout = layoutRef.current || computeLayout(canvasDims.w, canvasDims.h);

  return (
    <div ref={containerRef} style={styles.wrapper}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={USDT_GREEN}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="16 12 12 8 8 12" />
            <line x1="12" y1="16" x2="12" y2="8" />
          </svg>
          <span style={styles.headerTitle}>Payout Flow — Particle System</span>
        </div>
        <button
          onClick={triggerPayout}
          style={styles.triggerButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderBottomColor = "rgba(34, 197, 94, 0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderBottomColor = "rgba(34, 197, 94, 0.25)";
          }}
        >
          Trigger Payout
        </button>
      </div>

      {/* Canvas + HTML overlay container */}
      <div
        style={styles.canvasWrapper}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <canvas ref={canvasRef} style={styles.canvas} />

        {/* ── HTML Label Overlays ──────────────────────── */}

        {/* Escrow label */}
        <div
          style={{
            ...styles.label,
            left: layout.escrow.x,
            top: layout.escrow.y - 52,
            transform: "translateX(-50%)",
            opacity: nodesReady ? 1 : 0,
            transition: "opacity 0.8s ease 0.2s",
          }}
        >
          <div style={styles.labelCampaignName}>{CAMPAIGN.name}</div>
          <div style={styles.labelNodeTitle}>
            <span style={{ color: ESCROW_ORANGE }}>Campaign Escrow</span>
          </div>
        </div>
        <div
          style={{
            ...styles.label,
            left: layout.escrow.x,
            top: layout.escrow.y + 32,
            transform: "translateX(-50%)",
            opacity: nodesReady ? 1 : 0,
            transition: "opacity 0.8s ease 0.3s",
          }}
        >
          <div style={styles.labelBalance}>
            ${displayRemaining.toFixed(2)}{" "}
            <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 10 }}>
              remaining
            </span>
          </div>
          <div style={styles.labelSubtext}>Budget pool</div>
        </div>

        {/* Contract label */}
        <div
          style={{
            ...styles.label,
            left: layout.contract.x,
            top: layout.contract.y - 42,
            transform: "translateX(-50%)",
            opacity: nodesReady ? 1 : 0,
            transition: "opacity 0.8s ease 0.5s",
          }}
        >
          <div style={styles.labelNodeTitle}>
            <span style={{ color: CONTRACT_BLUE }}>Payout Engine</span>
          </div>
        </div>

        {/* Verification flash */}
        {verifyStage && (
          <div
            style={{
              ...styles.label,
              left: layout.contract.x,
              top: layout.contract.y + 30,
              transform: "translateX(-50%)",
            }}
          >
            <div style={styles.verifyFlash}>
              {VERIFY_STAGES.map((stage, i) => (
                <span key={stage}>
                  <span
                    style={{
                      color:
                        stage === verifyStage
                          ? CONTRACT_BLUE
                          : "rgba(255,255,255,0.2)",
                      fontWeight: stage === verifyStage ? 700 : 400,
                      transition: "color 0.15s, font-weight 0.15s",
                    }}
                  >
                    {stage}
                  </span>
                  {i < VERIFY_STAGES.length - 1 && (
                    <span style={{ color: "rgba(255,255,255,0.15)", margin: "0 4px" }}>
                      {" "}
                      →{" "}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Wallet labels */}
        {CREATORS.map((creator, i) => {
          const walletPos = layout.wallets[i];
          if (!walletPos) return null;
          const isDimmed = hoveredWallet !== null && hoveredWallet !== i;
          return (
            <div
              key={i}
              style={{
                ...styles.label,
                left: walletPos.x + 16,
                top: walletPos.y,
                transform: "translateY(-50%)",
                opacity: nodesReady ? (isDimmed ? 0.2 : 1) : 0,
                transition: "opacity 0.3s ease",
                transitionDelay: nodesReady ? `${0.8 + i * 0.1}s` : "0s",
                whiteSpace: "nowrap",
              }}
            >
              <span style={styles.walletAddress}>
                {"label" in creator ? creator.label : creator.address}
              </span>
              <span style={styles.walletAmount}>
                {" "}
                — ${creator.amount.toFixed(2)}
              </span>
            </div>
          );
        })}

        {/* "Creator Wallets" group label */}
        <div
          style={{
            ...styles.label,
            left: layout.wallets[0]?.x ?? 0,
            top: (layout.wallets[0]?.y ?? 0) - 36,
            transform: "translateX(-10%)",
            opacity: nodesReady ? 1 : 0,
            transition: "opacity 0.8s ease 0.8s",
          }}
        >
          <div style={styles.labelNodeTitle}>
            <span style={{ color: USDT_GREEN }}>Creator Wallets</span>
          </div>
          <div style={{ ...styles.labelSubtext, marginTop: 1 }}>
            {TOTAL_CREATORS} creators receiving USDT
          </div>
        </div>

        {/* Treasury label */}
        <div
          style={{
            ...styles.label,
            left: layout.treasury.x,
            top: layout.treasury.y + 16,
            transform: "translateX(-50%)",
            opacity: nodesReady ? 1 : 0,
            transition: "opacity 0.8s ease 0.9s",
          }}
        >
          <div style={styles.treasuryLabel}>
            Platform Treasury{" "}
            <span style={{ color: TREASURY_AMBER }}>
              (${PLATFORM_FEE.toFixed(2)})
            </span>
          </div>
        </div>

        {/* Waiting placeholder */}
        {!isVisible && (
          <div style={styles.placeholder}>
            <span style={{ color: "#4a4a4a", fontSize: 14 }}>
              Initializing payout flow...
            </span>
          </div>
        )}
      </div>

      {/* Stats bar */}
      <div style={styles.statsBar}>
        <div style={styles.stat}>
          <span style={styles.statValue}>
            {TOTAL_DISTRIBUTED.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}{" "}
            <span style={styles.statUnit}>USDT</span>
          </span>
          <span style={styles.statLabel}>distributed</span>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.stat}>
          <span style={styles.statValue}>{TOTAL_PAYOUTS}</span>
          <span style={styles.statLabel}>payouts</span>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.stat}>
          <span style={styles.statValue}>{TOTAL_CREATORS}</span>
          <span style={styles.statLabel}>creators</span>
        </div>
      </div>

      {/* Tagline */}
      <p style={styles.tagline}>
        Every USDT particle represents real value flowing from campaign escrow
        through on-chain verification to creator wallets. Automatically. Trustlessly.
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Inline styles — dark theme matching project conventions
   ═══════════════════════════════════════════════════════════════ */

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    background: "transparent",
    overflow: "hidden",
    maxWidth: 900,
    width: "100%",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px 12px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "rgba(255, 255, 255, 0.85)",
    letterSpacing: "-0.02em",
    fontFamily: "'Space Grotesk', system-ui, sans-serif",
  },
  triggerButton: {
    fontSize: 11,
    fontWeight: 600,
    color: USDT_GREEN,
    background: "transparent",
    border: "none",
    borderBottom: `1px solid rgba(34, 197, 94, 0.25)`,
    borderRadius: 0,
    padding: "6px 0",
    cursor: "pointer",
    fontFamily: "'Space Grotesk', system-ui, sans-serif",
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    transition: "border-color 0.2s",
    outline: "none",
  },
  canvasWrapper: {
    position: "relative" as const,
    width: "100%",
    overflow: "hidden",
  },
  canvas: {
    display: "block",
    width: "100%",
  },
  label: {
    position: "absolute" as const,
    pointerEvents: "none" as const,
    textAlign: "center" as const,
    zIndex: 2,
  },
  labelCampaignName: {
    fontSize: 10,
    fontWeight: 600,
    color: "rgba(255, 255, 255, 0.25)",
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    fontFamily: "'Space Grotesk', system-ui, sans-serif",
    marginBottom: 2,
  },
  labelNodeTitle: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "-0.02em",
    fontFamily: "'Space Grotesk', system-ui, sans-serif",
  },
  labelBalance: {
    fontSize: 13,
    fontWeight: 700,
    color: "#fff",
    fontVariantNumeric: "tabular-nums" as const,
    fontFamily: "'Geist Mono', monospace",
  },
  labelSubtext: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.25)",
    fontFamily: "'Space Grotesk', system-ui, sans-serif",
    marginTop: 2,
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
  },
  verifyFlash: {
    fontSize: 11,
    fontFamily: "'Geist Mono', monospace",
    whiteSpace: "nowrap" as const,
  },
  walletAddress: {
    fontSize: 11,
    fontWeight: 500,
    color: "rgba(255, 255, 255, 0.5)",
    fontFamily: "'Geist Mono', monospace",
  },
  walletAmount: {
    fontSize: 11,
    fontWeight: 700,
    color: USDT_GREEN,
    fontFamily: "'Geist Mono', monospace",
    fontVariantNumeric: "tabular-nums" as const,
  },
  treasuryLabel: {
    fontSize: 11,
    fontWeight: 500,
    color: "rgba(255, 255, 255, 0.4)",
    fontFamily: "'Geist Mono', monospace",
    whiteSpace: "nowrap" as const,
  },
  placeholder: {
    position: "absolute" as const,
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    zIndex: 10,
  },
  statsBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "14px 20px",
    margin: "0 16px",
    background: "transparent",
    borderRadius: 0,
    borderTop: "1px solid rgba(255, 255, 255, 0.04)",
    gap: 24,
    flexWrap: "wrap" as const,
  },
  stat: {
    display: "flex",
    flexDirection: "row" as const,
    alignItems: "baseline",
    gap: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 700,
    color: "rgba(255, 255, 255, 0.85)",
    fontFamily: "'Space Grotesk', system-ui, sans-serif",
    fontVariantNumeric: "tabular-nums" as const,
  },
  statUnit: {
    fontSize: 11,
    fontWeight: 600,
    color: USDT_GREEN,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: 500,
    color: "rgba(255, 255, 255, 0.25)",
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    fontFamily: "'Space Grotesk', system-ui, sans-serif",
  },
  statDivider: {
    width: 1,
    height: 16,
    background: "rgba(255, 255, 255, 0.1)",
  },
  tagline: {
    fontSize: 12,
    lineHeight: 1.6,
    color: "rgba(255, 255, 255, 0.2)",
    textAlign: "center" as const,
    padding: "16px 24px 20px",
    margin: 0,
    fontFamily: "'Space Grotesk', system-ui, sans-serif",
    maxWidth: 560,
    marginLeft: "auto",
    marginRight: "auto",
  },
};
