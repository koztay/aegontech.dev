"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NewPortfolioItem() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title"),
      description: formData.get("description"),
      type: formData.get("type"),
      screenshot: formData.get("screenshot"),
      website_url: formData.get("website_url") || null,
      app_store_url: formData.get("app_store_url") || null,
      play_store_url: formData.get("play_store_url") || null,
    };

    try {
      const response = await fetch("/api/admin/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push("/admin/portfolio");
      } else {
        const result = await response.json();
        setError(result.error || "Failed to create portfolio item");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          ← Back
        </Button>
        <h2 className="font-display text-2xl font-semibold text-foreground">Create Portfolio Item</h2>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-signal focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-signal focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-foreground mb-2">
              Type *
            </label>
            <select
              id="type"
              name="type"
              required
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-signal focus:outline-none"
            >
              <option value="saas">SaaS</option>
              <option value="mobile">Mobile</option>
            </select>
          </div>

          <div>
            <label htmlFor="screenshot" className="block text-sm font-medium text-foreground mb-2">
              Screenshot URL *
            </label>
            <input
              type="text"
              id="screenshot"
              name="screenshot"
              required
              placeholder="/path/in/bucket or https://example.com/image.jpg"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-signal focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="website_url" className="block text-sm font-medium text-foreground mb-2">
              Website URL
            </label>
            <input
              type="url"
              id="website_url"
              name="website_url"
              placeholder="https://example.com"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-signal focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="app_store_url" className="block text-sm font-medium text-foreground mb-2">
              App Store URL
            </label>
            <input
              type="url"
              id="app_store_url"
              name="app_store_url"
              placeholder="https://apps.apple.com/..."
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-signal focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="play_store_url" className="block text-sm font-medium text-foreground mb-2">
              Play Store URL
            </label>
            <input
              type="url"
              id="play_store_url"
              name="play_store_url"
              placeholder="https://play.google.com/..."
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-signal focus:outline-none"
            />
          </div>

          {error && (
            <div className="text-destructive text-sm">{error}</div>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Portfolio Item"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
