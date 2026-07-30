"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type CampaignTheme = "classic" | "whop" | "light";

interface ThemeContextValue {
  theme: CampaignTheme;
  setTheme: (t: CampaignTheme) => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "classic",
  setTheme: () => {},
  cycleTheme: () => {},
});

const THEME_ORDER: CampaignTheme[] = ["classic", "whop", "light"];

export function CampaignThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<CampaignTheme>("classic");

  const cycleTheme = () => {
    setTheme((prev) => {
      const idx = THEME_ORDER.indexOf(prev);
      return THEME_ORDER[(idx + 1) % THEME_ORDER.length];
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useCampaignTheme() {
  return useContext(ThemeContext);
}
