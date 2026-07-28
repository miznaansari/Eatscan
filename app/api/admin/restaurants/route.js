import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const restaurants = await prisma.restaurant.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: "desc" },
      include: {
        rawMenuImages: { where: { isDeleted: false } },
        members: { where: { isDeleted: false } },
        _count: {
          select: {
            menus: { where: { isDeleted: false } },
            orders: { where: { isDeleted: false } },
            qrCodes: { where: { isDeleted: false } },
          },
        },
      },
    });

    return NextResponse.json({ success: true, restaurants });
  } catch (error) {
    console.error("Admin Fetch Restaurants Error:", error);
    return NextResponse.json({ error: "Failed to fetch restaurants" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { restaurantId, isActive } = await request.json();

    const updated = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: { isActive },
    });

    return NextResponse.json({ success: true, restaurant: updated });
  } catch (error) {
    console.error("Update Restaurant Status Error:", error);
    return NextResponse.json({ error: "Failed to update restaurant status" }, { status: 500 });
  }
}
