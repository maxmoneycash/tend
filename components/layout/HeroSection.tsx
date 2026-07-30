"use client";

import { useState, useEffect, useRef } from "react";
import { GlobeDemo } from "@/components/send/GlobeDemo";
import { useInViewport } from "@/hooks/useInViewport";
import { usePageVisible } from "@/hooks/usePageVisible";

const SCENES = [
  { before: "The World's Largest ", highlight: "Internet Market", after: "" },
] as const;

const TYPE_SPEED = 28;
const PAUSE_BEFORE_ERASE = 1200;
const ERASE_SPEED = 12;

function useTypingCycle() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const phase = useRef<"typing" | "holding" | "erasing">("typing");
  const idx = useRef(0);

  const scene = SCENES[sceneIndex];
  const fullText = scene.before + scene.highlight + scene.after;

  useEffect(() => {
    phase.current = "typing";
    idx.current = 0;
    setCharCount(0);

    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      if (phase.current === "typing") {
        idx.current += 1;
        setCharCount(idx.current);
        if (idx.current >= fullText.length) {
          // Done typing — stay put
          return;
        } else {
          const char = fullText[idx.current];
          const delay = char === " " ? TYPE_SPEED * 2.2 : TYPE_SPEED + Math.random() * 15;
          timer = setTimeout(tick, delay);
        }
        return;
      }

      if (phase.current === "holding") {
        phase.current = "erasing";
        timer = setTimeout(tick, ERASE_SPEED);
        return;
      }

      idx.current -= 1;
      setCharCount(idx.current);
      if (idx.current <= 0) {
        setSceneIndex((prev) => (prev + 1) % SCENES.length);
      } else {
        timer = setTimeout(tick, ERASE_SPEED);
      }
    };

    timer = setTimeout(tick, 400);
    return () => clearTimeout(timer);
  }, [sceneIndex, fullText]);

  return { sceneIndex, charCount };
}

function TypedText({ sceneIndex, charCount }: { sceneIndex: number; charCount: number }) {
  const scene = SCENES[sceneIndex];
  const fullText = scene.before + scene.highlight + scene.after;
  const typed = fullText.slice(0, charCount);

  const hlStart = scene.before.length;
  const hlEnd = hlStart + scene.highlight.length;

  const parts: { text: string; orange: boolean }[] = [];

  if (charCount <= hlStart) {
    parts.push({ text: typed, orange: false });
  } else if (charCount <= hlEnd) {
    parts.push({ text: typed.slice(0, hlStart), orange: false });
    parts.push({ text: typed.slice(hlStart), orange: true });
  } else {
    parts.push({ text: typed.slice(0, hlStart), orange: false });
    parts.push({ text: typed.slice(hlStart, hlEnd), orange: true });
    parts.push({ text: typed.slice(hlEnd), orange: false });
  }

  return (
    <>
      {parts.map((part, index) =>
        part.orange ? (
          <span key={index} className="text-gradient-whop">
            {part.text}
          </span>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </>
  );
}

export function HeroSection() {
  const { sceneIndex, charCount } = useTypingCycle();
  const [mounted, setMounted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const pageVisible = usePageVisible();
  const inViewport = useInViewport(sectionRef, { rootMargin: "160px" });
  const animationActive = mounted && pageVisible && inViewport;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section ref={sectionRef} className="pt-8 pb-4 sm:pt-16 sm:pb-8">
      <div className="mx-auto max-w-4xl">
        <div className="animate-enter animate-enter-delay-2 text-center">
          <div className="min-h-[60px] sm:min-h-[80px]">
            <h1 className="font-display text-[24px] font-bold leading-[1.1] tracking-[-0.03em] text-white sm:text-[32px] lg:text-[42px]">
              {mounted ? (
                <TypedText sceneIndex={sceneIndex} charCount={charCount} />
              ) : (
                SCENES[0].before + SCENES[0].highlight
              )}
              <span
                className="ml-0.5 inline-block h-[1em] w-[3px] rounded-sm align-middle"
                style={{
                  background: "#FA4616",
                  animation: "cursor-blink 0.8s step-end infinite",
                  boxShadow: "0 0 8px rgba(250,70,22,0.4)",
                }}
              />
            </h1>
          </div>
        </div>

        <div className="animate-enter animate-enter-delay-3 mt-2 sm:mt-4">
          <div className="mx-auto max-w-[560px]">
            <GlobeDemo active={animationActive} />
          </div>
        </div>
      </div>
    </section>
  );
}
