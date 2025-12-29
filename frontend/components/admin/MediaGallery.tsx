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
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search media..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
                        className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors ${uploading ? "opacity-50 cursor-not-allowed" : ""
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
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
            ) : filteredMedia.length === 0 ? (
                <div className="text-center p-12 bg-gray-50 rounded-lg border border-dashed">
                    <p className="text-gray-500">No media found</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredMedia.map((asset) => (
                        <div
                            key={asset.id}
                            className="group relative bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-shadow"
                        >
                            {/* Image Preview */}
                            <div className="aspect-square relative bg-gray-100">
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
                                        className="p-2 bg-white rounded-full hover:bg-blue-50 text-gray-700 transition"
                                        title="Copy Markdown Link"
                                    >
                                        <LinkIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(asset)}
                                        className="p-2 bg-white rounded-full hover:bg-red-50 text-red-600 transition"
                                        title="Delete Image"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Meta Info */}
                            <div className="p-3">
                                <p className="text-sm font-medium text-gray-900 truncate" title={asset.alt_text}>
                                    {asset.alt_text || "Untitled"}
                                </p>
                                <p className="text-xs text-gray-500 truncate" title={asset.created_at}>
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
                    className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg text-white flex items-center gap-2 z-50 ${toast.type === "success" ? "bg-green-600" : "bg-red-600"
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
