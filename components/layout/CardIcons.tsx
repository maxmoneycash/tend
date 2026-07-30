/*
 * Whop-style illustrative title icons for feature cards.
 * Style: dotted/dashed outlines, filled accent shapes, playful geometric compositions.
 * Matches the icon style on whop.com/payments.
 */

/* Earn Yield — coin stack with upward arrow, growth feel */
export function EarnYieldIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
      {/* Dashed outline coin base */}
      <rect x="4" y="22" width="22" height="14" rx="3" stroke="#0DA726" strokeWidth="2" strokeDasharray="3 2" />
      {/* Solid filled coin on top */}
      <rect x="8" y="18" width="22" height="14" rx="3" fill="#0DA726" />
      {/* Dollar sign on coin */}
      <text x="19" y="29" textAnchor="middle" fill="#fff" fontFamily="system-ui" fontSize="10" fontWeight="700">$</text>
      {/* Upward growth arrow */}
      <path d="M32 16 L32 6 L36 10" stroke="#0DA726" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M32 6 L28 10" stroke="#0DA726" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Sparkle dot */}
      <circle cx="36" cy="4" r="1.5" fill="#0DA726" />
    </svg>
  );
}

/* Trade Crypto — chart screen with candlestick, trading feel */
export function TradeCryptoIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
      {/* Dashed monitor outline */}
      <rect x="2" y="4" width="30" height="24" rx="4" stroke="#FA4616" strokeWidth="2" strokeDasharray="3 2" />
      {/* Solid screen */}
      <rect x="6" y="8" width="30" height="24" rx="4" fill="#FA4616" />
      {/* Candlestick bars on screen */}
      <line x1="14" y1="14" x2="14" y2="26" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <rect x="12" y="17" width="4" height="5" rx="0.5" fill="#fff" />
      <line x1="21" y1="12" x2="21" y2="28" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <rect x="19" y="14" width="4" height="7" rx="0.5" fill="#fff" />
      <line x1="28" y1="15" x2="28" y2="25" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <rect x="26" y="18" width="4" height="4" rx="0.5" fill="#fff" />
      {/* Monitor stand */}
      <path d="M17 32 L17 35 L13 36 L23 36 L19 35 L19 32" stroke="#FA4616" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* Send Money — paper airplane with motion lines */
export function SendMoneyIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
      {/* Dashed circle path */}
      <circle cx="20" cy="20" r="16" stroke="#3B82F6" strokeWidth="2" strokeDasharray="3 2" />
      {/* Solid paper airplane */}
      <path d="M10 20 L30 10 L22 30 L18 22 Z" fill="#3B82F6" />
      <path d="M18 22 L30 10" stroke="#fff" strokeWidth="1.5" />
      {/* Motion lines */}
      <line x1="6" y1="14" x2="12" y2="14" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="4" y1="20" x2="8" y2="20" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="6" y1="26" x2="11" y2="26" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* Leveraged Yield — stacked layers with multiply symbol */
export function LeveragedYieldIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
      {/* Bottom dashed layer */}
      <rect x="2" y="20" width="24" height="16" rx="3" stroke="#FA4616" strokeWidth="2" strokeDasharray="3 2" />
      {/* Middle layer */}
      <rect x="6" y="14" width="24" height="16" rx="3" fill="#FA4616" opacity="0.4" stroke="#FA4616" strokeWidth="1.5" />
      {/* Top solid layer */}
      <rect x="10" y="8" width="24" height="16" rx="3" fill="#FA4616" />
      {/* Multiply "×" on top layer */}
      <text x="22" y="20" textAnchor="middle" fill="#fff" fontFamily="system-ui" fontSize="12" fontWeight="800">×</text>
      {/* Arrow pointing up-right */}
      <path d="M32 10 L37 5 M37 5 L37 9 M37 5 L33 5" stroke="#FA4616" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* Content Rewards — whop clipping logo with dashed outline */
export function ContentRewardsIcon() {
  return (
    <div className="relative w-full h-full">
      {/* Dashed orange outline box behind */}
      <svg viewBox="0 0 40 40" fill="none" className="absolute inset-0 w-full h-full">
        <rect x="2" y="4" width="30" height="24" rx="4" stroke="#FA4616" strokeWidth="2" strokeDasharray="3 2" />
      </svg>
      {/* Clipping logo on top */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/whop-clipping-logo.png"
        alt="Whop Clipping"
        className="absolute top-[8px] left-[6px] w-[30px] h-[24px] rounded-[4px] object-cover"
      />
    </div>
  );
}

/* Confidential Assets — shield with lock */
export function ConfidentialIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
      {/* Dashed shield outline */}
      <path d="M20 2 L34 10 L34 22 Q34 34 20 38 Q6 34 6 22 L6 10 Z" stroke="#0D9488" strokeWidth="2" strokeDasharray="3 2" />
      {/* Solid shield */}
      <path d="M20 6 L30 12 L30 22 Q30 30 20 34 Q10 30 10 22 L10 12 Z" fill="#0D9488" />
      {/* Lock */}
      <rect x="16" y="20" width="8" height="7" rx="1.5" fill="#fff" />
      <path d="M18 20 L18 17 A2 2 0 0 1 22 17 L22 20" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <circle cx="20" cy="23" r="1" fill="#0D9488" />
    </svg>
  );
}

/* Agent Bank — robot/AI head with circuit dots */
export function AgentBankIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
      {/* Dashed head outline */}
      <rect x="4" y="10" width="24" height="22" rx="5" stroke="#8B5CF6" strokeWidth="2" strokeDasharray="3 2" />
      {/* Solid head */}
      <rect x="8" y="6" width="24" height="22" rx="5" fill="#8B5CF6" />
      {/* Eyes */}
      <circle cx="16" cy="15" r="2.5" fill="#fff" />
      <circle cx="24" cy="15" r="2.5" fill="#fff" />
      {/* Mouth — grid/circuit pattern */}
      <line x1="14" y1="22" x2="26" y2="22" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="17" y1="22" x2="17" y2="25" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="23" y1="22" x2="23" y2="25" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
      {/* Antenna */}
      <line x1="20" y1="6" x2="20" y2="2" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="1" r="1.5" fill="#8B5CF6" />
      {/* Circuit dots */}
      <circle cx="36" cy="12" r="1.5" fill="#8B5CF6" />
      <circle cx="36" cy="20" r="1.5" fill="#8B5CF6" />
      <line x1="32" y1="12" x2="36" y2="12" stroke="#8B5CF6" strokeWidth="1" strokeDasharray="2 1" />
      <line x1="32" y1="20" x2="36" y2="20" stroke="#8B5CF6" strokeWidth="1" strokeDasharray="2 1" />
    </svg>
  );
}
