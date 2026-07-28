import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId");
    const slug = searchParams.get("slug");

    let targetRestaurantId = restaurantId;

    if (!targetRestaurantId && slug) {
      const rest = await prisma.restaurant.findFirst({
        where: { slug: slug, isDeleted: false },
      });
      if (rest) targetRestaurantId = rest.id;
    }

    if (!targetRestaurantId) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    const categories = await prisma.menuCategory.findMany({
      where: { restaurantId: targetRestaurantId, isDeleted: false },
      orderBy: { displayOrder: "asc" },
      include: {
        menus: {
          where: { isDeleted: false },
          orderBy: { createdAt: "desc" },
          include: {
            variants: true,
            addons: true,
          },
        },
      },
    });

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: targetRestaurantId },
      include: {
        rawMenuImages: { where: { isDeleted: false } },
        images: { where: { isDeleted: false } },
        timings: { where: { isDeleted: false } },
      },
    });

    return NextResponse.json({ success: true, restaurant, categories });
  } catch (error) {
    console.error("Fetch Menu Error:", error);
    return NextResponse.json({ error: "Failed to fetch menu" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      type,
      restaurantId,
      categoryName,
      itemName,
      price,
      discountPrice,
      foodType,
      imageUrl,
      menuCategoryId,
      variants = [],
      addons = [],
    } = body;

    if (type === "CATEGORY") {
      const newCat = await prisma.menuCategory.create({
        data: {
          categoryName,
          restaurantId,
        },
      });
      return NextResponse.json({ success: true, category: newCat });
    }

    if (type === "MENU_ITEM") {
      const newItem = await prisma.menu.create({
        data: {
          itemName,
          price: parseFloat(price),
          discountPrice: discountPrice ? parseFloat(discountPrice) : null,
          foodType: foodType || "VEG",
          imageUrl: imageUrl || null,
          menuCategoryId,
          restaurantId,
          variants: {
            create: (variants || []).map((v) => ({
              variantName: v.variantName,
              price: parseFloat(v.price),
            })),
          },
          addons: {
            create: (addons || []).map((a) => ({
              addonName: a.addonName,
              price: parseFloat(a.price),
            })),
          },
        },
        include: {
          variants: true,
          addons: true,
        },
      });
      return NextResponse.json({ success: true, item: newItem });
    }

    return NextResponse.json({ error: "Invalid action type" }, { status: 400 });
  } catch (error) {
    console.error("Menu Mutation Error:", error);
    return NextResponse.json({ error: "Failed to create menu item" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type"); // CATEGORY or MENU_ITEM

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    if (type === "CATEGORY") {
      await prisma.menuCategory.update({
        where: { id },
        data: { isDeleted: true, deletedAt: new Date() },
      });
    } else {
      await prisma.menu.update({
        where: { id },
        data: { isDeleted: true, deletedAt: new Date() },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: "Soft delete failed" }, { status: 500 });
  }
}
