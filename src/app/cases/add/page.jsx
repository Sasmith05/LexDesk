"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/sidebar";
import { Scale, ArrowLeft, Loader2, Calendar, FileText, Landmark } from "lucide-react";

export default function AddCasePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [courtName, setCourtName] = useState("");
  const [status, setStatus] = useState("Open");
  const [hearingDate, setHearingDate] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !courtName.trim() || !status || !hearingDate) {
      setError("All fields are required.");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, courtName, status, hearingDate }),
      });

      if (res.ok) {
        router.push("/cases");
      } else {
        const data = await res.json();
        setError(data.error || "Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to submit case. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex bg-zinc-50 min-h-screen font-sans">
      <Sidebar />

      <main className="flex-1 p-8 md:p-10 max-w-2xl mx-auto overflow-hidden">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/cases"
            className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-950 font-medium transition-colors mb-4 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to cases
          </Link>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-3">
            <span className="h-10 w-10 bg-zinc-950 text-white rounded-xl flex items-center justify-center">
              <Scale size={20} />
            </span>
            Log New Court Case
          </h1>
          <p className="text-zinc-500 mt-2">Create a new legal lawsuit and schedule its upcoming hearing in LexDesk.</p>
        </div>

        {/* Form Box */}
        <div className="bg-white border border-zinc-200/85 p-8 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium flex items-center gap-2.5">
                <span className="h-1.5 w-1.5 bg-red-500 rounded-full flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Title Field */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-semibold text-zinc-800 flex items-center gap-1.5">
                <FileText size={15} className="text-zinc-400" />
                Case Title / Lawsuit Name
              </label>
              <input
                id="title"
                type="text"
                placeholder="e.g. Acme Corp vs. Wayne Industries"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent rounded-xl px-4 py-3 text-sm transition-all placeholder:text-zinc-400 text-zinc-900"
              />
            </div>

            {/* Court Name Field */}
            <div className="space-y-2">
              <label htmlFor="courtName" className="text-sm font-semibold text-zinc-800 flex items-center gap-1.5">
                <Landmark size={15} className="text-zinc-400" />
                Court Name / Jurisdiction
              </label>
              <input
                id="courtName"
                type="text"
                placeholder="e.g. Supreme Court of NY, District 5"
                value={courtName}
                onChange={(e) => setCourtName(e.target.value)}
                required
                className="w-full border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent rounded-xl px-4 py-3 text-sm transition-all placeholder:text-zinc-400 text-zinc-900"
              />
            </div>

            {/* Status & Hearing Date Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Status Select */}
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-semibold text-zinc-800 block">
                  Case Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent rounded-xl px-4 py-3 text-sm bg-white transition-all text-zinc-900 font-medium"
                >
                  <option value="Open">Open 🟢</option>
                  <option value="Pending">Pending 🟡</option>
                  <option value="Closed">Closed 🔴</option>
                </select>
              </div>

              {/* Hearing Date Picker */}
              <div className="space-y-2">
                <label htmlFor="hearingDate" className="text-sm font-semibold text-zinc-800 flex items-center gap-1.5">
                  <Calendar size={15} className="text-zinc-400" />
                  Hearing Schedule
                </label>
                <input
                  id="hearingDate"
                  type="datetime-local"
                  value={hearingDate}
                  onChange={(e) => setHearingDate(e.target.value)}
                  required
                  className="w-full border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent rounded-xl px-4 py-3 text-sm transition-all text-zinc-900"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
              <Link
                href="/cases"
                className="px-5 py-3 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-sm font-semibold text-zinc-700 transition-all duration-200"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 bg-zinc-950 text-zinc-50 hover:bg-zinc-850 active:bg-zinc-900 px-6 py-3 rounded-xl text-sm font-semibold shadow-sm transition-all duration-200 disabled:opacity-50 min-w-[120px]"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Case"
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
