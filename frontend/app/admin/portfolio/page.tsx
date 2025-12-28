import { getDbPool } from "@/lib/db/client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

async function getPortfolioItems() {
  const pool = getDbPool();
  const result = await pool.query(
    "SELECT id, title, description, type, screenshot, website_url, app_store_url, play_store_url, created_at FROM portfolio_items ORDER BY created_at DESC"
  );
  return result.rows;
}

export default async function AdminPortfolio() {
  const items = await getPortfolioItems();
  const MediaUploader = (await import('@/components/admin/MediaUploader')).default;

  return (
    <div className="space-y-6">
      <MediaUploader associatedType="portfolio" />
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Portfolio Management</h2>
        <Link href="/admin/portfolio/new">
          <Button>Create New Item</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {items.map((item) => {
          const slug = item.title.toLowerCase().replace(/\s+/g, '-');
          const projectUrl = item.website_url || item.app_store_url || item.play_store_url;
          
          return (
            <Card key={item.id} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.description}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Type: {item.type} | Created: {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/portfolio/${item.id}/edit`}>
                    <Button variant="outline" size="sm">Edit</Button>
                  </Link>
                  {projectUrl && (
                    <a href={projectUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">View</Button>
                    </a>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No portfolio items yet. Create your first item to get started.
        </div>
      )}
    </div>
  );
}
