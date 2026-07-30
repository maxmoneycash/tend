"use client";

import { useState, useEffect, useRef, useId } from "react";

// Pillar base heights & positions — represent yield tiers (low/mid/high)
const PILLARS = [
  { x: 60, y: -10, baseH: 60 },
  { x: 100, y: -30, baseH: 120 },
  { x: 140, y: -50, baseH: 190 },
] as const;

const CYCLE_DURATION = 3; // seconds per loop

export function HeroAnimation() {
  const uid = useId().replace(/:/g, "");
  const [heights, setHeights] = useState([0, 0, 0]);
  const [yieldEarned, setYieldEarned] = useState(0);
  const [apy, setApy] = useState(18.5);
  const [cycle, setCycle] = useState(0);
  const startRef = useRef(Date.now());

  // Reset cycle every CYCLE_DURATION seconds
  useEffect(() => {
    const interval = setInterval(() => {
      startRef.current = Date.now();
      setCycle(c => c + 1);
      setYieldEarned(0);
    }, CYCLE_DURATION * 1000);
    return () => clearInterval(interval);
  }, []);

  // Smooth pillar growth — resets each cycle
  useEffect(() => {
    let rafId: number;
    const frame = () => {
      const t = (Date.now() - startRef.current) / 1000;

      setHeights(PILLARS.map(p => {
        const delay = (p.baseH / 190) * 0.3;
        const elapsed = Math.max(0, t - delay);
        // Fill to full height over ~1.8s with concave ease
        const progress = Math.min(1, elapsed / 1.8) ** 0.4;
        return Math.round(p.baseH * progress);
      }));

      rafId = requestAnimationFrame(frame);
    };
    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [cycle]);

  // Yield counter + APY drift
  useEffect(() => {
    const interval = setInterval(() => {
      setYieldEarned(prev => prev + 0.0127);
      setApy(() => 18.5 + Math.sin(Date.now() / 4000) * 0.5);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  // Trend line path connecting pillar tops
  const linePoints = PILLARS.map((p, i) => `${p.x} ${p.y - heights[i]}`);
  const linePath = `M ${linePoints[0]} L ${linePoints[1]} L ${linePoints[2]}`;

  return (
    <div className="w-full">
      <svg viewBox="80 20 640 650" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
        <defs>
          <filter id={`${uid}-blur`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="25" result="blur" />
            <feFlood floodColor="#FF6243" floodOpacity="0.15" result="color" />
            <feComposite in="color" in2="blur" operator="in" />
          </filter>

          <filter id={`${uid}-cshadow`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feFlood floodColor="#26A17B" floodOpacity="0.3" result="color" />
            <feComposite in="color" in2="blur" operator="in" />
          </filter>

          <filter id={`${uid}-glow`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <linearGradient id={`${uid}-body`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4A5054" />
            <stop offset="10%" stopColor="#8E9499" />
            <stop offset="25%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#A5ACB2" />
            <stop offset="80%" stopColor="#FFFFFF" />
            <stop offset="90%" stopColor="#6B7176" />
            <stop offset="100%" stopColor="#2A2E31" />
          </linearGradient>

          <linearGradient id={`${uid}-rim`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="30%" stopColor="#BCC3C8" />
            <stop offset="70%" stopColor="#7A8085" />
            <stop offset="100%" stopColor="#3A3E41" />
          </linearGradient>

          <linearGradient id={`${uid}-ridge`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5B6064" />
            <stop offset="50%" stopColor="#A5ACB2" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>

          <linearGradient id={`${uid}-green`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3CD2A5" />
            <stop offset="50%" stopColor="#26A17B" />
            <stop offset="100%" stopColor="#186B51" />
          </linearGradient>

          <linearGradient id={`${uid}-cardbg`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1A1A1D" />
            <stop offset="100%" stopColor="#0F0F11" />
          </linearGradient>

          <clipPath id={`${uid}-clip`}>
            <path d="M -40 0 L -40 12 A 40 20 0 0 0 40 12 L 40 0 Z" />
          </clipPath>

          <g id={`${uid}-coin`}>
            <ellipse cx="0" cy="14" rx="40" ry="20" fill="#000" opacity="0.4" />
            <path d="M -40 0 L -40 12 A 40 20 0 0 0 40 12 L 40 0 Z" fill={`url(#${uid}-body)`} />
            <g clipPath={`url(#${uid}-clip)`}>
              <path
                d="M -38 -10 L -38 40 M -34 -10 L -34 40 M -30 -10 L -30 40 M -26 -10 L -26 40 M -22 -10 L -22 40 M -18 -10 L -18 40 M -14 -10 L -14 40 M -10 -10 L -10 40 M -6 -10 L -6 40 M -2 -10 L -2 40 M 2 -10 L 2 40 M 6 -10 L 6 40 M 10 -10 L 10 40 M 14 -10 L 14 40 M 18 -10 L 18 40 M 22 -10 L 22 40 M 26 -10 L 26 40 M 30 -10 L 30 40 M 34 -10 L 34 40 M 38 -10 L 38 40"
                stroke="#000" strokeWidth="1" opacity="0.15"
              />
            </g>
            <g transform="scale(1, 0.5)">
              <circle cx="0" cy="0" r="40" fill={`url(#${uid}-rim)`} />
              <circle cx="0" cy="0" r="35" fill={`url(#${uid}-ridge)`} />
              <circle cx="0" cy="0" r="31" fill={`url(#${uid}-green)`} />
              <circle cx="0" cy="0" r="31" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.3" />
              <g transform="scale(1.15)">
                <rect x="-13" y="-12" width="26" height="4.5" fill="#FFF" rx="0.5" />
                <rect x="-3.5" y="-8.5" width="7" height="23" fill="#FFF" rx="0.5" />
                <path
                  fillRule="evenodd"
                  d="M 0 -3.5 A 16 5 0 1 0 0 6.5 A 16 5 0 1 0 0 -3.5 Z M 0 -0.5 A 10.5 2 0 1 0 0 3.5 A 10.5 2 0 1 0 0 -0.5 Z"
                  fill="#FFF"
                />
              </g>
            </g>
          </g>
        </defs>

        {/* Ambient Background */}
        <ellipse cx="400" cy="550" rx="250" ry="60" fill="#FF6243" filter={`url(#${uid}-blur)`} className="hero-bg-pulse" />
        <ellipse cx="400" cy="480" rx="150" ry="80" fill="#26A17B" filter={`url(#${uid}-cshadow)`} className="hero-bg-pulse" style={{ animationDelay: "2s" }} />

        {/* Floating UI Dashboard — live numbers */}
        <g transform="translate(400, 120)">
          <g className="hero-card-float">
            <rect x="-150" y="-45" width="300" height="90" rx="16" fill={`url(#${uid}-cardbg)`} stroke="#FF6243" strokeWidth="2" filter={`url(#${uid}-glow)`} />
            <rect x="-148" y="-43" width="296" height="86" rx="14" fill="rgba(255, 98, 67, 0.05)" />
            <path d="M -130 -43 L -50 -43" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.1" strokeLinecap="round" />
            <circle cx="-100" cy="0" r="24" fill="#FF6243" />
            <path d="M -114 -8 L -106 8 L -100 -2 L -94 8 L -86 -8" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <text x="-60" y="-12" fill="#FFFFFF" fontSize="12" fontWeight="700" letterSpacing="2">WHOP YIELD</text>
            <text x="-60" y="12" fill="#26A17B" fontSize="26" fontWeight="900">
              {apy.toFixed(1)}%
              <tspan fill="#888" fontSize="12" fontWeight="600" letterSpacing="1"> APY</tspan>
            </text>
            <text x="-60" y="32" fill="#26A17B" fontSize="13" fontWeight="600" opacity="0.8">
              +${yieldEarned.toFixed(4)}
              <tspan fill="#555" fontSize="11"> earned</tspan>
            </text>
          </g>
        </g>

        {/* Main 3D Isometric Scene */}
        <g transform="translate(400, 480)">
          <g className="hero-platform-float">
            {/* Outer Glow */}
            <polygon points="0,150 260,20 0,-110 -260,20" fill="none" stroke="#FF6243" strokeWidth="8" opacity="0.2" filter={`url(#${uid}-glow)`} />

            {/* Middle Tier */}
            <g transform="translate(0, 20)">
              <polygon points="0,130 240,10 240,30 0,150" fill="#0A0A0A" />
              <polygon points="-240,10 0,130 0,150 -240,30" fill="#151515" />
              <polygon points="0,-110 240,10 0,130 -240,10" fill="#0C0C0D" />
            </g>

            {/* Top Main Tier */}
            <polygon points="0,110 220,0 0,-110 -220,0" fill="#131315" stroke="#FF6243" strokeWidth="2" strokeLinejoin="round" />

            {/* Neon Circuit Lines */}
            <polygon points="0,80 160,-0 0,-80 -160,-0" fill="none" stroke="#FF6243" strokeWidth="1.5" opacity="0.6" />
            <polygon points="0,50 100,-0 0,-50 -100,-0" fill="none" stroke="#FF6243" strokeWidth="1" opacity="0.3" />
            <line x1="-160" y1="0" x2="-220" y2="0" stroke="#FF6243" strokeWidth="1.5" opacity="0.6" />
            <line x1="160" y1="0" x2="220" y2="0" stroke="#FF6243" strokeWidth="1.5" opacity="0.6" />
            <line x1="0" y1="80" x2="0" y2="110" stroke="#FF6243" strokeWidth="1.5" opacity="0.6" />

            {/* Yield Pillars — grow like a balance accumulating, reset each cycle */}
            {PILLARS.map((p, i) => {
              const h = heights[i];
              if (h < 1) return null;
              return (
                <g key={`${cycle}-${i}`} transform={`translate(${p.x}, ${p.y})`}>
                  <polygon points={`-20,${-h} 0,${-h + 10} 0,10 -20,0`} fill="#CC4D00" />
                  <polygon points={`0,${-h + 10} 20,${-h} 20,0 0,10`} fill="#FF6243" />
                  <polygon points={`0,${-h - 10} 20,${-h} 0,${-h + 10} -20,${-h}`} fill="#FFA085" />
                  <line x1="0" y1={-h + 10} x2="0" y2="10" stroke="#FFFFFF" opacity="0.15" strokeWidth="2" />
                </g>
              );
            })}

            {/* Floating text on tallest pillar */}
            <g transform="translate(140, -50)">
              <text x="0" y={-heights[2] - 20} className="hero-yield-text" fill="#FF6243" fontSize="16" style={{ animationDelay: "0.8s" }} textAnchor="middle">+ MAX</text>
            </g>

            {/* Coin Stack 1 (Back-Left) — key resets CSS animation each cycle */}
            <g transform="translate(-100, -40)">
              <g key={`c1-0-${cycle}`} className="hero-coin-drop" style={{ animationDelay: "0.1s" }}><use href={`#${uid}-coin`} x="0" y="0" /></g>
              <g key={`c1-1-${cycle}`} className="hero-coin-drop" style={{ animationDelay: "0.2s" }}><use href={`#${uid}-coin`} x="0" y="-12" /></g>
              <g key={`c1-2-${cycle}`} className="hero-coin-drop" style={{ animationDelay: "0.3s" }}><use href={`#${uid}-coin`} x="0" y="-24" /></g>
              <g key={`c1-3-${cycle}`} className="hero-coin-drop" style={{ animationDelay: "0.4s" }}><use href={`#${uid}-coin`} x="0" y="-36" /></g>
              <g key={`c1-4-${cycle}`} className="hero-coin-drop" style={{ animationDelay: "0.5s" }}><use href={`#${uid}-coin`} x="0" y="-48" /></g>
              <g key={`c1-5-${cycle}`} className="hero-coin-drop" style={{ animationDelay: "0.6s" }}><use href={`#${uid}-coin`} x="0" y="-60" /></g>
              <text x="-40" y="-105" className="hero-yield-text" fill="#26A17B" fontSize="18" style={{ animationDelay: "0.5s" }}>+${(142.5 + yieldEarned * 8).toFixed(2)}</text>
            </g>

            {/* Coin Stack 2 (Mid-Left) */}
            <g transform="translate(-50, -10)">
              <g key={`c2-0-${cycle}`} className="hero-coin-drop" style={{ animationDelay: "0.3s" }}><use href={`#${uid}-coin`} x="0" y="0" /></g>
              <g key={`c2-1-${cycle}`} className="hero-coin-drop" style={{ animationDelay: "0.4s" }}><use href={`#${uid}-coin`} x="0" y="-12" /></g>
              <g key={`c2-2-${cycle}`} className="hero-coin-drop" style={{ animationDelay: "0.5s" }}><use href={`#${uid}-coin`} x="0" y="-24" /></g>
              <g key={`c2-3-${cycle}`} className="hero-coin-drop" style={{ animationDelay: "0.6s" }}><use href={`#${uid}-coin`} x="0" y="-36" /></g>
              <g key={`c2-4-${cycle}`} className="hero-coin-drop" style={{ animationDelay: "0.7s" }}><use href={`#${uid}-coin`} x="0" y="-48" /></g>
            </g>

            {/* Coin Stack 3 (Front Center) */}
            <g transform="translate(0, 20)">
              <g key={`c3-0-${cycle}`} className="hero-coin-drop" style={{ animationDelay: "0.5s" }}><use href={`#${uid}-coin`} x="0" y="0" /></g>
              <g key={`c3-1-${cycle}`} className="hero-coin-drop" style={{ animationDelay: "0.6s" }}><use href={`#${uid}-coin`} x="0" y="-12" /></g>
              <g key={`c3-2-${cycle}`} className="hero-coin-drop" style={{ animationDelay: "0.7s" }}><use href={`#${uid}-coin`} x="0" y="-24" /></g>
              <text x="30" y="-55" className="hero-yield-text" fill="#26A17B" fontSize="14" style={{ animationDelay: "0.8s" }}>+${(18.2 + yieldEarned * 2).toFixed(2)}</text>
            </g>

            {/* Coin Stack 4 (Far Front-Right) */}
            <g transform="translate(60, 40)">
              <g key={`c4-0-${cycle}`} className="hero-coin-drop" style={{ animationDelay: "0.6s" }}><use href={`#${uid}-coin`} x="0" y="0" /></g>
              <g key={`c4-1-${cycle}`} className="hero-coin-drop" style={{ animationDelay: "0.7s" }}><use href={`#${uid}-coin`} x="0" y="-12" /></g>
            </g>

            {/* Glowing Yield Trend Line — dynamic, follows pillar tops */}
            {heights[0] > 30 && (
              <g key={`line-${cycle}`}>
                <path d={linePath} fill="none" stroke="#26A17B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="hero-glow-line" />
                <circle cx={PILLARS[0].x} cy={PILLARS[0].y - heights[0]} r="4" fill="#FFFFFF" className="hero-glow-line" />
                <circle cx={PILLARS[1].x} cy={PILLARS[1].y - heights[1]} r="4" fill="#FFFFFF" className="hero-glow-line" />
                <circle cx={PILLARS[2].x} cy={PILLARS[2].y - heights[2]} r="6" fill="#26A17B" stroke="#FFFFFF" strokeWidth="2" className="hero-glow-line" />
              </g>
            )}
          </g>
        </g>

        {/* Foreground Floating Particles */}
        <g opacity="0.6">
          <circle cx="200" cy="250" r="3" fill="#26A17B" className="hero-yield-text" style={{ animationDelay: "0s", animationDuration: "4s" }} />
          <circle cx="650" cy="300" r="4" fill="#FF6243" className="hero-yield-text" style={{ animationDelay: "1s", animationDuration: "5s" }} />
          <circle cx="250" cy="650" r="2" fill="#26A17B" className="hero-yield-text" style={{ animationDelay: "2s", animationDuration: "3.5s" }} />
          <circle cx="550" cy="600" r="5" fill="#FF6243" className="hero-yield-text" style={{ animationDelay: "0.5s", animationDuration: "6s" }} />
        </g>
      </svg>
    </div>
  );
}
