# Tend demo recording

Target length: 70–80 seconds. Record one clean take at 1440×900 and 100% browser
zoom. Keep the pointer still while speaking.

## Before recording

1. Run `npm run dev` and open `http://localhost:3100`.
2. Turn on Do Not Disturb and close unrelated tabs.
3. Use macOS `Shift-Command-5` → **Record Selected Portion** and include only
   the browser content.
4. Confirm the microphone is selected.
5. Reload the home page so the demo begins at the top.

## Shot list and narration

### 0:00–0:12 — Problem and product

**Screen:** Tend home page and headline.

**Say:**

> Land acknowledgements usually stop at words. Tend turns them into a direct,
> recurring contribution. A resident finds a verified Indigenous-led program,
> while each organization keeps control of its payments, supporters, and data.

### 0:12–0:35 — Resident flow

**Screen:** Scroll to **Find my land tax**. Click **San Francisco**, leave the
default monthly amount at `$25`, then click **Preview — $25/month, no Tend
fee**.

**Say:**

> I can locate by address or county. San Francisco resolves to the Association
> of Ramaytush Ohlone and its official Yunakin Land Tax. I choose a monthly
> amount, and Stripe Checkout creates the recurring contribution directly on
> the organization's connected account. This recording uses the clearly
> labelled sandbox, so no real charge is created.

### 0:35–0:58 — Multi-tenant SaaS

**Screen:** On the confirmation page, click **Dashboards** in the header. Open
the Ramaytush tenant and pause on the three summary cards and ledgers.

**Say:**

> Tend is multi-tenant by design. Auth0 Organizations isolate each
> organization's admins. Their dashboard combines recurring human
> contributions and machine payments, while Stripe Connect keeps every
> organization's transactions and supporter data separate.

### 0:58–1:15 — Agent payments and close

**Screen:** Click **Tend** in the header, then scroll to the dark machine
payment example.

**Say:**

> Agents can contribute too. Tend exposes a Stripe Machine Payments Protocol
> endpoint: the agent receives an HTTP 402 challenge, pays, and gets a
> verifiable receipt with routing status. Tend is one contribution system for
> people, organizations, and the autonomous software operating on their land.

Stop recording immediately after the final sentence.

## If the live flow misbehaves

- Use the county buttons instead of the Census address lookup.
- Do not attempt a real Stripe payment during the recording.
- Open `http://localhost:3100/dashboard/ramaytush` directly if dashboard
  navigation is slow.
- Restart with `npm run dev` if a stale page appears.
