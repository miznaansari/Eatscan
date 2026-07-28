import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { orderUid } = params;

    const order = await prisma.customerOrder.findFirst({
      where: { uid: orderUid, isDeleted: false },
      include: {
        items: true,
        restaurant: {
          select: {
            restaurantName: true,
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
