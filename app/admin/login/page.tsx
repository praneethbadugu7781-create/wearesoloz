"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2 } from "lucide-react";
import { setAuthToken } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function AdminLoginPage() {
  const [view, setView] = useState<"login" | "forgot" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // OTP Reset fields
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid email address or passcode.");
      } else {
        setAuthToken(data.token);
        router.push("/admin");
        router.refresh();
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to request OTP. Please try again.");
      } else {
        setSuccess(data.message);
        setView("reset");
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New passcode and confirmation do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New passcode must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset passcode.");
      } else {
        setSuccess(data.message);
        setView("login");
        setPassword("");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 size-[300px] rounded-full bg-orange-100 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 size-[300px] rounded-full bg-stone-100 blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md space-y-8">
        {/* Brand Logo and Title */}
        <div className="text-center space-y-4">
          <img
            src="/logo.png"
            alt="WeAreSoloz"
            className="w-16 h-16 rounded-full object-cover mx-auto ring-2 ring-orange-500/20"
          />
          <div>
            <h1 className="font-sans text-2xl font-bold tracking-tight text-stone-900 animate-fadeIn">
              {view === "login" && "Admin Console"}
              {view === "forgot" && "Recover Passcode"}
              {view === "reset" && "Reset Secret Passcode"}
            </h1>
            <p className="text-[10px] uppercase tracking-[0.25em] text-stone-400 font-medium mt-1">
              WeAreSoloz Travel Community
            </p>
          </div>
        </div>

        {/* Card Container */}
        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-xl shadow-stone-200/50 space-y-6">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs font-semibold text-red-600 animate-shake">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs font-semibold text-emerald-600 animate-fadeIn">
              {success}
            </div>
          )}

          {view === "login" && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block mb-2">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                  <input
                    type="email"
                    required
                    placeholder="admin@wearesoloz.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 w-full rounded-xl border border-stone-200 bg-stone-50 pl-11 pr-4 text-sm text-stone-900 placeholder-stone-400 focus:border-[#ea580c] focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block">
                    Secret Passcode
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setView("forgot");
                      setError("");
                      setSuccess("");
                    }}
                    className="text-[10px] uppercase tracking-wider text-[#ea580c] font-bold hover:underline"
                  >
                    Forgot Passcode?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 w-full rounded-xl border border-stone-200 bg-stone-50 pl-11 pr-4 text-sm text-stone-900 placeholder-stone-400 focus:border-[#ea580c] focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} /> Accessing Console...
                  </>
                ) : (
                  "Authorize & Log In"
                )}
              </button>
            </form>
          )}

          {view === "forgot" && (
            <form onSubmit={handleForgot} className="space-y-5 animate-fadeIn">
              <p className="text-xs text-stone-500 leading-relaxed font-body">
                Enter your registered admin email. We will send a 6-digit OTP code to your inbox to reset your passcode.
              </p>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block mb-2">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                  <input
                    type="email"
                    required
                    placeholder="admin@wearesoloz.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 w-full rounded-xl border border-stone-200 bg-stone-50 pl-11 pr-4 text-sm text-stone-900 placeholder-stone-400 focus:border-[#ea580c] focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} /> Sending OTP...
                  </>
                ) : (
                  "Send Reset OTP"
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setView("login");
                  setError("");
                  setSuccess("");
                }}
                className="w-full text-center text-xs text-stone-500 hover:text-stone-900 transition font-semibold"
              >
                Back to Login
              </button>
            </form>
          )}

          {view === "reset" && (
            <form onSubmit={handleReset} className="space-y-5 animate-fadeIn">
              <p className="text-xs text-stone-500 leading-relaxed font-body">
                An OTP has been sent to <strong className="text-stone-800">{email}</strong>. Enter the OTP code and set your new passcode below.
              </p>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block mb-2">
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 123456"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="h-12 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 text-center font-mono text-lg tracking-widest text-stone-900 placeholder-stone-400 focus:border-[#ea580c] focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block mb-2">
                  New Passcode
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-12 w-full rounded-xl border border-stone-200 bg-stone-50 pl-11 pr-4 text-sm text-stone-900 placeholder-stone-400 focus:border-[#ea580c] focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block mb-2">
                  Confirm New Passcode
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 w-full rounded-xl border border-stone-200 bg-stone-50 pl-11 pr-4 text-sm text-stone-900 placeholder-stone-400 focus:border-[#ea580c] focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} /> Resetting Passcode...
                  </>
                ) : (
                  "Reset Passcode"
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setView("forgot");
                  setError("");
                  setSuccess("");
                }}
                className="w-full text-center text-xs text-stone-500 hover:text-stone-900 transition font-semibold"
              >
                Resend OTP / Back
              </button>
            </form>
          )}
        </div>

        {/* Back Link */}
        <div className="text-center">
          <a href="/" className="text-xs text-stone-400 hover:text-stone-900 transition font-medium">
            ← Return to public site
          </a>
        </div>
      </div>
    </main>
  );
}
