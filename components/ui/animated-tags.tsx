"use client";

import { motion, useReducedMotion } from "motion/react";

export interface AnimatedTagsProps {
  tags: { key: string; label: string; sub?: string }[];
  selected: string;
  onSelect: (key: string) => void;
  layoutId?: string;
  className?: string;
}

export function AnimatedTags({
  tags,
  selected,
  onSelect,
  layoutId = "animated-tags-bg",
  className,
}: AnimatedTagsProps) {
  const shouldReduce = useReducedMotion();

  return (
    <div className={`flex flex-wrap gap-1 ${className ?? ""}`}>
      {tags.map((tag) => {
        const isSelected = tag.key === selected;
        return (
          <button
            key={tag.key}
            onClick={() => onSelect(tag.key)}
            className={`relative px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
              isSelected ? "text-[#FA4616]" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {isSelected && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-[#FA4616]/10"
                transition={
                  shouldReduce
                    ? { duration: 0 }
                    : { type: "spring", duration: 0.3, bounce: 0.15 }
                }
              />
            )}
            <span style={{ position: "relative", zIndex: 1 }}>
              {tag.label}
              {tag.sub && (
                <span className="ml-1.5 text-[10px] opacity-50 font-mono">
                  {tag.sub}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
