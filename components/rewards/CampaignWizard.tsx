"use client";

import { useState, useCallback } from "react";
import type { Campaign } from "@/lib/rewards-types";
import { useRewards } from "./RewardsProvider";

const TYPES = ["Clipping", "UGC", "Other"];
const CATS = ["Technology", "Gaming", "Finance", "Education", "Crypto", "Entertainment", "Other"];
const PL = [
  { l: "YouTube", i: "\u25B6" },
  { l: "TikTok", i: "\u266A" },
  { l: "Instagram", i: "IG" },
  { l: "X", i: "\uD835\uDD4F" },
];
const LINK_TYPES = ["Google Drive", "YouTube", "External Link", "TikTok", "Instagram", "X"];

const initCamp: Campaign = {
  name: "",
  type: 0,
  category: "Crypto",
  platforms: [0, 1, 2, 3],
  cpm: 2,
  perPlat: false,
  cpmRates: [2, 2, 2, 2],
  min: 1,
  max: 1000,
  flat: 0,
  budget: 500,
  reqs: [],
  contentLinks: [],
  reqApp: false,
  reqDemo: false,
  showDisc: true,
  reqSound: false,
  product: "Aptos Content Creation",
};

function Toggle({
  label,
  desc,
  value,
  onChange,
}: {
  label: string;
  desc?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.04] gap-3">
      <div className="flex-1">
        <div className="text-[13px] font-medium text-white">{label}</div>
        {desc && <div className="text-[10px] text-zinc-500 mt-0.5">{desc}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full relative shrink-0 transition-colors ${
          value ? "bg-[#FA4616]" : "bg-white/[0.08]"
        }`}
      >
        <div
          className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform shadow-sm ${
            value ? "translate-x-5.5 left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export function CampaignWizard({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { addCampaign } = useRewards();
  const [step, setStep] = useState(0);
  const [camp, setCamp] = useState<Campaign>({ ...initCamp });
  const [newReq, setNewReq] = useState("");
  const [newLinkType, setNewLinkType] = useState("Google Drive");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const u = useCallback(
    (p: Partial<Campaign>) => setCamp((c) => ({ ...c, ...p })),
    []
  );

  const togPlat = (id: number) => {
    const p = camp.platforms.includes(id)
      ? camp.platforms.filter((x) => x !== id)
      : [...camp.platforms, id];
    u({ platforms: p });
  };

  const addReq = () => {
    if (newReq.trim()) {
      u({ reqs: [...camp.reqs, newReq.trim()] });
      setNewReq("");
    }
  };

  const addLink = () => {
    if (newLinkUrl.trim()) {
      u({
        contentLinks: [
          ...camp.contentLinks,
          { type: newLinkType, url: newLinkUrl.trim() },
        ],
      });
      setNewLinkUrl("");
    }
  };

  const create = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/rewards/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(camp),
      });
      if (!res.ok) throw new Error("API error");
      const created = await res.json();
      addCampaign(created);
    } catch {
      // API unavailable — fall back to local state
      addCampaign(camp);
      setError("Saved locally (server unavailable)");
      // Brief inline toast — auto-dismiss after 3s
      setTimeout(() => setError(null), 3000);
    } finally {
      setSubmitting(false);
    }
    onClose();
    setStep(0);
    setCamp({ ...initCamp });
  };

  if (!open) return null;

  const estViews =
    camp.cpm > 0 && camp.budget > 0
      ? Math.round((camp.budget / camp.cpm) * 1000)
      : 0;
  const evF =
    estViews >= 1e6
      ? (estViews / 1e6).toFixed(1) + "M"
      : estViews >= 1e3
        ? (estViews / 1e3).toFixed(1) + "K"
        : estViews.toString();

  const steps = [
    // Step 0: Name, Type, Category
    <div key={0} className="space-y-4">
      <div>
        <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
          Campaign Name <span className="text-red-400">*</span>
        </label>
        <input
          className="input-whop w-full px-3 py-2.5 text-[14px]"
          value={camp.name}
          onChange={(e) => u({ name: e.target.value })}
          placeholder='e.g. "Shelby Fixes Creator Payouts"'
        />
      </div>
      <div>
        <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
          Type <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {TYPES.map((t, i) => (
            <button
              key={t}
              onClick={() => u({ type: i })}
              className={`px-3 py-2.5 rounded-lg text-[13px] font-medium border transition-colors ${
                camp.type === i
                  ? "border-white/[0.2] bg-white/[0.06] text-white"
                  : "border-white/[0.06] text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
          Category
        </label>
        <select
          className="input-whop w-full px-3 py-2.5 text-[14px] appearance-none"
          value={camp.category}
          onChange={(e) => u({ category: e.target.value })}
        >
          {CATS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
    </div>,

    // Step 1: Budget
    <div key={1} className="space-y-4">
      <div>
        <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
          Budget <span className="text-red-400">*</span>
        </label>
        <div className="flex">
          <span className="px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] border-r-0 rounded-l-[10px] text-zinc-500 text-[14px] flex items-center">
            $
          </span>
          <input
            type="number"
            className="input-whop flex-1 px-3 py-2.5 text-[14px] rounded-l-none"
            value={camp.budget}
            onChange={(e) => u({ budget: +e.target.value })}
          />
        </div>
        <div className="text-[10px] text-zinc-600 mt-1.5">
          Min $500 {"\u00B7"} Paid in USDT {"\u00B7"} Escrow in campaign contract
        </div>
      </div>
    </div>,

    // Step 2: Platforms + Rewards
    <div key={2} className="space-y-4">
      <div>
        <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
          Platforms <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {PL.map((p, i) => (
            <button
              key={p.l}
              onClick={() => togPlat(i)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-[13px] font-medium border transition-colors ${
                camp.platforms.includes(i)
                  ? "border-white/[0.2] bg-white/[0.06] text-white"
                  : "border-white/[0.06] text-zinc-500"
              }`}
            >
              <span>{p.i}</span> {p.l}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
          CPM (per 1K views) <span className="text-red-400">*</span>
        </label>
        <div className="flex">
          <span className="px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] border-r-0 rounded-l-[10px] text-zinc-500 text-[14px] flex items-center">
            $
          </span>
          <input
            type="number"
            className="input-whop flex-1 px-3 py-2.5 text-[14px] rounded-l-none"
            value={camp.cpm}
            onChange={(e) => u({ cpm: +e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
            Min Payout
          </label>
          <div className="flex">
            <span className="px-2.5 py-2.5 bg-white/[0.04] border border-white/[0.08] border-r-0 rounded-l-[10px] text-zinc-500 text-[13px] flex items-center">
              $
            </span>
            <input
              type="number"
              className="input-whop flex-1 px-3 py-2.5 text-[13px] rounded-l-none"
              value={camp.min}
              onChange={(e) => u({ min: +e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
            Max Payout
          </label>
          <div className="flex">
            <span className="px-2.5 py-2.5 bg-white/[0.04] border border-white/[0.08] border-r-0 rounded-l-[10px] text-zinc-500 text-[13px] flex items-center">
              $
            </span>
            <input
              type="number"
              className="input-whop flex-1 px-3 py-2.5 text-[13px] rounded-l-none"
              value={camp.max}
              onChange={(e) => u({ max: +e.target.value })}
            />
          </div>
        </div>
      </div>
      <div>
        <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
          Flat Fee Bonus (optional)
        </label>
        <div className="flex">
          <span className="px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] border-r-0 rounded-l-[10px] text-zinc-500 text-[14px] flex items-center">
            $
          </span>
          <input
            type="number"
            className="input-whop flex-1 px-3 py-2.5 text-[14px] rounded-l-none"
            value={camp.flat}
            onChange={(e) => u({ flat: +e.target.value })}
          />
        </div>
        <div className="text-[10px] text-zinc-600 mt-1">
          Every approved submission earns this + view-based reward
        </div>
      </div>
    </div>,

    // Step 3: Requirements
    <div key={3} className="space-y-4">
      <div>
        <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
          Requirements <span className="text-red-400">*</span>
        </label>
        <div className="space-y-1.5 mb-2">
          {camp.reqs.map((r, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-white/[0.06] text-[13px] text-white"
            >
              <span className="text-zinc-600">{"\u2807"}</span>
              <span className="flex-1">{r}</span>
              <button
                onClick={() => u({ reqs: camp.reqs.filter((_, x) => x !== i) })}
                className="text-zinc-600 hover:text-zinc-400 text-[14px]"
              >
                {"\u2715"}
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="input-whop flex-1 px-3 py-2.5 text-[13px]"
            value={newReq}
            onChange={(e) => setNewReq(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addReq()}
            placeholder="Enter requirement"
          />
          <button
            onClick={addReq}
            className="px-4 py-2.5 rounded-[10px] bg-[#FA4616] text-white text-[12px] font-semibold shrink-0"
          >
            Add
          </button>
        </div>
      </div>
      <div>
        <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
          Content Links
        </label>
        {camp.contentLinks.map((l, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-2.5 py-2 rounded-lg border border-white/[0.06] text-[11px] mb-1.5"
          >
            <span className="text-zinc-500 bg-white/[0.04] px-1.5 py-0.5 rounded text-[10px]">
              {l.type}
            </span>
            <span className="font-mono text-zinc-400 flex-1 truncate">
              {l.url}
            </span>
            <button
              onClick={() =>
                u({
                  contentLinks: camp.contentLinks.filter((_, x) => x !== i),
                })
              }
              className="text-zinc-600"
            >
              {"\u2715"}
            </button>
          </div>
        ))}
        <div className="flex gap-2">
          <select
            className="input-whop px-2.5 py-2.5 text-[12px] appearance-none w-32 shrink-0"
            value={newLinkType}
            onChange={(e) => setNewLinkType(e.target.value)}
          >
            {LINK_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <input
            className="input-whop flex-1 px-3 py-2.5 text-[12px]"
            value={newLinkUrl}
            onChange={(e) => setNewLinkUrl(e.target.value)}
            placeholder="Paste URL..."
          />
          <button
            onClick={addLink}
            className="px-3 py-2.5 rounded-[10px] bg-white/[0.06] text-white text-[12px] font-semibold border border-white/[0.06] shrink-0"
          >
            +
          </button>
        </div>
      </div>
      <div>
        <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
          Campaign Assets (Shelby Upload)
        </label>
        <button className="w-full py-3 rounded-lg border border-dashed border-white/[0.08] text-zinc-500 text-[11px] text-center">
          Upload to Shelby &middot; AES-256-GCM encrypted
        </button>
      </div>
      <Toggle
        label="Require Specific Sounds"
        desc="Per-platform sound requirements for submissions"
        value={camp.reqSound}
        onChange={(v) => u({ reqSound: v })}
      />
    </div>,

    // Step 4: Settings
    <div key={4} className="space-y-1">
      <Toggle
        label="Require Application"
        desc="Creators must apply before submitting content"
        value={camp.reqApp}
        onChange={(v) => u({ reqApp: v })}
      />
      <Toggle
        label="Require Demographics Screenshot"
        desc="Replace description with demographics upload in submissions"
        value={camp.reqDemo}
        onChange={(v) => u({ reqDemo: v })}
      />
      <Toggle
        label="Show on Discover Page"
        desc="Make your campaign visible in the Discover Marketplace"
        value={camp.showDisc}
        onChange={(v) => u({ showDisc: v })}
      />
      <div className="mt-4">
        <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
          Select Product <span className="text-red-400">*</span>
        </label>
        <select
          className="input-whop w-full px-3 py-2.5 text-[14px] appearance-none"
          value={camp.product}
          onChange={(e) => u({ product: e.target.value })}
        >
          <option>Aptos Content Creation</option>
          <option>Crypto Tools</option>
        </select>
      </div>
      <div className="mt-4 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] text-[10px] text-zinc-500 leading-relaxed">
        Budget, CPM rates, and flat fee bonus become{" "}
        <strong className="text-zinc-400">immutable</strong> after first fund.
        <br />
        48-hour auto-approve {"\u00B7"} 30-day verification period {"\u00B7"}{" "}
        Organic views only
      </div>
    </div>,

    // Step 5: Phone
    <div key={5} className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-[#FA4616]/10 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#FA4616]"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
        </div>
        <div>
          <div className="text-[13px] font-semibold text-white">
            Phone Verification
          </div>
          <div className="text-[11px] text-zinc-500">
            For customer support communications
          </div>
        </div>
      </div>
      <div>
        <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
          Phone Number
        </label>
        <div className="flex gap-2">
          <div className="px-3 py-2.5 border border-white/[0.08] rounded-lg text-[13px] text-zinc-400 whitespace-nowrap flex items-center shrink-0">
            US +1
          </div>
          <input
            className="input-whop flex-1 px-3 py-2.5 text-[14px]"
            placeholder="(555) 123-4567"
          />
        </div>
      </div>
      <div>
        <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
          Preferred Messaging App
        </label>
        <div className="flex gap-2">
          <button className="flex-1 py-2.5 rounded-lg border border-[#FA4616]/40 bg-[#FA4616]/10 text-[#FA4616] text-[13px] font-medium">
            iMessage
          </button>
          <button className="flex-1 py-2.5 rounded-lg border border-white/[0.06] text-zinc-500 text-[13px] font-medium">
            WhatsApp
          </button>
        </div>
      </div>
    </div>,
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#0f0f0f] rounded-t-[20px] sm:rounded-[16px] w-full sm:max-w-lg max-h-[92vh] overflow-hidden flex flex-col border border-white/[0.08] modal-panel">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h3 className="text-[14px] font-semibold text-white">
            New Program
          </h3>
          <div className="flex gap-1">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className={`w-5 h-1 rounded-full ${
                  i <= step ? "bg-[#FA4616]" : "bg-white/[0.06]"
                }`}
              />
            ))}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg border border-white/[0.08] flex items-center justify-center text-zinc-500 text-[14px] hover:text-white transition-colors"
          >
            {"\u2715"}
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">{steps[step]}</div>

        {/* Preview */}
        <div className="px-5 pb-3">
          <div className="text-[10px] text-zinc-600 mb-1.5">Preview</div>
          <div className="surface-1 rounded-xl p-3.5 text-[12px]">
            <div className="font-semibold text-white mb-0.5">
              {camp.name || "Your Campaign"}
            </div>
            <div className="text-zinc-500 text-[11px]">
              {TYPES[camp.type]} {"\u00B7"} {camp.category} {"\u00B7"}{" "}
              {camp.platforms.map((p) => PL[p]?.i).join(" ")}
            </div>
            <div className="flex justify-between mt-2 pt-2 border-t border-white/[0.04] font-mono text-[11px]">
              <span className="text-zinc-500">
                ${camp.budget.toLocaleString()} budget
              </span>
              <span className="text-zinc-400">
                ${camp.cpm.toFixed(2)}/1K {"\u00B7"} ~{evF} views
              </span>
            </div>
          </div>
        </div>

        {/* Error toast */}
        {error && (
          <div className="mx-5 mb-2 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[11px]">
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between px-5 py-4 border-t border-white/[0.06]">
          <button
            onClick={() => step > 0 && setStep(step - 1)}
            className={`px-5 py-2.5 rounded-[10px] border border-white/[0.08] text-zinc-400 text-[12px] font-medium ${
              step === 0 ? "invisible" : ""
            }`}
          >
            Back
          </button>
          <button
            onClick={() => (step < 5 ? setStep(step + 1) : create())}
            disabled={submitting}
            className={`flex-1 ml-3 px-5 py-2.5 rounded-[10px] bg-[#FA4616] text-white text-[13px] font-semibold hover:bg-[#e03d12] transition-colors ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {submitting
              ? "Creating..."
              : step === 5
                ? "Create Campaign"
                : "Next \u2192"}
          </button>
        </div>
      </div>
    </div>
  );
}
