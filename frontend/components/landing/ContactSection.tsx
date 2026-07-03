"use client";

import { useState } from "react";
import type { ContactSectionProps, ContactFormData } from "@/lib/types";
import { ArrowRight, CheckCircle2, MapPin, Mail, Phone } from "lucide-react";

export function ContactSection({ contactInfo }: ContactSectionProps) {
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
        userAgent:
          typeof navigator !== "undefined" ? navigator.userAgent : formData.userAgent,
        receivedAt: new Date().toISOString(),
      };

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to submit contact form");
      }

      setIsSubmitted(true);
      setFormData({ name: "", email: "", message: "", from: "aegontech.dev" });
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      console.error("Failed to submit contact form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-sm border border-border bg-surface-2/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-colors focus:border-signal focus:bg-surface focus:outline-none";

  const contactRows = [
    { icon: MapPin, label: "Studio", value: contactInfo.address },
    { icon: Mail, label: "Email", value: contactInfo.email },
    { icon: Phone, label: "Phone", value: contactInfo.phone },
  ];

  return (
    <section id="contact" className="relative scroll-mt-16 border-t border-border py-24 sm:py-32">
      <div className="mx-auto max-w-8xl px-6 sm:px-8 lg:px-16">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-12">
          {/* Left — invitation + metadata */}
          <div className="lg:col-span-5">
            <div className="eyebrow">
              <span className="text-signal">06</span>
              <span className="h-px w-6 bg-border" />
              Start a project
            </div>
            <h2 className="mt-5 text-display-sm font-semibold text-foreground">
              Have something worth building?
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
              Tell us what you&apos;re trying to make. We&apos;ll reply within a
              couple of business days — usually with questions, sometimes with a
              plan.
            </p>

            <dl className="mt-12 space-y-6 border-t border-border pt-10">
              {contactRows.map((row) => (
                <div key={row.label} className="flex items-start gap-4">
                  <row.icon
                    className="mt-0.5 h-4 w-4 shrink-0 text-signal"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <div>
                    <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
                      {row.label}
                    </dt>
                    <dd className="mt-1 text-sm text-foreground">{row.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>

          {/* Right — form */}
          <div className="lg:col-span-7">
            <div className="panel rounded-md p-6 sm:p-10">
              {isSubmitted ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-signal/40 bg-signal/10">
                    <CheckCircle2 className="h-6 w-6 text-signal" />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-semibold text-foreground">
                    Message sent
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Thanks — we&apos;ll be in touch shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <input type="hidden" name="from" value="aegontech.dev" />
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="c-name"
                        className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
                      >
                        Name
                      </label>
                      <input
                        id="c-name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className={inputClass}
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="c-email"
                        className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
                      >
                        Email
                      </label>
                      <input
                        id="c-email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className={inputClass}
                        placeholder="you@company.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="c-message"
                      className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
                    >
                      Project
                    </label>
                    <textarea
                      id="c-message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className={`${inputClass} resize-none`}
                      placeholder="What are you trying to build?"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group inline-flex items-center gap-2 rounded-sm bg-signal px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:bg-signal-bright disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                        Sending…
                      </>
                    ) : (
                      <>
                        Send message
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
