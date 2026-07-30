"use client";

import type { CampaignFormState } from "./CampaignCreateWizard";
import { AnimatedTags } from "@/components/ui/animated-tags";

const CATEGORIES = [
  "Technology",
  "Gaming",
  "Finance",
  "Education",
  "Crypto",
  "Entertainment",
  "Lifestyle",
  "Other",
];

const TYPES = [
  { key: "0", label: "Clipping" },
  { key: "1", label: "UGC" },
  { key: "2", label: "Both" },
];

const PLATFORMS = [
  {
    id: 0,
    label: "YouTube",
    color: "text-[#ff0000]",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    id: 1,
    label: "TikTok",
    color: "text-[#00f2ea]",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
  },
  {
    id: 2,
    label: "Instagram",
    color: "text-[#e4405f]",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
  },
  {
    id: 3,
    label: "X",
    color: "text-white",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

interface Props {
  form: CampaignFormState;
  update: (patch: Partial<CampaignFormState>) => void;
}

export function StepBasicInfo({ form, update }: Props) {
  const togglePlatform = (id: number) => {
    const platforms = form.platforms.includes(id)
      ? form.platforms.filter((p) => p !== id)
      : [...form.platforms, id];
    update({ platforms });
  };

  return (
    <div className="space-y-5">
      {/* Campaign Name */}
      <div>
        <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
          Campaign Name <span className="text-red-400">*</span>
        </label>
        <input
          className="input-whop w-full px-3 py-2.5 text-[14px]"
          value={form.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder='e.g. "Shelby Fixes Creator Payouts"'
          maxLength={120}
        />
        <div className="text-[10px] text-zinc-600 mt-1 text-right">
          {form.name.length}/120
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
          Description
        </label>
        <textarea
          className="input-whop w-full px-3 py-2.5 text-[14px] min-h-[90px] resize-y"
          value={form.description}
          onChange={(e) => update({ description: e.target.value })}
          placeholder="Describe what kind of content you want creators to make..."
          maxLength={2000}
        />
        <div className="text-[10px] text-zinc-600 mt-1 text-right">
          {form.description.length}/2000
        </div>
      </div>

      {/* Category */}
      <div>
        <p className="text-[9px] font-medium text-zinc-600 uppercase tracking-wider mb-2.5">
          Category
        </p>
        <AnimatedTags
          tags={CATEGORIES.map((c) => ({ key: c, label: c }))}
          selected={form.category}
          onSelect={(k) => update({ category: k })}
          layoutId="category-bg"
        />
      </div>

      {/* Campaign Type */}
      <div>
        <p className="text-[9px] font-medium text-zinc-600 uppercase tracking-wider mb-2.5">
          Campaign Type <span className="text-red-400">*</span>
        </p>
        <AnimatedTags
          tags={TYPES}
          selected={String(form.campaignType)}
          onSelect={(k) => update({ campaignType: Number(k) })}
          layoutId="type-bg"
        />
      </div>

      {/* Platforms */}
      <div>
        <p className="text-[9px] font-medium text-zinc-600 uppercase tracking-wider mb-2.5">
          Platforms <span className="text-red-400">*</span>
        </p>
        <div className="grid grid-cols-2 gap-2">
          {PLATFORMS.map((p) => {
            const active = form.platforms.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => togglePlatform(p.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                  active
                    ? "bg-[#FA4616]/10 text-[#FA4616]"
                    : "bg-white/[0.02] text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300"
                }`}
              >
                <span className={active ? "text-[#FA4616]" : "text-zinc-600"}>
                  {p.icon}
                </span>
                {p.label}
              </button>
            );
          })}
        </div>
        {form.platforms.length === 0 && (
          <p className="text-[10px] text-red-400 mt-1.5">
            Select at least one platform
          </p>
        )}
      </div>
    </div>
  );
}
