"use client";

import type { PortfolioPreviewProps, FeaturedPortfolioItem } from "@/lib/types";
import { ArrowRight, ChevronLeft, ChevronRight, Smartphone, Globe } from "lucide-react";
import { useRef, useState, useEffect } from "react";

// Dummy placeholder images - using consistent seeds
const placeholderImages = [
    "https://picsum.photos/seed/dialable1234/400/300",
    "https://picsum.photos/seed/maximus5678/400/300",
    "https://picsum.photos/seed/cloudsync9012/400/300",
    "https://picsum.photos/seed/project4/400/300",
    "https://picsum.photos/seed/project5/400/300",
];

function PortfolioCard({
    item,
    index,
    onItemClick,
}: {
    item: FeaturedPortfolioItem;
    index: number;
    onItemClick?: (id: string) => void;
}) {
    // Use consistent index based on item ID to ensure same image across duplicates
    const imageIndex = index % (placeholderImages.length);
    const placeholderImage = placeholderImages[imageIndex];

    return (
        <div
            onClick={() => onItemClick?.(item.id)}
            className="group cursor-pointer"
            style={{ width: "240px", minWidth: "240px", maxWidth: "240px" }}
        >
            {/* Image Container - fixed size */}
            <div
                className="relative rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700 mb-2 shadow-sm group-hover:shadow-md transition-shadow"
                style={{ width: "240px", height: "180px" }}
            >
                <img
                    src={item.imageUrl || placeholderImage}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Type Badge */}
                <div className="absolute top-2 left-2">
                    <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${item.type === "mobile"
                            ? "bg-cyan-500 text-white"
                            : "bg-indigo-500 text-white"
                            }`}
                    >
                        {item.type === "mobile" ? (
                            <Smartphone className="w-2.5 h-2.5" />
                        ) : (
                            <Globe className="w-2.5 h-2.5" />
                        )}
                        {item.type === "mobile" ? "Mobile" : "SaaS"}
                    </span>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-indigo-600/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-medium text-xs">View →</span>
                </div>
            </div>

            {/* Content */}
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {item.title}
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {item.description}
            </p>
        </div>
    );
}

export function PortfolioPreview({
    items,
    onItemClick,
    onViewAll,
}: PortfolioPreviewProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // Safari fix: Force repaint to trigger CSS animation on mount
    useEffect(() => {
        // Use setTimeout to ensure Safari has completed initial paint
        const timer = setTimeout(() => {
            setIsAnimating(true);
        }, 50);
        return () => clearTimeout(timer);
    }, []);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({
                left: direction === "left" ? -200 : 200,
                behavior: "smooth",
            });
        }
    };

    // Triple items for seamless infinite scroll effect
    const extendedItems = [...items, ...items, ...items];

    return (
        <section className="py-16 bg-white dark:bg-slate-950">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="flex items-end justify-between mb-6">
                    <div>
                        <span className="inline-block px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-medium rounded-full mb-2">
                            Our Work
                        </span>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Featured Projects
                        </h2>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => scroll("left")}
                            className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => scroll("right")}
                            className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onViewAll}
                            className="ml-2 inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium text-xs"
                        >
                            View All <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>

                {/* Horizontal Scroll */}
                <div
                    className="relative overflow-hidden"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <div
                        ref={scrollRef}
                        className={`flex gap-4 pb-2 ${isAnimating ? 'animate-infinite-scroll-portfolio' : ''} ${isPaused ? 'paused' : ''}`}
                        style={{ scrollbarWidth: "none", msOverflowStyle: "none", width: "fit-content" }}
                    >
                        {extendedItems.map((item, index) => (
                            <PortfolioCard
                                key={`${item.id}-${index}`}
                                item={item}
                                index={index % items.length}
                                onItemClick={onItemClick}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
