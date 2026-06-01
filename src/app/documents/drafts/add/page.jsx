"use client";

import { useState, useEffect, use, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/sidebar";
import { 
  Plus, 
  ArrowLeft, 
  Loader2, 
  Sparkles,
  ShieldAlert,
  Users,
  Layers,
  FileSignature,
  Edit,
  CheckCircle2,
  FileText
} from "lucide-react";
import { useSession } from "next-auth/react";

function DraftMergerForm() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedTemplateId = searchParams.get("templateId");

  const [clients, setClients] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  
  const [variables, setVariables] = useState({}); // { varName: value }
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [isFinalized, setIsFinalized] = useState(false); // variable phase vs text editing phase

  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/login");
    } else if (sessionStatus === "authenticated") {
      fetchRegistryDetails();
    }
  }, [sessionStatus, router]);

  async function fetchRegistryDetails() {
    try {
      const [clientsRes, templatesRes] = await Promise.all([
        fetch("/api/clients"),
        fetch("/api/documents/templates")
      ]);

      if (clientsRes.ok && templatesRes.ok) {
        const clientsData = await clientsRes.json();
        const templatesData = await templatesRes.json();

        setClients(clientsData);
        setTemplates(templatesData);

        if (clientsData.length > 0) {
          setSelectedClientId(clientsData[0].id);
        }

        if (preselectedTemplateId) {
          setSelectedTemplateId(preselectedTemplateId);
        } else if (templatesData.length > 0) {
          setSelectedTemplateId(templatesData[0].id);
        }
      } else {
        setError("Failed to load directories.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to database registry.");
    } finally {
      setFetching(false);
    }
  }

  // Parse variables from template whenever selected template or client changes
  useEffect(() => {
    if (!selectedTemplateId || templates.length === 0) return;

    const template = templates.find(t => t.id === selectedTemplateId);
    const client = clients.find(c => c.id === selectedClientId);
    
    if (!template) return;

    // Scan for tags like {{variableName}}
    const regex = /\{\{([^}]+)\}\}/g;
    const foundTags = [];
    let match;
    
    while ((match = regex.exec(template.bodyText)) !== null) {
      const tagName = match[1].trim();
      if (!foundTags.includes(tagName)) {
        foundTags.push(tagName);
      }
    }

    // Map initial variables
    const initialVars = {};
    foundTags.forEach(tag => {
      if (tag === "clientName") {
        initialVars[tag] = client ? client.name : "";
      } else if (tag === "clientPhone") {
        initialVars[tag] = client ? client.phone : "";
      } else if (tag === "clientAddress") {
        initialVars[tag] = client ? client.address : "";
      } else if (tag === "date") {
        initialVars[tag] = new Date().toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric"
        });
      } else {
        // Retain existing variable value if user was editing
        initialVars[tag] = variables[tag] || "";
      }
    });

    setVariables(initialVars);
    
    // Set default draft title
    const clientNameStr = client ? client.name : "Client";
    setDraftTitle(`Draft - ${template.title} - ${clientNameStr}`);
  }, [selectedTemplateId, selectedClientId, templates, clients]);

  // Compute merged document text in real-time
  const activeTemplate = templates.find(t => t.id === selectedTemplateId);
  const liveMergedText = activeTemplate 
    ? activeTemplate.bodyText.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
        const trimmedKey = key.trim();
        return variables[trimmedKey] !== undefined && variables[trimmedKey] !== "" 
          ? variables[trimmedKey] 
          : match;
      })
    : "";

  function handleFinalize() {
    setDraftContent(liveMergedText);
    setIsFinalized(true);
  }

  async function handleSaveDraft() {
    if (!draftTitle.trim() || !draftContent.trim() || !selectedClientId) {
      setError("Title, draft content, and client target are required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/documents/drafts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: draftTitle,
          content: draftContent,
          clientId: selectedClientId
        })
      });

      if (res.ok) {
        router.push("/documents");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save draft.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to documents backend.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex bg-zinc-50 min-h-screen font-sans">
      <Sidebar />

      <main className="flex-1 p-8 md:p-10 max-w-7xl mx-auto overflow-hidden">
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
              <Sparkles size={20} className="text-amber-400" />
            </span>
            Generate Client Document Draft
          </h1>
          <p className="text-zinc-500 mt-2">Fuse databases and legal outlines in real-time, compile variables instantly, and edit finalized text.</p>
        </div>

        {fetching ? (
          <div className="bg-white border border-zinc-200 p-8 rounded-2xl shadow-sm text-center py-20 flex flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 border-4 border-zinc-300 border-t-zinc-950 rounded-full animate-spin" />
            <p className="text-sm text-zinc-500 font-medium">Opening drafting registries...</p>
          </div>
        ) : clients.length === 0 ? (
          <div className="bg-white border border-zinc-200 p-8 rounded-2xl shadow-sm text-center py-16 space-y-4 max-w-md mx-auto">
            <div className="h-12 w-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <Users size={22} />
            </div>
            <h3 className="text-lg font-bold text-zinc-800">No clients registered</h3>
            <p className="text-sm text-zinc-400">
              You must register at least one client before generating a merged draft.
            </p>
            <Link
              href="/clients/add"
              className="inline-flex items-center gap-2 bg-zinc-950 text-zinc-50 hover:bg-zinc-800 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
            >
              Register Client First
            </Link>
          </div>
        ) : templates.length === 0 ? (
          <div className="bg-white border border-zinc-200 p-8 rounded-2xl shadow-sm text-center py-16 space-y-4 max-w-md mx-auto">
            <div className="h-12 w-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <Layers size={22} />
            </div>
            <h3 className="text-lg font-bold text-zinc-800">No templates found</h3>
            <p className="text-sm text-zinc-400">
              You must seed/create at least one document template outline before drafting.
            </p>
            <Link
              href="/documents/templates/add"
              className="inline-flex items-center gap-2 bg-zinc-950 text-zinc-50 hover:bg-zinc-800 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
            >
              Create Document Template
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            
            {/* Control Panel (2 Columns) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Selector Card */}
              <div className="bg-white border border-zinc-200/80 p-6 rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.02)] space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-zinc-800 flex items-center gap-2">
                  <FileSignature size={16} />
                  1. Choose Blueprint
                </h3>

                {/* Client Selection */}
                <div className="space-y-1.5">
                  <label htmlFor="clientSelect" className="text-xs font-semibold text-zinc-500">
                    Billed Client Target
                  </label>
                  <select
                    id="clientSelect"
                    value={selectedClientId}
                    disabled={isFinalized}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent rounded-xl px-3.5 py-2.5 text-xs bg-white font-bold text-zinc-900 disabled:opacity-60"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                    ))}
                  </select>
                </div>

                {/* Template Selection */}
                <div className="space-y-1.5">
                  <label htmlFor="templateSelect" className="text-xs font-semibold text-zinc-500">
                    Document Template Base
                  </label>
                  <select
                    id="templateSelect"
                    value={selectedTemplateId}
                    disabled={isFinalized}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="w-full border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent rounded-xl px-3.5 py-2.5 text-xs bg-white font-bold text-zinc-900 disabled:opacity-60"
                  >
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Variable Input Card */}
              {!isFinalized ? (
                <div className="bg-white border border-zinc-200/80 p-6 rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.02)] space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-wider text-zinc-800 flex items-center gap-2">
                    <Edit size={16} />
                    2. Fill Template Variables
                  </h3>
                  
                  {Object.keys(variables).length === 0 ? (
                    <p className="text-xs text-zinc-400 italic">No bracket tags found in this blueprint. Text will be compiled as-is.</p>
                  ) : (
                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                      {Object.keys(variables).map(key => {
                        const isAutoMerged = key === "clientName" || key === "clientAddress" || key === "clientPhone";
                        
                        return (
                          <div key={key} className="space-y-1.5 border-b border-zinc-50 pb-3">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-zinc-700 font-mono">
                                {"{{"}{key}{"}}"}
                              </label>
                              {isAutoMerged && (
                                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Auto-merged</span>
                              )}
                            </div>
                            <input
                              type="text"
                              value={variables[key]}
                              onChange={(e) => setVariables({ ...variables, [key]: e.target.value })}
                              placeholder={`Enter ${key}...`}
                              className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent ${
                                isAutoMerged 
                                  ? "border-emerald-100 bg-emerald-50/20 text-zinc-900 font-semibold" 
                                  : "border-zinc-200 bg-white text-zinc-900 font-medium"
                              }`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <button
                    onClick={handleFinalize}
                    className="w-full inline-flex items-center justify-center gap-2 bg-zinc-950 text-zinc-50 hover:bg-zinc-850 active:bg-zinc-900 px-4 py-3 rounded-xl text-xs font-bold shadow-sm transition-all"
                  >
                    <CheckCircle2 size={15} />
                    Compile & Finalize Text
                  </button>
                </div>
              ) : (
                <div className="bg-white border border-zinc-200/80 p-6 rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.02)] space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-wider text-zinc-800 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    3. Save Document
                  </h3>
                  
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-semibold leading-relaxed">
                      {error}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label htmlFor="draftTitle" className="text-xs font-bold text-zinc-500">
                      Finalized Draft Title
                    </label>
                    <input
                      id="draftTitle"
                      type="text"
                      value={draftTitle}
                      onChange={(e) => setDraftTitle(e.target.value)}
                      className="w-full border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent rounded-xl px-3.5 py-2.5 text-xs bg-white font-bold text-zinc-900"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsFinalized(false)}
                      className="flex-1 border border-zinc-200 hover:bg-zinc-50 px-3 py-2.5 rounded-xl text-xs font-semibold text-zinc-700 transition-all"
                    >
                      Back to Inputs
                    </button>
                    <button
                      onClick={handleSaveDraft}
                      disabled={saving}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 bg-zinc-950 text-zinc-50 hover:bg-zinc-850 active:bg-zinc-900 px-3 py-2.5 rounded-xl text-xs font-bold shadow-sm disabled:opacity-50 transition-all"
                    >
                      {saving ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Draft"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Document Preview / Polish area (3 Columns) */}
            <div className="lg:col-span-3">
              <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.02)] h-full min-h-[500px] flex flex-col">
                <div className="border-b border-zinc-100 px-6 py-4 flex items-center justify-between bg-zinc-50/50 rounded-t-2xl">
                  <span className="text-xs uppercase tracking-widest font-black text-zinc-400 flex items-center gap-1.5">
                    <FileText size={14} />
                    {isFinalized ? "Final Text Customization Editor" : "Live Variable Merging Preview"}
                  </span>
                </div>
                
                <div className="flex-1 p-8">
                  {!isFinalized ? (
                    <div className="border border-zinc-200/80 p-8 rounded-2xl min-h-[400px] bg-zinc-50/20 text-zinc-800 text-sm whitespace-pre-wrap font-serif leading-relaxed text-justify shadow-inner">
                      {liveMergedText || <p className="text-zinc-300 italic font-sans text-center mt-20">Choose a template blueprint to load variable structures.</p>}
                    </div>
                  ) : (
                    <textarea
                      value={draftContent}
                      onChange={(e) => setDraftContent(e.target.value)}
                      className="w-full border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400 rounded-2xl p-8 text-sm font-serif leading-relaxed text-zinc-950 bg-white h-[450px] resize-none text-justify"
                      placeholder="Add final statements or customize sentences directly here before printing..."
                    />
                  )}
                </div>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}

export default function GenerateDraftPage() {
  return (
    <Suspense fallback={
      <div className="flex bg-zinc-50 min-h-screen font-sans">
        <Sidebar />
        <main className="flex-1 flex flex-col items-center justify-center gap-3 py-20">
          <div className="h-8 w-8 border-4 border-zinc-300 border-t-zinc-950 rounded-full animate-spin" />
          <p className="text-sm text-zinc-500 font-medium">Opening drafting registries...</p>
        </main>
      </div>
    }>
      <DraftMergerForm />
    </Suspense>
  );
}
