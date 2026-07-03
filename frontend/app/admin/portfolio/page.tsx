import { getDbPool } from "@/lib/db/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PortfolioRowActions from "@/components/admin/PortfolioRowActions";

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  type: string;
  screenshot: string;
  website_url: string | null;
  app_store_url: string | null;
  play_store_url: string | null;
  published: boolean;
  created_at: string;
}

async function getPortfolioItems() {
  const pool = getDbPool();
  const result = await pool.query(
    "SELECT id, title, description, type, screenshot, website_url, app_store_url, play_store_url, published, created_at FROM portfolio_items ORDER BY created_at DESC"
  );
  return result.rows as PortfolioItem[];
}

export default async function AdminPortfolio() {
  const items = await getPortfolioItems();
  const MediaUploader = (await import("@/components/admin/MediaUploader")).default;

  return (
    <div className="space-y-6">
      <MediaUploader associatedType="portfolio" />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">
            Portfolio Management
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length} item{items.length === 1 ? "" : "s"} ·{" "}
            {items.filter((i) => i.published).length} published
          </p>
        </div>
        <Link href="/admin/portfolio/new">
          <Button>Create New Item</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {items.map((item) => {
          const projectUrl =
            item.website_url || item.app_store_url || item.play_store_url;

          return (
            <Card
              key={item.id}
              className={`p-6 transition-opacity ${
                item.published ? "" : "opacity-70"
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <StatusBadge published={item.published} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                  <p className="mt-2 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground/70">
                    {item.type} · {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/portfolio/${item.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    {projectUrl && (
                      <a
                        href={projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </a>
                    )}
                  </div>
                  <PortfolioRowActions id={item.id} published={item.published} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {items.length === 0 && (
        <div className="rounded-lg border border-dashed border-border py-12 text-center text-muted-foreground">
          No portfolio items yet. Create your first item to get started.
        </div>
      )}
    </div>
  );
}

function StatusBadge({ published }: { published: boolean }) {
  if (published) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-signal/30 bg-signal/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-signal">
        <span className="h-1.5 w-1.5 rounded-full bg-signal" />
        Published
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
      Hidden
    </span>
  );
}
