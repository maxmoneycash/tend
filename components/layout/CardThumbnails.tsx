/* Shared SVG defs used across multiple thumbnails */
function SharedDefs() {
  return (
    <defs>
      {/* USDT Coin */}
      <g id="usdt-coin">
        <path d="M-25,0 L-25,12 A25,12 0 0,0 25,12 L25,0 Z" fill="#156149" stroke="#000" strokeWidth="5" strokeLinejoin="round"/>
        <ellipse cx="0" cy="0" rx="25" ry="12" fill="#26A17B" stroke="#000" strokeWidth="5"/>
        <ellipse cx="0" cy="0" rx="18" ry="8" fill="none" stroke="#FFF" strokeWidth="2" opacity="0.6"/>
        <path d="M-10,-4 L10,-4 L10,-1 L3,-1 L3,6 L-3,6 L-3,-1 L-10,-1 Z" fill="#FFF" stroke="#000" strokeWidth="2" strokeLinejoin="round"/>
      </g>
      {/* Lime Cash Bill */}
      <g id="lime-cash">
        <path d="M-30,-15 L30,-15 L20,15 L-40,15 Z" fill="#D4FF00" stroke="#000" strokeWidth="5" strokeLinejoin="round"/>
        <ellipse cx="-5" cy="0" rx="12" ry="6" fill="#FFF" stroke="#000" strokeWidth="3" transform="rotate(-15 -5 0)"/>
        <circle cx="-20" cy="-8" r="2" fill="#000"/>
        <circle cx="10" cy="8" r="2" fill="#000"/>
      </g>
      {/* Sparkle */}
      <g id="sparkle">
        <path d="M 0,-15 Q 0,0 15,0 Q 0,0 0,15 Q 0,0 -15,0 Q 0,0 0,-15 Z" fill="#FFF"/>
      </g>
      {/* Hex Rain */}
      <g id="hex-rain" fill="#26A17B" fontFamily="monospace" fontSize="12" fontWeight="bold">
        <text x="0" y="0">0x42</text>
        <text x="0" y="15">A9F</text>
        <text x="0" y="30">1B7</text>
        <text x="0" y="45">E04</text>
      </g>
    </defs>
  );
}

/* Card 1: Agent Bank — brain in glass jar with orbiting USDT */
export function AgentBankThumb() {
  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <SharedDefs />
      <ellipse cx="150" cy="260" rx="80" ry="15" fill="#1E293B" opacity="0.9"/>
      <g opacity="0.3">
        <animateTransform attributeName="transform" type="translate" values="0,-50; 0,200" dur="4s" repeatCount="indefinite"/>
        <use href="#hex-rain" x="50" y="0"/>
        <use href="#hex-rain" x="250" y="-30"/>
        <use href="#hex-rain" x="100" y="-80"/>
      </g>
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,5; 0,-5; 0,5" dur="3s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"/>
        <path d="M 80,180 L 220,180 L 200,220 L 100,220 Z" fill="#94A3B8" stroke="#000" strokeWidth="6" strokeLinejoin="round"/>
        <path d="M 100,220 L 200,220 L 200,230 L 100,230 Z" fill="#64748B" stroke="#000" strokeWidth="6" strokeLinejoin="round"/>
        <rect x="120" y="195" width="60" height="15" fill="#000" stroke="#000" strokeWidth="3"/>
        <text x="150" y="206" fill="#D4FF00" fontFamily="monospace" fontSize="10" fontWeight="bold" textAnchor="middle">0x8F...4A</text>
        <path d="M 90,180 L 90,80 A 60,60 0 0,1 210,80 L 210,180 Z" fill="#E0F2FE" stroke="#000" strokeWidth="6" strokeLinejoin="round"/>
        <path d="M 90,180 L 90,120 Q 150,140 210,120 L 210,180 Z" fill="#C4F0FF" opacity="0.7"/>
        <g transform="translate(150, 110)">
          <circle cx="-20" cy="-10" r="15" fill="#FF5C00" stroke="#000" strokeWidth="4"/>
          <circle cx="20" cy="-10" r="15" fill="#FF5C00" stroke="#000" strokeWidth="4"/>
          <circle cx="0" cy="15" r="15" fill="#FF5C00" stroke="#000" strokeWidth="4"/>
          <path d="M -20,-10 L 20,-10 L 0,15 Z" fill="none" stroke="#000" strokeWidth="5" strokeLinejoin="round"/>
          <path d="M -20,-10 L 20,-10 L 0,15 Z" fill="none" stroke="#D4FF00" strokeWidth="2" strokeLinejoin="round"/>
          <circle cx="0" cy="0" r="10" fill="#000"/>
          <circle cx="0" cy="0" r="4" fill="#D4FF00">
            <animate attributeName="r" values="4; 6; 4" dur="1s" repeatCount="indefinite"/>
          </circle>
        </g>
        <path d="M 105,80 A 45,45 0 0,1 150,35" fill="none" stroke="#FFF" strokeWidth="6" strokeLinecap="round" opacity="0.8"/>
        <path d="M 100,100 L 100,160" fill="none" stroke="#FFF" strokeWidth="6" strokeLinecap="round" opacity="0.8"/>
        <g>
          <animateTransform attributeName="transform" type="rotate" values="0 150 130; 360 150 130" dur="4s" repeatCount="indefinite"/>
          <use href="#usdt-coin" x="150" y="20" transform="scale(0.8)"/>
          <use href="#usdt-coin" x="150" y="240" transform="scale(0.8)"/>
        </g>
      </g>
    </svg>
  );
}

