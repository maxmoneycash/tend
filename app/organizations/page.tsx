import { Navbar } from "@/components/layout/Navbar";
import { OrganizationLanding } from "@/components/organizations/OrganizationLanding";

export default function OrganizationsPage() {
  return (
    <div className="cr-landing-page">
      <Navbar />
      <OrganizationLanding />
    </div>
  );
}
