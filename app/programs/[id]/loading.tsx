import { Navbar } from "@/components/layout/Navbar";

export default function ProgramLoading() {
  return (
    <div className="min-h-screen pb-24 md:pb-0" aria-busy="true" aria-label="Loading program">
      <Navbar />
      <div style={{ paddingTop: "108px" }} />
      <div className="program-loading-shell">
        <div className="program-loading-back" />
        <div className="program-loading-hero">
          <div className="program-loading-copy">
            <span />
            <strong />
            <i />
            <i />
            <div />
          </div>
          <div className="program-loading-thumbnail">
            <span>Loading program film</span>
          </div>
        </div>
        <div className="program-loading-rail" />
        <div className="program-loading-workbench" />
      </div>
    </div>
  );
}
