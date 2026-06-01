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
    const entry = await prisma.notaryEntry.findUnique({
      where: { id },
      include: { client: true },
    });

    if (!entry) {
      return NextResponse.json({ error: "Notary entry not found" }, { status: 404 });
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Failed to fetch notary entry:", error);
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
    const { documentName, executants, witnesses, stampDuty, notaryFee, notaryDate, remarks, clientId } = body;

    if (!documentName || !executants) {
      return NextResponse.json(
        { error: "Document name and executants are required" },
        { status: 400 }
      );
    }

    const parsedStampDuty = stampDuty ? parseFloat(stampDuty) : 0;
    const parsedNotaryFee = notaryFee ? parseFloat(notaryFee) : 0;

    const updatedEntry = await prisma.notaryEntry.update({
      where: { id },
      data: {
        documentName,
        executants,
        witnesses: witnesses || "",
        stampDuty: isNaN(parsedStampDuty) ? 0 : parsedStampDuty,
        notaryFee: isNaN(parsedNotaryFee) ? 0 : parsedNotaryFee,
        notaryDate: notaryDate ? new Date(notaryDate) : new Date(),
        remarks: remarks || "",
        clientId: clientId || null,
      },
    });

    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error("Failed to update notary entry:", error);
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
    await prisma.notaryEntry.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Notary entry deleted successfully" });
  } catch (error) {
    console.error("Failed to delete notary entry:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
