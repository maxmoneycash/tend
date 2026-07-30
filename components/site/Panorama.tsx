/**
 * The Bay at dawn — layered lithograph panorama. Hand-built SVG (no network
 * dependency), fog bands drift on a slow loop, still under reduced motion.
 */
export function Panorama({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 460"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      role="img"
      aria-label="Layered panorama of San Francisco Bay at dawn: ridgelines, fog bands, dark water, a low sun"
    >
      {/* sky */}
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fafbfb" />
          <stop offset="62%" stopColor="#e7eeed" />
          <stop offset="100%" stopColor="#cfdedd" />
        </linearGradient>
        <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2e5f66" />
          <stop offset="100%" stopColor="#14333d" />
        </linearGradient>
      </defs>
      <rect width="1440" height="460" fill="url(#sky)" />

      {/* low sun */}
      <circle cx="1082" cy="212" r="46" fill="#e3a52f" />

      {/* far ridgeline */}
      <path
        d="M0 258 C 140 232 236 246 340 236 C 470 224 540 200 660 210 C 780 220 830 246 960 240 C 1080 235 1150 214 1250 222 C 1330 228 1390 240 1440 236 L 1440 460 L 0 460 Z"
        fill="#9db8b6"
      />

      {/* drifting fog band A */}
      <g className="fog-a" opacity="0.55">
        <ellipse cx="360" cy="272" rx="300" ry="26" fill="#fafbfb" />
        <ellipse cx="900" cy="262" rx="360" ry="22" fill="#fafbfb" />
        <ellipse cx="1380" cy="276" rx="260" ry="24" fill="#fafbfb" />
      </g>

      {/* mid ridgeline */}
      <path
        d="M0 306 C 120 288 220 300 320 292 C 450 282 520 262 640 272 C 760 282 840 306 980 298 C 1120 290 1200 270 1320 280 C 1390 286 1420 292 1440 290 L 1440 460 L 0 460 Z"
        fill="#5d8380"
      />

      {/* drifting fog band B */}
      <g className="fog-b" opacity="0.4">
        <ellipse cx="220" cy="318" rx="260" ry="20" fill="#fafbfb" />
        <ellipse cx="760" cy="326" rx="340" ry="18" fill="#fafbfb" />
        <ellipse cx="1240" cy="316" rx="300" ry="22" fill="#fafbfb" />
      </g>

      {/* near ridge / marsh edge */}
      <path
        d="M0 352 C 160 336 260 348 380 342 C 520 334 600 318 720 326 C 850 335 930 354 1060 348 C 1180 342 1280 326 1440 338 L 1440 460 L 0 460 Z"
        fill="#2e5f66"
      />

      {/* water */}
      <path
        d="M0 396 C 220 388 420 392 720 390 C 1020 388 1240 392 1440 388 L 1440 460 L 0 460 Z"
        fill="url(#water)"
      />
      {/* sun path on water */}
      <rect x="1054" y="396" width="56" height="64" fill="#e3a52f" opacity="0.28" />

      {/* tule reeds, near bank */}
      <g stroke="#0e2630" strokeWidth="3" strokeLinecap="round" opacity="0.85">
        <path d="M84 460 C 82 430 86 412 80 396" fill="none" />
        <path d="M102 460 C 104 426 98 410 106 392" fill="none" />
        <path d="M122 460 C 118 434 124 420 118 402" fill="none" />
        <path d="M1348 460 C 1350 432 1344 416 1352 400" fill="none" />
        <path d="M1368 460 C 1364 436 1370 418 1362 404" fill="none" />
      </g>
    </svg>
  );
}
