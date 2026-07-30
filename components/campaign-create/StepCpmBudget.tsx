"use client";

import type { CampaignFormState } from "./CampaignCreateWizard";
import { CpmCurveChart } from "./CpmCurveChart";
import Scrubber from "@/components/ui/scrubber";

function recommendedFloorCpm(
  audioSlider: number,
  visualSlider: number
): number {
  const combined = audioSlider + visualSlider;
  if (combined >= 160) return 1.5;
  if (combined >= 130) return 1.0;
  if (combined >= 100) return 0.5;
  return 0.25;
}

function formatViews(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toString();
}

const CURVES: {
  value: 0 | 1 | 2;
  label: string;
  path: string;
}[] = [
  { value: 0, label: "Linear", path: "M 4,46 L 76,4" },
  { value: 1, label: "Convex", path: "M 4,46 Q 56,44 76,4" },
  { value: 2, label: "Concave", path: "M 4,46 Q 24,6 76,4" },
];

interface Props {
  form: CampaignFormState;
  update: (patch: Partial<CampaignFormState>) => void;
}

export function StepCpmBudget({ form, update }: Props) {
  const recommended = recommendedFloorCpm(form.audioSlider, form.visualSlider);
  const avgCpm =
    form.floorCpm > 0 && form.ceilingCpm > 0
      ? (form.floorCpm + form.ceilingCpm) / 2
      : 0;
  const estViews =
    avgCpm > 0 && form.totalBudget > 0
      ? Math.round((form.totalBudget / avgCpm) * 1000)
      : 0;

  return (
    <div className="space-y-5">
      {/* Floor CPM */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <label className="text-[11px] font-medium text-zinc-400">
            Floor CPM (per 1K views) <span className="text-red-400">*</span>
          </label>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-[#FA4616]/10 text-[#FA4616] text-[10px] font-medium leading-none">
            min ${recommended.toFixed(2)}
          </span>
        </div>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-[14px] select-none">
            $
          </span>
          <input
            type="number"
            className="input-whop w-full pl-7 pr-3 py-2.5 text-[14px]"
            value={form.floorCpm || ""}
            onChange={(e) => update({ floorCpm: +e.target.value })}
            placeholder={recommended.toFixed(2)}
            step="0.01"
            min="0"
          />
        </div>
        <div className="text-[10px] text-zinc-600 mt-1">
          Minimum CPM paid to all clippers
        </div>
      </div>

      {/* Ceiling CPM */}
      <div>
        <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
          Maximum CPM (per 1K views) <span className="text-red-400">*</span>
        </label>
        <Scrubber
          label="Max CPM"
          value={form.ceilingCpm || form.floorCpm * 3 || 1.5}
          min={form.floorCpm || 0.5}
          max={20}
          step={0.1}
          decimals={2}
          ticks={9}
          unit="/ 1K"
          onValueChange={(v) => update({ ceilingCpm: v })}
        />
        {form.ceilingCpm > 0 && form.ceilingCpm < form.floorCpm && (
          <div className="text-[10px] text-red-400 mt-1">
            Ceiling must be ≥ floor CPM
          </div>
        )}
        <div className="text-[10px] text-zinc-600 mt-1">
          Maximum CPM for top-trust clippers
        </div>
      </div>

      {/* CR Curve Selector — compact */}
      <div>
        <label className="block text-[11px] font-medium text-zinc-400 mb-2">
          CR Curve Shape <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {CURVES.map((curve) => {
            const isActive = form.curveType === curve.value;
            return (
              <button
                key={curve.value}
                onClick={() => update({ curveType: curve.value })}
                className={`flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-[#FA4616]/10"
                    : "bg-white/[0.03] hover:bg-white/[0.06]"
                }`}
              >
                <svg viewBox="0 0 80 50" className="w-12 h-7" fill="none">
                  <line
                    x1="4" y1="46" x2="76" y2="46"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="0.5"
                  />
                  <line
                    x1="4" y1="4" x2="4" y2="46"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="0.5"
                  />
                  <path
                    d={curve.path}
                    stroke={isActive ? "#FA4616" : "rgba(255,255,255,0.22)"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <circle
                    cx="4" cy="46" r="2"
                    fill={isActive ? "#FA4616" : "rgba(255,255,255,0.12)"}
                  />
                  <circle
                    cx="76" cy="4" r="2"
                    fill={isActive ? "#FA4616" : "rgba(255,255,255,0.12)"}
                  />
                </svg>
                <span
                  className={`text-[11px] font-medium ${
                    isActive ? "text-[#FA4616]" : "text-zinc-500"
                  }`}
                >
                  {curve.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive CPM Curve Chart */}
      {form.floorCpm > 0 &&
        form.ceilingCpm > 0 &&
        form.ceilingCpm >= form.floorCpm && (
          <CpmCurveChart
            floorCpm={form.floorCpm}
            ceilingCpm={form.ceilingCpm}
            curveType={form.curveType}
          />
        )}

      {/* Total Budget */}
      <div>
        <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
          Total Budget <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-[14px] select-none">
            $
          </span>
          <input
            type="number"
            className="input-whop w-full pl-7 pr-3 py-2.5 text-[14px]"
            value={form.totalBudget || ""}
            onChange={(e) => update({ totalBudget: +e.target.value })}
            placeholder="500"
            step="100"
            min="500"
          />
        </div>
        <div className="text-[10px] text-zinc-600 mt-1">
          Min $500 {"\u00B7"} Paid in USDT {"\u00B7"} Escrowed in campaign
          contract
        </div>
        {form.totalBudget > 0 && form.totalBudget < 500 && (
          <div className="text-[10px] text-red-400 mt-1">
            Minimum budget is $500
          </div>
        )}
      </div>

      {/* Estimated Reach */}
      {avgCpm > 0 && form.totalBudget >= 500 && (
        <div className="pt-4 border-t border-white/[0.06]">
          <div className="text-[10px] text-zinc-500 font-medium mb-1.5">
            Estimated Reach
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[22px] font-bold text-white font-display">
              ~{formatViews(estViews)}
            </span>
            <span className="text-[12px] text-zinc-500">views</span>
          </div>
          <div className="text-[11px] text-zinc-600 mt-1">
            At ${avgCpm.toFixed(2)} avg CPM, approximately{" "}
            {estViews.toLocaleString()} views
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <div>
              <div className="text-[13px] font-bold text-white font-mono">
                ${form.floorCpm.toFixed(2)}
              </div>
              <div className="text-[9px] text-zinc-600">Floor CPM</div>
            </div>
            <div>
              <div className="text-[13px] font-bold text-white font-mono">
                ${form.ceilingCpm.toFixed(2)}
              </div>
              <div className="text-[9px] text-zinc-600">Ceiling CPM</div>
            </div>
            <div>
              <div className="text-[13px] font-bold text-[#FA4616] font-mono">
                ${form.totalBudget.toLocaleString()}
              </div>
              <div className="text-[9px] text-zinc-600">Budget</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
