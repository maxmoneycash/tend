# Tend

**Streamed donations for the land you live on.** Tend hosts sovereign
contribution programs for Bay Area Ohlone tribes — the Association of
Ramaytush Ohlone's Yunakin Land Tax and the Muwekma Ohlone Preservation
Foundation — with three ways to give:

- **Humans**: recurring card pledges via Stripe Checkout, created directly on
  each tribe's own Stripe Connect account (no platform fee).
- **Streams**: deposit once into a **private donation zone** (tempoxyz/zones
  model — anchored to Tempo L1, confidential balances); the zone streams it
  out in 250ms batches and **offramps to the tribe through Stripe**.
- **Machines**: AI agents pay an annual land tax over **Stripe's Machine
  Payments Protocol** (`mppx` 402 challenge → credential → receipt).

Auth0 isolates each tribe's tenant (Organizations + per-tribe access);
Stripe Projects (projects.dev) provisions the stack. The Explorer is a
research report built from the Muwekma Atlas — ten thousand years of
documented history with evidence tiers. UI is the Content Rewards design
system (the team's own prior product), light theme.

**Runs with zero keys**: demo mode renders every surface with sample data —
`npm install && npm run dev` → http://localhost:3100. Streaming and zone
provisioning are mock demos; Checkout, webhooks, Connect and MPP endpoints
are real code awaiting keys (setup below).

Built at the Auth0 × Stripe hackathon, July 2026.

---

## Setup

The stack provisions through **Stripe Projects** (CLI ≥ 1.43.3 — installed):

```bash
stripe login
stripe plugin install projects          # requires login first
stripe projects init tend
stripe projects add auth0/client        # → AUTH0_DOMAIN / _CLIENT_ID / _CLIENT_SECRET
stripe projects add vercel/project      # → VERCEL_TOKEN etc. for unattended deploy
stripe projects env --pull
```

Then the hand-set pieces (Projects doesn't write these):

```bash
cp .env.example .env.local              # then fill in:
echo "AUTH0_SECRET=$(openssl rand -hex 32)" >> .env.local
# Auth0 dashboard → your app → Allowed Callback URLs: http://localhost:3100/auth/callback
#                              Allowed Logout URLs:   http://localhost:3100
# Stripe test keys (payments are separate from Projects):
#   STRIPE_SECRET_KEY=sk_test_...
stripe listen --forward-to localhost:3100/api/stripe/webhook   # → STRIPE_WEBHOOK_SECRET
node scripts/setup-connect.mjs          # → TEND_ACCT_RAMAYTUSH / TEND_ACCT_MUWEKMA
npm run dev
```

## The demo

**Human:** address → whose land → sliding-scale amount → Checkout (test card
`4242 4242 4242 4242`) → `/thanks` → tribe dashboard shows the pledge.

**Machine:**

```bash
node scripts/agent-pays.mjs ramaytush http://localhost:3100
# under the hood: npx mppx account create && npx mppx account fund --network testnet
#                 npx mppx http://localhost:3100/api/mpp/land-tax?tribe=ramaytush --method POST
npx mppx@latest validate http://localhost:3100/api/mpp/land-tax   # protocol conformance
```

**Tribal admin:** header → Tribal sign-in (Auth0) → `/dashboard/[tribe]` —
gated by `TEND_ORG_*` (Auth0 Organization) or `TEND_ADMINS_*` (email
allowlist).

Deploy: `npx vercel deploy --prod --token="$VERCEL_TOKEN"` (token courtesy of
`vercel/project`). Contest: `stripe projects init` was step one — run the
CLI's `/contest` command for the Stripe Projects raffle.

## What Tend is not

A prototype only: not affiliated with or endorsed by either tribe, and nothing
launches in a tribe's name without that tribe's direction. Connected accounts
here are test-mode stand-ins; real onboarding is a conversation with the
tribes, on their terms. The MPP transfer-routing to connected accounts is
best-effort in test mode (settlement timing); production would use separate
charges & transfers with reconciliation.
