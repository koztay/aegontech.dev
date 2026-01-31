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
      setItems(json.items || []);
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
      setItems(json.items || []);
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center p-6 z-50">
      <div className="bg-white rounded shadow max-w-4xl w-full max-h-[80vh] overflow-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Select Media</h3>
          <div className="flex items-center gap-2">
            <form onSubmit={search} className="flex items-center gap-2">
              <input className="border px-2 py-1 rounded" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
              <button className="px-2 py-1 bg-blue-600 text-white rounded">Search</button>
            </form>
            <button className="px-2 py-1 border rounded" onClick={() => { onClose?.(); }}>Close</button>
          </div>
        </div>

        {loading && <div>Loading...</div>}

        <div className="grid grid-cols-4 gap-3">
          {items.map(it => (
            <div key={it.id} className="border rounded p-2 cursor-pointer hover:shadow" onClick={() => { onSelect(it.storage_path, it.presigned_url || it.url); onClose?.(); }}>
              <img src={it.presigned_url || it.url} alt={it.alt_text || ""} className="w-full h-32 object-cover mb-2 rounded" />
              <div className="text-xs text-gray-600 truncate">{it.alt_text || it.storage_path}</div>
              <div className="text-xs text-slate-400">{new Date(it.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
