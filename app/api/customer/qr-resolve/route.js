import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid");

    if (!uid) {
      return NextResponse.json({ error: "QR UID required" }, { status: 400 });
    }

    const qrTable = await prisma.qrManagement.findFirst({
      where: { uid: uid, isDeleted: false },
      include: {
        restaurant: {
          select: {
            id: true,
            restaurantName: true,
            slug: true,
          },
        },
      },
    });

    if (!qrTable) {
      return NextResponse.json({ error: "Invalid QR code" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      tableUid: qrTable.uid,
      tableTitle: qrTable.tableTitle,
      restaurantId: qrTable.restaurant.id,
      restaurantName: qrTable.restaurant.restaurantName,
      restaurantSlug: qrTable.restaurant.slug,
    });
  } catch (error) {
    console.error("QR Resolve Error:", error);
    return NextResponse.json({ error: "Failed to resolve QR code" }, { status: 500 });
  }
}
