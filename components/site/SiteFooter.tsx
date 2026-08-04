import Link from "next/link";
import { ArrowRight } from "lucide-react";
import "@/styles/footer.css";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-top">
          <div className="site-footer-brand">
            <h2>Give where you live.</h2>
            <div className="site-footer-divider" />
            <p>
              Find an Indigenous-led contribution program, pay through a
              familiar checkout, and keep the payment with its proof.
            </p>
            <Link className="site-footer-cta" href="/pledge">
              Start a donation <ArrowRight aria-hidden="true" size={16} />
            </Link>
          </div>

          <div className="site-footer-columns">
            <div>
              <h3>Explore</h3>
              <Link href="/programs">Programs</Link>
              <Link href="/explorer">Research atlas</Link>
              <Link href="/pledge">Location match</Link>
            </div>
            <div>
              <h3>Organizations</h3>
              <Link href="/organizations">Why use it</Link>
              <Link href="/dashboard">Dashboard</Link>
              <a href="/auth/login?returnTo=/dashboard">Sign in</a>
            </div>
            <div>
              <h3>Prototype</h3>
              <span>Stripe test mode</span>
              <span>No real money</span>
              <span>No organization endorsement</span>
            </div>
          </div>
        </div>

        <div className="site-footer-gradient">
          <div className="site-footer-giant">GIVE WHERE YOU LIVE</div>
          <div className="site-footer-line" />
          <div className="site-footer-bottom">
            <span>Hackathon prototype</span>
            <span>Ohlone-led programs around San Francisco Bay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
