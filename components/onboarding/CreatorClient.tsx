"use client";

import { useState, useCallback, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";

/* ── Step Types ────────────────────────────────────── */

type Step = "configuration" | "details" | "requirements" | "contact" | "preview";
const STEPS: Step[] = ["configuration", "details", "requirements", "contact", "preview"];
const STEP_LABELS = ["Configuration", "Details", "Requirements", "Contact", "Preview"];

/* ── Platform / Category Constants ─────────────────── */

const PLATFORMS = [
  { key: "tiktok", label: "TikTok", icon: TikTokIcon },
  { key: "instagram", label: "Instagram", icon: InstagramIcon },
  { key: "youtube", label: "YouTube", icon: YouTubeIcon },
  { key: "x", label: "X", icon: XIcon },
] as const;

const CATEGORIES = [
  { value: "music", label: "Music", icon: "🎵" },
  { value: "gaming", label: "Gaming", icon: "🎮" },
  { value: "entertainment", label: "Entertainment", icon: "🎬" },
  { value: "sports", label: "Sports", icon: "⚽" },
  { value: "education", label: "Education", icon: "📚" },
  { value: "lifestyle", label: "Lifestyle", icon: "✨" },
  { value: "technology", label: "Technology", icon: "💻" },
  { value: "crypto", label: "Crypto", icon: "🪙" },
] as const;

const CAMPAIGN_TYPES = [
  { value: "ugc", label: "UGC" },
  { value: "clipping", label: "Clipping" },
  { value: "both", label: "Both" },
] as const;

const CHAT_APPS = ["WhatsApp", "iMessage", "Slack"] as const;

/* ── Preset Requirements ──────────────────────────── */

interface PresetReq {
  key: string;
  label: string;
  desc: string;
  hasInput?: "link" | "minmax" | "url" | "text" | "hours";
}

const PRESET_REQS: PresetReq[] = [
  { key: "face", label: "Face on camera", desc: "Creator must show their face in the video" },
  { key: "logo", label: "Brand logo must be visible", desc: "Your brand logo should appear in the content" },
  { key: "original", label: "No reposted content", desc: "Only original content is accepted" },
  { key: "sound", label: "Specific sound/music", desc: "Use a specific audio track", hasInput: "link" },
  { key: "length", label: "Video length", desc: "Set minimum and maximum video duration", hasInput: "minmax" },
  { key: "bio", label: "Link in bio", desc: "Creator must include a link in their bio", hasInput: "url" },
  { key: "text", label: "Specific text in caption", desc: "Include specific text in video title or caption", hasInput: "text" },
  { key: "quick", label: "Quick submission", desc: "Submission must be within a time limit", hasInput: "hours" },
];

/* ── Campaign Form State ──────────────────────────── */

interface CampaignForm {
  // Configuration
  accessType: "open" | "application";
  ratePerMille: number;
  platforms: string[];
  sameRate: boolean;
  platformRates: Record<string, number>;
  totalBudget: number;
  maxEarnings: number;
  noLimit: boolean;
  // Details
  name: string;
  description: string;
  campaignType: string;
  category: string;
  ongoing: boolean;
  thumbnailFile: File | null;
  thumbnailPreview: string | null;
  // Requirements
  customReqs: string[];
  videoExamples: string[];
  presetToggles: Record<string, boolean>;
  presetInputs: Record<string, string>;
  presetMin: string;
  presetMax: string;
  similarityThreshold: number; // 0-100, how strictly clips must match source
  // Contact
  email: string;
  phone: string;
  chatApp: string;
  agreedTos: boolean;
}

const initialForm: CampaignForm = {
  accessType: "open",
  ratePerMille: 2,
  platforms: ["tiktok", "youtube"],
  sameRate: true,
  platformRates: {},
  totalBudget: 500,
  maxEarnings: 1000,
  noLimit: false,
  name: "",
  description: "",
  campaignType: "ugc",
  category: "crypto",
  ongoing: true,
  thumbnailFile: null,
  thumbnailPreview: null,
  customReqs: [],
  videoExamples: [],
  presetToggles: {},
  presetInputs: {},
  presetMin: "",
  presetMax: "",
  similarityThreshold: 50,
  email: "",
  phone: "",
  chatApp: "WhatsApp",
  agreedTos: false,
};

/* ── Main Component ────────────────────────────────── */

export function CreatorClient() {
  const [stepIdx, setStepIdx] = useState(0);
  const [form, setForm] = useState<CampaignForm>({ ...initialForm });
  const [newReq, setNewReq] = useState("");
  const [newExample, setNewExample] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<{
    success: boolean;
    campaignId?: string;
    campaignAddress?: string;
    txHash?: string;
    error?: string;
  } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const step = STEPS[stepIdx];

  const u = useCallback(
    (patch: Partial<CampaignForm>) => setForm((f) => ({ ...f, ...patch })),
    [],
  );

  const togglePlatform = (key: string) => {
    const next = form.platforms.includes(key)
      ? form.platforms.filter((p) => p !== key)
      : [...form.platforms, key];
    u({ platforms: next });
  };

  const addCustomReq = () => {
    if (newReq.trim()) {
      u({ customReqs: [...form.customReqs, newReq.trim()] });
      setNewReq("");
    }
  };

  const addVideoExample = () => {
    if (newExample.trim()) {
      u({ videoExamples: [...form.videoExamples, newExample.trim()] });
      setNewExample("");
    }
  };

  const togglePreset = (key: string) => {
    u({ presetToggles: { ...form.presetToggles, [key]: !form.presetToggles[key] } });
  };

  const setPresetInput = (key: string, val: string) => {
    u({ presetInputs: { ...form.presetInputs, [key]: val } });
  };

  const handleThumbnail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      u({ thumbnailFile: file, thumbnailPreview: URL.createObjectURL(file) });
    }
  };

  const saveCampaignLocally = (payload: Record<string, unknown>, chainAddr?: string) => {
    try {
      const existing = JSON.parse(localStorage.getItem("cr_campaigns") || "[]");
      const id = `local-${Date.now()}`;
      existing.push({
        id,
        onChainAddress: chainAddr || "",
        name: payload.name,
        category: payload.category,
        platforms: payload.platforms,
        cpmRates: payload.cpmRates,
        budget: payload.fundAmount,
        requirements: payload.requirements,
        contentLinks: payload.contentLinks,
        similarityThreshold: payload.similarityThreshold,
        status: 1,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem("cr_campaigns", JSON.stringify(existing));
    } catch {
      // localStorage unavailable
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    setPublishResult(null);

    // Build cpmRates in API order: [youtube, tiktok, instagram, x]
    const apiPlatformOrder = ["youtube", "tiktok", "instagram", "x"];
    const cpmRates = apiPlatformOrder.map((key) => {
      if (!form.sameRate && form.platformRates[key] !== undefined) {
        return form.platformRates[key];
      }
      return form.ratePerMille;
    });

    // Map platform keys to API indices: 0=yt, 1=tt, 2=ig, 3=x
    const platformIndexMap: Record<string, number> = { youtube: 0, tiktok: 1, instagram: 2, x: 3 };
    const platforms = form.platforms.map((p) => platformIndexMap[p] ?? 0);

    // Build requirements from custom + presets
    const requirements = [
      ...form.customReqs,
      ...PRESET_REQS.filter((p) => form.presetToggles[p.key]).map((p) => {
        const input = form.presetInputs[p.key];
        if (p.key === "length") return `Video length: ${form.presetMin || "0"}s - ${form.presetMax || "∞"}s`;
        if (input) return `${p.label}: ${input}`;
        return p.label;
      }),
    ];

    // Convert dollar budget to USDT octas (6 decimals)
    const fundAmount = Math.round(form.totalBudget * 1_000_000);

    const payload = {
      name: form.name,
      description: form.description,
      campaignType: CAMPAIGN_TYPES.findIndex((t) => t.value === form.campaignType),
      category: form.category,
      platforms,
      cpmRates,
      minPayout: 1_000_000, // $1 minimum in octas
      maxPayout: form.noLimit ? fundAmount : Math.round(form.maxEarnings * 1_000_000),
      flatFeeBonus: 0,
      requirements,
      contentLinks: form.videoExamples.map((url) => ({ type: "Video Example", url })),
      requireApplication: form.accessType === "application",
      requireDemographics: false,
      showOnDiscover: true,
      requireSpecificSounds: form.presetToggles["sound"] || false,
      similarityThreshold: form.similarityThreshold,
      fundAmount,
    };

    try {
      const res = await fetch("/api/rewards/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        saveCampaignLocally(payload, data.chain?.campaignAddress);
        setPublishResult({
          success: true,
          campaignId: data.id,
          campaignAddress: data.chain?.campaignAddress,
          txHash: data.chain?.createTxHash,
        });
      } else {
        const errData = await res.json().catch(() => null);
        const msg = errData?.error || `Server error (${res.status})`;
        setPublishResult({ success: false, error: msg });
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Network error";
      setPublishResult({ success: false, error: `Could not reach server: ${msg}` });
    } finally {
      setPublishing(false);
    }
  };

  const estViews = form.ratePerMille > 0 ? Math.round((form.totalBudget / form.ratePerMille) * 1000) : 0;
  const estViewsFormatted =
    estViews >= 1e6
      ? (estViews / 1e6).toFixed(1) + "M"
      : estViews >= 1e3
        ? (estViews / 1e3).toFixed(0) + "K"
        : estViews.toString();

  const canProceed = () => {
    switch (step) {
      case "configuration":
        return form.platforms.length > 0 && form.ratePerMille > 0 && form.totalBudget >= 500;
      case "details":
        return form.name.trim().length > 0;
      case "requirements":
        return true;
      case "contact":
        return form.email.trim().length > 0 && form.agreedTos;
      case "preview":
        return true;
      default:
        return true;
    }
  };

  // ── Success / Error Screen ──
  if (publishResult) {
    const shortAddr = (a: string) => a.slice(0, 6) + "..." + a.slice(-4);
    const cpmDisplay = form.sameRate ? `[${form.ratePerMille}, ${form.ratePerMille}, ${form.ratePerMille}, ${form.ratePerMille}]` : "[...]";
    const budgetDisplay = form.totalBudget > 0 ? `${form.totalBudget.toLocaleString()} USDT` : "0";

    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: "var(--light-bg)" }}>
        <Navbar />
        <style>{`
          @keyframes cx-draw { to { stroke-dashoffset: 0 } }
          @keyframes cx-scale { 0% { transform: scale(0); opacity: 0 } 60% { transform: scale(1.15) } 100% { transform: scale(1); opacity: 1 } }
          @keyframes cx-fade-up { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
          @keyframes cx-line-in { from { opacity: 0; transform: translateX(-8px) } to { opacity: 1; transform: translateX(0) } }
          @keyframes cx-glow { 0%,100% { background: transparent } 50% { background: rgba(139,92,246,0.08) } }
          @keyframes cx-node-pop { from { transform: scale(0); opacity: 0 } to { transform: scale(1); opacity: 1 } }
          @keyframes cx-line-grow { from { width: 0 } to { width: 100% } }
          @keyframes cx-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4) } 50% { box-shadow: 0 0 0 8px rgba(34,197,94,0) } }
          .cx-check-wrap { animation: cx-scale 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards }
          .cx-check-circle { stroke-dasharray: 166; stroke-dashoffset: 166; animation: cx-draw 0.6s 0.3s ease forwards }
          .cx-check-mark { stroke-dasharray: 48; stroke-dashoffset: 48; animation: cx-draw 0.4s 0.7s ease forwards }
          .cx-title { opacity: 0; animation: cx-fade-up 0.5s 0.5s ease forwards }
          .cx-code-block { opacity: 0; animation: cx-fade-up 0.5s 0.8s ease forwards }
          .cx-code-line { opacity: 0; animation: cx-line-in 0.3s ease forwards }
          .cx-code-line.cx-hl { animation: cx-line-in 0.3s ease forwards, cx-glow 2s 2.5s ease infinite }
          .cx-flow { opacity: 0; animation: cx-fade-up 0.5s 2.0s ease forwards }
          .cx-flow-node { transform: scale(0); opacity: 0; animation: cx-node-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards }
          .cx-flow-line-inner { width: 0; animation: cx-line-grow 0.4s ease forwards }
          .cx-flow-done { animation: cx-pulse 2s infinite }
          .cx-btns { opacity: 0; animation: cx-fade-up 0.4s 3.0s ease forwards }
          .cx-kw { color: #c792ea } .cx-ty { color: #82aaff } .cx-fn { color: #ecc48d }
          .cx-str { color: #c3e88d } .cx-cm { color: #697098; font-style: italic }
          .cx-op { color: #89ddff } .cx-ann { color: #f78c6c; font-size: 10px; opacity: 0.7; margin-left: 8px }
        `}</style>
        <div className="w-full max-w-[580px]" style={{ color: "var(--light-text)" }}>
          {publishResult.success ? (
            <div className="rounded-[20px] overflow-hidden shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.06),0_12px_48px_rgba(0,0,0,0.08)]" style={{ background: "var(--light-card)" }}>
              {/* Header */}
              <div className="text-center pt-8 pb-4 px-6">
                <div className="cx-check-wrap w-14 h-14 mx-auto mb-4">
                  <svg viewBox="0 0 52 52" className="w-14 h-14">
                    <circle className="cx-check-circle" cx="26" cy="26" r="24" fill="none" stroke="#22c55e" strokeWidth="2.5" />
                    <path className="cx-check-mark" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M15 27l7 7 15-15" />
                  </svg>
                </div>
                <h2 className="cx-title text-[20px] font-bold mb-1">Campaign Created On-Chain</h2>
                <p className="cx-title text-[13px]" style={{ color: "var(--light-text-secondary)", animationDelay: "0.6s" }}>
                  <strong>{form.name}</strong> is live on Aptos testnet
                </p>
              </div>

              {/* Move code block */}
              <div className="cx-code-block mx-4 mb-4 rounded-[14px] overflow-hidden" style={{ background: "#1e1e2e", border: "1px solid #2a2a3c" }}>
                {/* Code header */}
                <div className="flex items-center gap-2 px-4 py-2.5" style={{ borderBottom: "1px solid #2a2a3c" }}>
                  <span className="w-[10px] h-[10px] rounded-full" style={{ background: "#ff5f57" }} />
                  <span className="w-[10px] h-[10px] rounded-full" style={{ background: "#febc2e" }} />
                  <span className="w-[10px] h-[10px] rounded-full" style={{ background: "#28c840" }} />
                  <span className="text-[11px] font-medium ml-2" style={{ color: "#697098" }}>campaign.move</span>
                  <span className="ml-auto text-[10px] px-2 py-0.5 rounded-md" style={{ color: "#c792ea", background: "#c792ea15" }}>Move</span>
                </div>
                {/* Code body */}
                <pre className="px-4 py-3 text-[11px] leading-[1.7] font-mono overflow-x-auto" style={{ color: "#d6deeb" }}>
                  {[
                    { code: <><span className="cx-kw">public entry fun</span> <span className="cx-fn">create_campaign</span><span className="cx-op">(</span></>, delay: "1.0s" },
                    { code: <>&nbsp;&nbsp;&nbsp;&nbsp;brand: <span className="cx-op">&amp;</span><span className="cx-kw">signer</span>,<span className="cx-ann">{publishResult.campaignAddress ? `← ${shortAddr(publishResult.campaignAddress)}` : ""}</span></>, delay: "1.1s" },
                    { code: <>&nbsp;&nbsp;&nbsp;&nbsp;name: <span className="cx-ty">String</span>,<span className="cx-ann">{`← "${form.name}"`}</span></>, delay: "1.2s" },
                    { code: <>&nbsp;&nbsp;&nbsp;&nbsp;cpm_rates: <span className="cx-ty">vector</span><span className="cx-op">&lt;</span><span className="cx-ty">u64</span><span className="cx-op">&gt;</span>,<span className="cx-ann">{`← ${cpmDisplay}`}</span></>, delay: "1.3s" },
                    { code: <>&nbsp;&nbsp;&nbsp;&nbsp;...<span className="cx-cm"> // 15 more params</span></>, delay: "1.4s" },
                    { code: <><span className="cx-op">)</span> <span className="cx-kw">acquires</span> Platform, BrandCampaigns <span className="cx-op">{"{"}</span></>, delay: "1.5s" },
                    { code: <></>, delay: "1.55s" },
                    { code: <>&nbsp;&nbsp;<span className="cx-cm">{"// Validate inputs"}</span></>, delay: "1.6s" },
                    { code: <>&nbsp;&nbsp;<span className="cx-fn">assert!</span>(<span className="cx-op">!</span>platform.paused, <span className="cx-ty">E_PLATFORM_PAUSED</span>);</>, delay: "1.7s" },
                    { code: <>&nbsp;&nbsp;<span className="cx-fn">assert!</span>(max_payout <span className="cx-op">&gt;=</span> min_payout);</>, delay: "1.8s" },
                    { code: <></>, delay: "1.85s" },
                    { code: <>&nbsp;&nbsp;<span className="cx-cm">{"// Create on-chain object"}</span></>, delay: "1.9s", hl: true },
                    { code: <>&nbsp;&nbsp;<span className="cx-kw">let</span> cref = <span className="cx-fn">object::create_object</span>(brand_addr);</>, delay: "2.0s", hl: true },
                    { code: <>&nbsp;&nbsp;<span className="cx-kw">let</span> osig = <span className="cx-fn">object::generate_signer</span>(&amp;cref);</>, delay: "2.1s", hl: true },
                    { code: <></>, delay: "2.15s" },
                    { code: <>&nbsp;&nbsp;<span className="cx-cm">{"// Store campaign on-chain"}</span></>, delay: "2.2s", hl: true },
                    { code: <>&nbsp;&nbsp;<span className="cx-fn">move_to</span>(&amp;osig, <span className="cx-ty">Campaign</span> {"{"} owner, name, cpm_rates, ... {"}"});</>, delay: "2.3s", hl: true },
                    { code: <></>, delay: "2.4s" },
                    { code: <>&nbsp;&nbsp;<span className="cx-cm">{"// Emit event"}</span></>, delay: "2.45s" },
                    { code: <>&nbsp;&nbsp;<span className="cx-fn">event::emit</span>(<span className="cx-ty">CampaignCreated</span> {"{"} campaign_address, ... {"}"});</>, delay: "2.5s" },
                    { code: <><span className="cx-op">{"}"}</span></>, delay: "2.6s" },
                  ].map((line, i) => (
                    <div key={i} className={`cx-code-line${line.hl ? " cx-hl" : ""}`} style={{ animationDelay: line.delay, padding: "0 4px", borderRadius: 4 }}>
                      {line.code}
                    </div>
                  ))}
                </pre>
              </div>

              {/* Transaction flow */}
              <div className="cx-flow px-6 pb-4">
                <div className="flex items-center gap-0">
                  {[
                    { label: "Create", sub: publishResult.txHash ? shortAddr(publishResult.txHash) : "tx", delay: "2.2s", color: "#8b5cf6" },
                    { label: "Fund", sub: budgetDisplay, delay: "2.5s", color: "#3b82f6" },
                    { label: "Active", sub: "STATUS_ACTIVE", delay: "2.8s", color: "#22c55e" },
                  ].map((node, i) => (
                    <div key={i} className="flex items-center flex-1" style={{ minWidth: 0 }}>
                      <div className="cx-flow-node flex flex-col items-center flex-shrink-0" style={{ animationDelay: node.delay }}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold ${i === 2 ? "cx-flow-done" : ""}`} style={{ background: node.color }}>
                          {i === 2 ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> : i + 1}
                        </div>
                        <div className="text-[11px] font-semibold mt-1.5" style={{ color: node.color }}>{node.label}</div>
                        <div className="text-[9px] font-mono" style={{ color: "var(--light-text-secondary)" }}>{node.sub}</div>
                      </div>
                      {i < 2 && (
                        <div className="flex-1 h-[2px] mx-1 overflow-hidden" style={{ background: "#e5e7eb" }}>
                          <div className="cx-flow-line-inner h-full" style={{ background: `linear-gradient(90deg, ${node.color}, ${[{ color: "#3b82f6" }, { color: "#22c55e" }][i]?.color || "#22c55e"})`, animationDelay: `${parseFloat(node.delay) + 0.3}s` }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Campaign address */}
              {publishResult.campaignAddress && (
                <div className="cx-btns mx-6 mb-3 px-3 py-2.5 rounded-[10px] flex items-center gap-2" style={{ background: "#f8fafc", border: "1px solid #f1f5f9", animationDelay: "2.8s" }}>
                  <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: "#8b5cf615" }}>
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.03a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.25 8.81" /></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-medium" style={{ color: "var(--light-text-secondary)" }}>On-chain Address</div>
                    <div className="text-[11px] font-mono truncate" style={{ color: "var(--light-text)" }}>{publishResult.campaignAddress}</div>
                  </div>
                  {publishResult.txHash && (
                    <a
                      href={`https://explorer.aptoslabs.com/txn/${publishResult.txHash}?network=testnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-md flex-shrink-0 hover:opacity-80 transition-opacity"
                      style={{ color: "#8b5cf6", background: "#8b5cf615" }}
                    >
                      Explorer
                    </a>
                  )}
                </div>
              )}

              {/* Buttons */}
              <div className="cx-btns flex gap-3 px-6 pb-6 pt-2">
                <a
                  href="/"
                  className="flex-1 py-3 text-[14px] font-medium text-center rounded-[12px] border transition-colors hover:bg-gray-50"
                  style={{ color: "var(--light-text-secondary)", borderColor: "var(--light-border-strong)" }}
                >
                  Discover
                </a>
                <a
                  href={publishResult.campaignId ? `/discover/${publishResult.campaignId}` : "/"}
                  className="flex-1 py-3 text-[14px] font-semibold text-white text-center rounded-[12px] hover:opacity-90 transition-opacity"
                  style={{ background: "var(--accent)" }}
                >
                  View Campaign
                </a>
              </div>
            </div>
          ) : (
            <div className="rounded-[20px] p-8 text-center shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.06)]" style={{ background: "var(--light-card)" }}>
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-[22px] font-bold mb-2" style={{ color: "var(--light-text)" }}>
                Creation Failed
              </h2>
              <p className="text-[14px] mb-6" style={{ color: "var(--light-text-secondary)" }}>
                {publishResult.error}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setPublishResult(null)}
                  className="flex-1 py-3.5 text-[15px] font-semibold text-white rounded-[14px] hover:opacity-[0.88] transition-opacity cursor-pointer"
                  style={{ background: "var(--accent)" }}
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 py-10" style={{ background: "var(--light-bg)" }}>
      <Navbar />
      <div style={{ paddingTop: "108px" }} />

      <div className="max-w-[640px] mx-auto">
        {/* Step Header */}
        <div className="mb-6">
          <h1
            className="text-[28px] font-bold mb-1 leading-tight"
            style={{ color: "var(--light-text)" }}
          >
            Create Campaign
          </h1>
          <p className="text-[14px]" style={{ color: "var(--light-text-secondary)" }}>
            Step {stepIdx + 1} of {STEPS.length}: {STEP_LABELS[stepIdx]}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-[5px] rounded-full transition-colors duration-400 cursor-pointer ${
                i <= stepIdx ? "bg-[var(--accent)]" : "bg-gray-200"
              }`}
              onClick={() => i < stepIdx && setStepIdx(i)}
            />
          ))}
        </div>

        {/* Card */}
        <div
          className="rounded-[20px] p-8 shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.04),0_8px_32px_rgba(0,0,0,0.06)] animate-fade-in"
          style={{ background: "var(--light-card)" }}
        >
          {/* ═══ Step 1: Configuration ═══ */}
          {step === "configuration" && (
            <div className="space-y-6">
              {/* Access Type */}
              <div>
                <label className="block text-[13px] font-semibold mb-3" style={{ color: "var(--light-text)" }}>
                  Access Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "open" as const, label: "Open to Public", desc: "Anyone can submit content" },
                    { value: "application" as const, label: "Application Only", desc: "Creators must apply first" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => u({ accessType: opt.value })}
                      className={`p-4 rounded-[14px] border-2 text-left transition-all cursor-pointer ${
                        form.accessType === opt.value
                          ? "border-[var(--accent)] bg-[var(--accent)]/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className="text-[14px] font-semibold mb-0.5"
                        style={{ color: "var(--light-text)" }}
                      >
                        {opt.label}
                      </div>
                      <div className="text-[12px]" style={{ color: "var(--light-text-secondary)" }}>
                        {opt.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rate per 1K views */}
              <div>
                <label className="block text-[13px] font-semibold mb-2" style={{ color: "var(--light-text)" }}>
                  Rate per 1,000 views
                </label>
                <div className="flex">
                  <span
                    className="px-4 py-3 rounded-l-[12px] border border-r-0 text-[14px] font-medium flex items-center"
                    style={{ borderColor: "var(--light-border-strong)", color: "var(--light-text-secondary)", background: "var(--light-chip-bg)" }}
                  >
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    className="flex-1 px-4 py-3 rounded-r-[12px] border text-[14px] outline-none focus:border-[var(--accent)] transition-colors"
                    style={{ borderColor: "var(--light-border-strong)", color: "var(--light-text)" }}
                    value={form.ratePerMille}
                    onChange={(e) => u({ ratePerMille: +e.target.value })}
                  />
                </div>
              </div>

              {/* Platforms */}
              <div>
                <label className="block text-[13px] font-semibold mb-2" style={{ color: "var(--light-text)" }}>
                  Platforms
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {PLATFORMS.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => togglePlatform(key)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-[12px] border-2 transition-all cursor-pointer ${
                        form.platforms.includes(key)
                          ? "border-[var(--accent)] bg-[var(--accent)]/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--light-chip-bg)" }}>
                        <Icon />
                      </div>
                      <span className="text-[14px] font-medium" style={{ color: "var(--light-text)" }}>
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Same rate toggle */}
              <LightToggle
                label="Set the same rate for all platforms"
                checked={form.sameRate}
                onChange={(v) => u({ sameRate: v })}
              />

              {/* Per-platform rates */}
              {!form.sameRate && (
                <div className="space-y-2 pl-1">
                  {form.platforms.map((pk) => {
                    const pl = PLATFORMS.find((p) => p.key === pk);
                    if (!pl) return null;
                    return (
                      <div key={pk} className="flex items-center gap-3">
                        <span className="text-[13px] font-medium w-24" style={{ color: "var(--light-text)" }}>
                          {pl.label}
                        </span>
                        <div className="flex flex-1">
                          <span
                            className="px-3 py-2 rounded-l-[10px] border border-r-0 text-[13px] flex items-center"
                            style={{ borderColor: "var(--light-border-strong)", color: "var(--light-text-secondary)", background: "var(--light-chip-bg)" }}
                          >
                            $
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            className="flex-1 px-3 py-2 rounded-r-[10px] border text-[13px] outline-none"
                            style={{ borderColor: "var(--light-border-strong)", color: "var(--light-text)" }}
                            value={form.platformRates[pk] ?? form.ratePerMille}
                            onChange={(e) =>
                              u({ platformRates: { ...form.platformRates, [pk]: +e.target.value } })
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Total Budget */}
              <div>
                <label className="block text-[13px] font-semibold mb-2" style={{ color: "var(--light-text)" }}>
                  Total Budget
                </label>
                <div className="flex">
                  <span
                    className="px-4 py-3 rounded-l-[12px] border border-r-0 text-[14px] font-medium flex items-center"
                    style={{ borderColor: "var(--light-border-strong)", color: "var(--light-text-secondary)", background: "var(--light-chip-bg)" }}
                  >
                    $
                  </span>
                  <input
                    type="number"
                    className="flex-1 px-4 py-3 rounded-r-[12px] border text-[14px] outline-none focus:border-[var(--accent)] transition-colors"
                    style={{ borderColor: "var(--light-border-strong)", color: "var(--light-text)" }}
                    value={form.totalBudget}
                    onChange={(e) => u({ totalBudget: +e.target.value })}
                  />
                </div>
                <p className="text-[11px] mt-1.5" style={{ color: "var(--light-text-secondary)" }}>
                  Minimum $500 &middot; Paid in USDT &middot; Escrowed in campaign contract
                </p>
              </div>

              {/* Max Earnings */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[13px] font-semibold" style={{ color: "var(--light-text)" }}>
                    Max earnings per creator
                  </label>
                  <LightToggle
                    label="No limit"
                    checked={form.noLimit}
                    onChange={(v) => u({ noLimit: v })}
                    inline
                  />
                </div>
                {!form.noLimit && (
                  <div className="flex">
                    <span
                      className="px-4 py-3 rounded-l-[12px] border border-r-0 text-[14px] font-medium flex items-center"
                      style={{ borderColor: "var(--light-border-strong)", color: "var(--light-text-secondary)", background: "var(--light-chip-bg)" }}
                    >
                      $
                    </span>
                    <input
                      type="number"
                      className="flex-1 px-4 py-3 rounded-r-[12px] border text-[14px] outline-none focus:border-[var(--accent)] transition-colors"
                      style={{ borderColor: "var(--light-border-strong)", color: "var(--light-text)" }}
                      value={form.maxEarnings}
                      onChange={(e) => u({ maxEarnings: +e.target.value })}
                    />
                  </div>
                )}
              </div>

              {/* CPM Summary Card */}
              <div
                className="rounded-[14px] p-4 border"
                style={{ borderColor: "var(--light-border)", background: "var(--light-chip-bg)" }}
              >
                <div className="text-[11px] font-medium mb-2" style={{ color: "var(--light-text-secondary)" }}>
                  CPM Summary
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[20px] font-bold" style={{ color: "var(--light-text)" }}>
                      ${form.ratePerMille.toFixed(2)}
                    </span>
                    <span className="text-[12px] ml-1" style={{ color: "var(--light-text-secondary)" }}>
                      / 1K views
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-[12px]" style={{ color: "var(--light-text-secondary)" }}>
                      Est. total views
                    </div>
                    <div className="text-[18px] font-bold" style={{ color: "var(--accent)" }}>
                      ~{estViewsFormatted}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ Step 2: Details ═══ */}
          {step === "details" && (
            <div className="space-y-6">
              {/* Campaign Name */}
              <div>
                <label className="block text-[13px] font-semibold mb-2" style={{ color: "var(--light-text)" }}>
                  Campaign Name <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full px-4 py-3 rounded-[12px] border text-[14px] outline-none focus:border-[var(--accent)] transition-colors"
                  style={{ borderColor: "var(--light-border-strong)", color: "var(--light-text)" }}
                  value={form.name}
                  onChange={(e) => u({ name: e.target.value })}
                  placeholder='e.g. "Shelby Protocol Content"'
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[13px] font-semibold mb-2" style={{ color: "var(--light-text)" }}>
                  Description
                </label>
                <textarea
                  className="w-full px-4 py-3 rounded-[12px] border text-[14px] outline-none focus:border-[var(--accent)] transition-colors resize-none"
                  style={{ borderColor: "var(--light-border-strong)", color: "var(--light-text)" }}
                  rows={4}
                  value={form.description}
                  onChange={(e) => u({ description: e.target.value })}
                  placeholder="Describe what creators should make..."
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-[13px] font-semibold mb-2" style={{ color: "var(--light-text)" }}>
                  Type
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {CAMPAIGN_TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => u({ campaignType: t.value })}
                      className={`px-4 py-3 rounded-[12px] border-2 text-[14px] font-medium transition-all cursor-pointer ${
                        form.campaignType === t.value
                          ? "border-[var(--accent)] bg-[var(--accent)]/5 text-[var(--accent)]"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      style={form.campaignType !== t.value ? { color: "var(--light-text)" } : {}}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-[13px] font-semibold mb-2" style={{ color: "var(--light-text)" }}>
                  Category
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => u({ category: cat.value })}
                      className={`flex items-center gap-2.5 px-4 py-3 rounded-[12px] border-2 text-left transition-all cursor-pointer ${
                        form.category === cat.value
                          ? "border-[var(--accent)] bg-[var(--accent)]/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-[18px]">{cat.icon}</span>
                      <span className="text-[13px] font-medium" style={{ color: "var(--light-text)" }}>
                        {cat.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Campaign Duration */}
              <LightToggle
                label="Ongoing Campaign"
                desc="No end date — runs until budget is depleted"
                checked={form.ongoing}
                onChange={(v) => u({ ongoing: v })}
              />

              {/* Thumbnail */}
              <div>
                <label className="block text-[13px] font-semibold mb-2" style={{ color: "var(--light-text)" }}>
                  Thumbnail
                </label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleThumbnail}
                />
                {form.thumbnailPreview ? (
                  <div className="relative">
                    <img
                      src={form.thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-full h-48 object-cover rounded-[14px] border"
                      style={{ borderColor: "var(--light-border)" }}
                    />
                    <button
                      onClick={() => {
                        u({ thumbnailFile: null, thumbnailPreview: null });
                        if (fileRef.current) fileRef.current.value = "";
                      }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center text-[14px] hover:bg-black/70 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="w-full h-40 rounded-[14px] border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[var(--accent)] transition-colors"
                    style={{ borderColor: "var(--light-border-strong)" }}
                  >
                    <span className="text-[24px]">📷</span>
                    <span className="text-[13px] font-medium" style={{ color: "var(--light-text-secondary)" }}>
                      Click to upload thumbnail
                    </span>
                    <span className="text-[11px]" style={{ color: "var(--light-text-secondary)" }}>
                      JPG, PNG, WebP &middot; Max 5MB
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ═══ Step 3: Requirements ═══ */}
          {step === "requirements" && (
            <div className="space-y-6">
              {/* Custom Requirements */}
              <div>
                <label className="block text-[13px] font-semibold mb-3" style={{ color: "var(--light-text)" }}>
                  Custom Requirements
                </label>
                <div className="space-y-2 mb-3">
                  {form.customReqs.map((req, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 px-4 py-3 rounded-[12px] border"
                      style={{ borderColor: "var(--light-border)" }}
                    >
                      <span className="text-[13px] flex-1" style={{ color: "var(--light-text)" }}>
                        {req}
                      </span>
                      <button
                        onClick={() => u({ customReqs: form.customReqs.filter((_, x) => x !== i) })}
                        className="text-[14px] hover:opacity-70 cursor-pointer"
                        style={{ color: "var(--light-text-secondary)" }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    className="flex-1 px-4 py-3 rounded-[12px] border text-[13px] outline-none focus:border-[var(--accent)] transition-colors"
                    style={{ borderColor: "var(--light-border-strong)", color: "var(--light-text)" }}
                    value={newReq}
                    onChange={(e) => setNewReq(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCustomReq()}
                    placeholder="Add a requirement..."
                  />
                  <button
                    onClick={addCustomReq}
                    className="px-5 py-3 rounded-[12px] bg-[var(--accent)] text-white text-[13px] font-semibold cursor-pointer hover:opacity-90"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Video Examples */}
              <div>
                <label className="block text-[13px] font-semibold mb-3" style={{ color: "var(--light-text)" }}>
                  Video Examples
                </label>
                <div className="space-y-2 mb-3">
                  {form.videoExamples.map((url, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 px-4 py-3 rounded-[12px] border"
                      style={{ borderColor: "var(--light-border)" }}
                    >
                      <span className="text-[12px] font-mono flex-1 truncate" style={{ color: "var(--light-text-secondary)" }}>
                        {url}
                      </span>
                      <button
                        onClick={() => u({ videoExamples: form.videoExamples.filter((_, x) => x !== i) })}
                        className="text-[14px] hover:opacity-70 cursor-pointer"
                        style={{ color: "var(--light-text-secondary)" }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    className="flex-1 px-4 py-3 rounded-[12px] border text-[13px] outline-none focus:border-[var(--accent)] transition-colors"
                    style={{ borderColor: "var(--light-border-strong)", color: "var(--light-text)" }}
                    value={newExample}
                    onChange={(e) => setNewExample(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addVideoExample()}
                    placeholder="Paste video URL..."
                  />
                  <button
                    onClick={addVideoExample}
                    className="px-5 py-3 rounded-[12px] bg-[var(--accent)] text-white text-[13px] font-semibold cursor-pointer hover:opacity-90"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Content Similarity Enforcement */}
              <div>
                <label className="block text-[13px] font-semibold mb-1" style={{ color: "var(--light-text)" }}>
                  Content Similarity Enforcement
                </label>
                <p className="text-[11px] mb-4" style={{ color: "var(--light-text-secondary)" }}>
                  How closely must clips match your original source content? Stricter settings reject clips that add too much extra material.
                </p>
                <div className="px-4 py-5 rounded-[14px] border" style={{ borderColor: "var(--light-border)", background: "var(--light-chip-bg)" }}>
                  {/* Slider */}
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={form.similarityThreshold}
                    onChange={(e) => u({ similarityThreshold: +e.target.value })}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, var(--accent) ${form.similarityThreshold}%, #e5e7eb ${form.similarityThreshold}%)`,
                    }}
                  />
                  {/* Labels */}
                  <div className="flex justify-between mt-2">
                    <span className="text-[10px]" style={{ color: "var(--light-text-secondary)" }}>Flexible</span>
                    <span className="text-[10px]" style={{ color: "var(--light-text-secondary)" }}>Moderate</span>
                    <span className="text-[10px]" style={{ color: "var(--light-text-secondary)" }}>Strict</span>
                  </div>
                  {/* Current value display */}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[12px] font-medium" style={{ color: "var(--light-text)" }}>
                      Threshold: {form.similarityThreshold}%
                    </span>
                    <span
                      className="text-[11px] px-2.5 py-1 rounded-lg font-medium"
                      style={{
                        background: form.similarityThreshold <= 30
                          ? "#dcfce7" : form.similarityThreshold <= 60
                          ? "#fef9c3" : form.similarityThreshold <= 80
                          ? "#ffedd5" : "#fee2e2",
                        color: form.similarityThreshold <= 30
                          ? "#166534" : form.similarityThreshold <= 60
                          ? "#854d0e" : form.similarityThreshold <= 80
                          ? "#9a3412" : "#991b1b",
                      }}
                    >
                      {form.similarityThreshold <= 20 ? "Very Flexible — most clips pass"
                        : form.similarityThreshold <= 40 ? "Flexible — minor additions OK"
                        : form.similarityThreshold <= 60 ? "Moderate — some extras OK"
                        : form.similarityThreshold <= 80 ? "Strict — close to source only"
                        : "Very Strict — near-identical required"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Preset Requirements */}
              <div>
                <label className="block text-[13px] font-semibold mb-3" style={{ color: "var(--light-text)" }}>
                  Preset Requirements
                </label>
                <div
                  className="rounded-[14px] border overflow-hidden divide-y"
                  style={{ borderColor: "var(--light-border)", divideColor: "var(--light-border)" } as React.CSSProperties}
                >
                  {PRESET_REQS.map((preset) => (
                    <div key={preset.key} className="px-4 py-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 mr-3">
                          <div className="text-[13px] font-medium" style={{ color: "var(--light-text)" }}>
                            {preset.label}
                          </div>
                          <div className="text-[11px] mt-0.5" style={{ color: "var(--light-text-secondary)" }}>
                            {preset.desc}
                          </div>
                        </div>
                        <LightSwitch
                          checked={!!form.presetToggles[preset.key]}
                          onChange={() => togglePreset(preset.key)}
                        />
                      </div>
                      {/* Conditional inputs */}
                      {form.presetToggles[preset.key] && preset.hasInput && (
                        <div className="mt-3">
                          {preset.hasInput === "link" && (
                            <input
                              className="w-full px-3 py-2.5 rounded-[10px] border text-[13px] outline-none"
                              style={{ borderColor: "var(--light-border-strong)", color: "var(--light-text)" }}
                              placeholder="Paste sound/music link..."
                              value={form.presetInputs[preset.key] || ""}
                              onChange={(e) => setPresetInput(preset.key, e.target.value)}
                            />
                          )}
                          {preset.hasInput === "url" && (
                            <input
                              className="w-full px-3 py-2.5 rounded-[10px] border text-[13px] outline-none"
                              style={{ borderColor: "var(--light-border-strong)", color: "var(--light-text)" }}
                              placeholder="URL to include in bio..."
                              value={form.presetInputs[preset.key] || ""}
                              onChange={(e) => setPresetInput(preset.key, e.target.value)}
                            />
                          )}
                          {preset.hasInput === "text" && (
                            <input
                              className="w-full px-3 py-2.5 rounded-[10px] border text-[13px] outline-none"
                              style={{ borderColor: "var(--light-border-strong)", color: "var(--light-text)" }}
                              placeholder="Required text..."
                              value={form.presetInputs[preset.key] || ""}
                              onChange={(e) => setPresetInput(preset.key, e.target.value)}
                            />
                          )}
                          {preset.hasInput === "hours" && (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                className="w-20 px-3 py-2.5 rounded-[10px] border text-[13px] outline-none"
                                style={{ borderColor: "var(--light-border-strong)", color: "var(--light-text)" }}
                                placeholder="48"
                                value={form.presetInputs[preset.key] || ""}
                                onChange={(e) => setPresetInput(preset.key, e.target.value)}
                              />
                              <span className="text-[12px]" style={{ color: "var(--light-text-secondary)" }}>
                                hours
                              </span>
                            </div>
                          )}
                          {preset.hasInput === "minmax" && (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                className="w-20 px-3 py-2.5 rounded-[10px] border text-[13px] outline-none"
                                style={{ borderColor: "var(--light-border-strong)", color: "var(--light-text)" }}
                                placeholder="Min"
                                value={form.presetMin}
                                onChange={(e) => u({ presetMin: e.target.value })}
                              />
                              <span className="text-[12px]" style={{ color: "var(--light-text-secondary)" }}>
                                to
                              </span>
                              <input
                                type="number"
                                className="w-20 px-3 py-2.5 rounded-[10px] border text-[13px] outline-none"
                                style={{ borderColor: "var(--light-border-strong)", color: "var(--light-text)" }}
                                placeholder="Max"
                                value={form.presetMax}
                                onChange={(e) => u({ presetMax: e.target.value })}
                              />
                              <span className="text-[12px]" style={{ color: "var(--light-text-secondary)" }}>
                                seconds
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══ Step 4: Contact ═══ */}
          {step === "contact" && (
            <div className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-[13px] font-semibold mb-2" style={{ color: "var(--light-text)" }}>
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-[12px] border text-[14px] outline-none focus:border-[var(--accent)] transition-colors"
                  style={{ borderColor: "var(--light-border-strong)", color: "var(--light-text)" }}
                  value={form.email}
                  onChange={(e) => u({ email: e.target.value })}
                  placeholder="you@company.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[13px] font-semibold mb-2" style={{ color: "var(--light-text)" }}>
                  Phone
                </label>
                <div className="flex gap-2">
                  <div
                    className="px-4 py-3 rounded-[12px] border text-[14px] flex items-center shrink-0"
                    style={{ borderColor: "var(--light-border-strong)", color: "var(--light-text-secondary)" }}
                  >
                    +1
                  </div>
                  <input
                    type="tel"
                    className="flex-1 px-4 py-3 rounded-[12px] border text-[14px] outline-none focus:border-[var(--accent)] transition-colors"
                    style={{ borderColor: "var(--light-border-strong)", color: "var(--light-text)" }}
                    value={form.phone}
                    onChange={(e) => u({ phone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              {/* Preferred Group Chat */}
              <div>
                <label className="block text-[13px] font-semibold mb-2" style={{ color: "var(--light-text)" }}>
                  Preferred group chat
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {CHAT_APPS.map((app) => (
                    <button
                      key={app}
                      onClick={() => u({ chatApp: app })}
                      className={`px-4 py-3 rounded-[12px] border-2 text-[14px] font-medium transition-all cursor-pointer ${
                        form.chatApp === app
                          ? "border-[var(--accent)] bg-[var(--accent)]/5 text-[var(--accent)]"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      style={form.chatApp !== app ? { color: "var(--light-text)" } : {}}
                    >
                      {app}
                    </button>
                  ))}
                </div>
              </div>

              {/* ToS */}
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.agreedTos}
                  onChange={(e) => u({ agreedTos: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded accent-[var(--accent)]"
                />
                <span className="text-[13px] leading-relaxed" style={{ color: "var(--light-text-secondary)" }}>
                  I agree to the{" "}
                  <span className="underline" style={{ color: "var(--accent)" }}>
                    Terms of Service
                  </span>{" "}
                  and{" "}
                  <span className="underline" style={{ color: "var(--accent)" }}>
                    Content Policy
                  </span>
                  . Campaign funds are held in escrow on Aptos and released according to the smart contract rules.
                </span>
              </label>
            </div>
          )}

          {/* ═══ Step 5: Preview ═══ */}
          {step === "preview" && (
            <div className="space-y-6">
              {/* Preview Card */}
              <div
                className="rounded-[16px] overflow-hidden border"
                style={{ borderColor: "var(--light-border)" }}
              >
                {/* Thumbnail */}
                <div
                  className="h-44 flex items-center justify-center"
                  style={{
                    background: form.thumbnailPreview
                      ? `url(${form.thumbnailPreview}) center/cover`
                      : "linear-gradient(135deg, var(--accent), #6366F1)",
                  }}
                >
                  {!form.thumbnailPreview && (
                    <span className="text-white/60 text-[14px] font-medium">No thumbnail</span>
                  )}
                </div>

                <div className="p-5">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {form.platforms.map((pk) => {
                      const pl = PLATFORMS.find((p) => p.key === pk);
                      return pl ? (
                        <span
                          key={pk}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-medium"
                          style={{ background: "var(--light-chip-bg)", color: "var(--light-text-secondary)" }}
                        >
                          {pl.label}
                        </span>
                      ) : null;
                    })}
                    <span
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium"
                      style={{ background: "var(--light-chip-bg)", color: "var(--light-text-secondary)" }}
                    >
                      {CATEGORIES.find((c) => c.value === form.category)?.label || form.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-[18px] font-bold mb-1" style={{ color: "var(--light-text)" }}>
                    {form.name || "Untitled Campaign"}
                  </h3>

                  {/* Description */}
                  {form.description && (
                    <p className="text-[13px] mb-4 line-clamp-2" style={{ color: "var(--light-text-secondary)" }}>
                      {form.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div
                    className="grid grid-cols-3 gap-3 py-3 border-t border-b"
                    style={{ borderColor: "var(--light-border)" }}
                  >
                    <div>
                      <div className="text-[11px]" style={{ color: "var(--light-text-secondary)" }}>
                        Budget
                      </div>
                      <div className="text-[16px] font-bold" style={{ color: "var(--light-text)" }}>
                        ${form.totalBudget.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px]" style={{ color: "var(--light-text-secondary)" }}>
                        Rate
                      </div>
                      <div className="text-[16px] font-bold" style={{ color: "var(--light-text)" }}>
                        ${form.ratePerMille.toFixed(2)}
                        <span className="text-[11px] font-normal" style={{ color: "var(--light-text-secondary)" }}>
                          /1K
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px]" style={{ color: "var(--light-text-secondary)" }}>
                        Est. Views
                      </div>
                      <div className="text-[16px] font-bold" style={{ color: "var(--accent)" }}>
                        ~{estViewsFormatted}
                      </div>
                    </div>
                  </div>

                  {/* Requirements count */}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[12px]" style={{ color: "var(--light-text-secondary)" }}>
                      {form.customReqs.length + Object.values(form.presetToggles).filter(Boolean).length} requirements
                    </span>
                    <span className="text-[12px]" style={{ color: "var(--light-text-secondary)" }}>
                      {form.accessType === "open" ? "Open to public" : "Application only"}
                    </span>
                  </div>

                  {/* Max earnings */}
                  <div className="mt-3">
                    <span className="text-[12px]" style={{ color: "var(--light-text-secondary)" }}>
                      Max earnings: {form.noLimit ? "No limit" : `$${form.maxEarnings.toLocaleString()}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details Summary */}
              <div
                className="rounded-[14px] p-4 border space-y-2"
                style={{ borderColor: "var(--light-border)", background: "var(--light-chip-bg)" }}
              >
                <div className="text-[11px] font-medium mb-2" style={{ color: "var(--light-text-secondary)" }}>
                  Review
                </div>
                <Row label="Type" value={CAMPAIGN_TYPES.find((t) => t.value === form.campaignType)?.label || ""} />
                <Row label="Platforms" value={form.platforms.map((p) => PLATFORMS.find((pl) => pl.key === p)?.label).filter(Boolean).join(", ")} />
                <Row label="Similarity" value={`${form.similarityThreshold}% threshold`} />
                <Row label="Duration" value={form.ongoing ? "Ongoing" : "Fixed"} />
                <Row label="Contact" value={form.email || "—"} />
                <Row label="Chat" value={form.chatApp} />
              </div>
            </div>
          )}

          {/* ═══ Navigation Buttons ═══ */}
          <div className="flex gap-3 mt-8">
            {stepIdx > 0 && (
              <button
                onClick={() => setStepIdx(stepIdx - 1)}
                className="px-7 py-3.5 text-[15px] font-medium rounded-[14px] border cursor-pointer transition-colors"
                style={{ color: "var(--light-text-secondary)", borderColor: "var(--light-border-strong)" }}
              >
                Back
              </button>
            )}
            <button
              onClick={() => {
                if (step === "preview") {
                  handlePublish();
                } else {
                  setStepIdx(stepIdx + 1);
                }
              }}
              disabled={!canProceed() || publishing}
              className={`flex-1 py-3.5 text-[15px] font-semibold text-white rounded-[14px] transition-opacity cursor-pointer ${
                !canProceed() || publishing
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:opacity-[0.88]"
              }`}
              style={{ background: step === "preview" ? "var(--accent)" : "#111" }}
            >
              {publishing
                ? "Publishing..."
                : step === "preview"
                  ? "Publish Campaign"
                  : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Subcomponents ─────────────────────────────────── */

function LightToggle({
  label,
  desc,
  checked,
  onChange,
  inline,
}: {
  label: string;
  desc?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  inline?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between ${inline ? "gap-2" : "py-2 gap-3"}`}>
      <div className={inline ? "" : "flex-1"}>
        <span
          className={`text-[13px] font-medium ${inline ? "" : "block"}`}
          style={{ color: "var(--light-text)" }}
        >
          {label}
        </span>
        {desc && (
          <span className="text-[11px] block mt-0.5" style={{ color: "var(--light-text-secondary)" }}>
            {desc}
          </span>
        )}
      </div>
      <LightSwitch checked={checked} onChange={() => onChange(!checked)} />
    </div>
  );
}

function LightSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`w-11 h-6 rounded-full relative shrink-0 transition-colors cursor-pointer ${
        checked ? "bg-[var(--accent)]" : "bg-gray-300"
      }`}
    >
      <div
        className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all shadow-sm ${
          checked ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[12px]">
      <span style={{ color: "var(--light-text-secondary)" }}>{label}</span>
      <span className="font-medium" style={{ color: "var(--light-text)" }}>{value}</span>
    </div>
  );
}

/* ── Icons (reused from original) ──────────────────── */

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[20px] h-[20px] text-red-500">
      <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.53 3.5 12 3.5 12 3.5s-7.53 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14c1.85.55 9.38.55 9.38.55s7.53 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.81zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
    </svg>
  );
}
function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[20px] h-[20px]">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.4a8.16 8.16 0 0 0 4.77 1.53V7.48a4.85 4.85 0 0 1-1.01-.79z" />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[20px] h-[20px] text-purple-600">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[20px] h-[20px]">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
