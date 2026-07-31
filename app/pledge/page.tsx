import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { PledgeFlow } from "@/components/PledgeFlow";
import { demoMode } from "@/lib/demo";
import { tribes } from "@/lib/tribes";

export default function PledgePage() {
  const demo = demoMode();
  const programs = Object.values(tribes).map(
    ({ id, name, taxName, region, blurb, siteUrl }) => ({
      id,
      name,
      taxName,
      region,
      blurb,
      siteUrl,
    }),
  );

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: "108px" }} />

      <div className="relative overflow-hidden pb-20">
        <div
          className="pointer-events-none absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full opacity-60"
          style={{
            background:
              "radial-gradient(circle, rgba(250,70,22,0.14), transparent 65%)",
            filter: "blur(120px)",
          }}
        />
        <div
          className="pointer-events-none absolute -right-52 top-[30%] h-[560px] w-[560px] rounded-full opacity-50"
          style={{
            background:
              "radial-gradient(circle, rgba(139,92,246,0.12), transparent 65%)",
            filter: "blur(120px)",
          }}
        />

        <section className="relative mx-auto max-w-6xl px-5 pb-12 pt-8 sm:pt-12">
          <div className="max-w-2xl">
            <p className="note">
              {demo ? "Tend demo preview" : "Tend test checkout"}
            </p>
            <h1 className="display-1 mt-3">Find a program by address or county</h1>
            <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-[#555555]">
              Tend matches your county with public information from each
              listed program. A result may include more than one listing.
            </p>
          </div>

          <div className="mt-7">
            <PledgeFlow demo={demo} programs={programs} />
          </div>
        </section>

        <section className="relative mx-auto max-w-6xl px-5">
          <div className="surface-1 rounded-[16px] p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
            <div>
              <h2 className="text-[16px] font-semibold text-[#111111]">
                Looking for the real donation page?
              </h2>
              <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-[#555555]">
                Each program page keeps its official donation links separate
                from Tend&apos;s {demo ? "demo preview" : "Stripe test checkout"}.
              </p>
            </div>
            <Link
              href="/programs"
              className="btn btn-ghost mt-4 shrink-0 sm:mt-0"
            >
              View official donation links
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
