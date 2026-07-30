"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { StepBasicInfo } from "./StepBasicInfo";
import { StepContentBank } from "./StepContentBank";
import { StepRequirements } from "./StepRequirements";
import { StepSimilarity } from "./StepSimilarity";
import { StepCpmBudget } from "./StepCpmBudget";
import { StepReview } from "./StepReview";
import { ThemeSwitcherDesktop } from "./ThemeSwitcher";

/* ── Types ──────────────────────────────────────── */

export interface UploadedAsset {
  fileName: string;
  fileSize: number;
  mimeType: string;
  blobName: string;
  contentHash: string;
  explorerUrl: string;
  thumbnailDataUrl?: string;
  status: "uploading" | "uploaded" | "failed";
  progress: number;
}

export interface CampaignFormState {
  name: string;
  description: string;
  category: string;
  campaignType: number;
  platforms: number[];

  uploadedAssets: UploadedAsset[];

  presetToggles: Record<string, boolean>;
  presetInputs: Record<string, string>;
  presetVideoLengthMin: string;
  presetVideoLengthMax: string;
  customRequirements: string[];

  audioSlider: number;
  visualSlider: number;
  similarityPreset: "podcast" | "lifestyle" | "performance" | "custom";

  floorCpm: number;
  ceilingCpm: number;
  curveType: 0 | 1 | 2;
  totalBudget: number;

  agreedTos: boolean;
}

const INITIAL_STATE: CampaignFormState = {
  name: "",
  description: "",
  category: "Crypto",
  campaignType: 0,
  platforms: [0, 1],

  uploadedAssets: [],

  presetToggles: {},
  presetInputs: {},
  presetVideoLengthMin: "",
  presetVideoLengthMax: "",
  customRequirements: [],

  audioSlider: 50,
  visualSlider: 50,
  similarityPreset: "custom",

  floorCpm: 0.5,
  ceilingCpm: 1.5,
  curveType: 0,
  totalBudget: 500,

  agreedTos: false,
};

const STEPS = [
  { label: "Basic Info", short: "Info" },
  { label: "Content Bank", short: "Content" },
  { label: "Requirements", short: "Reqs" },
  { label: "Content Match", short: "Match" },
  { label: "Pricing", short: "Price" },
  { label: "Review", short: "Review" },
];

/* ── Serialize requirements ─────────────────────── */

function serializeRequirements(state: CampaignFormState): string[] {
  const reqs: string[] = [];
  const t = state.presetToggles;
  const inp = state.presetInputs;

  if (t.creatorNameInBio && inp.creatorNameInBio) reqs.push(`Creator name in bio: ${inp.creatorNameInBio}`);
  if (t.descriptionUrl && inp.descriptionUrl) reqs.push(`Description must include URL: ${inp.descriptionUrl}`);
  if (t.videoLength) reqs.push(`Video length: ${state.presetVideoLengthMin || "0"}s - ${state.presetVideoLengthMax || "\u221E"}s`);
  if (t.tier1Countries) reqs.push("Demographics must be majority tier-1 countries");
  if (t.specificSound) reqs.push(`Must use specific sound: ${inp.specificSound || "(any)"}`);
  if (t.captionText && inp.captionText) reqs.push(`Caption must include: "${inp.captionText}"`);
  if (t.hashtags && inp.hashtags) reqs.push(`Required hashtags: ${inp.hashtags}`);
  reqs.push(...state.customRequirements);
  return reqs;
}

/* ── Component ──────────────────────────────────── */

