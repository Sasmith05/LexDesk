"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/sidebar";
import { 
  FileText, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Calendar, 
  AlertCircle,
  Coins,
  ShieldCheck,
  UserCheck
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

export default function NotaryPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Delete modal state
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    fetchEntries();
  }, []);

  async function fetchEntries() {
    setLoading(true);
    try {
      const res = await fetch("/api/notary");
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch (err) {
      console.error("Error fetching notary entries:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/notary/${deleteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setEntries(entries.filter(e => e.id !== deleteId));
        showToast("Notary register entry deleted successfully");
      } else {
        showToast("Failed to delete notary entry");
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

  // Filter entries based on search query (by document name, executant, witness, client name, or serial number)
  const filteredEntries = entries.filter((e) => {
    const query = search.toLowerCase();
    return (
      e.serialNo.toString().includes(query) ||
      e.documentName.toLowerCase().includes(query) ||
      e.executants.toLowerCase().includes(query) ||
      e.witnesses.toLowerCase().includes(query) ||
      (e.client?.name || "").toLowerCase().includes(query)
    );
  });

  // Metrics
  const totalEntries = entries.length;
  const totalNotaryFees = entries.reduce((sum, e) => sum + (e.notaryFee || 0), 0);
  const totalStampDuty = entries.reduce((sum, e) => sum + (e.stampDuty || 0), 0);

  return (
    <div className="flex bg-zinc-50 min-h-screen font-sans">
      <Sidebar />

      <main className="flex-1 p-8 md:p-10 max-w-7xl mx-auto overflow-hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Notary Register</h1>
            <p className="text-zinc-500 mt-1">Record legal document notarizations, verify stamp duties, and track fees collected.</p>
          </div>
          <Link
            href="/notary/add"
            className="inline-flex items-center gap-2 bg-zinc-950 text-zinc-50 hover:bg-zinc-800 active:bg-zinc-900 px-5 py-3 rounded-xl font-medium shadow-sm transition-all duration-200"
          >
            <Plus size={18} />
            New Register Entry
          </Link>
        </div>

        {/* Dynamic Alert Toast */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-zinc-900 text-zinc-50 px-5 py-3 rounded-xl shadow-lg border border-zinc-800 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
            <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Notarizations */}
          <div className="bg-white border border-zinc-200/80 p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-200 flex items-center gap-5">
            <div className="h-12 w-12 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-800">
              <FileText size={22} />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Total Entries</p>
              <h3 className="text-2xl font-bold text-zinc-900 mt-0.5">{totalEntries}</h3>
            </div>
          </div>

          {/* Total Fees */}
          <div className="bg-white border border-zinc-200/80 p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-200 flex items-center gap-5">
            <div className="h-12 w-12 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center">
              <Coins size={22} />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Notary Fees Collected</p>
              <h3 className="text-2xl font-bold text-zinc-900 mt-0.5">₹{totalNotaryFees.toLocaleString("en-IN")}</h3>
            </div>
          </div>

          {/* Stamp Duty Processed */}
          <div className="bg-white border border-zinc-200/80 p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-200 flex items-center gap-5">
            <div className="h-12 w-12 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Stamp Duty Value</p>
              <h3 className="text-2xl font-bold text-zinc-900 mt-0.5">₹{totalStampDuty.toLocaleString("en-IN")}</h3>
            </div>
          </div>
        </div>

        {/* Main Notary Registry Table */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
          {/* Controls Bar */}
          <div className="p-5 border-b border-zinc-100 flex flex-col sm:flex-row items-center gap-4 bg-zinc-50/50">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input
                type="text"
                placeholder="Search executant, document, serial #..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent transition-all placeholder:text-zinc-400"
              />
            </div>
            {search && (
              <button 
                onClick={() => setSearch("")} 
                className="text-xs text-zinc-500 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-lg transition-colors font-medium"
              >
                Clear Filters
              </button>
            )}
            <div className="ml-auto text-xs text-zinc-400 font-medium">
              Showing {filteredEntries.length} of {totalEntries} records
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <div className="h-8 w-8 border-4 border-zinc-300 border-t-zinc-950 rounded-full animate-spin" />
                <p className="text-sm text-zinc-500 font-medium">Loading notary database...</p>
              </div>
            ) : filteredEntries.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-zinc-50/50 hover:bg-zinc-50/50">
                    <TableHead className="py-4 font-semibold text-zinc-700 pl-6 w-24">Serial No</TableHead>
                    <TableHead className="py-4 font-semibold text-zinc-700">Document Type</TableHead>
                    <TableHead className="py-4 font-semibold text-zinc-700">Parties Involved</TableHead>
                    <TableHead className="py-4 font-semibold text-zinc-700">Notarization Date</TableHead>
                    <TableHead className="py-4 font-semibold text-zinc-700">Stamp Duty (₹)</TableHead>
                    <TableHead className="py-4 font-semibold text-zinc-700">Notary Fee (₹)</TableHead>
                    <TableHead className="py-4 font-semibold text-zinc-700 pr-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => (
                    <TableRow key={entry.id} className="hover:bg-zinc-50/30 transition-all border-b border-zinc-100">
                      <TableCell className="py-4 pl-6 font-bold text-zinc-800">
                        #{entry.serialNo}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 bg-zinc-100 text-zinc-700 rounded-full flex items-center justify-center font-bold text-sm">
                            <FileText size={16} />
                          </div>
                          <div>
                            <p className="font-semibold text-zinc-900">{entry.documentName}</p>
                            {entry.remarks && (
                              <p className="text-xs text-zinc-400 truncate max-w-[200px]" title={entry.remarks}>
                                {entry.remarks}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <div className="flex flex-col">
                            <span className="text-xs text-zinc-400 font-medium">Executants:</span>
                            <span className="text-sm font-semibold text-zinc-900">{entry.executants}</span>
                          </div>
                          {entry.witnesses && (
                            <div className="flex flex-col">
                              <span className="text-xs text-zinc-400 font-medium">Witnesses:</span>
                              <span className="text-xs text-zinc-600 font-medium">{entry.witnesses}</span>
                            </div>
                          )}
                          {entry.client && (
                            <div className="inline-flex items-center gap-1 bg-zinc-100 text-zinc-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                              <UserCheck size={10} />
                              Client: {entry.client.name}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-zinc-500 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-zinc-400" />
                          {new Date(entry.notaryDate).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 font-semibold text-zinc-700">
                        ₹{(entry.stampDuty || 0).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="py-4 font-bold text-emerald-600">
                        ₹{(entry.notaryFee || 0).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="py-4 pr-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            href={`/notary/${entry.id}/edit`}
                            className="h-8 w-8 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-all duration-200"
                            title="Edit entry"
                          >
                            <Edit3 size={15} />
                          </Link>
                          <button
                            onClick={() => setDeleteId(entry.id)}
                            className="h-8 w-8 rounded-lg border border-red-100 flex items-center justify-center text-red-500 hover:bg-red-50 transition-all duration-200"
                            title="Delete entry"
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
                  <FileText size={28} />
                </div>
                <h3 className="text-lg font-bold text-zinc-800">No notary entries found</h3>
                <p className="text-sm text-zinc-400 max-w-xs mx-auto mt-1">
                  {search ? "No records match your active search terms." : "Record your first legal document notarization in the register."}
                </p>
                {!search && (
                  <Link
                    href="/notary/add"
                    className="inline-flex items-center gap-2 bg-zinc-950 text-zinc-50 hover:bg-zinc-800 active:bg-zinc-900 px-4 py-2.5 rounded-xl font-medium mt-5 text-sm transition-all"
                  >
                    <Plus size={16} />
                    Add Entry
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal (Glassmorphism Overlay) */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-zinc-200/80 p-6 rounded-2xl max-w-sm w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <AlertCircle size={24} />
              <h3 className="text-lg font-bold text-zinc-900">Remove Register Entry</h3>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed mb-6">
              Are you sure you want to delete this notary register entry? This will permanently delete serial tracking, party details, and billing logs. This action cannot be undone.
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
