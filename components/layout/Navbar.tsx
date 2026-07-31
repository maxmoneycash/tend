"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
// ThemeSwitcher removed from nav — now fixed at bottom of page
import "@/styles/landing.css";

const NAV_LINKS = [
  { href: "/programs", label: "Programs" },
  { href: "/onboarding/setup", label: "Create Program" },
  { href: "/explorer", label: "Explorer" },
  { href: "/rewards", label: "Rewards" },
  { href: "/dashboard", label: "Dashboards" },
];

const LOGO_LIGHT = "/tend-logo-light.svg";
const LOGO_DARK = "/tend-logo-dark.svg";

export function Navbar() {
  const pathname = usePathname();
  const navCardRef = useRef<HTMLDivElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isLightPage = true; // original light theme carries the whole app

  useEffect(() => { setMounted(true); }, []);

  // Scroll-linked glass effect — initial state handled by CSS via data-theme
  useEffect(() => {
    const card = navCardRef.current;
    if (!card) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        if (card) {
          const progress = Math.min(window.scrollY / 500, 1);
          const eased = progress * progress;

          if (isLightPage) {
            const bgOpacity = 0.18 + eased * (0.88 - 0.18);
            const blur = 4 + eased * 8;
            card.style.background = `rgba(255,255,255,${bgOpacity})`;
            card.style.backdropFilter = `blur(${blur}px)`;
            (card.style as any).webkitBackdropFilter = `blur(${blur}px)`;
            if (progress > 0.15) {
              card.style.borderColor = "rgb(217, 212, 212)";
              card.style.boxShadow = `0 6px 12px rgba(0,0,0,0.06)`;
            } else {
              card.style.borderColor = "transparent";
              card.style.boxShadow = "none";
            }
          } else {
            const bgOpacity = 0.39 + eased * (0.92 - 0.39);
            const blur = 4 + eased * 16;
            const borderOpacity = 0.06 + eased * 0.04;
            card.style.background = `rgba(20,20,20,${bgOpacity})`;
            card.style.boxShadow = `0 2px 16px rgba(0,0,0,${0.1 + progress * 0.15})`;
            card.style.backdropFilter = `blur(${blur}px)`;
            (card.style as any).webkitBackdropFilter = `blur(${blur}px)`;
            card.style.borderColor = `rgba(255,255,255,${borderOpacity})`;
          }
        }
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isLightPage]);

  // Set theme-color + html/body background to match page theme
  // This controls the dynamic island area AND the over-scroll bounce color
  const pageBg = isLightPage ? "#f7f7f7" : "#151515";
  useEffect(() => {
    const themeTag = document.querySelector('meta[name="theme-color"]');
    if (themeTag) themeTag.setAttribute("content", pageBg);
    document.documentElement.style.backgroundColor = pageBg;
    document.body.style.backgroundColor = pageBg;
    return () => {
      document.documentElement.style.backgroundColor = "";
      document.body.style.backgroundColor = "";
    };
  }, [pageBg]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const menuBg = isLightPage ? "rgb(247, 247, 247)" : "#151515";
  const menuText = isLightPage ? "#0a0a0a" : "#ffffff";
  const ctaBg = isLightPage ? "#0a0a0a" : "linear-gradient(359deg, rgb(255,255,255) 0%, rgb(245,245,245) 100%)";
  const ctaColor = isLightPage ? "#ffffff" : "#0a0a0a";

  return (
    <>
      <nav className="navbar">
        <div className="nav-card" ref={navCardRef} data-theme={isLightPage ? "light" : "dark"}>
          <Link href="/" className="nav-logo">
            <img
              src={isLightPage ? LOGO_DARK : LOGO_LIGHT}
              alt="Tend"
              className="logo-img"
            />
          </Link>
          <div className="nav-links">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link${pathname === link.href ? " nav-link--active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
            {pathname.startsWith("/dashboard") && (
              <a href="/auth/logout" className="nav-link">
                Log out
              </a>
            )}
          </div>
          <Link href="/programs" className="btn-nav-cta">
            Start a pledge <span className="arrow">→</span>
          </Link>
          <button
            className="nav-hamburger"
            onClick={() => setMobileOpen(true)}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 18H21V16H3V18ZM3 13H21V11H3V13ZM3 6V8H21V6H3Z" fill="currentColor" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Portal: render mobile menu directly into document.body
           to escape parent stacking contexts (ViewTransitions, zoom, etc.)
           that break position:fixed */}
      {mounted && createPortal(
        <>
          {/* Backdrop — box-shadow 9999px guarantees total screen coverage */}
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 99998,
              background: menuBg,
              boxShadow: `0 0 0 9999px ${menuBg}`,
              opacity: mobileOpen ? 1 : 0,
              pointerEvents: "none",
              transition: mobileOpen ? "opacity 0.01s" : "opacity 0s",
            }}
          />

          {/* Mobile menu — ALWAYS fullscreen, clipPath creates expand effect */}
          <motion.div
            animate={mobileOpen ? {
              clipPath: "inset(0px 0px 0px 0px round 0px)",
              opacity: 1,
            } : {
              clipPath: "inset(10px 10px calc(100% - 76px) 10px round 18px)",
              opacity: 0,
            }}
            transition={mobileOpen ? {
              clipPath: { duration: 0.55, ease: [0.22, 0, 0.1, 1] },
              opacity: { duration: 0.01 },
            } : {
              clipPath: { duration: 0 },
              opacity: { duration: 0 },
            }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: mobileOpen ? 99999 : -1,
              background: menuBg,
              display: "flex",
              flexDirection: "column",
              pointerEvents: mobileOpen ? "auto" : "none",
            }}
          >
            {/* Header row — padded below safe area */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "calc(24px + env(safe-area-inset-top, 0px)) 20px 0",
              }}
            >
              <Link href="/" className="nav-logo" onClick={() => setMobileOpen(false)}>
                <img
                  src={isLightPage ? LOGO_DARK : LOGO_LIGHT}
                  alt="Content Rewards"
                  style={{ height: 41, width: "auto" }}
                />
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: menuText,
                  padding: 8,
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                <span style={{
                  fontSize: 16,
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                  color: menuText,
                }}>
                  MENU
                </span>
              </button>
            </div>

            {/* Links */}
            <motion.div
              animate={{ opacity: mobileOpen ? 1 : 0 }}
              transition={mobileOpen
                ? { duration: 0.2, delay: 0.15 }
                : { duration: 0 }
              }
              style={{ display: "flex", flexDirection: "column", gap: 14, padding: "30px 20px 0" }}
            >
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  animate={mobileOpen
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 16 }
                  }
                  transition={mobileOpen
                    ? { type: "spring", damping: 25, stiffness: 250, delay: 0.15 + i * 0.035 }
                    : { duration: 0 }
                  }
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      fontSize: 34,
                      fontWeight: 500,
                      color: menuText,
                      letterSpacing: "-0.04em",
                      lineHeight: "51px",
                      textDecoration: "none",
                      display: "block",
                    }}
                  >
                    {link.label.toUpperCase()}
                  </Link>
                </motion.div>
              ))}
              {pathname.startsWith("/dashboard") && (
                <motion.div
                  animate={
                    mobileOpen
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: 16 }
                  }
                  transition={
                    mobileOpen
                      ? {
                          type: "spring",
                          damping: 25,
                          stiffness: 250,
                          delay: 0.15 + NAV_LINKS.length * 0.035,
                        }
                      : { duration: 0 }
                  }
                >
                  <a
                    href="/auth/logout"
                    style={{
                      color: menuText,
                      display: "block",
                      fontSize: 34,
                      fontWeight: 500,
                      lineHeight: "51px",
                      textDecoration: "none",
                    }}
                  >
                    LOG OUT
                  </a>
                </motion.div>
              )}

              {/* CTA button */}
              <motion.div
                animate={mobileOpen
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 16 }
                }
                transition={mobileOpen
                  ? { type: "spring", damping: 25, stiffness: 250, delay: 0.15 + NAV_LINKS.length * 0.035 }
                  : { duration: 0 }
                }
                style={{ marginTop: 20 }}
              >
                <Link
                  href="/onboarding/creator"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    padding: "14px 40px",
                    background: ctaBg,
                    color: ctaColor,
                    fontSize: 18,
                    fontWeight: 600,
                    borderRadius: 18,
                    textDecoration: "none",
                  }}
                >
                  Become a Creator
                </Link>
              </motion.div>

            </motion.div>
          </motion.div>
        </>,
        document.body
      )}
    </>
  );
}
