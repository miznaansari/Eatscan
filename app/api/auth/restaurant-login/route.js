import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const member = await prisma.restaurantMember.findFirst({
      where: { email, isDeleted: false },
      include: {
        restaurant: true,
        role: true,
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, member.password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = signToken({
      memberId: member.id,
      restaurantId: member.restaurantId,
      role: member.restaurantMemberRole,
    });

    // Create session record
    await prisma.restaurantMemberSession.create({
      data: {
        token,
        restaurantMemberId: member.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({
      success: true,
      token,
      member: {
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.restaurantMemberRole,
        restaurantId: member.restaurantId,
        restaurantName: member.restaurant.restaurantName,
        restaurantSlug: member.restaurant.slug,
      },
    });
  } catch (error) {
    console.error("Restaurant Login Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
