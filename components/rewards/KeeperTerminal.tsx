"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

/* ── Types ── */

interface TerminalLine {
  text: string;
  color?: string;
}

/* ── Helpers ── */

function formatUsd(octas: number): string {
  return (octas / 1e6).toFixed(2);
}

/* ── Build tab data from live packs ── */

function buildTabData(
  packs: any[],
  subs: any[],
  resolveVideoLabel: (p: any) => string,
  trackingCount: number,
): { label: string; command: string; lines: TerminalLine[] }[] {
  const sorted = [...packs].sort(
    (a, b) => new Date(a.generatedAt).getTime() - new Date(b.generatedAt).getTime()
  );

  // ── Latest ──
  const recent = sorted.slice(-12);
  const latestLines: TerminalLine[] = [
    { text: `keeper v1.0 — watching ${trackingCount} clips — ${packs.length} packs`, color: "text-zinc-500" },
    { text: "" },
  ];
  for (const p of recent) {
    const vid = resolveVideoLabel(p);
    const views = (p.viewCount || 0).toLocaleString();
    const paid = (p.payoutCreator || 0) > 0;
    const hasShelby = !!p.shelbyBlobName;
    const bot = p.botScore ?? 0;
    const prev = sorted.slice(0, sorted.indexOf(p)).reverse().find((pp: any) => pp.submissionAddress === p.submissionAddress);
    const delta = prev?.viewCount && p.viewCount ? p.viewCount - prev.viewCount : 0;
    const d = new Date(p.generatedAt);
    const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

    latestLines.push({ text: `[${time}] ${vid}  ${views} views${delta > 0 ? ` (+${delta.toLocaleString()})` : ""}`, color: "text-zinc-300" });
    const botColor = bot > 60 ? "text-red-400" : bot > 30 ? "text-yellow-400" : "text-green-400";
    latestLines.push({ text: `  bot ${bot}/100 ${bot < 30 ? "✓" : bot < 60 ? "⚠" : "✗"}${paid ? `  +$${formatUsd(p.payoutCreator)} USDT` : ""}${hasShelby ? "  → shelby" : ""}`, color: paid ? "text-green-400" : botColor });
  }

  // ── Payouts ──
  const payoutPacks = sorted.filter((p) => (p.payoutCreator || 0) > 0);
  const payoutLines: TerminalLine[] = [];
  if (payoutPacks.length === 0) {
    payoutLines.push({ text: "No payouts yet. Views accumulating toward minimum.", color: "text-zinc-500" });
  } else {
    let total = 0;
    for (const p of payoutPacks) {
      const vid = resolveVideoLabel(p);
      const amt = p.payoutCreator || 0;
      total += amt;
      payoutLines.push({ text: `${vid}  +$${formatUsd(amt)} USDT  (${(p.viewCount || 0).toLocaleString()} views)`, color: "text-green-400" });
      if (p.txHash) payoutLines.push({ text: `  tx: ${p.txHash.slice(0, 24)}...`, color: "text-zinc-600" });
    }
    payoutLines.push({ text: "" });
    payoutLines.push({ text: `Total: $${formatUsd(total)} USDT paid to creators`, color: "text-green-400" });
  }

  // ── Shelby ──
  const shelbyPacks = sorted.filter((p) => !!p.shelbyBlobName);
  const blobs = [...new Set(shelbyPacks.map((p) => p.shelbyBlobName))];
  const shelbyLines: TerminalLine[] = [
    { text: `${shelbyPacks.length} packs stored · ${blobs.length} rollup blobs`, color: "text-[#FA4616]" },
    { text: "" },
  ];
  for (const blob of blobs.slice(-5)) {
    if (!blob) continue;
    const count = shelbyPacks.filter((p) => p.shelbyBlobName === blob).length;
    shelbyLines.push({ text: `${blob.slice(0, 45)}...`, color: "text-[#FA4616]" });
    shelbyLines.push({ text: `  ${count} packs in rollup`, color: "text-zinc-500" });
  }
  shelbyLines.push({ text: "" });
  shelbyLines.push({ text: "✓ Immutably stored. Cannot be changed or deleted.", color: "text-green-400" });

  // ── Bots ──
  const botLines: TerminalLine[] = [
    { text: "5-signal bot detection:", color: "text-zinc-400" },
    { text: "  velocity · engagement · account age · view/follow · shares", color: "text-zinc-600" },
    { text: "  0–100 score  |  ≥85 flagged  |  <30 clean", color: "text-zinc-600" },
    { text: "" },
  ];
  for (const s of subs.filter((s: any) => s.botScore != null)) {
    const score = s.botScore || 0;
    const vid = s.contentUrl?.match(/shorts\/([^/?]+)/)?.[1] || s.address?.slice(2, 12) || "?";
    const color = score >= 85 ? "text-red-400" : score >= 30 ? "text-yellow-400" : "text-green-400";
    botLines.push({ text: `${vid}  bot:${score}/100  ${score < 30 ? "✓ clean" : score < 60 ? "⚠ moderate" : "✗ flagged"}`, color });
  }

  return [
    { label: "latest", command: "keeper --watch", lines: latestLines },
    { label: "payouts", command: "keeper --payouts", lines: payoutLines },
    { label: "shelby", command: "keeper --evidence", lines: shelbyLines },
    { label: "bots", command: "keeper --bot-scores", lines: botLines },
  ];
}

/* ── Typing hook: types command, then reveals lines one by one, then stops ── */

