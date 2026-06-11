"use client";

import { useEffect, useState } from "react";
import { X, Send, CreditCard } from "lucide-react";
import { trips as defaultTrips } from "@/lib/data";
import { usePathname } from "next/navigation";

export function BookingModal() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [guests, setGuests] = useState("1");
  const [selectedPackage, setSelectedPackage] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.destination) {
        setSelectedPackage(customEvent.detail.destination);
      }
      setIsOpen(true);
      setSuccess(false);
      setError("");
    };

    window.addEventListener("open-booking-modal", handleOpen);
    return () => window.removeEventListener("open-booking-modal", handleOpen);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const message = `Guests: ${guests}. Special Notes: ${notes || "None"}`;
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_URL}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          mobile,
          destination: selectedPackage || "General Enquiry",
          message
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setSuccess(true);
      // Reset form
      setFullName("");
      setEmail("");
      setMobile("");
      setGuests("1");
      setSelectedPackage("");
      setNotes("");
    } catch (err: any) {
      setError(err.message || "Failed to submit reservation.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="reserve-now-popup" style={{ display: "flex" }}>
      <div className="reserve-form-block">
        <button 
          onClick={() => setIsOpen(false)} 
          className="reserve-cross text-white/50 hover:text-white absolute right-6 top-6 transition-colors"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div className="reserve-top-details mb-6">
          <h3 className="text-2xl font-display font-extrabold text-white mb-1">Reserve Now</h3>
          <p className="text-xs text-soloz-ash/80">You&apos;ll receive a confirmation within 24h.</p>
        </div>

        {success ? (
          <div className="package-success-message p-6 bg-soloz-forest/20 border border-soloz-forest/50 text-emerald-400 rounded-xl text-center">
            <h4 className="font-bold text-lg mb-2">Thank you!</h4>
            <p className="text-sm text-emerald-400/90">Your reservation request has been received. Our team will contact you shortly.</p>
            <button 
              onClick={() => setIsOpen(false)} 
              className="mt-6 px-5 py-2 rounded-full bg-soloz-ember hover:bg-orange-600 text-white text-xs font-bold transition"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="package-form space-y-4">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-lg">
                {error}
              </div>
            )}

            <div className="package-fields reserve flex flex-col gap-1.5">
              <label htmlFor="Reserve-Name" className="text-xs uppercase tracking-wider text-soloz-ash/60 font-semibold">Name</label>
              <input
                id="Reserve-Name"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-soloz-ember transition"
                placeholder="Your Name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="package-fields reserve flex flex-col gap-1.5">
                <label htmlFor="Reserve-Email" className="text-xs uppercase tracking-wider text-soloz-ash/60 font-semibold">Email</label>
                <input
                  id="Reserve-Email"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-soloz-ember transition"
                  placeholder="name@email.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="package-fields reserve flex flex-col gap-1.5">
                <label htmlFor="Reserve-Mobile" className="text-xs uppercase tracking-wider text-soloz-ash/60 font-semibold">Phone Number</label>
                <input
                  id="Reserve-Mobile"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-soloz-ember transition"
                  placeholder="Your Mobile No."
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="package-fields reserve flex flex-col gap-1.5">
                <label htmlFor="Reserve-Number-of-Guests" className="text-xs uppercase tracking-wider text-soloz-ash/60 font-semibold">Number of Guests</label>
                <input
                  id="Reserve-Number-of-Guests"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-soloz-ember transition"
                  placeholder="3 Person"
                  type="text"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  required
                />
              </div>

              <div className="package-fields reserve flex flex-col gap-1.5">
                <label htmlFor="Choice-Tour" className="text-xs uppercase tracking-wider text-soloz-ash/60 font-semibold">Select your package</label>
                <select
                  id="Choice-Tour"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-soloz-ember transition [&>option]:bg-[#14110d]"
                  value={selectedPackage}
                  onChange={(e) => setSelectedPackage(e.target.value)}
                  required
                >
                  <option value="">Choose a Tour</option>
                  {defaultTrips.map((t) => (
                    <option key={t.destination} value={t.destination}>
                      {t.destination}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="package-fields reserve flex flex-col gap-1.5">
              <label htmlFor="Reserve-Message" className="text-xs uppercase tracking-wider text-soloz-ash/60 font-semibold">Special Notes</label>
              <textarea
                id="Reserve-Message"
                rows={3}
                placeholder="Write your message here"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-soloz-ember transition resize-none"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-soloz-ember hover:bg-orange-600 text-white font-bold py-3 text-sm transition disabled:opacity-50"
              >
                <Send size={16} />
                {loading ? "Sending Enquiry..." : "Send Message"}
              </button>

              <a
                href={`https://wa.me/919966085310?text=Hi%20Akhil,%20I'm%20interested%20in%20booking%20a%20trip%20with%20WeAreSoloz.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold py-3 text-sm transition"
              >
                <CreditCard size={16} />
                Pay With Pixopay (Contact Akhil)
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
