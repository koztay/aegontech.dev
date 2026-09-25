import Link from "next/link";
import { getDb } from "@/lib/db/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

async function getStats() {
  const db = getDb();

  const [portfolioCount, blogCount] = await Promise.all([
    db.from("portfolio_items").select("*", { count: "exact", head: true }),
    db.from("blog_posts").select("*", { count: "exact", head: true }),
  ]);
  if (portfolioCount.error) throw new Error(portfolioCount.error.message);
  if (blogCount.error) throw new Error(blogCount.error.message);

  return {
    portfolioItems: portfolioCount.count ?? 0,
    blogPosts: blogCount.count ?? 0,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-2xl font-semibold text-foreground">Dashboard</h2>
        <form action="/api/admin/logout" method="POST">
          <Button variant="outline" type="submit">
            Logout
          </Button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Portfolio Items</h3>
          <p className="mt-2 text-3xl font-semibold text-foreground">{stats.portfolioItems}</p>
          <Link href="/admin/portfolio">
            <Button className="mt-4">Manage Portfolio</Button>
          </Link>
        </Card>

        <Card className="p-6">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Blog Posts</h3>
          <p className="mt-2 text-3xl font-semibold text-foreground">{stats.blogPosts}</p>
          <Link href="/admin/blog">
            <Button className="mt-4">Manage Blog</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
