"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Receipt,
  Calendar,
  FileSignature,
  Menu,
  X,
} from "lucide-react";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();
  const user = session?.user;
  const pathname = usePathname() || "";

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/login" });
    } catch (err) {
      console.error("NextAuth signOut failed, using manual fallback:", err);
      window.location.href = "/login";
    }
  };

  return (
    <>
      {/* Mobile top header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0b0b0d] text-white border-b border-white/5 sticky top-0 z-30 w-full print:hidden">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 overflow-hidden bg-black rounded-lg flex items-center justify-center border border-white/[0.08]">
            <img 
              src="/law_logo.png" 
              alt="LexDesk Emblem" 
              className="h-full w-full object-cover" 
            />
          </div>
          <span className="text-md font-black tracking-tight">LexDesk</span>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 text-zinc-400 hover:text-white transition-colors"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Backdrop overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar drawer panel */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0b0b0d] border-r border-white/[0.04] text-white p-5 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 md:sticky md:top-0 md:h-screen md:flex-shrink-0 print:hidden ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div>
          {/* Branding Header with Logo */}
          <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 overflow-hidden bg-black rounded-lg flex items-center justify-center border border-white/[0.08]">
                <img 
                  src="/law_logo.png" 
                  alt="LexDesk Emblem" 
                  className="h-full w-full object-cover" 
                />
              </div>
              <h1 className="text-lg font-black tracking-tight text-white">LexDesk</h1>
            </div>
            {/* Mobile close button */}
            <button 
              onClick={() => setIsOpen(false)} 
              className="md:hidden text-zinc-400 hover:text-white p-1"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

      <div className="mb-8 bg-white/5 border border-white/5 p-4 rounded-xl">
        <div className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold">Signed in as</div>
        <div className="font-bold text-white text-sm mt-0.5">
          {status === "loading" ? "Loading..." : user?.name || "Admin"}
        </div>
        <div className="text-[10px] text-gray-400 break-all mt-0.5 font-medium">
          {status === "loading" ? "" : user?.email || ""}
        </div>
        <div className="text-[9px] font-black uppercase tracking-widest text-zinc-200 mt-1.5 bg-white/10 border border-white/5 px-2 py-0.5 rounded-md inline-block">
          {status === "loading" ? "" : user?.role || ""}
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-lg bg-white/10 hover:bg-white/15 px-3 py-2 text-xs font-semibold"
          >
            Logout
          </button>
        </div>
      </div>

      <ul className="space-y-2">
        <li>
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative ${
              pathname === "/dashboard"
                ? "bg-white/[0.06] text-white font-bold pl-4 shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.02]"
            }`}
          >
            {pathname === "/dashboard" && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-lg" />
            )}
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
        </li>

        <li>
          <Link
            href="/clients"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative ${
              pathname.startsWith("/clients")
                ? "bg-white/[0.06] text-white font-bold pl-4 shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.02]"
            }`}
          >
            {pathname.startsWith("/clients") && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-lg" />
            )}
            <Users size={18} />
            Clients
          </Link>
        </li>

        <li>
          <Link
            href="/cases"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative ${
              pathname.startsWith("/cases")
                ? "bg-white/[0.06] text-white font-bold pl-4 shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.02]"
            }`}
          >
            {pathname.startsWith("/cases") && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-lg" />
            )}
            <Briefcase size={18} />
            Cases
          </Link>
        </li>

        <li>
          <Link
            href="/notary"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative ${
              pathname.startsWith("/notary")
                ? "bg-white/[0.06] text-white font-bold pl-4 shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.02]"
            }`}
          >
            {pathname.startsWith("/notary") && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-lg" />
            )}
            <FileText size={18} />
            Notary
          </Link>
        </li>

        <li>
          <Link
            href="/calendar"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative ${
              pathname.startsWith("/calendar")
                ? "bg-white/[0.06] text-white font-bold pl-4 shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.02]"
            }`}
          >
            {pathname.startsWith("/calendar") && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-lg" />
            )}
            <Calendar size={18} />
            Calendar
          </Link>
        </li>

        {user?.role !== "staff" && (
          <li>
            <Link
              href="/invoices"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative ${
                pathname.startsWith("/invoices")
                  ? "bg-white/[0.06] text-white font-bold pl-4 shadow-sm"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.02]"
              }`}
            >
              {pathname.startsWith("/invoices") && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-lg" />
              )}
              <Receipt size={18} />
              Invoices
            </Link>
          </li>
        )}

        <li>
          <Link
            href="/documents"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative ${
              pathname.startsWith("/documents")
                ? "bg-white/[0.06] text-white font-bold pl-4 shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.02]"
            }`}
          >
            {pathname.startsWith("/documents") && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-lg" />
            )}
            <FileSignature size={18} />
            Documents
          </Link>
        </li>
      </ul>
      </div>
    </div>
    </>
  );
}
