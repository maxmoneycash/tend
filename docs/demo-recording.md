# Tend demo recording

Target length: 75 seconds. Record at 1440 by 900 with the browser toolbar
hidden. Keep Stripe in test mode.

## Before recording

1. Start Tend with `npm run dev`.
2. Confirm that `/` opens `/programs`.
3. Open each official source link in a separate tab.
4. Run `npm run test:payments` and `npm run test:e2e`.
5. Keep a Stripe `sk_test_` key in the local environment.

## 0:00 to 0:18

Open the program directory.

> Tend is a careful guide to Indigenous-led contribution programs around the
> Bay. The organizations shown here run their own programs. Real donations
> happen on their official sites.

Pause on the disclosure below the title. Show Yunakin and the Muwekma Shuumi
Land Tax as separate cards.

## 0:18 to 0:36

Open Yunakin. Point to the program summary and both official links.

> Public sources explain who runs the program, what its name means, and which
> places it describes. The primary action opens the organization’s official
> donation page.

Do not submit the official donation form.

## 0:36 to 0:52

Return to Tend. Scroll to the checkout preview and open the $20 test checkout.

> Tend also demonstrates a payment flow. Every control says test mode. Stripe
> returns a hosted test session, and the demo stops before payment details.

Close Stripe Checkout without entering card information.

## 0:52 to 1:05

Show a prepared test receipt state.

> A signed Stripe webhook records payment state. The receipt page only reads
> that record. A configured Tempo wallet can add faucet-funded transfers on
> the public testnet.

Point to the Stripe session reference and Tempo explorer link.

## 1:05 to 1:15

Open the program directory’s related-giving section.

> Sogorea Te’ Land Trust runs a separate Shuumi Land Tax for Lisjan Ohlone
> work. Tend keeps the two Shuumi programs distinct and sends people to the
> official source.

End on the official-program button.

## Recovery

If Stripe is unavailable, show the recorded end-to-end test output and stay
on the test checkout panel. If address lookup fails, use a county button.
Keep the prototype disclosure visible whenever a payment screen appears.
