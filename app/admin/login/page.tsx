"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false
      });

      if (res?.error) {
        setError("Invalid email address or passcode.");
      } else {
        router.push("/admin");
        router.refresh();
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
            <h1 className="font-sans text-2xl font-bold tracking-tight text-stone-900">
              Admin Console
            </h1>
            <p className="text-[10px] uppercase tracking-[0.25em] text-stone-400 font-medium mt-1">
              WeAreSoloz Travel Community
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-xl shadow-stone-200/50 space-y-6">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs font-semibold text-red-600">
                {error}
              </div>
            )}

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
              <label className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block mb-2">
                Secret Passcode
              </label>
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
