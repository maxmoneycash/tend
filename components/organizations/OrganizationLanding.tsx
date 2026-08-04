import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  CreditCard,
  LayoutDashboard,
  MapPinned,
  ReceiptText,
  Smartphone,
} from "lucide-react";
import "@/styles/content-rewards.css";

const STEPS = [
  {
    number: "Step 1",
    title: "Publish the program",
    body: "Use the organization’s own photos, language, boundaries, and giving rules.",
    visual: (
      <div className="cr-hiw-program-card">
        <Image
          alt=""
          fill
          sizes="260px"
          src="/programs/ramaytush-hero.jpg"
        />
        <div>
          <small>Association of Ramaytush Ohlone</small>
          <strong>Yunakin Land Tax</strong>
          <span>San Francisco · San Mateo</span>
        </div>
      </div>
    ),
  },
  {
    number: "Step 2",
    title: "Connect your account",
    body: "Accept card or Apple Pay through the organization’s Stripe account, with no platform fee.",
    visual: (
      <div className="cr-hiw-checkout-card">
        <span>Donation amount</span>
        <strong>$50.00</strong>
        <div><CreditCard aria-hidden="true" size={15} /> Card or Apple Pay</div>
        <button type="button" tabIndex={-1}>Continue to Stripe</button>
      </div>
    ),
  },
  {
    number: "Step 3",
    title: "Run one operation",
    body: "See pledges, payment status, and settlement proof in the same record.",
    visual: (
      <div className="cr-hiw-ledger-card">
        <header><span>Payment activity</span><b>TEST</b></header>
        <p><i><BadgeCheck aria-hidden="true" size={13} /></i><span>Stripe confirmed<small>Card payment</small></span></p>
        <p><i><ReceiptText aria-hidden="true" size={13} /></i><span>Receipt ready<small>Payment and settlement</small></span></p>
      </div>
    ),
  },
] as const;

