"use client";

import { useState } from "react";
import type { ContactSectionProps, ContactFormData } from "@/lib/types";
import { MapPin, Mail, Phone, Send, CheckCircle } from "lucide-react";

export function ContactSection({ contactInfo, onSubmit }: ContactSectionProps) {
    const [formData, setFormData] = useState<ContactFormData>({
        name: "",
        email: "",
        message: "",
        from: "aegontech.dev",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                message: formData.message,
                from: formData.from ?? "aegontech.dev",
                userAgent: typeof navigator !== "undefined" ? navigator.userAgent : formData.userAgent,
                receivedAt: new Date().toISOString(),
            };
            // Debug: print exactly what the frontend will send
            // Check browser console to verify `from` is present before it reaches n8n
            // eslint-disable-next-line no-console
            console.log("[ContactSection] submitting payload:", payload);

            await onSubmit?.(payload as any);

            setIsSubmitted(true);
            setFormData({ name: "", email: "", message: "", from: "aegontech.dev" });
            setTimeout(() => setIsSubmitted(false), 5000);
        } catch (error) {
            console.error("Failed to submit contact form:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="contact" className="py-20 bg-slate-50 dark:bg-slate-900">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-12">
                    <span className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-sm font-medium rounded-full mb-4">
                        Contact
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
                        Let&apos;s Build Something Amazing
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                        Ready to start your project? Contact us today.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Contact Form */}
                    <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        {isSubmitted ? (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                                    Message Sent!
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm">
                                    We&apos;ll get back to you soon.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input type="hidden" name="from" value="aegontech.dev" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) =>
                                                setFormData({ ...formData, name: e.target.value })
                                            }
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            placeholder="Your name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) =>
                                                setFormData({ ...formData, email: e.target.value })
                                            }
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                        Message
                                    </label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={formData.message}
                                        onChange={(e) =>
                                            setFormData({ ...formData, message: e.target.value })
                                        }
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                                        placeholder="Tell us about your project..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white font-medium rounded-lg transition-all duration-300"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Send Message
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Contact Info */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Map Embed */}
                        <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white flex items-center justify-center" style={{ minHeight: 300 }}>
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3191.8514062272557!2d-75.52716622470389!3d39.15586722710242!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c764aa7c38b56d%3A0x1c6368e17a8edc56!2s8%20The%20Green%20Suite%20B%2C%20Dover%2C%20DE%2019910%2C%20USA!5e0!3m2!1sen!2str!4v1766932429361!5m2!1sen!2str"
                                width="400"
                                height="300"
                                style={{ border: 0, display: 'block' }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Google Map"
                                onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerHTML += '<div class="text-center text-slate-500">Map failed to load</div>'; }}
                            />
                        </div>

                        {/* Contact Cards */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Address
                                    </p>
                                    <p className="text-sm text-slate-900 dark:text-white font-medium">
                                        {contactInfo.address}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Email
                                    </p>
                                    <p className="text-sm text-slate-900 dark:text-white font-medium">
                                        {contactInfo.email}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0">
                                    <Phone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Phone
                                    </p>
                                    <p className="text-sm text-slate-900 dark:text-white font-medium">
                                        {contactInfo.phone}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
