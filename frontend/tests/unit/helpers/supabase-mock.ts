import { vi } from "vitest";

export type MockResult = { data?: any; error?: { message: string } | null; count?: number | null };
export type Call = { table: string; ops: Array<{ method: string; args: any[] }> };

/**
 * Small chainable supabase-js query-builder mock.
 *
 *   const db = createSupabaseMock();
 *   db.queue("blog_posts", { data: [{ id: 1 }], error: null });   // FIFO per table
 *   vi.mock("@/lib/supabase/server", () => ({ getSupabase: () => db.client }));
 *
 * Every chained method (select/insert/update/delete/eq/ilike/or/order/limit/range/single/
 * maybeSingle/in/...) is recorded in `db.calls` and returns the same builder; awaiting the
 * builder resolves the next queued result for that table ({ data: null, error: null } if the
 * queue is empty). `db.opsOf(i)` returns the recorded chain for call i, `db.find(table, method)`
 * helps assertions.
 */
export function createSupabaseMock() {
  const queues = new Map<string, MockResult[]>();
  const calls: Call[] = [];
  const rpcCalls: Array<{ fn: string; args: any }> = [];

  const methods = [
    "select", "insert", "update", "upsert", "delete", "eq", "neq", "ilike", "like", "or", "in",
    "order", "limit", "range", "single", "maybeSingle", "is", "gte", "lte", "not",
  ];

  function builder(table: string) {
    const call: Call = { table, ops: [] };
    calls.push(call);
    const b: any = {};
    for (const m of methods) {
      b[m] = (...args: any[]) => {
        call.ops.push({ method: m, args });
        return b;
      };
    }
    b.then = (resolve: (v: any) => any, reject?: (e: any) => any) => {
      const q = queues.get(table);
      const r = q && q.length ? q.shift()! : { data: null, error: null };
      return Promise.resolve({ data: null, error: null, count: null, ...r }).then(resolve, reject);
    };
    return b;
  }

  const client = {
    from: vi.fn((table: string) => builder(table)),
    rpc: vi.fn((fn: string, args?: any) => {
      rpcCalls.push({ fn, args });
      return builder(`rpc:${fn}`);
    }),
  };

  return {
    client,
    calls,
    rpcCalls,
    queue(table: string, ...results: MockResult[]) {
      const q = queues.get(table) ?? [];
      q.push(...results);
      queues.set(table, q);
    },
    reset() {
      queues.clear();
      calls.length = 0;
      rpcCalls.length = 0;
      client.from.mockClear();
      client.rpc.mockClear();
    },
    /** recorded chain of the i-th `from()` call as [method, ...args] tuples */
    opsOf(i: number) {
      return calls[i].ops.map((o) => [o.method, ...o.args]);
    },
    find(table: string, method: string) {
      return calls
        .filter((c) => c.table === table)
        .flatMap((c) => c.ops.filter((o) => o.method === method).map((o) => o.args));
    },
  };
}

/** Shared singleton for specs: `vi.mock("@/lib/supabase/server", async () => (await import("./helpers/supabase-mock")).serverModuleMock)` */
export const db = createSupabaseMock();
export const serverModuleMock = { getSupabase: () => db.client };
