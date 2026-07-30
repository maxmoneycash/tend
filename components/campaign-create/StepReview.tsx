"use client";

import Link from "next/link";
import type { CampaignFormState } from "./CampaignCreateWizard";

const PLATFORM_NAMES: Record<number, string> = {
  0: "YouTube",
  1: "TikTok",
  2: "Instagram",
  3: "X",
};

const TYPE_NAMES: Record<number, string> = {
  0: "Clipping",
  1: "UGC",
  2: "Both",
};

const CURVE_NAMES: Record<number, string> = {
  0: "Linear",
  1: "Convex",
  2: "Concave",
};

function formatFileSize(bytes: number): string {
  if (bytes >= 1e9) return (bytes / 1e9).toFixed(1) + " GB";
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(1) + " MB";
  if (bytes >= 1e3) return (bytes / 1e3).toFixed(1) + " KB";
  return bytes + " B";
}

function formatViews(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toString();
}

function serializeRequirements(form: CampaignFormState): string[] {
  const reqs: string[] = [];
  const t = form.presetToggles;
  const inp = form.presetInputs;

  if (t.creatorNameInBio && inp.creatorNameInBio)
    reqs.push(`Creator name in bio: ${inp.creatorNameInBio}`);
  if (t.descriptionUrl && inp.descriptionUrl)
    reqs.push(`Description must include URL: ${inp.descriptionUrl}`);
  if (t.videoLength)
    reqs.push(`Video length: ${form.presetVideoLengthMin || "0"}s \u2013 ${form.presetVideoLengthMax || "\u221E"}s`);
  if (t.tier1Countries)
    reqs.push("Demographics must be majority tier-1 countries");
  if (t.specificSound)
    reqs.push(`Must use specific sound: ${inp.specificSound || "(any)"}`);
  if (t.captionText && inp.captionText)
    reqs.push(`Caption must include: \u201C${inp.captionText}\u201D`);
  if (t.hashtags && inp.hashtags)
    reqs.push(`Required hashtags: ${inp.hashtags}`);
  reqs.push(...form.customRequirements);
  return reqs;
}

interface Props {
  form: CampaignFormState;
  update: (patch: Partial<CampaignFormState>) => void;
  submitting: boolean;
  submitted: boolean;
  createdId: string | null;
  error: string | null;
  onSubmit: () => void;
}