/* Card 2: Earn Yield — money tree growing from a pot, coins on branches */
export function EarnYieldThumb() {
  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <SharedDefs />

      {/* Floor shadow */}
      <ellipse cx="150" cy="268" rx="75" ry="12" fill="#1E293B" opacity="0.9"/>

      {/* Pot */}
      <path d="M 105,230 L 195,230 L 185,270 L 115,270 Z" fill="#FF5C00" stroke="#000" strokeWidth="5" strokeLinejoin="round"/>
      {/* Pot rim */}
      <rect x="95" y="222" width="110" height="14" rx="7" fill="#FF5C00" stroke="#000" strokeWidth="5"/>
      {/* Pot band */}
      <rect x="120" y="245" width="60" height="10" rx="5" fill="#CC4A00" stroke="#000" strokeWidth="3"/>
      {/* Dirt */}
      <ellipse cx="150" cy="224" rx="45" ry="6" fill="#5C3D1E" stroke="#000" strokeWidth="3"/>

      {/* Whole tree sways gently */}
      <g>
        <animateTransform attributeName="transform" type="rotate" values="-2 150 225; 2 150 225; -2 150 225" dur="4s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"/>

        {/* Main trunk */}
        <path d="M 150,220 L 150,105" stroke="#5C3D1E" strokeWidth="10" strokeLinecap="round"/>
        <path d="M 150,220 L 150,105" stroke="#7C5A35" strokeWidth="6" strokeLinecap="round"/>

        {/* Left branch */}
        <path d="M 150,160 Q 120,145 90,120" stroke="#5C3D1E" strokeWidth="7" strokeLinecap="round" fill="none"/>
        <path d="M 150,160 Q 120,145 90,120" stroke="#7C5A35" strokeWidth="4" strokeLinecap="round" fill="none"/>

        {/* Right branch */}
        <path d="M 150,140 Q 180,120 215,110" stroke="#5C3D1E" strokeWidth="7" strokeLinecap="round" fill="none"/>
        <path d="M 150,140 Q 180,120 215,110" stroke="#7C5A35" strokeWidth="4" strokeLinecap="round" fill="none"/>

        {/* Small left twig */}
        <path d="M 120,142 Q 105,125 95,155" stroke="#5C3D1E" strokeWidth="5" strokeLinecap="round" fill="none"/>

        {/* Small right twig */}
        <path d="M 185,118 Q 200,100 195,140" stroke="#5C3D1E" strokeWidth="5" strokeLinecap="round" fill="none"/>

        {/* === Leaf clusters (round blobs) === */}
        {/* Top canopy */}
        <circle cx="150" cy="95" r="25" fill="#26A17B" stroke="#000" strokeWidth="4"/>
        <circle cx="135" cy="85" r="18" fill="#2FBF8E" stroke="#000" strokeWidth="3"/>
        <circle cx="165" cy="88" r="16" fill="#1E8C64" stroke="#000" strokeWidth="3"/>

        {/* Left canopy */}
        <circle cx="88" cy="115" r="22" fill="#26A17B" stroke="#000" strokeWidth="4"/>
        <circle cx="78" cy="108" r="14" fill="#2FBF8E" stroke="#000" strokeWidth="3"/>

        {/* Right canopy */}
        <circle cx="218" cy="105" r="22" fill="#26A17B" stroke="#000" strokeWidth="4"/>
        <circle cx="228" cy="98" r="14" fill="#2FBF8E" stroke="#000" strokeWidth="3"/>

        {/* Lower left cluster */}
        <circle cx="92" cy="148" r="16" fill="#26A17B" stroke="#000" strokeWidth="3"/>

        {/* Lower right cluster */}
        <circle cx="198" cy="135" r="16" fill="#26A17B" stroke="#000" strokeWidth="3"/>

        {/* === USDT coins hanging from tree === */}
        {/* Top coin — bobs up and down */}
        <g>
          <animateTransform attributeName="transform" type="translate" values="0,-3; 0,3; 0,-3" dur="2s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"/>
          <g transform="translate(150, 70) scale(0.7)">
            <use href="#usdt-coin"/>
          </g>
        </g>

        {/* Left coin */}
        <g>
          <animateTransform attributeName="transform" type="translate" values="0,2; 0,-4; 0,2" dur="2.5s" begin="0.5s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"/>
          <g transform="translate(75, 95) scale(0.6)">
            <use href="#usdt-coin"/>
          </g>
        </g>

        {/* Right coin */}
        <g>
          <animateTransform attributeName="transform" type="translate" values="0,-2; 0,4; 0,-2" dur="2.2s" begin="0.3s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"/>
          <g transform="translate(225, 85) scale(0.6)">
            <use href="#usdt-coin"/>
          </g>
        </g>

        {/* Extra coin sprouting from lower right */}
        <g>
          <animateTransform attributeName="transform" type="translate" values="0,1; 0,-3; 0,1" dur="1.8s" begin="0.8s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"/>
          <g transform="translate(200, 125) scale(0.5)">
            <use href="#usdt-coin"/>
          </g>
        </g>
      </g>

      {/* Sparkles around the tree */}
      <g transform="translate(60, 70) scale(0.5)">
        <use href="#sparkle"/>
        <animate attributeName="opacity" values="0; 1; 0" dur="2s" repeatCount="indefinite"/>
      </g>
      <g transform="translate(245, 65) scale(0.4)">
        <use href="#sparkle"/>
        <animate attributeName="opacity" values="0; 1; 0" dur="2s" begin="0.7s" repeatCount="indefinite"/>
      </g>
      <g transform="translate(155, 45) scale(0.35)">
        <use href="#sparkle"/>
        <animate attributeName="opacity" values="0; 1; 0" dur="1.5s" begin="1.2s" repeatCount="indefinite"/>
      </g>

      {/* "APY" text on the pot */}
      <text x="150" y="256" textAnchor="middle" fontFamily="'Arial Black', Impact, sans-serif" fontSize="14" fontWeight="900" fill="#FFF" stroke="#000" strokeWidth="3" paintOrder="stroke fill">APY</text>
    </svg>
  );
}

