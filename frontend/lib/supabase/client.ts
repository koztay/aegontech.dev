import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

let anonClient: SupabaseClient | null = null;
let serviceClient: SupabaseClient | null = null;

/**
 * Returns a cached Supabase client for public/anon operations.
 * Use for read-only queries guarded by RLS.
 */
export function getSupabaseClient(): SupabaseClient {
  if (anonClient) return anonClient;
  anonClient = createClient(requireEnv(SUPABASE_URL, "SUPABASE_URL"), requireEnv(SUPABASE_ANON_KEY, "SUPABASE_ANON_KEY"));
  return anonClient;
}

/**
 * Returns a cached Supabase client using the service role key.
 * Use ONLY on the server for privileged operations (migrations, ingestion).
 */
export function getServiceRoleClient(): SupabaseClient {
  if (serviceClient) return serviceClient;
  serviceClient = createClient(requireEnv(SUPABASE_URL, "SUPABASE_URL"), requireEnv(SUPABASE_SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY"), {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  return serviceClient;
}

/**
 * Convenience helper to run a function with the service-role client.
 */
export async function withServiceRole<T>(fn: (client: SupabaseClient) => Promise<T>): Promise<T> {
  const client = getServiceRoleClient();
  return fn(client);
}
