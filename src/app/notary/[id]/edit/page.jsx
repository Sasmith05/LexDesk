"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/sidebar";
import { FileText, ArrowLeft, Loader2, Calendar, ShieldAlert, Users, Coins } from "lucide-react";

export default function EditNotaryPage({ params }) {
  const router = useRouter();
  const { id } = use(params);

  const [documentName, setDocumentName] = useState("Affidavit");
  const [customDocumentName, setCustomDocumentName] = useState("");
  const [executants, setExecutants] = useState("");
  const [witnesses, setWitnesses] = useState("");
  const [stampDuty, setStampDuty] = useState("0");
  const [notaryFee, setNotaryFee] = useState("0");
  const [notaryDate, setNotaryDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [clientId, setClientId] = useState("");
  
  const [clients, setClients] = useState([]);
  const [fetchingClients, setFetchingClients] = useState(true);
  const [fetchingEntry, setFetchingEntry] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const documentOptions = [
    "Affidavit",
    "Agreement / Contract",
    "General Power of Attorney (GPA)",
    "Special Power of Attorney (SPA)",
    "Will & Testament",
    "Sale Deed",
    "Lease / Rental Agreement",
    "Partnership Deed",
    "Gift Deed",
    "Custom"
  ];

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (id) {
      fetchEntryDetails();
    }
  }, [id]);

  async function fetchClients() {
    try {
      const res = await fetch("/api/clients");
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      } else {
        setError("Failed to load clients list.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to clients directory.");
    } finally {
      setFetchingClients(false);
    }
  }

  async function fetchEntryDetails() {
    try {
      const res = await fetch(`/api/notary/${id}`);
      if (res.ok) {
        const data = await res.json();
        
        // Handle pre-defined or custom document names
        if (documentOptions.includes(data.documentName)) {
          setDocumentName(data.documentName);
        } else {
          setDocumentName("Custom");
          setCustomDocumentName(data.documentName);
        }
        
        setExecutants(data.executants);
        setWitnesses(data.witnesses || "");
        setStampDuty(String(data.stampDuty || 0));
        setNotaryFee(String(data.notaryFee || 0));
        setNotaryDate(formatDateTimeLocal(data.notaryDate));
        setRemarks(data.remarks || "");
        setClientId(data.clientId || "");
      } else {
        setError("Failed to fetch notary entry details.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while loading notary data.");
    } finally {
      setFetchingEntry(false);
    }
  }

  // Format date string to YYYY-MM-DDTHH:MM for datetime-local input
  function formatDateTimeLocal(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // Handle auto-fill when a client is selected
  function handleClientChange(selectedId) {
    setClientId(selectedId);
    if (selectedId) {
      const selectedClient = clients.find(c => c.id === selectedId);
      if (selectedClient) {
        setExecutants(selectedClient.name);
      }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const finalDocumentName = documentName === "Custom" ? customDocumentName : documentName;

    if (!finalDocumentName.trim() || !executants.trim()) {
      setError("Document type and executant name are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/notary/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentName: finalDocumentName,
          executants,
          witnesses,
          stampDuty: stampDuty ? parseFloat(stampDuty) : 0,
          notaryFee: notaryFee ? parseFloat(notaryFee) : 0,
          notaryDate: notaryDate ? new Date(notaryDate) : new Date(),
          remarks,
          clientId: clientId || null,
        }),
      });

      if (res.ok) {
        router.push("/notary");
      } else {
        const data = await res.json();
        setError(data.error || "Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to update entry. Please check your network connection.");
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
            href="/notary"
            className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-950 font-medium transition-colors mb-4 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to register
          </Link>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-3">
            <span className="h-10 w-10 bg-zinc-950 text-white rounded-xl flex items-center justify-center">
              <FileText size={20} />
            </span>
            Edit Notary Entry
          </h1>
          <p className="text-zinc-500 mt-2">Modify or update notarization details, stamps, and fees in the Notary Register.</p>
        </div>

        {/* Form Container */}
        <div className="bg-white border border-zinc-200/85 p-8 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          {fetchingClients || fetchingEntry ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 border-4 border-zinc-300 border-t-zinc-950 rounded-full animate-spin" />
              <p className="text-sm text-zinc-500 font-medium">Loading notary record parameters...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium flex items-center gap-2.5">
                  <ShieldAlert size={16} className="text-red-500 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Client Selection (Optional) */}
              <div className="space-y-2">
                <label htmlFor="client" className="text-sm font-semibold text-zinc-800 flex items-center gap-1.5">
                  <Users size={15} className="text-zinc-400" />
                  Link to Client (Optional)
                </label>
                <select
                  id="client"
                  value={clientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                  className="w-full border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent rounded-xl px-4 py-3 text-sm bg-white transition-all text-zinc-900 font-medium"
                >
                  <option value="">Standalone / Walk-in (No Link)</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-zinc-400">Selecting a client will automatically auto-fill the Executant field.</p>
              </div>

              {/* Document Type Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="documentName" className="text-sm font-semibold text-zinc-800 flex items-center gap-1.5">
                    <FileText size={15} className="text-zinc-400" />
                    Document Type
                  </label>
                  <select
                    id="documentName"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    required
                    className="w-full border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent rounded-xl px-4 py-3 text-sm bg-white transition-all text-zinc-900 font-semibold"
                  >
                    {documentOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {documentName === "Custom" && (
                  <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                    <label htmlFor="customDocumentName" className="text-sm font-semibold text-zinc-700">
                      Enter Custom Document Type
                    </label>
                    <input
                      id="customDocumentName"
                      type="text"
                      placeholder="e.g. Indemnity Bond, Relinquishment Deed"
                      value={customDocumentName}
                      onChange={(e) => setCustomDocumentName(e.target.value)}
                      required
                      className="w-full border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent rounded-xl px-4 py-3 text-sm transition-all text-zinc-900 placeholder:text-zinc-400"
                    />
                  </div>
                )}
              </div>

              {/* Executants Field */}
              <div className="space-y-2">
                <label htmlFor="executants" className="text-sm font-semibold text-zinc-800">
                  Executant Name(s) (Party executing document)
                </label>
                <input
                  id="executants"
                  type="text"
                  placeholder="e.g. Rajesh Kumar"
                  value={executants}
                  onChange={(e) => setExecutants(e.target.value)}
                  required
                  className="w-full border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent rounded-xl px-4 py-3 text-sm transition-all placeholder:text-zinc-400 text-zinc-900 font-semibold"
                />
              </div>

              {/* Witnesses Field */}
              <div className="space-y-2">
                <label htmlFor="witnesses" className="text-sm font-semibold text-zinc-800">
                  Witness Name(s)
                </label>
                <input
                  id="witnesses"
                  type="text"
                  placeholder="e.g. Suresh Patel, Anil Gupta"
                  value={witnesses}
                  onChange={(e) => setWitnesses(e.target.value)}
                  className="w-full border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent rounded-xl px-4 py-3 text-sm transition-all placeholder:text-zinc-400 text-zinc-900"
                />
              </div>

              {/* Fees & Stamp Duty Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Stamp Duty Field */}
                <div className="space-y-2">
                  <label htmlFor="stampDuty" className="text-sm font-semibold text-zinc-800 flex items-center gap-1.5">
                    Stamp Duty Paid (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-semibold text-sm">₹</span>
                    <input
                      id="stampDuty"
                      type="number"
                      min="0"
                      step="any"
                      placeholder="e.g. 100"
                      value={stampDuty}
                      onChange={(e) => setStampDuty(e.target.value)}
                      className="w-full border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent rounded-xl pl-8 pr-4 py-3 text-sm transition-all text-zinc-900 font-semibold"
                    />
                  </div>
                </div>

                {/* Notary Fee Field */}
                <div className="space-y-2">
                  <label htmlFor="notaryFee" className="text-sm font-semibold text-zinc-800 flex items-center gap-1.5">
                    Notary Fee Charged (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-semibold text-sm">₹</span>
                    <input
                      id="notaryFee"
                      type="number"
                      min="0"
                      step="any"
                      placeholder="e.g. 500"
                      value={notaryFee}
                      onChange={(e) => setNotaryFee(e.target.value)}
                      className="w-full border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent rounded-xl pl-8 pr-4 py-3 text-sm transition-all text-zinc-900 font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Date Field */}
              <div className="space-y-2">
                <label htmlFor="notaryDate" className="text-sm font-semibold text-zinc-800 flex items-center gap-1.5">
                  <Calendar size={15} className="text-zinc-400" />
                  Notarization Date
                </label>
                <input
                  id="notaryDate"
                  type="datetime-local"
                  value={notaryDate}
                  onChange={(e) => setNotaryDate(e.target.value)}
                  required
                  className="w-full border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent rounded-xl px-4 py-3 text-sm transition-all text-zinc-900"
                />
              </div>

              {/* Remarks Field */}
              <div className="space-y-2">
                <label htmlFor="remarks" className="text-sm font-semibold text-zinc-800">
                  Remarks / Ledger Notes (Optional)
                </label>
                <textarea
                  id="remarks"
                  rows="3"
                  placeholder="e.g. Document notarized in presence of both witnesses. Verified original ID cards."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent rounded-xl px-4 py-3 text-sm transition-all placeholder:text-zinc-400 text-zinc-900 leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
                <Link
                  href="/notary"
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
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
