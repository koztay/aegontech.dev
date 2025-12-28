import { getDbPool } from "@/lib/db/client";
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
  const pool = getDbPool();

  try {
    await pool.query(
      `INSERT INTO audit_logs (actor, action, entity_type, entity_id, details, correlation_id, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,NOW())`,
      [audit.actor || null, audit.action, audit.entity_type || null, audit.entity_id || null, JSON.stringify(audit.details || {}), correlation]
    );
  } catch (err) {
    // If audit table doesn't exist or insert fails, fallback to console.log
    console.warn("audit log failed, falling back to console", err);
    console.log("AUDIT", { ...audit, correlation_id: correlation });
  }

  return correlation;
}