export function OrganizationLanding() {
  return (
    <>
      <section className="cr-hero">
        <div className="cr-hero-radial-overlay" />
        <div className="cr-hero-inner">
          <div className="cr-hero-content">
            <p className="cr-eyebrow">Donation infrastructure for organizations</p>
            <h1 className="cr-hero-h1">
              <span>Your program.</span>
              <span>Your Stripe account.</span>
              <span>One donation page.</span>
            </h1>
            <p className="cr-hero-sub">
              Publish the official story, accept card and Apple Pay, match
              donors by location, and reconcile every payment without sending
              people through disconnected tools.
            </p>
            <div className="cr-hero-ctas">
              <Link className="cr-btn-orange" href="/programs/ramaytush">
                <span>See the donor experience</span>
                <ArrowRight aria-hidden="true" size={17} />
              </Link>
              <Link className="cr-btn-white" href="/dashboard">
                Open the dashboard
              </Link>
            </div>
            <p className="cr-prototype-note">
              Prototype in Stripe test mode. No organization has approved this checkout.
            </p>
          </div>

          <div className="cr-hero-visual" aria-label="Donation page, checkout, and dashboard preview">
            <div className="cr-hero-orbit" />
            <article className="cr-hero-card cr-hero-card--program">
              <div className="cr-card-photo">
                <Image alt="" fill sizes="220px" src="/programs/muwekma-hero.webp" />
              </div>
              <div className="cr-card-body">
                <small>PROGRAM PAGE</small>
                <strong>Official story and coverage</strong>
                <span>Published by the organization</span>
              </div>
            </article>
            <article className="cr-hero-card cr-hero-card--checkout">
              <div className="cr-card-body">
                <small>SECURE CHECKOUT</small>
                <strong>$50.00</strong>
                <div className="cr-card-tabs"><b>One time</b><span>Monthly</span><span>Yearly</span></div>
                <div className="cr-card-pay"><Smartphone aria-hidden="true" size={14} /> Apple Pay</div>
              </div>
            </article>
            <article className="cr-hero-card cr-hero-card--dashboard">
              <div className="cr-card-body">
                <header><small>PAYMENT ACTIVITY</small><em>TEST MODE</em></header>
                <p><BadgeCheck aria-hidden="true" size={15} /><span><strong>Payment confirmed</strong><small>Stripe Checkout</small></span></p>
                <p><ReceiptText aria-hidden="true" size={15} /><span><strong>Proof attached</strong><small>One receipt</small></span></p>
                <footer><LayoutDashboard aria-hidden="true" size={14} /> Organization dashboard</footer>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="cr-section cr-section--white cr-section--rounded-top">
        <div className="cr-section-inner">
          <div className="cr-pill-badge">One operating flow</div>
          <h2 className="cr-section-h2">Replace the donation stack, not your program.</h2>
          <p className="cr-section-p">
            The page, payment account, donor receipt, and staff dashboard work
            together while the organization keeps control of its program.
          </p>

          <div className="cr-hiw-cards">
            {STEPS.map((step) => (
              <article className="cr-hiw-card" key={step.number}>
                <div className="cr-hiw-card-visual">
                  <div className="cr-hiw-card-dots" />
                  {step.visual}
                </div>
                <div className="cr-hiw-card-bottom">
                  <div className="cr-hiw-step-pill-wrap">
                    <span />
                    <b>{step.number}</b>
                    <span />
                  </div>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="cr-section cr-section--gray">
        <div className="cr-section-inner">
          <div className="cr-pill-badge">Why organizations use it</div>
          <h2 className="cr-section-h2">Give donors fewer reasons to leave.</h2>
          <p className="cr-section-p">
            Each feature removes a real break in the giving journey or in the
            work your staff has to do afterward.
          </p>

          <div className="cr-trust-grid">
            <article className="cr-trust-card cr-trust-card--route">
              <div className="cr-trust-copy">
                <MapPinned aria-hidden="true" size={22} />
                <h3>Route donors without deciding for them</h3>
                <p>Match a location against published coverage, show every overlap, and let the donor choose.</p>
              </div>
              <div className="cr-location-result">
                <header><span>San Francisco County</span><b>2 matches</b></header>
                <p>Yunakin Land Tax <small>Association of Ramaytush Ohlone</small></p>
                <p>Shuumi Land Tax <small>Muwekma Ohlone Preservation Foundation</small></p>
              </div>
            </article>

            <article className="cr-trust-card cr-trust-card--account">
              <div className="cr-trust-copy">
                <Banknote aria-hidden="true" size={22} />
                <h3>Keep control of the money</h3>
                <p>Use the organization’s connected Stripe account. The platform adds no fee; Stripe processing fees may apply.</p>
              </div>
              <div className="cr-account-visual">
                <span>Connected account</span>
                <strong>Your Stripe</strong>
                <small>$0 platform fee</small>
              </div>
            </article>

            <article className="cr-trust-card cr-trust-card--receipt">
              <div className="cr-trust-copy">
                <ReceiptText aria-hidden="true" size={22} />
                <h3>Reconcile from one receipt</h3>
                <p>Keep checkout status and settlement links together instead of matching separate records by hand.</p>
              </div>
              <div className="cr-receipt-visual">
                <p><span>Stripe Checkout</span><b>Confirmed</b></p>
                <p><span>Settlement</span><b>Linked</b></p>
                <p><span>Program</span><b>Attached</b></p>
              </div>
            </article>

            <article className="cr-trust-card cr-trust-card--channels">
              <div className="cr-trust-copy">
                <CreditCard aria-hidden="true" size={22} />
                <h3>Use one page for more ways to give</h3>
                <p>Offer one-time, monthly, or yearly card payments, Apple Pay when available, and an optional machine-payment endpoint.</p>
              </div>
              <div className="cr-channel-list">
                <span>Card</span><span>Apple Pay</span><span>Recurring</span><span>MPP</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="cr-section cr-section--white cr-final-cta">
        <div className="cr-section-inner">
          <div>
            <p className="cr-eyebrow">Review the working prototype</p>
            <h2>See the full donor journey before connecting an account.</h2>
          </div>
          <Link className="cr-btn-orange" href="/programs">
            <span>Explore program pages</span>
            <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </div>
      </section>
    </>
  );
}
