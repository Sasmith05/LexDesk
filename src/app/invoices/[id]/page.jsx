"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import { 
  ArrowLeft, 
  Printer, 
  Receipt, 
  Calendar, 
  User, 
  Briefcase, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Building,
  Mail,
  PhoneCall
} from "lucide-react";

export default function InvoiceDetailsPage({ params }) {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  
  const { id } = use(params);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/login");
    } else if (session?.user?.role === "staff") {
      router.push("/dashboard");
    }
  }, [sessionStatus, session, router]);

  useEffect(() => {
    if (sessionStatus === "authenticated" && id && session?.user?.role !== "staff") {
      fetchInvoiceDetails();
    }
  }, [id, sessionStatus, session]);

  async function fetchInvoiceDetails() {
    try {
      const res = await fetch(`/api/invoices/${id}`);
      if (res.ok) {
        const data = await res.json();
        setInvoice(data);
      } else {
        setError("Failed to locate invoice records.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while loading database logs.");
    } finally {
      setLoading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  // Status Badge Colors Helper
  function getStatusBadgeDetails(status) {
    switch (status) {
      case "Paid":
        return {
          bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
          dot: "bg-emerald-500",
          text: "Paid Stamp"
        };
      case "Unpaid":
        return {
          bg: "bg-amber-50 text-amber-800 border-amber-200",
          dot: "bg-amber-500",
          text: "Pending Payment"
        };
      case "Overdue":
        return {
          bg: "bg-rose-50 text-rose-800 border-rose-200",
          dot: "bg-rose-500",
          text: "Overdue Dues"
        };
      default:
        return {
          bg: "bg-zinc-50 text-zinc-800 border-zinc-200",
          dot: "bg-zinc-500",
          text: "Status Pending"
        };
    }
  }

  if (loading) {
    return (
      <div className="flex bg-zinc-50 min-h-screen font-sans">
        <Sidebar />
        <main className="flex-1 flex flex-col items-center justify-center gap-3 py-20">
          <div className="h-8 w-8 border-4 border-zinc-300 border-t-zinc-950 rounded-full animate-spin" />
          <p className="text-sm text-zinc-500 font-medium">Opening invoice receipt...</p>
        </main>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex bg-zinc-50 min-h-screen font-sans">
        <Sidebar />
        <main className="flex-1 p-8 md:p-10 max-w-2xl mx-auto overflow-hidden">
          <div className="bg-white border border-zinc-200 p-8 rounded-2xl shadow-sm text-center space-y-4">
            <div className="h-12 w-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={22} />
            </div>
            <h3 className="text-lg font-bold text-zinc-800">{error || "Invoice not found"}</h3>
            <Link
              href="/invoices"
              className="inline-flex items-center gap-2 bg-zinc-950 text-zinc-50 hover:bg-zinc-800 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
            >
              <ArrowLeft size={16} />
              Return to Invoices
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const badge = getStatusBadgeDetails(invoice.status);
  const items = invoice.items || [];
  
  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const taxAmount = subtotal * ((invoice.tax || 0) / 100);

  return (
    <div className="flex bg-zinc-50 min-h-screen font-sans print:bg-white print:block">
      <Sidebar />

      <main className="flex-1 p-8 md:p-10 max-w-4xl mx-auto overflow-hidden print:p-0 print:max-w-full print:mx-0">
        {/* Controls Panel (Hidden when printed) */}
        <div className="flex items-center justify-between gap-4 mb-8 print:hidden">
          <Link
            href="/invoices"
            className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-950 font-medium transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to invoices
          </Link>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 bg-zinc-950 text-zinc-50 hover:bg-zinc-800 active:bg-zinc-900 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all duration-200"
          >
            <Printer size={16} />
            Print Receipt
          </button>
        </div>

        {/* Invoice template box */}
        <div className="bg-white border border-zinc-200/80 p-8 md:p-12 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.02)] print:border-0 print:p-0 print:shadow-none space-y-8">
          
          {/* Letterhead Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-zinc-100 pb-8">
            <div className="space-y-1.5">
              <h2 className="text-3xl font-black text-zinc-950 tracking-tight">LexDesk</h2>
              <p className="text-xs text-zinc-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                <Building size={12} />
                Advocate & Legal Consultants
              </p>
            </div>
            <div className="text-left sm:text-right space-y-1">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                {badge.text}
              </span>
              <p className="text-sm font-black text-zinc-900 mt-1">Invoice #INV-{invoice.invoiceNumber}</p>
            </div>
          </div>

          {/* Details Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 bg-zinc-50/50 print:bg-transparent p-5 rounded-2xl border border-zinc-100 print:border-0 print:p-0">
            <div>
              <p className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400">Issue Date</p>
              <p className="text-sm font-semibold text-zinc-800 mt-0.5">
                {new Date(invoice.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400">Due Date</p>
              <p className="text-sm font-bold text-zinc-800 mt-0.5">
                {new Date(invoice.dueDate).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400">Payment Terms</p>
              <p className="text-sm font-semibold text-zinc-800 mt-0.5 flex items-center gap-1">
                <CreditCard size={13} className="text-zinc-400" />
                {invoice.paymentMethod}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400">Bill Currency</p>
              <p className="text-sm font-bold text-zinc-800 mt-0.5">INR (₹) - Rupees</p>
            </div>
          </div>

          {/* Client & Case Details Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-2">
            {/* Bill To */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase tracking-widest font-extrabold text-zinc-400 flex items-center gap-1.5">
                <User size={13} />
                Billed To
              </h3>
              <div className="space-y-1">
                <p className="text-base font-extrabold text-zinc-900">{invoice.client.name}</p>
                <p className="text-sm text-zinc-600 font-medium flex items-center gap-1.5">
                  <PhoneCall size={12} className="text-zinc-400" />
                  {invoice.client.phone}
                </p>
                <p className="text-sm text-zinc-500 font-medium leading-relaxed max-w-xs">
                  {invoice.client.address}
                </p>
              </div>
            </div>

            {/* Case Details */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase tracking-widest font-extrabold text-zinc-400 flex items-center gap-1.5">
                <Briefcase size={13} />
                Court Suit Reference
              </h3>
              <div className="space-y-1">
                {invoice.case ? (
                  <>
                    <p className="text-base font-extrabold text-zinc-900">{invoice.case.title}</p>
                    <p className="text-sm text-zinc-600 font-medium">{invoice.case.courtName}</p>
                    <p className="text-xs font-semibold text-zinc-400">ID: {invoice.case.id.toUpperCase()}</p>
                  </>
                ) : (
                  <p className="text-sm font-semibold text-zinc-400 italic bg-zinc-50 p-3 rounded-xl border border-zinc-100 max-w-xs">
                    General litigation consultation, drafting, and legal ledger services. No active court case linked.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Lines Table */}
          <div className="pt-4">
            <h3 className="text-xs uppercase tracking-widest font-extrabold text-zinc-400 mb-3">Fee Breakdowns & Ledger Line Items</h3>
            <div className="border border-zinc-200/80 rounded-2xl overflow-hidden print:border-zinc-300">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-zinc-50/80 print:bg-zinc-100 border-b border-zinc-200/80 print:border-zinc-300 font-semibold text-zinc-700">
                    <th className="py-3 px-5">Description</th>
                    <th className="py-3 px-5 text-center w-24">Qty</th>
                    <th className="py-3 px-5 text-right w-36">Unit Price (₹)</th>
                    <th className="py-3 px-5 text-right w-36">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-150 print:divide-zinc-200 text-zinc-800">
                  {items.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td className="py-3.5 px-5 font-semibold text-zinc-900">{item.description}</td>
                      <td className="py-3.5 px-5 text-center font-bold text-zinc-600">{item.quantity}</td>
                      <td className="py-3.5 px-5 text-right font-medium">₹{(item.unitPrice || 0).toLocaleString("en-IN")}</td>
                      <td className="py-3.5 px-5 text-right font-bold text-zinc-900">₹{(item.amount || 0).toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Remarks & Totals Block */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 pt-4">
            {/* Remarks and Bank terms */}
            <div className="flex-1 w-full space-y-4">
              {invoice.remarks && (
                <div className="space-y-1">
                  <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400">Ledger Remarks</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed font-medium bg-zinc-50 print:bg-transparent p-3 rounded-xl border border-zinc-150 print:border-0 print:p-0">
                    {invoice.remarks}
                  </p>
                </div>
              )}

              {/* Payment Details */}
              <div className="space-y-1 pb-4">
                <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400">Bank Transfer / UPI Details</h4>
                <div className="text-xs text-zinc-400 leading-relaxed font-medium space-y-0.5">
                  <p>Bank Name: State Bank of India (SBI)</p>
                  <p>Account Name: LexDesk Chambers Associates</p>
                  <p>A/c Number: 39401201402283</p>
                  <p>IFSC Code: SBIN0004839</p>
                  <p className="font-bold text-zinc-500 mt-1">UPI ID: lexdesk@sbi (Quick UPI payments)</p>
                </div>
              </div>
            </div>

            {/* Total aggregation block */}
            <div className="w-full md:w-80 flex flex-col space-y-2 text-right">
              <div className="flex justify-between text-xs font-semibold text-zinc-500">
                <span>Subtotal:</span>
                <span className="font-bold text-zinc-700">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              {invoice.tax > 0 && (
                <div className="flex justify-between text-xs font-semibold text-zinc-500">
                  <span>GST ({invoice.tax}%):</span>
                  <span className="text-zinc-700 font-bold">+₹{taxAmount.toLocaleString("en-IN")}</span>
                </div>
              )}
              {invoice.discount > 0 && (
                <div className="flex justify-between text-xs font-semibold text-zinc-500">
                  <span>Discount:</span>
                  <span className="text-rose-600 font-bold">-₹{(invoice.discount || 0).toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm font-bold text-zinc-800 pt-3 border-t border-zinc-200/80">
                <span>Grand Total:</span>
                <span className="text-2xl text-zinc-950 font-black">₹{(invoice.totalAmount || 0).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Professional footer note */}
          <div className="border-t border-zinc-150 pt-8 flex flex-col sm:flex-row justify-between text-xs text-zinc-400 font-medium gap-4">
            <p>Thank you for your business. For billing queries, reach us at support@lexdesk.in.</p>
            <p className="italic text-left sm:text-right">Authorized Seal & Signature</p>
          </div>

        </div>
      </main>
    </div>
  );
}
