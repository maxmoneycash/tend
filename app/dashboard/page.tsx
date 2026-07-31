import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { AmbientBlobs } from "@/components/layout/AmbientBlobs";
import { auth0 } from "@/lib/auth0";
import { accessibleTribes } from "@/lib/access";
import { demoMode } from "@/lib/demo";
import { tribes, type TribeId } from "@/lib/tribes";

function TenantGrid({ ids, note }: { ids: TribeId[]; note: string }) {
  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <Navbar />
      <div style={{ paddingTop: "108px" }} />
      <div className="relative" style={{ overflow: "clip" }}>
        <AmbientBlobs variant="earn" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 py-8 sm:py-12">
          <div className="mb-6 sm:mb-8 animate-enter">
            <span className="inline-block text-[11px] font-display font-medium px-2.5 py-1 rounded-[10px] bg-[#FA4616]/10 text-[#FA4616] border border-[#FA4616]/20 uppercase tracking-wider mb-3">
              Dashboards
            </span>
            <h1 className="text-[22px] sm:text-[26px] font-bold text-[#111111] mb-2 tracking-[-0.02em]">
              Tribal tenants
            </h1>
            <p className="text-[13px] sm:text-[14px] text-[#7d7d7d] max-w-xl leading-relaxed">
              {note}
            </p>
          </div>

          <div className="animate-enter animate-enter-delay-1 grid gap-4 sm:grid-cols-2">
            {ids.map((id) => (
              <Link
                key={id}
                href={`/dashboard/${id}`}
                className="group surface-1 rounded-[16px] p-5 transition-all duration-300 ease-out hover:scale-[1.01] hover:border-black/[0.16] active:scale-[0.99]"
              >
                <h3 className="text-[15px] font-semibold text-[#111111] group-hover:text-[#FA4616] transition-colors">
                  {tribes[id].name}
                </h3>
                <p className="text-[12px] text-[#6b6b6b] mt-0.5">
                  {tribes[id].taxName}
                </p>
                <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-700 text-[11px] font-medium">
                  Open dashboard →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function DashboardIndex() {
  const authBypass = process.env.TEND_DEMO_AUTH_BYPASS === "1";

  if (demoMode() || authBypass) {
    return (
      <TenantGrid
        ids={Object.keys(tribes) as TribeId[]}
        note={
          authBypass
            ? "Stripe test mode. Sign-in is bypassed for this recording."
            : "Demo mode. Both tenant previews are open."
        }
      />
    );
  }

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
      note="Local Auth0 and environment settings grant access to these test tenant views."
    />
  );
}