/* Card 3: Leveraged Yield — credit card escrow vault machine */
export function LeveragedYieldThumb() {
  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <SharedDefs />
      <ellipse cx="150" cy="270" rx="90" ry="14" fill="#1E293B" opacity="0.9"/>
      <path d="M 50,110 L 250,110 L 250,260 L 50,260 Z" fill="#94A3B8" stroke="#000" strokeWidth="6" strokeLinejoin="round"/>
      <path d="M 50,110 L 250,110 L 230,60 L 70,60 Z" fill="#64748B" stroke="#000" strokeWidth="6" strokeLinejoin="round"/>
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,-40; 0,10; 0,-40" dur="3s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"/>
        <rect x="110" y="10" width="80" height="50" rx="6" fill="#0F172A" stroke="#000" strokeWidth="4"/>
        <rect x="120" y="20" width="20" height="15" rx="3" fill="#FFD700" stroke="#000" strokeWidth="2"/>
        <path d="M 150,45 L 180,45" stroke="#FFF" strokeWidth="3" strokeLinecap="round"/>
        <path d="M 150,35 L 170,35" stroke="#FFF" strokeWidth="3" strokeLinecap="round"/>
      </g>
      <rect x="90" y="55" width="120" height="10" rx="5" fill="#1E293B" stroke="#000" strokeWidth="5"/>
      <rect x="70" y="130" width="160" height="70" rx="8" fill="#1E293B" stroke="#000" strokeWidth="6"/>
      <rect x="70" y="130" width="160" height="70" rx="8" fill="#C4F0FF" stroke="#000" strokeWidth="3" transform="translate(0, -5)"/>
      <polygon points="80,135 150,190 170,190 100,135" fill="#FFF" opacity="0.5" transform="translate(0, -5)"/>
      <text x="150" y="155" fontFamily="'Arial Black', Impact, sans-serif" fontSize="16" fontWeight="900" fill="#000" textAnchor="middle" transform="translate(0, -5)">ESCROW SECURED</text>
      <g transform="translate(0, -5)">
        <animate attributeName="opacity" values="0; 1; 1; 0" keyTimes="0; 0.4; 0.8; 1" dur="3s" repeatCount="indefinite"/>
        <rect x="85" y="165" width="130" height="26" rx="13" fill="#D4FF00" stroke="#000" strokeWidth="3"/>
        <text x="150" y="184" fontFamily="'Arial Black', Impact, sans-serif" fontSize="15" fontWeight="900" fill="#000" textAnchor="middle">14X LEVERAGE</text>
      </g>
      <g>
        <animateTransform attributeName="transform" type="rotate" values="0 250 165; 45 250 165; 0 250 165" dur="3s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"/>
        <rect x="250" y="155" width="40" height="15" fill="#94A3B8" stroke="#000" strokeWidth="5" rx="7.5"/>
        <circle cx="290" cy="162.5" r="15" fill="#FF5C00" stroke="#000" strokeWidth="5"/>
        <circle cx="286" cy="158" r="4" fill="#FFF" opacity="0.8"/>
      </g>
      <path d="M 90,220 L 210,220 L 210,260 L 90,260 Z" fill="#0F172A" stroke="#000" strokeWidth="6" strokeLinejoin="round"/>
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,0; 0,30; 0,0" dur="3s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"/>
        <animate attributeName="opacity" values="0; 1; 1; 0" keyTimes="0; 0.4; 0.8; 1" dur="3s" repeatCount="indefinite"/>
        <g transform="translate(120, 230) rotate(-15) scale(0.8)"><use href="#lime-cash"/></g>
        <g transform="translate(170, 240) rotate(20) scale(0.9)"><use href="#lime-cash"/></g>
        <g transform="translate(140, 260) scale(0.7)"><use href="#usdt-coin"/></g>
        <g transform="translate(180, 250) rotate(-10) scale(0.8)"><use href="#usdt-coin"/></g>
      </g>
      <text x="60" y="90" fontFamily="'Arial Black', Impact, sans-serif" fontSize="14" fontWeight="900" fill="#1E293B" transform="rotate(-15 60 90)">BORROW</text>
    </svg>
  );
}

