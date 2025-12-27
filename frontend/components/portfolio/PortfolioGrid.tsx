import type { PortfolioGridProps } from "@/lib/types";
import { PortfolioCard } from "./PortfolioCard";

export function PortfolioGrid({ items, onExternalLink }: PortfolioGridProps) {
    return (
        <section className="py-16 bg-slate-50 dark:bg-slate-950">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-12">
                    <span className="inline-block px-4 py-1.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-sm font-semibold rounded-full mb-4">
                        Our Work
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                        Portfolio
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Explore our collection of SaaS applications and mobile apps built
                        for clients worldwide.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                        <PortfolioCard
                            key={item.id}
                            item={item}
                            onExternalLink={onExternalLink}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
