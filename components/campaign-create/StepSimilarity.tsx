"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { CampaignFormState } from "./CampaignCreateWizard";
import Scrubber from "@/components/ui/scrubber";
import { PriceFlow } from "@/components/ui/price-flow";
import { AnimatedTags } from "@/components/ui/animated-tags";

const PRESETS: {
  key: CampaignFormState["similarityPreset"];
  label: string;
  audio: number;
  visual: number;
}[] = [
  { key: "podcast", label: "Podcast", audio: 80, visual: 20 },
  { key: "lifestyle", label: "Lifestyle", audio: 20, visual: 85 },
  { key: "performance", label: "Live Performance", audio: 70, visual: 70 },
  { key: "custom", label: "Custom", audio: -1, visual: -1 },
];

const TRAITS: Record<string, string[]> = {
  podcast: ["Audio-heavy", "Great for talk shows", "Low visual bar"],
  lifestyle: ["Visual-heavy", "Ideal for reels", "Minimal audio check"],
  performance: ["Fully balanced", "Both fingerprints matter"],
  custom: ["Your weights"],
};

interface Props {
  form: CampaignFormState;
  update: (patch: Partial<CampaignFormState>) => void;
}

export function StepSimilarity({ form, update }: Props) {
  const shouldReduce = useReducedMotion();

  const combined = form.audioSlider + form.visualSlider;
  const isValid = combined >= 80;
  const totalWeight = combined || 1;

  const audioWeightNum = Math.round((form.audioSlider / totalWeight) * 100);
  const visualWeightNum = Math.round((form.visualSlider / totalWeight) * 100);

  // Worked example (fixed inputs, dynamic weights)
  const exAudio = 90;
  const exVisual = 40;
  const exScoreNum =
    (exAudio * form.audioSlider) / totalWeight +
    (exVisual * form.visualSlider) / totalWeight;
  const exPasses = exScoreNum >= 80;

  const selectPreset = (key: CampaignFormState["similarityPreset"]) => {
    const preset = PRESETS.find((p) => p.key === key)!;
    if (preset.key === "custom") {
      update({ similarityPreset: "custom" });
    } else {
      update({
        audioSlider: preset.audio,
        visualSlider: preset.visual,
        similarityPreset: preset.key,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Description */}
      <p className="text-[11px] text-zinc-600 leading-relaxed">
        Set how strictly clips must match your source. Audio and visual
        fingerprints are checked independently and combined into a confidence
        score.
      </p>

      {/* Preset selector */}
      <div>
        <p className="text-[9px] font-medium text-zinc-600 uppercase tracking-wider mb-2.5">
          Preset
        </p>
        <AnimatedTags
          tags={PRESETS.map((p) => ({
            key: p.key,
            label: p.label,
            sub: p.key !== "custom" ? `${p.audio}/${p.visual}` : undefined,
          }))}
          selected={form.similarityPreset}
          onSelect={selectPreset}
          layoutId="preset-bg"
        />
      </div>

      {/* Trait chips — animate in/out on preset change */}
      <div className="flex flex-wrap gap-1.5 min-h-[26px]">
        <AnimatePresence mode="popLayout">
          {(TRAITS[form.similarityPreset] ?? []).map((trait) => (
            <motion.span
              key={trait}
              layout
              initial={
                shouldReduce
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.85, filter: "blur(4px)" }
              }
              animate={
                shouldReduce
                  ? { opacity: 1 }
                  : { opacity: 1, scale: 1, filter: "blur(0px)" }
              }
              exit={
                shouldReduce
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.85, filter: "blur(4px)" }
              }
              transition={{ type: "spring", duration: 0.28, bounce: 0.1 }}
              className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-[10px] text-zinc-500"
            >
              {trait}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {/* Scrubbers */}
      <div className="space-y-3">
        <Scrubber
          label="Audio Match"
          value={form.audioSlider}
          min={0}
          max={100}
          step={1}
          decimals={0}
          ticks={9}
          unit="%"
          onValueChange={(v) => update({ audioSlider: v, similarityPreset: "custom" })}
        />
        <Scrubber
          label="Visual Match"
          value={form.visualSlider}
          min={0}
          max={100}
          step={1}
          decimals={0}
          ticks={9}
          unit="%"
          onValueChange={(v) => update({ visualSlider: v, similarityPreset: "custom" })}
        />
      </div>

      {/* Stats panel */}
      <div className="grid grid-cols-3 divide-x divide-white/[0.05] bg-white/[0.02] rounded-xl overflow-hidden">
        <div className="px-4 py-3.5">
          <p className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1.5">
            Audio weight
          </p>
          <PriceFlow
            value={audioWeightNum}
            format={(n) => n + "%"}
            className="text-[20px] font-bold font-mono text-white"
          />
        </div>

        <div className="px-4 py-3.5 text-center">
          <p className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1.5">
            Combined
          </p>
          <div className="flex items-baseline justify-center gap-1.5">
            <PriceFlow
              value={combined}
              className={`text-[20px] font-bold font-mono ${
                isValid ? "text-white" : "text-red-400"
              }`}
            />
            <motion.span
              key={isValid ? "ok" : "no"}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className={`text-[9px] font-semibold ${
                isValid ? "text-green-500" : "text-red-500"
              }`}
            >
              {isValid ? "/ 80 ok" : "< 80"}
            </motion.span>
          </div>
        </div>

        <div className="px-4 py-3.5 text-right">
          <p className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1.5">
            Visual weight
          </p>
          <PriceFlow
            value={visualWeightNum}
            format={(n) => n + "%"}
            className="text-[20px] font-bold font-mono text-white"
          />
        </div>
      </div>

      {/* Worked example */}
      <div className="pt-1">
        <p className="text-[9px] text-zinc-600 uppercase tracking-wider mb-3">
          Worked Example
        </p>
        <div className="flex items-baseline flex-wrap gap-x-3 gap-y-1">
          <span className="text-[11px] text-zinc-500">
            {exAudio}% audio · {exVisual}% visual =
          </span>
          <div className="flex items-baseline gap-2">
            <PriceFlow
              value={exScoreNum}
              format={(n) => n.toFixed(1) + "%"}
              className={`text-[28px] font-bold font-mono leading-none ${
                exPasses ? "text-green-400" : "text-red-400"
              }`}
            />
            <AnimatePresence mode="wait">
              <motion.span
                key={exPasses ? "pass" : "fail"}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className={`text-[11px] font-semibold ${
                  exPasses ? "text-green-500" : "text-red-500"
                }`}
              >
                {exPasses ? "passes" : "fails"}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
        {!isValid && (
          <p className="text-[10px] text-red-400/60 mt-2">
            Raise sliders until combined reaches 80 to enable payouts.
          </p>
        )}
      </div>
    </div>
  );
}
