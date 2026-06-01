"use client";

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
} from "lucide-react";

export default function Sidebar() {
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
    <div className="w-64 h-screen bg-black text-white p-5 sticky top-0 flex-shrink-0 flex flex-col justify-between z-40 print:hidden">
      <div>
        {/* Branding Header with Logo */}
        <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-5">
          <div className="h-9 w-9 overflow-hidden bg-zinc-950 rounded-lg flex items-center justify-center border border-zinc-800/80">
            <img 
              src="/law_logo.png" 
              alt="LexDesk Emblem" 
              className="h-full w-full object-cover" 
            />
          </div>
          <h1 className="text-lg font-black tracking-tight text-white">LexDesk</h1>
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

      <ul className="space-y-4">
        <li>
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              pathname === "/dashboard"
                ? "bg-white/10 text-white font-semibold"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
        </li>

        <li>
          <Link
            href="/clients"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              pathname.startsWith("/clients")
                ? "bg-white/10 text-white font-semibold"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Users size={20} />
            Clients
          </Link>
        </li>

        <li>
          <Link
            href="/cases"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              pathname.startsWith("/cases")
                ? "bg-white/10 text-white font-semibold"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Briefcase size={20} />
            Cases
          </Link>
        </li>

        <li>
          <Link
            href="/notary"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              pathname.startsWith("/notary")
                ? "bg-white/10 text-white font-semibold"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <FileText size={20} />
            Notary
          </Link>
        </li>

        <li>
          <Link
            href="/calendar"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              pathname.startsWith("/calendar")
                ? "bg-white/10 text-white font-semibold"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Calendar size={20} />
            Calendar
          </Link>
        </li>

        {user?.role !== "staff" && (
          <li>
            <Link
              href="/invoices"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                pathname.startsWith("/invoices")
                  ? "bg-white/10 text-white font-semibold"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Receipt size={20} />
              Invoices
            </Link>
          </li>
        )}

        <li>
          <Link
            href="/documents"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              pathname.startsWith("/documents")
                ? "bg-white/10 text-white font-semibold"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <FileSignature size={20} />
            Documents
          </Link>
        </li>
      </ul>
      </div>
    </div>
  );
}
