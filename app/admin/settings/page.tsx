"use client";
import { getAuthHeaders } from "@/lib/api";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

import { useEffect, useState } from "react";
import { Settings, Check, Loader2, Sparkles, AlertCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CloudinaryUpload } from "@/components/cloudinary-upload";

interface HomepageSettings {
  heroTitle: string;
  heroSubheading: string;
  aboutHeading: string;
  aboutText: string;
  founderHeading: string;
  founderText: string;
  founder_image?: string;
}

interface ContactSettings {
  phone: string;
  instagram: string;
  whatsapp: string;
}

interface DBSetting {
  _id: string;
  key: string;
  value: any;
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [homepageId, setHomepageId] = useState<string | null>(null);
  const [contactId, setContactId] = useState<string | null>(null);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Email change states
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [emailConfirmPassword, setEmailConfirmPassword] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [emailVerificationSaving, setEmailVerificationSaving] = useState(false);

  const handleEmailChangeRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setEmailSuccess("");

    setEmailSaving(true);

    try {
      const res = await fetch(`${API_URL}/auth/change-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ newEmail: newAdminEmail, password: emailConfirmPassword })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initiate email change");

      setOtpSent(true);
      setEmailSuccess("A 6-digit verification code has been sent to your new email. Please verify below.");
    } catch (err: any) {
      setEmailError(err.message || "Error updating email.");
    } finally {
      setEmailSaving(false);
    }
  };

  const handleVerifyEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setEmailSuccess("");

    setEmailVerificationSaving(true);

    try {
      const res = await fetch(`${API_URL}/auth/verify-change-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ otp: emailOtp })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");

