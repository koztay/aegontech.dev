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
    <form onSubmit={handleUpload} className="p-4 bg-white rounded shadow mb-6">
      <h4 className="font-semibold mb-2">Upload Media</h4>
      <div className="flex flex-col gap-2">
        <input type="file" accept="image/*" onChange={(e)=>setFile(e.target.files?.[0]||null)} />
        <input type="text" placeholder="Alt text (required)" value={altText} onChange={(e)=>setAltText(e.target.value)} className="border rounded px-2 py-1" />
        <div className="flex items-center gap-2">
          <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Upload</button>
          <span className="text-sm text-gray-600">{status}</span>
        </div>
      </div>
    </form>
  );
}
