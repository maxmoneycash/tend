/**
 * Durable payment state for webhook-driven processing, backed by node:sqlite.
 *
 * Two jobs:
 *  1. Webhook idempotency. Processed Stripe event ids are recorded so
 *     replayed deliveries are no-ops.
 *  2. Contribution state. The receipt page reads this and never mutates it.
 *     Only the Stripe webhook (and the Tempo settlement runner it triggers)
 *     writes here.
 *
 * The store is a single local SQLite file (default .data/tend-payments.sqlite,
 * override with TEND_PAYMENT_DB_PATH). WAL mode keeps concurrent
 * reader/writer routes happy within the single Next.js server process.
 */
import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

export type TempoStatus = "pending" | "running" | "complete" | "error";

export type TempoStreamEvent =
  | { type: "preparing"; message: string }
  | {
      type: "ready";
      amountCents: number;
      interval: string;
      organization: string;
      paymentMethod: string;
      recipient: string;
      settlements: number;
      streamDurationSeconds: number;
      streamIntervalSeconds: number;
      stripeReceipt: string;
      stripeReceiptUrl?: string;
    }
  | {
      type: "settlement";
      amountCents: number;
      hash: string;
      index: number;
      streamedCents: number;
      totalCents: number;
    }
  | {
      type: "complete";
      amountCents: number;
      lastHash: string;
      recipient: string;
      settlements: number;
    }
  | { type: "error"; message: string };

export type ContributionRecord = {
  sessionId: string;
  /** Connected account the Checkout Session lives on (direct charges), if any. */
  stripeAccount: string | null;
  tribeId: string;
  amountCents: number;
  currency: string;
  interval: string;
  streamDurationSeconds: number;
  streamIntervalSeconds: number;
  paymentStatus: string;
  mode: string;
  tempoStream: boolean;
};

export type TempoState = {
  tempoStatus: TempoStatus;
  paymentStatus: string;
  events: TempoStreamEvent[];
  updatedAt: number;
};

/** A running settlement with no writes for this long is considered dead. */
const STALE_RUN_MS = 90_000;

const globalForStore = globalThis as typeof globalThis & {
  __tendPaymentDb?: DatabaseSync;
};

