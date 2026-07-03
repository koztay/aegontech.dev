import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { LayoutDashboard, FolderKanban, FileText, LogOut, Image as ImageIcon } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  if (!session) {
    redirect("/admin-login");
  }

  const navLink =
    "flex items-center gap-3 rounded-md px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground";

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-border bg-surface">
        <div className="border-b border-border p-6">
          <h1 className="font-display text-lg font-semibold tracking-tight text-foreground">
            AEGONTECH
          </h1>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-signal">
            Admin
          </p>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          <Link href="/admin" className={navLink}>
            <LayoutDashboard className="h-[18px] w-[18px]" />
            <span>Dashboard</span>
          </Link>
          <Link href="/admin/portfolio" className={navLink}>
            <FolderKanban className="h-[18px] w-[18px]" />
            <span>Portfolio</span>
          </Link>
          <Link href="/admin/blog" className={navLink}>
            <FileText className="h-[18px] w-[18px]" />
            <span>Blog</span>
          </Link>
          <Link href="/admin/media" className={navLink}>
            <ImageIcon className="h-[18px] w-[18px]" />
            <span>Media</span>
          </Link>
        </nav>
        <div className="border-t border-border p-4">
          <form action="/api/admin/logout" method="POST">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-md px-4 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="h-[18px] w-[18px]" />
              <span>Logout</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
