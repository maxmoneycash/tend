"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { CampaignFormState } from "./CampaignCreateWizard";

interface PresetRequirement {
  key: string;
  label: string;
  inputType: "text" | "url" | "minmax" | "checkbox" | "checkbox+text" | "tags";
  placeholder?: string;
}

const PRESETS: PresetRequirement[] = [
  {
    key: "creatorNameInBio",
    label: "Creator name in bio",
    inputType: "text",
    placeholder: 'e.g. "@Paulfamilyranch"',
  },
  {
    key: "descriptionUrl",
    label: "Description URL required",
    inputType: "url",
    placeholder: "https://...",
  },
  {
    key: "videoLength",
    label: "Video length range",
    inputType: "minmax",
  },
  {
    key: "tier1Countries",
    label: "Tier-1 country views only",
    inputType: "checkbox",
  },
  {
    key: "specificSound",
    label: "Specific sound / music required",
    inputType: "checkbox+text",
    placeholder: "Sound URL or name",
  },
  {
    key: "captionText",
    label: "Specific text in caption",
    inputType: "text",
    placeholder: "Required caption text...",
  },
  {
    key: "hashtags",
    label: "Hashtag requirements",
    inputType: "tags",
    placeholder: "#brand, #campaign",
  },
];

interface Props {
  form: CampaignFormState;
  update: (patch: Partial<CampaignFormState>) => void;
}

export function StepRequirements({ form, update }: Props) {
  const [newCustom, setNewCustom] = useState("");

  const togglePreset = (key: string) => {
    update({
      presetToggles: {
        ...form.presetToggles,
        [key]: !form.presetToggles[key],
      },
    });
  };

  const updatePresetInput = (key: string, value: string) => {
    update({
      presetInputs: {
        ...form.presetInputs,
        [key]: value,
      },
    });
  };

  const addCustom = () => {
    if (newCustom.trim()) {
      update({
        customRequirements: [...form.customRequirements, newCustom.trim()],
      });
      setNewCustom("");
    }
  };

  const removeCustom = (idx: number) => {
    update({
      customRequirements: form.customRequirements.filter((_, i) => i !== idx),
    });
  };

  const activeCount =
    Object.values(form.presetToggles).filter(Boolean).length +
    form.customRequirements.length;

  return (
    <div className="space-y-5">
      {/* Preset Requirements */}
      <div>
        <p className="text-[9px] font-medium text-zinc-600 uppercase tracking-wider mb-3">
          Preset Requirements
        </p>
        <div className="space-y-1">
          {PRESETS.map((preset) => {
            const isOn = !!form.presetToggles[preset.key];
            return (
              <div key={preset.key} className="rounded-lg overflow-hidden">
                {/* Toggle row */}
                <button
                  onClick={() => togglePreset(preset.key)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 text-left transition-colors rounded-lg ${
                    isOn ? "bg-white/[0.04]" : "hover:bg-white/[0.02]"
                  }`}
                >
                  <span
                    className={`text-[13px] font-medium transition-colors ${
                      isOn ? "text-white" : "text-zinc-500"
                    }`}
                  >
                    {preset.label}
                  </span>
                  {/* Toggle switch */}
                  <div
                    className={`w-9 h-5 rounded-full relative shrink-0 transition-colors ${
                      isOn ? "bg-[#FA4616]" : "bg-white/[0.08]"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all shadow-sm ${
                        isOn ? "left-[18px]" : "left-0.5"
                      }`}
                    />
                  </div>
                </button>

                {/* Expanded input — animated slide */}
                <AnimatePresence initial={false}>
                  {isOn && preset.inputType !== "checkbox" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-3.5 pb-3 pt-0.5">
                        {preset.inputType === "text" ||
                        preset.inputType === "url" ||
                        preset.inputType === "tags" ||
                        preset.inputType === "checkbox+text" ? (
                          <input
                            className="input-whop w-full px-3 py-2 text-[12px]"
                            value={form.presetInputs[preset.key] || ""}
                            onChange={(e) =>
                              updatePresetInput(preset.key, e.target.value)
                            }
                            placeholder={preset.placeholder}
                            type={preset.inputType === "url" ? "url" : "text"}
                          />
                        ) : preset.inputType === "minmax" ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              className="input-whop flex-1 px-3 py-2 text-[12px]"
                              value={form.presetVideoLengthMin}
                              onChange={(e) =>
                                update({ presetVideoLengthMin: e.target.value })
                              }
                              placeholder="Min sec"
                              min="0"
                            />
                            <span className="text-[11px] text-zinc-600">to</span>
                            <input
                              type="number"
                              className="input-whop flex-1 px-3 py-2 text-[12px]"
                              value={form.presetVideoLengthMax}
                              onChange={(e) =>
                                update({ presetVideoLengthMax: e.target.value })
                              }
                              placeholder="Max sec"
                              min="0"
                            />
                            <span className="text-[11px] text-zinc-600 shrink-0">
                              sec
                            </span>
                          </div>
                        ) : null}
                        {preset.inputType === "tags" && (
                          <p className="text-[10px] text-zinc-600 mt-1">
                            Comma-separated hashtags
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Requirements */}
      <div className="pt-1 border-t border-white/[0.05]">
        <p className="text-[9px] font-medium text-zinc-600 uppercase tracking-wider mb-3">
          Custom Requirements
        </p>

        {/* Existing custom reqs as chips */}
        {form.customRequirements.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {form.customRequirements.map((req, i) => (
              <motion.div
                key={`${req}-${i}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-[11px] text-zinc-300"
              >
                <span className="truncate max-w-[200px]">{req}</span>
                <button
                  onClick={() => removeCustom(i)}
                  className="w-3.5 h-3.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors shrink-0"
                >
                  <svg className="w-2 h-2" viewBox="0 0 8 8" fill="currentColor">
                    <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
                  </svg>
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add custom req */}
        <div className="flex gap-2">
          <input
            className="input-whop flex-1 px-3 py-2 text-[12px]"
            value={newCustom}
            onChange={(e) => setNewCustom(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustom()}
            placeholder="Add a custom requirement..."
          />
          <button
            onClick={addCustom}
            disabled={!newCustom.trim()}
            className={`px-3.5 py-2 rounded-[10px] text-[12px] font-semibold shrink-0 transition-all ${
              newCustom.trim()
                ? "bg-[#FA4616] text-white hover:bg-[#e03d12]"
                : "bg-white/[0.04] text-zinc-600 cursor-not-allowed"
            }`}
          >
            Add
          </button>
        </div>
      </div>

      {/* Active count */}
      {activeCount > 0 && (
        <p className="text-[10px] text-zinc-600">
          {activeCount} requirement{activeCount !== 1 ? "s" : ""} configured
        </p>
      )}
    </div>
  );
}
