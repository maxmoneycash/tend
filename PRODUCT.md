# Tend — PRODUCT.md

## What this is

A land-tax platform for Bay Area Ohlone tribes. Residents type an address,
learn whose ancestral land they're on (by each tribe's own published
definition), and start a recurring pledge that lands 100% on that tribe's own
Stripe account. Tribes get a sovereign dashboard tenant (Auth0). AI agents pay
an annual land tax over Stripe's Machine Payments Protocol. Built at the
Auth0 × Stripe hackathon, July 2026; a prototype until the tribes direct
otherwise.

## Register

Brand-led. The landing page is the argument; the dashboards serve it.
Surfaces: `/` (landing + pledge flow), `/dashboard/[tribe]` (tenant),
`/variants` (component lab), `/thanks`.

## Audience

SF Bay residents converting a land acknowledgment into a standing order;
tribal staff (3-person orgs — zero admin tolerance); hackathon judges;
corporate/agent payers.

## Voice

Grounded, testimonial, unhurried. A national-park interpretive panel crossed
with a land record — not a SaaS page, not a charity appeal. Copy states
facts ("100% to the tribe", "the platform can vanish; the pledges keep
billing") and lets them carry the weight.

## Design direction (v2 — the redesign)

- **Scene**: the Bay at dawn from the shoreline — dark cold water, pale sky,
  one low band of sun.
- **Color strategy**: Committed. Deep bay-teal ground (hero, footer, machine
  section) over document off-white; a single warm sun accent reserved for
  the pledge CTA and key highlights. No cream/parchment neutrals, no
  earth-tone cultural shorthand — the land reads through imagery and copy.
- **Type**: poster display (Bricolage Grotesque) over bookish text serif
  (Spectral); mono only where the subject is literally a machine.
- **Imagery**: a crafted layered SVG panorama of bay water, tule marsh, and
  fog bands (self-contained; no network dependency), motion-drifted subtly.
- **Layout grammar**: ruled headline rows (rule + poster-size section title +
  right-aligned functional note) — no uppercase eyebrow labels, no numbered
  scaffolding. Long scroll, one idea per fold, deep-teal blocks pacing the
  paper sections.
- **Components**: basecn (Base UI) primitives restyled by tokens;
  the `/variants` lab is where alternatives are compared before adoption.

## Non-negotiables

- Evidence-grade honesty: the Santa Clara overlap shows both tribes; Tend
  never arbitrates boundaries; the 0%-fee and account-ownership claims stay
  literal.
- Nothing ships in a tribe's name without that tribe's direction.
- Demo must run with zero credentials (demo mode) and offline-safe fonts and
  imagery (venue wifi is hostile).
