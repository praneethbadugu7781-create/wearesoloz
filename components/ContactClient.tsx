"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Phone, Instagram, MessageCircle, MapPin, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Reveal, { SectionLabel } from "@/components/Reveal";

interface ContactClientProps {
  settings: any;
}

export default function ContactClient({ settings = {} }: ContactClientProps) {
  const [form, setForm] = useState({ full_name: "", mobile: "", email: "", destination: "", message: "" });
  const [busy, setBusy] = useState(false);

  const phone = settings.phone || "+91 99660 85310";
  const formattedPhone = phone.replace(/[^0-9+]/g, "");
  const instagramLink = settings.instagram || "https://www.instagram.com/akhillrockstar";
  const whatsappLink = settings.whatsapp || "https://wa.me/919966085310";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.full_name,
          mobile: form.mobile,
          email: form.email,
          destination: form.destination,
          message: form.message,
        }),
      });

      if (!res.ok) {
        throw new Error("API error");
      }

      toast.success("Message sent! Akhil will get back to you soon.");
      setForm({ full_name: "", mobile: "", email: "", destination: "", message: "" });
    } catch {
      toast.error("Couldn't send. Try again.");
    }
    setBusy(false);
  };

  return (
    <div data-testid="contact-page" className="bg-white min-h-screen text-[#1c1917] pt-20">
      <section className="pt-40 pb-24 px-6 md:px-10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12">
          <Reveal>
            <SectionLabel>Get in Touch</SectionLabel>
            <h1 className="font-display text-5xl md:text-7xl font-light tracking-tighter mt-5 text-stone-900">
              Let&apos;s plan your <span className="gradient-text font-medium">next escape</span>.
            </h1>
            <p className="text-soloz-textSecondary mt-8 max-w-md leading-relaxed font-body">
              Have a trip in mind, a question, or just want to say hi? Drop a message — we read every word.
            </p>
            <div className="space-y-3 mt-10">
              <a
                data-testid="contact-phone"
                href={`tel:${formattedPhone}`}
                className="flex items-center gap-4 glass rounded-xl p-4 hover:bg-stone-50 border border-stone-200/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-soloz-primary/15 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-soloz-primary" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-soloz-textMuted">Phone</div>
                  <div className="text-stone-900 font-semibold">{phone}</div>
                </div>
              </a>
              <a
                data-testid="contact-instagram"
                href={instagramLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 glass rounded-xl p-4 hover:bg-stone-50 border border-stone-200/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-soloz-primary/15 flex items-center justify-center">
                  <Instagram className="w-4 h-4 text-soloz-primary" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-soloz-textMuted">Instagram</div>
                  <div className="text-stone-900 font-semibold">@akhillrockstar</div>
                </div>
              </a>
              <a
                data-testid="contact-whatsapp"
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 glass rounded-xl p-4 hover:bg-stone-50 border border-stone-200/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-soloz-primary/15 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-soloz-primary" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-soloz-textMuted">WhatsApp</div>
                  <div className="text-stone-900 font-semibold">Chat now</div>
                </div>
              </a>
              <div className="flex items-center gap-4 glass rounded-xl p-4 border border-stone-200">
                <div className="w-10 h-10 rounded-full bg-soloz-primary/15 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-soloz-primary" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-soloz-textMuted">Based in</div>
                  <div className="text-stone-900 font-semibold">India · On the road</div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal className="self-start">
            <form onSubmit={submit} data-testid="contact-form" className="glass rounded-3xl p-8 bg-stone-50 border border-stone-200 space-y-3">
              <div className="text-xs uppercase tracking-widest text-soloz-primary mb-2 font-semibold">Send a message</div>
              <Input
                required
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="Full Name"
                data-testid="contact-name"
                className="glass border-stone-200 bg-white/90 h-12 text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary"
              />
              <Input
                required
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                placeholder="Mobile Number"
                data-testid="contact-mobile"
                className="glass border-stone-200 bg-white/90 h-12 text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary"
              />
              <Input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email"
                data-testid="contact-email"
                className="glass border-stone-200 bg-white/90 h-12 text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary"
              />
              <Input
                value={form.destination}
                onChange={(e) => setForm({ ...form, destination: e.target.value })}
                placeholder="Destination interested in (optional)"
                data-testid="contact-destination"
                className="glass border-stone-200 bg-white/90 h-12 text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary"
              />
              <Textarea
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Your message"
                data-testid="contact-message"
                rows={5}
                className="glass border-stone-200 bg-white/90 text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary"
              />
              <Button
                type="submit"
                disabled={busy}
                data-testid="contact-submit"
                className="w-full gradient-orange text-white h-12 rounded-full font-medium"
              >
                {busy ? "Sending…" : "Send Message"} <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </form>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
