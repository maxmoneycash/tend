/** Demo mode keeps the prototype walkable without creating a Stripe charge. */

export function demoMode(): boolean {
  return process.env.TEND_DEMO === "1" || !process.env.STRIPE_SECRET_KEY;
}
