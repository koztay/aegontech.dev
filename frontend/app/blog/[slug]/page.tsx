"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { BlogDetail } from "@/components/blog";
import { PublicShell } from "@/components/shell/PublicShell";
import type { BlogPost } from "@/lib/types";

export default function BlogDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Fetch blog post by slug
    fetch(`/api/data/blog/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setPost(data);
      })
      .catch((error) => {
        console.error("Error loading blog post:", error);
      });

    // Check dark mode preference
    if (typeof window !== "undefined") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add("dark");
      }
    }
  }, [slug]);

  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleBack = () => {
    router.push("/blog");
  };

  const navigationItems = [
    { label: "Home", href: "/" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "#contact" },
  ];

  if (!post) {
    return (
      <PublicShell
        navigationItems={navigationItems}
        currentPath="/blog"
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onNavigate={(href) => router.push(href)}
      >
        <div className="py-16 text-center">
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </PublicShell>
    );
  }

  return (
    <PublicShell
      navigationItems={navigationItems}
      currentPath="/blog"
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
      <BlogDetail post={post} onBack={handleBack} />
    </PublicShell>
  );
}
