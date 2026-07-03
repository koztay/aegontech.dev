
import MediaGallery from "@/components/admin/MediaGallery";
import { Image as ImageIcon } from "lucide-react";

export default function MediaPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h2 className="font-display text-3xl font-semibold text-foreground flex items-center gap-3">
                    <ImageIcon className="w-8 h-8 text-signal" />
                    Media Library
                </h2>
                <p className="text-muted-foreground">
                    Upload and manage images for your blog posts and portfolio items.
                </p>
            </div>

            <MediaGallery />
        </div>
    );
}
