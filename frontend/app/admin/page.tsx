import Link from "next/link";
import { getDbPool } from "@/lib/db/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

async function getStats() {
  const pool = getDbPool();
  
  const [portfolioCount, blogCount] = await Promise.all([
    pool.query("SELECT COUNT(*) FROM portfolio_items"),
    pool.query("SELECT COUNT(*) FROM blog_posts"),
  ]);

  return {
    portfolioItems: parseInt(portfolioCount.rows[0].count),
    blogPosts: parseInt(blogCount.rows[0].count),
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <form action="/api/admin/logout" method="POST">
          <Button variant="outline" type="submit">
            Logout
          </Button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Portfolio Items</h3>
          <p className="text-3xl font-bold">{stats.portfolioItems}</p>
          <Link href="/admin/portfolio">
            <Button className="mt-4">Manage Portfolio</Button>
          </Link>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Blog Posts</h3>
          <p className="text-3xl font-bold">{stats.blogPosts}</p>
          <Link href="/admin/blog">
            <Button className="mt-4">Manage Blog</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
