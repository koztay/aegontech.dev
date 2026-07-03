"use client";

import { useState, useEffect } from "react";
import { Upload, Trash2, Link as LinkIcon, Search, Loader2, X } from "lucide-react";

interface MediaAsset {
    id: string;
    url: string;
    alt_text: string;
    storage_path: string;
    created_at: string;
    mime_type: string;
}

export default function MediaGallery() {
    const [media, setMedia] = useState<MediaAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    // Fetch media on mount
    useEffect(() => {
        fetchMedia();
    }, []);

    const fetchMedia = async () => {
        try {
            const res = await fetch("/api/media/list?limit=50");
            if (res.ok) {
                const data = await res.json();
                setMedia(data.media || []);
            }
        } catch (error) {
            console.error("Failed to fetch media:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", files[0]);
        formData.append("altText", files[0].name.split(".")[0]); // Default alt text

        try {
            const res = await fetch("/api/media/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            const data = await res.json();
            setMedia([data.media, ...media]); // Prepend new image
            showToast("Image uploaded successfully", "success");
        } catch (error) {
            console.error("Upload error:", error);
            showToast("Failed to upload image", "error");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (asset: MediaAsset) => {
        if (!confirm("Are you sure you want to delete this image?")) return;

        try {
            const res = await fetch("/api/media/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ objectKey: asset.storage_path }),
            });

            if (!res.ok) throw new Error("Delete failed");

            setMedia(media.filter((m) => m.id !== asset.id));
            showToast("Image deleted", "success");
        } catch (error) {
            console.error("Delete error:", error);
            showToast("Failed to delete image", "error");
        }
    };

    const copyToClipboard = (url: string) => {
        // Generate markdown format
        const markdown = `![Image](${url})`;
        navigator.clipboard.writeText(markdown);
        showToast("Markdown link copied!", "success");
    };

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const filteredMedia = media.filter(
        (m) =>
            (m.alt_text || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.storage_path.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search media..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-md border border-border bg-background pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-signal focus:outline-none"
                    />
                </div>

                <div className="relative">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="media-upload"
                        disabled={uploading}
                    />
                    <label
                        htmlFor="media-upload"
                        className={`flex items-center gap-2 px-4 py-2 bg-signal text-primary-foreground rounded-md cursor-pointer hover:bg-signal-bright transition-colors ${uploading ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                    >
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        <span>Upload New Image</span>
                    </label>
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            ) : filteredMedia.length === 0 ? (
                <div className="text-center p-12 bg-surface rounded-lg border border-dashed border-border">
                    <p className="text-muted-foreground">No media found</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredMedia.map((asset) => (
                        <div
                            key={asset.id}
                            className="group relative bg-surface rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow"
                        >
                            {/* Image Preview */}
                            <div className="aspect-square relative bg-secondary">
                                <img
                                    src={asset.url}
                                    alt={asset.alt_text || "Media Asset"}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />

                                {/* Overlay Actions */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => copyToClipboard(asset.url)}
                                        className="p-2 bg-surface-2 rounded-full hover:bg-secondary text-foreground transition"
                                        title="Copy Markdown Link"
                                    >
                                        <LinkIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(asset)}
                                        className="p-2 bg-surface-2 rounded-full hover:bg-destructive/10 text-destructive transition"
                                        title="Delete Image"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Meta Info */}
                            <div className="p-3">
                                <p className="text-sm font-medium text-foreground truncate" title={asset.alt_text}>
                                    {asset.alt_text || "Untitled"}
                                </p>
                                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground truncate" title={asset.created_at}>
                                    {new Date(asset.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Toast Notification */}
            {toast && (
                <div
                    className={`fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg flex items-center gap-2 z-50 ${toast.type === "success" ? "bg-signal text-primary-foreground" : "bg-destructive text-destructive-foreground"
                        }`}
                >
                    <span>{toast.message}</span>
                    <button onClick={() => setToast(null)}>
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
