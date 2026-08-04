import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  FileSpreadsheet,
  LayoutDashboard,
  ReceiptText,
  Search,
  Smartphone,
} from "lucide-react";
import "@/styles/content-rewards.css";

const STEPS = [
  {
    number: "Step 1",
    title: "Approve one program record",
    body: "Keep the story, photos, coverage, and giving options in one source your team controls.",
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
    title: "Connect the payment account",
    body: "Move from the public story into card or Apple Pay checkout without dropping the program context.",
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
    title: "Work from the donor record",
    body: "See the amount, schedule, payment status, program, and receipt in the same operational view.",
    visual: (
      <div className="cr-hiw-ledger-card">
        <header><span>Donor record</span><b>TEST</b></header>
        <p><i><BadgeCheck aria-hidden="true" size={13} /></i><span>Payment confirmed<small>Monthly · $50</small></span></p>
        <p><i><ReceiptText aria-hidden="true" size={13} /></i><span>Receipt matched<small>Program reference attached</small></span></p>
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
            <p className="cr-hero-audience">For program and finance teams</p>
            <h1 className="cr-hero-h1">
              <span>One donation page.</span>
              <span>One complete record.</span>
            </h1>
            <p className="cr-hero-sub">
              Donors get a clear program page and familiar Stripe checkout.
              Staff get the gift, recurring plan, payment status, and receipt
              in one workspace.
            </p>
            <div className="cr-hero-ctas">
              <Link className="cr-btn-orange" href="/programs/ramaytush">
                <span>View a program page</span>
                <ArrowRight aria-hidden="true" size={17} />
              </Link>
              <Link className="cr-btn-white" href="/dashboard">
                Open staff workspace
              </Link>
            </div>
            <p className="cr-prototype-note">
              Private test workspace. Live funds stay off until the organization approves the page and connects Stripe.
            </p>
          </div>

          <div className="cr-hero-visual" aria-label="Donation page, checkout, and dashboard preview">
            <div className="cr-hero-orbit" />
            <article className="cr-hero-card cr-hero-card--program">
              <div className="cr-card-photo">
                <Image alt="" fill sizes="220px" src="/programs/muwekma-hero.webp" />
              </div>
              <div className="cr-card-body">
                <small>PROGRAM RECORD</small>
                <strong>Story, photos, and coverage</strong>
                <span>One source for every giving surface</span>
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
                <p><BadgeCheck aria-hidden="true" size={15} /><span><strong>Donor record created</strong><small>Program + schedule</small></span></p>
                <p><ReceiptText aria-hidden="true" size={15} /><span><strong>Receipt matched</strong><small>Payment status attached</small></span></p>
                <footer><LayoutDashboard aria-hidden="true" size={14} /> Staff workspace</footer>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="cr-section cr-section--white cr-section--rounded-top">
        <div className="cr-section-inner">
          <h2 className="cr-section-h2">The program record follows every donation.</h2>
          <p className="cr-section-p">
            Staff approve the name, story, media, and coverage once. The same
            information stays attached to checkout, the receipt, and the
            operations register.
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
          <h2 className="cr-section-h2">A clear gift for the donor. A usable record for staff.</h2>
          <p className="cr-section-p">
            The public page stays focused on the program and the payment. The
            staff workspace carries the detail needed for receipts, recurring
            support, and reconciliation.
          </p>

          <div className="cr-value-workspace">
            <article className="cr-value-public">
              <header>
                <span><Smartphone aria-hidden="true" size={16} /> Public page</span>
                <b>DONOR</b>
              </header>
              <div className="cr-value-program">
                <Image alt="" fill sizes="(min-width: 64rem) 28rem, 90vw" src="/programs/ramaytush-hero.jpg" />
                <div>
                  <small>Association of Ramaytush Ohlone</small>
                  <strong>Yunakin Land Tax</strong>
                  <span>Published program and coverage</span>
                </div>
              </div>
              <div className="cr-value-payment">
                <span>Example monthly contribution</span>
                <strong>$50.00</strong>
              </div>
              <footer><CreditCard aria-hidden="true" size={15} /> Secure Stripe checkout</footer>
            </article>

            <ArrowRight className="cr-value-arrow" aria-hidden="true" size={24} />

            <article className="cr-value-operations">
              <header>
                <span><LayoutDashboard aria-hidden="true" size={16} /> Staff workspace</span>
                <b>ORG</b>
              </header>
              <div className="cr-value-toolbar">
                <span><Search aria-hidden="true" size={14} /> Search donor or receipt</span>
                <em><FileSpreadsheet aria-hidden="true" size={14} /> Export CSV</em>
              </div>
              <dl className="cr-value-record">
                <div><dt>Donor email</dt><dd>Captured at checkout</dd></div>
                <div><dt>Program</dt><dd>Yunakin Land Tax</dd></div>
                <div><dt>Schedule</dt><dd>Monthly</dd></div>
                <div><dt>Payment</dt><dd>Paid</dd></div>
                <div><dt>Receipt</dt><dd>Matched</dd></div>
              </dl>
              <footer><BadgeCheck aria-hidden="true" size={15} /> Ready for reconciliation</footer>
            </article>
          </div>

          <ul className="cr-value-outcomes" aria-label="Organization controls">
            <li>
              <strong>Program language</strong>
              <span>Approved by the organization</span>
            </li>
            <li>
              <strong>Payment account</strong>
              <span>Connected through Stripe</span>
            </li>
            <li>
              <strong>Recurring support</strong>
              <span>Visible beside one-time gifts</span>
            </li>
            <li>
              <strong>Staff records</strong>
              <span>Searchable and exportable</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="cr-section cr-section--white cr-final-cta">
        <div className="cr-section-inner">
          <div>
            <h2>Pilot one program with your staff.</h2>
            <p>Review the donor page and staff register together. Connect checkout after the organization approves the flow.</p>
          </div>
          <Link className="cr-btn-orange" href="/programs">
            <span>Review the working demo</span>
            <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </div>
      </section>
    </>
  );
}
