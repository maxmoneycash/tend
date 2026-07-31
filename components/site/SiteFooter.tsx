export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-black/[0.08] bg-[#efefef]">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <p className="font-display text-[24px] font-bold text-[#111111]">
          Tend the land you live on.
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 text-[12px] leading-relaxed text-[#6b6b6b]">
          <p>
            Tend is a test-only hackathon prototype from July 2026. The
            Association of Ramaytush Ohlone, Muwekma Ohlone Preservation
            Foundation, and Sogorea Te&apos; Land Trust have not approved,
            endorsed, or joined it.
          </p>
          <p>
            County matches are informational. Real donations belong on the
            official organization pages linked throughout Tend. The checkout
            here accepts Stripe test keys only.
          </p>
        </div>
        <div className="mt-8 pt-5 border-t border-black/[0.06] flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-[#8a8a8a] uppercase tracking-wider">
          <span>Ohlone-led programs around San Francisco Bay</span>
          <span>Stripe test mode · Tempo public testnet</span>
        </div>
      </div>
    </footer>
  );
}
