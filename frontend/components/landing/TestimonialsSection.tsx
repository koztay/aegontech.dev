"use client";

import type { TestimonialsSectionProps, Testimonial } from "@/lib/types";
import { Quote, User } from "lucide-react";

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
    return (
        <div className="p-6 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50">
            {/* Quote */}
            <div className="flex items-start gap-3 mb-4">
                <Quote className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-1" />
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                    &ldquo;{testimonial.quote}&rdquo;
                </p>
            </div>

            {/* Client Info */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-indigo-100 to-cyan-100 dark:from-indigo-900/50 dark:to-cyan-900/50 flex items-center justify-center flex-shrink-0">
                    {testimonial.clientPhotoUrl ? (
                        <img
                            src={testimonial.clientPhotoUrl}
                            alt={testimonial.clientName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.currentTarget.style.display = "none";
                            }}
                        />
                    ) : (
                        <User className="w-5 h-5 text-indigo-400" />
                    )}
                </div>
                <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">
                        {testimonial.clientName}
                    </p>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400">
                        {testimonial.clientCompany}
                    </p>
                </div>
            </div>
        </div>
    );
}

export function TestimonialsSection({
    testimonials,
}: TestimonialsSectionProps) {
    return (
        <section className="py-20 bg-white dark:bg-slate-950">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-12">
                    <span className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-sm font-medium rounded-full mb-4">
                        Testimonials
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
                        What Our Clients Say
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                        Trusted by startups and enterprises alike.
                    </p>
                </div>

                {/* Testimonials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {testimonials.map((testimonial) => (
                        <TestimonialCard key={testimonial.id} testimonial={testimonial} />
                    ))}
                </div>
            </div>
        </section>
    );
}
