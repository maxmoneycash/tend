import { Navbar } from "@/components/layout/Navbar";
import "@/styles/content-rewards-product.css";

export default function DashboardLoading() {
  return (
    <div className="cr-product-page min-h-screen" aria-busy="true" aria-label="Loading dashboard">
      <Navbar />
      <div className="cr-product-nav-spacer" />
      <main className="cr-product-shell cr-dashboard-loading">
        <div className="cr-dashboard-loading-header"><span /><div><i /><b /><i /></div></div>
        <div className="cr-dashboard-loading-panel">
          <header><i /><b /></header>
          <div>{[0, 1, 2, 3].map((item) => <span key={item} />)}</div>
        </div>
        <div className="cr-dashboard-loading-register">{[0, 1, 2, 3].map((item) => <span key={item} />)}</div>
      </main>
    </div>
  );
}
