export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-black/[0.1] bg-[#efefef] sm:mt-24">
      <div className="mx-auto max-w-6xl px-5 pt-10 pb-[calc(2.5rem+env(safe-area-inset-bottom))] sm:px-10 sm:pt-12 sm:pb-[calc(3rem+env(safe-area-inset-bottom))]">
        <h2 className="font-display text-[clamp(22px,5vw,28px)] font-bold tracking-[-0.02em] text-[#111111] text-balance">
          Tend the land you live on.
        </h2>
        <div className="mt-5 grid gap-4 text-[14px] leading-6 text-[#555555] sm:mt-6 sm:grid-cols-2 sm:gap-8">
          <p>
            Tend is a test-only hackathon prototype from July 2026. The
            organizations listed here did not take part in this July 2026
            hackathon prototype.
          </p>
          <p>
            County matches are informational. Real donations belong on the
            official organization pages linked throughout Tend. The checkout
            here accepts Stripe test keys only.
          </p>
        </div>
        <div className="mt-8 flex flex-col items-start gap-2 border-t border-black/[0.08] pt-5 font-mono text-[11px] leading-5 tracking-[0.08em] text-[#666666] uppercase sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <span>Ohlone-led programs around San Francisco Bay</span>
          <span>Stripe test mode · Tempo public testnet</span>
        </div>
      </div>
    </footer>
  );
}
