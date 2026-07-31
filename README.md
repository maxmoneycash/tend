# Tend

Tend is a test-only donations prototype for learning about Indigenous-led
contribution programs in the San Francisco Bay Area. Each program card links
to the organization’s official site for real donations.

The Association of Ramaytush Ohlone, the Muwekma Ohlone Preservation
Foundation, and Sogorea Te’ Land Trust are separate organizations with their
own programs and territorial descriptions. Tend keeps those identities clear.
None of these organizations has approved, endorsed, or joined this prototype.

## Official programs

- [Yunakin Land Tax](https://www.ramaytush.org/donate.html) is a financial
  contribution offered by the Association of Ramaytush Ohlone. Its
  [official donation page](https://ramaytush.kindful.com/?campaign=1199658)
  accepts one-time and recurring gifts.
- [Muwekma Shuumi Land Tax](https://www.muwekmafoundation.org/shuumi) is a
  voluntary annual contribution offered by the Muwekma Ohlone Preservation
  Foundation. Donations belong on the
  [foundation’s official page](https://www.muwekmafoundation.org/donate).
- [Sogorea Te’ Shuumi Land Tax](https://sogoreate-landtrust.org/pay-the-shuumi-land-tax/)
  supports Sogorea Te’ Land Trust. Tend presents it as a related East Bay
  program and sends donors to its official site.

## What the prototype does

Tend presents sourced program information, a county-based discovery flow, and
an optional Stripe Checkout demonstration. Checkout only accepts Stripe test
keys. Real donor action stays on each organization’s official page.

Stripe webhooks record test payment state in durable local storage. A
configured Tempo wallet can mirror a verified Stripe test payment with
`pathUSD` transfers on Tempo’s public testnet. Those transfers are a product
demonstration. They do not send donated funds to an organization.

Auth0 protects the dashboard. Local environment variables choose which users
can open each tenant view. Beneficiary-managed access and connected accounts
require direct approval and onboarding from each organization.

## Pages

| Route | Purpose |
|---|---|
| `/` | Opens the program directory |
| `/programs` | Lists hosted demonstrations and related official programs |
| `/programs/[id]` | Shows sources, official donation links, and test checkout |
| `/pledge` | Finds possible programs by county and opens the test flow |
| `/explorer` | Presents the prototype’s source-labeled Muwekma research |
| `/thanks` | Reads Stripe webhook state and testnet receipt progress |
| `/dashboard` | Opens the test tenant directory after authentication |
| `/dashboard/[tribe]` | Shows test Stripe activity for one configured tenant |

Compatibility redirects cover retired prototype routes.

## Local setup

Install dependencies and start Next.js on port 3100:

```bash
npm install
npm run dev
```

The application can render its empty demonstration state without payment keys.
A Stripe test key enables hosted test Checkout:

```bash
STRIPE_SECRET_KEY=sk_test_...
```

Connect remains disabled until `TEND_CONNECT_DESTINATION_CHARGES=1` and a
test connected account is configured. Production use also requires explicit
beneficiary approval, completed Stripe onboarding, legal review, and a clear
funds-flow agreement.

## Verification

Run the static checks and payment route tests:

```bash
npm run typecheck
npm run lint
npm run test:payments
npm run build
```

The end-to-end check uses the globally installed Vercel Labs
`agent-browser` 0.33.1:

```bash
npm run test:e2e
```

It starts an isolated Next.js server on an available local port, opens a
390-by-844 viewport, follows the Ramaytush test journey, and stops after
Stripe returns a hosted `cs_test_` Checkout URL. It enters no payment
details. Mocked receipt states then confirm GET-only polling and the Tempo
testnet explorer link.

## Stripe and webhook setup

Use Stripe test mode:

```bash
stripe login
stripe listen --forward-to localhost:3100/api/stripe/webhook
node scripts/setup-connect.mjs
npm run dev
```

The receipt page only reads stored webhook state. Tempo work starts from the
verified webhook path. Processed Stripe event IDs prevent duplicate handling.

## Project boundary

Tend began as an Auth0 and Stripe hackathon prototype in July 2026. The
repository contains product research and test payment scaffolding. It does
not represent a tribal partnership, a tax service, or a production donation
processor.
