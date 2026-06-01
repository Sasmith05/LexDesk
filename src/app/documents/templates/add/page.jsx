"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/sidebar";
import { 
  Plus, 
  ArrowLeft, 
  Loader2, 
  Layers, 
  ShieldAlert,
  Info
} from "lucide-react";
import { useSession } from "next-auth/react";

export default function AddTemplatePage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/login");
    }
  }, [sessionStatus, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !bodyText.trim()) {
      setError("Template Title and Body Text are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/documents/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          description,
          bodyText
        })
      });

      if (res.ok) {
        router.push("/documents");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save template.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to templates backend registry.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex bg-zinc-50 min-h-screen font-sans">
      <Sidebar />

      <main className="flex-1 p-8 md:p-10 max-w-4xl mx-auto overflow-hidden">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/documents"
            className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-950 font-medium transition-colors mb-4 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to documents
          </Link>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-3">
            <span className="h-10 w-10 bg-zinc-950 text-white rounded-xl flex items-center justify-center">
              <Layers size={20} />
            </span>
            Create Reusable Template
          </h1>
          <p className="text-zinc-500 mt-2">Design base blueprints for contracts, agreements, notary affidavits, or standard case drafts.</p>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form (2 columns) */}
          <div className="lg:col-span-2 bg-white border border-zinc-200/85 p-8 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] h-fit">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium flex items-center gap-2.5">
                  <ShieldAlert size={16} className="text-red-500 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Template Title */}
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-semibold text-zinc-800">
                  Template Title
                </label>
                <input
                  id="title"
                  type="text"
                  placeholder="e.g. Affidavit of Income Statement, GPA"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent rounded-xl px-4 py-3 text-sm bg-white transition-all text-zinc-900 font-bold"
                />
              </div>

              {/* Template Description */}
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-semibold text-zinc-800">
                  Short Description
                </label>
                <input
                  id="description"
                  type="text"
                  placeholder="Summarize when and how to use this template outline..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent rounded-xl px-4 py-3 text-sm bg-white transition-all text-zinc-900 font-medium"
                />
              </div>

              {/* Template Textarea */}
              <div className="space-y-2">
                <label htmlFor="bodyText" className="text-sm font-semibold text-zinc-800">
                  Template Content (With Variables)
                </label>
                <textarea
                  id="bodyText"
                  rows="15"
                  placeholder={`Write your standard legal text here...\n\nExample:\nThis agreement is made between {{clientName}}, residing at {{clientAddress}} and...`}
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  required
                  className="w-full border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent rounded-xl px-4 py-4 text-sm transition-all text-zinc-900 font-mono leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
                <Link
                  href="/documents"
                  className="px-5 py-3 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-sm font-semibold text-zinc-700 transition-all"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 bg-zinc-950 text-zinc-50 hover:bg-zinc-850 active:bg-zinc-900 px-6 py-3 rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-50 min-w-[120px]"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Template"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Guide Sidebar (1 column) */}
          <div className="space-y-6">
            <div className="bg-zinc-900 text-zinc-100 p-6 rounded-2xl border border-zinc-800 shadow-sm space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Info size={16} />
                Dynamic Variable Guide
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                To create a dynamic template, surround variable keywords with double curly brackets. 
                When generating a client draft, the LexDesk engine will automatically scan these tags and prompt you to fill them in!
              </p>
              
              <div className="space-y-3 pt-2">
                <h4 className="text-[10px] uppercase font-bold text-zinc-300 tracking-wider">Auto-Merged Tags:</h4>
                <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                  These tags are automatically filled using the selected client's profile in the database:
                </p>
                <ul className="text-xs font-mono space-y-1.5 text-zinc-200">
                  <li className="bg-white/5 px-2 py-1 rounded border border-white/5 font-semibold">{"{{clientName}}"}</li>
                  <li className="bg-white/5 px-2 py-1 rounded border border-white/5 font-semibold">{"{{clientPhone}}"}</li>
                  <li className="bg-white/5 px-2 py-1 rounded border border-white/5 font-semibold">{"{{clientAddress}}"}</li>
                </ul>

                <h4 className="text-[10px] uppercase font-bold text-zinc-300 tracking-wider pt-2">Custom Variables:</h4>
                <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                  Any other tags will be presented as simple form inputs for you to type in manually during drafting (e.g. witnesses, dates, notary fees):
                </p>
                <ul className="text-xs font-mono space-y-1.5 text-zinc-200">
                  <li className="bg-white/5 px-2 py-1 rounded border border-white/5">{"{{date}}"}</li>
                  <li className="bg-white/5 px-2 py-1 rounded border border-white/5">{"{{witnessOne}}"}</li>
                  <li className="bg-white/5 px-2 py-1 rounded border border-white/5">{"{{courtName}}"}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
