"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NewBlogPost() {
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
      slug: formData.get("slug"),
      excerpt: formData.get("excerpt"),
      content: formData.get("content"),
      featured_image: formData.get("featured_image"),
      status: formData.get("status"),
    };

    try {
      const response = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push("/admin/blog");
      } else {
        const result = await response.json();
        setError(result.error || "Failed to create blog post");
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
        <h2 className="text-2xl font-bold">Create Blog Post</h2>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium mb-2">
              Slug *
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              required
              placeholder="my-blog-post"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium mb-2">
              Excerpt *
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-2">
              Content *
            </label>
            <textarea
              id="content"
              name="content"
              required
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="featured_image" className="block text-sm font-medium mb-2">
              Featured Image URL *
            </label>
            <input
              type="url"
              id="featured_image"
              name="featured_image"
              required
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-2">
              Status *
            </label>
            <select
              id="status"
              name="status"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Blog Post"}
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
