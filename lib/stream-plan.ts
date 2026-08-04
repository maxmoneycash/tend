// Old durations remain valid so canceled checkouts and saved receipts can resume.
// New streams always use STREAM_DRIP_COUNT and derive their internal duration
// from the selected interval. Donors only choose the drip rate.
export const STREAM_DURATIONS_SECONDS = [20, 30, 40, 60, 100, 200] as const;
export const STREAM_INTERVALS_SECONDS = [10, 5, 2, 1] as const;
export const STREAM_DRIP_COUNT = 20;

export type StreamDurationSeconds =
  (typeof STREAM_DURATIONS_SECONDS)[number];
export type StreamIntervalSeconds =
  (typeof STREAM_INTERVALS_SECONDS)[number];

export const DEFAULT_STREAM_INTERVAL_SECONDS: StreamIntervalSeconds = 2;
export const DEFAULT_STREAM_DURATION_SECONDS: StreamDurationSeconds = 40;

export function isStreamDurationSeconds(
  value: number,
): value is StreamDurationSeconds {
  return STREAM_DURATIONS_SECONDS.some((option) => option === value);
}

export function isStreamIntervalSeconds(
  value: number,
): value is StreamIntervalSeconds {
  return STREAM_INTERVALS_SECONDS.some((option) => option === value);
}

export function streamSettlementCount(
  durationSeconds: number,
  intervalSeconds: number,
) {
  return Math.max(1, Math.ceil(durationSeconds / intervalSeconds));
}

export function streamDurationForInterval(
  intervalSeconds: StreamIntervalSeconds,
): StreamDurationSeconds {
  return (STREAM_DRIP_COUNT * intervalSeconds) as StreamDurationSeconds;
}

export function formatStreamTime(seconds: number) {
  return seconds < 60 ? `${seconds}s` : `${seconds / 60}m`;
}
