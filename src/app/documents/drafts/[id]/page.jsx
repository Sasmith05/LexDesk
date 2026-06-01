"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Sidebar from "@/components/sidebar";
import { 
  ArrowLeft, 
  Printer, 
  FileText, 
  AlertTriangle,
  Building,
  User,
  Layout,
  Maximize2
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function DraftDetailsPage({ params }) {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const { id } = use(params);

  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Professional Stamp Paper Padding state (e.g. 3 inches space at top of first page)
  const [useStampPaperSpacing, setUseStampPaperSpacing] = useState(false);

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/login");
    }
  }, [sessionStatus, router]);

  useEffect(() => {
    if (id && sessionStatus === "authenticated") {
      fetchDraftDetails();
    }
  }, [id, sessionStatus]);

  async function fetchDraftDetails() {
    try {
      const res = await fetch(`/api/documents/drafts/${id}`);
      if (res.ok) {
        const data = await res.json();
        setDraft(data);
      } else {
        setError("Failed to locate document draft.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while loading draft data.");
    } finally {
      setLoading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div className="flex bg-zinc-50 min-h-screen font-sans">
        <Sidebar />
        <main className="flex-1 flex flex-col items-center justify-center gap-3 py-20">
          <div className="h-8 w-8 border-4 border-zinc-300 border-t-zinc-950 rounded-full animate-spin" />
          <p className="text-sm text-zinc-500 font-medium">Opening legal draft...</p>
        </main>
      </div>
    );
  }

  if (error || !draft) {
    return (
      <div className="flex bg-zinc-50 min-h-screen font-sans">
        <Sidebar />
        <main className="flex-1 p-8 md:p-10 max-w-2xl mx-auto overflow-hidden">
          <div className="bg-white border border-zinc-200 p-8 rounded-2xl shadow-sm text-center space-y-4">
            <div className="h-12 w-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={22} />
            </div>
            <h3 className="text-lg font-bold text-zinc-800">{error || "Draft not found"}</h3>
            <Link
              href="/documents"
              className="inline-flex items-center gap-2 bg-zinc-950 text-zinc-50 hover:bg-zinc-800 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
            >
              <ArrowLeft size={16} />
              Return to Documents
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex bg-zinc-50 min-h-screen font-sans print:bg-white print:block">
      <Sidebar />

      <main className="flex-1 p-8 md:p-10 max-w-4xl mx-auto overflow-hidden print:p-0 print:max-w-full print:mx-0">
        
        {/* Print-Only Custom Legal Header */}
        <div className="hidden print:block border-b border-zinc-200 pb-4 mb-8">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-black text-zinc-950 tracking-tight">LexDesk</h2>
              <p className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-widest mt-0.5">
                Advocate & Legal Consultants
              </p>
            </div>
            <div className="text-right text-[10px] text-zinc-400 font-bold uppercase">
              Draft Document Printout Registry
            </div>
          </div>
        </div>

        {/* Action Controls Panel (Hidden in Print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 print:hidden bg-white border border-zinc-200/80 p-5 rounded-2xl shadow-sm">
          <div>
            <Link
              href="/documents"
              className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-950 font-bold transition-colors group mb-2"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              Back to Documents Room
            </Link>
            <h2 className="text-base font-extrabold text-zinc-900">{draft.title}</h2>
            <p className="text-[11px] text-zinc-400 font-semibold mt-0.5 flex items-center gap-1.5">
              <User size={12} />
              Billed to Client: {draft.client.name}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Stamp Paper Padding Toggle */}
            <button
              onClick={() => setUseStampPaperSpacing(!useStampPaperSpacing)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                useStampPaperSpacing
                  ? "bg-amber-500/10 text-amber-700 border-amber-500/30 shadow-sm"
                  : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
              }`}
            >
              <Layout size={14} />
              {useStampPaperSpacing ? "Stamp Paper Top Spacing: ON" : "Add Stamp Paper Spacing"}
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 bg-zinc-950 text-zinc-50 hover:bg-zinc-800 active:bg-zinc-900 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <Printer size={15} />
              Print / PDF
            </button>
          </div>
        </div>

        {/* Legal Paper A4 Simulator Sheet */}
        <div 
          className={`bg-white border border-zinc-200/80 p-12 md:p-16 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.02)] print:border-0 print:p-0 print:shadow-none min-h-[842px] transition-all duration-300 ${
            useStampPaperSpacing 
              ? "pt-[2.8in] print:pt-[2.8in]" 
              : ""
          }`}
        >
          {/* Main Legal Draft Body Text */}
          <div className="font-serif text-sm leading-[2] text-zinc-900 text-justify whitespace-pre-wrap max-w-full font-medium tracking-wide">
            {draft.content}
          </div>
        </div>

      </main>
    </div>
  );
}
