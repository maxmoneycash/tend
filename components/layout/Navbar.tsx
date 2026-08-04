"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import "@/styles/navbar.css";

const NAV_LINKS = [
  { href: "/organizations", label: "For Organizations" },
  { href: "/programs", label: "Programs" },
  { href: "/explorer", label: "Explorer" },
  { href: "/dashboard", label: "Dashboards" },
];

const LOGO = "/tend-logo-dark.svg";
const MENU_CLIP_CLOSED = "inset(10px 10px calc(100% - 76px) 10px round 18px)";
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
const subscribeToHydration = () => () => {};

export function Navbar() {
  const pathname = usePathname();
  const navCardRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );

  const showLogout =
    pathname.startsWith("/dashboard") || pathname.startsWith("/pledge");
  const isCurrent = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => {
    const card = navCardRef.current;
    if (!card) return;

    let frame = 0;
    const updateGlass = () => {
      const progress = Math.min(window.scrollY / 500, 1);
      const eased = progress * progress;
      const backgroundOpacity = 0.18 + eased * 0.7;
      const blur = 4 + eased * 8;

      card.style.background = `rgba(255,255,255,${backgroundOpacity})`;
      card.style.backdropFilter = `blur(${blur}px)`;
      card.style.setProperty("-webkit-backdrop-filter", `blur(${blur}px)`);
      card.style.borderColor = progress > 0.15 ? "rgb(217, 212, 212)" : "transparent";
      card.style.boxShadow =
        progress > 0.15 ? "0 6px 12px rgba(0,0,0,0.06)" : "none";
      frame = 0;
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateGlass);
    };

    updateGlass();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const desktopQuery = window.matchMedia("(min-width: 769px)");

    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    const closeAtDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setMobileOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMobileOpen(false);
        return;
      }

      if (event.key !== "Tab" || !menuRef.current) return;

      const focusable = Array.from(
        menuRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      const first = focusable.at(0);
      const last = focusable.at(-1);
      if (!first || !last) return;

      if (!menuRef.current.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    desktopQuery.addEventListener("change", closeAtDesktop);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      desktopQuery.removeEventListener("change", closeAtDesktop);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;

      if (
        previouslyFocused?.isConnected &&
        previouslyFocused.getClientRects().length > 0
      ) {
        previouslyFocused.focus();
      }
    };
  }, [mobileOpen]);

  return (
    <>
      <a href="#main-content" className="nav-skip-link">
        Skip to main content
      </a>

      <nav className="navbar" aria-label="Primary navigation">
        <div className="nav-card" data-theme="light" ref={navCardRef}>
          <Link
            href="/programs"
            className="nav-logo"
            aria-label="Tend programs"
          >
            <Image
              src={LOGO}
              alt=""
              width={200}
              height={90}
              className="logo-img"
              priority
            />
          </Link>

          <div className="nav-links">
            {NAV_LINKS.map((link) => {
              const current = isCurrent(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link${current ? " nav-link--active" : ""}`}
                  aria-current={current ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
            {showLogout && (
              <a href="/auth/logout" className="nav-link">
                Log out
              </a>
            )}
          </div>

          <Link href="/pledge" className="btn-nav-cta">
            Start a donation
            <span aria-hidden="true" className="arrow">
              →
            </span>
          </Link>

          <button
            type="button"
            className="nav-hamburger"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-controls={mobileOpen ? "mobile-navigation-menu" : undefined}
            aria-expanded={mobileOpen}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M3 18H21V16H3V18ZM3 13H21V11H3V13ZM3 6V8H21V6H3Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </nav>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {mobileOpen && (
              <>
                <motion.div
                  animate={{ opacity: 1 }}
                  aria-hidden="true"
                  className="mobile-menu-backdrop"
                  exit={{ opacity: 0 }}
                  initial={{ opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0.01 : 0.12 }}
                />
                <motion.div
                  ref={menuRef}
                  id="mobile-navigation-menu"
                  className="mobile-menu"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Site menu"
                  initial={
                    reduceMotion
                      ? { opacity: 0 }
                      : { clipPath: MENU_CLIP_CLOSED, opacity: 0 }
                  }
                  animate={
                    reduceMotion
                      ? { opacity: 1 }
                      : {
                          clipPath: "inset(0px 0px 0px 0px round 0px)",
                          opacity: 1,
                        }
                  }
                  exit={
                    reduceMotion
                      ? { opacity: 0 }
                      : { clipPath: MENU_CLIP_CLOSED, opacity: 0 }
                  }
                  transition={
                    reduceMotion
                      ? { duration: 0.12 }
                      : {
                          clipPath: {
                            duration: 0.55,
                            ease: [0.22, 0, 0.1, 1],
                          },
                          opacity: { duration: 0.12 },
                        }
                  }
                >
                  <div className="mobile-menu-header">
                    <Link
                      href="/programs"
                      className="mobile-menu-logo"
                      aria-label="Tend programs"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Image
                        src={LOGO}
                        alt=""
                        width={200}
                        height={90}
                        className="mobile-menu-logo-img"
                        priority
                      />
                    </Link>

                    <button
                      ref={closeButtonRef}
                      type="button"
                      className="mobile-menu-close"
                      onClick={() => setMobileOpen(false)}
                      aria-label="Close menu"
                    >
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      <span>MENU</span>
                    </button>
                  </div>

                  <motion.nav
                    className="mobile-menu-nav"
                    aria-label="Mobile navigation"
                    animate={{ opacity: 1 }}
                    initial={{ opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: reduceMotion ? 0.12 : 0.2,
                      delay: reduceMotion ? 0 : 0.15,
                    }}
                  >
                    {NAV_LINKS.map((link, index) => {
                      const current = isCurrent(link.href);
                      return (
                        <motion.div
                          key={link.href}
                          animate={{ opacity: 1, y: 0 }}
                          initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
                          exit={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
                          transition={
                            reduceMotion
                              ? { duration: 0.12 }
                              : {
                                  type: "spring",
                                  damping: 25,
                                  stiffness: 250,
                                  delay: 0.15 + index * 0.035,
                                }
                          }
                        >
                          <Link
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            className={`mobile-menu-link${current ? " mobile-menu-link--active" : ""}`}
                            aria-current={current ? "page" : undefined}
                          >
                            {link.label}
                          </Link>
                        </motion.div>
                      );
                    })}

                    {showLogout && (
                      <motion.div
                        animate={{ opacity: 1, y: 0 }}
                        initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
                        exit={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
                        transition={
                          reduceMotion
                            ? { duration: 0.12 }
                            : {
                                type: "spring",
                                damping: 25,
                                stiffness: 250,
                                delay: 0.15 + NAV_LINKS.length * 0.035,
                              }
                        }
                      >
                        <a
                          href="/auth/logout"
                          onClick={() => setMobileOpen(false)}
                          className="mobile-menu-link"
                        >
                          Log out
                        </a>
                      </motion.div>
                    )}

                    <motion.div
                      animate={{ opacity: 1, y: 0 }}
                      className="mobile-menu-cta-wrap"
                      initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
                      exit={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
                      transition={
                        reduceMotion
                          ? { duration: 0.12 }
                          : {
                              type: "spring",
                              damping: 25,
                              stiffness: 250,
                              delay: 0.15 +
                                (NAV_LINKS.length + Number(showLogout)) * 0.035,
                            }
                      }
                    >
                      <Link
                        href="/pledge"
                        onClick={() => setMobileOpen(false)}
                        className="mobile-menu-cta"
                      >
                        Start a donation
                      </Link>
                    </motion.div>
                  </motion.nav>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
