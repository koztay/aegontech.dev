import { getDbPool } from "@/lib/db/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: string;
  created_at: string;
}

async function getBlogPosts() {
  const pool = getDbPool();
  const result = await pool.query(
    "SELECT id, title, slug, status, created_at FROM blog_posts ORDER BY created_at DESC"
  );
  return result.rows as BlogPost[];
}

export default async function AdminBlog() {
  const posts = await getBlogPosts();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Blog Management</h2>
        <Link href="/admin/blog/new">
          <Button>Create New Post</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {posts.map((post) => (
          <Card key={post.id} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{post.title}</h3>
                <p className="text-sm text-gray-500">/{post.slug}</p>
                <p className="text-sm text-gray-500">
                  Status: {post.status} | Created: {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/blog/${post.id}/edit`}>
                  <Button variant="outline" size="sm">Edit</Button>
                </Link>
                <Link href={`/blog/${post.slug}`} target="_blank">
                  <Button variant="outline" size="sm">View</Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No blog posts yet. Create your first post to get started.
        </div>
      )}
    </div>
  );
}
