"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

/** A — chips: the familiar preset-amount row (basecn ToggleGroup + Switch). */
export function AmountPickerA() {
  const [amount, setAmount] = useState("25");
  const [yearly, setYearly] = useState(false);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display">Your Yunakin Land Tax</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Label htmlFor="a-interval" className="text-muted-foreground">
            Monthly
          </Label>
          <Switch
            id="a-interval"
            checked={yearly}
            onCheckedChange={(v) => setYearly(Boolean(v))}
          />
          <Label htmlFor="a-interval">Yearly</Label>
        </div>
        <ToggleGroup
          value={[amount]}
          onValueChange={(v: unknown[]) => {
            if (typeof v[0] === "string") setAmount(v[0]);
          }}
        >
          {(yearly ? ["100", "250", "500", "1000"] : ["10", "25", "50", "100"]).map(
            (v) => (
              <ToggleGroupItem key={v} value={v} className="px-4">
                ${v}
              </ToggleGroupItem>
            ),
          )}
        </ToggleGroup>
        <div className="flex items-center gap-2">
          <Input placeholder="custom $" className="w-28" inputMode="decimal" />
          <span className="text-sm text-muted-foreground">
            selected: ${amount}/{yearly ? "yr" : "mo"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

/** B — slider: one gesture, sliding scale made literal (basecn Slider). */
export function AmountPickerB() {
  const [amount, setAmount] = useState(25);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display">Your Yunakin Land Tax</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="font-display text-5xl font-bold">
          ${amount}
          <span className="text-lg text-muted-foreground font-normal">
            /month
          </span>
        </div>
        <Slider
          value={amount}
          min={5}
          max={150}
          step={5}
          onValueChange={(v) => setAmount(Array.isArray(v) ? v[0] : Number(v))}
        />
        <p className="text-sm text-muted-foreground">
          Sliding-scale suggestion for a $2k–4k renter: <strong>$25</strong>.
          Every amount is welcome.
        </p>
      </CardContent>
    </Card>
  );
}

const TIERS = [
  { id: "seed", label: "Seed", amount: "$10/mo", note: "A steady start" },
  { id: "root", label: "Root", amount: "$25/mo", note: "The common pledge" },
  { id: "grove", label: "Grove", amount: "$50/mo", note: "Deep support" },
];

/** C — tiers: named levels read as a relationship, not a transaction. */
export function AmountPickerC() {
  const [tier, setTier] = useState("root");
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display">Your Yunakin Land Tax</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={tier}
          onValueChange={(v) => setTier(String(v))}
          className="gap-2"
        >
          {TIERS.map((t) => (
            <Label
              key={t.id}
              htmlFor={`tier-${t.id}`}
              className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition ${
                tier === t.id ? "border-primary ring-2 ring-primary" : "border-border"
              }`}
            >
              <span className="flex items-center gap-3">
                <RadioGroupItem id={`tier-${t.id}`} value={t.id} />
                <span>
                  <span className="font-semibold">{t.label}</span>
                  <span className="block text-sm text-muted-foreground">
                    {t.note}
                  </span>
                </span>
              </span>
              <span className="font-display text-xl font-bold">{t.amount}</span>
            </Label>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
