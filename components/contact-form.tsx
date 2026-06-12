"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const destinationsList = [
  "General Enquiry / Other",
  "Kedarnath Community Yatra",
  "Badrinath Yatra",
  "Mana Village Exploration",
  "Valley of Flowers Trek",
  "Hampta Pass Expedition",
  "Goa Soloz Escape",
  "Kerala Slow Roads"
];

export function ContactForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    email: "",
    destination: "General Enquiry / Other",
    message: ""
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_URL}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit request.");
      }

      // Open WhatsApp chat prefilled with details
      const waText = encodeURIComponent(`Hi WeAreSoloz, my name is ${formData.fullName}. Mobile: ${formData.mobile}. Email: ${formData.email}. Destination: ${formData.destination}. Message: ${formData.message}`);
      const waUrl = `https://wa.me/919966085310?text=${waText}`;
      window.open(waUrl, "_blank");

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-2xl border border-soloz-ember/30 bg-black/60 p-8 text-center space-y-6 backdrop-blur shadow-glow">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-soloz-ember/20 text-soloz-ember border border-soloz-ember/30">
          <CheckCircle2 size={32} />
        </div>
        <div className="space-y-2">
          <h3 className="font-display text-2xl font-bold text-white">Message Dispatched!</h3>
          <p className="text-sm text-soloz-ash/85 leading-relaxed">
            Thank you for writing to WeAreSoloz. Your details have been recorded.
          </p>
          <p className="text-xs text-white/50">
            Our founder Akhil or one of our community coordinators will contact you shortly via WhatsApp or email to answer your questions.
          </p>
        </div>
        <div className="pt-4 border-t border-white/10">
          <a
            href={`https://wa.me/919966085310?text=${encodeURIComponent(`Hi WeAreSoloz, my name is ${formData.fullName}. Mobile: ${formData.mobile}. Email: ${formData.email}. Destination: ${formData.destination}. Message: ${formData.message}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-500 transition shadow-lg"
          >
            Ping on WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-white/10 bg-black/60 p-6 sm:p-8 backdrop-blur shadow-xl">
      <h3 className="font-display text-2xl font-bold text-white mb-2">Send a Message</h3>
      <p className="text-xs text-soloz-ash/70 leading-relaxed mb-6">
        Fill out this form and a community travel representative will reach out to you within 24 hours.
      </p>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs font-semibold text-red-400">
          {error}
        </div>
      )}

      <div>
        <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 font-semibold block mb-1">
          Full Name
        </label>
        <input
          type="text"
          name="fullName"
          required
          placeholder="Akhil Kumar"
          value={formData.fullName}
          onChange={handleChange}
          className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder-white/20 focus:border-soloz-ember/50 focus:outline-none transition"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 font-semibold block mb-1">
            Mobile Number
          </label>
          <input
            type="tel"
            name="mobile"
            required
            placeholder="+91 9966085310"
            value={formData.mobile}
            onChange={handleChange}
            className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder-white/20 focus:border-soloz-ember/50 focus:outline-none transition"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 font-semibold block mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            required
            placeholder="akhil@example.com"
            value={formData.email}
            onChange={handleChange}
            className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder-white/20 focus:border-soloz-ember/50 focus:outline-none transition"
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 font-semibold block mb-1">
          Destination of Interest
        </label>
        <select
          name="destination"
          value={formData.destination}
          onChange={handleChange}
          className="h-10 w-full rounded-lg border border-white/10 bg-[#14110d] px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none transition"
        >
          {destinationsList.map((dest) => (
            <option key={dest} value={dest}>
              {dest}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 font-semibold block mb-1">
          Your Message / Query
        </label>
        <textarea
          name="message"
          required
          rows={4}
          placeholder="Tell us about your travel dreams, packing queries, or custom booking details..."
          value={formData.message}
          onChange={handleChange}
          className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white placeholder-white/20 focus:border-soloz-ember/50 focus:outline-none transition resize-none"
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full h-11">
        {loading ? (
          <>
            <Loader2 className="animate-spin mr-2" size={16} /> Submitting inquiry...
          </>
        ) : (
          <>
            <Send size={15} className="mr-2" /> Send Enquiry Message
          </>
        )}
      </Button>
    </form>
  );
}
