/**
 * Minimal typings for node:sqlite (stable-ish since Node 22.5, still marked
 * experimental). @types/node 20.x does not ship these. Only the surface used
 * by lib/payment-store.ts is declared.
 */
declare module "node:sqlite" {
  type SQLInputValue = null | number | bigint | string | Uint8Array;

  interface StatementResult {
    changes: number | bigint;
    lastInsertRowid: number | bigint;
  }

  class StatementSync {
    run(...params: SQLInputValue[]): StatementResult;
    get(...params: SQLInputValue[]): unknown;
    all(...params: SQLInputValue[]): unknown[];
  }

  class DatabaseSync {
    constructor(path: string);
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
  }
}
