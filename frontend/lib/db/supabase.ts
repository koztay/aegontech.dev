/**
 * Database helpers on top of the server-only Supabase client (service role).
 *
 * The site used to talk to Postgres through `pg`. Two behaviours of `pg` are preserved here
 * so converted call sites keep returning the exact same JS values:
 *  - `timestamptz` columns came back as `Date` objects (PostgREST returns ISO strings);
 *  - `bigint` columns (`media_assets.size_bytes`) came back as strings (PostgREST returns numbers).
 * See `reviveRow`.
 */
import { getSupabase } from "@/lib/supabase/server";

export { getSupabase as getDb };

type SbResult<T> = { data: T | null; error: { message: string } | null; count?: number | null };

/** Throw on a PostgREST error (like a failed pg query) and return `data`. */
export function unwrap<T>(res: SbResult<T>): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

/** timestamptz columns across the 7 public tables (pg -> Date). */
const TIMESTAMP_COLUMNS = new Set(["created_at", "published_at"]);
/** bigint columns across the 7 public tables (pg -> string). */
const BIGINT_COLUMNS = new Set(["size_bytes"]);

/** Convert a PostgREST row so its value types match what `pg` returned. */
export function reviveRow<T = any>(row: any): T {
  if (!row || typeof row !== "object") return row;
  const out: any = { ...row };
  for (const key of Object.keys(out)) {
    const v = out[key];
    if (v == null) continue;
    if (TIMESTAMP_COLUMNS.has(key) && typeof v === "string") out[key] = new Date(v);
    else if (BIGINT_COLUMNS.has(key) && typeof v === "number") out[key] = String(v);
  }
  return out as T;
}

export function reviveRows<T = any>(rows: any[] | null | undefined): T[] {
  return (rows ?? []).map((r) => reviveRow<T>(r));
}

/** PostgREST caps a response at 1000 rows by default (server `max-rows`). */
export const PAGE_SIZE = 1000;

/**
 * Fetch every row of an unbounded list by paging with `.range()`.
 * `build(from, to)` must return the (awaitable) query with ordering already applied; make the
 * ordering deterministic (add a unique tiebreaker such as `id`) so pages do not overlap.
 * `max` optionally stops after that many rows (SQL LIMIT equivalent).
 */
export async function fetchAll<T = any>(
  build: (from: number, to: number) => PromiseLike<SbResult<T[]>>,
  opts: { max?: number; pageSize?: number } = {}
): Promise<T[]> {
  const pageSize = opts.pageSize ?? PAGE_SIZE;
  const max = opts.max ?? Infinity;
  const all: T[] = [];
  for (let from = 0; all.length < max; from += pageSize) {
    const want = Math.min(pageSize, max - all.length);
    const rows = unwrap(await build(from, from + want - 1)) ?? [];
    all.push(...rows);
    if (rows.length < want) break;
  }
  return all;
}

/** Escape LIKE/ILIKE wildcards (`\`, `%`, `_`) so user input is matched literally. */
export function escapeLike(s: string): string {
  return s.replace(/[\\%_]/g, (c) => `\\${c}`);
}

/** Quote a value for use inside a PostgREST `.or()` filter string (commas/parens safe). */
export function orValue(s: string): string {
  return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}
