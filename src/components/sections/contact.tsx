"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { SectionHeading } from "@/components/sections/section-heading";
import { BrandIcon } from "@/components/ui/brand-icons";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { contactChannels, contactCopy, socials } from "@/data/data";
import { cn } from "@/lib/utils";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: typeof errors = {};
    if (!name.trim()) nextErrors.name = "Name is required.";
    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!emailPattern.test(email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!message.trim()) nextErrors.message = "Message is required.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSent(true);
    console.log({ name, email, message });
    setName("");
    setEmail("");
    setMessage("");
  }

  return (
    <section id="contact" className="container-page scroll-mt-24 py-24">
      <SectionHeading
        eyebrow={contactCopy.eyebrow}
        title={contactCopy.heading}
        description={contactCopy.description}
      />

      <div className="mx-auto mt-14 grid max-w-4xl gap-6 lg:grid-cols-[1fr_1.15fr]">
        <div>
          <div className="space-y-3">
            {contactChannels.map((channel) => (
              <div key={channel.label}>
                <a
                  href={channel.href}
                  className="glass group flex items-center gap-3 rounded-2xl p-4 transition-colors hover:bg-white/10"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/6 ring-1 ring-white/10">
                    <channel.icon className="size-4.5 text-brand-3" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs text-muted-foreground">{channel.label}</span>
                    <span className="block truncate text-sm font-medium">{channel.value}</span>
                  </span>
                  <ArrowUpRight className="ml-auto size-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors hover:bg-white/10"
              >
                <BrandIcon brand={social.brand} className="size-4 text-brand-3" />
                {social.handle}
              </a>
            ))}
          </div>
        </div>

        <div>
          <form onSubmit={handleSubmit} noValidate className="glass rounded-3xl p-6 sm:p-8">
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="contact-name" className="text-xs text-muted-foreground">
                    Name
                  </label>
                  <Input
                    id="contact-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "contact-name-error" : undefined}
                    className={cn(errors.name && "aria-invalid:border-destructive")}
                  />
                  {errors.name && (
                    <p id="contact-name-error" className="text-xs text-destructive">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="contact-email" className="text-xs text-muted-foreground">
                    Email
                  </label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "contact-email-error" : undefined}
                    className={cn(errors.email && "aria-invalid:border-destructive")}
                  />
                  {errors.email && (
                    <p id="contact-email-error" className="text-xs text-destructive">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="contact-message" className="text-xs text-muted-foreground">
                  Message
                </label>
                <Textarea
                  id="contact-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Tell me about the system you need built, rescued, or optimised."
                  rows={5}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? "contact-message-error" : undefined}
                  className={cn(errors.message && "aria-invalid:border-destructive")}
                />
                {errors.message && (
                  <p id="contact-message-error" className="text-xs text-destructive">
                    {errors.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(100deg,var(--brand-violet),var(--brand-cyan))] px-6 text-sm font-medium text-white shadow-[0_10px_30px_-10px_color-mix(in_oklab,var(--brand-violet)_75%,transparent)] transition-transform hover:scale-[1.01] active:scale-[0.99]"
              >
                Send message
                <ArrowUpRight className="size-4" />
              </button>

              {sent && (
                <p className="flex items-center justify-center gap-2 text-xs text-emerald-300">
                  <CheckCircle2 className="size-4" />
                  Message captured — check the console. Connect this form to an email service to go live.
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
