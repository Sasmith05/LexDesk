"use client";

import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Receipt,
} from "lucide-react";

export default function Sidebar() {
  const { data: session, status } = useSession();
  const user = session?.user;

  return (
    <div className="w-64 h-screen bg-black text-white p-5">
      <h1 className="text-2xl font-bold mb-6">Legal ERP</h1>

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

      <ul className="space-y-6">
        <li className="flex items-center gap-3">
          <LayoutDashboard size={20} />
          Dashboard
        </li>

        <li className="flex items-center gap-3">
          <Users size={20} />
          Clients
        </li>

        <li className="flex items-center gap-3">
          <Briefcase size={20} />
          Cases
        </li>

        <li className="flex items-center gap-3">
          <FileText size={20} />
          Notary
        </li>

        <li className="flex items-center gap-3">
          <Receipt size={20} />
          Invoices
        </li>
      </ul>
    </div>
  );
}
