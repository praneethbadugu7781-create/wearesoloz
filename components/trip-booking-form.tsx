"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TripBookingFormProps {
  destination: string;
}

export function TripBookingForm({ destination }: TripBookingFormProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    email: "",
    message: `Hi, I am interested in joining the group trip to ${destination}!`
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          mobile: formData.mobile,
          email: formData.email,
          destination: destination,
          message: formData.message
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit request.");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-2xl border border-soloz-ember/30 bg-black/60 p-8 text-center space-y-5 backdrop-blur-md shadow-glow">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-soloz-ember/20 text-soloz-ember border border-soloz-ember/30">
          <CheckCircle2 size={32} />
        </div>
        <div className="space-y-2">
          <h3 className="font-display text-2xl font-bold text-white">Seat Requested!</h3>
          <p className="text-sm text-soloz-ash/85 leading-relaxed">
            Thank you for requesting a seat on our yatra to <strong>{destination}</strong>.
          </p>
          <p className="text-xs text-white/50">
            Founder Akhil or a community admin will contact you on WhatsApp/Phone shortly to verify details and secure your slot.
          </p>
        </div>

        <div className="pt-4 border-t border-white/10 space-y-3">
          <a
            href="https://wa.me/919966085310"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-500 transition shadow-lg"
          >
            Chat Directly on WhatsApp
          </a>
          <a
            href="https://www.instagram.com/akhillrockstar"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-full border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
          >
            Follow our Instagram
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/60 p-6 backdrop-blur-md space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-soloz-amber text-xs font-bold uppercase tracking-wider">
          <Sparkles size={14} className="text-soloz-ember" />
          Secure Your Slot
        </div>
        <h3 className="font-display text-2xl font-bold text-white">Join This Trip</h3>
        <p className="text-xs text-soloz-ash/70 leading-relaxed">
          Submit your contact info. Seats are allocated on a first-come, first-served basis following a short confirmation call.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
            placeholder="John Doe"
            value={formData.fullName}
            onChange={handleChange}
            className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder-white/20 focus:border-soloz-ember/50 focus:outline-none transition"
          />
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 font-semibold block mb-1">
            Mobile Number (WhatsApp)
          </label>
          <input
            type="tel"
            name="mobile"
            required
            placeholder="+91 9999999999"
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
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleChange}
            className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder-white/20 focus:border-soloz-ember/50 focus:outline-none transition"
          />
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 font-semibold block mb-1">
            Message (Optional)
          </label>
          <textarea
            name="message"
            rows={3}
            value={formData.message}
            onChange={handleChange}
            className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white placeholder-white/20 focus:border-soloz-ember/50 focus:outline-none transition resize-none"
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full h-11">
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2" size={16} /> Checking availability...
            </>
          ) : (
            <>
              <Send size={15} className="mr-2" /> Request Seat Placement
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
