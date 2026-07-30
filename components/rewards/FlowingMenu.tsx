"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";
import { gsap } from "gsap";

export interface FlowingMenuItem {
  link: string;
  text: string;
  image?: string;
  visual?: ReactNode;
}

function MenuItem({
  link,
  text,
  image,
  visual,
  speed,
  textColor,
  marqueeBgColor,
  marqueeTextColor,
  borderColor,
}: FlowingMenuItem & {
  speed: number;
  textColor: string;
  marqueeBgColor: string;
  marqueeTextColor: string;
  borderColor: string;
}) {
  const itemRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const marqueeInnerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);
  const [repetitions, setRepetitions] = useState(6);
  const isTouchRef = useRef(false);
  const [active, setActive] = useState(false);

  const animationDefaults = { duration: 0.6, ease: "expo" };

  const distMetric = (x: number, y: number, x2: number, y2: number) =>
    (x - x2) ** 2 + (y - y2) ** 2;

  const findClosestEdge = (mx: number, my: number, w: number, h: number) =>
    distMetric(mx, my, w / 2, 0) < distMetric(mx, my, w / 2, h) ? "top" : "bottom";

  useEffect(() => {
    isTouchRef.current = window.matchMedia("(pointer: coarse)").matches;
  }, []);

  useEffect(() => {
    const calc = () => {
      if (!marqueeInnerRef.current) return;
      const part = marqueeInnerRef.current.querySelector<HTMLElement>(".fm-part");
      if (!part) return;
      const needed = Math.ceil(window.innerWidth / part.offsetWidth) + 2;
      setRepetitions(Math.max(6, needed));
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [text]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!marqueeInnerRef.current) return;
      const part = marqueeInnerRef.current.querySelector<HTMLElement>(".fm-part");
      if (!part || part.offsetWidth === 0) return;
      if (animationRef.current) animationRef.current.kill();
      animationRef.current = gsap.to(marqueeInnerRef.current, {
        x: -part.offsetWidth,
        duration: speed,
        ease: "none",
        repeat: -1,
      });
    }, 50);
    return () => {
      clearTimeout(timer);
      if (animationRef.current) animationRef.current.kill();
    };
  }, [text, repetitions, speed]);

  const showFrom = (edge: string) => {
    if (!marqueeRef.current || !marqueeInnerRef.current) return;
    gsap
      .timeline({ defaults: animationDefaults })
      .set(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0)
      .set(marqueeInnerRef.current, { y: edge === "top" ? "101%" : "-101%" }, 0)
      .to([marqueeRef.current, marqueeInnerRef.current], { y: "0%" }, 0);
  };

  const hideTo = (edge: string) => {
    if (!marqueeRef.current || !marqueeInnerRef.current) return;
    gsap
      .timeline({ defaults: animationDefaults })
      .to(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0)
      .to(marqueeInnerRef.current, { y: edge === "top" ? "101%" : "-101%" }, 0);
  };

  const handleMouseEnter = (ev: React.MouseEvent) => {
    if (isTouchRef.current || !itemRef.current) return;
    const r = itemRef.current.getBoundingClientRect();
    showFrom(findClosestEdge(ev.clientX - r.left, ev.clientY - r.top, r.width, r.height));
  };

  const handleMouseLeave = (ev: React.MouseEvent) => {
    if (isTouchRef.current || !itemRef.current) return;
    const r = itemRef.current.getBoundingClientRect();
    hideTo(findClosestEdge(ev.clientX - r.left, ev.clientY - r.top, r.width, r.height));
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isTouchRef.current) return;
    if (active) { hideTo("bottom"); setActive(false); }
    else { showFrom("top"); setActive(true); }
  };

  return (
    <div ref={itemRef} className="fm-item" style={{ borderColor }}>
      <a
        className="fm-link"
        href={link}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ color: textColor }}
      >
        {text}
      </a>
      <div className="fm-marquee" ref={marqueeRef} style={{ backgroundColor: marqueeBgColor }}>
        <div className="fm-marquee-inner-wrap">
          <div className="fm-marquee-inner" ref={marqueeInnerRef} aria-hidden="true">
            {[...Array(repetitions)].map((_, idx) => (
              <div className="fm-part" key={idx} style={{ color: marqueeTextColor }}>
                <span>{text}</span>
                {visual && <div className="fm-visual">{visual}</div>}
                {!visual && image && (
                  <div className="fm-img" style={{ backgroundImage: `url(${image})` }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FlowingMenu({
  items = [],
  speed = 15,
  textColor = "#fff",
  bgColor = "transparent",
  marqueeBgColor = "#FA4616",
  marqueeTextColor = "#0a0a0a",
  borderColor = "rgba(255,255,255,0.06)",
}: {
  items: FlowingMenuItem[];
  speed?: number;
  textColor?: string;
  bgColor?: string;
  marqueeBgColor?: string;
  marqueeTextColor?: string;
  borderColor?: string;
}) {
  return (
    <>
      <div className="fm-wrap" style={{ backgroundColor: bgColor }}>
        <nav className="fm-nav">
          {items.map((item, idx) => (
            <MenuItem
              key={idx}
              {...item}
              speed={speed}
              textColor={textColor}
              marqueeBgColor={marqueeBgColor}
              marqueeTextColor={marqueeTextColor}
              borderColor={borderColor}
            />
          ))}
        </nav>
      </div>
      <style>{`
        .fm-wrap { width: 100%; height: 100%; overflow: hidden; }
        .fm-nav { display: flex; flex-direction: column; height: 100%; margin: 0; padding: 0; }
        .fm-item { flex: 1; position: relative; overflow: hidden; text-align: center; border-top: 1px solid; }
        .fm-item:first-child { border-top: none; }
        .fm-link {
          display: flex; align-items: center; justify-content: center;
          height: 100%; position: relative; cursor: pointer;
          text-transform: uppercase; text-decoration: none;
          white-space: nowrap; font-weight: 600;
          font-size: clamp(13px, 2.5vh, 20px);
          letter-spacing: 0.08em;
          font-family: 'Space Grotesk', system-ui, sans-serif;
        }
        .fm-link:hover { color: inherit; }
        .fm-marquee {
          position: absolute; top: 0; left: 0; overflow: hidden;
          width: 100%; height: 100%; pointer-events: none;
          transform: translate3d(0, 101%, 0);
        }
        .fm-marquee-inner-wrap { height: 100%; width: 100%; overflow: hidden; }
        .fm-marquee-inner {
          display: flex; align-items: center; position: relative;
          height: 100%; width: fit-content; will-change: transform;
        }
        .fm-part { display: flex; align-items: center; flex-shrink: 0; gap: 1.5vw; }
        .fm-part > span {
          white-space: nowrap; text-transform: uppercase;
          font-weight: 500; font-size: clamp(12px, 2vh, 18px);
          line-height: 1; padding: 0 0.5vw;
          font-family: 'Space Grotesk', system-ui, sans-serif;
          letter-spacing: 0.06em;
        }
        .fm-visual {
          display: flex; align-items: center; flex-shrink: 0;
          margin: 0 1vw;
        }
        .fm-img {
          width: clamp(50px, 8vw, 100px);
          height: clamp(18px, 3vh, 30px);
          margin: 0 1vw;
          border-radius: 16px;
          background-size: cover;
          background-position: 50% 50%;
          opacity: 0.85;
        }
      `}</style>
    </>
  );
}
