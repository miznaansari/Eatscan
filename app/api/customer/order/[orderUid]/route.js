import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request, context) {
  try {
    const params = await context?.params;
    const orderUid = params?.orderUid;

    if (!orderUid) {
      return NextResponse.json({ error: "Order UID is required" }, { status: 400 });
    }

    const order = await prisma.customerOrder.findFirst({
      where: {
        OR: [
          { uid: orderUid },
          { id: orderUid },
        ],
        isDeleted: false,
      },
      include: {
        items: {
          orderBy: { createdAt: "asc" },
        },
        restaurant: {
          select: {
            id: true,
            restaurantName: true,
            slug: true,
            restaurantMobileNo: true,
            address: true,
          },
        },
        qrTable: true,
        customer: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Fetch Order Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
