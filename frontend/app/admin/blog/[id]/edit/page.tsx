"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function EditBlogPost() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/admin/blog/${params.id}`)
      .then((res) => res.json())
      .then((data) => setPost(data))
      .catch(() => setError("Failed to load post"));
  }, [params.id]);

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
      const response = await fetch(`/api/admin/blog/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push("/admin/blog");
      } else {
        const result = await response.json();
        setError(result.error || "Failed to update blog post");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this post?")) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/blog/${params.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/admin/blog");
      } else {
        setError("Failed to delete post");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  if (!post) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          ← Back
        </Button>
        <h2 className="text-2xl font-bold">Edit Blog Post</h2>
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
              defaultValue={post.title}
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
              defaultValue={post.slug}
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
              defaultValue={post.excerpt}
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
              defaultValue={post.content}
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
              defaultValue={post.featured_image}
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
              defaultValue={post.status}
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
    </div>
  );
}
