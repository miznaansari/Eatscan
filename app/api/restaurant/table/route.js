import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) {
      return NextResponse.json({ error: "Restaurant ID required" }, { status: 400 });
    }

    const tables = await prisma.qrManagement.findMany({
      where: { restaurantId, isDeleted: false },
      orderBy: { id: "desc" },
    });

    return NextResponse.json({ success: true, tables });
  } catch (error) {
    console.error("Fetch Tables Error:", error);
    return NextResponse.json({ error: "Failed to fetch tables" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { restaurantId, tableTitle, seatingCapacity } = await request.json();

    if (!restaurantId || !tableTitle) {
      return NextResponse.json({ error: "Restaurant ID and Table title are required" }, { status: 400 });
    }

    const uid = `tbl-${Math.random().toString(36).substring(2, 9)}`;

    const newTable = await prisma.qrManagement.create({
      data: {
        uid,
        tableTitle,
        seatingCapacity: seatingCapacity ? parseInt(seatingCapacity, 10) : 4,
        restaurantId,
        qrCodeUrl: `/qr/${uid}`,
      },
    });

    return NextResponse.json({ success: true, table: newTable });
  } catch (error) {
    console.error("Create Table Error:", error);
    return NextResponse.json({ error: "Failed to create table" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tableId = searchParams.get("id");

    if (!tableId) return NextResponse.json({ error: "Table ID required" }, { status: 400 });

    await prisma.qrManagement.update({
      where: { id: tableId },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Table Error:", error);
    return NextResponse.json({ error: "Failed to soft-delete table" }, { status: 500 });
  }
}