function useTypingAnimation(command: string, lines: TerminalLine[]) {
  const [typedCmd, setTypedCmd] = useState("");
  const [visibleLines, setVisibleLines] = useState(0);
  const [phase, setPhase] = useState<"typing" | "revealing" | "done">("typing");
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const reset = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setTypedCmd("");
    setVisibleLines(0);
    setPhase("typing");

    let i = 0;
    const typeChar = () => {
      if (i <= command.length) {
        setTypedCmd(command.slice(0, i));
        i++;
        timeoutsRef.current.push(setTimeout(typeChar, 20 + Math.random() * 25));
      } else {
        setPhase("revealing");
        let line = 0;
        const revealLine = () => {
          if (line <= lines.length) {
            setVisibleLines(line);
            line++;
            timeoutsRef.current.push(setTimeout(revealLine, 15));
          } else {
            setPhase("done");
          }
        };
        timeoutsRef.current.push(setTimeout(revealLine, 150));
      }
    };
    timeoutsRef.current.push(setTimeout(typeChar, 200));
  }, [command, lines.length]);

  useEffect(() => {
    reset();
    return () => timeoutsRef.current.forEach(clearTimeout);
  }, [reset]);

  return { typedCmd, visibleLines, phase };
}

/* ── Main component ── */

export function KeeperTerminal({
  packs,
  subs,
  resolveVideoLabel,
  trackingCount,
  totalPayouts,
}: {
  packs: any[];
  subs: any[];
  resolveVideoLabel: (p: any) => string;
  trackingCount: number;
  totalPayouts: number;
}) {
  const [activeTab, setActiveTab] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const tabs = useMemo(
    () => buildTabData(packs, subs, resolveVideoLabel, trackingCount),
    [packs, subs, resolveVideoLabel, trackingCount],
  );

  const currentTab = tabs[activeTab] || tabs[0];
  const { typedCmd, visibleLines, phase } = useTypingAnimation(currentTab.command, currentTab.lines);

  // Auto-scroll as lines appear and when done
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleLines, phase]);

  return (
    <div
      className="rounded-[18px] relative"
      style={{
        background: "var(--background)",
        border: "1px solid transparent",
        backgroundImage: "linear-gradient(var(--background), var(--background)), linear-gradient(38deg, #212121 67%, rgb(176, 73, 0) 89%, rgb(232, 147, 0) 104%)",
        backgroundOrigin: "border-box",
        backgroundClip: "padding-box, border-box",
      }}
    >
      {/* Dot pattern */}
      <div
        className="absolute inset-0 rounded-[18px] pointer-events-none z-[1]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255, 255, 255, 0.07) 1.2px, transparent 1.2px)",
          backgroundSize: "10px 10px",
          opacity: 0.4,
        }}
      />

      <div className="relative z-[3]">
        {/* Title bar */}
        <div className="flex items-center gap-3 px-4 sm:px-5 pt-4 pb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-[11px] sm:text-[12px] text-zinc-600" style={{ fontFamily: "'Geist Mono', 'SF Mono', 'Fira Code', monospace" }}>
            keeper &mdash; {packs.length} evidence packs
          </span>
          <div className="flex-1" />
          {/* Live / Done status */}
          {phase === "done" ? (
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
              </span>
              <span className="text-[10px] sm:text-[11px] text-green-400" style={{ fontFamily: "'Geist Mono', monospace" }}>
                LIVE
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full border-2 border-[#FA4616] border-t-transparent animate-spin" />
              <span className="text-[10px] sm:text-[11px] text-zinc-500" style={{ fontFamily: "'Geist Mono', monospace" }}>
                scanning...
              </span>
            </div>
          )}
        </div>

        {/* Terminal body — fixed height, internal scroll */}
        <div
          ref={scrollRef}
          className="overflow-y-auto no-scrollbar px-4 sm:px-5 pb-3"
          style={{ maxHeight: 320, fontFamily: "'Geist Mono', 'SF Mono', 'Fira Code', 'Cascadia Code', monospace" }}
        >
          {/* Command line */}
          <div className="flex items-center gap-2 py-1">
            <span className="text-zinc-600 text-[12px] sm:text-[13px] select-none">$</span>
            <span className="text-white text-[12px] sm:text-[13px] font-medium">{typedCmd}</span>
            {phase === "typing" && (
              <span className="inline-block w-[7px] h-[15px] bg-[#FA4616]/70 translate-y-[1px] animate-caret-blink" />
            )}
          </div>

          {/* Output lines — stay visible once printed */}
          {phase !== "typing" && currentTab.lines.slice(0, visibleLines).map((line, i) => (
            <div key={i} className="py-[1px]">
              <span className={cn("text-[12px] sm:text-[13px]", line.color ?? "text-zinc-500")}>
                {line.text || "\u00A0"}
              </span>
            </div>
          ))}

          {/* Trailing prompt after done */}
          {phase === "done" && (
            <div className="flex items-center gap-2 py-1 mt-1">
              <span className="text-zinc-600 text-[12px] sm:text-[13px] select-none">$</span>
              <span className="inline-block w-[7px] h-[15px] bg-[#FA4616]/70 translate-y-[1px] animate-caret-blink" />
            </div>
          )}

          {/* Scroll anchor — ensures auto-scroll reveals the cursor fully */}
          <div className="h-3" />
        </div>

        {/* Tab bar */}
        <div className="flex justify-center py-3 border-t border-white/[0.04]">
          <div className="inline-flex items-center gap-0 rounded-lg border border-white/[0.06] bg-white/[0.03] px-1 py-1">
            {tabs.map((tab, i) => (
              <button
                key={tab.label}
                type="button"
                onClick={() => setActiveTab(i)}
                className={cn(
                  "cursor-pointer rounded-md px-3 py-1 text-[11px] sm:text-[12px] transition-all duration-150",
                  i === activeTab
                    ? "bg-[#FA4616] font-medium text-[#0a0a0a]"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
                style={{ fontFamily: "'Geist Mono', monospace" }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
