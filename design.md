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
  The register must support donor/reference search, donation/recurring views,
  and CSV export without changing page context.
- Footer: the Content Rewards editorial footer with the large orange-gradient
  closing statement.

## Product story

The product is not "donation streaming." It is a better donation page plus the
back office behind it. It solves one concrete break: the program story, hosted
checkout, donor record, and receipt often live in different systems.

For donors it must:

1. Help them confirm the right published program, including overlaps.
2. Explain who runs the program and what the contribution supports.
3. Offer familiar Stripe card or Apple Pay checkout.
4. Return a clear receipt with the program and payment together.

For organizations it must:

1. Keep program copy, photos, coverage, and giving rules in one approved
   record.
2. Process payments through the organization’s connected Stripe account.
3. Show one-time gifts, recurring pledges, payment status, donor details, and
   receipts in one operations register.
4. Search and export records without joining a website, processor, and
   spreadsheet by hand.

The optional settlement stream happens after a verified payment. It can add
proof to the receipt, but it is never a donor-facing reason to give and never a
control on the public donation form.

The complete organization operation is:

1. Publish its own program story and geographic eligibility.
2. Route a donor to the right published program without deciding territorial
   questions for the organization.
3. Accept a familiar Stripe card or Apple Pay checkout in the organization's
   connected account.
4. Keep the payment, program reference, and settlement proof together for
   reconciliation.
5. Support one-time and recurring gifts from the public page, with
   machine-initiated payments available only as an advanced integration.

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
- Keep amount and frequency as the only donor payment choices. Do not expose
  settlement timing, chain vocabulary, or stream configuration before payment.
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
