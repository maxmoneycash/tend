# Tend product brief

## Purpose

Tend helps a Bay Area resident learn about Indigenous-led contribution
programs and reach the correct official donation page. Its internal checkout
demonstrates a possible payment and receipt system with test funds.

The current project has no beneficiary partnerships. Geography is
informational. Each organization’s published description remains the source
of truth.

## Organizations in the guide

The Association of Ramaytush Ohlone offers Yunakin Land Tax. The Muwekma
Ohlone Preservation Foundation offers its Shuumi Land Tax. Sogorea Te’ Land
Trust runs a separate Shuumi Land Tax for Lisjan Ohlone work.

Copy must keep these names, programs, and links separate.

## Primary journey

A visitor opens the program directory, reads a concise explanation, and
chooses an official donation link. The test checkout sits below that action.
It carries a persistent test-mode label and stops before any real payment.

County search can surface several possible programs. The interface explains
why and leaves territorial interpretation to the organizations.

## Prototype systems

Stripe Checkout creates test sessions. Signed webhooks write durable payment
state and guard against duplicate event handling. A configured Tempo testnet
wallet can send faucet-funded `pathUSD` transfers after the webhook confirms
the test payment.

Auth0 and local environment settings protect test tenant dashboards. A future
beneficiary-managed tenant needs the organization’s approval, its own
onboarding, and a reviewed funds-flow agreement.

## Voice

Write like a careful guide. Name the organization responsible for each fact.
Prefer short sentences and ordinary words. State the prototype boundary near
every payment action.

Avoid territorial certainty, partnership language, tax advice, and claims
about where money lands. Link to the official source when a visitor can act
on the information.

## Interface

Use the existing off-white canvas, dark text, and restrained orange accent.
Program names carry more weight than technology labels. Official donation
links come before the test checkout.

Mobile layouts must work at 390 by 844 pixels without horizontal scrolling.
Payment status must remain readable with reduced motion, keyboard navigation,
and screen-reader status announcements.

## Completion standard

The product is ready for a public prototype review when every donor action
names its destination, every test control says test, all official links work,
and the full verification suite passes. Production fundraising requires
written beneficiary approval and completed payment onboarding.
