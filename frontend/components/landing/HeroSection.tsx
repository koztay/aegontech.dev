"use client";

import type { HeroSectionProps } from "@/lib/types";
import { ArrowRight, ChevronDown } from "lucide-react";

export function HeroSection({ content, onCtaClick }: HeroSectionProps) {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-900">
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src="/assets/hero-image.jpeg"
                    alt="Tech background"
                    className="w-full h-full object-cover"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/70 to-slate-900" />

                {/* Decorative gradient orbs */}
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/30 rounded-full blur-[128px]" />
                <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-cyan-500/20 rounded-full blur-[100px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px]" />

                {/* Grid pattern overlay */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
                        backgroundSize: "64px 64px",
                    }}
                />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-5xl mx-auto px-6 text-center py-20">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 border border-white/20 text-base text-white mb-10 backdrop-blur-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    Software Development Company
                </div>

                {/* Main Heading */}
                <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold text-white leading-[1.05] tracking-tight mb-8">
                    {content.tagline.split(" ").slice(0, 2).join(" ")}{" "}
                    <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                        {content.tagline.split(" ").slice(2).join(" ")}
                    </span>
                </h1>

                {/* Description */}
                <p className="text-xl sm:text-2xl text-slate-200 max-w-3xl mx-auto mb-12 leading-relaxed">
                    {content.description}
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                        onClick={onCtaClick}
                        className="group inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30"
                    >
                        {content.ctaText}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button className="inline-flex items-center gap-2 px-8 py-4 text-slate-300 hover:text-white font-medium transition-colors">
                        Learn More
                    </button>
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-500 animate-bounce">
                <ChevronDown className="w-6 h-6" />
            </div>
        </section>
    );
}
