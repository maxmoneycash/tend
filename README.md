# Tend

**Turn land acknowledgment into standing support.**

The San Francisco Bay Area sits on Ohlone land — ten thousand years of
documented presence. The tribes who belong to this land are still here, and
still fighting: the Muwekma Ohlone Tribe holds a federal recognition the
United States never lawfully terminated, roughly six hundred enrolled
members, a three-person staff, and zero acres in their ancestral territory.
The region acknowledges them constantly — at conferences, in email footers,
on plaques — and almost none of it converts into support.

Tend is the missing rail: a platform where acknowledgment becomes money that
moves like infrastructure — recurring, streamed, even machine-paid — landing
**directly on each tribe's own account**, with Tend taking nothing.

---

## Three ways money moves

**1. Pledge (humans).** Type your address; Tend resolves your county and
shows every tribe whose *own published definition* includes it. Pick a
sliding-scale amount and Stripe Checkout creates a recurring pledge —
**on the tribe's own Stripe Connect account**. Their supporters, their data,
their payout. If Tend vanished tomorrow, every pledge keeps flowing.

**2. Stream (supporters).** Deposit once into a **private donation zone** —
modeled on [tempoxyz/zones](https://github.com/tempoxyz/zones): a private
chain anchored to Tempo L1 with confidential balances. The zone streams the
deposit out in 250ms batches at your chosen rate, and the accumulated stream
**offramps to the tribe through Stripe**. Watch it drain, batch by batch.

**3. Machine payments (AI agents).** Ten trillion dollars of market cap
operates on Ohlone land, and its agent fleets now pay for compute, APIs, and
data over machine rails. Tend speaks **Stripe's Machine Payments Protocol**:
one `npx mppx` call returns a 402 challenge; the agent pays (Tempo testnet
or card via Shared Payment Token) and collects a receipt. An annual land tax,
paid like any other API bill.

---

## Principles, enforced in code

- **Sovereignty by architecture.** Each tribe is its own tenant: its
  counties, rates, words, videos, and Stripe account. Auth0 (Organizations +
  per-tribe access lists) gates each dashboard; tribes in disagreement never
  share a surface, a pot, or a boundary decision.
- **No boundary arbitration.** Santa Clara County appears in both tribes'
  published definitions — Tend shows both and lets the contributor choose.
  The East Bay's Shuumi Land Tax (Sogorea Te', Lisjan Ohlone) is named as
  part of the same landscape.
- **No platform fee.** 100% of every contribution goes to the organization;
  payment processing fees may apply. The claim is literal: pledges are
  created on the tribe's account, not Tend's.
- **Evidence discipline.** The Explorer is a research report drawn from the
  Muwekma Atlas — the team's source-cited research app — and every claim
  carries its evidence tier: `documented`, `reported`, `oral-history`,
  `analysis`.

---

## The pages

| Route | What it is |
|---|---|
| `/` | Single-fold hero: live pledge notifications on a phone beside a streaming dashboard |
| `/programs` | The two programs as video-cover cards — Yunakin Land Tax (Ramaytush, Peninsula) and the Muwekma Ohlone contribution (East & South Bay) |
| `/programs/[id]` | Program detail: about, counties, and the **Stream a Donation** panel (deposit → rate → 250ms batches → Stripe offramp) |
| `/pledge` | The classic recurring flow: address → whose land → sliding scale → Checkout |
| `/rewards` | Streamed-donations overview: totals, program progress, live feed |
| `/explorer` | *The Land Beneath the Bay* — 10,000 years in twelve moments, the recognition fight, the Presidio's Yelamu sites, Chochenyo revitalization |
| `/dashboard/[tribe]` | The tribe's sovereign view: supporters, recurring, machine ledger |
| `/onboarding/setup` | Create a donation campaign: zone → Tempo anchor → Stripe offramp via projects.dev → publish |

---

## Sponsor tech, used for real

- **Auth0** — sign-in, Organizations as tenant isolation, per-tribe admin
  lists, production access isolated from the demo bypass.
- **Stripe** — Checkout + webhooks + **Connect** (direct-on-tribe-account
  subscriptions), **Machine Payments Protocol** (`mppx`, 402 → credential →
  receipt), **Stripe Projects / projects.dev** (provisions Auth0, Vercel, and
  the stack from the terminal), and the **offramp** for zone streams.
- **Tempo** — the zones model for private, confidential donation
  environments; MPP's testnet settlement rail.

## Real vs. demo

| Piece | Status |
|---|---|
| Checkout, webhooks, Connect accounts, MPP endpoint | Real code — works with test keys |
| Address → county → tribe resolution (US Census geocoder) | Real, live |
| Zone streaming, zone provisioning, dashboards' sample data | Mock demo (clearly labeled in-UI) |
| Tribal onboarding | Deliberately absent — happens with tribes, on their terms, or not at all |

**Runs with zero keys**: demo mode renders every surface with sample data.

```bash
npm install && npm run dev   # → http://localhost:3100
```

## Full setup

Provision through Stripe Projects, then hand-set the payment keys:

```bash
stripe login && stripe plugin install projects
stripe projects init tend
stripe projects add auth0/client && stripe projects add vercel/project
stripe projects env --pull
echo "AUTH0_SECRET=$(openssl rand -hex 32)" >> .env.local
# Auth0 callbacks: http://localhost:3100/auth/callback · logout: http://localhost:3100
# STRIPE_SECRET_KEY=sk_test_... (payments are separate from Projects)
stripe listen --forward-to localhost:3100/api/stripe/webhook
node scripts/setup-connect.mjs   # two test-mode Connect accounts
npm run dev
```

Machine payment demo: `node scripts/agent-pays.mjs ramaytush http://localhost:3100`

---

## What Tend is not

A prototype, built at the **Auth0 × Stripe hackathon (July 2026)**. It is not
affiliated with, or endorsed by, the Association of Ramaytush Ohlone or the
Muwekma Ohlone Tribe — **nothing launches in a tribe's name without that
tribe's direction**. Connected accounts are test-mode stand-ins. The history
is real; the research behind it lives in the Muwekma Atlas.

The land is real too. That's the point.
