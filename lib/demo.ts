/** Demo mode keeps the prototype walkable without creating a Stripe charge. */

export function demoMode(): boolean {
  return process.env.TEND_DEMO === "1" || !process.env.STRIPE_SECRET_KEY;
}

/**
 * Whether to skip sign-in, for walking the flow while recording locally.
 *
 * The bypass opens the tenant dashboard, the checkout route, and Stripe
 * Connect onboarding to anyone who reaches them, so it is refused on a hosted
 * deployment no matter how the environment is set. This repository is public:
 * a fork that copied an env file, or a variable pasted into a project's
 * settings, would otherwise publish those surfaces to anyone with the URL.
 * Vercel sets `VERCEL` in every environment it builds and runs, including
 * preview deployments, whose URLs are public too.
 */
export function demoAuthBypass(): boolean {
  if (process.env.VERCEL) return false;
  return process.env.TEND_DEMO_AUTH_BYPASS === "1";
}