      setEmailSuccess("Email updated successfully! Redirecting to login page...");
      setNewAdminEmail("");
      setEmailConfirmPassword("");
      setEmailOtp("");
      setTimeout(() => {
        localStorage.removeItem("token");
        window.location.href = "/admin/login";
      }, 2500);
    } catch (err: any) {
      setEmailError(err.message || "Error verifying code.");
      
      // If the OTP was invalidated due to too many failed attempts,
      // automatically bring the user back to the email input stage
      if (err.message && err.message.toLowerCase().includes("invalidated")) {
        setOtpSent(false);
        setEmailOtp("");
      }
    } finally {
      setEmailVerificationSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordSaving(true);

    try {
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update passcode");

      setPasswordSuccess("Passcode updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(err.message || "Error updating passcode.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const [homepage, setHomepage] = useState<HomepageSettings>({
    heroTitle: "START SOLO. TRAVEL TOGETHER.",
    heroSubheading: "Join solo travellers, explore new destinations, meet incredible people and create unforgettable memories together.",
    aboutHeading: "Travel Solo. You're Not Alone.",
    aboutText: "",
    founderHeading: "Meet Akhil",
    founderText: "",
    founder_image: "/images/akhil.jpg"
  });

  const [contact, setContact] = useState<ContactSettings>({
    phone: "+91 9966085310",
    instagram: "https://www.instagram.com/akhillrockstar",
    whatsapp: "https://wa.me/919966085310"
  });

  const [tickerId, setTickerId] = useState<string | null>(null);
  const [ticker, setTicker] = useState({
    enabled: true,
    badgeText: "Trending",
    bgStyle: "orange",
    speed: 25,
    itemsText: ""
  });

  const [popupId, setPopupId] = useState<string | null>(null);
  const [popup, setPopup] = useState({
    enabled: true,
    tripSlug: "",
    title: "🔥 Special Upcoming Expedition!",
    subheading: "Join solo travelers on this curated trip. Limited seats remaining—book online or reserve via WhatsApp!",
    badgeText: "Akhil's Pick of the Month",
    showCountdown: true,
    delaySeconds: 3.5
  });

  const [allTrips, setAllTrips] = useState<any[]>([]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      // Fetch admin trips for dropdown select
      const tripsRes = await fetch(`${API_URL}/admin/trips`, { headers: getAuthHeaders() });
      if (tripsRes.ok) {
        const tripsData = await tripsRes.json();
        setAllTrips(Array.isArray(tripsData) ? tripsData : []);
      }

      const res = await fetch(`${API_URL}/admin/site_settings`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to load settings");
      const data: DBSetting[] = await res.json();

      const homepageRecord = data.find((item) => item.key === "homepage");
      if (homepageRecord) {
        setHomepage({
          ...homepageRecord.value,
          founder_image: homepageRecord.value.founder_image || homepageRecord.value.founderImage || "/images/akhil.jpg"
        });
        setHomepageId(homepageRecord._id);
      }

      const contactRecord = data.find((item) => item.key === "contact");
      if (contactRecord) {
        setContact(contactRecord.value);
        setContactId(contactRecord._id);
      }

      const tickerRecord = data.find((item) => item.key === "ticker");
      if (tickerRecord) {
        const val = tickerRecord.value || {};
        const itemsArr = Array.isArray(val.items) ? val.items : [];
        setTicker({
          enabled: val.enabled !== false,
          badgeText: val.badgeText || "Trending",
          bgStyle: val.bgStyle || "orange",
          speed: val.speed || 25,
          itemsText: itemsArr.map((i: any) => typeof i === "string" ? i : i.text).join("\n")
        });
        setTickerId(tickerRecord._id);
      }

      const popupRecord = data.find((item) => item.key === "featured_popup");
      if (popupRecord) {
        const val = popupRecord.value || {};
        setPopup({
          enabled: val.enabled !== false,
          tripSlug: val.tripSlug || "",
          title: val.title || "🔥 Special Upcoming Expedition!",
          subheading: val.subheading || "Join solo travelers on this curated trip. Limited seats remaining—book online or reserve via WhatsApp!",
          badgeText: val.badgeText || "Akhil's Pick of the Month",
          showCountdown: val.showCountdown !== false,
          delaySeconds: val.delaySeconds || 3.5
        });
        setPopupId(popupRecord._id);
      }
    } catch (err) {
      console.error(err);
      alert("Error loading settings. Please check if you are logged in or have seeded the database.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      // 1. Update Homepage settings
      if (homepageId) {
        const res = await fetch(`${API_URL}/admin/site_settings/${homepageId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify({ key: "homepage", value: homepage })
        });
        if (!res.ok) throw new Error("Failed to update homepage settings");
      } else {
        const res = await fetch(`${API_URL}/admin/site_settings`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify({ key: "homepage", value: homepage })
        });
        if (!res.ok) throw new Error("Failed to create homepage settings");
        const newRecord = await res.json();
        setHomepageId(newRecord._id);
      }

      // 3. Update Ticker settings
      const tickerItems = ticker.itemsText
        ? ticker.itemsText.split("\n").map(l => l.trim()).filter(Boolean)
        : [];
      const tickerPayload = {
        enabled: ticker.enabled,
        badgeText: ticker.badgeText,
        bgStyle: ticker.bgStyle,
        speed: Number(ticker.speed) || 25,
        items: tickerItems
      };

      if (tickerId) {
        await fetch(`${API_URL}/admin/site_settings/${tickerId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify({ key: "ticker", value: tickerPayload })
        });
      } else {
        const res = await fetch(`${API_URL}/admin/site_settings`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify({ key: "ticker", value: tickerPayload })
        });
        if (res.ok) {
          const newRec = await res.json();
          setTickerId(newRec._id);
        }
      }

      // 4. Update Featured Pop-Up settings
      const popupPayload = {
        enabled: popup.enabled,
        tripSlug: popup.tripSlug,
        title: popup.title,
        subheading: popup.subheading,
        badgeText: popup.badgeText,
        showCountdown: popup.showCountdown,
        delaySeconds: Number(popup.delaySeconds) || 3.5
      };

      if (popupId) {
        await fetch(`${API_URL}/admin/site_settings/${popupId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify({ key: "featured_popup", value: popupPayload })
        });
      } else {
        const res = await fetch(`${API_URL}/admin/site_settings`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify({ key: "featured_popup", value: popupPayload })
        });
        if (res.ok) {
          const newRec = await res.json();
          setPopupId(newRec._id);
        }
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || "Error saving settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-soloz-ash/60">
        <Loader2 className="animate-spin text-soloz-ember mb-3" size={32} />
        <p className="text-xs">Loading configuration settings...</p>
      </div>
    );
  }

  return (
    <main className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="font-display text-3xl font-bold text-white flex items-center gap-2">
          <Settings className="text-soloz-ember" size={28} />
          Global Site Settings
        </h1>
        <p className="text-xs text-soloz-ash/75 mt-1">Configure headings, details, bio info, and phone/social numbers.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
        {/* HOMEPAGE HERO & ABOUT */}
        <div className="rounded-xl border border-white/10 bg-[#14110d] p-6 sm:p-8 space-y-6">
          <h3 className="font-display text-xl font-bold text-white border-b border-white/5 pb-3 flex items-center gap-2">
            <Sparkles className="text-soloz-amber" size={18} />
            Homepage Copywriting
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Hero Title</label>
              <textarea
                required
                rows={2}
                value={homepage.heroTitle}
                onChange={(e) => setHomepage({ ...homepage, heroTitle: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none resize-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Hero Subheading</label>
              <textarea
                required
                rows={3}
                value={homepage.heroSubheading}
                onChange={(e) => setHomepage({ ...homepage, heroSubheading: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none resize-none"
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 pt-4 border-t border-white/5">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">About Heading</label>
                <input
                  type="text"
                  required
                  value={homepage.aboutHeading}
                  onChange={(e) => setHomepage({ ...homepage, aboutHeading: e.target.value })}
                  className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">About Description Content</label>
                <textarea
                  required
                  rows={6}
                  value={homepage.aboutText}
                  onChange={(e) => setHomepage({ ...homepage, aboutText: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white focus:border-soloz-ember/50 focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Founder Heading</label>
                <input
                  type="text"
                  required
                  value={homepage.founderHeading}
                  onChange={(e) => setHomepage({ ...homepage, founderHeading: e.target.value })}
                  className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Founder Biography Content</label>
                <textarea
                  required
                  rows={6}
                  value={homepage.founderText}
                  onChange={(e) => setHomepage({ ...homepage, founderText: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white focus:border-soloz-ember/50 focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 max-w-md">
            <CloudinaryUpload
              value={homepage.founder_image || ""}
              onChange={(url) => setHomepage({ ...homepage, founder_image: url })}
              label="Founder Image (About Akhil Photo)"
            />
          </div>
        </div>

        {/* ANNOUNCEMENT TICKER CONFIGURATIONS */}
        <div className="rounded-xl border border-white/10 bg-[#14110d] p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="text-soloz-ember" size={18} />
              📢 Top Announcement Ticker Bar
            </h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={ticker.enabled}
                onChange={(e) => setTicker({ ...ticker, enabled: e.target.checked })}
                className="w-4 h-4 accent-[#ea580c] rounded"
              />
              <span className="text-xs font-semibold text-white">Enable Ticker Bar</span>
            </label>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Badge Text</label>
              <input
                type="text"
                value={ticker.badgeText}
                onChange={(e) => setTicker({ ...ticker, badgeText: e.target.value })}
                placeholder="Trending"
                className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Color Theme</label>
              <select
                value={ticker.bgStyle}
                onChange={(e) => setTicker({ ...ticker, bgStyle: e.target.value })}
                className="h-10 w-full rounded-lg border border-white/10 bg-[#1f1b15] px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none cursor-pointer"
              >
                <option value="orange">Soloz Orange Gradient</option>
                <option value="dark">Sleek Dark Mode</option>
                <option value="emerald">Emerald Green</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Scroll Duration (Seconds)</label>
              <input
                type="number"
                value={ticker.speed}
                onChange={(e) => setTicker({ ...ticker, speed: parseInt(e.target.value) || 25 })}
                className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">
              Custom Announcements (One per line)
            </label>
            <textarea
              rows={4}
              value={ticker.itemsText}
              onChange={(e) => setTicker({ ...ticker, itemsText: e.target.value })}
              placeholder="🔥 Next Weekend Batch: Ananthagiri Hills (Aug 15-16) — Only 4 Seats Left!&#10;✈️ Budget International: Sri Lanka 5D/4N Special Expedition — Bookings Open!"
              className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white focus:border-soloz-ember/50 focus:outline-none resize-none font-mono"
            />
            <p className="text-[11px] text-soloz-ash/50 mt-1">
              💡 <em>If left empty, the website will automatically scroll your published upcoming trips!</em>
            </p>
          </div>
        </div>

        {/* FEATURED TRIP SPOTLIGHT POP-UP MODAL */}
        <div className="rounded-xl border border-white/10 bg-[#14110d] p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="text-soloz-amber" size={18} />
              🌟 Featured Trip Spotlight Pop-Up Modal
            </h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={popup.enabled}
                onChange={(e) => setPopup({ ...popup, enabled: e.target.checked })}
                className="w-4 h-4 accent-[#ea580c] rounded"
              />
              <span className="text-xs font-semibold text-white">Enable Welcome Pop-Up</span>
            </label>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Select Featured Trip to Spotlight</label>
              <select
                value={popup.tripSlug}
                onChange={(e) => setPopup({ ...popup, tripSlug: e.target.value })}
                className="h-10 w-full rounded-lg border border-white/10 bg-[#1f1b15] px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none cursor-pointer"
              >
                <option value="">-- Auto Pick First Upcoming Trip --</option>
                {allTrips.map((t: any) => (
                  <option key={t._id || t.id} value={t.slug || t.id}>
                    {t.title || t.destination} ({t.status || "published"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Badge Text</label>
              <input
                type="text"
                value={popup.badgeText}
                onChange={(e) => setPopup({ ...popup, badgeText: e.target.value })}
                placeholder="Akhil's Pick of the Month"
                className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Pop-Up Heading Title</label>
              <input
                type="text"
                value={popup.title}
                onChange={(e) => setPopup({ ...popup, title: e.target.value })}
                placeholder="🔥 Special Upcoming Expedition!"
                className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Subheading / Description</label>
              <textarea
                rows={2}
                value={popup.subheading}
                onChange={(e) => setPopup({ ...popup, subheading: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white focus:border-soloz-ember/50 focus:outline-none resize-none"
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 pt-2">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="showCountdown"
                checked={popup.showCountdown}
                onChange={(e) => setPopup({ ...popup, showCountdown: e.target.checked })}
                className="w-4 h-4 accent-[#ea580c] rounded"
              />
              <label htmlFor="showCountdown" className="text-xs text-white font-medium cursor-pointer">
                Show Live Departure Countdown Timer
              </label>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Pop-Up Delay (Seconds)</label>
              <input
                type="number"
                step="0.5"
                value={popup.delaySeconds}
                onChange={(e) => setPopup({ ...popup, delaySeconds: parseFloat(e.target.value) || 3.5 })}
                className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* SUBMIT */}
        <div className="flex justify-end items-center gap-4 pt-4">
          {success && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <Check size={14} /> Settings saved successfully!
            </div>
          )}
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="animate-spin mr-2" size={15} /> Saving...
              </>
            ) : (
              "Save Configurations"
            )}
          </Button>
        </div>
      </form>

      {/* CHANGE ADMIN EMAIL PANEL */}
      {/* CHANGE ADMIN EMAIL PANEL */}
      <div className="space-y-6 max-w-4xl pt-4">
        <div className="rounded-xl border border-white/10 bg-[#14110d] p-6 sm:p-8 space-y-6">
          <h3 className="font-display text-xl font-bold text-white border-b border-white/5 pb-3 flex items-center gap-2">
            <Settings className="text-soloz-amber" size={18} />
            Admin Email Address Settings
          </h3>

          {emailError && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3.5 text-xs font-semibold text-red-400 flex items-center gap-2">
              <AlertCircle size={14} /> {emailError}
            </div>
          )}

          {emailSuccess && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-xs font-semibold text-emerald-400 flex items-center gap-2">
              <Check size={14} /> {emailSuccess}
            </div>
          )}

          {!otpSent ? (
            <form onSubmit={handleEmailChangeRequest} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">New Admin Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="new-email@example.com"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Confirm Current Passcode</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={emailConfirmPassword}
                    onChange={(e) => setEmailConfirmPassword(e.target.value)}
                    className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-white/5">
                <Button type="submit" disabled={emailSaving}>
                  {emailSaving ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={15} /> Sending Verification OTP...
                    </>
                  ) : (
                    "Send Verification Code"
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyEmailChange} className="space-y-6">
              <div className="max-w-md">
                <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Enter 6-Digit Verification Code</label>
                <div className="flex gap-4">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ""))}
                    className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-center text-lg font-mono tracking-widest text-white focus:border-soloz-ember/50 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setEmailSuccess("");
                      setEmailError("");
                    }}
                    className="h-10 px-4 rounded-lg border border-white/10 hover:border-white/20 text-xs font-semibold text-soloz-ash/80 hover:text-white transition-all"
                  >
                    Cancel & Edit Email
                  </button>
                </div>
                <p className="text-[10px] text-soloz-ash/50 mt-1.5">We sent a verification code to your pending email address. Check your spam folder if you do not receive it in a few minutes.</p>
                <p className="text-[10px] text-soloz-amber/70 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle size={10} className="inline" /> For security, this code expires in 10 minutes. A maximum of 3 incorrect verification attempts are allowed.
                </p>
              </div>

              <div className="flex justify-end pt-4 border-t border-white/5">
                <Button type="submit" disabled={emailVerificationSaving}>
                  {emailVerificationSaving ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={15} /> Verifying...
                    </>
                  ) : (
                    "Verify & Change Email"
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* CHANGE PASSWORD PANEL */}
      <form onSubmit={handlePasswordChange} className="space-y-6 max-w-4xl pt-4">
        <div className="rounded-xl border border-white/10 bg-[#14110d] p-6 sm:p-8 space-y-6">
          <h3 className="font-display text-xl font-bold text-white border-b border-white/5 pb-3 flex items-center gap-2">
            <Lock className="text-soloz-amber" size={18} />
            Security & Passcode Settings
          </h3>

          {passwordError && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3.5 text-xs font-semibold text-red-400 flex items-center gap-2">
              <AlertCircle size={14} /> {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-xs font-semibold text-emerald-400 flex items-center gap-2">
              <Check size={14} /> {passwordSuccess}
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Current Passcode</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">New Passcode</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Confirm New Passcode</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-white/5">
            <Button type="submit" disabled={passwordSaving}>
              {passwordSaving ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={15} /> Updating Passcode...
                </>
              ) : (
                "Update Passcode"
              )}
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
}
