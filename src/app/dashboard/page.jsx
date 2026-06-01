import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Sidebar from "@/components/sidebar";
import DashboardCharts from "@/components/dashboard-charts";
import { prisma } from "@/lib/prisma";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // 1. Fetch Real Database Counts
  const clientCount = await prisma.client.count();
  const caseCount = await prisma.case.count();
  const pendingCount = await prisma.case.count({
    where: { status: "Pending" },
  });
  const openCount = await prisma.case.count({
    where: { status: "Open" },
  });
  const closedCount = await prisma.case.count({
    where: { status: "Closed" },
  });

  // 2. Compute Case Registration Trend Over Last 6 Months
  const cases = await prisma.case.findMany({
    select: { createdAt: true },
  });

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const monthlyCounts = {};

  // Initialize the last 6 months with 0
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthName = months[d.getMonth()];
    monthlyCounts[monthName] = 0;
  }

  // Group case intakes
  cases.forEach((c) => {
    const date = new Date(c.createdAt);
    const monthName = months[date.getMonth()];
    if (monthlyCounts[monthName] !== undefined) {
      monthlyCounts[monthName]++;
    }
  });

  const monthlyTrend = Object.keys(monthlyCounts).map((month) => ({
    month,
    count: monthlyCounts[month],
  }));

  return (
    <div className="flex bg-zinc-50 min-h-screen font-sans">
      <Sidebar />

      <main className="flex-1 p-8 md:p-10 max-w-7xl mx-auto overflow-hidden">
        {/* Top Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-zinc-500 mt-1">Real-time metrics, case registrations, and practice stats.</p>
        </div>

        {/* Dashboard Dynamic Analytics Panels */}
        <DashboardCharts
          clientCount={clientCount}
          caseCount={caseCount}
          pendingCount={pendingCount}
          openCount={openCount}
          closedCount={closedCount}
          monthlyTrend={monthlyTrend}
          role={session?.user?.role}
        />
      </main>
    </div>
  );
}