type SnapshotMeta = {
  actor: string;
  reason?: string;
  source?: string;
};

export type VersionSnapshot<T> = {
  entityId: string;
  capturedAt: string;
  actor: string;
  reason?: string;
  source?: string;
  data: T;
};

function clone<T>(value: T): T {
  try {
    return structuredClone(value);
  } catch {
    return JSON.parse(JSON.stringify(value)) as T;
  }
}

export function buildVersionNote(meta: SnapshotMeta): string {
  const parts = [
    `actor=${meta.actor}`,
    meta.source ? `source=${meta.source}` : null,
    meta.reason ? `reason=${meta.reason}` : null,
    `at=${new Date().toISOString()}`
  ].filter(Boolean);
  return parts.join(" | ");
}

export function snapshotRecord<T extends { id: string }>(record: T, meta: SnapshotMeta): VersionSnapshot<T> {
  return {
    entityId: record.id,
    capturedAt: new Date().toISOString(),
    actor: meta.actor,
    reason: meta.reason,
    source: meta.source,
    data: clone(record)
  };
}

export function chooseRollbackCandidate<T>(history: VersionSnapshot<T>[], predicate?: (snap: VersionSnapshot<T>) => boolean): VersionSnapshot<T> | null {
  const pool = predicate ? history.filter(predicate) : history;
  if (pool.length === 0) return null;
  return pool.sort((a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime()).at(-1) ?? null;
}

export function buildRollbackPayload<T>(snapshot: VersionSnapshot<T>, meta?: { actor?: string; reason?: string }): { restore: T; versionNote: string } {
  const versionNote = buildVersionNote({
    actor: meta?.actor ?? "rollback",
    reason: meta?.reason ?? `Rollback to ${snapshot.capturedAt}`,
    source: snapshot.source ?? "versioning"
  });

  return {
    restore: clone(snapshot.data),
    versionNote
  };
}
