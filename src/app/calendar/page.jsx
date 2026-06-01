"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/sidebar";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  Scale, 
  User, 
  MapPin, 
  Edit3, 
  X,
  CalendarCheck
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function CalendarPage() {
  const router = useRouter();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("Month"); // Month or Week
  const [selectedCase, setSelectedCase] = useState(null);

  useEffect(() => {
    fetchCases();
  }, []);

  async function fetchCases() {
    setLoading(true);
    try {
      const res = await fetch("/api/cases");
      if (res.ok) {
        const data = await res.json();
        setCases(data);
      }
    } catch (err) {
      console.error("Error fetching cases for calendar:", err);
    } finally {
      setLoading(false);
    }
  }

  // --- CALENDAR GRID COMPUTATION LOGIC ---
  const activeYear = currentDate.getFullYear();
  const activeMonth = currentDate.getMonth();

  // Programmatic Month Grid Helper (Yields clean 42-day calendar grids)
  function getDaysInMonthGrid(year, month) {
    const date = new Date(year, month, 1);
    const days = [];
    
    // Fill previous month trailing days
    const firstDayIndex = date.getDay();
    const prevMonthDaysCount = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDaysCount - i),
        isCurrentMonth: false
      });
    }
    
    // Fill current month days
    const currentMonthDaysCount = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= currentMonthDaysCount; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    
    // Fill next month leading days
    const totalSlots = 42; // standard 6-row calendar grid
    const remainingSlots = totalSlots - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }
    
    return days;
  }

  // Week Grid Helper (yields 7 days of the active week starting Sunday)
  function getDaysInWeek(dateObj) {
    const currentDay = dateObj.getDay();
    const firstDayOfWeek = new Date(dateObj);
    firstDayOfWeek.setDate(dateObj.getDate() - currentDay); // Start on Sunday
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(firstDayOfWeek);
      d.setDate(firstDayOfWeek.getDate() + i);
      weekDays.push(d);
    }
    return weekDays;
  }

  // Month navigation controllers
  function handlePrev() {
    if (viewMode === "Month") {
      setCurrentDate(new Date(activeYear, activeMonth - 1, 1));
    } else {
      const prevWeek = new Date(currentDate);
      prevWeek.setDate(currentDate.getDate() - 7);
      setCurrentDate(prevWeek);
    }
  }

  function handleNext() {
    if (viewMode === "Month") {
      setCurrentDate(new Date(activeYear, activeMonth + 1, 1));
    } else {
      const nextWeek = new Date(currentDate);
      nextWeek.setDate(currentDate.getDate() + 7);
      setCurrentDate(nextWeek);
    }
  }

  function handleToday() {
    setCurrentDate(new Date());
  }

  // Status Badge Helper
  function getStatusBadgeClass(status) {
    switch (status) {
      case "Open":
        return "bg-emerald-50 text-emerald-800 border-emerald-200/80";
      case "Pending":
        return "bg-amber-50 text-amber-800 border-amber-200/80";
      case "Closed":
        return "bg-rose-50 text-rose-800 border-rose-200/80";
      default:
        return "bg-zinc-50 text-zinc-800 border-zinc-200";
    }
  }

  const daysGrid = getDaysInMonthGrid(activeYear, activeMonth);
  const weekGrid = getDaysInWeek(currentDate);
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  // Helper to check if a Date matches "Today"
  const today = new Date();
  function isToday(d) {
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
  }

  // Helper to match cases on a specific day
  function getCasesForDay(date) {
    return cases.filter(c => {
      const hDate = new Date(c.hearingDate);
      return hDate.getDate() === date.getDate() &&
             hDate.getMonth() === date.getMonth() &&
             hDate.getFullYear() === date.getFullYear();
    });
  }

  // Helper to format Date to YYYY-MM-DD
  function formatDateQueryString(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  return (
    <div className="flex bg-zinc-50 min-h-screen font-sans">
      <Sidebar />

      <main className="flex-1 p-8 md:p-10 max-w-7xl mx-auto overflow-hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Hearing Calendar</h1>
            <p className="text-zinc-500 mt-1">Visually organize scheduled court lawsuits, verify timings, and log new hearings.</p>
          </div>
          <Link
            href="/cases/add"
            className="inline-flex items-center gap-2 bg-zinc-950 text-zinc-50 hover:bg-zinc-800 active:bg-zinc-900 px-5 py-3 rounded-xl font-medium shadow-sm transition-all duration-200"
          >
            <Plus size={18} />
            Log New Case
          </Link>
        </div>

        {/* Calendar Main Box */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 space-y-6">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            
            {/* View Month / Year and Navigation */}
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-zinc-900 min-w-[160px]">
                {viewMode === "Month" ? `${months[activeMonth]} ${activeYear}` : `Week of ${currentDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`}
              </h2>
              <div className="flex items-center border border-zinc-200 rounded-xl overflow-hidden shadow-sm bg-white">
                <button
                  onClick={handlePrev}
                  className="p-2.5 hover:bg-zinc-50 text-zinc-600 active:bg-zinc-100 transition-colors"
                  title="Previous"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={handleToday}
                  className="px-3 border-x border-zinc-200 py-2 hover:bg-zinc-50 text-xs font-bold text-zinc-800 active:bg-zinc-100 transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={handleNext}
                  className="p-2.5 hover:bg-zinc-50 text-zinc-600 active:bg-zinc-100 transition-colors"
                  title="Next"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Month/Week Toggle Tabs */}
            <div className="flex items-center gap-1.5 border border-zinc-200/80 p-1.5 rounded-xl bg-zinc-50/50 shadow-inner">
              {["Month", "Week"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    viewMode === mode 
                      ? "bg-zinc-950 text-zinc-50 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                  }`}
                >
                  {mode} View
                </button>
              ))}
            </div>
          </div>

          {/* Core Calendar Grid */}
          {loading ? (
            <div className="py-32 flex flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 border-4 border-zinc-300 border-t-zinc-950 rounded-full animate-spin" />
              <p className="text-sm text-zinc-500 font-medium">Opening calendar registers...</p>
            </div>
          ) : viewMode === "Month" ? (
            /* --- MONTH GRID VIEW --- */
            <div className="border border-zinc-200/80 rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.01)] bg-zinc-200/60">
              {/* Weekday Column Headers */}
              <div className="grid grid-cols-7 bg-zinc-50 text-center font-bold text-xs uppercase tracking-wider text-zinc-400 py-3 border-b border-zinc-200/80">
                {weekdays.map(day => (
                  <div key={day}>{day}</div>
                ))}
              </div>

              {/* standard 6-row month grid */}
              <div className="grid grid-cols-7 gap-px">
                {daysGrid.map((d, index) => {
                  const dayCases = getCasesForDay(d.date);
                  const isCurrent = d.isCurrentMonth;
                  const isDayToday = isToday(d.date);

                  return (
                    <div
                      key={index}
                      onClick={() => router.push(`/cases/add?date=${formatDateQueryString(d.date)}`)}
                      className={`min-h-[100px] p-2 flex flex-col justify-between cursor-pointer transition-all ${
                        isCurrent 
                          ? "bg-white hover:bg-zinc-50/50" 
                          : "bg-zinc-50/40 text-zinc-300 font-medium cursor-default"
                      } ${isDayToday ? "border-2 border-zinc-950 ring-2 ring-zinc-950/10 font-bold" : ""}`}
                      title={isCurrent ? "Click empty cell to schedule lawsuit" : ""}
                    >
                      {/* Day Number */}
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-extrabold ${
                          isDayToday 
                            ? "bg-zinc-950 text-zinc-50 h-5 w-5 rounded-full flex items-center justify-center" 
                            : isCurrent ? "text-zinc-800" : "text-zinc-300"
                        }`}>
                          {d.date.getDate()}
                        </span>
                        {isDayToday && (
                          <span className="text-[8px] uppercase tracking-wider font-extrabold text-zinc-950">Today</span>
                        )}
                      </div>

                      {/* Day Cases Badger list */}
                      <div className="mt-2 space-y-1.5 flex-1 flex flex-col justify-end">
                        {dayCases.map(c => (
                          <button
                            key={c.id}
                            onClick={(e) => {
                              e.stopPropagation(); // Stop parent redirect hook
                              setSelectedCase(c);
                            }}
                            className={`w-full text-left text-[10px] font-bold px-2 py-1 rounded-lg border truncate transition-all ${
                              c.status === "Open" ? "bg-emerald-50 text-emerald-800 border-emerald-200/80 hover:bg-emerald-100/50" :
                              c.status === "Pending" ? "bg-amber-50 text-amber-800 border-amber-200/80 hover:bg-amber-100/50" :
                              "bg-rose-50 text-rose-800 border-rose-200/80 hover:bg-rose-100/50"
                            }`}
                          >
                            {c.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* --- WEEK CARD LIST VIEW --- */
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {weekGrid.map((day, index) => {
                const dayCases = getCasesForDay(day);
                const isDayToday = isToday(day);

                return (
                  <div
                    key={index}
                    className={`border rounded-2xl p-4 flex flex-col justify-between gap-4 transition-all min-h-[300px] ${
                      isDayToday 
                        ? "bg-white border-2 border-zinc-950 ring-2 ring-zinc-950/10 shadow-md"
                        : "bg-zinc-50/30 border-zinc-200/80 hover:bg-white"
                    }`}
                  >
                    {/* Weekday Header */}
                    <div>
                      <p className={`text-xs font-extrabold uppercase tracking-widest ${isDayToday ? "text-zinc-900" : "text-zinc-400"}`}>
                        {weekdays[day.getDay()]}
                      </p>
                      <h4 className="text-lg font-black text-zinc-900 mt-0.5">
                        {day.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </h4>
                      {isDayToday && (
                        <span className="inline-flex bg-zinc-950 text-zinc-50 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full mt-1.5">
                          Today
                        </span>
                      )}
                    </div>

                    {/* Week Scheduled Cases list */}
                    <div className="flex-1 flex flex-col justify-start gap-2 pt-2">
                      {dayCases.length > 0 ? (
                        dayCases.map(c => (
                          <div
                            key={c.id}
                            onClick={() => setSelectedCase(c)}
                            className={`p-3 rounded-xl border text-left cursor-pointer transition-all hover:-translate-y-0.5 ${
                              c.status === "Open" ? "bg-emerald-50/50 text-emerald-900 border-emerald-200/80 hover:bg-emerald-50" :
                              c.status === "Pending" ? "bg-amber-50/50 text-amber-900 border-amber-200/80 hover:bg-amber-50" :
                              "bg-rose-50/50 text-rose-900 border-rose-200/80 hover:bg-rose-50"
                            }`}
                          >
                            <p className="text-xs font-bold truncate">{c.title}</p>
                            <p className="text-[10px] opacity-75 mt-0.5 flex items-center gap-1 font-semibold">
                              <Clock size={10} />
                              {new Date(c.hearingDate).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                          <p className="text-[10px] font-bold text-zinc-400 italic">No schedules</p>
                          <Link
                            href={`/cases/add?date=${formatDateQueryString(day)}`}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-500 hover:text-zinc-900 mt-2 bg-zinc-100 hover:bg-zinc-200 px-2 py-1 rounded-lg transition-colors"
                          >
                            <Plus size={10} />
                            Schedule
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* --- HEARING QUICK-VIEW DRAWER MODAL --- */}
      {selectedCase && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedCase(null)}
        >
          <div 
            className="bg-white border border-zinc-200/80 p-7 rounded-2xl max-w-md w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-200 space-y-6"
            onClick={(e) => e.stopPropagation()} // Stop modal close
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-150 pb-4">
              <div className="flex items-center gap-3">
                <span className="h-9 w-9 bg-zinc-950 text-white rounded-lg flex items-center justify-center">
                  <Scale size={18} />
                </span>
                <div>
                  <h3 className="text-lg font-extrabold text-zinc-900">Hearing Metadata</h3>
                  <p className="text-xs text-zinc-400 font-medium">Case ID: {selectedCase.id.toUpperCase()}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="text-zinc-400 hover:text-zinc-700 h-8 w-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content details */}
            <div className="space-y-4">
              {/* Suit Title */}
              <div>
                <p className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400">Case Title</p>
                <p className="text-base font-extrabold text-zinc-900 mt-0.5">{selectedCase.title}</p>
              </div>

              {/* Status Badge */}
              <div>
                <p className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400">Litigation State</p>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border mt-1 ${getStatusBadgeClass(selectedCase.status)}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    selectedCase.status === "Open" ? "bg-emerald-500" :
                    selectedCase.status === "Pending" ? "bg-amber-500" : "bg-rose-500"
                  }`} />
                  {selectedCase.status}
                </span>
              </div>

              {/* Court Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 flex items-center gap-1">
                    <MapPin size={11} />
                    Jurisdiction / Court
                  </p>
                  <p className="text-sm font-semibold text-zinc-800 mt-0.5">{selectedCase.courtName}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 flex items-center gap-1">
                    <Clock size={11} />
                    Scheduled Time
                  </p>
                  <p className="text-sm font-semibold text-zinc-800 mt-0.5">
                    {new Date(selectedCase.hearingDate).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Associated Client details */}
              <div className="bg-zinc-50 border border-zinc-150 p-4 rounded-xl space-y-2">
                <p className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 flex items-center gap-1">
                  <User size={11} />
                  Associated Client Profile
                </p>
                {selectedCase.client ? (
                  <div>
                    <p className="text-sm font-extrabold text-zinc-900">{selectedCase.client.name}</p>
                    <p className="text-xs text-zinc-500 font-semibold mt-0.5">Phone: {selectedCase.client.phone}</p>
                    <p className="text-xs text-zinc-400 font-medium leading-relaxed mt-1">{selectedCase.client.address}</p>
                  </div>
                ) : (
                  <p className="text-xs font-bold text-zinc-400 italic">No client profile mapped to lawsuit.</p>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-150">
              <button
                onClick={() => setSelectedCase(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-zinc-200 hover:bg-zinc-50 text-zinc-700 transition-colors"
              >
                Close
              </button>
              <Link
                href={`/cases/${selectedCase.id}/edit`}
                className="inline-flex items-center gap-1.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-50 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                <Edit3 size={14} />
                Edit / Reschedule
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
