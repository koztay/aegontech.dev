import { getServiceRoleClient } from "@/lib/supabase/client";
import { withCorrelationId } from "@/lib/observability/logging";

type AuditParams = {
  actorId: string;
  actorType: "user" | "api_key";
  action: string;
  entityType: string;
  entityId?: string;
  outcome: "success" | "failure";
  correlationId?: string;
  ip?: string;
  userAgent?: string;
};

export async function writeAuditLog(params: AuditParams) {
  const client = getServiceRoleClient();
  const correlationId = withCorrelationId(params.correlationId);
  await client.from("audit_logs").insert({
    actor_id: params.actorId,
    actor_type: params.actorType,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId,
    outcome: params.outcome,
    correlation_id: correlationId,
    ip: params.ip,
    user_agent: params.userAgent
  });
}
