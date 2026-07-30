import { Navbar } from "@/components/layout/Navbar";
import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import { accessibleTribes } from "@/lib/access";
import { demoMode } from "@/lib/demo";
import { tribes, type TribeId } from "@/lib/tribes";

export default async function DashboardIndex() {
  const authBypass = process.env.TEND_DEMO_AUTH_BYPASS === "1";

  if (demoMode() || authBypass) {
    return (
      <>
      <Navbar />
    <div style={{ paddingTop: "108px" }} />
      <div className="mx-auto max-w-2xl px-6 pt-24">
        <h1 className="font-display text-4xl font-bold">Tribal tenants</h1>
        <p className="mt-2 text-sm text-faded">
          {authBypass
            ? "Stripe test mode — sign-in is bypassed for this recording."
            : "Demo mode — both tenants are open with sample data."}
        </p>
        <div className="mt-6 grid gap-4">
          {(Object.keys(tribes) as TribeId[]).map((id) => (
            <a
              key={id}
              href={`/dashboard/${id}`}
              className="card p-5 hover:border-moss"
            >
              <div className="font-display text-xl font-semibold">
                {tribes[id].name}
              </div>
              <div className="text-sm text-faded mt-1">
                {tribes[id].taxName} →
              </div>
            </a>
          ))}
        </div>
      </div>
      </>
    );
  }

  const session = await auth0.getSession();
  if (!session) redirect("/auth/login?returnTo=/dashboard");

  const ids = accessibleTribes(session.user);
  if (ids.length === 1) redirect(`/dashboard/${ids[0]}`);

  return (
    <>
    <Navbar />
    <div className="mx-auto max-w-2xl px-6 pt-24">
      <h1 className="font-display text-4xl font-bold">Tribal tenants</h1>
      {ids.length === 0 ? (
        <p className="mt-4 text-faded">
          Signed in as {session.user.email}, but this account isn&apos;t on any
          tribe&apos;s admin list yet. Add your email to
          {" TEND_ADMINS_RAMAYTUSH or TEND_ADMINS_MUWEKMA"} in .env.local, or
          assign an Auth0 Organization.
        </p>
      ) : (
        <div className="mt-6 grid gap-4">
          {ids.map((id) => (
            <a key={id} href={`/dashboard/${id}`} className="card p-5 hover:border-moss">
              <div className="font-display text-xl font-semibold">
                {tribes[id].name}
              </div>
              <div className="text-sm text-faded mt-1">{tribes[id].taxName} →</div>
            </a>
          ))}
        </div>
      )}
    </div>
  </>
  );
}
