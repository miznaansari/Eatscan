import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Default Super Admin hardcoded check or DB check
    if (email === "admin@eatscan.online" && password === "eatscanSuper2026") {
      const token = signToken({
        adminId: "super-admin-01",
        role: "SUPER_ADMIN",
      });

      return NextResponse.json({
        success: true,
        token,
        admin: {
          id: "super-admin-01",
          name: "EatScan Super Admin",
          email: "admin@eatscan.online",
          role: "SUPER_ADMIN",
        },
      });
    }

    // Secondary DB check for members with SUPER_ADMIN role
    const member = await prisma.restaurantMember.findFirst({
      where: { email, isDeleted: false },
      include: { role: true },
    });

    if (member && (member.role.roleName === "SUPER_ADMIN" || member.restaurantMemberRole === "OWNER")) {
      const isValid = await bcrypt.compare(password, member.password);
      if (isValid) {
        const token = signToken({
          adminId: member.id,
          role: "SUPER_ADMIN",
        });

        return NextResponse.json({
          success: true,
          token,
          admin: {
            id: member.id,
            name: member.name,
            email: member.email,
            role: "SUPER_ADMIN",
          },
        });
      }
    }

    return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });
  } catch (error) {
    console.error("Admin Login Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
