"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/sidebar";
import { 
  Receipt, 
  ArrowLeft, 
  Loader2, 
  Calendar, 
  ShieldAlert, 
  Users, 
  Briefcase, 
  Plus, 
  Trash2, 
  CreditCard 
} from "lucide-react";

export default function AddInvoicePage() {
  const router = useRouter();
  
  const [clientId, setClientId] = useState("");
  const [caseId, setCaseId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("Unpaid");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [tax, setTax] = useState("0");
  const [discount, setDiscount] = useState("0");
  const [remarks, setRemarks] = useState("");
  
  // Dynamic line items state
  const [items, setItems] = useState([
    { description: "Legal Consultation Fees", quantity: 1, unitPrice: 1500 }
  ]);

  const [clients, setClients] = useState([]);
  const [cases, setCases] = useState([]);
  const [fetchingData, setFetchingData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDirectoryData();
  }, []);

  async function fetchDirectoryData() {
    try {
      const [clientsRes, casesRes] = await Promise.all([
        fetch("/api/clients"),
        fetch("/api/cases")
      ]);

      if (clientsRes.ok && casesRes.ok) {
        const clientsData = await clientsRes.json();
        const casesData = await casesRes.json();
        
        setClients(clientsData);
        setCases(casesData);
        
        if (clientsData.length > 0) {
          setClientId(clientsData[0].id);
        }
      } else {
        setError("Failed to load directories.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to directory registry.");
    } finally {
      setFetchingData(false);
    }
  }

  // Filter cases belonging to selected client
  const clientCases = cases.filter(c => c.clientId === clientId);

  // Auto-select first case of client if any, or default to standalone
  useEffect(() => {
    if (clientCases.length > 0) {
      setCaseId(clientCases[0].id);
    } else {
      setCaseId("");
    }
  }, [clientId, cases]);

  // Line items actions
  function addItem() {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0 }]);
  }

  function removeItem(index) {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index, field, value) {
    const updated = items.map((item, i) => {
      if (i !== index) return item;
      return {
        ...item,
        [field]: value
      };
    });
    setItems(updated);
  }

  // Live total calculations
  const subtotal = items.reduce((sum, item) => {
    const qty = parseInt(item.quantity) || 0;
    const price = parseFloat(item.unitPrice) || 0;
    return sum + (qty * price);
  }, 0);

  const parsedTax = parseFloat(tax) || 0;
  const parsedDiscount = parseFloat(discount) || 0;
  const taxAmount = subtotal * (parsedTax / 100);
  const grandTotal = Math.max(0, subtotal + taxAmount - parsedDiscount);

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!clientId || !dueDate || !status) {
      setError("Client name, due date, and invoice status are required.");
      return;
    }

    const invalidItem = items.some(item => !item.description.trim() || parseFloat(item.unitPrice) < 0);
    if (invalidItem) {
      setError("All line items must have descriptions and non-negative unit prices.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId,
          caseId: caseId || null,
          dueDate,
          status,
          tax: parsedTax,
          discount: parsedDiscount,
          paymentMethod,
          remarks,
          items
        }),
      });

      if (res.ok) {
        router.push("/invoices");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create invoice.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to billing server.");
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
            href="/invoices"
            className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-950 font-medium transition-colors mb-4 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to invoices
          </Link>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-3">
            <span className="h-10 w-10 bg-zinc-950 text-white rounded-xl flex items-center justify-center">
              <Receipt size={20} />
            </span>
            Create Billing Invoice
          </h1>
          <p className="text-zinc-500 mt-2">Log advocate fees, process taxes/discounts, and build custom line item receipts.</p>
        </div>

        {/* Form Box */}
        <div className="bg-white border border-zinc-200/85 p-8 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          {fetchingData ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 border-4 border-zinc-300 border-t-zinc-950 rounded-full animate-spin" />
              <p className="text-sm text-zinc-500 font-medium">Opening billing database modules...</p>
            </div>
          ) : clients.length === 0 ? (
            <div className="py-12 text-center space-y-4">
              <div className="h-12 w-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                <Users size={22} />
              </div>
              <h3 className="text-lg font-bold text-zinc-800">No clients registered</h3>
              <p className="text-sm text-zinc-400 max-w-xs mx-auto">
                You must register at least one client before generating a billing invoice.
              </p>
              <Link
                href="/clients/add"
                className="inline-flex items-center gap-2 bg-zinc-950 text-zinc-50 hover:bg-zinc-800 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm"
              >
                Register Client First
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium flex items-center gap-2.5">
                  <ShieldAlert size={16} className="text-red-500 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Client & Case Select row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Client Dropdown */}
                <div className="space-y-2">
                  <label htmlFor="client" className="text-sm font-semibold text-zinc-800 flex items-center gap-1.5">
                    <Users size={15} className="text-zinc-400" />
                    Bill To Client
                  </label>
                  <select
                    id="client"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    required
                    className="w-full border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent rounded-xl px-4 py-3 text-sm bg-white transition-all text-zinc-900 font-semibold"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Case Selector Dropdown */}
                <div className="space-y-2">
                  <label htmlFor="case" className="text-sm font-semibold text-zinc-800 flex items-center gap-1.5">
                    <Briefcase size={15} className="text-zinc-400" />
                    Link to Case (Optional)
                  </label>
                  <select
                    id="case"
                    value={caseId}
                    onChange={(e) => setCaseId(e.target.value)}
                    className="w-full border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent rounded-xl px-4 py-3 text-sm bg-white transition-all text-zinc-900 font-medium"
                  >
                    <option value="">No Case Linked (General Consultation)</option>
                    {clientCases.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.courtName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Invoicing Dates & Methods */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Due Date Picker */}
                <div className="space-y-2">
                  <label htmlFor="dueDate" className="text-sm font-semibold text-zinc-800 flex items-center gap-1.5">
                    <Calendar size={15} className="text-zinc-400" />
                    Due Date
                  </label>
                  <input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    className="w-full border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent rounded-xl px-4 py-3 text-sm transition-all text-zinc-900 font-semibold"
                  />
                </div>

                {/* Status Selector */}
                <div className="space-y-2">
                  <label htmlFor="status" className="text-sm font-semibold text-zinc-800 block">
                    Invoice Status
                  </label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent rounded-xl px-4 py-3 text-sm bg-white transition-all text-zinc-900 font-semibold"
                  >
                    <option value="Unpaid">Unpaid 🟡</option>
                    <option value="Paid">Paid 🟢</option>
                    <option value="Overdue">Overdue 🔴</option>
                  </select>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-2">
                  <label htmlFor="paymentMethod" className="text-sm font-semibold text-zinc-800 flex items-center gap-1.5">
                    <CreditCard size={15} className="text-zinc-400" />
                    Payment Method
                  </label>
                  <select
                    id="paymentMethod"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent rounded-xl px-4 py-3 text-sm bg-white transition-all text-zinc-900 font-medium"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI / QR">UPI / QR Code</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>

              {/* Reactive Line Items Grid */}
              <div className="space-y-3 pt-4 border-t border-zinc-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-zinc-900">Professional Fees & Billing Items</h3>
                  <button
                    type="button"
                    onClick={addItem}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-3 py-2 rounded-xl transition-all"
                  >
                    <Plus size={14} />
                    Add Fee Row
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row items-center gap-3 bg-zinc-50/50 p-4 rounded-xl border border-zinc-100 animate-in slide-in-from-top-2 duration-150">
                      {/* Description */}
                      <div className="flex-1 w-full space-y-1">
                        <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block sm:hidden">
                          Description
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Legal Consulting & Consultation"
                          value={item.description}
                          onChange={(e) => updateItem(idx, "description", e.target.value)}
                          required
                          className="w-full border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent rounded-xl px-3 py-2 text-sm bg-white transition-all text-zinc-900 font-medium"
                        />
                      </div>

                      {/* Quantity */}
                      <div className="w-24 w-full sm:w-24 space-y-1">
                        <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block sm:hidden">
                          Qty
                        </label>
                        <input
                          type="number"
                          min="1"
                          placeholder="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                          required
                          className="w-full border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent rounded-xl px-3 py-2 text-sm bg-white transition-all text-zinc-900 font-bold"
                        />
                      </div>

                      {/* Unit Price */}
                      <div className="w-36 w-full sm:w-36 space-y-1">
                        <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block sm:hidden">
                          Price (₹)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-semibold text-xs">₹</span>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(idx, "unitPrice", e.target.value)}
                            required
                            className="w-full border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent rounded-xl pl-6 pr-3 py-2 text-sm bg-white transition-all text-zinc-900 font-bold"
                          />
                        </div>
                      </div>

                      {/* Line subtotal representation */}
                      <div className="hidden sm:block text-right w-24 text-sm font-bold text-zinc-600">
                        ₹{(parseInt(item.quantity || 1) * parseFloat(item.unitPrice || 0)).toLocaleString("en-IN")}
                      </div>

                      {/* Delete item button */}
                      <button
                        type="button"
                        disabled={items.length === 1}
                        onClick={() => removeItem(idx)}
                        className="text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent h-9 w-9 rounded-xl flex items-center justify-center transition-colors"
                        title="Remove Line Item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Taxation & Discount Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-zinc-100">
                {/* GST Tax Picker */}
                <div className="space-y-2">
                  <label htmlFor="tax" className="text-sm font-semibold text-zinc-800">
                    Tax Percentage (GST %)
                  </label>
                  <select
                    id="tax"
                    value={tax}
                    onChange={(e) => setTax(e.target.value)}
                    className="w-full border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent rounded-xl px-4 py-3 text-sm bg-white transition-all text-zinc-900 font-bold"
                  >
                    <option value="0">No Tax (0%)</option>
                    <option value="5">Standard GST (5%)</option>
                    <option value="12">Standard GST (12%)</option>
                    <option value="18">Standard GST (18%)</option>
                  </select>
                </div>

                {/* Discount input in Rupees */}
                <div className="space-y-2">
                  <label htmlFor="discount" className="text-sm font-semibold text-zinc-800">
                    Discount Amount (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-semibold text-sm">₹</span>
                    <input
                      id="discount"
                      type="number"
                      min="0"
                      placeholder="e.g. 200"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="w-full border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent rounded-xl pl-8 pr-4 py-3 text-sm bg-white transition-all text-zinc-900 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Remarks Field */}
              <div className="space-y-2">
                <label htmlFor="remarks" className="text-sm font-semibold text-zinc-800">
                  Billing Remarks / Private Notes (Optional)
                </label>
                <textarea
                  id="remarks"
                  rows="3"
                  placeholder="e.g. Advised client about due dates. Included filing charges & drafting costs."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent rounded-xl px-4 py-3 text-sm transition-all placeholder:text-zinc-400 text-zinc-900 leading-relaxed"
                />
              </div>

              {/* Total Calculation Display Box */}
              <div className="bg-zinc-50 border border-zinc-150 p-6 rounded-2xl flex flex-col justify-end space-y-2.5 text-right w-full max-w-sm ml-auto">
                <div className="flex justify-between text-xs font-semibold text-zinc-500">
                  <span>Subtotal:</span>
                  <span className="font-bold">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                {parsedTax > 0 && (
                  <div className="flex justify-between text-xs font-semibold text-zinc-500">
                    <span>Tax ({parsedTax}%):</span>
                    <span className="text-zinc-700 font-bold">+₹{taxAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                {parsedDiscount > 0 && (
                  <div className="flex justify-between text-xs font-semibold text-zinc-500">
                    <span>Discount:</span>
                    <span className="text-rose-600 font-bold">-₹{parsedDiscount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm font-bold text-zinc-800 pt-2.5 border-t border-zinc-200">
                  <span>Total Amount Due:</span>
                  <span className="text-xl text-zinc-950 font-black">₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
                <Link
                  href="/invoices"
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
                    "Save Invoice"
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
