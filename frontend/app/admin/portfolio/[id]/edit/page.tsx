"use client";

import { useState, useEffect } from "react";
import MediaSelector from "@/components/admin/MediaSelector";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function EditPortfolioItem() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [item, setItem] = useState<any>(null);
  const [showSelector, setShowSelector] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    fetch(`/api/admin/portfolio/${params.id}`)
      .then((res) => res.json())
      .then((data) => setItem(data))
      .catch(() => setError("Failed to load item"));
  }, [params.id]);

  useEffect(() => {
    if (item) {
      setScreenshotUrl(item.screenshot || "");
      setPreviewUrl(item.screenshot_url || item.screenshot || "");
    }
  }, [item]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title"),
      description: formData.get("description"),
      type: formData.get("type"),
      screenshot: screenshotUrl,
      website_url: formData.get("website_url") || null,
      app_store_url: formData.get("app_store_url") || null,
      play_store_url: formData.get("play_store_url") || null,
    };

    try {
      const response = await fetch(`/api/admin/portfolio/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push("/admin/portfolio");
      } else {
        const result = await response.json();
        setError(result.error || "Failed to update portfolio item");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this item?")) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/portfolio/${params.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/admin/portfolio");
      } else {
        setError("Failed to delete item");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  if (!item) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          ← Back
        </Button>
        <h2 className="text-2xl font-bold">Edit Portfolio Item</h2>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              defaultValue={item.title}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              defaultValue={item.description}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium mb-2">
              Type *
            </label>
            <select
              id="type"
              name="type"
              required
              defaultValue={item.type}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="saas">SaaS</option>
              <option value="mobile">Mobile</option>
            </select>
          </div>

          <div>
            <label htmlFor="screenshot" className="block text-sm font-medium mb-2">
              Screenshot URL *
            </label>
            <div className="flex items-start gap-3">
              <input
                type="text"
                id="screenshot"
                name="screenshot"
                required
                value={screenshotUrl}
                onChange={(e) => setScreenshotUrl(String(e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex flex-col items-center gap-2">
                <button type="button" className="px-3 py-1 border rounded" onClick={() => setShowSelector(true)}>Choose</button>
                {previewUrl ? <img src={previewUrl} alt="screenshot" className="w-24 h-16 object-cover rounded border" /> : null}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="website_url" className="block text-sm font-medium mb-2">
              Website URL
            </label>
            <input
              type="url"
              id="website_url"
              name="website_url"
              defaultValue={item.website_url || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="app_store_url" className="block text-sm font-medium mb-2">
              App Store URL
            </label>
            <input
              type="url"
              id="app_store_url"
              name="app_store_url"
              defaultValue={item.app_store_url || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="play_store_url" className="block text-sm font-medium mb-2">
              Play Store URL
            </label>
            <input
              type="url"
              id="play_store_url"
              name="play_store_url"
              defaultValue={item.play_store_url || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleDelete}
              disabled={loading}
              className="ml-auto text-red-600 hover:text-red-700"
            >
              Delete
            </Button>
          </div>
        </form>
      </Card>
      {showSelector ? (
        <MediaSelector onSelect={(path, url) => { setScreenshotUrl(path); setPreviewUrl(url); setShowSelector(false) }} onClose={() => setShowSelector(false)} />
      ) : null}
    </div>
  );
}