/* Card 4: Trade Crypto — animated candlestick chart */
export function TradeCryptoThumb() {
  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <rect x="20" y="20" width="260" height="260" rx="16" fill="#0F172A" stroke="#000" strokeWidth="6"/>
      <rect x="30" y="30" width="240" height="240" rx="8" fill="#1E293B" stroke="#000" strokeWidth="4"/>
      <g stroke="#334155" strokeWidth="2" strokeDasharray="4 4">
        <line x1="30" y1="80" x2="270" y2="80"/>
        <line x1="30" y1="140" x2="270" y2="140"/>
        <line x1="30" y1="200" x2="270" y2="200"/>
        <line x1="90" y1="30" x2="90" y2="270"/>
        <line x1="150" y1="30" x2="150" y2="270"/>
        <line x1="210" y1="30" x2="210" y2="270"/>
      </g>
      <text x="245" y="75" fill="#64748B" fontSize="10" fontFamily="monospace" fontWeight="bold">60k</text>
      <text x="245" y="135" fill="#64748B" fontSize="10" fontFamily="monospace" fontWeight="bold">50k</text>
      <text x="245" y="195" fill="#64748B" fontSize="10" fontFamily="monospace" fontWeight="bold">40k</text>
      {/* Red Candle 1 */}
      <line x1="60" y1="60" x2="60" y2="120" stroke="#000" strokeWidth="6" strokeLinecap="round"/>
      <line x1="60" y1="60" x2="60" y2="120" stroke="#FF2A00" strokeWidth="4" strokeLinecap="round"/>
      <rect x="45" y="80" width="30" height="30" rx="2" fill="#FF2A00" stroke="#000" strokeWidth="4"/>
      {/* Green Candle 1 */}
      <line x1="110" y1="100" x2="110" y2="160" stroke="#000" strokeWidth="6" strokeLinecap="round"/>
      <line x1="110" y1="100" x2="110" y2="160" stroke="#D4FF00" strokeWidth="4" strokeLinecap="round"/>
      <rect x="95" y="110" width="30" height="40" rx="2" fill="#D4FF00" stroke="#000" strokeWidth="4"/>
      {/* Red Candle 2 */}
      <line x1="160" y1="130" x2="160" y2="220" stroke="#000" strokeWidth="6" strokeLinecap="round"/>
      <line x1="160" y1="130" x2="160" y2="220" stroke="#FF2A00" strokeWidth="4" strokeLinecap="round"/>
      <rect x="145" y="150" width="30" height="50" rx="2" fill="#FF2A00" stroke="#000" strokeWidth="4"/>
      {/* Animated Live Green Pump */}
      <g>
        <line x1="210" y1="200" x2="210" stroke="#000" strokeWidth="6" strokeLinecap="round">
          <animate attributeName="y2" values="180; 50; 180" dur="2s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"/>
        </line>
        <line x1="210" y1="200" x2="210" stroke="#D4FF00" strokeWidth="4" strokeLinecap="round">
          <animate attributeName="y2" values="180; 50; 180" dur="2s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"/>
        </line>
        <rect x="195" width="30" rx="2" fill="#D4FF00" stroke="#000" strokeWidth="4">
          <animate attributeName="y" values="180; 70; 180" dur="2s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"/>
          <animate attributeName="height" values="20; 130; 20" dur="2s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"/>
        </rect>
      </g>
      {/* Tracking crosshair + 50X badge */}
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,180; 0,70; 0,180" dur="2s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"/>
        <line x1="30" y1="0" x2="270" y2="0" stroke="#D4FF00" strokeWidth="3" strokeDasharray="6 6"/>
        <rect x="230" y="-12" width="40" height="24" rx="4" fill="#D4FF00" stroke="#000" strokeWidth="3"/>
        <text x="250" y="4" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle" fill="#000">MAX</text>
        <g transform="translate(195, 0)">
          <circle cx="0" cy="0" r="22" fill="#000"/>
          <circle cx="0" cy="-2" r="22" fill="#FF5C00" stroke="#000" strokeWidth="4"/>
          <text x="0" y="5" fontFamily="'Arial Black', Impact, sans-serif" fontSize="16" fontWeight="900" fill="#FFF" stroke="#000" strokeWidth="3" paintOrder="stroke fill" textAnchor="middle">50X</text>
        </g>
      </g>
    </svg>
  );
}

