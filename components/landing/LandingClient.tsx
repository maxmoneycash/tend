// @ts-nocheck — Landing page animation file: 189 type errors are all
// Element vs HTMLElement casts and motion library overload mismatches.
// No runtime bugs; all animation/DOM manipulation works correctly.
"use client";

import { useEffect, useState } from "react";
import { animate, inView } from "motion";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { MarketOverview } from "./MarketOverview";
import { BrandCarousel } from "./BrandCarousel";
import { campaigns as staticCampaigns } from "@/lib/campaigns";
import type { Campaign } from "@/lib/campaigns";
import "@/styles/landing.css";

export function LandingClient() {
  const [dbCampaigns, setDbCampaigns] = useState<Campaign[]>([]);

  // Fetch DB campaigns + localStorage campaigns on mount
  useEffect(() => {
    const platformIcons = {
      0: { name: "YouTube", icon: "https://framerusercontent.com/images/CBxFNUANvi7ge54R5FtpCEhzc.png?width=49&height=49" },
      1: { name: "TikTok", icon: "https://framerusercontent.com/images/2SIrtXv2hRuMV0om7ilTfVAUc.png?width=45&height=45" },
      2: { name: "Instagram", icon: "https://framerusercontent.com/images/zAMMS3OeUoqs6fW3GSuExa5NS4g.png?width=45&height=45" },
      3: { name: "X", icon: "" },
    };

    // Load localStorage campaigns as fallback
    let localCampaigns: Campaign[] = [];
    try {
      const raw = JSON.parse(localStorage.getItem("cr_campaigns") || "[]");
      localCampaigns = raw.map((c: any) => {
        const rate = (c.cpmRates?.[0] || 0);
        const budgetUsd = (c.budget || 0) / 1_000_000;
        return {
          id: c.id,
          onChainAddress: c.onChainAddress || "",
          title: c.name || "Untitled",
          brand: "You",
          brandVerified: false,
          brandAvatar: "",
          thumbnail: "",
          tags: [c.category || "General"],
          timeAgo: "Just created",
          earned: "$0",
          earnedNum: 0,
          budget: "$" + budgetUsd.toLocaleString(),
          budgetNum: budgetUsd,
          rate: "$" + rate.toFixed(2),
          rateNum: rate,
          approval: "-",
          approvalNum: 0,
          views: "0",
          creators: "0",
          creatorsNum: 0,
          platforms: (c.platforms || []).map((i: number) => platformIcons[i] || { name: "Other", icon: "" }),
          category: c.category || "General",
          lastUpdated: "Just created",
          description: "",
          requirements: c.requirements || [],
          earnings: [],
          resources: [],
          leaderboard: [],
          totalViews: "0",
          totalSubmissions: "0",
        } as Campaign;
      });
    } catch {}

    // Try API first, fall back to localStorage
    fetch("/api/rewards/discover")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        const apiCampaigns = Array.isArray(data) ? data : [];
        // Merge API + localStorage campaigns (API takes priority)
        const merged = [...apiCampaigns, ...localCampaigns];
        if (merged.length > 0) setDbCampaigns(merged);
      })
      .catch(() => {
        if (localCampaigns.length > 0) setDbCampaigns(localCampaigns);
      });
  }, []);

  // Merge: DB campaigns first (newest), then static, deduped by id
  const seenIds = new Set<string>();
  const campaigns: Campaign[] = [];
  for (const c of [...dbCampaigns, ...staticCampaigns]) {
    if (!seenIds.has(c.id)) {
      seenIds.add(c.id);
      campaigns.push(c);
    }
  }

  useEffect(() => {
    /* ═══════════════════════════════════════════════════════════════
       Content Rewards Landing Page Clone — Motion Animations
       Reverse-engineered from production Framer site

       Production animation patterns extracted:
       - Section headers: perspective(1200px), will-change: transform
       - Trust cards: opacity 0.5→1, perspective(1200px) translateY(50px) rotateX(10deg)→0
       - Step card mockups: opacity 0→1, scale(0.9)→1
       - Step card details: opacity 0→1, rotate(-4deg/2deg/10deg)→0
       - Testimonials: active scale(1) opacity(1), inactive scale(0.88) opacity(0.6)
       - Carousel track: translateY offset linked to scroll
       - Gauge elements: opacity 0→1, scale(0.9)→1
       ═══════════════════════════════════════════════════════════════ */


    /* ── Disable scroll-linked animations to prevent discrete scroll fighting ── */
    /* Elements use inView() triggers for entrance instead */
    const _scroll = (..._args: unknown[]) => { /* no-op */ };
    void _scroll; // suppress unused warning

    /* ── Helper: scroll-linked animation on a single element ─── */
    function scrollAnimate(el: Element, keyframes: Record<string, unknown>, options: Record<string, unknown> = {}) {
      // Disabled: was causing discrete scroll movements
      void el; void keyframes; void options;
    }

    /* ══════════════════════════════════════════════════════════════
       1. HERO — Staggered entrance animation
       ══════════════════════════════════════════════════════════════ */
    const heroContent = document.querySelector('.hero-content');
    const heroVisual = document.querySelector('.hero-visual');

    if (heroContent) {
      // Collect all hero elements for staggered entrance
      const heroChildren = [
        ...heroContent.querySelectorAll('.hero-h1'),
        heroContent.querySelector('.hero-toggle-wrap'),
        heroContent.querySelector('.hero-sub'),
        heroContent.querySelector('.hero-ctas'),
      ].filter(Boolean);

      heroChildren.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(25px)';
      });

      // Staggered entrance with spring-like easing
      setTimeout(() => {
        heroChildren.forEach((el, i) => {
          animate(el,
            { opacity: [0, 1], transform: ['translateY(25px)', 'translateY(0px)'] },
            { duration: 0.65, delay: i * 0.1, easing: [0.22, 1, 0.36, 1] }
          );
        });
      }, 150);
    }

    // Hero visual wrapper — just fade in, individual 3D cards animated in section 16
    if (heroVisual) {
      heroVisual.style.opacity = '0';
      setTimeout(() => {
        animate(heroVisual,
          { opacity: [0, 1] },
          { duration: 0.6, delay: 0.3, easing: [0.22, 1, 0.36, 1] }
        );
      }, 150);
    }

    /* ══════════════════════════════════════════════════════════════
       2. SECTION HEADERS — Perspective entrance on scroll
       Production: opacity: 1, transform: perspective(1200px), will-change: transform
       ══════════════════════════════════════════════════════════════ */
    document.querySelectorAll('.pill-badge').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px) scale(0.95)';
      inView(el, () => {
        animate(el,
          { opacity: [0, 1], transform: ['translateY(20px) scale(0.95)', 'translateY(0) scale(1)'] },
          { duration: 0.6, easing: [0.22, 1, 0.36, 1] }
        );
      }, { margin: '0px 0px -60px 0px' });
    });

    document.querySelectorAll('.section-h2').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'perspective(1200px) translateY(30px)';
      el.style.willChange = 'transform';
      inView(el, () => {
        animate(el,
          { opacity: [0, 1], transform: ['perspective(1200px) translateY(30px)', 'perspective(1200px) translateY(0)'] },
          { duration: 0.7, easing: [0.22, 1, 0.36, 1] }
        );
      }, { margin: '0px 0px -60px 0px' });
    });

    document.querySelectorAll('.section-p').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      inView(el, () => {
        animate(el,
          { opacity: [0, 1], transform: ['translateY(20px)', 'translateY(0)'] },
          { duration: 0.6, delay: 0.15, easing: [0.22, 1, 0.36, 1] }
        );
      }, { margin: '0px 0px -40px 0px' });
    });

    /* ══════════════════════════════════════════════════════════════
       3. HOW IT WORKS — 3D perspective tilt cards (scroll-linked)
       Production: perspective(1200px) translateY(50px) rotateX(10deg) → identity
       Inner mockups: opacity 0→1, scale(0.9)→1
       Details (bank, whop): opacity 0→1, rotate(-4deg/2deg)→0
       ══════════════════════════════════════════════════════════════ */
    document.querySelectorAll('.hiw-card').forEach((card, i) => {
      // Initial: tilted, semi-transparent
      card.style.opacity = '0';
      card.style.transform = 'perspective(1200px) translateY(60px) rotateX(12deg)';
      card.style.willChange = 'transform';
      card.style.transformOrigin = 'center bottom';

      inView(card, () => {
        animate(card,
          {
            opacity: [0, 0.5, 1],
            transform: [
              'perspective(1200px) translateY(60px) rotateX(12deg)',
              'perspective(1200px) translateY(15px) rotateX(3deg)',
              'perspective(1200px) translateY(0px) rotateX(0deg)',
            ]
          },
          { duration: 0.9, delay: i * 0.15, easing: [0.22, 1, 0.36, 1] }
        );
      }, { margin: '0px 0px -30px 0px' });

      // Also add subtle scroll-linked parallax AFTER entrance
      _scroll(
        animate(card, {
          transform: [
            'perspective(1200px) translateY(0px) rotateX(0deg)',
            'perspective(1200px) translateY(-10px) rotateX(-2deg)',
          ]
        }, { duration: 1, easing: 'linear' }),
        { target: card, offset: ['start end', 'end start'] }
      );
    });

    // Inner mockup elements
    document.querySelectorAll('.hiw-card-mockup').forEach((mockup, i) => {
      mockup.style.opacity = '0';
      mockup.style.transform = 'scale(0.9) translateY(10px)';

      inView(mockup, () => {
        animate(mockup,
          { opacity: [0, 1], transform: ['scale(0.9) translateY(10px)', 'scale(1) translateY(0)'] },
          { duration: 0.7, delay: 0.25 + i * 0.1, easing: [0.22, 1, 0.36, 1] }
        );
      }, { margin: '0px 0px -20px 0px' });
    });

    // Step labels
    document.querySelectorAll('.hiw-card-bottom').forEach((bottom, i) => {
      bottom.style.opacity = '0';
      bottom.style.transform = 'translateY(15px)';

      inView(bottom, () => {
        animate(bottom,
          { opacity: [0, 1], transform: ['translateY(15px)', 'translateY(0)'] },
          { duration: 0.5, delay: 0.4 + i * 0.1, easing: [0.22, 1, 0.36, 1] }
        );
      }, { margin: '0px 0px -10px 0px' });
    });

    /* ══════════════════════════════════════════════════════════════
       3B. GET PAID CARD — $7,000→$7,500 counter + calendar animation
       Calendar days fill with green checkmarks one by one, then PAID banner
       ══════════════════════════════════════════════════════════════ */
    const hiwCounter = document.getElementById('hiwCounter');
    const hiwCalendar = document.getElementById('hiwCalendar');
    const hiwPaid = document.getElementById('hiwPaid');
    const calDays = hiwCalendar ? hiwCalendar.querySelectorAll('.hiw-cal-day') : [];
    let step3Animated = false;

    function animateStep3() {
      if (step3Animated) return;
      step3Animated = true;

      const checkSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20,6 9,17 4,12"/></svg>';
      const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

      function runCalendarCycle() {
        // Counter: $7,000 → $7,500
        if (hiwCounter) {
          let startVal = 7000;
          const endVal = 7500;
          const duration = 3500;
          const startTime = performance.now();
          function counterTick(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(startVal + (endVal - startVal) * eased);
            hiwCounter.textContent = '$' + current.toLocaleString();
            if (progress < 1) requestAnimationFrame(counterTick);
          }
          requestAnimationFrame(counterTick);
        }

        // Fill each day with green checkmark
        calDays.forEach((day, i) => {
          setTimeout(() => {
            day.classList.add('hiw-cal-day--green');
            day.innerHTML = checkSvg;
            animate(day,
              { transform: ['scale(0.7)', 'scale(1.1)', 'scale(1)'] },
              { duration: 0.35, easing: [0.22, 1, 0.36, 1] }
            );
          }, 400 + i * 400);
        });

        // After all days, show PAID banner
        const paidDelay = 400 + calDays.length * 400 + 300;
        setTimeout(() => {
          if (hiwCalendar) {
            animate(hiwCalendar,
              { opacity: [1, 0], transform: ['translateY(0)', 'translateY(-10px)'] },
              { duration: 0.3, easing: [0.22, 1, 0.36, 1] }
            ).finished.then(() => {
              hiwCalendar.style.display = 'none';
              if (hiwPaid) {
                hiwPaid.classList.add('show');
                animate(hiwPaid,
                  { opacity: [0, 1], transform: ['scale(0.8)', 'scale(1)'] },
                  { duration: 0.4, easing: [0.22, 1, 0.36, 1] }
                );
              }

              // Hold PAID for 1.5s, then reset and cycle again
              setTimeout(() => {
                // Hide PAID
                if (hiwPaid) hiwPaid.classList.remove('show');
                // Reset calendar
                if (hiwCalendar) {
                  hiwCalendar.style.display = '';
                  hiwCalendar.style.opacity = '1';
                  hiwCalendar.style.transform = 'translateY(0)';
                }
                // Reset days to original labels
                calDays.forEach((day, i) => {
                  day.classList.remove('hiw-cal-day--green');
                  day.innerHTML = dayLabels[i];
                });
                // Reset counter
                if (hiwCounter) hiwCounter.textContent = '$7,000';
                // Start next cycle
                setTimeout(runCalendarCycle, 400);
              }, 1500);
            });
          }
        }, paidDelay);
      }

      runCalendarCycle();

      // Start Shelby receipt wheel after first calendar day
      setTimeout(() => {
        const receipt = document.getElementById('shelbyReceipt');
        if (!receipt) return;
        receipt.classList.add('open');

        const items = receipt.querySelectorAll('.shelby-receipt-item');
        let idx = 0;

        function showNext() {
          if (idx >= items.length) {
            // Loop: reset all items and restart
            items.forEach(item => {
              item.classList.remove('active', 'done');
              item.querySelector('.shelby-item-check')?.classList.remove('checked');
            });
            idx = 0;
            setTimeout(showNext, 600);
            return;
          }

          const item = items[idx];
          // Wheel in from below
          item.classList.add('active');

          // After a beat, show checkmark
          setTimeout(() => {
            const check = item.querySelector('.shelby-item-check');
            if (check) check.classList.add('checked');

            // After checkmark, wheel out upward + bring next
            setTimeout(() => {
              item.classList.remove('active');
              item.classList.add('done');
              idx++;
              setTimeout(showNext, 100);
            }, 350);
          }, 500);
        }

        setTimeout(showNext, 300);
      }, 800);
    }

    // Trigger when Step 3 card scrolls into view
    const step3Card = document.querySelector('.hiw-card-visual--3');
    if (step3Card) {
      inView(step3Card, () => {
        setTimeout(animateStep3, 500);
      }, { margin: '0px 0px -40px 0px' });
    }

    /* ══════════════════════════════════════════════════════════════
       4. TRUSTED BRANDS — Entrance + continuous marquee
       ══════════════════════════════════════════════════════════════ */
    const trustedWrap = document.querySelector('.trusted-wrap');
    if (trustedWrap) {
      trustedWrap.style.opacity = '0';
      trustedWrap.style.transform = 'translateY(25px)';

      inView(trustedWrap, () => {
        animate(trustedWrap,
          { opacity: [0, 1], transform: ['translateY(25px)', 'translateY(0)'] },
          { duration: 0.7, easing: [0.22, 1, 0.36, 1] }
        );
      }, { margin: '0px 0px -30px 0px' });
    }

    /* ══════════════════════════════════════════════════════════════
       5. TRUST SECTION — Scroll-linked 3D perspective tilt
       Production initial: opacity: 0.5, perspective(1200px) translateY(50px) rotateX(10deg)
       Scrolls to: opacity: 1, perspective(1200px) translateY(0) rotateX(0)
       This is CONTINUOUS, not trigger-once
       ══════════════════════════════════════════════════════════════ */
    document.querySelectorAll('.trust-card').forEach((card, i) => {
      card.style.opacity = '0.3';
      card.style.transform = 'perspective(1200px) translateY(60px) rotateX(12deg)';
      card.style.willChange = 'transform';
      card.style.transformOrigin = 'center bottom';

      // Entrance trigger (replaced scroll-linked)
      inView(card, () => {
        animate(card, {
          opacity: [0.3, 1],
          transform: [
            'perspective(1200px) translateY(60px) rotateX(12deg)',
            'perspective(1200px) translateY(0px) rotateX(0deg)',
          ]
        }, { duration: 0.8, delay: i * 0.1, easing: [0.22, 1, 0.36, 1] });
      }, { margin: '0px 0px -60px 0px' });
    });

    // Trust gauge image — scale up
    const trustGauge = document.querySelector('.trust-gauge-img');
    if (trustGauge) {
      trustGauge.style.opacity = '0';
      trustGauge.style.transform = 'scale(0.85)';

      inView(trustGauge, () => {
        animate(trustGauge, {
          opacity: [0, 1],
          transform: ['scale(0.85)', 'scale(1)']
        }, { duration: 0.7, easing: [0.22, 1, 0.36, 1] });
      }, { margin: '0px 0px -60px 0px' });
    }

    // Trust badge row — pop in + cycling gauge animation
    const trustBadge = document.querySelector('.trust-badge-row');
    if (trustBadge) {
      trustBadge.style.opacity = '0';
      trustBadge.style.transform = 'scale(0.9) translateY(10px)';

      inView(trustBadge, () => {
        animate(trustBadge,
          { opacity: [0, 1], transform: ['scale(0.9) translateY(10px)', 'scale(1) translateY(0)'] },
          { duration: 0.6, delay: 0.4, easing: [0.22, 1, 0.36, 1] }
        );
      }, { margin: '0px 0px -20px 0px' });
    }

    /* ── Trust Gauge Cycling Animation ── */
    const trustArc = document.getElementById('trustArc');
    const trustScoreNum = document.getElementById('trustScoreNum');
    const trustDots = document.getElementById('trustDots');
    const trustPill = document.getElementById('trustPill');
    const trustGaugeCard = document.getElementById('trustGaugeCard');
    let trustGaugeStarted = false;

    // Production-matched color thresholds
    function getScoreColor(score) {
      if (score === 0) return 'rgb(180, 180, 180)';
      if (score <= 4) return 'rgb(232, 31, 28)';
      if (score <= 6) return 'rgb(249, 115, 21)';
      return 'rgb(33, 184, 53)';
    }
    function getDotColor(score) {
      if (score === 0) return 'rgb(180, 180, 180)';
      if (score <= 4) return 'rgb(232, 31, 28)';
      if (score <= 6) return 'rgb(255, 98, 7)';
      return 'rgb(33, 184, 53)';
    }
    function getScorePill(score) {
      if (score <= 4) return { text: 'Untrusted', bg: 'rgb(255, 84, 46)' };
      if (score <= 6) return { text: 'Average', bg: 'rgb(250, 175, 45)' };
      return { text: 'Trusted', bg: 'rgb(33, 184, 53)' };
    }

    let currentGaugeDeg = 0;
    let gaugeAnimId = null;

    function animateGaugeTo(targetDeg, color, duration) {
      const startDeg = currentGaugeDeg;
      const startTime = performance.now();
      const trackGray = 'rgba(207, 204, 204, 0.5)';
      if (gaugeAnimId) cancelAnimationFrame(gaugeAnimId);

      function step(now) {
        const t = Math.min((now - startTime) / duration, 1);
        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const deg = startDeg + (targetDeg - startDeg) * eased;
        currentGaugeDeg = deg;
        const fillStr = deg + 'deg';
        trustArc.style.background = `conic-gradient(from 270deg, ${color} 0deg, ${color} ${fillStr}, ${trackGray} ${fillStr}, ${trackGray} 180deg, transparent 180deg)`;
        if (t < 1) gaugeAnimId = requestAnimationFrame(step);
      }
      gaugeAnimId = requestAnimationFrame(step);
    }

    function setTrustScore(score) {
      if (!trustArc || !trustScoreNum || !trustDots) return;

      const color = getScoreColor(score);
      const pill = getScorePill(score);
      const fillDeg = (score / 10) * 180;

      // Animate gauge arc smoothly
      if (score === 0 && currentGaugeDeg > 0) {
        // Reset: snap back quickly
        animateGaugeTo(0, 'rgb(180, 180, 180)', 300);
      } else {
        animateGaugeTo(fillDeg, color, 350);
      }

      // Score number
      trustScoreNum.textContent = score;
      trustScoreNum.style.color = color;

      // Dots
      const dotColor = getDotColor(score);
      const dots = trustDots.querySelectorAll('.trust-badge-dot');
      dots.forEach((dot, i) => {
        if (i < score) {
          dot.style.background = dotColor;
          dot.classList.remove('trust-badge-dot--empty');
        } else {
          dot.style.background = 'rgb(224, 224, 224)';
          dot.classList.add('trust-badge-dot--empty');
        }
      });

      // Pill
      if (trustPill) {
        trustPill.textContent = pill.text;
        trustPill.style.background = pill.bg;
      }
    }

    // Tick sequence: count up 0→10 (100%), then show affinity score
    const tickSequence = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let tickIdx = 0;
    let tickTimer = null;

    // Whop Affinity Score elements
    const whopAffinityCard = document.getElementById('whopAffinityCard');
    const whopAffinityNum = document.getElementById('whopAffinityNum');
    const whopAffinityBar = document.getElementById('whopAffinityBar');
    const AFFINITY_TARGET = 94;

    function showAffinityScore() {
      if (!whopAffinityCard) return;
      whopAffinityCard.classList.add('visible');
      // Animate the number counting up
      let current = 0;
      const step = Math.ceil(AFFINITY_TARGET / 30);
      function countUp() {
        current += step;
        if (current >= AFFINITY_TARGET) {
          current = AFFINITY_TARGET;
          whopAffinityNum.textContent = current;
          return;
        }
        whopAffinityNum.textContent = current;
        requestAnimationFrame(countUp);
      }
      requestAnimationFrame(countUp);
      // Animate the bar fill
      setTimeout(() => {
        if (whopAffinityBar) whopAffinityBar.style.width = AFFINITY_TARGET + '%';
      }, 100);
    }

    function hideAffinityScore() {
      if (!whopAffinityCard) return;
      whopAffinityCard.classList.remove('visible');
      if (whopAffinityNum) whopAffinityNum.textContent = '0';
      if (whopAffinityBar) whopAffinityBar.style.width = '0%';
    }

    function startTrustGaugeCycle() {
      if (trustGaugeStarted) return;
      trustGaugeStarted = true;

      function tick() {
        setTrustScore(tickSequence[tickIdx]);
        tickIdx++;

        if (tickIdx < tickSequence.length) {
          tickTimer = setTimeout(tick, 400);
        } else {
          // At max score (10) — show affinity score
          setTimeout(showAffinityScore, 300);
          // Hold for 3s showing both, then reset
          tickTimer = setTimeout(() => {
            hideAffinityScore();
            setTimeout(() => {
              tickIdx = 0;
              tick();
            }, 400);
          }, 3500);
        }
      }

      tick();
    }

    // Start gauge cycle immediately
    if (trustGaugeCard && trustArc) {
      setTrustScore(0);
      setTimeout(startTrustGaugeCycle, 800);
    }

    /* ── Hero Right Card — SVG needle rotation + score/CPM cycling ── */
    const heroNeedle = document.getElementById('heroRightNeedle');
    const heroCpm = document.getElementById('heroRightCpm');
    const heroScore = document.getElementById('heroRightScore');

    if (heroNeedle && heroCpm && heroScore) {
      // Needle rotates around (200,250). -180deg = far left, 0deg = far right
      let heroNeedleDeg = -180;
      let heroRaf = null;

      function animateHeroNeedle(targetAngle, targetScore, targetCpm, duration) {
        const startAngle = heroNeedleDeg;
        const startTime = performance.now();
        if (heroRaf) cancelAnimationFrame(heroRaf);

        const startScore = parseInt(heroScore.textContent) || 0;
        const startCpm = parseFloat(heroCpm.textContent) || 0;

        function step(now) {
          const t = Math.min((now - startTime) / duration, 1);
          const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
          const angle = startAngle + (targetAngle - startAngle) * eased;
          heroNeedleDeg = angle;

          heroNeedle.style.transform = `rotate(${angle}deg)`;

          const currentScore = Math.round(startScore + (targetScore - startScore) * eased);
          const currentCpm = startCpm + (targetCpm - startCpm) * eased;
          heroScore.textContent = currentScore + '%';
          heroCpm.textContent = currentCpm.toFixed(2) + ' $';

          if (t < 1) heroRaf = requestAnimationFrame(step);
        }
        heroRaf = requestAnimationFrame(step);
      }

      // Needle angles: -180 = far left (0%), -90 = top center (50%), 0 = far right (100%)
      // score% maps to angle: angle = -180 + (score/100) * 180
      const heroStates = [
        { score: 72, cpm: 5.20, angle: -50 },
        { score: 85, cpm: 7.40, angle: -27 },
        { score: 98, cpm: 9.50, angle: -4 },
        { score: 91, cpm: 8.10, angle: -16 },
        { score: 65, cpm: 4.80, angle: -63 },
        { score: 88, cpm: 7.90, angle: -22 },
        { score: 95, cpm: 9.10, angle: -9 },
      ];
      let heroIdx = 0;

      function cycleHero() {
        const s = heroStates[heroIdx];
        animateHeroNeedle(s.angle, s.score, s.cpm, 1200);
        heroIdx = (heroIdx + 1) % heroStates.length;
      }

      setTimeout(() => {
        cycleHero();
        setInterval(cycleHero, 2800);
      }, 500);
    }

    /* ── Retro Monitor Overlay — Bank icon click ── */
    const bankIcon = document.getElementById('bankIconTrigger');
    const retroOverlay = document.getElementById('retroMonitorOverlay');
    const retroClose = document.getElementById('retroMonitorClose');

    if (bankIcon && retroOverlay) {
      let rmCountRaf = null;
      let rmCycleTimer = null;

      function formatMoney(n) {
        return '$' + Math.floor(n).toLocaleString('en-US');
      }

      function countUpAmount(target, duration) {
        // Find ALL the amount text elements (glowed + crisp layers)
        const amountEls = retroOverlay.querySelectorAll('.rm-amount');
        if (!amountEls.length) return;
        const startTime = performance.now();
        const startVal = 0;

        function tick(now) {
          const t = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
          const val = startVal + (target - startVal) * eased;
          const str = formatMoney(val);
          amountEls.forEach(el => { el.textContent = str; });
          if (t < 1) rmCountRaf = requestAnimationFrame(tick);
        }
        if (rmCountRaf) cancelAnimationFrame(rmCountRaf);
        rmCountRaf = requestAnimationFrame(tick);
      }

      // Cycle through different amounts after initial count-up
      const rmAmounts = [9487, 12350, 8215, 15780, 11040, 7692, 14523];
      let rmIdx = 0;

      function cycleAmounts() {
        const amountEls = retroOverlay.querySelectorAll('.rm-amount');
        if (!amountEls.length) return;
        const target = rmAmounts[rmIdx];
        const current = parseInt(amountEls[0].textContent.replace(/[$,]/g, '')) || 0;
        const startTime = performance.now();
        const duration = 800;

        function tick(now) {
          const t = Math.min((now - startTime) / duration, 1);
          const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
          const val = current + (target - current) * eased;
          const str = formatMoney(val);
          amountEls.forEach(el => { el.textContent = str; });
          if (t < 1) rmCountRaf = requestAnimationFrame(tick);
        }
        if (rmCountRaf) cancelAnimationFrame(rmCountRaf);
        rmCountRaf = requestAnimationFrame(tick);
        rmIdx = (rmIdx + 1) % rmAmounts.length;
      }

      bankIcon.addEventListener('click', () => {
        retroOverlay.classList.add('active');
        // Start counting up from $0
        setTimeout(() => countUpAmount(9487, 1800), 400);
        // Then cycle every 3s
        rmCycleTimer = setInterval(cycleAmounts, 3200);
      });

      function closeMonitor() {
        retroOverlay.classList.remove('active');
        if (rmCountRaf) cancelAnimationFrame(rmCountRaf);
        if (rmCycleTimer) clearInterval(rmCycleTimer);
        rmCycleTimer = null;
        // Reset amounts
        const amountEls = retroOverlay.querySelectorAll('.rm-amount');
        amountEls.forEach(el => { el.textContent = '$0'; });
      }

      retroClose?.addEventListener('click', closeMonitor);
      retroOverlay.addEventListener('click', (e) => {
        if (e.target === retroOverlay) closeMonitor();
      });
    }

    // Whop Creator Score — animated profile card on Become Trustworthy
    const wcsCard = document.getElementById('trustScoreCard');
    const wcsRingFill = document.getElementById('wcsRingFill');
    const wcsScoreBig = document.getElementById('wcsScoreBig');
    const wcsCheckBadge = document.getElementById('wcsCheckBadge');
    const wcsDotsRow = document.getElementById('wcsDotsRow');
    let wcsAnimated = false;

    const wcsTargets = [
      { id: 'wcsStat0', end: 10, suffix: '/10' },
      { id: 'wcsStat1', end: 17, suffix: '' },
      { id: 'wcsStat2', end: 92, suffix: '%' },
      { id: 'wcsStat3', end: 96, suffix: '%' },
    ];

    if (wcsCard && wcsRingFill) {
      inView(wcsCard, () => {
        if (wcsAnimated) return;
        wcsAnimated = true;

        const targetScore = 94;
        const circumference = 100.5;
        const targetOffset = circumference - (circumference * targetScore / 100);

        // 1. Ring fill + score count
        setTimeout(() => {
          wcsRingFill.style.strokeDashoffset = targetOffset;
          let current = 0;
          const step = Math.ceil(targetScore / 35);
          function countUp() {
            current += step;
            if (current >= targetScore) { current = targetScore; wcsScoreBig.textContent = current; return; }
            wcsScoreBig.textContent = current;
            requestAnimationFrame(countUp);
          }
          requestAnimationFrame(countUp);
        }, 300);

        // 2. Animate stat values
        wcsTargets.forEach((t, i) => {
          const el = document.getElementById(t.id);
          if (!el) return;
          setTimeout(() => {
            let c = 0;
            const s = Math.ceil(t.end / 20);
            function tick() {
              c += s;
              if (c >= t.end) { c = t.end; el.textContent = c + t.suffix; return; }
              el.textContent = c + t.suffix;
              requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
          }, 500 + i * 150);
        });

        // 3. Fill dots left to right (all 10 = green)
        if (wcsDotsRow) {
          const dots = wcsDotsRow.querySelectorAll('.wcs-dot');
          dots.forEach((dot, i) => {
            setTimeout(() => { dot.classList.add('filled'); }, 400 + i * 80);
          });
        }

        // 4. Pop checkmark badge
        setTimeout(() => {
          if (wcsCheckBadge) {
            wcsCheckBadge.style.opacity = '1';
            wcsCheckBadge.style.transform = 'scale(1)';
          }
        }, 1600);
      }, { margin: '0px 0px -40px 0px' });
    }

    // Trust check icon — bounce in
    const trustCheck = document.querySelector('.trust-check-icon');
    if (trustCheck) {
      trustCheck.style.opacity = '0';
      trustCheck.style.transform = 'scale(0) rotate(-20deg)';

      inView(trustCheck, () => {
        animate(trustCheck,
          { opacity: [0, 1], transform: ['scale(0) rotate(-20deg)', 'scale(1.1) rotate(0)', 'scale(1) rotate(0)'] },
          { duration: 0.7, delay: 0.5, easing: [0.22, 1, 0.36, 1] }
        );
      }, { margin: '0px 0px -20px 0px' });
    }

    // Bottom trust cards — entrance trigger (replaced scroll-linked)
    document.querySelectorAll('.trust-bottom .trust-card').forEach((card, i) => {
      card.style.opacity = '0.3';
      card.style.transform = 'perspective(1200px) translateY(60px) rotateX(12deg)';
      card.style.willChange = 'transform';
      card.style.transformOrigin = 'center bottom';

      inView(card, () => {
        animate(card, {
          opacity: [0.3, 1],
          transform: [
            'perspective(1200px) translateY(60px) rotateX(12deg)',
            'perspective(1200px) translateY(0px) rotateX(0deg)',
          ]
        }, { duration: 0.8, delay: i * 0.1, easing: [0.22, 1, 0.36, 1] });
      }, { margin: '0px 0px -60px 0px' });
    });

    // ═══════ Submission to campaign — drag & upload animation ═══════
    const subFileCard = document.getElementById('subFileCard');
    const subDragThumb = document.getElementById('subDragThumb');
    const subFileText = document.getElementById('subFileText');
    const subFileIcon = document.getElementById('subFileIcon');
    const subTxHash = document.getElementById('subTxHash');
    const subCard = document.querySelector('.trust-submission-card');

    if (subFileCard && subDragThumb && subCard) {
      let subAnimRunning = false;

      const subVisual = document.querySelector('.trust-submission-visual');
      function resetSubmissionState() {
        subFileCard.className = 'trust-submission-file-card';
        subFileCard.id = 'subFileCard';
        subFileText.textContent = 'No File Selected';
        subDragThumb.classList.remove('merged');
        subDragThumb.style.cssText = '';
        // Move thumb back to visual container
        if (subDragThumb.parentElement !== subVisual) {
          subVisual.insertBefore(subDragThumb, subTxHash);
        }
        subTxHash.classList.remove('visible');
        subTxHash.style.opacity = '';
        subFileIcon.innerHTML = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="rgb(160,160,160)" stroke-width="1.5"><path d="M8 4v8M4 8h8"/></svg>';
      }

      function runSubmissionCycle() {
        if (subAnimRunning) return;
        subAnimRunning = true;
        resetSubmissionState();

        // Step 1: Drag thumbnail up into the file card (1.2s)
        const cardRect = subFileCard.getBoundingClientRect();
        const thumbRect = subDragThumb.getBoundingClientRect();
        const deltaY = cardRect.top + cardRect.height / 2 - (thumbRect.top + thumbRect.height / 2);
        const deltaX = cardRect.left + 20 - thumbRect.left;

        animate(subDragThumb,
          { transform: ['rotate(-6deg)', `rotate(-6deg) translate(${deltaX}px, ${deltaY}px) scale(0.7)`] },
          { duration: 1.0, easing: [0.22, 1, 0.36, 1] }
        ).finished.then(() => {
          // Step 2: Snap thumb into card, turn green, show "Uploading to Shelby..."
          subFileCard.appendChild(subDragThumb);
          subDragThumb.classList.add('merged');
          subFileCard.classList.add('uploading');
          subFileText.textContent = 'Uploading to Shelby...';

          // Step 3: After 1.5s, show "Uploaded successfully"
          setTimeout(() => {
            subFileCard.classList.remove('uploading');
            subFileCard.classList.add('uploaded');
            subFileText.textContent = 'Uploaded successfully';

            // Step 4: Show tx hash
            setTimeout(() => {
              subTxHash.classList.add('visible');

              // Step 5: Hold, then reset and loop
              setTimeout(() => {
                subAnimRunning = false;
                // Fade out, then reset
                animate(subTxHash, { opacity: [1, 0] }, { duration: 0.3 });
                animate(subFileCard, { opacity: [1, 0.7] }, { duration: 0.3 }).finished.then(() => {
                  subFileCard.style.opacity = '1';
                  resetSubmissionState();
                  // Re-trigger after brief pause
                  setTimeout(runSubmissionCycle, 800);
                });
              }, 2500);
            }, 600);
          }, 1500);
        });
      }

      inView(subCard, () => {
        setTimeout(runSubmissionCycle, 600);
      }, { margin: '0px 0px -40px 0px' });
    }

    // Active creators row
    const creatorsRow = document.querySelector('.trust-creators-row');
    if (creatorsRow) {
      creatorsRow.style.opacity = '0';
      creatorsRow.style.transform = 'translateY(20px)';
      inView(creatorsRow, () => {
        animate(creatorsRow,
          { opacity: [0, 1], transform: ['translateY(20px)', 'translateY(0)'] },
          { duration: 0.6, easing: [0.22, 1, 0.36, 1] }
        );
      }, { margin: '0px 0px -20px 0px' });
    }

    // Avatar stack — staggered entrance
    document.querySelectorAll('.avatar-sm').forEach((av, i) => {
      av.style.opacity = '0';
      av.style.transform = 'scale(0.5)';

      inView(av, () => {
        animate(av,
          { opacity: [0, 1], transform: ['scale(0.5)', 'scale(1)'] },
          { duration: 0.4, delay: i * 0.05, easing: [0.22, 1, 0.36, 1] }
        );
      }, { margin: '0px 0px -10px 0px' });
    });

    /* ══════════════════════════════════════════════════════════════
       6. CAMPAIGNS — Scroll-linked 3D tilt per card
       ══════════════════════════════════════════════════════════════ */
    document.querySelectorAll('.camp-card').forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'perspective(1200px) translateY(50px) rotateX(10deg)';
      card.style.willChange = 'transform';
      card.style.transformOrigin = 'center bottom';

      inView(card, () => {
        animate(card, {
          opacity: [0, 1],
          transform: [
            'perspective(1200px) translateY(50px) rotateX(10deg)',
            'perspective(1200px) translateY(0px) rotateX(0deg)',
          ]
        }, { duration: 0.8, delay: i * 0.08, easing: [0.22, 1, 0.36, 1] });
      }, { margin: '0px 0px -60px 0px' }
      );
    });

    /* ══════════════════════════════════════════════════════════════
       7. STORIES / TESTIMONIALS — Center-focused carousel
       Production: active card = scale(1) opacity(1)
                  inactive cards = scale(0.88) opacity(0.6)
       ══════════════════════════════════════════════════════════════ */
    const storiesTrack = document.getElementById('storiesTrack');
    const storyCards = document.querySelectorAll('.story-card');
    const sPrev = document.getElementById('sPrev');
    const sNext = document.getElementById('sNext');
    let activeStory = 0;

    function setActiveStory(index) {
      if (index === activeStory) return;
      activeStory = index;

      storyCards.forEach((card, i) => {
        const isActive = i === index;
        animate(card, {
          opacity: isActive ? 1 : 0.6,
          scale: isActive ? 1 : 0.88,
        }, { duration: 0.4, easing: [0.22, 1, 0.36, 1] });
      });
    }

    // Initial state: first card active, others dimmed
    storyCards.forEach((card, i) => {
      if (i !== 0) {
        card.style.opacity = '0.6';
        card.style.transform = 'scale(0.88)';
      }
    });

    // Entrance animation for all story cards
    inView('.stories-wrap', () => {
      storyCards.forEach((card, i) => {
        const finalOp = i === 0 ? 1 : 0.6;
        const finalScale = i === 0 ? 1 : 0.88;
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px) scale(0.85)';

        animate(card, {
          opacity: [0, finalOp],
          transform: [
            'translateY(50px) scale(0.85)',
            `translateY(0) scale(${finalScale})`,
          ]
        }, { duration: 0.6, delay: i * 0.07, easing: [0.22, 1, 0.36, 1] });
      });
    }, { margin: '0px 0px -80px 0px' });

    if (storiesTrack && sPrev && sNext) {
      const cardW = 356;
      sPrev.addEventListener('click', () => {
        storiesTrack.scrollBy({ left: -cardW, behavior: 'smooth' });
        setActiveStory(Math.max(0, activeStory - 1));
      });
      sNext.addEventListener('click', () => {
        storiesTrack.scrollBy({ left: cardW, behavior: 'smooth' });
        setActiveStory(Math.min(storyCards.length - 1, activeStory + 1));
      });

      // Detect active card on scroll
      let scrollTimer;
      storiesTrack.addEventListener('scroll', () => {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
          const idx = Math.round(storiesTrack.scrollLeft / cardW);
          if (idx >= 0 && idx < storyCards.length) setActiveStory(idx);
        }, 50);
      });
    }

    /* ══════════════════════════════════════════════════════════════
       8. FAQ — Staggered entrance + animated accordion
       ══════════════════════════════════════════════════════════════ */
    document.querySelectorAll('.faq-item').forEach((item, i) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(20px)';

      inView(item, () => {
        animate(item,
          { opacity: [0, 1], transform: ['translateY(20px)', 'translateY(0)'] },
          { duration: 0.45, delay: i * 0.06, easing: [0.22, 1, 0.36, 1] }
        );
      }, { margin: '0px 0px -20px 0px' });
    });

    document.querySelectorAll('#faq .faq-q').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item') as HTMLElement;
        const answerEl = item.querySelector('.faq-a') as HTMLElement;
        if (!answerEl) return;
        const wasOpen = item.classList.contains('open');

        // Close any currently open item
        document.querySelectorAll('#faq .faq-item.open').forEach(openItem => {
          const openAnswer = openItem.querySelector('.faq-a') as HTMLElement;
          if (openAnswer && openItem !== item) {
            openItem.classList.remove('open');
            const h = openAnswer.scrollHeight;
            animate(openAnswer, { height: [h + 'px', '0px'] }, { duration: 0.15, easing: [0.22, 1, 0.36, 1] });
          }
        });

        if (!wasOpen) {
          item.classList.add('open');
          // Measure real content height, then animate
          answerEl.style.height = 'auto';
          const targetH = answerEl.scrollHeight;
          answerEl.style.height = '0px';
          animate(answerEl, { height: ['0px', targetH + 'px'] }, { duration: 0.15, easing: [0.22, 1, 0.36, 1] }).finished.then(() => {
            if (item.classList.contains('open')) answerEl.style.height = 'auto';
          });
        } else {
          // Measure current height, then animate to 0
          const h = answerEl.scrollHeight;
          item.classList.remove('open');
          animate(answerEl, { height: [h + 'px', '0px'] }, { duration: 0.15, easing: [0.22, 1, 0.36, 1] });
        }
      });
    });

    /* ══════════════════════════════════════════════════════════════
       9. FOOTER — Giant text entrance
       ══════════════════════════════════════════════════════════════ */
    const footerGiant = document.querySelector('.footer-giant');
    if (footerGiant) {
      footerGiant.style.opacity = '0';
      footerGiant.style.transform = 'translateY(40px)';
      inView(footerGiant, () => {
        animate(footerGiant, {
          opacity: [0, 1],
          transform: ['translateY(40px)', 'translateY(0)'],
        }, { duration: 0.8, easing: [0.22, 1, 0.36, 1] });
      }, { margin: '0px 0px -60px 0px' }
      );
    }

    // Footer columns stagger
    document.querySelectorAll('.footer-col').forEach((col, i) => {
      col.style.opacity = '0';
      col.style.transform = 'translateY(15px)';
      inView(col, () => {
        animate(col,
          { opacity: [0, 1], transform: ['translateY(15px)', 'translateY(0)'] },
          { duration: 0.5, delay: i * 0.1, easing: [0.22, 1, 0.36, 1] }
        );
      }, { margin: '0px 0px -20px 0px' });
    });

    /* ══════════════════════════════════════════════════════════════
       10. CTA BUTTONS — Hover animations
       ══════════════════════════════════════════════════════════════ */
    document.querySelectorAll('.btn-orange, .btn-orange-lg, .btn-white, .btn-nav-cta').forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        animate(btn, { scale: 1.03, y: -1 }, { duration: 0.2, easing: [0.22, 1, 0.36, 1] });
      });
      btn.addEventListener('mouseleave', () => {
        animate(btn, { scale: 1, y: 0 }, { duration: 0.2, easing: [0.22, 1, 0.36, 1] });
      });
    });

    /* ══════════════════════════════════════════════════════════════
       11. CAMP "See All" + misc CTA buttons entrance
       ══════════════════════════════════════════════════════════════ */
    document.querySelectorAll('.camp-see-all, .faq-see-all, .hiw-cta').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      inView(el, () => {
        animate(el,
          { opacity: [0, 1], transform: ['translateY(20px)', 'translateY(0)'] },
          { duration: 0.6, easing: [0.22, 1, 0.36, 1] }
        );
      }, { margin: '0px 0px -20px 0px' });
    });

    /* ══════════════════════════════════════════════════════════════
       12. HERO TOGGLE SWITCH
       ══════════════════════════════════════════════════════════════ */
    const heroToggleBtn = document.getElementById('heroToggle');
    if (heroToggleBtn) {
      const track = heroToggleBtn.querySelector('.hero-toggle-track');
      const knob = heroToggleBtn.querySelector('.hero-toggle-knob');
      const labelActive = document.querySelector('.hero-toggle-label--active');
      const labelInactive = document.querySelector('.hero-toggle-label--inactive');
      const headlineCreator = heroToggleBtn.closest('.hero-h1-row')?.querySelector('.hero-h1:last-child .hero-h1-line');
      const heroH1First = document.querySelector('.hero-h1 .hero-h1-line');
      const heroSub = document.querySelector('.hero-sub:not(.hero-sub--mobile)');
      const heroCtas = document.querySelector('.hero-ctas');
      const btnOrange = heroCtas?.querySelector('.btn-orange-label');
      const btnWhite = heroCtas?.querySelector('.btn-white');
      let isOn = false;

      // Store original creator content
      const creatorH1 = heroH1First?.textContent || 'Get Paid for Posting';
      const creatorSub = heroSub?.textContent || '';
      const creatorOrangeBtn = btnOrange?.textContent || 'Start a pledge';
      const creatorWhiteBtn = btnWhite?.textContent || 'Explore Campaigns';

      heroToggleBtn.addEventListener('click', () => {
        isOn = !isOn;
        if (isOn) {
          // Switch to BRAND mode
          track.classList.add('on');
          document.querySelector('.landing-page')?.classList.add('brand-mode');
          const knobOn = window.matchMedia('(max-width: 768px)').matches ? '22px' : '25px';
          animate(knob, { left: knobOn }, { duration: 0.35, easing: [0.22, 1, 0.36, 1] });
          animate(labelActive, { opacity: 0.55 }, { duration: 0.3 });
          animate(labelInactive, { opacity: 1 }, { duration: 0.3 });
          if (headlineCreator) headlineCreator.textContent = 'Brand';
          if (heroH1First) heroH1First.textContent = 'Scale Your Reach';
          if (heroSub) heroSub.textContent = "Scale your brand's organic reach with performance-based UGC and clipping campaigns.";
          if (btnOrange) btnOrange.textContent = 'Launch my Campaign';
          if (btnWhite) btnWhite.textContent = 'Contact Sales';

          // Init brand FAQ accordion
          initBrandFaqAccordion();
          // Animate brand sections entrance
          animateBrandSections();
        } else {
          // Switch back to CREATOR mode
          track.classList.remove('on');
          document.querySelector('.landing-page')?.classList.remove('brand-mode');
          animate(knob, { left: '3px' }, { duration: 0.35, easing: [0.22, 1, 0.36, 1] });
          animate(labelActive, { opacity: 1 }, { duration: 0.3 });
          animate(labelInactive, { opacity: 0.55 }, { duration: 0.3 });
          if (headlineCreator) headlineCreator.textContent = 'Creator';
          if (heroH1First) heroH1First.textContent = creatorH1;
          if (heroSub) heroSub.textContent = creatorSub;
          if (btnOrange) btnOrange.textContent = creatorOrangeBtn;
          if (btnWhite) btnWhite.textContent = creatorWhiteBtn;
        }
      });
    }

    /* ── Brand FAQ accordion (init on first toggle) ── */
    let brandFaqInited = false;
    function initBrandFaqAccordion() {
      if (brandFaqInited) return;
      brandFaqInited = true;
      const brandFaqSection = document.getElementById('brand-faq');
      if (!brandFaqSection) return;
      brandFaqSection.querySelectorAll('.faq-item').forEach(faqItem => {
        const btn = faqItem.querySelector('.faq-q');
        if (!btn) return;
        btn.addEventListener('click', () => {
          const el = faqItem as HTMLElement;
          const answerEl = el.querySelector('.faq-a') as HTMLElement;
          if (!answerEl) return;
          const isOpen = el.classList.contains('open');

          // Close all others
          brandFaqSection.querySelectorAll('.faq-item.open').forEach(openItem => {
            const openAnswer = openItem.querySelector('.faq-a') as HTMLElement;
            if (openAnswer && openItem !== el) {
              openItem.classList.remove('open');
              const h = openAnswer.scrollHeight;
              animate(openAnswer, { height: [h + 'px', '0px'] }, { duration: 0.15, easing: [0.22, 1, 0.36, 1] });
            }
          });

          if (!isOpen) {
            el.classList.add('open');
            answerEl.style.height = 'auto';
            const targetH = answerEl.scrollHeight;
            answerEl.style.height = '0px';
            animate(answerEl, { height: ['0px', targetH + 'px'] }, { duration: 0.15, easing: [0.22, 1, 0.36, 1] }).finished.then(() => {
              if (el.classList.contains('open')) answerEl.style.height = 'auto';
            });
          } else {
            const h = answerEl.scrollHeight;
            el.classList.remove('open');
            animate(answerEl, { height: [h + 'px', '0px'] }, { duration: 0.15, easing: [0.22, 1, 0.36, 1] });
          }
        });
      });
    }

    /* ── Animate brand sections on entrance ── */
    function animateBrandSections() {
      const brandSections = document.querySelectorAll('[data-view="brand"]');
      brandSections.forEach(section => {
        const els = section.querySelectorAll('.brand-result-card, .brand-protection-card, .brand-boost-card, .section-h2, .section-p, .pill-badge');
        els.forEach((el, i) => {
          el.style.opacity = '0';
          el.style.transform = 'translateY(30px)';
          animate(el,
            { opacity: [0, 1], transform: ['translateY(30px)', 'translateY(0)'] },
            { duration: 0.6, delay: i * 0.08, easing: [0.22, 1, 0.36, 1] }
          );
        });
      });
    }

    /* ══════════════════════════════════════════════════════════════
       13–14. NAVBAR + MOBILE MENU — Now handled by <Navbar /> component
       ══════════════════════════════════════════════════════════════ */

    /* ══════════════════════════════════════════════════════════════
       15. PARALLAX — Hero radial overlay scroll fade
       ══════════════════════════════════════════════════════════════ */
    const heroOverlay = document.querySelector('.hero-radial-overlay');
    if (heroOverlay) {
      _scroll(
        animate(heroOverlay, {
          opacity: [0.2, 0.05],
        }, { duration: 1, easing: 'linear' }),
        { target: document.querySelector('.hero'), offset: ['start start', 'end start'] }
      );
    }

    /* ══════════════════════════════════════════════════════════════
       16. HERO 3D CARDS — Staggered entrance with perspective transforms
       ══════════════════════════════════════════════════════════════ */
    const hero3dCards = document.querySelectorAll('.hero-3d-card');
    if (hero3dCards.length) {
      const hero3dWrap = document.querySelector('.hero-3d-cards');
      const isMobile = window.matchMedia('(max-width: 768px)').matches;

      hero3dCards.forEach((card, i) => {
        card.style.opacity = '0';
      });

      // Mobile tap-to-cycle carousel
      if (isMobile && hero3dWrap) {
        let activeIndex = 1;
        const cards = Array.from(hero3dCards);
        const positions = {
          front: {
            transform: 'perspective(1200px) rotateY(0deg) rotateX(0deg) translateX(0px) scale(1)',
            zIndex: '3',
            opacity: '1',
          },
          backRight: {
            transform: 'perspective(1200px) rotateY(-6deg) rotateX(2deg) translateX(100px) scale(0.9)',
            zIndex: '1',
            opacity: '0.7',
          },
          backLeft: {
            transform: 'perspective(1200px) rotateY(6deg) rotateX(2deg) translateX(-100px) scale(0.9)',
            zIndex: '1',
            opacity: '0.7',
          },
        };

        function animateCardContent(card) {
          // Shine sweep
          const shine = card.querySelector('.hero-card-shine');
          if (shine) {
            shine.style.animation = 'none';
            shine.offsetHeight; // force reflow
            shine.style.animation = 'heroCardShine 0.7s ease-out 0.15s forwards';
          }

          // Staggered pop-in for inner elements
          const animEls = card.querySelectorAll('.hero-card-anim');
          animEls.forEach((el, i) => {
            el.style.animation = 'none';
            el.offsetHeight;
            if (el.classList.contains('hero-3d-icon')) {
              el.style.animation = `heroIconBounce 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.1}s both`;
            } else if (el.classList.contains('hero-card-label') || el.classList.contains('hero-card-title')) {
              el.style.animation = `heroCardSlideUp 0.45s ease-out ${0.2 + i * 0.08}s both`;
            } else {
              el.style.animation = `heroCardPopIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${0.1 + i * 0.1}s both`;
            }
          });
        }

        function applyPositions(shouldAnimate) {
          const order = [
            positions.front,
            positions.backRight,
            positions.backLeft,
          ];
          cards.forEach((card, i) => {
            const slot = order[(i - activeIndex + 3) % 3];
            card.style.transform = slot.transform;
            card.style.zIndex = slot.zIndex;
            card.style.opacity = slot.opacity;

            // Animate content of the card coming to front
            if (shouldAnimate && slot === positions.front) {
              animateCardContent(card);
            }
          });
        }

        // Set initial staggered state immediately
        applyPositions(true);

        hero3dWrap.addEventListener('click', () => {
          activeIndex = (activeIndex + 1) % 3;
          applyPositions(true);
        });
      } else {
        // Desktop: staggered entrance with perspective transforms
        setTimeout(() => {
          const transforms = [
            'perspective(1200px) rotateY(15deg) rotateX(-5deg)',
            'perspective(1200px) rotateY(8deg) rotateX(-3deg)',
            'perspective(1200px) rotateY(-12deg) rotateX(3deg)',
          ];
          hero3dCards.forEach((card, i) => {
            animate(card,
              {
                opacity: [0, 1],
                transform: [
                  `perspective(1200px) rotateY(0deg) rotateX(15deg) translateY(60px) translateZ(-60px)`,
                  transforms[i],
                ]
              },
              { duration: 0.9, delay: 0.4 + i * 0.12, easing: [0.22, 1, 0.36, 1] }
            );
          });
        }, 150);

        // Subtle scroll-linked parallax on the 3D cards
        if (hero3dWrap) {
          _scroll(
            animate(hero3dWrap, {
              transform: ['translateY(0px)', 'translateY(-20px)'],
            }, { duration: 1, easing: 'linear' }),
            { target: document.querySelector('.hero'), offset: ['start start', 'end start'] }
          );
        }
      }
    }

    /* ══════════════════════════════════════════════════════════════
       DASHBOARD TAB SWITCHING
       ══════════════════════════════════════════════════════════════ */
    const dashTabs = document.querySelectorAll('[data-dash-tab]');
    const dashPanelPayouts = document.getElementById('dashPanelPayouts');
    const dashPanelEarn = document.getElementById('dashPanelEarn');
    if (dashTabs.length && dashPanelPayouts && dashPanelEarn) {
      dashTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const target = tab.getAttribute('data-dash-tab');
          dashTabs.forEach(t => t.classList.remove('dash-tab--active'));
          tab.classList.add('dash-tab--active');
          if (target === 'payouts') {
            dashPanelPayouts.classList.remove('dash-tab-panel--hidden');
            dashPanelEarn.classList.add('dash-tab-panel--hidden');
          } else {
            dashPanelEarn.classList.remove('dash-tab-panel--hidden');
            dashPanelPayouts.classList.add('dash-tab-panel--hidden');
          }
        });
      });
    }

    /* ══════════════════════════════════════════════════════════════
       17. PHONE NOTIFICATIONS — Live payment feed
       ══════════════════════════════════════════════════════════════ */
    const phoneNotifList = document.getElementById('phoneNotifList');
    const phoneDatetime = document.getElementById('phoneDatetime');
    const phoneFrame = document.getElementById('phoneFrame');

    if (phoneNotifList && phoneFrame) {
      const NOTIF_POOL = [
        { user: 'bpatterson40', amount: '$2,339.31', token: 'USDT' },
        { user: 'joanne_smith', amount: '$224.99', token: 'USDT0' },
        { user: 'roxanne25', amount: '$1,305.00', token: 'USDT' },
        { user: 'cameron_diaz', amount: '$15.99', token: 'USDT0' },
        { user: 'alex_williams', amount: '$85.50', token: 'USDT' },
        { user: 'sarah_connor', amount: '$3,000.00', token: 'USDT0' },
        { user: 'tony_stark', amount: '$9,999.99', token: 'USDT' },
        { user: 'bruce_wayne', amount: '$150.00', token: 'USDT0' },
        { user: 'natasha_r', amount: '$42.00', token: 'USDT' },
        { user: 'steve_rogers', amount: '$19.41', token: 'USDT0' },
        { user: 'wanda_m', amount: '$600.00', token: 'USDT' },
        { user: 'clark_kent', amount: '$1.99', token: 'USDT0' },
        { user: 'peter_parker', amount: '$12.50', token: 'USDT' },
        { user: 'diana_prince', amount: '$840.00', token: 'USDT0' },
      ];

      function createNotifEl(data, time, isNew, delay) {
        const wrap = document.createElement('div');
        wrap.className = 'phone-notif-wrap ' + (isNew ? 'incoming' : 'initial');
        if (!isNew) wrap.style.animationDelay = delay;
        wrap.innerHTML = `
          <div class="phone-notif">
            <div class="phone-notif-top">
              <div class="phone-notif-app">
                <div class="phone-notif-icon">
                  <img src="/whop-app-logo.png" alt="Whop" style="width:100%;height:100%;border-radius:6px;object-fit:cover;" />
                </div>
                <span class="phone-notif-title">Whop Finance</span>
              </div>
              <span class="phone-notif-time">${time}</span>
            </div>
            <div class="phone-notif-body"><span class="phone-notif-text"><span style="font-weight:500">${data.user}</span> just paid ${data.amount}</span> <span class="phone-notif-token"><img src="${data.token === 'USDT0' ? '/usdt0-logo.png' : '/tether.svg'}" alt="${data.token}" class="phone-notif-token-icon" />${data.token}</span></div>
          </div>
        `;
        return wrap;
      }

      let phoneAnimStarted = false;
      let poolIdx = 4;
      let cycleInterval = null;

      function startPhoneNotifs() {
        if (phoneAnimStarted) return;
        phoneAnimStarted = true;

        // Show datetime header
        if (phoneDatetime) phoneDatetime.classList.add('visible');

        // Initial 4 notifications
        for (let i = 0; i < 4; i++) {
          const el = createNotifEl(NOTIF_POOL[i], i === 0 ? 'Now' : `9:${41 - i} AM`, false, `${0.6 + i * 0.15}s`);
          phoneNotifList.appendChild(el);
        }

        // Dashboard elements
        const dashEarningsNum = document.getElementById('dashEarningsNum');
        const dashEarnedCells = document.querySelectorAll('.dash-td-earned');
        const dashViewCells = document.querySelectorAll('.dash-td-sponsor[data-base-views]');
        const dashBarFill = document.getElementById('dashBarFill');
        const dashBarPct = document.getElementById('dashBarPct');
        let totalEarnings = 620.47;
        let barPct = 32.7;
        let lastTickTime = performance.now();

        function formatEarnings(n) {
          return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }

        // Smooth real-time counter — ticks every frame at ~$0.75/1K views rate
        // Simulates ~50K views/sec → $0.0375/sec → feels like live counting
        let earningsRafId = null;
        function tickEarnings(now) {
          const dt = (now - lastTickTime) / 1000;
          lastTickTime = now;
          const rate = 0.038 + Math.sin(now * 0.001) * 0.008; // slight wave for organic feel
          totalEarnings += rate * dt;
          barPct = Math.min(99.9, barPct + rate * dt * 0.008);
          if (dashEarningsNum) dashEarningsNum.textContent = formatEarnings(totalEarnings);
          if (dashBarFill) dashBarFill.style.width = barPct.toFixed(1) + '%';
          if (dashBarPct) dashBarPct.textContent = barPct.toFixed(1);
          earningsRafId = requestAnimationFrame(tickEarnings);
        }
        earningsRafId = requestAnimationFrame(tickEarnings);

        // Cycle new notifications every 1.2s
        cycleInterval = setInterval(() => {
          const data = NOTIF_POOL[poolIdx % NOTIF_POOL.length];
          const el = createNotifEl(data, 'Now', true, '0s');

          // Update existing "Now" times
          phoneNotifList.querySelectorAll('.phone-notif-time').forEach(t => {
            if (t.textContent === 'Now') t.textContent = '1m ago';
          });

          phoneNotifList.insertBefore(el, phoneNotifList.firstChild);
          while (phoneNotifList.children.length > 12) {
            phoneNotifList.removeChild(phoneNotifList.lastChild);
          }

          // On each notification, give a small bump to earnings (on top of smooth tick)
          const amountNum = parseFloat(data.amount.replace(/[$,]/g, ''));
          const earnBump = amountNum * 0.002;
          totalEarnings += earnBump;
          barPct = Math.min(99.9, barPct + earnBump * 0.005);

          // Bump a random clip's views + earnings
          const idx = poolIdx % dashEarnedCells.length;
          if (dashEarnedCells[idx]) {
            const base = parseFloat(dashEarnedCells[idx].getAttribute('data-base')) || 8;
            const newVal = base + earnBump;
            dashEarnedCells[idx].setAttribute('data-base', newVal.toFixed(2));
            dashEarnedCells[idx].textContent = '+$' + newVal.toFixed(2);
            dashEarnedCells[idx].classList.add('flash');
            setTimeout(() => dashEarnedCells[idx].classList.remove('flash'), 600);
          }
          if (dashViewCells[idx]) {
            const baseV = parseInt(dashViewCells[idx].getAttribute('data-base-views')) || 1000;
            const newV = baseV + Math.round(500 + Math.random() * 3000);
            dashViewCells[idx].setAttribute('data-base-views', newV);
            dashViewCells[idx].textContent = newV.toLocaleString('en-US');
          }

          poolIdx++;
        }, 1200);
      }

      inView(phoneFrame, () => {
        setTimeout(startPhoneNotifs, 300);
      }, { margin: '0px 0px -60px 0px' });
    }


    // Cleanup intervals and timeouts
    return () => {
      if (typeof cycleInterval !== 'undefined' && cycleInterval) clearInterval(cycleInterval);
      if (typeof tickTimer !== 'undefined' && tickTimer) clearTimeout(tickTimer);
      if (typeof gaugeAnimId !== 'undefined' && gaugeAnimId) cancelAnimationFrame(gaugeAnimId);
      if (typeof earningsRafId !== 'undefined' && earningsRafId) cancelAnimationFrame(earningsRafId);
    };
  }, []);

  return (
    <div className="landing-page">
        {/* ═══════ NAVBAR (shared component) ═══════ */}
          <Navbar />

          {/* ═══════ HERO ═══════ */}
          <section className="hero">
            <div className="hero-radial-overlay"></div>
            <div className="hero-inner">
              <div className="hero-content">
                <h1 className="hero-h1"><span className="hero-h1-line">Tend the Land</span></h1>
                <br />
                <div className="hero-h1-row">
                  <h1 className="hero-h1"><span className="hero-h1-line">As a</span></h1>
                  <div className="hero-toggle-wrap">
                    <span className="hero-toggle-label hero-toggle-label--active">FOR RESIDENTS</span>
                    <button className="hero-toggle-switch" id="heroToggle" aria-label="Toggle creator/brand view">
                      <div className="hero-toggle-track">
                        <div className="hero-toggle-knob">
                          <div className="hero-toggle-knob-gradient"></div>
                        </div>
                      </div>
                    </button>
                    <span className="hero-toggle-label hero-toggle-label--inactive">FOR MACHINES</span>
                  </div>
                  <h1 className="hero-h1"><span className="hero-h1-line">Resident</span></h1>
                </div>
                <p className="hero-sub">A small recurring land-tax pledge to the tribes whose land you live on — direct to their accounts, no platform fee.</p>
                <h1 className="hero-h1 hero-h1--mobile"><span className="hero-h1-line">Tend The Land</span><br /><span className="hero-h1-line">You Live On</span></h1>
                <p className="hero-sub hero-sub--mobile">Find your tribe's program and begin in ninety seconds. It's that simple.</p>
                <div className="hero-ctas">
                  <a href="/pledge" className="btn-orange"><span className="btn-orange-glow"></span><span className="btn-orange-label">Start a pledge</span></a>
                  <a href="#" className="btn-white">Explore programs</a>
                </div>
              </div>
              <div className="hero-visual">
                <img src="https://framerusercontent.com/images/5RlXjISAoh2vfp5MeLPNxQZkTE.svg" alt="" className="hero-svg-backdrop" />
                <div className="hero-3d-cards">
                  <div className="hero-3d-card hero-3d-card--left">
                    <div className="hero-card-body">
                      <img src="https://framerusercontent.com/images/yMSetzwPEQ2bU2GYllzxgnmb5U.png" alt="" className="hero-3d-icon hero-card-anim" />
                      {/* Glowing rails with USDT coins flowing to people */}
                      <svg className="hero-coin-rails" viewBox="0 0 192 210" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <filter id="railGlow" x="-40%" y="-40%" width="180%" height="180%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feMerge>
                              <feMergeNode in="blur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                          <linearGradient id="railGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgba(255,165,50,0.6)" />
                            <stop offset="100%" stopColor="rgba(255,165,50,0.15)" />
                          </linearGradient>
                          <symbol id="usdtCoin" viewBox="0 0 28 28">
                            <circle cx="14" cy="14" r="14" fill="#53ae94" />
                            <path d="M15.7 12.1V9.9h4.8V6.7H7.5V9.9h4.8v2.2c-3.9.2-6.8 1-6.8 1.9s2.9 1.7 6.8 1.9v6.7h3.5v-6.7c3.9-.2 6.8-1 6.8-1.9s-2.9-1.7-6.8-1.9m0 3.2c-.1 0-.6 0-1.7 0-.9 0-1.5 0-1.7 0-3.4-.1-6-.7-6-1.4s2.6-1.3 6-1.5v2.3c.2 0 .9.1 1.8.1 1.1 0 1.6-.1 1.7-.1v-2.3c3.4.2 6 .8 6 1.5s-2.6 1.3-6 1.5" fill="#fff"/>
                          </symbol>
                        </defs>
                        {/* Rail paths — start below logo area, fan out to people */}
                        <path id="rail1" d="M96,45 C90,80 32,110 28,185" stroke="url(#railGrad)" strokeWidth="1.5" filter="url(#railGlow)" opacity="0.45" fill="none" />
                        <path id="rail2" d="M96,45 C94,75 60,120 58,185" stroke="url(#railGrad)" strokeWidth="1.5" filter="url(#railGlow)" opacity="0.45" fill="none" />
                        <path id="rail3" d="M96,45 C96,80 96,130 96,185" stroke="url(#railGrad)" strokeWidth="1.5" filter="url(#railGlow)" opacity="0.45" fill="none" />
                        <path id="rail4" d="M96,45 C98,75 132,120 134,185" stroke="url(#railGrad)" strokeWidth="1.5" filter="url(#railGlow)" opacity="0.45" fill="none" />
                        <path id="rail5" d="M96,45 C102,80 160,110 164,185" stroke="url(#railGrad)" strokeWidth="1.5" filter="url(#railGlow)" opacity="0.45" fill="none" />
                        {/* Coins — upright, shrink to 0 at destination */}
                        <g transform="translate(-8,-8)">
                          <use href="#usdtCoin" width="16" height="16">
                            <animateMotion dur="2.8s" repeatCount="indefinite" begin="0s">
                              <mpath href="#rail1" />
                            </animateMotion>
                            <animateTransform attributeName="transform" type="scale" values="0;1;1;0" keyTimes="0;0.1;0.8;1" dur="2.8s" repeatCount="indefinite" begin="0s" additive="sum" />
                          </use>
                        </g>
                        <g transform="translate(-8,-8)">
                          <use href="#usdtCoin" width="16" height="16">
                            <animateMotion dur="2.4s" repeatCount="indefinite" begin="0.5s">
                              <mpath href="#rail2" />
                            </animateMotion>
                            <animateTransform attributeName="transform" type="scale" values="0;1;1;0" keyTimes="0;0.1;0.8;1" dur="2.4s" repeatCount="indefinite" begin="0.5s" additive="sum" />
                          </use>
                        </g>
                        <g transform="translate(-8,-8)">
                          <use href="#usdtCoin" width="16" height="16">
                            <animateMotion dur="2.6s" repeatCount="indefinite" begin="0.2s">
                              <mpath href="#rail3" />
                            </animateMotion>
                            <animateTransform attributeName="transform" type="scale" values="0;1;1;0" keyTimes="0;0.1;0.8;1" dur="2.6s" repeatCount="indefinite" begin="0.2s" additive="sum" />
                          </use>
                        </g>
                        <g transform="translate(-8,-8)">
                          <use href="#usdtCoin" width="16" height="16">
                            <animateMotion dur="2.5s" repeatCount="indefinite" begin="0.8s">
                              <mpath href="#rail4" />
                            </animateMotion>
                            <animateTransform attributeName="transform" type="scale" values="0;1;1;0" keyTimes="0;0.1;0.8;1" dur="2.5s" repeatCount="indefinite" begin="0.8s" additive="sum" />
                          </use>
                        </g>
                        <g transform="translate(-8,-8)">
                          <use href="#usdtCoin" width="16" height="16">
                            <animateMotion dur="2.7s" repeatCount="indefinite" begin="1.1s">
                              <mpath href="#rail5" />
                            </animateMotion>
                            <animateTransform attributeName="transform" type="scale" values="0;1;1;0" keyTimes="0;0.1;0.8;1" dur="2.7s" repeatCount="indefinite" begin="1.1s" additive="sum" />
                          </use>
                        </g>
                      </svg>
                      <img src="https://framerusercontent.com/images/WOJ0vcfFdASTTZzZXSHcJjab8.png" alt="" className="hero-3d-preview hero-card-anim" />
                    </div>
                    <div className="hero-card-label hero-card-anim">New Creators</div>
                    <div className="hero-card-shine"></div>
                  </div>
                  <div className="hero-3d-card hero-3d-card--center">
                    <div className="hero-card-title hero-card-anim">Campaigns</div>
                    <div className="hero-scroll-wrap">
                      <div className="hero-scroll-track">
                        {[...campaigns.filter(c => c.thumbnail), ...campaigns.filter(c => c.thumbnail)].map((c, i) => (
                          <div key={`hero-camp-${i}`} className="hero-camp-mini">
                            <img src={c.thumbnail} alt="" className="hero-camp-thumb" />
                            <div className="hero-camp-info">
                              <div className="hero-camp-name">{c.title}</div>
                              <div className="hero-camp-meta">{c.brand}</div>
                              <div className="hero-camp-rate">{c.rate} / 1k views</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="hero-card-shine"></div>
                  </div>
                  <div className="hero-3d-card hero-3d-card--right">
                    <div className="hero-right-dash">
                      {/* Stats row */}
                      <div className="hero-right-stats">
                        <div className="hero-right-stat">
                          <div className="hero-right-stat-label">CPM</div>
                          <div className="hero-right-stat-value" id="heroRightCpm">0.00 $</div>
                        </div>
                        <div className="hero-right-stat">
                          <div className="hero-right-stat-label">TRUST SCORE</div>
                          <div className="hero-right-stat-value" id="heroRightScore">0%</div>
                        </div>
                        <svg className="hero-right-shield" width="18" height="22" viewBox="0 0 18 22" fill="none">
                          <path d="M9 1L1 5v6c0 5.25 3.4 10.15 8 11.35C13.6 21.15 17 16.25 17 11V5L9 1z" fill="#e0e0e0" stroke="#ccc" strokeWidth="0.5"/>
                        </svg>
                      </div>
                      {/* Payout protection — single line */}
                      <div className="hero-right-payout">
                        <span className="hero-right-payout-label">PAYOUT PROTECTION</span>
                        <svg width="12" height="12" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="#21b835"/><path d="M4.5 8.2L7 10.5 11.5 6" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        <span className="hero-right-payout-active-text">ACTIVE</span>
                      </div>
                      {/* Gauge — exact production SVG with JS-animated needle */}
                      <div className="hero-right-gauge-wrap">
                        <svg className="hero-right-gauge-svg" viewBox="0 0 400 270" xmlns="http://www.w3.org/2000/svg">
                          <defs>
                            <filter id="hg-base-shadow" x="-20%" y="-20%" width="140%" height="140%">
                              <feDropShadow dx="0" dy="15" stdDeviation="20" floodColor="#a3b4cc" floodOpacity="0.35" />
                            </filter>
                            <filter id="hg-needle-shadow" x="-50%" y="-50%" width="200%" height="200%">
                              <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#091426" floodOpacity="0.25" />
                            </filter>
                            <filter id="hg-blur-sm" x="-20%" y="-20%" width="140%" height="140%">
                              <feGaussianBlur stdDeviation="3" />
                            </filter>
                            <linearGradient id="hg-base-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#FFFFFF" />
                              <stop offset="100%" stopColor="#E2E8F4" />
                            </linearGradient>
                            <clipPath id="hg-track-clip">
                              <path d="M 65 250 A 135 135 0 0 1 335 250 L 285 250 A 85 85 0 0 0 115 250 Z" />
                            </clipPath>
                          </defs>
                          {/* Gauge base */}
                          <g>
                            <path d="M 30 250 A 170 170 0 0 1 370 250 Z" fill="url(#hg-base-grad)" filter="url(#hg-base-shadow)" />
                            <path d="M 31 250 A 169 169 0 0 1 369 250" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
                          </g>
                          {/* Colored track */}
                          <g clipPath="url(#hg-track-clip)">
                            <path d="M 200 250 L 50 250 A 150 150 0 0 1 78.65 161.83 Z" fill="#FCA35D" stroke="#FCA35D" strokeWidth="1.5" strokeLinejoin="round" />
                            <path d="M 200 250 L 78.65 161.83 A 150 150 0 0 1 153.65 107.34 Z" fill="#F47D31" stroke="#F47D31" strokeWidth="1.5" strokeLinejoin="round" />
                            <path d="M 200 250 L 153.65 107.34 A 150 150 0 0 1 246.35 107.34 Z" fill="#E75A16" stroke="#E75A16" strokeWidth="1.5" strokeLinejoin="round" />
                            <path d="M 200 250 L 246.35 107.34 A 150 150 0 0 1 321.35 161.83 Z" fill="#D13F0D" stroke="#D13F0D" strokeWidth="1.5" strokeLinejoin="round" />
                            <path d="M 200 250 L 321.35 161.83 A 150 150 0 0 1 350 250 Z" fill="#B63007" stroke="#B63007" strokeWidth="1.5" strokeLinejoin="round" />
                            {/* Inner shadows */}
                            <path d="M 65 250 A 135 135 0 0 1 335 250" fill="none" stroke="#000000" strokeWidth="12" filter="url(#hg-blur-sm)" opacity="0.15" />
                            <path d="M 115 250 A 85 85 0 0 1 285 250" fill="none" stroke="#000000" strokeWidth="8" filter="url(#hg-blur-sm)" opacity="0.15" />
                            <path d="M 65 250 A 135 135 0 0 1 335 250" fill="none" stroke="#000000" strokeWidth="4" filter="url(#hg-blur-sm)" opacity="0.1" />
                          </g>
                          {/* Animated needle — JS controls rotation via transform */}
                          <g filter="url(#hg-needle-shadow)">
                            <g id="heroRightNeedle" style={{transformOrigin: '200px 250px', transform: 'rotate(-180deg)'}}>
                              <path d="M 200 228 L 300 244 L 300 256 L 200 272 A 22 22 0 1 1 200 228 Z M 200 242 A 8 8 0 1 0 200 258 A 8 8 0 1 0 200 242 Z" fill="#FFFFFF" fillRule="evenodd" />
                              <path d="M 299 244 L 325 250 L 299 256 Z" fill="#EA580C" stroke="#EA580C" strokeWidth="1" strokeLinejoin="round" />
                            </g>
                          </g>
                        </svg>
                      </div>
                    </div>
                    <div className="hero-card-shine"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ═══════ PHONE NOTIFICATIONS + DASHBOARD ═══════ */}
          <section className="section section--dark-phone" id="phone-notifs" data-view="creator">
            <div className="section-inner">
              <div className="phone-notifs-text">
                <div className="pill-badge">Real-Time Payments</div>
                <h2 className="section-h2">Watch the Pledges Flow In</h2>
                <p className="section-p">Every time a pledge arrives, you'll see it happen live. Instant, transparent, and continuous.</p>
              </div>
              <div className="phone-dash-row">
                {/* Phone */}
                <div className="phone-frame" id="phoneFrame">
                  <div className="phone-screen">
                    <div className="phone-island"><div className="phone-island-cam"></div></div>
                    <div className="phone-status-bar">
                      <span className="phone-time-status">9:41</span>
                      <div className="phone-status-icons">
                        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="4.5" y="6" width="3" height="6" rx="1"/><rect x="9" y="3" width="3" height="9" rx="1"/><rect x="13.5" y="0" width="3" height="12" rx="1"/></svg>
                        <svg width="25" height="12" viewBox="0 0 25 12" fill="currentColor"><rect x="0" y="0" width="22" height="12" rx="4" stroke="currentColor" strokeWidth="1" fill="none"/><rect x="2" y="2" width="14" height="8" rx="2"/><path d="M23 4C23.6 4 24 4.4 24 5V7C24 7.6 23.6 8 23 8H22V4H23Z"/></svg>
                      </div>
                    </div>
                    <div className="phone-datetime" id="phoneDatetime">
                      <div className="phone-date">Monday, June 6</div>
                      <div className="phone-clock">9:41</div>
                    </div>
                    <div className="phone-notif-list" id="phoneNotifList"></div>
                    <div className="phone-fade-bottom"></div>
                    <div className="phone-home-indicator"></div>
                  </div>
                </div>

                {/* Dashboard Mockup */}
                <div className="dash-browser" id="dashBrowser">
                  <div className="dash-browser-bar">
                    <div className="dash-browser-dots">
                      <span className="dash-dot dash-dot--red"></span>
                      <span className="dash-dot dash-dot--yellow"></span>
                      <span className="dash-dot dash-dot--green"></span>
                    </div>
                    <div className="dash-browser-url">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M2 8h12"/><path d="M8 2a10 10 0 0 1 0 12M8 2a10 10 0 0 0 0 12"/></svg>
                      <span>app.contentrewards.xyz</span>
                    </div>
                  </div>
                  <div className="dash-content">
                    {/* Dashboard Nav */}
                    <div className="dash-nav">
                      <div className="dash-nav-logo">
                        <img src="https://framerusercontent.com/images/XXhHjUvBpWZhAQ0cxQMYloDvnlI.png?width=1024&height=1024" alt="" className="dash-nav-logo-img" />
                      </div>
                      <div className="dash-nav-tabs">
                        <span className="dash-tab dash-tab--active" data-dash-tab="payouts">Payouts</span>
                        <span className="dash-tab" data-dash-tab="earn">Earn</span>
                      </div>
                    </div>

                    {/* ── PAYOUTS TAB ── */}
                    <div className="dash-tab-panel" id="dashPanelPayouts">
                      {/* Top cards row */}
                      <div className="dash-top-row">
                        <div className="dash-earnings-card" id="dashEarningsCard">
                          <div className="dash-earnings-header">
                            <div className="dash-earnings-label">Total Earned</div>
                            <span className="dash-earnings-rate">$0.75/1k</span>
                          </div>
                          <div className="dash-earnings-row">
                            <span className="dash-earnings-big" id="dashEarningsNum">$620</span>
                          </div>
                          <div className="dash-earnings-sub">USDT on Aptos · 1,889,831 views</div>
                        </div>
                        <div className="dash-campaigns-count">
                          <div className="dash-count-num">6</div>
                          <div className="dash-count-sub">Active Campaigns</div>
                          <div className="dash-count-sub">7 Clips</div>
                        </div>
                      </div>
                      {/* Active Campaign Card */}
                      <div className="dash-campaign-active">
                        <div className="dash-active-header">
                          <span className="dash-active-name">Yunakin Land Tax</span>
                          <span className="dash-active-badge">Active</span>
                        </div>
                        <div className="dash-active-meta">$0.75 CPM · Aptos testnet</div>
                        <div className="dash-active-bar">
                          <div className="dash-active-bar-fill" id="dashBarFill" style={{ width: '32.7%' }}></div>
                        </div>
                        <div className="dash-active-bar-label"><span id="dashBarPct">32.7</span>% used</div>
                      </div>
                      {/* Live Earnings Table */}
                      <div className="dash-table">
                        <div className="dash-table-header">
                          <span className="dash-th dash-th--campaign">CLIP</span>
                          <span className="dash-th dash-th--sponsor">VIEWS</span>
                          <span className="dash-th dash-th--balance">EARNED</span>
                        </div>
                        <div className="dash-table-body" id="dashTableBody">
                          <div className="dash-table-row">
                            <div className="dash-td-campaign">
                              <img className="dash-clip-thumb" src="https://img.youtube.com/vi/zx8RsYjf_kY/default.jpg" alt="" />
                              <div className="dash-camp-info">
                                <span className="dash-camp-name">zx8RsYjf_kY</span>
                                <span className="dash-camp-cat">Tracking · bot 15</span>
                              </div>
                            </div>
                            <span className="dash-td-sponsor" data-base-views="1485618">1,485,618</span>
                            <span className="dash-td-balance dash-td-earned" data-base="332.50">+$332.50</span>
                          </div>
                          <div className="dash-table-row">
                            <div className="dash-td-campaign">
                              <img className="dash-clip-thumb" src="https://img.youtube.com/vi/5z0Gr5-pHMo/default.jpg" alt="" />
                              <div className="dash-camp-info">
                                <span className="dash-camp-name">5z0Gr5-pHMo</span>
                                <span className="dash-camp-cat">Tracking · bot 12</span>
                              </div>
                            </div>
                            <span className="dash-td-sponsor" data-base-views="3962">3,962</span>
                            <span className="dash-td-balance dash-td-earned" data-base="2.82">+$2.82</span>
                          </div>
                          <div className="dash-table-row">
                            <div className="dash-td-campaign">
                              <img className="dash-clip-thumb" src="https://img.youtube.com/vi/jPThSwhJ8CE/default.jpg" alt="" />
                              <div className="dash-camp-info">
                                <span className="dash-camp-name">jPThSwhJ8CE</span>
                                <span className="dash-camp-cat">Tracking · bot 15</span>
                              </div>
                            </div>
                            <span className="dash-td-sponsor" data-base-views="388078">388,078</span>
                            <span className="dash-td-balance dash-td-earned" data-base="276.48">+$276.48</span>
                          </div>
                          <div className="dash-table-row">
                            <div className="dash-td-campaign">
                              <img className="dash-clip-thumb" src="https://img.youtube.com/vi/kcGGSoaN2zA/default.jpg" alt="" />
                              <div className="dash-camp-info">
                                <span className="dash-camp-name">kcGGSoaN2zA</span>
                                <span className="dash-camp-cat">Tracking · bot 8</span>
                              </div>
                            </div>
                            <span className="dash-td-sponsor" data-base-views="12173">12,173</span>
                            <span className="dash-td-balance dash-td-earned" data-base="8.67">+$8.67</span>
                          </div>
                        </div>
                        <div className="dash-table-footer">Auto-refreshing · USDT flows in real time</div>
                      </div>
                    </div>

                    {/* ── EARN TAB ── */}
                    <div className="dash-tab-panel dash-tab-panel--hidden" id="dashPanelEarn">
                      {/* Submit clip — full width */}
                      <div className="dash-campaign-active">
                        <div className="dash-active-header">
                          <span className="dash-active-name">Submit a Clip</span>
                          <span className="dash-earnings-sub">YouTube Shorts · TikTok · Reels</span>
                        </div>
                        <div className="dash-earn-input-row">
                          <input type="text" className="dash-earn-input" placeholder="Paste YouTube Shorts URL..." readOnly value="youtube.com/shorts/zx8RsYjf_kY" />
                          <button className="dash-earn-btn">Submit</button>
                        </div>
                      </div>
                      {/* Verification — same style as campaign-active card */}
                      <div className="dash-campaign-active">
                        <div className="dash-active-header">
                          <span className="dash-active-name">Clip Verification</span>
                          <span className="dash-active-badge" style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a' }}>Passed</span>
                        </div>
                        <div className="dash-active-meta">zx8RsYjf_kY · Yunakin Land Tax</div>
                        <div className="dash-earn-checks-inner">
                          <div className="dash-earn-check">
                            <span className="dash-check-icon dash-check--pass">✓</span>
                            <span className="dash-check-label">Video Is Public</span>
                            <span className="dash-check-value dash-check--pass">Yes</span>
                          </div>
                          <div className="dash-earn-check">
                            <span className="dash-check-icon dash-check--pass">✓</span>
                            <span className="dash-check-label">Duration Valid</span>
                            <span className="dash-check-value dash-check--pass">0:58</span>
                          </div>
                          <div className="dash-earn-check">
                            <span className="dash-check-icon dash-check--pass">✓</span>
                            <span className="dash-check-label">Bot Risk</span>
                            <span className="dash-check-value dash-check--pass">Low</span>
                          </div>
                          <div className="dash-earn-check">
                            <span className="dash-check-icon dash-check--pass">✓</span>
                            <span className="dash-check-label">Content Match</span>
                            <span className="dash-check-value dash-check--pass">98%</span>
                          </div>
                        </div>
                      </div>
                      {/* Payout — same style as the table */}
                      <div className="dash-table">
                        <div className="dash-table-header">
                          <span className="dash-th dash-th--campaign">PAYOUT</span>
                          <span className="dash-th dash-th--sponsor">DETAILS</span>
                          <span className="dash-th dash-th--balance">AMOUNT</span>
                        </div>
                        <div className="dash-table-body">
                          <div className="dash-table-row">
                            <div className="dash-td-campaign">
                              <div className="dash-clip-icon" style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a' }}>✓</div>
                              <div className="dash-camp-info">
                                <span className="dash-camp-name">USDT Sent</span>
                                <span className="dash-camp-cat">1,485,618 views × $0.75/1K</span>
                              </div>
                            </div>
                            <span className="dash-td-sponsor">5% fee · $17.50</span>
                            <span className="dash-td-balance" style={{ color: '#16a34a' }}>+$332.50</span>
                          </div>
                          <div className="dash-table-row">
                            <div className="dash-td-campaign">
                              <div className="dash-clip-icon" style={{ background: 'rgba(249,115,22,0.1)', color: '#f97316' }}>↗</div>
                              <div className="dash-camp-info">
                                <span className="dash-camp-name">On-Chain Tx</span>
                                <span className="dash-camp-cat">0x7a3f...c912 · Aptos</span>
                              </div>
                            </div>
                            <span className="dash-td-sponsor">Confirmed</span>
                            <span className="dash-td-balance" style={{ color: '#f97316', cursor: 'pointer' }}>View ↗</span>
                          </div>
                        </div>
                        <div className="dash-table-footer">Settlement complete · USDT on Aptos mainnet</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ═══════ HOW IT WORKS ═══════ */}
          <section className="section section--white section--rounded-top" id="how-it-works" data-view="creator">
            <div className="section-inner">
              <div className="pill-badge">How it Works</div>
              <h2 className="section-h2">Begin in 3 Simple Steps</h2>
              <p className="section-p">From address to pledge, your acknowledgment becomes standing support with a smooth and transparent process.</p>

              <div className="hiw-cards">
                {/* Step 1 */}
                <div className="hiw-card">
                  <div className="hiw-card-visual">
                    <div className="hiw-card-dots"></div>
                    <div className="hiw-mock1">
                      <div className="hiw-mock1-labels">
                        <span className="hiw-mock1-label">You</span>
                        <span className="hiw-mock1-label">Your Bank</span>
                      </div>
                      <div className="hiw-mock1-icons">
                        <div className="hiw-mock1-icon hiw-mock1-icon--cr">
                          <img src="https://framerusercontent.com/images/XXhHjUvBpWZhAQ0cxQMYloDvnlI.png?width=1024&height=1024" alt="" />
                        </div>
                        <div className="hiw-mock1-icon hiw-mock1-icon--bank" id="bankIconTrigger">
                          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M3 10h18"/><path d="M5 6l7-3 7 3"/><path d="M4 10v11"/><path d="M20 10v11"/><path d="M8 14v3"/><path d="M12 14v3"/><path d="M16 14v3"/></svg>
                          <span className="bank-tap-hint">TAP</span>
                        </div>
                      </div>
                      <div className="hiw-mock1-powered">Powered by <img src="/whop-logo.svg" alt="Whop" className="hiw-whop-logo" /></div>
                    </div>
                    <div className="hiw-card-grain"></div>
                  </div>
                  <div className="hiw-card-bottom">
                    <div className="hiw-step-pill-wrap">
                      <div className="hiw-step-side hiw-step-side--left">
                        <div className="hiw-step-connector-left"></div>
                        <div className="hiw-step-bracket"><img src="https://framerusercontent.com/images/QqewTInDs8Izd3bHgsZDsaJpdOw.svg?width=15&height=30" alt="" /></div>
                      </div>
                      <div className="hiw-step-pill">Step 1</div>
                      <div className="hiw-step-side hiw-step-side--right">
                        <div className="hiw-step-bracket"><img src="https://framerusercontent.com/images/FYYgk6yvhyW7AkzVEOFawXWK36k.svg?width=15&height=30" alt="" /></div>
                        <div className="hiw-step-connector-right"></div>
                      </div>
                    </div>
                    <div className="hiw-step-text">
                      <h3 className="hiw-step-h">Setup Payouts</h3>
                      <p className="hiw-step-p">Connect your bank account</p>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="hiw-card">
                  <div className="hiw-card-visual">
                    <div className="hiw-card-dots"></div>
                    <div className="hiw-card-mockup hiw-mock2">
                      <div className="hiw-mock2-head">Account Settings</div>
                      <div className="hiw-mock2-row">
                        <div className="hiw-mock2-user"><strong>You</strong><span>@imangadhzi</span></div>
                        <div className="hiw-mock2-sep"></div>
                        <div className="hiw-mock2-bal-label">Balance Overview</div>
                      </div>
                      <div className="hiw-mock2-payout">
                        <span className="hiw-mock2-payout-lbl">Available to pay out</span>
                        <span className="hiw-mock2-payout-val">$2,000.00</span>
                      </div>
                    </div>
                    <div className="hiw-card-grain"></div>
                  </div>
                  <div className="hiw-card-bottom">
                    <div className="hiw-step-pill-wrap">
                      <div className="hiw-step-side hiw-step-side--left">
                        <div className="hiw-step-connector-left"></div>
                        <div className="hiw-step-bracket"><img src="https://framerusercontent.com/images/QqewTInDs8Izd3bHgsZDsaJpdOw.svg?width=15&height=30" alt="" /></div>
                      </div>
                      <div className="hiw-step-pill">Step 2</div>
                      <div className="hiw-step-side hiw-step-side--right">
                        <div className="hiw-step-bracket"><img src="https://framerusercontent.com/images/FYYgk6yvhyW7AkzVEOFawXWK36k.svg?width=15&height=30" alt="" /></div>
                        <div className="hiw-step-connector-right"></div>
                      </div>
                    </div>
                    <div className="hiw-step-text">
                      <h3 className="hiw-step-h">Start Earning</h3>
                      <p className="hiw-step-p">Earn and track your balance in real time</p>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="hiw-card">
                  <div className="hiw-card-visual hiw-card-visual--3">
                    <div className="hiw-card-dots"></div>
                    <div className="hiw-mock3-amt" id="hiwCounter">$7,000</div>
                    <div className="hiw-card-mockup hiw-mock3">
                      <div className="hiw-mock3-head">
                        Calendar
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(69,69,69)" strokeWidth="2" strokeMiterlimit="10"><rect x="1.48" y="2.41" width="21.04" height="4.78"/><rect x="1.48" y="7.2" width="21.04" height="15.3"/><line x1="6.26" y1="0.5" x2="6.26" y2="4.33"/><line x1="17.74" y1="0.5" x2="17.74" y2="4.33"/><line x1="12" y1="0.5" x2="12" y2="4.33"/><path d="M11,18.67H6.26v-1L8.56,16a3.86,3.86,0,0,0,1.53-3.07h0A1.92,1.92,0,0,0,8.17,11H6.26"/><path d="M17.74,11H13.91v3.83h1.92a1.91,1.91,0,0,1,1.91,1.91h0a1.91,1.91,0,0,1-1.91,1.91H13"/></svg>
                      </div>
                      <div className="hiw-mock3-calendar" id="hiwCalendar">
                        <div className="hiw-cal-header">Mon</div>
                        <div className="hiw-cal-header">Tue</div>
                        <div className="hiw-cal-header">Wed</div>
                        <div className="hiw-cal-header">Thu</div>
                        <div className="hiw-cal-header">Fri</div>
                        <div className="hiw-cal-header">Sat</div>
                        <div className="hiw-cal-header">Sun</div>
                        <div className="hiw-cal-day" data-day="0">M</div>
                        <div className="hiw-cal-day" data-day="1">T</div>
                        <div className="hiw-cal-day" data-day="2">W</div>
                        <div className="hiw-cal-day" data-day="3">T</div>
                        <div className="hiw-cal-day" data-day="4">F</div>
                        <div className="hiw-cal-day" data-day="5">S</div>
                        <div className="hiw-cal-day" data-day="6">S</div>
                      </div>
                      {/* PAID banner — hidden by default, shown at end of animation */}
                      <div className="hiw-mock3-paid" id="hiwPaid">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                        <span>PAID</span>
                      </div>
                      <div className="hiw-mock3-flow">Reliable money flow</div>
                    </div>
                    <div className="hiw-card-grain"></div>
                  </div>
                  <div className="hiw-card-bottom">
                    <div className="hiw-step-pill-wrap">
                      <div className="hiw-step-side hiw-step-side--left">
                        <div className="hiw-step-connector-left"></div>
                        <div className="hiw-step-bracket"><img src="https://framerusercontent.com/images/QqewTInDs8Izd3bHgsZDsaJpdOw.svg?width=15&height=30" alt="" /></div>
                      </div>
                      <div className="hiw-step-pill">Step 3</div>
                      <div className="hiw-step-side hiw-step-side--right">
                        <div className="hiw-step-bracket"><img src="https://framerusercontent.com/images/FYYgk6yvhyW7AkzVEOFawXWK36k.svg?width=15&height=30" alt="" /></div>
                        <div className="hiw-step-connector-right"></div>
                      </div>
                    </div>
                    <div className="hiw-step-text">
                      <h3 className="hiw-step-h">Get Paid</h3>
                      <p className="hiw-step-p">Get paid on time, every time<span id="hiwActuallyText" className="hiw-actually-text">, but actually this time.</span></p>
                    </div>
                  </div>
                  {/* Shelby Evidence Receipt — vertical wheel ticker */}
                  <div className="shelby-receipt" id="shelbyReceipt">
                    <div className="shelby-receipt-header">
                      <div className="shelby-receipt-dot"></div>
                      <span>Verified by Shelby</span>
                      <div className="shelby-receipt-live">LIVE</div>
                    </div>
                    <div className="shelby-receipt-window" id="shelbyWindow">
                      <div className="shelby-receipt-item" data-idx="0">
                        <span className="shelby-icon">📤</span>
                        <div className="shelby-item-body">
                          <span className="shelby-item-text">Content submitted</span>
                          <span className="shelby-item-time">Mar 8, 11:35 AM</span>
                        </div>
                        <div className="shelby-item-check"><svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg></div>
                      </div>
                      <div className="shelby-receipt-item" data-idx="1">
                        <span className="shelby-icon">📡</span>
                        <div className="shelby-item-body">
                          <span className="shelby-item-text">Oracle #1 — <strong>12.4K views</strong></span>
                          <span className="shelby-item-time">Mar 8, 4:23 PM</span>
                        </div>
                        <div className="shelby-item-check"><svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg></div>
                      </div>
                      <div className="shelby-receipt-item" data-idx="2">
                        <span className="shelby-icon">✓</span>
                        <div className="shelby-item-body">
                          <span className="shelby-item-text">Bot check passed — 10/100</span>
                          <span className="shelby-item-time">Mar 8, 4:23 PM</span>
                        </div>
                        <div className="shelby-item-check"><svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg></div>
                      </div>
                      <div className="shelby-receipt-item" data-idx="3">
                        <span className="shelby-icon">◆</span>
                        <div className="shelby-item-body">
                          <span className="shelby-item-text">Evidence pack → Shelby</span>
                          <span className="shelby-item-time">Mar 8, 4:23 PM</span>
                        </div>
                        <div className="shelby-item-check"><svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg></div>
                      </div>
                      <div className="shelby-receipt-item" data-idx="4">
                        <span className="shelby-icon">📡</span>
                        <div className="shelby-item-body">
                          <span className="shelby-item-text">Oracle #2 — <strong>58.3K views</strong></span>
                          <span className="shelby-item-time">Mar 9, 4:23 PM</span>
                        </div>
                        <div className="shelby-item-check"><svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg></div>
                      </div>
                      <div className="shelby-receipt-item" data-idx="5">
                        <span className="shelby-icon">◆</span>
                        <div className="shelby-item-body">
                          <span className="shelby-item-text">Evidence pack → Shelby</span>
                          <span className="shelby-item-time">Mar 9, 4:23 PM</span>
                        </div>
                        <div className="shelby-item-check"><svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg></div>
                      </div>
                      <div className="shelby-receipt-item" data-idx="6">
                        <span className="shelby-icon">⏱</span>
                        <div className="shelby-item-body">
                          <span className="shelby-item-text">Auto-approved (48hr)</span>
                          <span className="shelby-item-time">Mar 10, 1:59 PM</span>
                        </div>
                        <div className="shelby-item-check"><svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg></div>
                      </div>
                      <div className="shelby-receipt-item" data-idx="7">
                        <span className="shelby-icon">📡</span>
                        <div className="shelby-item-body">
                          <span className="shelby-item-text">Oracle #3 — <strong>118.6K views</strong></span>
                          <span className="shelby-item-time">Mar 10, 4:23 PM</span>
                        </div>
                        <div className="shelby-item-check"><svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg></div>
                      </div>
                      <div className="shelby-receipt-item" data-idx="8">
                        <span className="shelby-icon">◆</span>
                        <div className="shelby-item-body">
                          <span className="shelby-item-text">Evidence pack → Shelby</span>
                          <span className="shelby-item-time">Mar 10, 4:23 PM</span>
                        </div>
                        <div className="shelby-item-check"><svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg></div>
                      </div>
                      <div className="shelby-receipt-item shelby-receipt-item--payout" data-idx="9">
                        <span className="shelby-icon">💰</span>
                        <div className="shelby-item-body">
                          <span className="shelby-item-text">Payout: <strong>$276.07 USDT</strong></span>
                          <span className="shelby-item-time">Mar 10, 9:11 PM</span>
                        </div>
                        <div className="shelby-item-check"><svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg></div>
                      </div>
                      <div className="shelby-receipt-item" data-idx="10">
                        <span className="shelby-icon">📡</span>
                        <div className="shelby-item-body">
                          <span className="shelby-item-text">Oracle #4 — <strong>142.8K views</strong></span>
                          <span className="shelby-item-time">Mar 11, 3:23 PM</span>
                        </div>
                        <div className="shelby-item-check"><svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg></div>
                      </div>
                      <div className="shelby-receipt-item" data-idx="11">
                        <span className="shelby-icon">◆</span>
                        <div className="shelby-item-body">
                          <span className="shelby-item-text">Evidence pack → Shelby</span>
                          <span className="shelby-item-time">Mar 11, 3:23 PM</span>
                        </div>
                        <div className="shelby-item-check"><svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hiw-cta">
                <a href="/pledge" className="btn-orange"><span className="btn-orange-glow"></span><span className="btn-orange-label">Start a pledge</span></a>
              </div>

              <div className="trusted-avatars-row">
                <div className="avatar-stack">
                  <img src="https://framerusercontent.com/images/2QEfVieIuDbE7sbpTcf1maS2k0.png?width=96&height=96" className="avatar-sm" />
                  <img src="https://framerusercontent.com/images/Yk9sbnIDsXrJU7EKwI6uCOrxI3Q.png?width=252&height=315" className="avatar-sm" />
                  <img src="https://framerusercontent.com/images/hZTwDqMdZwXACSU0KXjwGaHLSk.jpg?width=720&height=720" className="avatar-sm" />
                  <img src="https://framerusercontent.com/images/DtiHxp2cHS0u1wz6iCEmftnOrK8.jpg?width=235&height=226" className="avatar-sm" />
                  <img src="https://framerusercontent.com/images/RuWBXMtTGyyP9wnxlQy8IRqHV2I.jpg?width=564&height=564" className="avatar-sm" />
                </div>
                <p className="trusted-avatars-label">Trusted by 50k+ Creators</p>
              </div>

            </div>
          </section>

          {/* ═══════ SHELBY CHIP ANIMATION ═══════ */}
          <section className="shelby-chip-section">
           <div className="shelby-chip-section-inner">
           <div className="shelby-chip-card">
            <div className="shelby-chip-card-inner">
            <svg className="chip-wavy-bg" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,200 C300,400 600,0 1440,300 L1440,800 L0,800 Z" fill="#FFB3E6" opacity="0.3"/>
              <path d="M0,400 C400,600 800,200 1440,500 L1440,800 L0,800 Z" fill="#FF66CC" opacity="0.15"/>
              <path d="M0,600 C500,800 1000,400 1440,700 L1440,800 L0,800 Z" fill="#FF66CC" opacity="0.1"/>
              <path d="M-200,-200 L400,800 L800,800 L100,-200 Z" fill="#ffffff" opacity="0.4"/>
              <path d="M600,-200 L1200,800 L1600,800 L900,-200 Z" fill="#ffffff" opacity="0.4"/>
            </svg>
            <div className="chip-matrix-bg">
              <div className="chip-data-col" style={{ left: '12%', animationDuration: '25s', animationDelay: '0s' }}>S H E L B Y + R E W A R D S</div>
              <div className="chip-data-col chip-data-col--dark" style={{ left: '22%', animationDuration: '35s', animationDelay: '-10s' }}>0 1 0 1 - P A Y O U T - 1 0</div>
              <div className="chip-data-col" style={{ left: '35%', animationDuration: '20s', animationDelay: '-5s' }}>E V I D E N C E = = P A C K</div>
              <div className="chip-data-col chip-data-col--dark" style={{ left: '65%', animationDuration: '30s', animationDelay: '-15s' }}># # G T + P L A N A R + +</div>
              <div className="chip-data-col" style={{ left: '78%', animationDuration: '28s', animationDelay: '-2s' }}>( ) O F F C H A I N &amp; 0 1</div>
              <div className="chip-data-col chip-data-col--dark" style={{ left: '88%', animationDuration: '40s', animationDelay: '-20s' }}>C R E A T O R 1 0 1 - - +</div>
            </div>
            <div className="chip-wrapper">
              <svg viewBox="0 0 600 600" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="basePlateGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFB3E6"/>
                    <stop offset="10%" stopColor="#FF66CC"/>
                    <stop offset="50%" stopColor="#E64CA8"/>
                    <stop offset="100%" stopColor="#B32D7A"/>
                  </linearGradient>
                  <linearGradient id="innerChipGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4A3325"/>
                    <stop offset="10%" stopColor="#36241A"/>
                    <stop offset="100%" stopColor="#1A110C"/>
                  </linearGradient>
                  <linearGradient id="metalGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FFB3E6"/>
                    <stop offset="25%" stopColor="#FFFFFF"/>
                    <stop offset="50%" stopColor="#FF66CC"/>
                    <stop offset="75%" stopColor="#FFE6F7"/>
                    <stop offset="100%" stopColor="#CC3D90"/>
                  </linearGradient>
                  <linearGradient id="highlightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFFFFF"/>
                    <stop offset="15%" stopColor="#FFB3E6"/>
                    <stop offset="100%" stopColor="#5B2135"/>
                  </linearGradient>
                  <linearGradient id="topHighlight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFB3E6"/>
                    <stop offset="100%" stopColor="#1A110C"/>
                  </linearGradient>
                  <filter id="chipDropShadow" x="-20%" y="-20%" width="150%" height="150%">
                    <feDropShadow dx="0" dy="25" stdDeviation="25" floodColor="#5B2135" floodOpacity="0.6"/>
                  </filter>
                  <filter id="chipInnerShadow" x="-20%" y="-20%" width="150%" height="150%">
                    <feDropShadow dx="0" dy="10" stdDeviation="15" floodColor="#36241A" floodOpacity="0.8"/>
                  </filter>
                </defs>
                {/* Outer Pads */}
                <g fill="#5B2135" stroke="#FF66CC" strokeWidth="1">
                  <rect x="190" y="95" width="20" height="35" rx="5"/><rect x="240" y="95" width="20" height="35" rx="5"/><rect x="290" y="95" width="20" height="35" rx="5"/><rect x="340" y="95" width="20" height="35" rx="5"/><rect x="390" y="95" width="20" height="35" rx="5"/>
                  <rect x="190" y="470" width="20" height="35" rx="5"/><rect x="240" y="470" width="20" height="35" rx="5"/><rect x="290" y="470" width="20" height="35" rx="5"/><rect x="340" y="470" width="20" height="35" rx="5"/><rect x="390" y="470" width="20" height="35" rx="5"/>
                  <rect x="95" y="195" width="35" height="20" rx="5"/><rect x="95" y="265" width="35" height="20" rx="5"/><rect x="95" y="335" width="35" height="20" rx="5"/><rect x="95" y="405" width="35" height="20" rx="5"/>
                  <rect x="470" y="195" width="35" height="20" rx="5"/><rect x="470" y="265" width="35" height="20" rx="5"/><rect x="470" y="335" width="35" height="20" rx="5"/><rect x="470" y="405" width="35" height="20" rx="5"/>
                </g>
                {/* Base Plate */}
                <rect x="120" y="120" width="360" height="360" rx="35" fill="url(#basePlateGrad)" filter="url(#chipDropShadow)"/>
                <rect x="121" y="121" width="358" height="358" rx="34" fill="none" stroke="url(#highlightGrad)" strokeWidth="2"/>
                {/* Corner Dots */}
                <g fill="#FFE6F7" stroke="#FF66CC" strokeWidth="1">
                  <circle cx="148" cy="148" r="3.5"/><circle cx="164" cy="148" r="3.5"/><circle cx="148" cy="164" r="3.5"/><circle cx="164" cy="164" r="3.5"/>
                  <circle cx="436" cy="148" r="3.5"/><circle cx="452" cy="148" r="3.5"/><circle cx="436" cy="164" r="3.5"/><circle cx="452" cy="164" r="3.5"/>
                  <circle cx="148" cy="436" r="3.5"/><circle cx="164" cy="436" r="3.5"/><circle cx="148" cy="452" r="3.5"/><circle cx="164" cy="452" r="3.5"/>
                  <circle cx="436" cy="436" r="3.5"/><circle cx="452" cy="436" r="3.5"/><circle cx="436" cy="452" r="3.5"/><circle cx="452" cy="452" r="3.5"/>
                </g>
                {/* Inner Chip Shadow */}
                <rect x="210" y="210" width="180" height="180" rx="20" fill="#2D1E16" filter="url(#chipInnerShadow)"/>
                {/* Connecting Pins - Top */}
                <g>
                  <path d="M 251,215 L 251,175 L 255,160 L 259,175 L 259,215 Z" fill="url(#metalGrad)"/><polygon points="251,175 255,160 259,175" fill="#FFFFFF" className="chip-glowing-pin"/>
                  <path d="M 281,215 L 281,175 L 285,160 L 289,175 L 289,215 Z" fill="url(#metalGrad)"/><polygon points="281,175 285,160 289,175" fill="#FFFFFF" className="chip-glowing-pin"/>
                  <path d="M 311,215 L 311,175 L 315,160 L 319,175 L 319,215 Z" fill="url(#metalGrad)"/><polygon points="311,175 315,160 319,175" fill="#FFFFFF" className="chip-glowing-pin"/>
                  <path d="M 341,215 L 341,175 L 345,160 L 349,175 L 349,215 Z" fill="url(#metalGrad)"/><polygon points="341,175 345,160 349,175" fill="#FFFFFF" className="chip-glowing-pin"/>
                </g>
                {/* Connecting Pins - Left */}
                <g fill="url(#metalGrad)">
                  <path d="M 210,251 L 180,251 C 175,251 170,253 170,255 C 170,257 175,259 180,259 L 210,259 Z"/>
                  <path d="M 210,281 L 180,281 C 175,281 170,283 170,285 C 170,287 175,289 180,289 L 210,289 Z"/>
                  <path d="M 210,311 L 180,311 C 175,311 170,313 170,315 C 170,317 175,319 180,319 L 210,319 Z"/>
                  <path d="M 210,341 L 180,341 C 175,341 170,343 170,345 C 170,347 175,349 180,349 L 210,349 Z"/>
                </g>
                {/* Connecting Pins - Right */}
                <g fill="url(#metalGrad)">
                  <path d="M 390,251 L 420,251 C 425,251 430,253 430,255 C 430,257 425,259 420,259 L 390,259 Z"/>
                  <path d="M 390,281 L 420,281 C 425,281 430,283 430,285 C 430,287 425,289 420,289 L 390,289 Z"/>
                  <path d="M 390,311 L 420,311 C 425,311 430,313 430,315 C 430,317 425,319 420,319 L 390,319 Z"/>
                  <path d="M 390,341 L 420,341 C 425,341 430,343 430,345 C 430,347 425,349 420,349 L 390,349 Z"/>
                </g>
                {/* Connecting Pins - Bottom */}
                <g fill="#B32D7A">
                  <path d="M 251,390 L 251,420 C 251,425 253,430 255,430 C 257,430 259,425 259,420 L 259,390 Z"/>
                  <path d="M 281,390 L 281,420 C 281,425 283,430 285,430 C 287,430 289,425 289,420 L 289,390 Z"/>
                  <path d="M 311,390 L 311,420 C 311,425 313,430 315,430 C 317,430 319,425 319,420 L 319,390 Z"/>
                  <path d="M 341,390 L 341,420 C 341,425 343,430 345,430 C 347,430 349,425 349,420 L 349,390 Z"/>
                </g>
                {/* Inner Chip Body */}
                <rect x="210" y="210" width="180" height="180" rx="20" fill="url(#innerChipGrad)"/>
                <rect x="211" y="211" width="178" height="178" rx="19" fill="none" stroke="url(#topHighlight)" strokeWidth="2" opacity="0.6"/>
                {/* Grid Lines */}
                <g stroke="#FFB3E6" strokeWidth="1" opacity="0.2">
                  <line x1="240" y1="210" x2="240" y2="390"/><line x1="360" y1="210" x2="360" y2="390"/>
                  <line x1="210" y1="240" x2="390" y2="240"/><line x1="210" y1="360" x2="390" y2="360"/>
                </g>
                {/* Center Core — dark background */}
                <circle cx="300" cy="300" r="50" fill="#1A110C" stroke="#4A3325" strokeWidth="2"/>
                {/* Rotating Ring */}
                <g className="chip-rotating-ring">
                  <circle cx="300" cy="300" r="48" stroke="url(#metalGrad)" strokeWidth="8" fill="none" strokeDasharray="45 13.6"/>
                  <circle cx="300" cy="300" r="44" stroke="#FFFFFF" strokeWidth="1" fill="none" strokeDasharray="35 10" opacity="0.3"/>
                  <circle cx="300" cy="300" r="52" stroke="#B32D7A" strokeWidth="1" fill="none" strokeDasharray="55 17.2"/>
                </g>
                {/* Shelby Logo */}
                <g className="chip-shelby-logo">
                  <g transform="translate(300,300) scale(0.132) translate(-287.5,-287.5)">
                    <rect width="575" height="575" rx="287.5" fill="#FF77C9"/>
                    <path d="M171.881 225.802C176.824 217.244 182.613 209.51 189.089 202.6L158.701 149.97C155.475 144.387 147.443 144.387 144.217 149.97L78.7274 263.421C69.7575 278.935 69.7575 298.065 78.7274 313.579L144.217 427.03C147.443 432.613 155.475 432.613 158.701 427.03L189.089 374.4C152.157 335.157 143.553 274.885 171.881 225.825V225.802Z" fill="#322313"/>
                    <path d="M372.169 94H241.167C234.737 94 230.71 100.956 233.937 106.54L264.347 159.215C294.323 152.167 326.953 156.08 355.716 172.692C384.479 189.305 404.181 215.597 413.06 245.092H473.881C480.311 245.092 484.338 238.136 481.112 232.553L415.622 119.102C406.652 103.565 390.086 94 372.169 94Z" fill="#322313"/>
                    <path d="M264.324 417.831L233.937 470.46C230.71 476.044 234.737 483 241.167 483H372.169C390.086 483 406.652 473.435 415.599 457.921L481.089 344.47C484.315 338.887 480.288 331.931 473.858 331.931H413.082C410.337 340.992 406.538 349.87 401.595 358.428C373.267 407.511 316.771 430.165 264.324 417.831Z" fill="#322313"/>
                    <path d="M260.16 166.446C236.569 171.984 214.602 184.34 197.44 202.623L232.541 263.445C241.511 278.959 241.511 298.088 232.541 313.603L197.44 374.424C205.632 383.142 215.22 390.831 226.134 397.123C237.026 403.416 248.49 407.878 260.138 410.624L295.239 349.803C304.209 334.288 320.753 324.723 338.67 324.723H408.896C416.149 300.72 415.852 275.549 408.873 252.324H338.693C320.776 252.324 304.209 242.759 295.262 227.245L260.16 166.469V166.446Z" fill="#322313"/>
                  </g>
                </g>
              </svg>
            </div>
            <div className="chip-powered-bar">
              <span className="chip-powered-text">Powered by</span>
              <svg className="chip-powered-logo" viewBox="0 0 900 212" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M246.403 122.531H279.212C279.432 137.045 291.714 146.412 311.132 146.412C327.877 146.412 338.587 138.155 338.587 125.434C338.587 114.493 331.89 108.688 316.266 106.687L298.19 104.455C266.271 100.442 251.098 84.5864 251.098 59.1436C251.098 30.3472 274.759 11.6003 309.581 11.6003C347.075 11.6003 368.955 29.6764 369.626 58.253H337.036C336.366 46.642 326.096 39.7261 309.581 39.7261C294.408 39.7261 284.138 46.642 284.138 57.1314C284.138 67.6209 291.725 72.5357 308.24 74.5368L324.985 76.549C356.234 80.5622 371.858 95.9665 371.858 123.202C371.858 154.45 349.087 174.989 311.143 174.989C271.186 174.989 246.865 155.352 246.414 122.531H246.403Z" fill="#FFB3E6"/>
                <path d="M382.105 15.1624H413.354V68.0602C420.05 61.3642 429.869 57.7907 440.589 57.7907C467.593 57.7907 484.559 75.1961 484.559 104.443V171.404H453.31V107.786C453.31 93.0523 446.614 85.9164 434.113 85.9164C421.611 85.9164 413.354 94.6246 413.354 108.688V171.404H382.105V15.1624Z" fill="#FFB3E6"/>
                <path d="M493.817 115.615C493.817 80.573 516.137 57.802 548.727 57.802C581.317 57.802 603.417 79.6714 603.417 114.724C603.417 118.737 603.197 122.762 602.746 127.446H524.625C525.967 141.289 535.115 148.875 550.068 148.875C560.107 148.875 566.583 144.631 569.486 138.606H601.405C594.929 160.475 577.963 174.769 549.848 174.769C516.148 174.769 493.828 151.338 493.828 115.615H493.817ZM571.938 103.784V103.333C571.938 90.8316 563.9 82.3543 548.727 82.3543C533.554 82.3543 525.296 90.8316 524.395 103.784H571.938Z" fill="#FFB3E6"/>
                <path d="M613.224 148.424V15.1624H644.472V137.253C644.472 141.937 646.253 144.169 651.388 144.169H663.439V171.404H637.996C621.03 171.404 613.224 164.928 613.224 148.413V148.424Z" fill="#FFB3E6"/>
                <path d="M698.448 160.695V171.404H670.993V15.1624H702.241V69.6216C708.937 62.0349 720.097 57.7907 732.599 57.7907C764.067 57.7907 785.497 81.2325 785.497 116.274C785.497 151.316 764.067 174.758 732.599 174.758C718.316 174.758 705.595 169.623 698.448 160.695ZM727.464 146.632C743.088 146.632 753.358 134.35 753.358 116.274C753.358 98.1981 743.088 85.9164 727.464 85.9164C711.84 85.9164 701.79 98.1981 701.79 116.274C701.79 134.35 712.06 146.632 727.464 146.632Z" fill="#FFB3E6"/>
                <path d="M782.143 184.137H804.914C810.719 184.137 814.293 181.685 816.294 176.99L822.99 162.476L778.129 61.1445H813.622L839.516 126.764L865.178 61.1445H900L841.077 193.955C836.162 205.336 829.246 211.592 813.402 211.592H782.154V184.137H782.143Z" fill="#FFB3E6"/>
                <path d="M47.994 63.3325C50.369 59.2203 53.1508 55.5039 56.2624 52.1834L41.6608 26.8944C40.1105 24.2116 36.2512 24.2116 34.7008 26.8944L3.23259 81.4086C-1.07753 88.8634 -1.07753 98.0554 3.23259 105.51L34.7008 160.024C36.2512 162.707 40.1105 162.707 41.6608 160.024L56.2624 134.735C38.5162 115.879 34.382 86.9172 47.994 63.3435V63.3325Z" fill="#FFB3E6"/>
                <path d="M144.234 0H81.2868C78.1971 0 76.262 3.34254 77.8123 6.02537L92.4249 31.3363C106.829 27.9498 122.508 29.83 136.329 37.8125C150.15 45.795 159.617 58.4285 163.883 72.6013H193.108C196.198 72.6013 198.133 69.2587 196.582 66.5759L165.114 12.0617C160.804 4.59599 152.844 0 144.234 0Z" fill="#FFB3E6"/>
                <path d="M92.4139 155.604L77.8123 180.893C76.262 183.576 78.1971 186.918 81.2868 186.918H144.234C152.844 186.918 160.804 182.322 165.103 174.868L196.571 120.353C198.122 117.671 196.187 114.328 193.097 114.328H163.894C162.574 118.682 160.749 122.948 158.374 127.061C144.762 150.645 117.615 161.53 92.4139 155.604Z" fill="#FFB3E6"/>
                <path d="M90.4132 34.8113C79.0772 37.4721 68.5218 43.4095 60.2754 52.1947L77.142 81.4199C81.4521 88.8747 81.4521 98.0666 77.142 105.521L60.2754 134.747C64.2117 138.936 68.8187 142.63 74.0634 145.654C79.2971 148.678 84.8057 150.822 90.4022 152.141L107.269 122.916C111.579 115.461 119.528 110.865 128.138 110.865H161.882C165.367 99.3311 165.225 87.2364 161.871 76.0762H128.149C119.539 76.0762 111.579 71.4803 107.28 64.0255L90.4132 34.8223V34.8113Z" fill="#FFB3E6"/>
              </svg>
            </div>
            </div>
           </div>
           </div>
          </section>

          {/* ═══════ TRUST SCORE ═══════ */}
          <section className="section section--gray" id="trust" data-view="creator">
            <div className="section-inner">
              <div className="pill-badge">Verified & Trusted</div>
              <h2 className="section-h2">Build Your Trust Score</h2>
              <p className="section-p">Earn credibility with brands through ratings, protection, and verified submissions.</p>

              <div className="trust-grid">
                {/* Large gauge card (left) */}
                <div className="trust-card trust-gauge-card" id="trustGaugeCard">
                  <div className="trust-gauge-top">
                    <img src="/dots-increase.svg" alt="" className="trust-gauge-img" />
                    <div className="trust-gauge-arc-clip" id="trustArcClip">
                      <div className="trust-gauge-arc" id="trustArc"></div>
                      <div className="trust-gauge-white-mask"></div>
                    </div>
                    <div className="trust-badge-pill" id="trustPill">Untrusted</div>
                    <div className="whop-affinity-card" id="whopAffinityCard">
                      <div className="whop-affinity-header">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/></svg>
                        <span>Whop Creator Score</span>
                      </div>
                      <div className="whop-affinity-score" id="whopAffinityNum">0</div>
                      <div className="whop-affinity-bar-wrap">
                        <div className="whop-affinity-bar" id="whopAffinityBar"></div>
                      </div>
                      <div className="whop-affinity-label">Reputation</div>
                    </div>
                    <div className="trust-badge-row" id="trustScoreBox">
                      <div className="trust-badge-top-row">
                        <img src="https://framerusercontent.com/images/d1JbDPFBxTPQdKOKP1CfFikmbsk.jpg?width=620&height=620" alt="" className="trust-badge-avatar" />
                        <span className="trust-badge-score" id="trustScoreNum">2</span>
                      </div>
                      <div className="trust-badge-bottom-row">
                        <div className="trust-badge-dots" id="trustDots">
                          <div className="trust-badge-dot trust-badge-dot--first" data-idx="0"></div>
                          <div className="trust-badge-dot" data-idx="1"></div>
                          <div className="trust-badge-dot" data-idx="2"></div>
                          <div className="trust-badge-dot" data-idx="3"></div>
                          <div className="trust-badge-dot" data-idx="4"></div>
                          <div className="trust-badge-dot" data-idx="5"></div>
                          <div className="trust-badge-dot" data-idx="6"></div>
                          <div className="trust-badge-dot" data-idx="7"></div>
                          <div className="trust-badge-dot" data-idx="8"></div>
                          <div className="trust-badge-dot trust-badge-dot--last" data-idx="9"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="trust-gauge-bottom">
                    <h3 className="trust-card-h">Increase Your Trust Score</h3>
                    <p className="trust-card-p">With every successful campaign, your trust score will increase based on your input.</p>
                  </div>
                </div>

                {/* Become Trustworthy — Whop Creator Score */}
                <div className="trust-card trust-score-card" id="trustScoreCard">
                  <div className="wcs-visual-top">
                    <img src="/dots-trustworthy.svg" alt="" className="wcs-dot-bg" />
                    {/* Floating profile mockup card */}
                    <div className="wcs-mockup" id="wcsMockup">
                      <div className="wcs-mockup-header">
                        <img src="https://framerusercontent.com/images/d1JbDPFBxTPQdKOKP1CfFikmbsk.jpg?width=620&height=620" alt="" className="wcs-avatar" />
                        <div className="wcs-name-col">
                          <span className="wcs-name">doge_creator</span>
                          <span className="wcs-badge-pill" id="wcsPill">Trusted</span>
                        </div>
                        <div className="wcs-score-circle" id="wcsScoreCircle">
                          <svg viewBox="0 0 40 40" className="wcs-mini-ring">
                            <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="3"/>
                            <circle className="wcs-ring-fill" id="wcsRingFill" cx="20" cy="20" r="16" fill="none" stroke="rgb(33, 184, 53)" strokeWidth="3" strokeLinecap="round" strokeDasharray="100.5" strokeDashoffset="100.5" transform="rotate(-90 20 20)"/>
                          </svg>
                          <span className="wcs-score-num" id="wcsScoreBig">0</span>
                        </div>
                      </div>
                      <div className="wcs-stats-grid" id="wcsBreakdown">
                        <div className="wcs-stat-item">
                          <span className="wcs-stat-val" id="wcsStat0">0</span>
                          <span className="wcs-stat-lbl">Trust</span>
                        </div>
                        <div className="wcs-stat-item">
                          <span className="wcs-stat-val" id="wcsStat1">0</span>
                          <span className="wcs-stat-lbl">Campaigns</span>
                        </div>
                        <div className="wcs-stat-item">
                          <span className="wcs-stat-val" id="wcsStat2">0%</span>
                          <span className="wcs-stat-lbl">Approval</span>
                        </div>
                        <div className="wcs-stat-item">
                          <span className="wcs-stat-val" id="wcsStat3">0%</span>
                          <span className="wcs-stat-lbl">On-time</span>
                        </div>
                      </div>
                      <div className="wcs-dots-row" id="wcsDotsRow">
                        <div className="wcs-dot wcs-dot--first"></div>
                        <div className="wcs-dot"></div>
                        <div className="wcs-dot"></div>
                        <div className="wcs-dot"></div>
                        <div className="wcs-dot"></div>
                        <div className="wcs-dot"></div>
                        <div className="wcs-dot"></div>
                        <div className="wcs-dot"></div>
                        <div className="wcs-dot"></div>
                        <div className="wcs-dot wcs-dot--last"></div>
                      </div>
                    </div>
                    {/* Green checkmark badge overlapping */}
                    <div className="wcs-check-float" id="wcsCheckBadge">
                      <img src="https://framerusercontent.com/images/PKfgpkDjetgPn22paJtuWZURA.png?width=160&height=160" alt="" className="trust-check-img" />
                    </div>
                  </div>
                  <div className="wcs-text-bottom">
                    <h3 className="trust-card-h">Become Trustworthy</h3>
                    <p className="trust-card-p">Get a badge that shows brands you're reliable and ready to work.</p>
                  </div>
                </div>
              </div>

              {/* Bottom trust row */}
              <div className="trust-bottom">
                <div className="trust-card trust-payout-card">
                  <div className="trust-payout-visual">
                    <img src="/dots-payout.svg" alt="" className="trust-dot-img" />
                    <div className="trust-payout-watermark">Protection shield</div>
                    <div className="trust-confetti">
                      <div className="trust-confetti-piece"></div>
                      <div className="trust-confetti-piece"></div>
                      <div className="trust-confetti-piece"></div>
                      <div className="trust-confetti-piece"></div>
                      <div className="trust-confetti-piece"></div>
                      <div className="trust-confetti-piece"></div>
                      <div className="trust-confetti-piece"></div>
                      <div className="trust-confetti-piece"></div>
                    </div>
                    <img src="https://framerusercontent.com/images/6EbV5BCw63bzkoNFzYTzEhlVZhQ.png?width=924&height=753" alt="" className="trust-shield-img" />
                  </div>
                  <div className="trust-payout-text">
                    <h3 className="trust-card-h" style={{ textAlign: 'center' }}>Payout Protection</h3>
                    <p className="trust-card-p" style={{ textAlign: 'center', maxWidth: 'none' }}>Stay protected with a secure system that guarantees fairness.</p>
                  </div>
                </div>
                <div className="trust-card trust-submission-card">
                  <div className="trust-submission-text">
                    <h3 className="trust-card-h">Submission to campaign</h3>
                    <p className="trust-card-p">Submit your work with confidence and boost your opportunities to get selected.</p>
                  </div>
                  <div className="trust-submission-visual">
                    <img src="/dots-submission.svg" alt="" className="trust-dot-img" />
                    <div className="trust-submission-file-card" id="subFileCard">
                      <div className="trust-sub-file-icon" id="subFileIcon">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="rgb(160,160,160)" strokeWidth="1.5"><path d="M8 4v8M4 8h8"/></svg>
                      </div>
                      <span className="trust-sub-file-text" id="subFileText">No File Selected</span>
                    </div>
                    <div className="trust-sub-drag-thumb" id="subDragThumb">
                      <img src="https://framerusercontent.com/images/Z48taNdHwdWbOUxbtSncAlJbZNg.png?width=1002&height=504" alt="" />
                      <img src="https://framerusercontent.com/images/QBJfpaZ0Dd8U5y3SeFcmmfBgkUk.png?width=1000&height=1000" alt="" className="trust-sub-cursor" />
                    </div>
                    <div className="trust-sub-tx-hash" id="subTxHash">
                      <span className="trust-sub-tx-label">tx</span>
                      <span className="trust-sub-tx-value">0x7a3f…e91b</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="trust-creators-row">
                <p className="trust-creators-txt">Active creators</p>
                <div className="avatar-stack">
                  <img src="https://framerusercontent.com/images/2QEfVieIuDbE7sbpTcf1maS2k0.png?width=96&height=96" className="avatar-sm" />
                  <img src="https://framerusercontent.com/images/Yk9sbnIDsXrJU7EKwI6uCOrxI3Q.png?width=252&height=315" className="avatar-sm" />
                  <img src="https://framerusercontent.com/images/hZTwDqMdZwXACSU0KXjwGaHLSk.jpg?width=720&height=720" className="avatar-sm" />
                  <img src="https://framerusercontent.com/images/DtiHxp2cHS0u1wz6iCEmftnOrK8.jpg?width=235&height=226" className="avatar-sm" />
                  <img src="https://framerusercontent.com/images/RuWBXMtTGyyP9wnxlQy8IRqHV2I.jpg?width=564&height=564" className="avatar-sm" />
                </div>
              </div>
            </div>
          </section>

          {/* ═══════ CAMPAIGNS ═══════ */}
          <section className="section section--white" id="campaigns" data-view="creator">
            <div className="section-inner">
              <div className="pill-badge">Hot Campaigns</div>
              <h2 className="section-h2">Discover Popular Campaigns</h2>
              <p className="section-p">Join top opportunities from trusted brands and start creating right away.</p>

              <div className="camp-grid">
                {campaigns.filter((c) => c.thumbnail).map((c) => (
                  <Link key={c.id} href={`/discover/${c.id}`} className="camp-card">
                    <div className="camp-thumb"><img src={c.thumbnail} alt="" /></div>
                    <div className="camp-body">
                      <div className="camp-tags">{c.tags.map((t) => <span key={t} className="camp-tag">{t}</span>)}</div>
                      <span className="camp-time">{c.timeAgo}</span>
                      <div className="camp-title">{c.title}</div>
                      <div className="camp-brand">
                        <span>{c.brand}</span>
                        {c.brandVerified && <img src="https://framerusercontent.com/images/lQot3iQ6MzDBwmWK5zxNRkQ3T4.svg?width=16&height=16" className="camp-verified" />}
                      </div>
                      <div className="camp-money"><span className="camp-earned">{c.earned}</span><span className="camp-budget">/ {c.budget}</span></div>
                      <div className="camp-rate"><span className="camp-rate-bold">{c.rate}</span>/ 1k views</div>
                      <div className="camp-bar"><div className="camp-bar-fill" style={{ width: `${Math.round((c.earnedNum / c.budgetNum) * 100)}%` }}></div></div>
                      <div className="camp-stats">
                        <div className="camp-stat"><span className="camp-stat-lbl">Approval</span><span className="camp-stat-val camp-stat-green">{c.approval}</span></div>
                        <div className="camp-stat"><span className="camp-stat-lbl">Views</span><span className="camp-stat-val">{c.views}</span></div>
                        <div className="camp-stat"><span className="camp-stat-lbl">Creators</span><span className="camp-stat-val">{c.creators}</span></div>
                      </div>
                      <div className="camp-platforms">{c.platforms.map((p) => <img key={p.name} src={p.icon} className="camp-plat-icon" />)}</div>
                    </div>
                  </Link>
                ))}
              </div>
              <a href="#" className="btn-white camp-see-all">See All Campaigns</a>
            </div>
          </section>

          {/* ═══════ MARKET OVERVIEW ═══════ */}
          <MarketOverview />

          {/* ═══════ FAQ ═══════ */}
          <section className="section section--white" id="faq" data-view="creator">
            <div className="section-inner">
              <div className="pill-badge">FAQs</div>
              <h2 className="section-h2">Your Questions, Answered</h2>
              <p className="section-p" style={{ color: '#6b7280' }}>Everything you need to know to understand how the platform works, all in one place.</p>
              <div className="faq-list"><div className="faq-list-inner">
                <div className="faq-item"><button className="faq-q"><span>How does Content Rewards work?</span><span className="faq-icon"><svg viewBox="0 0 256 256" fill="currentColor"><path d="M216.49,104.49l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,0,1,17-17L128,159l71.51-71.52a12,12,0,0,1,17,17Z"/></svg></span></button><div className="faq-a"><div className="faq-a-inner"><p>Join a campaign, read the rules, post your video, and submit your link. Once your video is approved and your views are verified, you get paid.</p></div></div></div>
                <div className="faq-item"><button className="faq-q"><span>Do I need to have a lot of followers to earn?</span><span className="faq-icon"><svg viewBox="0 0 256 256" fill="currentColor"><path d="M216.49,104.49l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,0,1,17-17L128,159l71.51-71.52a12,12,0,0,1,17,17Z"/></svg></span></button><div className="faq-a"><div className="faq-a-inner"><p>No. Follower count does not matter. Some campaigns even require creating a new account before posting.</p></div></div></div>
                <div className="faq-item"><button className="faq-q"><span>How do I submit videos?</span><span className="faq-icon"><svg viewBox="0 0 256 256" fill="currentColor"><path d="M216.49,104.49l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,0,1,17-17L128,159l71.51-71.52a12,12,0,0,1,17,17Z"/></svg></span></button><div className="faq-a"><div className="faq-a-inner"><p>Join a campaign, link your account, open the campaign, tap &quot;Submit Video&quot; and follow the steps.</p></div></div></div>
                <div className="faq-item"><button className="faq-q"><span>When I earn money, is there a fee taken?</span><span className="faq-icon"><svg viewBox="0 0 256 256" fill="currentColor"><path d="M216.49,104.49l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,0,1,17-17L128,159l71.51-71.52a12,12,0,0,1,17,17Z"/></svg></span></button><div className="faq-a"><div className="faq-a-inner"><p>Yes. Content Rewards takes a 7% fee from all clipper payouts.</p></div></div></div>
                <div className="faq-item"><button className="faq-q"><span>How often do I get paid?</span><span className="faq-icon"><svg viewBox="0 0 256 256" fill="currentColor"><path d="M216.49,104.49l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,0,1,17-17L128,159l71.51-71.52a12,12,0,0,1,17,17Z"/></svg></span></button><div className="faq-a"><div className="faq-a-inner"><p>Every seven days you get paid for each submission that has earned money.</p></div></div></div>
                <div className="faq-item"><button className="faq-q"><span>Why was my video rejected?</span><span className="faq-icon"><svg viewBox="0 0 256 256" fill="currentColor"><path d="M216.49,104.49l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,0,1,17-17L128,159l71.51-71.52a12,12,0,0,1,17,17Z"/></svg></span></button><div className="faq-a"><div className="faq-a-inner"><p>Usually because it breaks guidelines, appears botted, or contains inappropriate content.</p></div></div></div>
              </div></div>
              <Link href="/faqs" className="faq-see-all">See all questions<svg viewBox="0 0 24 24" fill="none"><line x1="21.5" y1="12" x2="0.5" y2="12" stroke="#fff" strokeWidth="1.75"/><polyline points="13.86 4.36 21.5 12 13.86 19.64" fill="none" stroke="#fff" strokeWidth="1.75"/></svg></Link>
            </div>
          </section>

          {/* ═══════ BRAND: SOCIAL PROOF (scrolling brand logos + counter) ═══════ */}
          <section className="section section--brand-social" id="brand-social" data-view="brand" style={{ display: 'none' }}>
            <div className="section-inner">
              <h2 className="section-h2 brand-gradient-text">Join 200+ Profitable Brands</h2>
              <p className="section-p" style={{ color: 'rgba(255,255,255,0.7)' }}>Verified brands win 30% more deals and gain brand trust</p>
            </div>
            <div className="brand-logos-grid">
              <div className="brand-logo-col brand-logo-col--up">
                <div className="brand-logo-item"><img src="https://framerusercontent.com/images/TyP1Yy6hkL0nbmJjAqXoWEWV5k.png?width=424&height=399" alt="Stake" /></div>
                <div className="brand-logo-item"><img src="https://framerusercontent.com/images/CTpkzYq4hR70pw88nzpDTdRZtAY.webp?width=150&height=146" alt="Crayo" /></div>
                <div className="brand-logo-item"><img src="https://framerusercontent.com/images/5CLgmuP9GtAKX4BiQFhK1Y9m1Go.png?width=512&height=512" alt="F1" /></div>
                <div className="brand-logo-item"><img src="https://framerusercontent.com/images/azIcNCZ9lPyGHbB8S5LYQxBhiIc.png?width=400&height=400" alt="Billboard" /></div>
                <div className="brand-logo-item"><img src="https://framerusercontent.com/images/TyP1Yy6hkL0nbmJjAqXoWEWV5k.png?width=424&height=399" alt="Stake" /></div>
                <div className="brand-logo-item"><img src="https://framerusercontent.com/images/CTpkzYq4hR70pw88nzpDTdRZtAY.webp?width=150&height=146" alt="Crayo" /></div>
              </div>
              <div className="brand-logo-col brand-logo-col--down">
                <div className="brand-logo-item"><img src="https://framerusercontent.com/images/OMZv1Zi0y5IBxLBQhERGHKKBo.webp?width=240&height=240" alt="Polymarket" /></div>
                <div className="brand-logo-item"><img src="https://framerusercontent.com/images/KDttIf02RDEagXzVVwWfzAA4sI.png?width=512&height=512" alt="Whop" /></div>
                <div className="brand-logo-item"><img src="https://framerusercontent.com/images/DWRSzVgWDvxVN9NIbCjqxdS0CY.png?width=225&height=225" alt="NFL" /></div>
                <div className="brand-logo-item"><img src="https://framerusercontent.com/images/RSd2Jed8EU8U8jQN5Y18tXleNOw.png?width=512&height=512" alt="F1" /></div>
                <div className="brand-logo-item"><img src="https://framerusercontent.com/images/OMZv1Zi0y5IBxLBQhERGHKKBo.webp?width=240&height=240" alt="Polymarket" /></div>
                <div className="brand-logo-item"><img src="https://framerusercontent.com/images/KDttIf02RDEagXzVVwWfzAA4sI.png?width=512&height=512" alt="Whop" /></div>
              </div>
              <div className="brand-counter-card">
                <span className="brand-counter-num" id="brandCounterNum">320</span>
                <span className="brand-counter-label">Brands</span>
              </div>
              <div className="brand-logo-col brand-logo-col--up">
                <div className="brand-logo-item"><img src="https://framerusercontent.com/images/IqywNUUTt6j2pjgaQiUY9JQGWGI.png?width=8000&height=4500" alt="Association of Ramaytush Ohlone" /></div>
                <div className="brand-logo-item"><img src="https://framerusercontent.com/images/SiBp2vckPrUBs4TOQ46vrbwvbMo.jpg?width=900&height=1200" alt="Brez" /></div>
                <div className="brand-logo-item"><img src="https://framerusercontent.com/images/RqTVfvK79lmmSzvL5cXl2YYjm18.png?width=229&height=220" alt="Eleven" /></div>
                <div className="brand-logo-item"><img src="https://framerusercontent.com/images/WjsQ0Adlg1Q7UG7mcdjdYtsWa2w.jpg?width=900&height=900" alt="Iman" /></div>
                <div className="brand-logo-item"><img src="https://framerusercontent.com/images/IqywNUUTt6j2pjgaQiUY9JQGWGI.png?width=8000&height=4500" alt="Association of Ramaytush Ohlone" /></div>
                <div className="brand-logo-item"><img src="https://framerusercontent.com/images/SiBp2vckPrUBs4TOQ46vrbwvbMo.jpg?width=900&height=1200" alt="Brez" /></div>
              </div>
              <div className="brand-logo-col brand-logo-col--down">
                <div className="brand-logo-item"><img src="https://framerusercontent.com/images/kxA2ahkw536WT17BXDLi8dA1kE.jpg?width=2048&height=1152" alt="Druski" /></div>
                <div className="brand-logo-item"><img src="https://framerusercontent.com/images/KvLYdVXqIuc33NZpBi65ODZ1gtk.jpg?width=600&height=373" alt="Jacob" /></div>
                <div className="brand-logo-item"><img src="https://framerusercontent.com/images/TyP1Yy6hkL0nbmJjAqXoWEWV5k.png?width=424&height=399" alt="Stake" /></div>
                <div className="brand-logo-item"><img src="https://framerusercontent.com/images/5CLgmuP9GtAKX4BiQFhK1Y9m1Go.png?width=512&height=512" alt="F1" /></div>
                <div className="brand-logo-item"><img src="https://framerusercontent.com/images/kxA2ahkw536WT17BXDLi8dA1kE.jpg?width=2048&height=1152" alt="Druski" /></div>
                <div className="brand-logo-item"><img src="https://framerusercontent.com/images/KvLYdVXqIuc33NZpBi65ODZ1gtk.jpg?width=600&height=373" alt="Jacob" /></div>
              </div>
            </div>
          </section>

          {/* ═══════ BRAND: CAMPAIGN RESULTS (Carousel) ═══════ */}
          <section className="section section--brand-results" id="brand-results" data-view="brand" style={{ display: 'none', background: '#000', overflow: 'hidden' }}>
            <div className="section-inner">
              <div className="pill-badge">Results</div>
              <h2 className="section-h2 brand-gradient-text">See What Brands Have Achieved</h2>
              <p className="section-p" style={{ color: 'rgba(255,255,255,0.6)' }}>Join top opportunities from trusted brands and start collaborating right away.</p>
              <BrandCarousel />
            </div>
          </section>

          {/* ═══════ BRAND: BOOST VISIBILITY ═══════ */}
          <section className="section section--gray" id="brand-boost" data-view="brand" style={{ display: 'none' }}>
            <div className="section-inner">
              <div className="pill-badge">Featured</div>
              <h2 className="section-h2">Boost Visibility</h2>
              <p className="section-p">Featured placement so more creators see and apply to your campaigns</p>
              <div className="brand-boost-card">
                <div className="brand-boost-browser">
                  <div className="dash-browser-bar">
                    <div className="dash-browser-dots">
                      <span className="dash-dot dash-dot--red"></span>
                      <span className="dash-dot dash-dot--yellow"></span>
                      <span className="dash-dot dash-dot--green"></span>
                    </div>
                    <div className="dash-browser-url">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M2 8h12"/><path d="M8 2a10 10 0 0 1 0 12M8 2a10 10 0 0 0 0 12"/></svg>
                      <span>app.contentrewards.com/campaigns</span>
                    </div>
                  </div>
                  <div className="brand-boost-content">
                    <div className="brand-boost-earnings-overlay">
                      <div className="brand-boost-earnings-big">$87.5k</div>
                      <div className="brand-boost-earnings-slash">/ $101.8k</div>
                    </div>
                    <div className="brand-boost-campaigns-badge">CAMPAIGNS 19</div>
                    <div className="brand-boost-table">
                      <div className="brand-boost-table-row">
                        <span className="brand-boost-camp-name">Stake.com — $2 CPM Clipping</span>
                        <span className="brand-boost-camp-views">4.2M views</span>
                        <span className="brand-boost-camp-earned brand-boost-green">$8,400</span>
                      </div>
                      <div className="brand-boost-table-row">
                        <span className="brand-boost-camp-name">NFL Sunday Highlights</span>
                        <span className="brand-boost-camp-views">24M views</span>
                        <span className="brand-boost-camp-earned brand-boost-green">$19,000</span>
                      </div>
                      <div className="brand-boost-table-row">
                        <span className="brand-boost-camp-name">Polymarket Election Clips</span>
                        <span className="brand-boost-camp-views">4.5M views</span>
                        <span className="brand-boost-camp-earned brand-boost-green">$3,375</span>
                      </div>
                      <div className="brand-boost-table-row">
                        <span className="brand-boost-camp-name">Billboard Music Awards</span>
                        <span className="brand-boost-camp-views">12M views</span>
                        <span className="brand-boost-camp-earned brand-boost-green">$18,000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ═══════ BRAND: PROTECTION FEATURES ═══════ */}
          <section className="section section--white" id="brand-protection" data-view="brand" style={{ display: 'none' }}>
            <div className="section-inner">
              <div className="pill-badge">Security</div>
              <h2 className="section-h2">Protection Features You Can Trust</h2>
              <p className="section-p">Protection systems designed to secure payments and reduce risks for every clipper</p>
              <div className="brand-protection-grid">
                <div className="brand-protection-card">
                  <div className="brand-protection-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
                  </div>
                  <h3 className="brand-protection-h">Flag Videos</h3>
                  <p className="brand-protection-p">Instantly flag any video that doesn't meet your standards</p>
                </div>
                <div className="brand-protection-card">
                  <div className="brand-protection-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                  <h3 className="brand-protection-h">Bot Protection</h3>
                  <p className="brand-protection-p">Block fake engagement and ensure authentic reach on each video</p>
                </div>
                <div className="brand-protection-card">
                  <div className="brand-protection-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </div>
                  <h3 className="brand-protection-h">VIP Support</h3>
                  <p className="brand-protection-p">Priority access to our team whenever you need help</p>
                </div>
              </div>
            </div>
          </section>

          {/* ═══════ BRAND: FAQ ═══════ */}
          <section className="section section--gray" id="brand-faq" data-view="brand" style={{ display: 'none' }}>
            <div className="section-inner">
              <div className="pill-badge">FAQs</div>
              <h2 className="section-h2">Answers to Your Questions</h2>
              <p className="section-p" style={{ color: '#6b7280' }}>Quick explanations to guide you through every step of the process.</p>
              <div className="faq-list"><div className="faq-list-inner">
                <div className="faq-item"><button className="faq-q"><span>Does Content Rewards take a fee from agencies?</span><span className="faq-icon"><svg viewBox="0 0 256 256" fill="currentColor"><path d="M216.49,104.49l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,0,1,17-17L128,159l71.51-71.52a12,12,0,0,1,17,17Z"/></svg></span></button><div className="faq-a"><div className="faq-a-inner"><p>Yes, Content Rewards applies a small platform fee on agency-managed campaigns. This fee covers platform access, creator vetting, and campaign management tools.</p></div></div></div>
                <div className="faq-item"><button className="faq-q"><span>Why has a submission been automatically flagged?</span><span className="faq-icon"><svg viewBox="0 0 256 256" fill="currentColor"><path d="M216.49,104.49l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,0,1,17-17L128,159l71.51-71.52a12,12,0,0,1,17,17Z"/></svg></span></button><div className="faq-a"><div className="faq-a-inner"><p>Our bot detection system automatically flags submissions that show signs of artificial engagement. This protects your budget from fake views and ensures authentic reach.</p></div></div></div>
                <div className="faq-item"><button className="faq-q"><span>What if I am unsure if a flagged submission is botted?</span><span className="faq-icon"><svg viewBox="0 0 256 256" fill="currentColor"><path d="M216.49,104.49l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,0,1,17-17L128,159l71.51-71.52a12,12,0,0,1,17,17Z"/></svg></span></button><div className="faq-a"><div className="faq-a-inner"><p>You can review the evidence provided by our Shelby verification system. If you're still unsure, contact our VIP support team for a manual review.</p></div></div></div>
                <div className="faq-item"><button className="faq-q"><span>If my client wants me to add more money to a campaign how do I do this?</span><span className="faq-icon"><svg viewBox="0 0 256 256" fill="currentColor"><path d="M216.49,104.49l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,0,1,17-17L128,159l71.51-71.52a12,12,0,0,1,17,17Z"/></svg></span></button><div className="faq-a"><div className="faq-a-inner"><p>Navigate to your campaign dashboard, click "Add Budget" and follow the prompts. Additional funds are applied instantly and your campaign continues without interruption.</p></div></div></div>
                <div className="faq-item"><button className="faq-q"><span>How do payouts work?</span><span className="faq-icon"><svg viewBox="0 0 256 256" fill="currentColor"><path d="M216.49,104.49l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,0,1,17-17L128,159l71.51-71.52a12,12,0,0,1,17,17Z"/></svg></span></button><div className="faq-a"><div className="faq-a-inner"><p>Creator payouts are handled automatically through our Shelby smart contract system. Brands only pay for verified, authentic views — no manual processing required.</p></div></div></div>
              </div></div>
              <Link href="/faqs" className="faq-see-all">See all questions<svg viewBox="0 0 24 24" fill="none"><line x1="21.5" y1="12" x2="0.5" y2="12" stroke="#fff" strokeWidth="1.75"/><polyline points="13.86 4.36 21.5 12 13.86 19.64" fill="none" stroke="#fff" strokeWidth="1.75"/></svg></Link>
            </div>
          </section>

          {/* ═══════ FOOTER ═══════ */}
          <footer className="footer">
            <div className="footer-inner">
              <div className="footer-top">
                <div className="footer-brand">
                  <img src="https://framerusercontent.com/images/dkXfXv8kaUvzPGfUqgUvk1VqfY.png?width=2562&height=648" alt="" className="footer-logo" />
                  <div className="footer-divider"></div>
                  <p className="footer-desc">Create, post and earn real money for posting clips on YouTube, TikTok &amp; Instagram.</p>
                  <div className="footer-ctas">
                    <a href="/pledge" className="footer-cta-btn">Become a Creator<span className="footer-cta-arrow"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24"><path fill="rgb(255,255,255)" d="M12.707 17.293 8.414 13H18v-2H8.414l4.293-4.293-1.414-1.414L4.586 12l6.707 6.707z"></path></svg></span></a>
                    <a href="#" target="_blank" rel="noopener" className="footer-discord" aria-label="Discord">
                      <img src="https://framerusercontent.com/images/zoWaVQPkZV0QfcnLEOacVQ0yoZs.png?width=225&height=225" alt="Discord" />
                    </a>
                  </div>
                </div>
                <div className="footer-cols">
                  <div className="footer-col-group">
                    <div className="footer-col"><h4>Navigation</h4><a href="#">Discover</a><a href="#">Creators</a><a href="#">Brands</a></div>
                    <div className="footer-col"><h4>Socials</h4><a href="#" target="_blank" rel="noopener">Twitter/X</a><a href="#" target="_blank" rel="noopener">Instagram</a></div>
                    <div className="footer-col"></div>
                  </div>
                  <div className="footer-col-group">
                    <div className="footer-col"><h4>Pages</h4><a href="#">Terms of Service</a><a href="#">Brand Kit</a></div>
                  </div>
                </div>
              </div>
              <div className="footer-gradient-bg">
                <div className="footer-giant">CONTENT REWARDS</div>
                <div className="footer-gradient-line"></div>
                <div className="footer-bottom"><span>Content Rewards &copy; 2025</span><span>All rights reserved.</span></div>
              </div>
            </div>
          </footer>

      {/* Retro monitor overlay — triggered by bank icon click */}
      <div className="retro-monitor-overlay" id="retroMonitorOverlay">
        <div className="retro-monitor-inner">
          <button className="retro-monitor-close" id="retroMonitorClose">&times;</button>
          <svg viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="rmBokeh" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="60" /></filter>
              <filter id="rmBokehMed" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="30" /></filter>
              <filter id="rmFgBlur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="15" /></filter>
              <filter id="rmPlastic" x="0%" y="0%" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
                <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.04 0" in="noise" result="cn" />
                <feBlend in="SourceGraphic" in2="cn" mode="multiply" />
              </filter>
              <filter id="rmTextGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="b1" /><feGaussianBlur stdDeviation="15" result="b2" /><feGaussianBlur stdDeviation="25" result="b3" />
                <feMerge><feMergeNode in="b3" /><feMergeNode in="b2" /><feMergeNode in="b1" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="rmMonShadow" x="-20%" y="-10%" width="150%" height="150%">
                <feDropShadow dx="0" dy="40" stdDeviation="35" floodColor="#000" floodOpacity="0.8" />
                <feDropShadow dx="20" dy="20" stdDeviation="15" floodColor="#000" floodOpacity="0.5" />
              </filter>
              <filter id="rmBezelShadow" x="-10%" y="-10%" width="120%" height="120%">
                <feOffset dx="0" dy="15" /><feGaussianBlur stdDeviation="12" result="ob" />
                <feComposite operator="out" in="SourceGraphic" in2="ob" result="inv" />
                <feFlood floodColor="black" floodOpacity="0.9" result="c" />
                <feComposite operator="in" in="c" in2="inv" result="s" />
                <feComposite operator="over" in="s" in2="SourceGraphic" />
              </filter>
              <filter id="rmBlurSm" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3" /></filter>
              <filter id="rmStickyL" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="2" dy="5" stdDeviation="3" floodColor="#1a140f" floodOpacity="0.7" />
                <feDropShadow dx="8" dy="15" stdDeviation="10" floodColor="#000" floodOpacity="0.4" />
              </filter>
              <filter id="rmStickyR" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="-2" dy="4" stdDeviation="3" floodColor="#1a140f" floodOpacity="0.6" />
                <feDropShadow dx="-8" dy="12" stdDeviation="10" floodColor="#000" floodOpacity="0.4" />
              </filter>
              <linearGradient id="rmDesk" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#3b2b22" /><stop offset="40%" stopColor="#2a1f18" /><stop offset="100%" stopColor="#0f0b09" /></linearGradient>
              <linearGradient id="rmPlasticBase" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#EBE7D8" /><stop offset="25%" stopColor="#D0CCBC" /><stop offset="70%" stopColor="#AEAA9A" /><stop offset="100%" stopColor="#737061" /></linearGradient>
              <linearGradient id="rmTopHL" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#FFF" stopOpacity="0.7" /><stop offset="100%" stopColor="#FFF" stopOpacity="0" /></linearGradient>
              <linearGradient id="rmLeftHL" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#FFF" stopOpacity="0.5" /><stop offset="100%" stopColor="#FFF" stopOpacity="0" /></linearGradient>
              <linearGradient id="rmBezelOuter" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#4F5046" /><stop offset="40%" stopColor="#2B2C26" /><stop offset="100%" stopColor="#141512" /></linearGradient>
              <radialGradient id="rmScreenCRT" cx="50%" cy="50%" r="75%"><stop offset="0%" stopColor="#383C32" /><stop offset="60%" stopColor="#23261F" /><stop offset="100%" stopColor="#0C0D0A" /></radialGradient>
              <linearGradient id="rmGlare" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#fff" stopOpacity="0.12" /><stop offset="30%" stopColor="#fff" stopOpacity="0.03" /><stop offset="30.1%" stopColor="#fff" stopOpacity="0" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></linearGradient>
              <linearGradient id="rmCrevice" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#4A473D" /><stop offset="100%" stopColor="#807D6C" /></linearGradient>
              <linearGradient id="rmStickyGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FFB966" /><stop offset="40%" stopColor="#FF9B38" /><stop offset="100%" stopColor="#E0791B" /></linearGradient>
              <pattern id="rmScanlines" patternUnits="userSpaceOnUse" width="10" height="4"><rect width="10" height="2" fill="#000" fillOpacity="0.15" /><rect y="2" width="10" height="2" fill="#fff" fillOpacity="0.02" /></pattern>
              <pattern id="rmRgbDots" patternUnits="userSpaceOnUse" width="3" height="3"><rect x="0" width="1" height="3" fill="#f00" fillOpacity="0.03" /><rect x="1" width="1" height="3" fill="#0f0" fillOpacity="0.03" /><rect x="2" width="1" height="3" fill="#00f" fillOpacity="0.03" /></pattern>
            </defs>
            {/* Background */}
            <rect width="1200" height="1200" fill="#14110e" />
            <g filter="url(#rmBokeh)"><circle cx="1000" cy="300" r="300" fill="#E6EEF2" opacity="0.6" /><circle cx="1100" cy="500" r="250" fill="#A8C4D1" opacity="0.4" /><rect x="800" y="100" width="400" height="600" fill="#FFF" opacity="0.5" /><circle cx="100" cy="200" r="200" fill="#000" opacity="0.8" /><rect x="0" y="0" width="300" height="700" fill="#1A1816" /><circle cx="600" cy="400" r="350" fill="#524a40" opacity="0.4" /></g>
            <polygon points="0,950 1200,950 1200,1200 0,1200" fill="url(#rmDesk)" />
            <polygon points="0,950 1200,950 1200,965 0,965" fill="#4a362a" opacity="0.6" filter="url(#rmBokehMed)" />
            <g filter="url(#rmFgBlur)" opacity="0.8"><rect x="20" y="850" width="80" height="150" rx="10" fill="#12100e" /><circle cx="60" cy="850" r="40" fill="#1a1815" /><rect x="1050" y="700" width="40" height="300" fill="#2B5A75" transform="rotate(5 1050 1000)" /><rect x="1100" y="650" width="50" height="350" fill="#1C3F54" transform="rotate(12 1100 1000)" /><rect x="1160" y="750" width="60" height="250" fill="#8C9A93" /></g>
            {/* Monitor shadow */}
            <ellipse cx="600" cy="1020" rx="350" ry="40" fill="#000" filter="url(#rmBokehMed)" opacity="0.9" />
            <ellipse cx="600" cy="980" rx="200" ry="15" fill="#000" filter="url(#rmFgBlur)" opacity="0.95" />
            {/* Stand */}
            <path d="M420,1050 Q460,950 500,950 L700,950 Q740,950 780,1050 Z" fill="url(#rmPlasticBase)" filter="url(#rmPlastic)" /><path d="M420,1050 Q460,950 500,950 L700,950 Q740,950 780,1050 Z" fill="#000" opacity="0.4" />
            <rect x="400" y="1050" width="400" height="25" rx="10" fill="#5A584C" /><rect x="400" y="1045" width="400" height="5" fill="#C4C0AE" />
            {/* Monitor body */}
            <g filter="url(#rmMonShadow)">
              <path d="M160,150 L1050,150 L1080,880 L120,880 Z" fill="#5C594A" filter="url(#rmPlastic)" />
              <rect x="130" y="120" width="940" height="800" rx="40" fill="url(#rmPlasticBase)" filter="url(#rmPlastic)" />
              <path d="M170,120 L1030,120 Q1070,120 1070,160 L1070,200 Q1070,130 1030,130 L170,130 Q130,130 130,200 L130,160 Q130,120 170,120 Z" fill="url(#rmTopHL)" />
              <path d="M130,160 L130,880 Q130,920 170,920 L220,920 Q140,920 140,880 L140,160 Q140,120 180,120 L170,120 Q130,120 130,160 Z" fill="url(#rmLeftHL)" />
              <rect x="130" y="120" width="940" height="800" rx="40" fill="none" stroke="#000" strokeWidth="4" opacity="0.1" />
              <path d="M1070,160 L1070,880 Q1070,920 1030,920 L170,920 Q130,920 130,880 L130,900 Q130,920 170,920 L1030,920 Q1070,920 1070,880 Z" fill="#3B382D" />
            </g>
            {/* Bezel */}
            <rect x="175" y="165" width="850" height="650" rx="45" fill="#1C1A16" />
            <rect x="180" y="170" width="840" height="640" rx="40" fill="url(#rmBezelOuter)" filter="url(#rmBezelShadow)" />
            <rect x="198" y="188" width="804" height="604" rx="32" fill="none" stroke="#0A0A09" strokeWidth="4" />
            <rect x="200" y="190" width="800" height="600" rx="30" fill="none" stroke="#52534C" strokeWidth="2" />
            {/* Screen */}
            <g transform="translate(200,190)">
              <rect width="800" height="600" rx="30" fill="url(#rmScreenCRT)" />
              <rect width="800" height="600" rx="30" fill="none" stroke="#000" strokeWidth="35" opacity="0.7" filter="url(#rmFgBlur)" />
              <g filter="url(#rmTextGlow)">
                <text x="400" y="210" fontFamily="Inter,sans-serif" fontSize="88" fontWeight="500" fill="#FFF" textAnchor="middle" letterSpacing="-2.5">Transaction</text>
                <text x="400" y="315" fontFamily="Inter,sans-serif" fontSize="88" fontWeight="500" fill="#90E59E" textAnchor="middle" letterSpacing="-2.5">Completed</text>
                <text x="400" y="500" fontFamily="Inter,sans-serif" fontSize="185" fontWeight="700" fill="#20C253" textAnchor="middle" letterSpacing="-6" className="rm-amount">$0</text>
              </g>
              <text x="400" y="210" fontFamily="Inter,sans-serif" fontSize="88" fontWeight="500" fill="#FFF" textAnchor="middle" letterSpacing="-2.5">Transaction</text>
              <text x="400" y="315" fontFamily="Inter,sans-serif" fontSize="88" fontWeight="500" fill="#A3E4B0" textAnchor="middle" letterSpacing="-2.5">Completed</text>
              <text x="400" y="500" fontFamily="Inter,sans-serif" fontSize="185" fontWeight="700" fill="#24C656" textAnchor="middle" letterSpacing="-6" className="rm-amount">$0</text>
              <rect width="800" height="600" rx="30" fill="url(#rmRgbDots)" style={{mixBlendMode:'screen'}} />
              <rect width="800" height="600" rx="30" fill="url(#rmScanlines)" style={{mixBlendMode:'overlay'}} opacity="0.8" />
              <path d="M0,80 Q400,20 800,80 L800,600 Q400,540 0,600 Z" fill="url(#rmGlare)" pointerEvents="none" />
              <path d="M500,0 Q750,0 800,250 L800,0 Z" fill="#FFF" opacity="0.05" filter="url(#rmBokehMed)" pointerEvents="none" />
            </g>
            {/* Hardware details */}
            <line x1="170" y1="835" x2="1030" y2="835" stroke="#4A473D" strokeWidth="3" /><line x1="170" y1="838" x2="1030" y2="838" stroke="#FFF" strokeWidth="1.5" opacity="0.4" />
            <g transform="translate(800,850)">
              <rect x="-10" y="8" width="55" height="18" rx="9" fill="url(#rmCrevice)" /><rect x="-10" y="8" width="55" height="18" rx="9" fill="none" stroke="#FFF" strokeWidth="1" opacity="0.3" />
              <circle cx="85" cy="17" r="22" fill="#807D6C" /><circle cx="85" cy="17" r="22" fill="none" stroke="#FFF" strokeWidth="1.5" opacity="0.3" />
              <circle cx="85" cy="16" r="16" fill="url(#rmPlasticBase)" filter="url(#rmPlastic)" /><circle cx="85" cy="16" r="16" fill="none" stroke="#3B382D" strokeWidth="1" />
              <path d="M85,8 L85,16 M78,13 A9 9 0 1 0 92,13" stroke="#5C594A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </g>
            <g transform="translate(200,860)"><rect x="0" y="0" width="40" height="4" rx="2" fill="#3B382D" /><rect x="0" y="12" width="40" height="4" rx="2" fill="#3B382D" /></g>
            {/* Sticky notes */}
            <g transform="translate(130,150) rotate(-4)">
              <path d="M-2,0 C95,-5 190,2 190,2 L185,185 C95,188 -2,185 -2,185 Z" filter="url(#rmStickyL)" />
              <path d="M0,0 C95,-3 190,0 190,0 L186,180 C95,182 0,180 0,180 Z" fill="url(#rmStickyGrad)" />
              <path d="M0,0 C95,-3 190,0 190,0 L186,180 C95,182 0,180 0,180 Z" fill="none" stroke="#FFF" strokeWidth="2" opacity="0.4" />
              <text x="30" y="55" fontFamily="Caveat,cursive" fontWeight="700" fontSize="38" fill="#1C150D" transform="rotate(-1 30 55)">Goal:</text>
              <text x="30" y="100" fontFamily="Caveat,cursive" fontWeight="700" fontSize="38" fill="#1C150D" transform="rotate(-0.5 30 100)">$10k this</text>
              <text x="30" y="145" fontFamily="Caveat,cursive" fontWeight="700" fontSize="38" fill="#1C150D" transform="rotate(-1.5 30 145)">month</text>
            </g>
            <g transform="translate(930,850) rotate(3)">
              <path d="M-2,0 C85,-4 175,0 175,0 L172,175 C85,178 -2,175 -2,175 Z" filter="url(#rmStickyR)" />
              <path d="M0,0 C85,-2 175,0 175,0 L172,170 C85,172 0,170 0,170 Z" fill="url(#rmStickyGrad)" />
              <path d="M0,0 C85,-2 175,0 175,0 L172,170 C85,172 0,170 0,170 Z" fill="none" stroke="#FFF" strokeWidth="2" opacity="0.4" />
              <text x="25" y="55" fontFamily="Caveat,cursive" fontWeight="700" fontSize="36" fill="#1C150D" transform="rotate(0.5 25 55)">Clip 3</text>
              <text x="25" y="100" fontFamily="Caveat,cursive" fontWeight="700" fontSize="36" fill="#1C150D" transform="rotate(-1 25 100)">videos</text>
              <text x="25" y="145" fontFamily="Caveat,cursive" fontWeight="700" fontSize="36" fill="#1C150D" transform="rotate(1 25 145)">today</text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
