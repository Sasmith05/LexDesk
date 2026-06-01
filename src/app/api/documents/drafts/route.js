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
    const drafts = await prisma.documentDraft.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true
          }
        }
      }
    });
    return NextResponse.json(drafts);
  } catch (error) {
    console.error("Failed to fetch drafts:", error);
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
    const { title, content, clientId } = body;

    if (!title || !content || !clientId) {
      return NextResponse.json({ error: "Title, Content, and Client ID are required" }, { status: 400 });
    }

    const newDraft = await prisma.documentDraft.create({
      data: {
        title,
        content,
        clientId
      },
      include: {
        client: true
      }
    });

    return NextResponse.json(newDraft, { status: 201 });
  } catch (error) {
    console.error("Failed to create document draft:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
