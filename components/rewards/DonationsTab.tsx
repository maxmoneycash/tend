"use client";

/* Streamed donations — USDC on Tempo, offramped to the tribe with Stripe.
 * Demo-mode feed in the Content Rewards visual system. */

const FEED = [
  { who: "natasha_r", amount: "$42.00", program: "Yunakin Land Tax", when: "just now", status: "streaming" },
  { who: "ci-runner @ acme-robotics", amount: "$25.00", program: "Yunakin Land Tax", when: "1m ago", status: "offramped" },
  { who: "supporter_0x9e21", amount: "$15.00", program: "Muwekma Ohlone contribution", when: "3m ago", status: "offramped" },
  { who: "sarah_c", amount: "$100.00", program: "Muwekma Ohlone contribution", when: "9m ago", status: "offramped" },
  { who: "fleet-7 @ mission-labs", amount: "$25.00", program: "Yunakin Land Tax", when: "14m ago", status: "offramped" },
  { who: "alex_w", amount: "$85.50", program: "Yunakin Land Tax", when: "22m ago", status: "offramped" },
];

const PROGRAMS = [
  { name: "Yunakin Land Tax", org: "Association of Ramaytush Ohlone", raised: 2340, goal: 5000 },
  { name: "Muwekma Ohlone contribution", org: "Muwekma Ohlone Preservation Foundation", raised: 1180, goal: 5000 },
];

export function DonationsTab() {
  return (
    <div className="space-y-4">
      {/* stat row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="surface-1 rounded-[16px] p-4">
          <p className="text-[9px] text-zinc-500 uppercase tracking-wider">Total streamed</p>
          <p className="font-mono text-[26px] font-bold text-white tracking-tight">$3,520</p>
          <p className="text-[10px] text-green-400 font-mono mt-0.5">USDC on Tempo</p>
        </div>
        <div className="surface-1 rounded-[16px] p-4">
          <p className="text-[9px] text-zinc-500 uppercase tracking-wider">Offramped via Stripe</p>
          <p className="font-mono text-[26px] font-bold text-white tracking-tight">$3,478</p>
          <p className="text-[10px] text-zinc-500 font-mono mt-0.5">to the tribes&apos; own accounts</p>
        </div>
        <div className="surface-1 rounded-[16px] p-4">
          <p className="text-[9px] text-zinc-500 uppercase tracking-wider">Active programs</p>
          <p className="font-mono text-[26px] font-bold text-white tracking-tight">2</p>
          <p className="text-[10px] text-zinc-500 font-mono mt-0.5">no platform fee</p>
        </div>
      </div>

      {/* program progress */}
      <div className="surface-1 rounded-[16px] p-5 space-y-4">
        {PROGRAMS.map((pr) => (
          <div key={pr.name}>
            <div className="flex items-baseline justify-between mb-1.5">
              <div>
                <span className="text-[14px] font-semibold text-white">{pr.name}</span>
                <span className="text-[11px] text-zinc-500 ml-2">{pr.org}</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">
                ${pr.raised.toLocaleString()} of ${pr.goal.toLocaleString()}/mo
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#FA4616] to-[#ff7a4a] transition-all duration-1000"
                style={{ width: `${(pr.raised / pr.goal) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* live feed */}
      <div className="surface-1 rounded-[16px] p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
          </span>
          <h3 className="text-[15px] font-semibold text-white">Donation stream</h3>
          <span className="text-[10px] text-zinc-600 font-mono ml-auto uppercase tracking-wider">
            Tempo → Stripe → tribe
          </span>
        </div>
        <div className="grid grid-cols-[1fr_110px_90px_90px] gap-2 text-[9px] text-zinc-600 uppercase tracking-wider pb-2 border-b border-white/[0.04]">
          <span>Supporter</span><span>Program</span><span>Amount</span><span>Status</span>
        </div>
        {FEED.map((d, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_110px_90px_90px] gap-2 items-center py-2.5 border-b border-white/[0.03] last:border-0 text-[12px]"
          >
            <span className="text-zinc-300 truncate">
              {d.who}
              <span className="text-zinc-600 ml-2 text-[10px]">{d.when}</span>
            </span>
            <span className="text-zinc-500 truncate text-[11px]">{d.program}</span>
            <span className="font-mono font-semibold text-white">{d.amount}</span>
            {d.status === "streaming" ? (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500/10 text-green-400 w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                streaming
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.06] text-zinc-400 w-fit">
                offramped ✓
              </span>
            )}
          </div>
        ))}
        <p className="mt-3 text-[10px] font-mono text-zinc-600">
          Donations settle as USDC on Tempo and offramp to each tribe&apos;s own
          Stripe account. Demo data — connect keys to go live.
        </p>
      </div>
    </div>
  );
}
