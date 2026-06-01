"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/sidebar";
import { 
  Users, 
  UserPlus, 
  Search, 
  Trash2, 
  Edit3, 
  Clock, 
  Phone, 
  MapPin,
  Calendar,
  AlertCircle
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Delete modal state
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    setLoading(true);
    try {
      const res = await fetch("/api/clients");
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (err) {
      console.error("Error fetching clients:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/clients/${deleteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setClients(clients.filter(c => c.id !== deleteId));
        showToast("Client deleted successfully");
      } else {
        showToast("Failed to delete client");
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

  // Filter clients based on search query
  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.address.toLowerCase().includes(search.toLowerCase())
  );

  // Metrics
  const totalClients = clients.length;
  const newThisWeek = clients.filter((c) => {
    const createdDate = new Date(c.createdAt);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return createdDate > oneWeekAgo;
  }).length;

  return (
    <div className="flex bg-zinc-50 min-h-screen font-sans">
      <Sidebar />

      <main className="flex-1 p-8 md:p-10 max-w-7xl mx-auto overflow-hidden">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Clients Directory</h1>
            <p className="text-zinc-500 mt-1">Manage and track your corporate and individual legal clients.</p>
          </div>
          <Link
            href="/clients/add"
            className="inline-flex items-center gap-2 bg-zinc-950 text-zinc-50 hover:bg-zinc-800 active:bg-zinc-900 px-5 py-3 rounded-xl font-medium shadow-sm transition-all duration-200"
          >
            <UserPlus size={18} />
            Add New Client
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white border border-zinc-200/80 p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-200 flex items-center gap-5">
            <div className="h-12 w-12 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-800">
              <Users size={22} />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Total Registered</p>
              <h3 className="text-2xl font-bold text-zinc-900 mt-0.5">{totalClients}</h3>
            </div>
          </div>

          <div className="bg-white border border-zinc-200/80 p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-200 flex items-center gap-5">
            <div className="h-12 w-12 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center">
              <Clock size={22} />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Added This Week</p>
              <h3 className="text-2xl font-bold text-zinc-900 mt-0.5">{newThisWeek}</h3>
            </div>
          </div>
        </div>

        {/* Main Section */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
          {/* Controls Bar */}
          <div className="p-5 border-b border-zinc-100 flex flex-col sm:flex-row items-center gap-4 bg-zinc-50/50">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input
                type="text"
                placeholder="Search name or phone..."
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
              Showing {filteredClients.length} of {totalClients} clients
            </div>
          </div>

          {/* Table / List */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <div className="h-8 w-8 border-4 border-zinc-300 border-t-zinc-950 rounded-full animate-spin" />
                <p className="text-sm text-zinc-500 font-medium">Loading client directory...</p>
              </div>
            ) : filteredClients.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-zinc-50/50 hover:bg-zinc-50/50">
                    <TableHead className="py-4 font-semibold text-zinc-700 pl-6">Client Info</TableHead>
                    <TableHead className="py-4 font-semibold text-zinc-700">Phone</TableHead>
                    <TableHead className="py-4 font-semibold text-zinc-700">Address</TableHead>
                    <TableHead className="py-4 font-semibold text-zinc-700">Registered</TableHead>
                    <TableHead className="py-4 font-semibold text-zinc-700 pr-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id} className="hover:bg-zinc-50/30 transition-all border-b border-zinc-100">
                      <TableCell className="py-4 pl-6 font-medium text-zinc-900">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 bg-zinc-100 text-zinc-700 rounded-full flex items-center justify-center font-bold text-sm">
                            {client.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-zinc-900">{client.name}</p>
                            <p className="text-xs text-zinc-400">ID: {client.id.substring(0, 8)}...</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-zinc-600">
                        <div className="flex items-center gap-1.5">
                          <Phone size={14} className="text-zinc-400" />
                          {client.phone}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-zinc-600 max-w-xs truncate">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-zinc-400 flex-shrink-0" />
                          <span className="truncate">{client.address}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-zinc-500 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-zinc-400" />
                          {new Date(client.createdAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 pr-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            href={`/clients/${client.id}/edit`}
                            className="h-8 w-8 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-all duration-200"
                            title="Edit"
                          >
                            <Edit3 size={15} />
                          </Link>
                          <button
                            onClick={() => setDeleteId(client.id)}
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
                  <Users size={28} />
                </div>
                <h3 className="text-lg font-bold text-zinc-800">No clients found</h3>
                <p className="text-sm text-zinc-400 max-w-xs mx-auto mt-1">
                  {search ? "No records match your active search terms." : "Get started by adding your first client record."}
                </p>
                {!search && (
                  <Link
                    href="/clients/add"
                    className="inline-flex items-center gap-2 bg-zinc-950 text-zinc-50 hover:bg-zinc-800 active:bg-zinc-900 px-4 py-2.5 rounded-xl font-medium mt-5 text-sm transition-all"
                  >
                    <UserPlus size={16} />
                    Add Client
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
              <h3 className="text-lg font-bold text-zinc-900">Delete Client</h3>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed mb-6">
              Are you sure you want to delete this client? This will permanently remove their records from the system. This action cannot be undone.
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
