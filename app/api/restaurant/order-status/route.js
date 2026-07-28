import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request) {
  try {
    const { orderId, orderStatus, paymentStatus } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const updateData = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const updatedOrder = await prisma.customerOrder.update({
      where: { id: orderId },
      data: updateData,
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Update Order Status Error:", error);
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) {
      return NextResponse.json({ error: "Restaurant ID is required" }, { status: 400 });
    }

    const orders = await prisma.customerOrder.findMany({
      where: { restaurantId, isDeleted: false },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        items: true,
        qrTable: true,
        customer: true,
      },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Fetch Manager Orders Error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
