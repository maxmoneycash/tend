"use client";

import { useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { AmbientBlobs } from "@/components/layout/AmbientBlobs";
import { CampaignCreateWizard } from "@/components/campaign-create/CampaignCreateWizard";
import { CreatorClient } from "@/components/onboarding/CreatorClient";
import { CampaignThemeProvider, useCampaignTheme } from "@/components/campaign-create/ThemeContext";
import { ThemeSwitcherDesktop } from "@/components/campaign-create/ThemeSwitcher";

function CampaignCreateInner() {
  const { theme } = useCampaignTheme();

  // Lock ALL scrolling on html/body — this page is viewport-locked
  useEffect(() => {
    const s = (el: HTMLElement) => {
      el.style.overflow = "hidden";
      el.style.height = "100dvh";
      el.style.maxHeight = "100dvh";
      el.style.position = "fixed";
      el.style.width = "100%";
      el.style.top = "0";
    };
    s(document.documentElement);
    s(document.body);
    return () => {
      for (const el of [document.documentElement, document.body]) {
        el.style.overflow = "";
        el.style.height = "";
        el.style.maxHeight = "";
        el.style.position = "";
        el.style.width = "";
        el.style.top = "";
      }
    };
  }, []);

  return (
    <div
      className="campaign-create-page"
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        zIndex: 1,
      }}
    >
      {/* Navbar */}
      {theme !== "light" && <Navbar />}

      {/* Content area — internal scroll only */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          paddingTop: theme !== "light" ? 108 : 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingBottom: 64 }}>
          {theme === "whop" && <CampaignCreateWizard variant="whop" />}
          {theme === "light" && <CreatorClient />}
          {theme === "classic" && (
            <div className="relative" style={{ overflow: "clip" }}>
              <AmbientBlobs variant="earn" />
              <CampaignCreateWizard variant="classic" />
            </div>
          )}
        </div>
      </div>

      {/* Fixed theme switcher */}
      <div
        style={{
          position: "fixed",
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
        }}
      >
        <ThemeSwitcherDesktop />
      </div>
    </div>
  );
}

export default function CampaignCreatePage() {
  return (
    <CampaignThemeProvider>
      <CampaignCreateInner />
    </CampaignThemeProvider>
  );
}