function openDb(): DatabaseSync {
  if (globalForStore.__tendPaymentDb) return globalForStore.__tendPaymentDb;

  const file =
    process.env.TEND_PAYMENT_DB_PATH ??
    path.join(process.cwd(), ".data", "tend-payments.sqlite");
  mkdirSync(path.dirname(file), { recursive: true });

  const db = new DatabaseSync(file);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;

    CREATE TABLE IF NOT EXISTS stripe_events (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      received_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contributions (
      session_id TEXT PRIMARY KEY,
      stripe_account TEXT,
      tribe_id TEXT NOT NULL,
      amount_cents INTEGER NOT NULL,
      currency TEXT NOT NULL,
      interval TEXT NOT NULL,
      stream_duration_seconds INTEGER NOT NULL,
      stream_interval_seconds INTEGER NOT NULL,
      payment_status TEXT NOT NULL,
      mode TEXT NOT NULL,
      tempo_stream INTEGER NOT NULL DEFAULT 0,
      tempo_status TEXT NOT NULL DEFAULT 'pending',
      tempo_events TEXT NOT NULL DEFAULT '[]',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  globalForStore.__tendPaymentDb = db;
  return db;
}

/**
 * Apply a Stripe event's synchronous state mutation exactly once.
 *
 * The event claim and contribution writes share one SQLite transaction. This
 * avoids the crash gap where an event id could be persisted but its payment
 * state was not, which would make every later Stripe retry look like a
 * duplicate. `process` must remain synchronous so the transaction never spans
 * an awaited operation.
 */
export function processStripeEventOnce(
  eventId: string,
  eventType: string,
  process: () => void,
): boolean {
  const db = openDb();
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = db
      .prepare(
        "INSERT OR IGNORE INTO stripe_events (id, type, received_at) VALUES (?, ?, ?)",
      )
      .run(eventId, eventType, Date.now());
    if (Number(result.changes) === 0) {
      db.exec("COMMIT");
      return false;
    }

    process();
    db.exec("COMMIT");
    return true;
  } catch (error) {
    try {
      db.exec("ROLLBACK");
    } catch {
      // Preserve the original processing error.
    }
    throw error;
  }
}

export function upsertContribution(record: ContributionRecord): void {
  const now = Date.now();
  openDb()
    .prepare(
      `INSERT INTO contributions (
         session_id, stripe_account, tribe_id, amount_cents, currency,
         interval, stream_duration_seconds, stream_interval_seconds,
         payment_status, mode, tempo_stream, created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(session_id) DO UPDATE SET
         stripe_account = COALESCE(excluded.stripe_account, contributions.stripe_account),
         tribe_id = excluded.tribe_id,
         amount_cents = excluded.amount_cents,
         currency = excluded.currency,
         interval = excluded.interval,
         stream_duration_seconds = excluded.stream_duration_seconds,
         stream_interval_seconds = excluded.stream_interval_seconds,
         payment_status = CASE
           WHEN contributions.payment_status IN ('paid', 'failed')
             AND excluded.payment_status NOT IN ('paid', 'failed')
           THEN contributions.payment_status
           ELSE excluded.payment_status
         END,
         mode = excluded.mode,
         tempo_stream = excluded.tempo_stream,
         updated_at = excluded.updated_at`,
    )
    .run(
      record.sessionId,
      record.stripeAccount,
      record.tribeId,
      record.amountCents,
      record.currency,
      record.interval,
      record.streamDurationSeconds,
      record.streamIntervalSeconds,
      record.paymentStatus,
      record.mode,
      record.tempoStream ? 1 : 0,
      now,
      now,
    );
}

export function updatePaymentStatus(
  sessionId: string,
  paymentStatus: string,
): void {
  openDb()
    .prepare(
      "UPDATE contributions SET payment_status = ?, updated_at = ? WHERE session_id = ?",
    )
    .run(paymentStatus, Date.now(), sessionId);
}

type ContributionRow = {
  session_id: string;
  stripe_account: string | null;
  tribe_id: string;
  amount_cents: number;
  currency: string;
  interval: string;
  stream_duration_seconds: number;
  stream_interval_seconds: number;
  payment_status: string;
  mode: string;
  tempo_stream: number;
  tempo_status: TempoStatus;
  tempo_events: string;
  created_at: number;
  updated_at: number;
};

function getRow(sessionId: string): ContributionRow | undefined {
  return openDb()
    .prepare("SELECT * FROM contributions WHERE session_id = ?")
    .get(sessionId) as ContributionRow | undefined;
}

export function getContribution(
  sessionId: string,
): (ContributionRecord & { tempoStatus: TempoStatus }) | undefined {
  const row = getRow(sessionId);
  if (!row) return undefined;
  return {
    sessionId: row.session_id,
    stripeAccount: row.stripe_account,
    tribeId: row.tribe_id,
    amountCents: row.amount_cents,
    currency: row.currency,
    interval: row.interval,
    streamDurationSeconds: row.stream_duration_seconds,
    streamIntervalSeconds: row.stream_interval_seconds,
    paymentStatus: row.payment_status,
    mode: row.mode,
    tempoStream: row.tempo_stream === 1,
    tempoStatus: row.tempo_status,
  };
}

/**
 * Atomically take ownership of the Tempo settlement run for a session.
 * Only the first attempt may succeed. A failed or interrupted run is not
 * automatically retried because the external Tempo transfer could have landed
 * immediately before the local progress write; retrying could duplicate a
 * public testnet transfer.
 */
export function claimTempoRun(sessionId: string): boolean {
  const result = openDb()
    .prepare(
      `UPDATE contributions
       SET tempo_status = 'running', tempo_events = '[]', updated_at = ?
       WHERE session_id = ? AND tempo_status = 'pending'`,
    )
    .run(Date.now(), sessionId);
  return Number(result.changes) === 1;
}

/**
 * Append a progress event from the (single, claimed) settlement runner.
 * Read-modify-write is safe because claimTempoRun guarantees one writer.
 */
export function appendTempoEvent(
  sessionId: string,
  event: TempoStreamEvent,
): void {
  const row = getRow(sessionId);
  if (!row) return;
  const events = JSON.parse(row.tempo_events) as TempoStreamEvent[];
  events.push(event);
  openDb()
    .prepare(
      "UPDATE contributions SET tempo_events = ?, updated_at = ? WHERE session_id = ?",
    )
    .run(JSON.stringify(events), Date.now(), sessionId);
}

export function finishTempoRun(
  sessionId: string,
  status: Extract<TempoStatus, "complete" | "error">,
): void {
  openDb()
    .prepare(
      "UPDATE contributions SET tempo_status = ?, updated_at = ? WHERE session_id = ?",
    )
    .run(status, Date.now(), sessionId);
}

/**
 * Read-only state for the receipt page. Reports a run that died without a
 * terminal write (process restart mid-stream) as errored so the UI doesn't
 * spin forever, without mutating payment state from a display endpoint.
 */
export function getTempoState(sessionId: string): TempoState | undefined {
  const row = getRow(sessionId);
  if (!row) return undefined;

  let tempoStatus = row.tempo_status;
  let events = JSON.parse(row.tempo_events) as TempoStreamEvent[];

  if (tempoStatus === "running" && Date.now() - row.updated_at > STALE_RUN_MS) {
    tempoStatus = "error";
    events = [
      ...events,
      {
        type: "error",
        message:
          "The Tempo testnet stream stopped mid-run. An operator must reconcile it before any retry to avoid a duplicate transfer.",
      },
    ];
  }

  return {
    tempoStatus,
    paymentStatus: row.payment_status,
    events,
    updatedAt: row.updated_at,
  };
}
