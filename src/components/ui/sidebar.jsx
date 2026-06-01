import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Receipt,
} from "lucide-react";

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-black text-white p-5">
      <h1 className="text-2xl font-bold mb-10">
        LexDesk
      </h1>

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