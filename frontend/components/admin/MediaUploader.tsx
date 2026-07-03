"use client";
import React, { useState } from "react";

export default function MediaUploader({ associatedType, associatedId }:{associatedType?:string, associatedId?:string}){
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return setStatus("Please choose a file");
    if (!altText) return setStatus("Alt text is required");

    try {
      setStatus('Uploading file to server...');
      const fd = new FormData();
      fd.append('file', file);
      fd.append('altText', altText);
      if (associatedType) fd.append('associatedType', associatedType);
      if (associatedId) fd.append('associatedId', String(associatedId));

      const res = await fetch('/api/media/proxy', {
        method: 'POST',
        body: fd
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');

      setStatus('Upload complete');
      setFile(null);
      setAltText('');
    } catch (err: any) {
      console.error(err);
      setStatus('Error: ' + (err.message || String(err)));
    }
  }

  return (
    <form onSubmit={handleUpload} className="p-4 bg-surface border border-border rounded-lg mb-6">
      <h4 className="font-display font-semibold text-foreground mb-2">Upload Media</h4>
      <div className="flex flex-col gap-2">
        <input type="file" accept="image/*" onChange={(e)=>setFile(e.target.files?.[0]||null)} className="text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:text-foreground hover:file:bg-secondary/80" />
        <input type="text" placeholder="Alt text (required)" value={altText} onChange={(e)=>setAltText(e.target.value)} className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-signal focus:outline-none" />
        <div className="flex items-center gap-2">
          <button type="submit" className="rounded-md bg-signal px-3 py-1.5 text-sm text-primary-foreground transition-colors hover:bg-signal-bright">Upload</button>
          <span className="text-sm text-muted-foreground">{status}</span>
        </div>
      </div>
    </form>
  );
}
