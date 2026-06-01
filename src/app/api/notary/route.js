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
    const entries = await prisma.notaryEntry.findMany({
      orderBy: { serialNo: "desc" },
      include: { client: true },
    });
    return NextResponse.json(entries);
  } catch (error) {
    console.error("Failed to fetch notary entries:", error);
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
    const { documentName, executants, witnesses, stampDuty, notaryFee, notaryDate, remarks, clientId } = body;

    if (!documentName || !executants) {
      return NextResponse.json(
        { error: "Document name and executants are required" },
        { status: 400 }
      );
    }

    const parsedStampDuty = stampDuty ? parseFloat(stampDuty) : 0;
    const parsedNotaryFee = notaryFee ? parseFloat(notaryFee) : 0;

    const newEntry = await prisma.notaryEntry.create({
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

    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error("Failed to create notary entry:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
