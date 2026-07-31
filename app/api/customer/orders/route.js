import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const mobileNo = searchParams.get("mobileNo");

    if (!mobileNo) {
      return NextResponse.json({ error: "Mobile number is required" }, { status: 400 });
    }

    const customer = await prisma.customer.findFirst({
      where: { mobileNo: mobileNo.trim(), isDeleted: false },
    });

    if (!customer) {
      return NextResponse.json({ success: true, activeOrders: [], pastOrders: [], allOrders: [] });
    }

    const orders = await prisma.customerOrder.findMany({
      where: { customerId: customer.id, isDeleted: false },
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        restaurant: {
          select: {
            restaurantName: true,
            slug: true,
            restaurantMobileNo: true,
            address: true,
          },
        },
        qrTable: true,
      },
    });

    const activeStatuses = ["PENDING", "ACCEPTED", "PREPARING", "SERVED"];
    const activeOrders = orders.filter((o) => activeStatuses.includes(o.orderStatus));
    const pastOrders = orders.filter((o) => !activeStatuses.includes(o.orderStatus));

    return NextResponse.json({ success: true, activeOrders, pastOrders, allOrders: orders });
  } catch (error) {
    console.error("Fetch Customer Orders History Error:", error);
    return NextResponse.json({ error: "Failed to fetch customer orders history" }, { status: 500 });
  }
}
