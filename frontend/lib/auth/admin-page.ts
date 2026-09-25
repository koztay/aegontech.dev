import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/session";

/**
 * Call as the FIRST statement of every server-rendered admin page, before any data access.
 * Defence in depth: the layout and proxy also check, but a page segment can render without
 * its layout re-running.
 */
export async function requireAdminPage(): Promise<void> {
  const cookieStore = await cookies();
  if (!(await verifySession(cookieStore.get(SESSION_COOKIE)?.value))) {
    redirect("/admin-login");
  }
}
