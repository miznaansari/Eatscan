import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: "desc" },
      include: {
        acquiredByRestaurant: {
          select: {
            restaurantName: true,
            slug: true,
          },
        },
        _count: {
          select: { orders: { where: { isDeleted: false } } },
        },
      },
    });

    return NextResponse.json({ success: true, customers });
  } catch (error) {
    console.error("Admin Fetch Customers Error:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}
