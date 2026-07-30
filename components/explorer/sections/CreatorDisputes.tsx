"use client";

import { motion } from "motion/react";
import { FadeInSection, SectionHeader } from "../shared";
import { DISPUTE_CATEGORIES } from "../constants";
import type { RedditPost, DisputeSummary } from "../types";

export function CreatorDisputes({
  disputes,
  disputeSummary,
}: {
  disputes: RedditPost[];
  disputeSummary: DisputeSummary | null;
}) {
  return (
    <FadeInSection>
      <div id="disputes" className="scroll-mt-24 bg-white/[0.01] -mx-4 px-4 py-8 sm:-mx-8 sm:px-8 rounded-3xl">
        <SectionHeader number="19" title="What Creators Say" subtitle="Dispute analysis from Reddit and Trustpilot" />

        {/* Astroturfing callout — security alert style */}
        <div className="px-5 py-4 rounded-2xl bg-red-500/[0.07] border border-red-500/[0.15] mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-red-500" />
          <div className="flex items-start gap-3">
            <span className="text-[20px] mt-0.5 shrink-0">&#9888;&#65039;</span>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-1 rounded text-[9px] font-bold bg-red-500/15 text-red-400 uppercase tracking-wider">
                  Critical Finding
                </span>
                <span className="text-[12px] text-red-400 font-bold">53% of Reddit &quot;disputes&quot; are fake</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                30 of 57 dispute posts are competitor spam from &quot;Reach Cat,&quot; posted by just 2 accounts (Mediocre-Neck-8460, Working_Ad_3155).
                After filtering astroturfing, genuine dispute volume is significantly lower than raw numbers suggest.
              </p>
            </div>
          </div>
        </div>

        {/* Genuine dispute breakdown — larger colored dots */}
        <div className="mb-6">
          <div className="text-[11px] text-zinc-600 uppercase tracking-wider mb-3 font-semibold">
            Genuine Dispute Categories (after spam filtering)
          </div>
          <div className="space-y-2">
            {DISPUTE_CATEGORIES.map((d) => {
              const maxCount = 22;
              const w = (d.count / maxCount) * 100;
              return (
                <div key={d.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color, opacity: 0.7 }} />
                      <span className="text-[11px] text-zinc-400">{d.name}</span>
                    </div>
                    <span className="text-[11px] text-zinc-300 font-mono font-bold">{d.count}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/[0.04] overflow-hidden ml-5">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${w}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: d.color, opacity: 0.5 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trend + top complaint */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="text-[10px] text-zinc-600 mb-1">Trend direction</div>
            <div className="text-[16px] font-bold text-red-400">INCREASING</div>
            <p className="text-[10px] text-zinc-600 mt-1">
              March 2026: 7 genuine disputes (highest single month). Dispute rate has climbed from ~4% to ~19% of posts.
            </p>
          </div>
          <div className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="text-[10px] text-zinc-600 mb-1">Top complaint</div>
            <div className="text-[14px] font-bold text-white">Unjustified bans</div>
            <p className="text-[10px] text-zinc-600 mt-1">
              Highest-scored dispute post (416 upvotes): &quot;Most of the mods in content rewards campaigns are insanely bad&quot;
            </p>
          </div>
        </div>

        {/* Summary stats from API */}
        {disputeSummary && (
          <div className="grid grid-cols-2 gap-2 mb-6">
            <div className="px-3 py-2 rounded-lg bg-white/[0.02]">
              <div className="text-[9px] text-zinc-600 mb-0.5">Reddit Disputes</div>
              <div className="text-[14px] text-white font-mono font-bold">
                {disputeSummary.reddit.dispute_posts}
              </div>
              <div className="text-[9px] text-zinc-600">
                of {disputeSummary.reddit.total_posts} posts
              </div>
            </div>
            <div className="px-3 py-2 rounded-lg bg-white/[0.02]">
              <div className="text-[9px] text-zinc-600 mb-0.5">Trustpilot Avg</div>
              <div className="text-[14px] text-white font-mono font-bold">
                {disputeSummary.trustpilot.avg_stars.toFixed(1)}
                <span className="text-[9px] text-zinc-600 ml-0.5">/5</span>
              </div>
              <div className="text-[9px] text-zinc-600">
                {disputeSummary.trustpilot.total_reviews} reviews
              </div>
            </div>
          </div>
        )}

        {/* Recent dispute posts from API */}
        {disputes.length > 0 && (
          <div>
            <div className="text-[10px] text-zinc-600 mb-2">Recent genuine disputes</div>
            <div className="space-y-1">
              {disputes.slice(0, 5).map((d) => (
                <a
                  key={d.id}
                  href={d.permalink ? `https://reddit.com${d.permalink}` : "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors group"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-[9px] text-zinc-700 font-mono shrink-0">
                      r/{d.subreddit}
                    </span>
                    <span className="text-[10px] text-zinc-400 truncate group-hover:text-white transition-colors">
                      {d.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-[9px] text-zinc-600 font-mono">
                      {d.score ?? 0}pts
                    </span>
                    <svg className="w-3 h-3 text-zinc-700 group-hover:text-zinc-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </FadeInSection>
  );
}