export function CampaignCreateWizard({ variant = "classic" }: { variant?: "classic" | "whop" | "light" }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CampaignFormState>({ ...INITIAL_STATE });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(
    (patch: Partial<CampaignFormState>) => setForm((prev) => ({ ...prev, ...patch })),
    []
  );

  const canAdvance = (): boolean => {
    switch (step) {
      case 0: return form.name.trim().length > 0 && form.platforms.length > 0;
      case 1: return true;
      case 2: return true;
      case 3: return form.audioSlider + form.visualSlider >= 80;
      case 4: return form.floorCpm > 0 && form.ceilingCpm >= form.floorCpm && form.totalBudget >= 500;
      case 5: return form.agreedTos;
      default: return true;
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    const floorCpmOctas = Math.round(form.floorCpm * 1_000_000);
    const ceilingCpmOctas = Math.round(form.ceilingCpm * 1_000_000);
    const fundAmountOctas = Math.round(form.totalBudget * 1_000_000);
    const cpmRates = [0, 0, 0, 0];
    for (const p of form.platforms) {
      if (p >= 0 && p < 4) cpmRates[p] = floorCpmOctas;
    }

    const payload = {
      name: form.name,
      description: form.description,
      campaignType: form.campaignType,
      category: form.category,
      platforms: form.platforms,
      contentBankBlobs: form.uploadedAssets.filter((a) => a.status === "uploaded").map((a) => a.blobName),
      requirements: serializeRequirements(form),
      audioSlider: form.audioSlider,
      visualSlider: form.visualSlider,
      floorCpm: floorCpmOctas,
      ceilingCpm: ceilingCpmOctas,
      curveType: form.curveType,
      fundAmount: fundAmountOctas,
      cpmRates,
      requireApplication: false,
      showOnDiscover: true,
    };

    try {
      const res = await fetch("/api/rewards/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create campaign");
      const data = await res.json();
      setCreatedId(data.id || data.address || null);
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const goNext = () => { if (canAdvance()) setStep((s) => s + 1); };
  const goBack = () => setStep((s) => Math.max(0, s - 1));

  /* ── Whop variant ───────────────────────────── */

  if (variant === "whop") {
    const stepContent = (
      <>
        {step === 0 && <StepBasicInfo form={form} update={update} />}
        {step === 1 && <StepContentBank form={form} update={update} />}
        {step === 2 && <StepRequirements form={form} update={update} />}
        {step === 3 && <StepSimilarity form={form} update={update} />}
        {step === 4 && <StepCpmBudget form={form} update={update} />}
        {step === 5 && (
          <StepReview form={form} update={update} submitting={submitting} submitted={submitted}
            createdId={createdId} error={error} onSubmit={handleSubmit} />
        )}
      </>
    );

    return (
      <div className="whop-theme flex flex-col items-center justify-center min-h-[calc(100vh-108px)] px-4 py-6">
        <div className="w-full md:w-auto md:max-w-[95vw] overflow-hidden border md:rounded-[20px]"
          style={{ borderColor: "var(--whop-border-subtle)", background: "var(--whop-surface)",
            backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
            maxHeight: "min(90vh, 900px)", display: "flex", flexDirection: "column" }}>
          <div className="absolute inset-0 whop-form-bg pointer-events-none" style={{ borderRadius: "inherit" }} />
          <div className="relative" style={{ display: "flex", alignItems: "center", gap: 8,
            borderBottom: "1px solid var(--whop-border-subtle)", padding: "16px 20px" }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, lineHeight: "26px", letterSpacing: "0.18px",
              color: "var(--whop-text)", margin: 0 }}>New Content Rewards Campaign</h2>
            <div className="whop-dots" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
              {STEPS.map((_, i) => (
                <div key={i} className="whop-dot" style={{ width: 16 }}>
                  {i <= step && <div className="whop-dot-fill" />}
                </div>
              ))}
            </div>
          </div>
          <div className="relative flex flex-1 flex-col overflow-hidden md:flex-row" style={{ minHeight: 0 }}>
            <div className="flex min-h-0 flex-1 flex-col md:w-[446px] md:flex-none">
              <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="flex flex-col gap-6 p-6 md:p-10 animate-enter">{stepContent}</div>
              </div>
              {!submitted && (
                <div className="whop-footer">
                  <button onClick={goBack} disabled={step === 0} className="whop-btn-back">Back</button>
                  {step < 5 ? (
                    <button onClick={goNext} disabled={!canAdvance()} className="whop-btn-next">
                      Next
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7" />
                      </svg>
                    </button>
                  ) : (
                    <button onClick={handleSubmit} disabled={!canAdvance() || submitting} className="whop-btn-next">
                      {submitting ? "Creating..." : "Create Campaign"}
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="hidden md:flex flex-col items-center justify-center px-6 py-10"
              style={{ background: "rgba(35, 31, 30, 0.3)", minWidth: 380 }}>
              <div className="flex items-center gap-1.5 mb-4">
                <svg className="w-4 h-4" style={{ color: "var(--whop-text-muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-[14px] font-medium" style={{ color: "var(--whop-text-muted)" }}>Preview</span>
              </div>
              <div className="w-[345px] rounded-[20px] border p-4" style={{ borderColor: "var(--whop-border-subtle)", background: "var(--whop-surface)" }}>
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div className="w-[80px] h-[52px] rounded-lg overflow-hidden" style={{ background: "var(--whop-input-bg)" }}>
                      <img src="/icon-192.png" alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[12px] font-medium" style={{ background: "var(--whop-input-bg)", color: "var(--whop-text-dim)", border: "1px solid var(--whop-border-subtle)" }}>
                      {["Clipping", "UGC", "Both"][form.campaignType]}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-[14px] font-semibold truncate" style={{ color: "var(--whop-text)" }}>
                      {form.name || "Your Campaign"}
                    </h3>
                    <p className="text-[12px] mt-1" style={{ color: "var(--whop-text-dim)" }}>
                      {form.description || "Campaign description..."}
                    </p>
                  </div>
                  <div className="flex justify-between pt-3 mt-3" style={{ borderTop: "1px solid var(--whop-border-subtle)" }}>
                    <div>
                      <div className="text-[12px]" style={{ color: "var(--whop-text-muted)" }}>Budget</div>
                      <div className="text-[14px] font-medium" style={{ color: "var(--whop-text)" }}>${form.totalBudget.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[12px]" style={{ color: "var(--whop-text-muted)" }}>CPM</div>
                      <div className="text-[14px] font-medium" style={{ color: "var(--whop-text)" }}>${form.floorCpm.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Classic variant ────────────────────────── */

  return (
    <div className="relative z-10 animate-enter max-w-3xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
      {/* Back link */}
      <Link href="/rewards"
        className="inline-flex items-center gap-1.5 text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors mb-8">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Rewards
      </Link>

      {/* Step progress */}
      <div className="mb-6">
        <div className="flex gap-1 mb-3">
          {STEPS.map((s, i) => (
            <div key={s.label} className="flex-1">
              <div className={`h-[3px] rounded-full transition-all duration-300 ${
                i < step ? "bg-[#FA4616]/50" :
                i === step ? "bg-[#FA4616]" :
                "bg-white/[0.06]"
              }`} />
            </div>
          ))}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-[11px] text-zinc-600 font-medium">
            {step + 1} / {STEPS.length}
          </span>
          <h1 className="text-[18px] sm:text-[20px] font-bold text-white font-display">
            {STEPS[step].label}
          </h1>
        </div>
      </div>

      {/* Step content — animated transitions */}
      <div className="mb-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="surface-1 rounded-[16px] p-5 sm:p-6">
              {step === 0 && <StepBasicInfo form={form} update={update} />}
              {step === 1 && <StepContentBank form={form} update={update} />}
              {step === 2 && <StepRequirements form={form} update={update} />}
              {step === 3 && <StepSimilarity form={form} update={update} />}
              {step === 4 && <StepCpmBudget form={form} update={update} />}
              {step === 5 && (
                <StepReview form={form} update={update} submitting={submitting}
                  submitted={submitted} createdId={createdId} error={error}
                  onSubmit={handleSubmit} />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Error */}
      {error && step !== 5 && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[12px]">
          {error}
        </div>
      )}

      {/* Navigation */}
      {!submitted && (
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={goBack}
            className={`px-5 py-2.5 rounded-[10px] text-zinc-500 text-[12px] font-medium hover:text-zinc-300 transition-colors ${
              step === 0 ? "invisible" : ""
            }`}
          >
            Back
          </button>

          {step < 5 ? (
            <button
              onClick={goNext}
              disabled={!canAdvance()}
              className={`flex-1 max-w-[180px] flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-[10px] text-[13px] font-semibold transition-all ${
                canAdvance()
                  ? "bg-[#FA4616] text-white hover:bg-[#e03d12]"
                  : "bg-white/[0.04] text-zinc-600 cursor-not-allowed"
              }`}
            >
              Continue
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canAdvance() || submitting}
              className={`flex-1 max-w-[200px] px-5 py-2.5 rounded-[10px] text-[13px] font-semibold transition-all ${
                canAdvance() && !submitting
                  ? "bg-[#FA4616] text-white hover:bg-[#e03d12]"
                  : "bg-white/[0.04] text-zinc-600 cursor-not-allowed"
              }`}
            >
              {submitting ? "Creating..." : "Create Campaign"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
