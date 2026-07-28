import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      where: { isDeleted: false },
      include: { permissions: { where: { isDeleted: false } } },
    });

    const members = await prisma.restaurantMember.findMany({
      where: { isDeleted: false },
      include: {
        role: true,
        restaurant: { select: { restaurantName: true } },
      },
    });

    return NextResponse.json({ success: true, roles, members });
  } catch (error) {
    console.error("Fetch Admin Members Error:", error);
    return NextResponse.json({ error: "Failed to fetch admin members" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, email, mobileNo, password, roleId, restaurantId, restaurantMemberRole } = await request.json();

    const hashedPassword = await bcrypt.hash(password || "eatscan123", 10);

    const newMember = await prisma.restaurantMember.create({
      data: {
        name,
        email,
        mobileNo,
        password: hashedPassword,
        roleId,
        restaurantId,
        restaurantMemberRole: restaurantMemberRole || "MANAGER",
        isVerifiedMobileNo: true,
        isVerifiedEmail: true,
      },
    });

    return NextResponse.json({ success: true, member: newMember });
  } catch (error) {
    console.error("Create Member Error:", error);
    return NextResponse.json({ error: "Failed to create team member" }, { status: 500 });
  }
}
