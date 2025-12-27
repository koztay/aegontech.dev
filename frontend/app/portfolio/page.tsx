"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PortfolioGrid } from "@/components/portfolio";
import { PublicShell } from "@/components/shell/PublicShell";
import type { PortfolioItem } from "@/lib/types";

export default function PortfolioPage() {
    const router = useRouter();
    const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Fetch portfolio items
        fetch("/api/data/portfolio")
            .then((r) => r.json())
            .then((data) => {
                setPortfolioItems(data);
            })
            .catch((error) => {
                console.error("Error loading portfolio items:", error);
            });

        // Check dark mode preference
        if (typeof window !== "undefined") {
            const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            setIsDarkMode(isDark);
            if (isDark) {
                document.documentElement.classList.add("dark");
            }
        }
    }, []);

    const handleToggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        document.documentElement.classList.toggle("dark");
    };

    const handleExternalLink = (url: string) => {
        console.log("External link clicked:", url);
    };

    const navigationItems = [
        { label: "Home", href: "/" },
        { label: "Portfolio", href: "/portfolio" },
        { label: "Blog", href: "/blog" },
        { label: "Contact", href: "#contact" },
    ];

    return (
        <PublicShell
            navigationItems={navigationItems}
            currentPath="/portfolio"
            isDarkMode={isDarkMode}
            onToggleDarkMode={handleToggleDarkMode}
            onNavigate={(href) => {
                if (href.startsWith("#")) {
                    router.push("/" + href);
                } else {
                    router.push(href);
                }
            }}
        >
            <PortfolioGrid items={portfolioItems} onExternalLink={handleExternalLink} />
        </PublicShell>
    );
}
