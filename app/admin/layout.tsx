"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { clearAuthToken, isAuthenticated } from "@/lib/api";
import {
  LayoutDashboard,
  Compass,
  MapPin,
  BookOpen,
  Image as ImageIcon,
  MessageSquareQuote,
  Settings,
  MailQuestion,
  LogOut,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { useState, useEffect } from "react";

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/trips", label: "Trips", icon: Compass },
  { href: "/admin/destinations", label: "Destinations", icon: MapPin },
  { href: "/admin/blogs", label: "Stories", icon: BookOpen },
  { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { href: "/admin/settings", label: "Site Settings", icon: Settings },
  { href: "/admin/enquiries", label: "Enquiries", icon: MailQuestion }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const isLoginPage = pathname === "/admin/login";

  // Client-side auth check — hooks must run unconditionally
  useEffect(() => {
    if (isLoginPage) return;
    if (!isAuthenticated()) {
      router.push("/admin/login");
    } else {
      setAuthChecked(true);
    }
  }, [pathname, router, isLoginPage]);

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      clearAuthToken();
      router.push("/admin/login");
    }
  };

  // Skip admin navigation if on login page
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-stone-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col md:flex-row admin-console">
      {/* Mobile Nav Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-stone-200 bg-white md:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full border border-soloz-ember bg-soloz-ember/15 text-xs font-black text-soloz-ember">
            WS
          </span>
          <span className="font-display font-bold text-sm tracking-wider text-stone-900">Console</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="grid size-9 place-items-center rounded-lg border border-stone-200 bg-stone-50 text-stone-700"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-stone-200 bg-white p-6 flex flex-col justify-between transform transition-transform duration-300 md:translate-x-0 md:static md:h-screen shrink-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
            <div className="grid size-9 place-items-center rounded-full border border-soloz-ember bg-soloz-ember/15 text-xs font-black text-soloz-ember">
              WS
            </div>
            <div>
              <h2 className="font-display font-bold text-base leading-none text-stone-900">Console</h2>
              <span className="text-[10px] uppercase tracking-wider text-stone-400">WeAreSoloz Admins</span>
            </div>
          </div>

          {/* Links */}
          <nav className="space-y-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? "bg-stone-900 text-white shadow-md"
                      : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon size={16} />
                    {link.label}
                  </span>
                  <ChevronRight size={12} className={isActive ? "opacity-100" : "opacity-0"} />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="border-t border-stone-100 pt-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full rounded-lg px-3.5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition"
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 p-6 md:p-10 md:h-screen md:overflow-y-auto w-full bg-stone-50">
        {children}
      </div>
    </div>
  );
}