export function StepReview({
  form,
  update,
  submitting,
  submitted,
  createdId,
  error,
  onSubmit,
}: Props) {
  const requirements = serializeRequirements(form);
  const avgCpm =
    form.floorCpm > 0 && form.ceilingCpm > 0
      ? (form.floorCpm + form.ceilingCpm) / 2
      : 0;
  const estViews =
    avgCpm > 0 && form.totalBudget > 0
      ? Math.round((form.totalBudget / avgCpm) * 1000)
      : 0;
  const totalAssetSize = form.uploadedAssets.reduce((s, a) => s + a.fileSize, 0);

  /* ── Success state ──────────────────── */

  if (submitted) {
    return (
      <div className="text-center py-6 space-y-5">
        {/* Check ring */}
        <div className="relative mx-auto w-16 h-16">
          <div className="absolute inset-0 rounded-full bg-green-500/10" />
          <div className="absolute inset-0 rounded-full border border-green-500/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
        </div>

        <div>
          <h3 className="text-[18px] font-bold text-white font-display">
            Campaign Created!
          </h3>
          <p className="text-[12px] text-zinc-500 mt-1.5">
            Your campaign is live. Clippers can start submitting content.
          </p>
        </div>

        {/* Summary card */}
        <div className="bg-white/[0.03] rounded-xl p-4 text-left max-w-sm mx-auto">
          <p className="text-[14px] font-semibold text-white">{form.name}</p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            {TYPE_NAMES[form.campaignType]} &middot; {form.category} &middot;{" "}
            {form.platforms.map((p) => PLATFORM_NAMES[p]).join(", ")}
          </p>
          <div className="flex justify-between mt-3 pt-3 border-t border-white/[0.04]">
            <div>
              <p className="text-[9px] text-zinc-600 uppercase tracking-wider">Budget</p>
              <p className="text-[15px] font-bold text-white font-mono">
                ${form.totalBudget.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-zinc-600 uppercase tracking-wider">CPM Range</p>
              <p className="text-[15px] font-bold text-white font-mono">
                ${form.floorCpm.toFixed(2)}&ndash;${form.ceilingCpm.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2.5 pt-1">
          {createdId && (
            <Link
              href={`/rewards/${createdId}`}
              className="px-5 py-2.5 rounded-[10px] bg-[#FA4616] text-white text-[13px] font-semibold hover:bg-[#e03d12] transition-colors"
            >
              View Campaign
            </Link>
          )}
          <Link
            href="/rewards"
            className="px-5 py-2.5 rounded-[10px] text-zinc-400 text-[13px] font-medium hover:text-white transition-colors"
          >
            Back to Rewards
          </Link>
        </div>
      </div>
    );
  }

  /* ── Review state ──────────────────── */

  return (
    <div className="space-y-0">
      {/* Campaign Info */}
      <ReviewSection label="Campaign Info">
        <div className="space-y-2.5">
          <ReviewRow label="Name" value={form.name} />
          {form.description && (
            <ReviewRow label="Description" value={form.description} truncate />
          )}
          <ReviewRow label="Type" value={TYPE_NAMES[form.campaignType]} />
          <ReviewRow label="Category" value={form.category} />
          <ReviewRow
            label="Platforms"
            value={form.platforms.map((p) => PLATFORM_NAMES[p]).join(", ")}
          />
        </div>
      </ReviewSection>

      <Divider />

      {/* Content Bank */}
      <ReviewSection label="Content Bank">
        {form.uploadedAssets.length > 0 ? (
          <div className="space-y-2">
            <ReviewRow
              label="Files"
              value={`${form.uploadedAssets.length} file${form.uploadedAssets.length !== 1 ? "s" : ""} · ${formatFileSize(totalAssetSize)}`}
            />
            {/* Thumbnails */}
            {form.uploadedAssets.some((a) => a.thumbnailDataUrl) && (
              <div className="flex gap-1.5 pt-0.5">
                {form.uploadedAssets
                  .filter((a) => a.thumbnailDataUrl)
                  .slice(0, 3)
                  .map((a, i) => (
                    <img
                      key={i}
                      src={a.thumbnailDataUrl}
                      alt=""
                      className="w-16 h-10 rounded-md object-cover bg-zinc-800"
                    />
                  ))}
                {form.uploadedAssets.filter((a) => a.thumbnailDataUrl).length > 3 && (
                  <div className="w-16 h-10 rounded-md bg-white/[0.04] flex items-center justify-center text-[10px] text-zinc-500 font-mono">
                    +{form.uploadedAssets.filter((a) => a.thumbnailDataUrl).length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="text-[11px] text-zinc-600">No files uploaded — can be added later</p>
        )}
      </ReviewSection>

      <Divider />

      {/* Requirements */}
      <ReviewSection label={`Requirements${requirements.length > 0 ? ` · ${requirements.length}` : ""}`}>
        {requirements.length > 0 ? (
          <ul className="space-y-1.5">
            {requirements.map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-zinc-600 mt-[3px] shrink-0 text-[8px]">{"\u25CF"}</span>
                <span className="text-[12px] text-zinc-400">{r}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[11px] text-zinc-600">No requirements set</p>
        )}
      </ReviewSection>

      <Divider />

      {/* Content Similarity */}
      <ReviewSection label="Content Match">
        <div className="flex gap-6">
          <div>
            <p className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1">Audio</p>
            <p className="text-[20px] font-bold text-white font-mono leading-none">{form.audioSlider}</p>
          </div>
          <div>
            <p className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1">Visual</p>
            <p className="text-[20px] font-bold text-white font-mono leading-none">{form.visualSlider}</p>
          </div>
          <div>
            <p className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1">Combined</p>
            <p className={`text-[20px] font-bold font-mono leading-none ${
              form.audioSlider + form.visualSlider >= 80 ? "text-green-400" : "text-red-400"
            }`}>
              {form.audioSlider + form.visualSlider}
            </p>
          </div>
          {form.similarityPreset !== "custom" && (
            <div className="ml-auto">
              <p className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1">Preset</p>
              <p className="text-[12px] text-zinc-400 capitalize">{form.similarityPreset}</p>
            </div>
          )}
        </div>
      </ReviewSection>

      <Divider />

      {/* CPM & Budget */}
      <ReviewSection label="Pricing">
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <div>
            <p className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1">Floor CPM</p>
            <p className="text-[20px] font-bold text-white font-mono leading-none">${form.floorCpm.toFixed(2)}</p>
            <p className="text-[9px] text-zinc-600 mt-0.5">per 1K views</p>
          </div>
          <div>
            <p className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1">Ceiling CPM</p>
            <p className="text-[20px] font-bold text-white font-mono leading-none">${form.ceilingCpm.toFixed(2)}</p>
            <p className="text-[9px] text-zinc-600 mt-0.5">per 1K views</p>
          </div>
          <div>
            <p className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1">Total Budget</p>
            <p className="text-[20px] font-bold text-white font-mono leading-none">${form.totalBudget.toLocaleString()}</p>
            <p className="text-[9px] text-zinc-600 mt-0.5">USDT</p>
          </div>
          <div>
            <p className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1">Curve</p>
            <p className="text-[14px] font-semibold text-zinc-300">{CURVE_NAMES[form.curveType]}</p>
            {estViews > 0 && (
              <p className="text-[9px] text-zinc-600 mt-0.5">~{formatViews(estViews)} est. views</p>
            )}
          </div>
        </div>
      </ReviewSection>

      <Divider />

      {/* Terms */}
      <div className="pt-3 pb-1">
        <button
          onClick={() => update({ agreedTos: !form.agreedTos })}
          className="flex items-start gap-3 cursor-pointer w-full text-left"
        >
          <div className={`w-4 h-4 rounded shrink-0 mt-0.5 border transition-all flex items-center justify-center ${
            form.agreedTos
              ? "bg-[#FA4616] border-[#FA4616]"
              : "bg-white/[0.04] border-white/[0.15] hover:border-white/[0.25]"
          }`}>
            {form.agreedTos && (
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
          </div>
          <div>
            <p className="text-[12px] text-white font-medium leading-snug">
              I agree to the Terms of Service and Content Policy
            </p>
            <p className="text-[10px] text-zinc-600 mt-1 leading-relaxed">
              Budget, CPM rates, and similarity settings become{" "}
              <span className="text-zinc-400">immutable</span> after funding.
            </p>
          </div>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="px-3.5 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[12px] mt-2">
          {error}
        </div>
      )}

      {/* Create button */}
      <div className="pt-3">
        <button
          onClick={onSubmit}
          disabled={!form.agreedTos || submitting}
          className={`w-full py-3.5 rounded-[12px] text-[14px] font-bold transition-all ${
            form.agreedTos && !submitting
              ? "bg-[#FA4616] text-white hover:bg-[#e03d12] shadow-[0_4px_24px_rgba(250,70,22,0.3)]"
              : "bg-white/[0.04] text-zinc-600 cursor-not-allowed"
          }`}
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12" cy="12" r="10"
                  stroke="currentColor" strokeWidth="3" strokeLinecap="round"
                  strokeDasharray="31.4 31.4" strokeDashoffset="10"
                />
              </svg>
              Creating Campaign...
            </span>
          ) : (
            "Create Campaign"
          )}
        </button>
      </div>
    </div>
  );
}

/* ── Helpers ─────────────────────────────── */

function Divider() {
  return <div className="border-t border-white/[0.05] my-0" />;
}

function ReviewSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-4">
      <p className="text-[9px] font-medium text-zinc-600 uppercase tracking-wider mb-3">
        {label}
      </p>
      {children}
    </div>
  );
}

function ReviewRow({
  label,
  value,
  truncate,
}: {
  label: string;
  value: string;
  truncate?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-[11px] text-zinc-500 shrink-0">{label}</span>
      <span
        className={`text-[12px] text-white text-right font-mono ${
          truncate ? "truncate max-w-[220px]" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}
