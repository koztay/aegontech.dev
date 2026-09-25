import { getDb } from "@/lib/db/supabase";
import crypto from "crypto";

export type AuditAction = {
  action: string;
  actor?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  details?: any;
  correlation_id?: string | null;
};

export async function logAudit(audit: AuditAction) {
  const correlation = audit.correlation_id || audit.details?.correlation_id || crypto.randomUUID();
  const db = getDb();

  try {
    // Note: the audit_logs table does not exist in production; the insert errors and the
    // catch below falls back to console logging (intentional, unchanged behaviour). Supabase
    // returns errors instead of throwing, so re-throw to reach the fallback.
    const { error } = await db.from("audit_logs").insert({
      actor: audit.actor || null,
      action: audit.action,
      entity_type: audit.entity_type || null,
      entity_id: audit.entity_id || null,
      details: audit.details || {},
      correlation_id: correlation,
    });
    if (error) throw new Error(error.message);
  } catch (err) {
    // If audit table doesn't exist or insert fails, fallback to console.log
    console.warn("audit log failed, falling back to console", err);
    console.log("AUDIT", { ...audit, correlation_id: correlation });
  }

  return correlation;
}
