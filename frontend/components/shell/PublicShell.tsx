"use client";

import { Menu, X, Sun, Moon, ArrowUpRight } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

interface NavItem {
  label: string;
  href: string;
  isActive?: boolean;
}

interface PublicShellProps {
  children: React.ReactNode;
  navigationItems: NavItem[];
  currentPath?: string;
}

/* Brand mark tinted with the signal gold via CSS mask, so it tracks the theme
   accent automatically (deeper gold on light, brighter on dark). Kept inline so
   the mask url() resolves at runtime rather than through the CSS bundler. */
const logoMarkStyle: React.CSSProperties = {
  backgroundColor: "hsl(var(--signal))",
  WebkitMaskImage: "url(/assets/aegontech-logo.png)",
  maskImage: "url(/assets/aegontech-logo.png)",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskPosition: "center",
  maskPosition: "center",
  WebkitMaskSize: "contain",
  maskSize: "contain",
};

export function PublicShell({
  children,
  navigationItems,
  currentPath = "/",
}: PublicShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const shouldBeDark = savedTheme !== "light";
    setIsDarkMode(shouldBeDark);
    document.documentElement.classList.toggle("dark", shouldBeDark);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-border bg-background/80 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <nav className="mx-auto max-w-8xl px-6 sm:px-8 lg:px-16">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="group flex items-center gap-2.5">
              <span
                aria-hidden
                style={logoMarkStyle}
                className="h-8 w-8 transition-opacity group-hover:opacity-80"
              />
              <span className="font-display text-base font-semibold tracking-tight text-foreground">
                AEGONTECH
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden items-center gap-8 md:flex">
              {navigationItems.map((item) => {
                const active = currentPath === item.href || item.isActive;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`link-under font-mono text-[11px] uppercase tracking-[0.18em] transition-colors ${
                      active
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                aria-label="Toggle theme"
                className="rounded-sm p-2.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {isDarkMode ? (
                  <Sun className="h-[18px] w-[18px]" />
                ) : (
                  <Moon className="h-[18px] w-[18px]" />
                )}
              </button>

              <Link
                href="/#contact"
                className="hidden items-center gap-1.5 rounded-sm bg-signal px-5 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-signal-bright sm:inline-flex"
              >
                Start a project
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
                className="rounded-sm p-2.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          {mobileMenuOpen && (
            <div className="border-t border-border py-4 md:hidden">
              <div className="flex flex-col gap-1">
                {navigationItems.map((item) => {
                  const active = currentPath === item.href || item.isActive;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`rounded-sm px-4 py-2.5 font-mono text-xs uppercase tracking-[0.16em] transition-colors ${
                        active
                          ? "bg-secondary text-foreground"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
                <Link
                  href="/#contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-sm bg-signal px-5 py-2.5 font-mono text-xs font-medium uppercase tracking-[0.14em] text-primary-foreground"
                >
                  Start a project
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Main */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="relative overflow-hidden border-t border-border bg-surface-2/40">
        <div className="mx-auto max-w-8xl px-6 sm:px-8 lg:px-16">
          <div className="flex flex-col gap-12 py-16 md:flex-row md:items-start md:justify-between">
            <div className="max-w-sm">
              <div className="flex items-center gap-2.5">
                <span aria-hidden style={logoMarkStyle} className="h-8 w-8" />
                <span className="font-display text-base font-semibold tracking-tight text-foreground">
                  AEGONTECH
                </span>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                A software product studio. We design, build, and ship SaaS
                platforms and mobile apps that businesses run on.
              </p>
            </div>

            <div className="flex gap-16">
              <div className="flex flex-col gap-3">
                <span className="mono-label mb-1">Navigate</span>
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="link-under text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="flex flex-col gap-3">
                <span className="mono-label mb-1">Studio</span>
                <span className="font-mono text-[11px] leading-relaxed tracking-[0.14em] text-muted-foreground">
                  39.1559&deg; N
                  <br />
                  75.5272&deg; W
                </span>
                <span className="text-sm text-muted-foreground">Dover, DE</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start justify-between gap-4 border-t border-border py-8 sm:flex-row sm:items-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              © {new Date().getFullYear()} Aegontech LLC
            </p>
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              <span className="signal-tick rotate-45" aria-hidden />
              Built in Dover, DE
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
