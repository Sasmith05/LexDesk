"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/sidebar";
import { 
  Briefcase, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Scale, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Printer
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

export default function CasesPage() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Date period reporting state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Delete modal state
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    fetchCases();
  }, []);

  async function fetchCases() {
    setLoading(true);
    try {
      const res = await fetch("/api/cases");
      if (res.ok) {
        const data = await res.json();
        setCases(data);
      }
    } catch (err) {
      console.error("Error fetching cases:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/cases/${deleteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCases(cases.filter(c => c.id !== deleteId));
        showToast("Case record removed successfully");
      } else {
        showToast("Failed to remove case");
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

  // Filter cases based on search query AND hearing date-range period
  const filteredCases = cases.filter((c) => {
    const query = search.toLowerCase();
    const matchesSearch = 
      c.title.toLowerCase().includes(query) ||
      c.courtName.toLowerCase().includes(query) ||
      c.status.toLowerCase().includes(query) ||
      (c.client?.name || "").toLowerCase().includes(query);

    if (!matchesSearch) return false;

    // Date range filter against hearingDate
    const hearingDate = new Date(c.hearingDate);
    if (startDate) {
      const start = new Date(startDate);
      if (hearingDate < start) return false;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include full end day
      if (hearingDate > end) return false;
    }
    return true;
  });

  // Metrics (Screen only, dynamically reflects active period filtered results!)
  const totalCases = filteredCases.length;
  const openCases = filteredCases.filter(c => c.status === "Open").length;
  const pendingHearings = filteredCases.filter(c => c.status === "Pending").length;

  // Status Colors Helper
  function getStatusBadgeClass(status) {
    switch (status) {
      case "Open":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200/80";
      case "Closed":
        return "bg-rose-50 text-rose-700 border-rose-200/80";
      default:
        return "bg-zinc-50 text-zinc-600 border-zinc-200/80";
    }
  }

  return (
    <div className="flex bg-zinc-50 min-h-screen font-sans print:bg-white print:block">
      <Sidebar />

      <main className="flex-1 p-8 md:p-10 max-w-7xl mx-auto overflow-hidden print:p-0 print:max-w-full print:mx-0">
        
        {/* Print-Only Header Letterhead */}
        <div className="hidden print:block border-b border-zinc-200 pb-6 mb-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-black text-zinc-950 tracking-tight">LexDesk</h2>
              <p className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-widest mt-1">
                Advocate & Legal Consultants
              </p>
            </div>
            <div className="text-right">
              <h1 className="text-lg font-black text-zinc-900 uppercase">Court Case Schedule Report</h1>
              <p className="text-xs text-zinc-500 font-semibold mt-1">
                Period: {startDate ? new Date(startDate).toLocaleDateString(undefined, { dateStyle: "medium" }) : "Beginning"} to {endDate ? new Date(endDate).toLocaleDateString(undefined, { dateStyle: "medium" }) : "Present"}
              </p>
            </div>
          </div>
        </div>

        {/* Header (Hidden in Print) */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 print:hidden">
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Case Management</h1>
            <p className="text-zinc-500 mt-1">Track court schedules, hearings, and legal action statuses.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              disabled={filteredCases.length === 0}
              className="inline-flex items-center gap-2 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 px-5 py-3 rounded-xl font-medium shadow-sm transition-all duration-200 disabled:opacity-50"
            >
              <Printer size={18} />
              Print Schedule
            </button>
            <Link
              href="/cases/add"
              className="inline-flex items-center gap-2 bg-zinc-950 text-zinc-50 hover:bg-zinc-800 active:bg-zinc-900 px-5 py-3 rounded-xl font-medium shadow-sm transition-all duration-200"
            >
              <Plus size={18} />
              Add New Case
            </Link>
          </div>
        </div>

        {/* Dynamic Alert Toast (Hidden in Print) */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-zinc-900 text-zinc-50 px-5 py-3 rounded-xl shadow-lg border border-zinc-800 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 print:hidden">
            <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        )}

        {/* Metric Cards (Hidden in Print) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 print:hidden">
          <div className="bg-white border border-zinc-200/80 p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-200 flex items-center gap-5">
            <div className="h-12 w-12 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-800">
              <Briefcase size={22} />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Period Cases</p>
              <h3 className="text-2xl font-bold text-zinc-900 mt-0.5">{totalCases}</h3>
            </div>
          </div>

          <div className="bg-white border border-zinc-200/80 p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-200 flex items-center gap-5">
            <div className="h-12 w-12 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Open Status</p>
              <h3 className="text-2xl font-bold text-zinc-900 mt-0.5">{openCases}</h3>
            </div>
          </div>

          <div className="bg-white border border-zinc-200/80 p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-200 flex items-center gap-5">
            <div className="h-12 w-12 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center">
              <Clock size={22} />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Pending Hearings</p>
              <h3 className="text-2xl font-bold text-zinc-900 mt-0.5">{pendingHearings}</h3>
            </div>
          </div>
        </div>

        {/* Main Case Portal */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden print:border-0 print:shadow-none">
          {/* Controls Bar (Hidden in Print) */}
          <div className="p-5 border-b border-zinc-100 flex flex-col md:flex-row items-center gap-4 bg-zinc-50/50 print:hidden">
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input
                type="text"
                placeholder="Search case or court..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent transition-all placeholder:text-zinc-400"
              />
            </div>
            
            {/* Period Date Filters */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-400">From:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-zinc-950 text-zinc-800 font-semibold"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-400">To:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-zinc-950 text-zinc-800 font-semibold"
                />
              </div>
            </div>

            {(search || startDate || endDate) && (
              <button 
                onClick={() => {
                  setSearch("");
                  setStartDate("");
                  setEndDate("");
                }} 
                className="text-xs text-zinc-500 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-lg transition-colors font-semibold"
              >
                Clear Filters
              </button>
            )}
            <div className="ml-auto text-xs text-zinc-400 font-medium">
              Showing {filteredCases.length} of {cases.length} cases
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <div className="h-8 w-8 border-4 border-zinc-300 border-t-zinc-950 rounded-full animate-spin" />
                <p className="text-sm text-zinc-500 font-medium">Loading case tracking portal...</p>
              </div>
            ) : filteredCases.length > 0 ? (
              <Table className="print:border-collapse">
                <TableHeader>
                  <TableRow className="bg-zinc-50/50 hover:bg-zinc-50/50 print:bg-zinc-100">
                    <TableHead className="py-4 font-semibold text-zinc-700 pl-6">Case Title</TableHead>
                    <TableHead className="py-4 font-semibold text-zinc-700">Associated Client</TableHead>
                    <TableHead className="py-4 font-semibold text-zinc-700">Jurisdiction / Court</TableHead>
                    <TableHead className="py-4 font-semibold text-zinc-700">Status</TableHead>
                    <TableHead className="py-4 font-semibold text-zinc-700">Hearing Date</TableHead>
                    <TableHead className="py-4 font-semibold text-zinc-700 pr-6 text-right print:hidden">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCases.map((caseItem) => (
                    <TableRow key={caseItem.id} className="hover:bg-zinc-50/30 transition-all border-b border-zinc-100 print:border-zinc-300">
                      <TableCell className="py-4 pl-6 font-medium text-zinc-900">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 bg-zinc-100 text-zinc-700 rounded-full flex items-center justify-center font-bold text-sm print:hidden">
                            <Scale size={16} />
                          </div>
                          <div>
                            <p className="font-semibold text-zinc-900">{caseItem.title}</p>
                            <p className="text-xs text-zinc-400">ID: {caseItem.id.substring(0, 8)}...</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-zinc-800 font-semibold">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 bg-zinc-100 rounded-full flex items-center justify-center text-[10px] font-bold text-zinc-600 print:hidden">
                            {(caseItem.client?.name || "U").charAt(0).toUpperCase()}
                          </div>
                          {caseItem.client?.name || "Unassigned"}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-zinc-600 font-medium">
                        {caseItem.courtName}
                      </TableCell>
                      <TableCell className="py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(caseItem.status)}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            caseItem.status === "Open" ? "bg-emerald-500" :
                            caseItem.status === "Pending" ? "bg-amber-500" : "bg-rose-500"
                          }`} />
                          {caseItem.status}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 text-zinc-500 text-xs font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-zinc-400 print:hidden" />
                          {new Date(caseItem.hearingDate).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 pr-6 text-right print:hidden">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            href={`/cases/${caseItem.id}/edit`}
                            className="h-8 w-8 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-all duration-200"
                            title="Edit / Reschedule"
                          >
                            <Edit3 size={15} />
                          </Link>
                          <button
                            onClick={() => setDeleteId(caseItem.id)}
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
              <div className="py-24 text-center print:hidden">
                <div className="h-16 w-16 bg-zinc-50 border border-zinc-100 rounded-2xl flex items-center justify-center mx-auto text-zinc-400 mb-4 shadow-inner">
                  <Scale size={28} />
                </div>
                <h3 className="text-lg font-bold text-zinc-800">No cases found</h3>
                <p className="text-sm text-zinc-400 max-w-xs mx-auto mt-1">
                  {search || startDate || endDate ? "No records match your active period or search filters." : "Get started by adding your first case record."}
                </p>
                {!search && !startDate && !endDate && (
                  <Link
                    href="/cases/add"
                    className="inline-flex items-center gap-2 bg-zinc-950 text-zinc-50 hover:bg-zinc-800 active:bg-zinc-900 px-4 py-2.5 rounded-xl font-medium mt-5 text-sm transition-all"
                  >
                    <Plus size={16} />
                    Add Case
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal (Hidden in Print) */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm animate-in fade-in duration-200 print:hidden">
          <div className="bg-white border border-zinc-200/80 p-6 rounded-2xl max-w-sm w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <AlertCircle size={24} />
              <h3 className="text-lg font-bold text-zinc-900">Remove Case Record</h3>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed mb-6">
              Are you sure you want to delete this case record? This will permanently delete court, scheduling, and active details. This action cannot be undone.
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
