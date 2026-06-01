import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const caseItem = await prisma.case.findUnique({
      where: { id },
      include: { client: true },
    });

    if (!caseItem) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    return NextResponse.json(caseItem);
  } catch (error) {
    console.error("Failed to fetch case:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { title, courtName, status, hearingDate, clientId } = body;

    if (!title || !courtName || !status || !hearingDate || !clientId) {
      return NextResponse.json(
        { error: "Title, court name, status, hearing date, and client are required" },
        { status: 400 }
      );
    }

    const updatedCase = await prisma.case.update({
      where: { id },
      data: {
        title,
        courtName,
        status,
        hearingDate: new Date(hearingDate),
        clientId,
      },
    });

    return NextResponse.json(updatedCase);
  } catch (error) {
    console.error("Failed to update case:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.case.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Case deleted successfully" });
  } catch (error) {
    console.error("Failed to delete case:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
