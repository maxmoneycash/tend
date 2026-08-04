# Organization pilot plan

## What we sell

A better donation page plus the back office behind it.

The public page keeps the program story, location, payment, and receipt
together. The staff workspace keeps one-time gifts, recurring pledges, donor
details, payment status, and receipts together.

Do not lead with payment streaming, Tempo, crypto, or machine payments. Those
can support settlement proof after a payment. They are not the reason a donor
gives or an organization changes its donation system.

## The problem we can show

Use a short, factual audit of the organization’s current public flow.

### Association of Ramaytush Ohlone

- The organization explains Yunakin on its own donation page.
- The donation action opens a separate Kindful checkout.
- The public page and Kindful form use different wording for the Santa Clara
  portion of the program area.

Sources:

- https://www.ramaytush.org/donate.html
- https://ramaytush.kindful.com/?campaign=1199658

The opportunity is not to judge which wording is right. It is to let the
organization approve one record and use that record everywhere.

### Muwekma Ohlone Preservation Foundation

- The Shuumi page contains the program story and geographic explanation.
- The separate donation page presents a general contribution form.
- A donor can lose the Shuumi program context between learning and paying.

Sources:

- https://www.muwekmafoundation.org/shuumi
- https://www.muwekmafoundation.org/donate

These observations are conversation starters, not public criticism. Show each
organization only its own audit. Ask staff to correct every assumption.

## The first offer

Offer one white-glove pilot for one program.

1. Audit the current donation path on phone and desktop.
2. Build a private page using only copy and media the organization approves.
3. Review the donor flow with program and finance staff.
4. Connect the organization’s Stripe account in test mode.
5. Run staff through checkout, receipt lookup, recurring gifts, and export.
6. Move to live payments only after written approval, refund rules, and an
   agreed support owner are in place.

Do not ask an organization to migrate its whole website. Start with one
program and one donation path.

## What the demo must prove

### Donor demo — 60 seconds

1. Open a program page on a phone.
2. Check the published location or choose the program directly.
3. Choose one time or monthly and enter an amount.
4. Open Stripe Checkout and show Apple Pay when the device supports it.
5. Return to one receipt carrying the organization, program, amount, and
   payment status.

Do not show settlement controls. If onchain proof is available, reveal it on
the completed receipt as an optional technical detail.

### Staff demo — 90 seconds

1. Open the same program in the staff workspace.
2. Find the donation by date or donor email.
3. Show amount, schedule, payment status, and program reference together.
4. Open the recurring-pledge register.
5. Search for the record and export the current register as CSV.

The current prototype has donor/reference search and CSV export. It does not
yet have a donor self-service portal. Do not claim that is finished.

## What must be finished before asking for live funds

- Stripe Connect onboarding and account-readiness checks for each organization.
- A clear merchant-of-record and refund model.
- Donor receipt delivery and receipt lookup.
- Recurring-payment management and cancellation.
- An export schema and reconciliation fields reviewed by organization staff.
- An organization-controlled program editor or an explicit managed-edit
  process with approval history.
- Privacy policy, terms, data retention, and support contact.
- Mobile and keyboard testing of the full checkout and receipt path.
- Written approval for every organization name, photograph, program claim, and
  live donation link.

## Who to contact first

Start with organizations that have:

- a named donation or land-tax program;
- a separate hosted checkout;
- geographic guidance donors must understand;
- one-time and recurring gifts;
- a small staff that would benefit from fewer disconnected records.

The first goal is three discovery calls, not a sale. Learn who edits the public
page, who owns the payment processor, who reconciles gifts, and what donors ask
for help with.

## Outreach email

Subject: A working review of your donation path

Hi — I built a private prototype of a donation page for one of your published
programs. It keeps the program story, location guidance, Stripe checkout, and
donor receipt in one flow, with a staff view for recurring gifts and payment
status.

Nothing is live, and I would not publish or collect money in your name without
your approval. I would value 20 minutes to show the current flow, hear where my
assumptions are wrong, and learn what creates work for your staff today.

If it is useful, I can prepare a one-program pilot using only language and
media your team approves.

## Questions for the first call

1. What part of the donation flow creates the most donor questions?
2. Who updates program language, and where must they update it today?
3. Who reconciles donations, recurring plans, refunds, and receipts?
4. What do you need to see before trusting a new donation page?
5. Would one program be a safe pilot, and what would make the pilot a success?

## Pricing

Do not invent pricing before the discovery calls. Offer the audit and private
prototype first. After three calls, price the pilot around the real work:
setup, approved content migration, payment onboarding, support, and ongoing
operations. Keep payment-processing fees and any platform fee explicit.
