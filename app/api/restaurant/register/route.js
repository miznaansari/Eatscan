import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      restaurantName,
      restaurantEmail,
      restaurantMobileNo,
      password,
      address,
      rawMenuImageUrls = [],
      timings = [],
    } = body;

    if (!restaurantName || !restaurantEmail || !restaurantMobileNo || !password) {
      return NextResponse.json({ error: "All required fields must be filled" }, { status: 400 });
    }

    const slug = restaurantName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Create Restaurant Record
    const restaurant = await prisma.restaurant.create({
      data: {
        restaurantName,
        slug: `${slug}-${Math.floor(100 + Math.random() * 900)}`,
        password: hashedPassword,
        restaurantEmail,
        restaurantMobileNo,
        address,
        isVerifiedMobileNo: true,
        isVerifiedEmail: true,
      },
    });

    // 2. Assign Default OWNER Role & Member
    let ownerRole = await prisma.role.findFirst({
      where: { roleName: "RESTAURANT_OWNER" },
    });

    if (!ownerRole) {
      ownerRole = await prisma.role.create({
        data: { roleName: "RESTAURANT_OWNER", description: "Restaurant Owner" },
      });
    }

    await prisma.restaurantMember.create({
      data: {
        name: `${restaurantName} Owner`,
        roleId: ownerRole.id,
        restaurantMemberRole: "OWNER",
        email: restaurantEmail,
        mobileNo: restaurantMobileNo,
        password: hashedPassword,
        isVerifiedEmail: true,
        isVerifiedMobileNo: true,
        restaurantId: restaurant.id,
      },
    });

    // 3. Insert Raw Menu Images
    if (rawMenuImageUrls.length > 0) {
      await prisma.restaurantRawMenuImage.createMany({
        data: rawMenuImageUrls.map((url) => ({
          restaurantRawMenuImagesURL: url,
          restaurantId: restaurant.id,
        })),
      });
    }

    // 4. Insert Multi-Slot Timings
    if (timings.length > 0) {
      await prisma.restaurantTiming.createMany({
        data: timings.map((t) => ({
          restaurantId: restaurant.id,
          day: t.day || "MONDAY",
          startTime: t.startTime || "10:00",
          endTime: t.endTime || "22:00",
          isHoliday: !!t.isHoliday,
        })),
      });
    }

    // 5. Generate Default Table 01 QR Code
    const tableUid = `tbl-${Math.random().toString(36).substring(2, 9)}`;
    await prisma.qrManagement.create({
      data: {
        uid: tableUid,
        tableTitle: "Table 01 - Main Hall",
        seatingCapacity: 4,
        restaurantId: restaurant.id,
        qrCodeUrl: `/qr/${tableUid}`,
      },
    });

    return NextResponse.json({
      success: true,
      restaurantId: restaurant.id,
      slug: restaurant.slug,
    });
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: "Failed to register restaurant" }, { status: 500 });
  }
}
