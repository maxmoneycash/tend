# Design system

The literal source of truth is the original Shelby Content Rewards app:

`/Users/maxmohammadi/shelby-content-rewards`

Do not invent a new card, shell, footer, hero, or section when a Content
Rewards pattern already exists. Reuse its structure and behavior, then replace
only the inner content for the donation use case.

## Component mapping

- Navigation: floating glass Content Rewards navbar, including its scroll and
  mobile-menu behavior.
- Marketing hero: 55/45 editorial hero with large Space Grotesk display type
  and layered product-preview cards.
- Section transitions: large rounded white surfaces on the warm paper
  background.
- Process: Content Rewards "How it works" cards with numbered pills and a
  purposeful visual inside each card.
- Organization benefits: the mixed light/dark Content Rewards trust grid.
- Program directory: the Content Rewards campaign-card grid with real media,
  concise metadata, and one primary action.
- Dashboards: the Content Rewards market-overview stat panel and register rows.
- Footer: the Content Rewards editorial footer with the large orange-gradient
  closing statement.

## Product story

The product is not "donation streaming." It gives an organization one public
donation operation:

1. Publish its own program story and geographic eligibility.
2. Route a donor to the right published program without deciding territorial
   questions for the organization.
3. Accept a familiar Stripe card or Apple Pay checkout in the organization's
   connected account.
4. Keep the payment, program reference, and settlement proof together for
   reconciliation.
5. Support one-time, recurring, and machine-initiated payments from the same
   program page.

Organization-facing copy must answer: Who controls the money? Who controls the
program language? What administrative work disappears? What does the donor
receive? Never claim endorsement, partnership, tax treatment, or live fund
routing that has not been configured.

## Interface rules

- Use the existing off-white paper, ink, and restrained orange tokens.
- Display type is Space Grotesk; body is Inter; transaction data is Geist Mono.
- Preserve real media and loading thumbnails. Never replace them with a random
  gradient.
- Every card must answer a donor or organization question, expose a useful
  control, or carry evidence.
- One primary action per section. The site checkout is primary; the official
  organization page is a quiet fallback while connected checkout is in test.
- Use visible hover/pressed states and a quiet background focus state. Do not
  add blue or black focus rings around form controls.
- Put advanced network and machine-payment details behind disclosure controls.
- Do not use the product name in visible body copy; it belongs in the navbar
  identity only.
- No fake metrics, fake transactions, fake endorsements, or unsupported claims.

## Page families

- Organizations: Content Rewards landing-page composition aimed at program
  operators and finance staff.
- Programs: media-led campaign directory.
- Program detail: official story and imagery, compact donation checkout, then
  the three-part value story: match, pay, reconcile.
- Explorer: evidence atlas inside Content Rewards editorial surfaces, not a
  pile of generic source cards.
- Dashboard: dense operational register, not decorative empty panels.
