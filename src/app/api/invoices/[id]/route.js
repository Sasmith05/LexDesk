import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role === "staff") {
    return NextResponse.json({ error: "Forbidden: Access Denied" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        client: true,
        case: true,
        items: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Failed to fetch invoice:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role === "staff") {
    return NextResponse.json({ error: "Forbidden: Access Denied" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { clientId, caseId, dueDate, status, tax, discount, paymentMethod, remarks, items } = body;

    if (!clientId || !dueDate || !status || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Client, due date, status, and billing items are required" },
        { status: 400 }
      );
    }

    const parsedTax = tax ? parseFloat(tax) : 0;
    const parsedDiscount = discount ? parseFloat(discount) : 0;

    // Calculate subtotal and line items
    let subtotal = 0;
    const itemsData = items.map((item) => {
      const quantity = item.quantity ? parseInt(item.quantity) : 1;
      const unitPrice = item.unitPrice ? parseFloat(item.unitPrice) : 0;
      const amount = quantity * unitPrice;
      subtotal += amount;

      return {
        description: item.description || "Filing & Legal Service",
        quantity,
        unitPrice,
        amount,
      };
    });

    const taxAmount = subtotal * (parsedTax / 100);
    const totalAmount = Math.max(0, subtotal + taxAmount - parsedDiscount);

    // Prune existing line items and save updates sequentially
    await prisma.invoiceItem.deleteMany({
      where: { invoiceId: id },
    });

    // Update invoice and re-create line items
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        clientId,
        caseId: caseId || null,
        dueDate: new Date(dueDate),
        status,
        tax: parsedTax,
        discount: parsedDiscount,
        totalAmount,
        paymentMethod: paymentMethod || "Cash",
        remarks: remarks || "",
        items: {
          create: itemsData,
        },
      },
      include: {
        items: true,
        client: true,
        case: true,
      },
    });

    return NextResponse.json(updatedInvoice);
  } catch (error) {
    console.error("Failed to update invoice:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role === "staff") {
    return NextResponse.json({ error: "Forbidden: Access Denied" }, { status: 403 });
  }

  try {
    const { id } = await params;
    await prisma.invoice.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("Failed to delete invoice:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
