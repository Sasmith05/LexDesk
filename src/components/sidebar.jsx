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
} from "lucide-react";

export default function Sidebar() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const pathname = usePathname() || "";

  return (
    <div className="w-64 h-screen bg-black text-white p-5 sticky top-0 flex-shrink-0 flex flex-col justify-between z-40 print:hidden">
      <div>
        <h1 className="text-2xl font-bold mb-6">LexDesk</h1>

      <div className="mb-8">
        <div className="text-sm text-gray-300">Signed in as</div>
        <div className="font-semibold">
          {status === "loading" ? "Loading..." : user?.name || "Admin"}
        </div>
        <div className="text-xs text-gray-300 break-all">
          {status === "loading" ? "" : user?.email || ""}
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => signOut()}
            className="w-full rounded-lg bg-white/10 hover:bg-white/15 px-3 py-2 text-sm"
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
      </ul>
      </div>
    </div>
  );
}
