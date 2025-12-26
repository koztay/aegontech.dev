import { getServiceRoleClient } from "@/lib/supabase/client";

export type AdminSession = {
  userId: string;
  email?: string;
};

function extractBearer(req: Request): string | null {
  const header = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!header) return null;
  const parts = header.split(" ");
  if (parts.length === 2 && /^bearer$/i.test(parts[0])) {
    return parts[1];
  }
  return null;
}

export async function requireAdminSession(req: Request): Promise<AdminSession> {
  const token = extractBearer(req);
  if (!token) {
    throw Object.assign(new Error("Missing bearer token"), { status: 401 });
  }

  const supabase = getServiceRoleClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    throw Object.assign(error ?? new Error("Invalid token"), { status: 401 });
  }

  const roles = (data.user.user_metadata as Record<string, unknown> | null)?.roles as string[] | undefined;
  if (!roles?.includes("admin")) {
    throw Object.assign(new Error("Forbidden"), { status: 403 });
  }

  return { userId: data.user.id, email: data.user.email ?? undefined };
}
