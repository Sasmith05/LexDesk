"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/sidebar";
import { 
  FileSignature, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  FileText, 
  ArrowRight,
  Eye, 
  Sparkles,
  Layers,
  Clock,
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
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function DocumentsDashboard() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("drafts"); // drafts or templates
  const [drafts, setDrafts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Delete modal state
  const [deleteType, setDeleteType] = useState(null); // 'draft' or 'template'
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/login");
    } else if (sessionStatus === "authenticated") {
      fetchDashboardData();
    }
  }, [sessionStatus, router]);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      const [draftsRes, templatesRes] = await Promise.all([
        fetch("/api/documents/drafts"),
        fetch("/api/documents/templates")
      ]);

      if (draftsRes.ok && templatesRes.ok) {
        const draftsData = await draftsRes.json();
        const templatesData = await templatesRes.json();
        setDrafts(draftsData);
        setTemplates(templatesData);
      }
    } catch (err) {
      console.error("Failed to load documents data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteId || !deleteType) return;
    setDeleting(true);
    try {
      const endpoint = deleteType === "draft" 
        ? `/api/documents/drafts/${deleteId}` 
        : `/api/documents/templates/${deleteId}`;

      const res = await fetch(endpoint, {
        method: "DELETE"
      });

      if (res.ok) {
        if (deleteType === "draft") {
          setDrafts(drafts.filter(d => d.id !== deleteId));
          showToast("Document draft deleted successfully");
        } else {
          setTemplates(templates.filter(t => t.id !== deleteId));
          showToast("Document template deleted successfully");
        }
      } else {
        showToast("Failed to delete record");
      }
    } catch (err) {
      console.error(err);
      showToast("An error occurred");
    } finally {
      setDeleting(false);
      setDeleteId(null);
      setDeleteType(null);
    }
  }

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  }

  const filteredDrafts = drafts.filter(d => 
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.client.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTemplates = templates.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    (t.description || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex bg-zinc-50 min-h-screen font-sans">
      <Sidebar />

      <main className="flex-1 p-8 md:p-10 max-w-7xl mx-auto overflow-hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Legal Documents Room</h1>
            <p className="text-zinc-500 mt-1">Design templates, generate custom drafts for clients in real-time, and print on court stamp paper.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/documents/templates/add"
              className="inline-flex items-center gap-2 border border-zinc-200 bg-white hover:bg-zinc-50 active:bg-zinc-100 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
            >
              <Plus size={16} />
              Add Template
            </Link>
            <Link
              href="/documents/drafts/add"
              className="inline-flex items-center gap-2 bg-zinc-950 text-zinc-50 hover:bg-zinc-805 active:bg-zinc-900 px-5 py-3 rounded-xl font-medium shadow-sm transition-all duration-200"
            >
              <Sparkles size={16} className="text-amber-400" />
              Generate Draft
            </Link>
          </div>
        </div>

        {/* Dynamic Alert Toast */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-zinc-900 text-zinc-50 px-5 py-3 rounded-xl shadow-lg border border-zinc-800 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
            <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          {/* Reusable Templates Card */}
          <div className="p-1 rounded-2xl bg-zinc-100 border border-zinc-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.012)] hover:border-zinc-300 hover:shadow-[0_12px_40px_rgb(0,0,0,0.03)] hover:bg-zinc-200/50 transition-all duration-300 group">
            <div className="bg-white border border-zinc-200/40 p-5 rounded-[13px] flex items-center gap-5">
              <div className="h-12 w-12 bg-zinc-50 border border-zinc-200/60 rounded-xl flex items-center justify-center text-zinc-800 shadow-sm group-hover:scale-105 transition-transform duration-300">
                <Layers size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Legal Templates</p>
                <h3 className="text-2xl font-black text-zinc-900 mt-0.5">{templates.length}</h3>
              </div>
            </div>
          </div>

          {/* Generated Drafts Card */}
          <div className="p-1 rounded-2xl bg-zinc-100 border border-zinc-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.012)] hover:border-zinc-300 hover:shadow-[0_12px_40px_rgb(0,0,0,0.03)] hover:bg-zinc-200/50 transition-all duration-300 group">
            <div className="bg-white border border-zinc-200/40 p-5 rounded-[13px] flex items-center gap-5">
              <div className="h-12 w-12 bg-emerald-50/50 text-emerald-700 border border-emerald-100 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300">
                <FileText size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Client Drafts</p>
                <h3 className="text-2xl font-black text-emerald-700 mt-0.5">{drafts.length}</h3>
              </div>
            </div>
          </div>

          {/* Notaries linked */}
          <div className="p-1 rounded-2xl bg-zinc-100 border border-zinc-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.012)] hover:border-zinc-300 hover:shadow-[0_12px_40px_rgb(0,0,0,0.03)] hover:bg-zinc-200/50 transition-all duration-300 group">
            <div className="bg-white border border-zinc-200/40 p-5 rounded-[13px] flex items-center gap-5">
              <div className="h-12 w-12 bg-zinc-50 border border-zinc-200/60 rounded-xl flex items-center justify-center text-zinc-800 shadow-sm group-hover:scale-105 transition-transform duration-300">
                <FileSignature size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Draft Engine Status</p>
                <h3 className="text-xs font-black text-zinc-800 mt-1.5 uppercase tracking-wider bg-zinc-50 border border-zinc-200/80 px-2.5 py-1 rounded-lg inline-block shadow-sm">Ready</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Tab & List panel container */}
        <div className="bg-white border border-zinc-200/85 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.025)] overflow-hidden">
          {/* Controls */}
          <div className="border-b border-zinc-100 bg-zinc-50/40 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Segmented Slider Toggles */}
            <div className="bg-zinc-100 p-1 rounded-xl inline-flex items-center gap-1 self-start">
              <button
                onClick={() => { setActiveTab("drafts"); setSearch(""); }}
                className={`rounded-lg px-4 py-2 text-xs font-black transition-all duration-200 ${
                  activeTab === "drafts" 
                    ? "bg-white text-zinc-950 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-900"
                }`}
              >
                Client Drafts ({drafts.length})
              </button>
              <button
                onClick={() => { setActiveTab("templates"); setSearch(""); }}
                className={`rounded-lg px-4 py-2 text-xs font-black transition-all duration-200 ${
                  activeTab === "templates" 
                    ? "bg-white text-zinc-950 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-900"
                }`}
              >
                Document Templates ({templates.length})
              </button>
            </div>

            {/* Search Input and Counter */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
                <input
                  type="text"
                  placeholder={activeTab === "drafts" ? "Search client name or draft title..." : "Search template..."}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent transition-all placeholder:text-zinc-400 font-bold shadow-sm"
                />
              </div>
              <div className="text-[10px] text-zinc-400 font-black tracking-wider uppercase self-end sm:self-auto">
                Showing {activeTab === "drafts" ? filteredDrafts.length : filteredTemplates.length} records
              </div>
            </div>
          </div>

          {/* Table list block */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <div className="h-8 w-8 border-4 border-zinc-300 border-t-zinc-950 rounded-full animate-spin" />
                <p className="text-sm text-zinc-500 font-medium">Opening documents archive...</p>
              </div>
            ) : activeTab === "drafts" ? (
              filteredDrafts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-zinc-50/50 hover:bg-zinc-50/50">
                      <TableHead className="py-4 font-semibold text-zinc-700 pl-6">Draft Document Title</TableHead>
                      <TableHead className="py-4 font-semibold text-zinc-700">Billed Client</TableHead>
                      <TableHead className="py-4 font-semibold text-zinc-700">Created Date</TableHead>
                      <TableHead className="py-4 font-semibold text-zinc-700 pr-6 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDrafts.map((d) => (
                      <TableRow key={d.id} className="hover:bg-zinc-50/30 transition-all border-b border-zinc-100">
                        <TableCell className="py-4 pl-6 font-bold text-zinc-800">
                          {d.title}
                        </TableCell>
                        <TableCell className="py-4 font-semibold text-zinc-900 text-sm">
                          {d.client.name}
                        </TableCell>
                        <TableCell className="py-4 text-zinc-500 text-xs font-semibold">
                          <div className="flex items-center gap-1.5">
                            <Clock size={13} className="text-zinc-400" />
                            {new Date(d.createdAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric"
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 pr-6 text-right">
                          <div className="inline-flex items-center gap-2">
                            <Link
                              href={`/documents/drafts/${d.id}`}
                              className="h-8 w-8 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-all duration-200"
                              title="View & Print A4/Stamp Paper Layout"
                            >
                              <Printer size={15} />
                            </Link>
                            <button
                              onClick={() => { setDeleteType("draft"); setDeleteId(d.id); }}
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
                    <FileText size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-800">No client drafts generated</h3>
                  <p className="text-sm text-zinc-400 max-w-xs mx-auto mt-1">
                    Select a client and seed template variables in real-time to generate your first print-ready legal document.
                  </p>
                  <Link
                    href="/documents/drafts/add"
                    className="inline-flex items-center gap-2 bg-zinc-950 text-zinc-50 hover:bg-zinc-800 active:bg-zinc-900 px-4 py-2.5 rounded-xl font-medium mt-5 text-sm transition-all shadow-sm"
                  >
                    <Sparkles size={14} className="text-amber-400" />
                    Generate First Draft
                  </Link>
                </div>
              )
            ) : (
              filteredTemplates.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-zinc-50/50 hover:bg-zinc-50/50">
                      <TableHead className="py-4 font-semibold text-zinc-700 pl-6 w-1/3">Template Title</TableHead>
                      <TableHead className="py-4 font-semibold text-zinc-700">Description Summary</TableHead>
                      <TableHead className="py-4 font-semibold text-zinc-700 pr-6 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTemplates.map((t) => (
                      <TableRow key={t.id} className="hover:bg-zinc-50/30 transition-all border-b border-zinc-100">
                        <TableCell className="py-4 pl-6 font-bold text-zinc-800">
                          {t.title}
                        </TableCell>
                        <TableCell className="py-4 text-zinc-500 text-xs font-semibold leading-relaxed">
                          {t.description || "Custom advocate template preset."}
                        </TableCell>
                        <TableCell className="py-4 pr-6 text-right">
                          <div className="inline-flex items-center gap-2">
                            <Link
                              href={`/documents/drafts/add?templateId=${t.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-50 text-xs font-semibold transition-all shadow-sm"
                              title="Draft document using this template"
                            >
                              Draft Document
                              <ArrowRight size={13} />
                            </Link>
                            <Link
                              href={`/documents/templates/${t.id}/edit`}
                              className="h-8 w-8 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-all duration-200"
                              title="Edit Template Draft"
                            >
                              <Edit3 size={15} />
                            </Link>
                            <button
                              onClick={() => { setDeleteType("template"); setDeleteId(t.id); }}
                              className="h-8 w-8 rounded-lg border border-red-100 flex items-center justify-center text-red-500 hover:bg-red-50 transition-all duration-200"
                              title="Delete Template"
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
                    <Layers size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-800">No templates defined</h3>
                  <p className="text-sm text-zinc-400 max-w-xs mx-auto mt-1">
                    You have deleted all templates. Click to create a custom reusable contract structure.
                  </p>
                  <Link
                    href="/documents/templates/add"
                    className="inline-flex items-center gap-2 bg-zinc-950 text-zinc-50 hover:bg-zinc-800 active:bg-zinc-900 px-4 py-2.5 rounded-xl font-medium mt-5 text-sm transition-all"
                  >
                    <Plus size={16} />
                    Add Custom Template
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-zinc-200/80 p-6 rounded-2xl max-w-sm w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <Sparkles size={24} className="text-red-500" />
              <h3 className="text-lg font-bold text-zinc-900">Remove {deleteType === "draft" ? "Draft Document" : "Legal Template"}</h3>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed mb-6">
              Are you sure you want to delete this {deleteType === "draft" ? "finalized draft" : "reusable template structure"}? This operation will remove it from the archive permanently. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                disabled={deleting}
                onClick={() => { setDeleteId(null); setDeleteType(null); }}
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
