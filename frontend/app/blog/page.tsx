"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BlogList } from "@/components/blog";
import { PublicShell } from "@/components/shell/PublicShell";
import type { BlogPost } from "@/lib/types";

export default function BlogPage() {
  const router = useRouter();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Fetch blog posts
    fetch("/api/data/blog")
      .then((r) => r.json())
      .then((data) => {
        setBlogPosts(data);
      })
      .catch((error) => {
        console.error("Error loading blog posts:", error);
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

  const handlePostClick = (slug: string) => {
    router.push(`/blog/${slug}`);
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
      <BlogList posts={blogPosts} onPostClick={handlePostClick} />
    </PublicShell>
  );
}
