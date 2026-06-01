"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/sidebar";
import { UserPlus, ArrowLeft, Loader2, Phone, User, MapPin } from "lucide-react";

export default function AddClientPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError("All fields are required.");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, phone, address }),
      });

      if (res.ok) {
        router.push("/clients");
      } else {
        const data = await res.json();
        setError(data.error || "Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to submit client. Please check your network connection.");
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
            href="/clients"
            className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-950 font-medium transition-colors mb-4 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to clients
          </Link>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-3">
            <span className="h-10 w-10 bg-zinc-950 text-white rounded-xl flex items-center justify-center">
              <UserPlus size={20} />
            </span>
            Add Client Record
          </h1>
          <p className="text-zinc-500 mt-2">Create a new legal client directory record in LexDesk.</p>
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

            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold text-zinc-800 flex items-center gap-1.5">
                <User size={15} className="text-zinc-400" />
                Client Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="e.g. Johnathan Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent rounded-xl px-4 py-3 text-sm transition-all placeholder:text-zinc-400"
              />
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-semibold text-zinc-800 flex items-center gap-1.5">
                <Phone size={15} className="text-zinc-400" />
                Phone Number
              </label>
              <input
                id="phone"
                type="text"
                placeholder="e.g. +1 (555) 019-2834"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent rounded-xl px-4 py-3 text-sm transition-all placeholder:text-zinc-400"
              />
            </div>

            {/* Address Field */}
            <div className="space-y-2">
              <label htmlFor="address" className="text-sm font-semibold text-zinc-800 flex items-center gap-1.5">
                <MapPin size={15} className="text-zinc-400" />
                Physical Address
              </label>
              <textarea
                id="address"
                rows={3}
                placeholder="e.g. 100 Legal Ave, Suite 500, New York, NY 10001"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent rounded-xl px-4 py-3 text-sm transition-all placeholder:text-zinc-400 resize-none leading-relaxed"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
              <Link
                href="/clients"
                className="px-5 py-3 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-sm font-semibold text-zinc-700 transition-all duration-200"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 bg-zinc-950 text-zinc-50 hover:bg-zinc-800 active:bg-zinc-900 px-6 py-3 rounded-xl text-sm font-semibold shadow-sm transition-all duration-200 disabled:opacity-50 min-w-[120px]"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Client"
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
