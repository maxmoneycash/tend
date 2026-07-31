"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "@/styles/navbar.css";

const NAV_LINKS = [
  { href: "/programs", label: "Programs" },
  { href: "/explorer", label: "Explorer" },
  { href: "/dashboard", label: "Dashboards" },
];

const LOGO = "/tend-logo-dark.svg";
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
const subscribeToHydration = () => () => {};

export function Navbar() {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
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
        <div className="nav-card">
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

          <Link href="/programs" className="btn-nav-cta">
            Explore programs <span aria-hidden="true">→</span>
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
        mobileOpen &&
        createPortal(
          <>
            <div className="mobile-menu-backdrop" aria-hidden="true" />
            <div
              ref={menuRef}
              id="mobile-navigation-menu"
              className="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Site menu"
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
                    width="28"
                    height="28"
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
                  <span>Close</span>
                </button>
              </div>

              <nav className="mobile-menu-nav" aria-label="Mobile navigation">
                {NAV_LINKS.map((link) => {
                  const current = isCurrent(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`mobile-menu-link${current ? " mobile-menu-link--active" : ""}`}
                      aria-current={current ? "page" : undefined}
                    >
                      {link.label}
                    </Link>
                  );
                })}

                {showLogout && (
                  <a
                    href="/auth/logout"
                    onClick={() => setMobileOpen(false)}
                    className="mobile-menu-link"
                  >
                    Log out
                  </a>
                )}

                <Link
                  href="/programs"
                  onClick={() => setMobileOpen(false)}
                  className="mobile-menu-cta"
                >
                  Explore programs
                  <span aria-hidden="true">→</span>
                </Link>
              </nav>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
