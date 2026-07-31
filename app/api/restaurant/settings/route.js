import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId");
    if (!restaurantId) {
      return NextResponse.json({ error: "Missing restaurantId" }, { status: 400 });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: {
        id: true,
        restaurantName: true,
        themeMode: true,
        isCashEnabled: true,
        isOnlineUpiEnabled: true,
        isCreditCardEnabled: true,
      },
    });

    return NextResponse.json({ success: true, restaurant });
  } catch (error) {
    console.error("Fetch Restaurant Settings Error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { restaurantId, themeMode, isCashEnabled, isOnlineUpiEnabled, isCreditCardEnabled } = await request.json();
    if (!restaurantId) {
      return NextResponse.json({ error: "Missing restaurantId" }, { status: 400 });
    }

    const updated = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        ...(themeMode !== undefined && { themeMode }),
        ...(isCashEnabled !== undefined && { isCashEnabled }),
        ...(isOnlineUpiEnabled !== undefined && { isOnlineUpiEnabled }),
        ...(isCreditCardEnabled !== undefined && { isCreditCardEnabled }),
      },
    });

    return NextResponse.json({ success: true, restaurant: updated });
  } catch (error) {
    console.error("Update Restaurant Settings Error:", error);
    return NextResponse.json({ error: "Failed to update restaurant settings" }, { status: 500 });
  }
}
