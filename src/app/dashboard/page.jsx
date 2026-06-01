import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

import { redirect } from "next/navigation";

import Sidebar from "@/components/sidebar";

export default async function Dashboard() {

  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex">

      <Sidebar />

      <div className="flex-1 p-10">

        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>

        <p className="mt-4 text-gray-500">
          Welcome to LexDesk
        </p>

      </div>

    </div>
  );
}