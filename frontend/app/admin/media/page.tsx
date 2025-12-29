
import MediaGallery from "@/components/admin/MediaGallery";
import { Image as ImageIcon } from "lucide-react";

export default function MediaPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <ImageIcon className="w-8 h-8 text-blue-600" />
                    Media Library
                </h2>
                <p className="text-gray-500">
                    Upload and manage images for your blog posts and portfolio items.
                </p>
            </div>

            <MediaGallery />
        </div>
    );
}
