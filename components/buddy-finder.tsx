"use client";

import { useState } from "react";
import { Search, MapPin, Calendar, Plus, Check, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BuddyRequest {
  name: string;
  destination: string;
  month: string;
  pace: string;
  contact: string;
}

const initialBuddies: BuddyRequest[] = [
  { name: "Rahul K.", destination: "Kedarnath", month: "September 2026", pace: "Spiritual/Slow Trekking", contact: "@rahul_trekker" },
  { name: "Sneha M.", destination: "Goa Beach Roadtrip", month: "November 2026", pace: "Biking & Cafes", contact: "@sneha_travels" },
  { name: "Amit S.", destination: "Hampta Pass", month: "July 2026", pace: "Challenging/Fast-paced", contact: "@amit_peaks" },
  { name: "Meghana R.", destination: "Valley of Flowers", month: "August 2026", pace: "Photography & Nature", contact: "@meghana_captures" }
];

export function BuddyFinder() {
  const [buddies, setBuddies] = useState<BuddyRequest[]>(initialBuddies);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    destination: "",
    month: "July 2026",
    pace: "Moderate Explorer",
    instagram: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const filtered = buddies.filter(
    (b) =>
      b.destination.toLowerCase().includes(search.toLowerCase()) ||
      b.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.destination || !formData.instagram) return;

    const newBuddy: BuddyRequest = {
      name: formData.name,
      destination: formData.destination,
      month: formData.month,
      pace: formData.pace,
      contact: formData.instagram.startsWith("@") ? formData.instagram : `@${formData.instagram}`
    };

    setBuddies([newBuddy, ...buddies]);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowForm(false);
      setFormData({ name: "", destination: "", month: "July 2026", pace: "Moderate Explorer", instagram: "" });
    }, 2000);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#14110d] p-6 sm:p-8 space-y-8 shadow-xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <h3 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <Users className="text-soloz-ember" size={24} />
            Travel Buddy Board
          </h3>
          <p className="text-xs text-soloz-ash/70 mt-1">
            Find fellow community members planning a journey to the same location, or post your own plan.
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "secondary" : "default"} size="sm">
          {showForm ? "View Buddy Board" : "Post My Plan"}
        </Button>
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          {submitted ? (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-5 text-center text-emerald-400 space-y-2">
              <Check className="mx-auto" size={24} />
              <p className="text-sm font-semibold">Plan Posted Successfully!</p>
              <p className="text-xs text-emerald-400/80">Your request is now live on the community board.</p>
            </div>
          ) : (
            <>
              <h4 className="text-sm font-bold uppercase tracking-wider text-soloz-amber">Post Your Travel Plan</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Akhil"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Instagram/Contact</label>
                  <input
                    type="text"
                    required
                    placeholder="@akhillrockstar"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Destination</label>
                  <input
                    type="text"
                    required
                    placeholder="Kedarnath Trek"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Preferred Month</label>
                  <select
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    className="h-10 w-full rounded-lg border border-white/10 bg-[#14110d] px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
                  >
                    <option>July 2026</option>
                    <option>August 2026</option>
                    <option>September 2026</option>
                    <option>October 2026</option>
                    <option>November 2026</option>
                    <option>December 2026</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Travel Pace / Style</label>
                <input
                  type="text"
                  placeholder="e.g. Slow nature photography, fast climbing"
                  value={formData.pace}
                  onChange={(e) => setFormData({ ...formData, pace: e.target.value })}
                  className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
                />
              </div>
              <Button type="submit" className="mt-2">Publish My Request</Button>
            </>
          )}
        </form>
      ) : (
        <div className="space-y-6">
          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-soloz-ash/60" size={16} />
            <input
              type="text"
              placeholder="Search buddies by destination..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:border-soloz-ember/50 focus:outline-none"
            />
          </div>

          {/* Cards List */}
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((buddy, index) => (
              <div
                key={index}
                className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4 hover:border-soloz-ember/30 transition duration-300"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-bold text-white text-base">{buddy.name}</h5>
                    <span className="inline-block rounded bg-soloz-ember/15 border border-soloz-ember/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-soloz-amber mt-1.5">
                      {buddy.pace}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-soloz-ash/90 pt-2 border-t border-white/5">
                  <p className="flex items-center gap-1.5 font-medium text-white/90">
                    <MapPin size={13} className="text-soloz-ember shrink-0" />
                    Heading to: <strong className="text-white">{buddy.destination}</strong>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-soloz-ember shrink-0" />
                    Tentative Month: {buddy.month}
                  </p>
                </div>

                <div className="pt-2 flex justify-between items-center text-xs">
                  <span className="text-white/40">Ping on Instagram:</span>
                  <a
                    href={`https://instagram.com/${buddy.contact.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-soloz-amber hover:text-soloz-ember transition"
                  >
                    {buddy.contact}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
