"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRef } from "react";

export interface PriceFlowProps {
  value: number;
  format?: (n: number) => string;
  className?: string;
}

function DigitSlot({
  char,
  prevChar,
  reduceMotion,
}: {
  char: string;
  prevChar: string;
  reduceMotion: boolean;
}) {
  const isDigit = /\d/.test(char);
  const prevIsDigit = /\d/.test(prevChar);
  const changed = char !== prevChar;

  if (!isDigit || !prevIsDigit || !changed || reduceMotion) {
    return <span style={{ display: "inline-block" }}>{char}</span>;
  }

  const goingUp = Number(char) > Number(prevChar);

  return (
    <span
      style={{
        display: "inline-block",
        overflow: "hidden",
        height: "1.15em",
        lineHeight: "1.15em",
        verticalAlign: "bottom",
      }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={char}
          style={{ display: "block" }}
          initial={{ y: goingUp ? "100%" : "-100%" }}
          animate={{ y: "0%" }}
          exit={{ y: goingUp ? "-100%" : "100%" }}
          transition={{ type: "spring", duration: 0.22, bounce: 0 }}
        >
          {char}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function PriceFlow({
  value,
  format = (n) => String(n),
  className,
}: PriceFlowProps) {
  const shouldReduce = useReducedMotion();
  const str = format(value);
  const prevRef = useRef(str);
  const prevStr = prevRef.current;
  prevRef.current = str;

  // Right-align comparison so digit rollover works (9→10 = "09"→"10")
  const maxLen = Math.max(str.length, prevStr.length);
  const paddedStr = str.padStart(maxLen);
  const paddedPrev = prevStr.padStart(maxLen);

  return (
    <span
      className={className}
      aria-label={str}
      style={{ display: "inline-flex", alignItems: "center" }}
    >
      {paddedStr.split("").map((char, i) => {
        if (char === " ") return null;
        return (
          <DigitSlot
            key={i}
            char={char}
            prevChar={paddedPrev[i] ?? " "}
            reduceMotion={!!shouldReduce}
          />
        );
      })}
    </span>
  );
}