/* Card 5: Content Rewards — video player with view counter and USDT coins */
export function ContentRewardsThumb() {
  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <SharedDefs />
      <ellipse cx="150" cy="268" rx="80" ry="12" fill="#1E293B" opacity="0.9" />

      {/* Floating device */}
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,5; 0,-5; 0,5" dur="3s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />

        {/* Phone body */}
        <rect x="70" y="40" width="160" height="210" rx="18" fill="#0F172A" stroke="#000" strokeWidth="6" />
        <rect x="80" y="55" width="140" height="180" rx="6" fill="#1E293B" />

        {/* Video thumbnail area */}
        <rect x="85" y="60" width="130" height="90" rx="4" fill="#334155" />
        {/* Play button */}
        <circle cx="150" cy="105" r="20" fill="#8B5CF6" stroke="#000" strokeWidth="4" />
        <polygon points="144,95 144,115 162,105" fill="#FFF" stroke="#000" strokeWidth="2" />

        {/* View counter bar */}
        <rect x="85" y="155" width="130" height="24" rx="4" fill="#8B5CF6" stroke="#000" strokeWidth="3" />
        <text x="150" y="171" textAnchor="middle" fill="#FFF" fontFamily="monospace" fontSize="10" fontWeight="bold">842K VIEWS</text>

        {/* Clipper stats */}
        <rect x="85" y="185" width="62" height="20" rx="3" fill="#1E293B" stroke="#334155" strokeWidth="2" />
        <text x="116" y="199" textAnchor="middle" fill="#A78BFA" fontFamily="monospace" fontSize="8" fontWeight="bold">47 CLIPS</text>
        <rect x="153" y="185" width="62" height="20" rx="3" fill="#1E293B" stroke="#334155" strokeWidth="2" />
        <text x="184" y="199" textAnchor="middle" fill="#26A17B" fontFamily="monospace" fontSize="8" fontWeight="bold">$1,684</text>

        {/* Earnings bar */}
        <rect x="85" y="211" width="130" height="8" rx="4" fill="#1E293B" stroke="#334155" strokeWidth="1" />
        <rect x="85" y="211" width="95" height="8" rx="4" fill="#8B5CF6" opacity="0.8">
          <animate attributeName="width" values="30; 95; 30" dur="3s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
        </rect>
      </g>

      {/* Flying USDT coins */}
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,0; 30,-40" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1; 0" dur="1.5s" repeatCount="indefinite" />
        <g transform="translate(230, 140) scale(0.6)">
          <use href="#usdt-coin" />
        </g>
      </g>
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,0; -25,-30" dur="1.8s" begin="0.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1; 0" dur="1.8s" begin="0.5s" repeatCount="indefinite" />
        <g transform="translate(55, 120) scale(0.5)">
          <use href="#usdt-coin" />
        </g>
      </g>

      {/* Sparkles */}
      <g transform="translate(250, 80) scale(0.4)">
        <use href="#sparkle" />
        <animate attributeName="opacity" values="0; 1; 0" dur="2s" repeatCount="indefinite" />
      </g>
      <g transform="translate(45, 75) scale(0.35)">
        <use href="#sparkle" />
        <animate attributeName="opacity" values="0; 1; 0" dur="2s" begin="0.8s" repeatCount="indefinite" />
      </g>
    </svg>
  );
}

