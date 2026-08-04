import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { auth0 } from "@/lib/auth0";
import { accessibleTribes } from "@/lib/access";
import { tribes, type TribeId } from "@/lib/tribes";
import "@/styles/content-rewards-product.css";

function TenantGrid({ ids, note }: { ids: TribeId[]; note: string }) {
  return (
    <div className="cr-product-page min-h-screen pb-24 md:pb-0">
      <Navbar />
      <div className="cr-product-nav-spacer" />
        <main className="cr-product-shell cr-dashboard-index">
          <div className="cr-product-page-head">
            <div>
            <p>Dashboards</p>
            <h1>Organization workspaces</h1>
            <span>{note}</span>
            </div>
          </div>

          <div className="cr-dashboard-tenant-grid">
            {ids.map((id) => (
              <Link
                key={id}
                href={`/dashboard/${id}`}
                className="cr-dashboard-tenant-card cr-product-section-card"
              >
                <small>{tribes[id].taxName}</small>
                <h3>{tribes[id].name}</h3>
                <span>Open dashboard →</span>
              </Link>
            ))}
          </div>
        </main>
    </div>
  );
}

export default async function DashboardIndex() {
  const session = await auth0.getSession();
  if (!session) redirect("/auth/login?returnTo=/dashboard");

  const ids = accessibleTribes(session.user);
  if (ids.length === 1) redirect(`/dashboard/${ids[0]}`);

  if (ids.length === 0) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div style={{ paddingTop: "108px" }} />
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-8">
          <h1 className="text-[22px] sm:text-[26px] font-bold text-[#111111] tracking-[-0.02em]">
            No tenant access
          </h1>
          <p className="mt-3 text-[13px] text-[#555555] max-w-lg leading-relaxed">
            Signed in as {session.user.email}, but this account isn&apos;t on
            any tribe&apos;s admin list yet. Add your email to
            TEND_ADMINS_RAMAYTUSH or TEND_ADMINS_MUWEKMA in .env.local, or
            assign an Auth0 Organization.
          </p>
        </div>
      </div>
    );
  }

  return (
    <TenantGrid
      ids={ids}
      note="Open the payment and pledge records available to your signed-in account."
    />
  );
}
