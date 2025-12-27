"use client";

import type { ServicesSectionProps, Service } from "@/lib/types";
import { Code, Smartphone, Cloud, Palette, Server, Zap } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
    code: <Code className="w-6 h-6" />,
    smartphone: <Smartphone className="w-6 h-6" />,
    cloud: <Cloud className="w-6 h-6" />,
    palette: <Palette className="w-6 h-6" />,
    server: <Server className="w-6 h-6" />,
    zap: <Zap className="w-6 h-6" />,
};

function ServiceCard({ service }: { service: Service }) {
    const icon = iconMap[service.icon] || <Code className="w-6 h-6" />;

    return (
        <div className="group p-6 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {service.title}
            </h3>

            {/* Description */}
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                {service.description}
            </p>
        </div>
    );
}

export function ServicesSection({ services }: ServicesSectionProps) {
    return (
        <section className="py-20 bg-slate-50 dark:bg-slate-900">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-12">
                    <span className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-sm font-medium rounded-full mb-4">
                        What We Do
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
                        Our Services
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                        From concept to deployment, we deliver exceptional software
                        solutions.
                    </p>
                </div>

                {/* Services Grid - Compact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service) => (
                        <ServiceCard key={service.id} service={service} />
                    ))}
                </div>
            </div>
        </section>
    );
}
