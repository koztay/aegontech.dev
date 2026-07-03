"use client";
import React, { useEffect, useState } from "react";

export default function MediaSelector({ onSelect, onClose }: { onSelect: (path: string, url: string) => void, onClose?: () => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetchList();
  }, []);

  async function fetchList() {
    setLoading(true);
    try {
      const res = await fetch(`/api/media/list?limit=64`);
      const json = await res.json();
      setItems(json.media || []);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false) }
  }

  async function search(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/media/list?q=${encodeURIComponent(q)}&limit=64`);
      const json = await res.json();
      setItems(json.media || []);
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center p-6 z-50">
      <div className="bg-surface border border-border rounded-lg shadow max-w-4xl w-full max-h-[80vh] overflow-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-foreground">Select Media</h3>
          <div className="flex items-center gap-2">
            <form onSubmit={search} className="flex items-center gap-2">
              <input className="rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-signal focus:outline-none" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
              <button className="rounded-md bg-signal px-3 py-1 text-sm text-primary-foreground transition-colors hover:bg-signal-bright">Search</button>
            </form>
            <button className="rounded-md border border-border px-3 py-1 text-sm text-foreground transition-colors hover:bg-secondary" onClick={() => { onClose?.(); }}>Close</button>
          </div>
        </div>

        {loading && <div className="text-muted-foreground">Loading...</div>}

        <div className="grid grid-cols-4 gap-3">
          {items.map(it => (
            <div key={it.id} className="border border-border rounded-lg p-2 cursor-pointer transition-colors hover:bg-secondary" onClick={() => { onSelect(it.storage_path, it.presigned_url || it.url); onClose?.(); }}>
              <img src={it.presigned_url || it.url} alt={it.alt_text || ""} className="w-full h-32 object-cover mb-2 rounded" />
              <div className="text-xs text-muted-foreground truncate">{it.alt_text || it.storage_path}</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">{new Date(it.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
