"use client";

import { Slider } from "@/components/ui/slider";
import {
  formatStreamTime,
  STREAM_DURATIONS_SECONDS,
  STREAM_INTERVALS_SECONDS,
  streamSettlementCount,
  type StreamDurationSeconds,
  type StreamIntervalSeconds,
} from "@/lib/stream-plan";

export function StreamTimingControls({
  amountCents,
  durationSeconds,
  intervalSeconds,
  onDurationChange,
  onIntervalChange,
}: {
  amountCents: number;
  durationSeconds: StreamDurationSeconds;
  intervalSeconds: StreamIntervalSeconds;
  onDurationChange: (value: StreamDurationSeconds) => void;
  onIntervalChange: (value: StreamIntervalSeconds) => void;
}) {
  const intervalIndex = STREAM_INTERVALS_SECONDS.indexOf(intervalSeconds);
  const settlements = streamSettlementCount(
    durationSeconds,
    intervalSeconds,
  );
  const amountPerSettlement =
    amountCents > 0 ? amountCents / settlements / 100 : 0;

  return (
    <div className="pledge-stream-timing">
      <fieldset className="pledge-control">
        <legend>Tempo testnet transfer window</legend>
        <div className="pledge-segmented pledge-duration">
          {STREAM_DURATIONS_SECONDS.map((seconds) => (
            <button
              key={seconds}
              type="button"
              onClick={() => onDurationChange(seconds)}
              aria-pressed={durationSeconds === seconds}
            >
              {formatStreamTime(seconds)}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="pledge-control pledge-cadence">
        <legend className="sr-only">Tempo testnet transfer interval</legend>
        <div className="pledge-cadence-heading">
          <span aria-hidden="true">Tempo testnet transfer interval</span>
          <output aria-live="polite">
            Every {formatStreamTime(intervalSeconds)}
          </output>
        </div>
        <Slider
          aria-label="Tempo testnet transfer interval"
          className="pledge-timing-slider"
          min={0}
          max={STREAM_INTERVALS_SECONDS.length - 1}
          step={1}
          value={intervalIndex}
          onValueChange={(value) => {
            const index = Array.isArray(value) ? value[0] : value;
            const next = STREAM_INTERVALS_SECONDS[index];
            if (next) onIntervalChange(next);
          }}
        />
        <div className="pledge-cadence-marks" aria-hidden="true">
          {STREAM_INTERVALS_SECONDS.map((seconds) => (
            <span key={seconds}>{formatStreamTime(seconds)}</span>
          ))}
        </div>
      </fieldset>

      <div className="pledge-stream-preview" aria-live="polite">
        <span>
          <strong>{settlements}</strong> Tempo testnet transfers
        </span>
        <span>
          <strong>
            $
            {amountPerSettlement.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 6,
            })}
          </strong>{" "}
          per testnet transfer
        </span>
        <span>
          <strong>{formatStreamTime(durationSeconds)}</strong> total window
        </span>
      </div>
    </div>
  );
}