/* Card 6: Confidential Assets — shield with encrypted balance */
export function ConfidentialThumb() {
  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <SharedDefs />
      <ellipse cx="150" cy="268" rx="80" ry="12" fill="#1E293B" opacity="0.9" />

      {/* Main shield */}
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,5; 0,-5; 0,5" dur="3s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />

        {/* Shield shape */}
        <path d="M 150,40 L 230,80 L 230,160 Q 230,230 150,260 Q 70,230 70,160 L 70,80 Z" fill="#0D9488" stroke="#000" strokeWidth="6" strokeLinejoin="round" />
        <path d="M 150,55 L 215,88 L 215,155 Q 215,215 150,242 Q 85,215 85,155 L 85,88 Z" fill="#14B8A6" stroke="#000" strokeWidth="3" />

        {/* Lock icon */}
        <rect x="125" y="130" width="50" height="40" rx="6" fill="#0F172A" stroke="#000" strokeWidth="4" />
        <path d="M 135,130 L 135,115 A 15,15 0 0,1 165,115 L 165,130" fill="none" stroke="#000" strokeWidth="6" strokeLinecap="round" />
        <path d="M 135,130 L 135,115 A 15,15 0 0,1 165,115 L 165,130" fill="none" stroke="#FFF" strokeWidth="3" strokeLinecap="round" />
        <circle cx="150" cy="150" r="5" fill="#14B8A6" />
        <line x1="150" y1="153" x2="150" y2="162" stroke="#14B8A6" strokeWidth="3" strokeLinecap="round" />

        {/* Hidden balance text */}
        <text x="150" y="105" textAnchor="middle" fill="#FFF" fontFamily="monospace" fontSize="14" fontWeight="bold" opacity="0.9">
          $••••••
          <animate attributeName="opacity" values="0.9; 0.4; 0.9" dur="2s" repeatCount="indefinite" />
        </text>

        {/* ZK proof badge */}
        <rect x="115" y="185" width="70" height="20" rx="10" fill="#000" stroke="#14B8A6" strokeWidth="2" />
        <text x="150" y="199" textAnchor="middle" fill="#14B8A6" fontFamily="monospace" fontSize="9" fontWeight="bold">ZK PROOF</text>
      </g>

      {/* Floating encrypted hex */}
      <g opacity="0.3">
        <text x="50" y="80" fill="#14B8A6" fontFamily="monospace" fontSize="10">aE4f</text>
        <text x="230" y="100" fill="#14B8A6" fontFamily="monospace" fontSize="10">7B2c</text>
        <text x="40" y="200" fill="#14B8A6" fontFamily="monospace" fontSize="10">D91a</text>
        <text x="240" y="220" fill="#14B8A6" fontFamily="monospace" fontSize="10">3F8e</text>
        <animateTransform attributeName="transform" type="translate" values="0,0; 0,-10; 0,0" dur="4s" repeatCount="indefinite" />
      </g>
    </svg>
  );
}

