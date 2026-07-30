"use client";

import { motion } from "motion/react";
import { useCampaignTheme, type CampaignTheme } from "./ThemeContext";

const THEMES: { key: CampaignTheme; label: string; icon: React.ReactNode }[] = [
  {
    key: "classic",
    label: "Dark",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
      </svg>
    ),
  },
  {
    key: "whop",
    label: "Whop",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6z" />
      </svg>
    ),
  },
  {
    key: "light",
    label: "Light",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
      </svg>
    ),
  },
];

const R = 12; // consistent border radius

/** Fixed pill theme switcher — adapts to current theme */
export function ThemeSwitcherDesktop() {
  const { theme, setTheme } = useCampaignTheme();

  const isLight = theme === "light";

  const containerBg = isLight
    ? "rgba(255,255,255,0.85)"
    : "rgba(20,20,20,0.85)";
  const containerBorder = isLight
    ? "rgba(0,0,0,0.1)"
    : "rgba(255,255,255,0.1)";
  const containerShadow = isLight
    ? "0 4px 24px rgba(0,0,0,0.12)"
    : "0 4px 24px rgba(0,0,0,0.4)";
  const activePillBg = isLight
    ? "#0a0a0a"
    : "linear-gradient(359deg, rgb(255,255,255) 0%, rgb(245,245,245) 100%)";
  const activePillShadow = isLight
    ? "0 1px 4px rgba(0,0,0,0.1)"
    : "0 1px 4px rgba(0,0,0,0.15)";
  const activeTextColor = isLight ? "#fff" : "#0a0a0a";
  const inactiveTextColor = isLight ? "#999" : "#888";

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0,
        padding: 3,
        borderRadius: R,
        background: containerBg,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: `1px solid ${containerBorder}`,
        boxShadow: containerShadow,
      }}
    >
      {THEMES.map((t) => {
        const isActive = theme === t.key;
        return (
          <button
            key={t.key}
            onClick={() => setTheme(t.key)}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 10px",
              borderRadius: R - 3,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? activeTextColor : inactiveTextColor,
              background: "transparent",
              zIndex: 1,
              whiteSpace: "nowrap",
              transition: "color 0.15s",
            }}
          >
            {isActive && (
              <motion.div
                layoutId="theme-pill-fixed"
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: R - 3,
                  background: activePillBg,
                  boxShadow: activePillShadow,
                  zIndex: -1,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
