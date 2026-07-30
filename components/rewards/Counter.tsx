"use client";

import { motion, useSpring, useTransform } from "motion/react";
import { useEffect } from "react";

/* ── Single digit column (rolling number strip) ─────────────── */

function Number({
  mv,
  number,
  height,
}: {
  mv: ReturnType<typeof useSpring>;
  number: number;
  height: number;
}) {
  const y = useTransform(mv, (latest) => {
    const placeValue = latest % 10;
    const offset = (10 + number - placeValue) % 10;
    let memo = offset * height;
    if (offset > 5) {
      memo -= 10 * height;
    }
    return memo;
  });

  return (
    <motion.span
      style={{
        y,
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {number}
    </motion.span>
  );
}

/* ── Helpers ─────────────────────────────────────────────────── */

function normalizeNearInteger(num: number) {
  const nearest = Math.round(num);
  const tolerance = 1e-9 * Math.max(1, Math.abs(num));
  return Math.abs(num - nearest) < tolerance ? nearest : num;
}

function getValueRoundedToPlace(value: number, place: number) {
  const scaled = value / place;
  return Math.floor(normalizeNearInteger(scaled));
}

/* ── Single digit or decimal point ──────────────────────────── */

function Digit({
  place,
  value,
  height,
  digitStyle,
}: {
  place: number | ".";
  value: number;
  height: number;
  digitStyle?: React.CSSProperties;
}) {
  const isDecimal = place === ".";
  const valueRoundedToPlace = isDecimal ? 0 : getValueRoundedToPlace(value, place as number);
  const animatedValue = useSpring(valueRoundedToPlace);

  useEffect(() => {
    if (!isDecimal) {
      animatedValue.set(valueRoundedToPlace);
    }
  }, [animatedValue, valueRoundedToPlace, isDecimal]);

  if (isDecimal) {
    return (
      <span
        style={{
          position: "relative",
          height,
          fontVariantNumeric: "tabular-nums",
          width: "fit-content",
          ...digitStyle,
        }}
      >
        .
      </span>
    );
  }

  return (
    <span
      style={{
        position: "relative",
        width: "1ch",
        height,
        fontVariantNumeric: "tabular-nums",
        ...digitStyle,
      }}
    >
      {Array.from({ length: 10 }, (_, i) => (
        <Number key={i} mv={animatedValue} number={i} height={height} />
      ))}
    </span>
  );
}

/* ── Main Counter ───────────────────────────────────────────── */

export default function Counter({
  value,
  fontSize = 36,
  padding = 0,
  places,
  gap = 4,
  borderRadius = 4,
  horizontalPadding = 0,
  textColor = "inherit",
  fontWeight = "inherit",
  containerStyle,
  counterStyle,
  digitStyle,
  gradientHeight = 0,
  gradientFrom = "transparent",
  gradientTo = "transparent",
  topGradientStyle,
  bottomGradientStyle,
}: {
  value: number;
  fontSize?: number;
  padding?: number;
  places?: (number | ".")[];
  gap?: number;
  borderRadius?: number;
  horizontalPadding?: number;
  textColor?: string;
  fontWeight?: string | number;
  containerStyle?: React.CSSProperties;
  counterStyle?: React.CSSProperties;
  digitStyle?: React.CSSProperties;
  gradientHeight?: number;
  gradientFrom?: string;
  gradientTo?: string;
  topGradientStyle?: React.CSSProperties;
  bottomGradientStyle?: React.CSSProperties;
}) {
  // Auto-compute places from value if not provided
  const computedPlaces: (number | ".")[] =
    places ??
    (() => {
      const str = value.toString();
      const chars = [...str];
      const dotIdx = chars.indexOf(".");
      return chars.map((ch, i) => {
        if (ch === ".") return "." as const;
        if (dotIdx === -1) return 10 ** (chars.length - i - 1);
        if (i < dotIdx) return 10 ** (dotIdx - i - 1);
        return 10 ** -(i - dotIdx);
      });
    })();

  const height = fontSize + padding;

  const defaultCounterStyle: React.CSSProperties = {
    fontSize,
    gap,
    borderRadius,
    paddingLeft: horizontalPadding,
    paddingRight: horizontalPadding,
    color: textColor,
    fontWeight,
    display: "flex",
    overflow: "hidden",
    lineHeight: 1,
  };

  const defaultTopGradientStyle: React.CSSProperties = {
    height: gradientHeight,
    background: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})`,
  };

  const defaultBottomGradientStyle: React.CSSProperties = {
    height: gradientHeight,
    background: `linear-gradient(to top, ${gradientFrom}, ${gradientTo})`,
    position: "absolute" as const,
    bottom: 0,
    width: "100%",
  };

  return (
    <span style={{ position: "relative", display: "inline-block", ...containerStyle }}>
      <span style={{ ...defaultCounterStyle, ...counterStyle }}>
        {computedPlaces.map((place, idx) => (
          <Digit key={`${place}-${idx}`} place={place} value={value} height={height} digitStyle={digitStyle} />
        ))}
      </span>
      {gradientHeight > 0 && (
        <span
          style={{
            pointerEvents: "none",
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
          }}
        >
          <span style={topGradientStyle ?? defaultTopGradientStyle} />
          <span style={bottomGradientStyle ?? defaultBottomGradientStyle} />
        </span>
      )}
    </span>
  );
}