/* Card 7: Send Money — money gun shooting USDT and cash */
export function SendMoneyThumb() {
  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <SharedDefs />
      <ellipse cx="150" cy="260" rx="90" ry="15" fill="#1E293B" opacity="0.9"/>
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,0; -10,-5; 0,0" dur="0.2s" repeatCount="indefinite"/>
        {/* Projectiles */}
        <g>
          <animateTransform attributeName="transform" type="translate" values="200,100; 400,100" dur="0.3s" repeatCount="indefinite"/>
          <use href="#usdt-coin" transform="scale(0.8)"/>
        </g>
        <g>
          <animateTransform attributeName="transform" type="translate" values="180,120; 380,120" dur="0.3s" begin="0.1s" repeatCount="indefinite"/>
          <use href="#usdt-coin" transform="scale(0.6) rotate(20)"/>
        </g>
        <g>
          <animateTransform attributeName="transform" type="translate" values="190,80; 390,80" dur="0.3s" begin="0.2s" repeatCount="indefinite"/>
          <use href="#lime-cash" transform="scale(0.7) rotate(-15)"/>
        </g>
        {/* Gun Body */}
        <path d="M 40,70 L 200,70 L 200,130 L 150,130 L 120,240 L 60,240 L 90,130 L 40,130 Z" fill="#FF5C00" stroke="#000" strokeWidth="6" strokeLinejoin="round"/>
        <path d="M 40,130 L 200,130 L 200,140 L 40,140 Z" fill="#CC4A00" stroke="#000" strokeWidth="6" strokeLinejoin="round"/>
        <path d="M 70,150 L 110,150 L 100,230 L 60,230 Z" fill="#1E293B" stroke="#000" strokeWidth="5" strokeLinejoin="round"/>
        <rect x="180" y="80" width="30" height="40" fill="#0F172A" stroke="#000" strokeWidth="5" rx="5"/>
        <rect x="190" y="85" width="20" height="30" fill="#D4FF00"/>
        <text x="120" y="115" fontFamily="'Arial Black', Impact, sans-serif" fontSize="36" fontWeight="900" fontStyle="italic" fill="#FFF" textAnchor="middle">SEND</text>
        <path d="M 10,90 L 30,90" stroke="#000" strokeWidth="5" strokeLinecap="round"/>
        <path d="M 20,110 L 40,110" stroke="#000" strokeWidth="5" strokeLinecap="round"/>
        <g transform="translate(220, 100)">
          <animateTransform attributeName="transform" type="scale" values="0.5; 1.5; 0.5" dur="0.2s" repeatCount="indefinite" additive="sum"/>
          <path d="M 0,-15 Q 0,0 15,0 Q 0,0 0,15 Q 0,0 -15,0 Q 0,0 0,-15 Z" fill="#FFF"/>
        </g>
      </g>
    </svg>
  );
}
