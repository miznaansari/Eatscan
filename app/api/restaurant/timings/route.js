import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) {
      return NextResponse.json({ error: "Restaurant ID required" }, { status: 400 });
    }

    const timings = await prisma.restaurantTiming.findMany({
      where: { restaurantId, isDeleted: false },
      orderBy: [{ day: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json({ success: true, timings });
  } catch (error) {
    console.error("Fetch Timings Error:", error);
    return NextResponse.json({ error: "Failed to fetch restaurant timings" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { restaurantId, day, startTime, endTime, isHoliday } = await request.json();

    if (!restaurantId || !day || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Restaurant ID, Day, Start Time, and End Time are required" },
        { status: 400 }
      );
    }

    const newTimingSlot = await prisma.restaurantTiming.create({
      data: {
        restaurantId,
        day,
        startTime,
        endTime,
        isHoliday: !!isHoliday,
      },
    });

    return NextResponse.json({ success: true, timing: newTimingSlot });
  } catch (error) {
    console.error("Create Timing Error:", error);
    return NextResponse.json({ error: "Failed to create timing slot" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.restaurantTiming.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Timing Error:", error);
    return NextResponse.json({ error: "Failed to soft delete timing slot" }, { status: 500 });
  }
}
