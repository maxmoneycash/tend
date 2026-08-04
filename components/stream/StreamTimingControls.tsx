"use client";

import { SliderDetents } from "@/components/interior/SliderDetents";
import {
  STREAM_INTERVALS_SECONDS,
  type StreamIntervalSeconds,
} from "@/lib/stream-plan";

const RATE_DETENTS = STREAM_INTERVALS_SECONDS.map((_, value) => ({ value }));

function intervalText(seconds: number) {
  return `Every ${seconds} ${seconds === 1 ? "second" : "seconds"}`;
}

export function StreamTimingControls({
  disabled = false,
  intervalSeconds,
  onIntervalChange,
}: {
  disabled?: boolean;
  intervalSeconds: StreamIntervalSeconds;
  onIntervalChange: (value: StreamIntervalSeconds) => void;
}) {
  const rateIndex = Math.max(
    0,
    STREAM_INTERVALS_SECONDS.indexOf(intervalSeconds),
  );

  return (
    <div className="donation-checkout__drip">
      <SliderDetents
        detents={RATE_DETENTS}
        disabled={disabled}
        format={(value) =>
          intervalText(STREAM_INTERVALS_SECONDS[value] ?? intervalSeconds)
        }
        label="Drip rate"
        max={RATE_DETENTS.length - 1}
        min={0}
        onValueChange={(value) => {
          const next = STREAM_INTERVALS_SECONDS[value];
          if (next) onIntervalChange(next);
        }}
        step={1}
        value={rateIndex}
      />
      <div className="donation-checkout__drip-ends" aria-hidden="true">
        <span>Slow</span>
        <span>Fast</span>
      </div>
    </div>
  );
}
