import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cases = await prisma.case.findMany({
      orderBy: { hearingDate: "asc" },
    });
    return NextResponse.json(cases);
  } catch (error) {
    console.error("Failed to fetch cases:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, courtName, status, hearingDate } = body;

    if (!title || !courtName || !status || !hearingDate) {
      return NextResponse.json(
        { error: "Title, court name, status, and hearing date are required" },
        { status: 400 }
      );
    }

    const newCase = await prisma.case.create({
      data: {
        title,
        courtName,
        status,
        hearingDate: new Date(hearingDate),
      },
    });

    return NextResponse.json(newCase, { status: 201 });
  } catch (error) {
    console.error("Failed to create case:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
