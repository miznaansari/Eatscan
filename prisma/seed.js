const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting EatScan database seeding...");

  // 1. Create Default Roles
  const adminRole = await prisma.role.upsert({
    where: { roleName: "SUPER_ADMIN" },
    update: {},
    create: {
      roleName: "SUPER_ADMIN",
      description: "Super Administrator with full platform control",
    },
  });

  const ownerRole = await prisma.role.upsert({
    where: { roleName: "RESTAURANT_OWNER" },
    update: {},
    create: {
      roleName: "RESTAURANT_OWNER",
      description: "Restaurant Owner & Store Manager",
    },
  });

  const captainRole = await prisma.role.upsert({
    where: { roleName: "KITCHEN_CAPTAIN" },
    update: {},
    create: {
      roleName: "KITCHEN_CAPTAIN",
      description: "Kitchen Captain / Chef",
    },
  });

  // 2. Create Permissions
  const permissions = [
    "MANAGE_RESTAURANTS",
    "MANAGE_MENU",
    "MANAGE_TABLES",
    "VIEW_ORDERS",
    "UPDATE_ORDER_STATUS",
    "MANAGE_MEMBERS",
  ];

  for (const perm of permissions) {
    const existing = await prisma.rolePermission.findFirst({
      where: { permissionName: perm, roleId: adminRole.id },
    });
    if (!existing) {
      await prisma.rolePermission.create({
        data: {
          permissionName: perm,
          roleId: adminRole.id,
        },
      });
    }
  }

  // 3. Create Sample Restaurant (Spice Garden)
  const hashedPassword = await bcrypt.hash("eatscan123", 10);

  const restaurant = await prisma.restaurant.upsert({
    where: { slug: "spice-garden" },
    update: {},
    create: {
      restaurantName: "Spice Garden Bistro",
      slug: "spice-garden",
      password: hashedPassword,
      restaurantMobileNo: "+919876543210",
      restaurantEmail: "owner@spicegarden.com",
      address: "108 Foodie Boulevard, Indiranagar, Bengaluru",
      lat: 12.9716,
      long: 77.5946,
      isVerifiedMobileNo: true,
      isVerifiedEmail: true,
      isActive: true,
    },
  });

  // 4. Create Restaurant Member (Manager)
  await prisma.restaurantMember.upsert({
    where: { email: "manager@spicegarden.com" },
    update: {},
    create: {
      name: "Rahul Sharma",
      roleId: ownerRole.id,
      restaurantMemberRole: "MANAGER",
      email: "manager@spicegarden.com",
      mobileNo: "+919876543210",
      password: hashedPassword,
      isVerifiedMobileNo: true,
      isVerifiedEmail: true,
      restaurantId: restaurant.id,
    },
  });

  // 5. Create Restaurant Operating Timings (Multi-slot system)
  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
  for (const day of days) {
    const existingTimings = await prisma.restaurantTiming.findFirst({
      where: { restaurantId: restaurant.id, day: day },
    });

    if (!existingTimings) {
      // Slot 1: Lunch (11:00 AM - 03:30 PM)
      await prisma.restaurantTiming.create({
        data: {
          restaurantId: restaurant.id,
          day: day,
          startTime: "11:00",
          endTime: "15:30",
          isHoliday: false,
        },
      });
      // Slot 2: Dinner (07:00 PM - 11:00 PM)
      await prisma.restaurantTiming.create({
        data: {
          restaurantId: restaurant.id,
          day: day,
          startTime: "19:00",
          endTime: "23:00",
          isHoliday: false,
        },
      });
    }
  }

  // 6. Create Menu Categories
  const catStarters = await prisma.menuCategory.create({
    data: {
      categoryName: "Starters & Appetizers",
      description: "Crispy, savory snacks to begin your meal",
      displayOrder: 1,
      restaurantId: restaurant.id,
    },
  });

  const catMains = await prisma.menuCategory.create({
    data: {
      categoryName: "Main Course Delights",
      description: "Rich curries, biryanis & artisanal breads",
      displayOrder: 2,
      restaurantId: restaurant.id,
    },
  });

  const catBeverages = await prisma.menuCategory.create({
    data: {
      categoryName: "Mocktails & Beverages",
      description: "Refreshing cold press juices, shakes & coolers",
      displayOrder: 3,
      restaurantId: restaurant.id,
    },
  });

  // 7. Create Sample Menu Items
  await prisma.menu.createMany({
    data: [
      {
        itemName: "Paneer Tikka Angaara",
        description: "Charcoal grilled cottage cheese cubes marinated in smoked hung curd spicy masala",
        price: 320.00,
        discountPrice: 280.00,
        foodType: "VEG",
        imageUrl: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600",
        isAvailable: true,
        menuCategoryId: catStarters.id,
        restaurantId: restaurant.id,
      },
      {
        itemName: "Crispy Dynamite Chicken",
        description: "Tender fried chicken bites tossed in signature sweet sriracha mayo glaze",
        price: 380.00,
        discountPrice: 350.00,
        foodType: "NON_VEG",
        imageUrl: "https://images.unsplash.com/photo-1562967914-608f82629710?w=600",
        isAvailable: true,
        menuCategoryId: catStarters.id,
        restaurantId: restaurant.id,
      },
      {
        itemName: "Butter Chicken Dum Biryani",
        description: "Aromatic basmati rice layered with rich makhani gravy and charcoal smoked chicken",
        price: 450.00,
        discountPrice: 420.00,
        foodType: "NON_VEG",
        imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600",
        isAvailable: true,
        menuCategoryId: catMains.id,
        restaurantId: restaurant.id,
      },
      {
        itemName: "Dal Makhani Royale & Garlic Naan",
        description: "Slow simmered black lentils cooked overnight in cream and butter with hot garlic naan",
        price: 310.00,
        discountPrice: 290.00,
        foodType: "VEG",
        imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600",
        isAvailable: true,
        menuCategoryId: catMains.id,
        restaurantId: restaurant.id,
      },
      {
        itemName: "Mango Basil Cooler",
        description: "Fresh Alphonso mango nectar blended with crushed basil leaves and sparkling soda",
        price: 180.00,
        discountPrice: 150.00,
        foodType: "VEG",
        imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600",
        isAvailable: true,
        menuCategoryId: catBeverages.id,
        restaurantId: restaurant.id,
      },
    ],
  });

  // 8. Create Tables & QR Codes
  const table1 = await prisma.qrManagement.create({
    data: {
      uid: "tbl-spice-01",
      tableTitle: "Table 01 - Main Dining",
      seatingCapacity: 4,
      restaurantId: restaurant.id,
      qrCodeUrl: "/qr/tbl-spice-01",
    },
  });

  await prisma.qrManagement.create({
    data: {
      uid: "tbl-spice-02",
      tableTitle: "Table 02 - Window Seat",
      seatingCapacity: 2,
      restaurantId: restaurant.id,
      qrCodeUrl: "/qr/tbl-spice-02",
    },
  });

  await prisma.qrManagement.create({
    data: {
      uid: "tbl-spice-03",
      tableTitle: "Rooftop Garden 05",
      seatingCapacity: 6,
      restaurantId: restaurant.id,
      qrCodeUrl: "/qr/tbl-spice-03",
    },
  });

  console.log("✅ EatScan database seeded successfully!");
  console.log(`📍 Sample Restaurant: ${restaurant.restaurantName} (Slug: ${restaurant.slug})`);
  console.log(`🔑 Login Email: manager@spicegarden.com | Password: eatscan123`);
  console.log(`📱 Sample QR Code UID: ${table1.uid}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
