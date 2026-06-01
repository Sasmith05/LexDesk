"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import { 
  Receipt, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Calendar, 
  AlertCircle,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

export default function InvoicesPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  
  // Delete modal state
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/login");
    } else if (session?.user?.role === "staff") {
      router.push("/dashboard");
    } else if (sessionStatus === "authenticated") {
      fetchInvoices();
    }
  }, [sessionStatus, session, router]);

  async function fetchInvoices() {
    setLoading(true);
    try {
      const res = await fetch("/api/invoices");
      if (res.ok) {
        const data = await res.json();
        setInvoices(data);
      }
    } catch (err) {
      console.error("Error fetching invoices:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/invoices/${deleteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setInvoices(invoices.filter(inv => inv.id !== deleteId));
        showToast("Invoice deleted successfully");
      } else {
        showToast("Failed to delete invoice");
      }
    } catch (err) {
      console.error(err);
      showToast("An error occurred");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  }

  // Filter invoices based on active tab and search query
  const filteredInvoices = invoices.filter((inv) => {
    const query = search.toLowerCase();
    const matchesSearch = 
      inv.invoiceNumber.toString().includes(query) ||
      inv.client.name.toLowerCase().includes(query) ||
      (inv.case?.title || "").toLowerCase().includes(query) ||
      inv.status.toLowerCase().includes(query);

    if (!matchesSearch) return false;

    if (activeTab === "All") return true;
    return inv.status === activeTab;
  });

  // Financial Metrics
  const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const totalCollected = invoices
    .filter(inv => inv.status === "Paid")
    .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const totalOutstanding = invoices
    .filter(inv => inv.status !== "Paid")
    .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

  // Status Badge Colors Helper
  function getStatusBadgeClass(status) {
    switch (status) {
      case "Paid":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      case "Unpaid":
        return "bg-amber-50 text-amber-700 border-amber-200/80";
      case "Overdue":
        return "bg-rose-50 text-rose-700 border-rose-200/80";
      default:
        return "bg-zinc-50 text-zinc-600 border-zinc-200/80";
    }
  }

  return (
    <div className="flex bg-zinc-50 min-h-screen font-sans">
      <Sidebar />

      <main className="flex-1 p-8 md:p-10 max-w-7xl mx-auto overflow-hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Billing & Invoices</h1>
            <p className="text-zinc-500 mt-1">Manage client ledgers, log custom line item fees, track payments, and print receipts.</p>
          </div>
          <Link
            href="/invoices/add"
            className="inline-flex items-center gap-2 bg-zinc-950 text-zinc-50 hover:bg-zinc-800 active:bg-zinc-900 px-5 py-3 rounded-xl font-medium shadow-sm transition-all duration-200"
          >
            <Plus size={18} />
            Create Invoice
          </Link>
        </div>

        {/* Dynamic Alert Toast */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-zinc-900 text-zinc-50 px-5 py-3 rounded-xl shadow-lg border border-zinc-800 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
            <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        )}

        {/* Financial Metrics Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Revenue Invoiced */}
          <div className="bg-white border border-zinc-200/80 p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-200 flex items-center gap-5">
            <div className="h-12 w-12 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-800">
              <Receipt size={22} />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Total Invoiced</p>
              <h3 className="text-2xl font-bold text-zinc-900 mt-0.5">₹{totalInvoiced.toLocaleString("en-IN", { minimumFractionDigits: 0 })}</h3>
            </div>
          </div>

          {/* Total Collected */}
          <div className="bg-white border border-zinc-200/80 p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-200 flex items-center gap-5">
            <div className="h-12 w-12 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Total Collected</p>
              <h3 className="text-2xl font-bold text-emerald-700 mt-0.5">₹{totalCollected.toLocaleString("en-IN", { minimumFractionDigits: 0 })}</h3>
            </div>
          </div>

          {/* Total Outstanding */}
          <div className="bg-white border border-zinc-200/80 p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-200 flex items-center gap-5">
            <div className="h-12 w-12 bg-rose-50 text-rose-700 rounded-xl flex items-center justify-center">
              <AlertTriangle size={22} />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Outstanding Receivables</p>
              <h3 className="text-2xl font-bold text-rose-700 mt-0.5">₹{totalOutstanding.toLocaleString("en-IN", { minimumFractionDigits: 0 })}</h3>
            </div>
          </div>
        </div>

        {/* Main Portal Container */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
          {/* Tabs & Controls */}
          <div className="border-b border-zinc-100 bg-zinc-50/50 p-5 flex flex-col gap-4">
            {/* Quick Status Tabs */}
            <div className="flex items-center gap-2 border-b border-zinc-200 pb-3">
              {["All", "Paid", "Unpaid", "Overdue"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === tab 
                      ? "bg-zinc-950 text-zinc-50 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Search Input and Counter */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                  type="text"
                  placeholder="Search client, case, invoice #..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent transition-all placeholder:text-zinc-400"
                />
              </div>
              {search && (
                <button 
                  onClick={() => setSearch("")} 
                  className="text-xs text-zinc-500 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-lg transition-colors font-semibold"
                >
                  Clear Filters
                </button>
              )}
              <div className="ml-auto text-xs text-zinc-400 font-bold">
                Showing {filteredInvoices.length} of {invoices.length} ledger sheets
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <div className="h-8 w-8 border-4 border-zinc-300 border-t-zinc-950 rounded-full animate-spin" />
                <p className="text-sm text-zinc-500 font-medium">Opening invoicing ledgers...</p>
              </div>
            ) : filteredInvoices.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-zinc-50/50 hover:bg-zinc-50/50">
                    <TableHead className="py-4 font-semibold text-zinc-700 pl-6 w-32">Invoice No</TableHead>
                    <TableHead className="py-4 font-semibold text-zinc-700">Client Details</TableHead>
                    <TableHead className="py-4 font-semibold text-zinc-700">Associated Case</TableHead>
                    <TableHead className="py-4 font-semibold text-zinc-700">Due Date</TableHead>
                    <TableHead className="py-4 font-semibold text-zinc-700">Payment Status</TableHead>
                    <TableHead className="py-4 font-semibold text-zinc-700">Grand Total (₹)</TableHead>
                    <TableHead className="py-4 font-semibold text-zinc-700 pr-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((inv) => (
                    <TableRow key={inv.id} className="hover:bg-zinc-50/30 transition-all border-b border-zinc-100">
                      <TableCell className="py-4 pl-6 font-bold text-zinc-800">
                        #INV-{inv.invoiceNumber}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-zinc-100 text-zinc-700 rounded-full flex items-center justify-center font-bold text-xs">
                            <User size={14} />
                          </div>
                          <div>
                            <p className="font-semibold text-zinc-900 text-sm">{inv.client.name}</p>
                            <p className="text-xs text-zinc-400">{inv.client.phone}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        {inv.case ? (
                          <div>
                            <p className="text-sm font-semibold text-zinc-800">{inv.case.title}</p>
                            <p className="text-xs text-zinc-400 font-medium">{inv.case.courtName}</p>
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-md">
                            General Consult Billing
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-4 text-zinc-500 text-xs font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-zinc-400" />
                          {new Date(inv.dueDate).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(inv.status)}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            inv.status === "Paid" ? "bg-emerald-500" :
                            inv.status === "Unpaid" ? "bg-amber-500" : "bg-rose-500"
                          }`} />
                          {inv.status}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 font-bold text-zinc-900">
                        ₹{(inv.totalAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 0 })}
                      </TableCell>
                      <TableCell className="py-4 pr-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            href={`/invoices/${inv.id}`}
                            className="h-8 w-8 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-all duration-200"
                            title="View receipt"
                          >
                            <Eye size={15} />
                          </Link>
                          <Link
                            href={`/invoices/${inv.id}/edit`}
                            className="h-8 w-8 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-all duration-200"
                            title="Edit Ledger"
                          >
                            <Edit3 size={15} />
                          </Link>
                          <button
                            onClick={() => setDeleteId(inv.id)}
                            className="h-8 w-8 rounded-lg border border-red-100 flex items-center justify-center text-red-500 hover:bg-red-50 transition-all duration-200"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-24 text-center">
                <div className="h-16 w-16 bg-zinc-50 border border-zinc-100 rounded-2xl flex items-center justify-center mx-auto text-zinc-400 mb-4 shadow-inner">
                  <Receipt size={28} />
                </div>
                <h3 className="text-lg font-bold text-zinc-800">No invoices logged</h3>
                <p className="text-sm text-zinc-400 max-w-xs mx-auto mt-1">
                  {search ? "No ledger entries match your active filters." : "Create your first billing invoice to record client dues and payments."}
                </p>
                {!search && (
                  <Link
                    href="/invoices/add"
                    className="inline-flex items-center gap-2 bg-zinc-950 text-zinc-50 hover:bg-zinc-800 active:bg-zinc-900 px-4 py-2.5 rounded-xl font-medium mt-5 text-sm transition-all"
                  >
                    <Plus size={16} />
                    Create Invoice
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-zinc-200/80 p-6 rounded-2xl max-w-sm w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <AlertCircle size={24} />
              <h3 className="text-lg font-bold text-zinc-900">Remove Billing Record</h3>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed mb-6">
              Are you sure you want to delete this invoice record? This will permanently delete general amounts, case fees, and audit ledger items. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                disabled={deleting}
                onClick={() => setDeleteId(null)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-zinc-200 hover:bg-zinc-50 text-zinc-700 disabled:opacity-50 transition-all"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={handleDelete}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 active:bg-red-800 text-white disabled:opacity-50 shadow-sm flex items-center gap-2 transition-all"
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
