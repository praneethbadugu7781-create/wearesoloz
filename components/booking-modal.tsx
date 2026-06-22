"use client";

import { useEffect, useState } from "react";
import { X, Send, CreditCard } from "lucide-react";
import { trips as defaultTrips } from "@/lib/data";
import { usePathname } from "next/navigation";
import SuccessModal from "./SuccessModal";

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
  const [age, setAge] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [guests, setGuests] = useState("1");
  const [selectedPackage, setSelectedPackage] = useState("");
  const [notes, setNotes] = useState("");
  const [waUrl, setWaUrl] = useState("");

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

    if (!fullName || fullName.trim().length < 2) {
      setError("Please enter your full name (minimum 2 characters).");
      setLoading(false);
      return;
    }
    const ageNum = Number(age);
    if (!age || isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
      setError("Please enter a valid age (18 or older).");
      setLoading(false);
      return;
    }
    if (!bloodGroup) {
      setError("Please select your blood group.");
      setLoading(false);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setError("Please enter a valid email address (e.g. name@example.com).");
      setLoading(false);
      return;
    }
    const phoneRegex = /^[+]?[0-9\s\-]{7,15}$/;
    if (!mobile || !phoneRegex.test(mobile.trim())) {
      setError("Please enter a valid 10-digit mobile number (e.g. +91 9966085310).");
      setLoading(false);
      return;
    }
    if (!selectedPackage) {
      setError("Please select a package.");
      setLoading(false);
      return;
    }

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
          age: Number(age),
          bloodGroup,
          destination: selectedPackage || "General Enquiry",
          message
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      // Prefill WhatsApp text
      const waText = encodeURIComponent(`Hi Akhil, my name is ${fullName}.\nAge: ${age}\nBlood Group: ${bloodGroup}\nMobile: ${mobile}\nEmail: ${email}\nI want to book a seat for the trip: "${selectedPackage || "General Enquiry"}" with ${guests} guest(s).\nNotes: ${notes || "None"}`);
      const waLink = `https://wa.me/919966085310?text=${waText}`;
      setWaUrl(waLink);
      window.open(waLink, "_blank");

      setSuccess(true);
      // Reset form
      setFullName("");
      setEmail("");
      setMobile("");
      setAge("");
      setBloodGroup("");
      setGuests("1");
      setSelectedPackage("");
      setNotes("");
    } catch (err: any) {
      setError(err.message || "Failed to submit reservation.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen && !success) return null;

  return (
    <>
      {isOpen && (
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

              {/* Age & Blood Group */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="package-fields reserve flex flex-col gap-1.5">
                  <label htmlFor="Reserve-Age" className="text-xs uppercase tracking-wider text-soloz-ash/60 font-semibold">Age</label>
                  <input
                    id="Reserve-Age"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-soloz-ember transition"
                    placeholder="Your Age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                  />
                </div>

                <div className="package-fields reserve flex flex-col gap-1.5">
                  <label htmlFor="Reserve-BloodGroup" className="text-xs uppercase tracking-wider text-soloz-ash/60 font-semibold">Blood Group</label>
                  <div className="relative">
                    <select
                      id="Reserve-BloodGroup"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-soloz-ember transition appearance-none cursor-pointer pr-10 [&>option]:bg-[#14110d]"
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      required
                    >
                      <option value="" disabled>Select Blood</option>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                </div>
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
                  <div className="relative">
                    <select
                      id="Reserve-Number-of-Guests"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-soloz-ember transition appearance-none cursor-pointer pr-10 [&>option]:bg-[#14110d]"
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      required
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? "Guest" : "Guests"}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="package-fields reserve flex flex-col gap-1.5">
                  <label htmlFor="Choice-Tour" className="text-xs uppercase tracking-wider text-soloz-ash/60 font-semibold">Select your package</label>
                  <div className="relative">
                    <select
                      id="Choice-Tour"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-soloz-ember transition appearance-none cursor-pointer pr-10 [&>option]:bg-[#14110d]"
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
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
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

              {/* Travel Policy notice card */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-300 leading-normal font-body">
                <strong>⚠️ Booking Notice:</strong> Train/flight tickets to the starting city are not included. You will meet Akhil directly at the assembly point.
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
          </div>
        </div>
      )}

      <SuccessModal
        isOpen={success}
        onClose={() => {
          setSuccess(false);
          setIsOpen(false);
        }}
        title="Reservation Request Sent!"
        message="Thank you! Akhil will contact you shortly via WhatsApp or email to confirm your booking."
        whatsappUrl={waUrl}
      />
    </>
  );
}
