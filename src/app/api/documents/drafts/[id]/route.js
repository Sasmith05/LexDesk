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
    const draft = await prisma.documentDraft.findUnique({
      where: { id },
      include: {
        client: true
      }
    });

    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    return NextResponse.json(draft);
  } catch (error) {
    console.error("Failed to fetch draft:", error);
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
    const { title, content, clientId } = body;

    if (!title || !content || !clientId) {
      return NextResponse.json({ error: "Title, Content, and Client ID are required" }, { status: 400 });
    }

    const updatedDraft = await prisma.documentDraft.update({
      where: { id },
      data: {
        title,
        content,
        clientId
      },
      include: {
        client: true
      }
    });

    return NextResponse.json(updatedDraft);
  } catch (error) {
    console.error("Failed to update draft:", error);
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
    await prisma.documentDraft.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Draft deleted successfully" });
  } catch (error) {
    console.error("Failed to delete draft:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
