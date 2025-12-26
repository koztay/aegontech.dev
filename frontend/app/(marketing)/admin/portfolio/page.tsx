"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const TYPES = ["web", "app"] as const;

type Status = {
  state: "idle" | "pending" | "success" | "error";
  message?: string;
};

export default function AdminPortfolioPage() {
  const [sourceUrl, setSourceUrl] = useState("");
  const [type, setType] = useState<(typeof TYPES)[number]>("web");
  const [featured, setFeatured] = useState(false);
  const [orderRank, setOrderRank] = useState<number>(0);
  const [titleOverride, setTitleOverride] = useState("");
  const [summaryOverride, setSummaryOverride] = useState("");
  const [tags, setTags] = useState("");
  const [adminToken, setAdminToken] = useState("");
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [lastResult, setLastResult] = useState<Record<string, unknown> | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ state: "pending" });
    setLastResult(null);

    try {
      const res = await fetch("/api/portfolio/ingest", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: adminToken ? `Bearer ${adminToken}` : ""
        },
        body: JSON.stringify({
          sourceUrl,
          type,
          featured,
          orderRank,
          overrides: {
            title: titleOverride || undefined,
            summary: summaryOverride || undefined,
            tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined
          }
        })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error ?? "Ingestion failed");
      }

      setStatus({ state: json.needsAttention ? "error" : "success", message: json.needsAttention ? "Completed with issues" : "Ingested" });
      setLastResult(json);
    } catch (error) {
      setStatus({ state: "error", message: (error as Error).message });
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <header className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-foreground/80">Admin</p>
        <h1 className="text-3xl font-semibold text-ink">Portfolio ingestion</h1>
        <p className="text-slate-600">Create or update items from URLs with optional overrides.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Ingest from URL</CardTitle>
          <CardDescription>Requires admin Supabase JWT (paste below).</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2 text-sm text-slate-700">
              Admin JWT
              <input
                type="password"
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
                className="rounded-md border border-slate-300 px-3 py-2"
                placeholder="Paste Supabase JWT for admin user"
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-slate-700">
              Source URL
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className="rounded-md border border-slate-300 px-3 py-2"
                placeholder="https://..."
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-slate-700">
              Type
              <select
                value={type}
                onChange={(e) => setType(e.target.value as (typeof TYPES)[number])}
                className="rounded-md border border-slate-300 px-3 py-2"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
              Mark as featured
            </label>
            <label className="flex flex-col gap-2 text-sm text-slate-700">
              Order rank
              <input
                type="number"
                value={orderRank}
                onChange={(e) => setOrderRank(Number(e.target.value))}
                className="rounded-md border border-slate-300 px-3 py-2"
                min={0}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-slate-700">
              Title override
              <input
                type="text"
                value={titleOverride}
                onChange={(e) => setTitleOverride(e.target.value)}
                className="rounded-md border border-slate-300 px-3 py-2"
                placeholder="Optional"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-slate-700">
              Summary override
              <textarea
                value={summaryOverride}
                onChange={(e) => setSummaryOverride(e.target.value)}
                className="rounded-md border border-slate-300 px-3 py-2"
                placeholder="Optional"
                rows={3}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-slate-700">
              Tags (comma separated)
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="rounded-md border border-slate-300 px-3 py-2"
                placeholder="design, mobile, saas"
              />
            </label>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={status.state === "pending"}>
                {status.state === "pending" ? "Submitting..." : "Submit"}
              </Button>
              {status.state === "success" && <span className="text-sm text-green-600">Saved</span>}
              {status.state === "error" && <span className="text-sm text-red-600">{status.message ?? "Failed"}</span>}
              {status.state === "pending" && <span className="text-sm text-slate-500">Working...</span>}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center gap-3 text-sm text-slate-600">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary">View last response</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Last ingestion result</DialogTitle>
            </DialogHeader>
            <pre className="max-h-80 overflow-auto rounded-md bg-slate-950 p-4 text-xs text-slate-100">
              {lastResult ? JSON.stringify(lastResult, null, 2) : "No ingestions yet"}
            </pre>
          </DialogContent>
        </Dialog>
        {status.state === "error" && status.message && <span className="text-red-600">{status.message}</span>}
      </div>
    </main>
  );
}
