export const STREAM_DURATIONS_SECONDS = [20, 30, 60] as const;
export const STREAM_INTERVALS_SECONDS = [1, 2, 5, 10] as const;

export type StreamDurationSeconds =
  (typeof STREAM_DURATIONS_SECONDS)[number];
export type StreamIntervalSeconds =
  (typeof STREAM_INTERVALS_SECONDS)[number];

export const DEFAULT_STREAM_DURATION_SECONDS: StreamDurationSeconds = 20;
export const DEFAULT_STREAM_INTERVAL_SECONDS: StreamIntervalSeconds = 1;

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

export function formatStreamTime(seconds: number) {
  return seconds < 60 ? `${seconds}s` : `${seconds / 60}m`;
}
