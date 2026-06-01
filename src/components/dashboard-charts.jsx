"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Briefcase, 
  Clock, 
  TrendingUp, 
  Activity
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

export default function DashboardCharts({ 
  clientCount, 
  caseCount, 
  pendingCount, 
  openCount, 
  closedCount,
  monthlyTrend,
  role
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Format Status Split Data for Pie Chart
  const statusSplitData = [
    { name: "Open Cases", value: openCount, color: "#10b981" },     // Emerald Green
    { name: "Pending Hearings", value: pendingCount, color: "#f59e0b" }, // Amber Yellow
    { name: "Closed Cases", value: closedCount, color: "#ef4444" }     // Rose Red
  ].filter(item => item.value > 0); // Only render items with counts > 0

  // Fallback to default distribution if no cases exist yet, to show a beautiful preview
  const activeStatusData = statusSplitData.length > 0 ? statusSplitData : [
    { name: "Open Cases", value: 3, color: "#10b981" },
    { name: "Pending Hearings", value: 2, color: "#f59e0b" },
    { name: "Closed Cases", value: 1, color: "#ef4444" }
  ];

  // If no trend data was parsed, populate a gorgeous default dataset spanning the last 6 months
  const defaultTrendData = [
    { name: "Jan", Cases: 2, Revenue: 1200 },
    { name: "Feb", Cases: 4, Revenue: 2400 },
    { name: "Mar", Cases: 3, Revenue: 1800 },
    { name: "Apr", Cases: 7, Revenue: 4200 },
    { name: "May", Cases: 5, Revenue: 3100 },
    { name: "Jun", Cases: monthlyTrend && monthlyTrend.length > 0 ? monthlyTrend[monthlyTrend.length - 1].count : 6, Revenue: 4500 }
  ];

  const chartData = monthlyTrend && monthlyTrend.length > 0 
    ? monthlyTrend.map(item => ({
        name: item.month,
        Cases: item.count,
        Revenue: item.count * 800 + 1000 // Compute dynamic mock revenue proportional to case intakes
      }))
    : defaultTrendData;

  if (!mounted) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 border-4 border-zinc-300 border-t-zinc-950 rounded-full animate-spin" />
        <p className="text-sm text-zinc-500 font-medium">Booting analytics panels...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Clients Card */}
        <div className="bg-white border border-zinc-200/80 p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-200 flex items-center gap-5 group">
          <div className="h-12 w-12 bg-zinc-100 group-hover:bg-zinc-950 group-hover:text-white rounded-xl flex items-center justify-center text-zinc-800 transition-all duration-300">
            <Users size={22} />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500">Total Clients</p>
            <h3 className="text-2xl font-bold text-zinc-900 mt-0.5">{clientCount}</h3>
          </div>
        </div>

        {/* Total Cases Card */}
        <div className="bg-white border border-zinc-200/80 p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-200 flex items-center gap-5 group">
          <div className="h-12 w-12 bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white rounded-xl flex items-center justify-center transition-all duration-300">
            <Briefcase size={22} />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500">Active Cases</p>
            <h3 className="text-2xl font-bold text-zinc-900 mt-0.5">{caseCount}</h3>
          </div>
        </div>

        {/* Pending Hearings Card */}
        <div className="bg-white border border-zinc-200/80 p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-200 flex items-center gap-5 group">
          <div className="h-12 w-12 bg-amber-50 text-amber-700 group-hover:bg-amber-500 group-hover:text-white rounded-xl flex items-center justify-center transition-all duration-300">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500">Upcoming Hearings</p>
            <h3 className="text-2xl font-bold text-zinc-900 mt-0.5">{pendingCount}</h3>
          </div>
        </div>
      </div>

      {/* Charts Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart (Spans 2 columns on large screens) */}
        <div className="bg-white border border-zinc-200/80 p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <TrendingUp size={18} className="text-zinc-500" />
                {role === "staff" ? "Case Trends" : "Case & Billing Trends"}
              </h3>
              <p className="text-xs text-zinc-400">
                {role === "staff" 
                  ? "Monthly breakdown of client litigations." 
                  : "Monthly breakdown of litigations and mock ledger collections."}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-zinc-700">
                <span className="h-2 w-2 bg-zinc-900 rounded-full" />
                Cases Filed
              </span>
              {role !== "staff" && (
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <span className="h-2 w-2 bg-emerald-500 rounded-full" />
                  Billing (₹)
                </span>
              )}
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: role === "staff" ? -20 : 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#18181b" stopOpacity={0.08}/>
                    <stop offset="95%" stopColor="#18181b" stopOpacity={0.01}/>
                  </linearGradient>
                  {role !== "staff" && (
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.08}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
                    </linearGradient>
                  )}
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#a1a1aa', fontSize: 12 }} 
                />
                <YAxis 
                  yAxisId="left"
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#a1a1aa', fontSize: 12 }} 
                />
                {role !== "staff" && (
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#a1a1aa', fontSize: 12 }} 
                    tickFormatter={(val) => `₹${val}`}
                  />
                )}
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '12px', 
                    borderColor: '#e4e4e7',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                  }}
                  labelStyle={{ fontWeight: 'bold', color: '#18181b' }}
                  formatter={(value, name) => {
                    if (role === "staff" && name === "Revenue") return [null, null];
                    return name === 'Revenue' ? [`₹${value}`, 'Billing'] : [value, name];
                  }}
                />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="Cases" 
                  stroke="#18181b" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorCases)" 
                />
                {role !== "staff" && (
                  <Area 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="Revenue" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Case Status Split (1 column) */}
        <div className="bg-white border border-zinc-200/80 p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <Activity size={18} className="text-zinc-500" />
              Status Split
            </h3>
            <p className="text-xs text-zinc-400">Proportional spread of litigation states.</p>
          </div>

          <div className="h-[200px] w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activeStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {activeStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '12px', 
                    borderColor: '#e4e4e7',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-zinc-900">
                {caseCount}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
                Total Cases
              </span>
            </div>
          </div>

          {/* Custom Status Legend */}
          <div className="space-y-2 mt-4">
            {activeStatusData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2 text-zinc-500">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="text-zinc-900 font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
