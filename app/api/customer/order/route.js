import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { orderEvents } from "@/lib/sseManager";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      mobileNo,
      name,
      restaurantId,
      restaurantSlug,
      tableUid,
      items,
      specialNotes,
      paymentMethod = "CASH",
    } = body;

    if (!mobileNo || !items || !items.length) {
      return NextResponse.json(
        { error: "Mobile number and order items are required" },
        { status: 400 }
      );
    }

    // 0. Resolve valid target Restaurant record in database
    let targetRestaurant = null;

    if (restaurantId) {
      targetRestaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
      });
    }

    if (!targetRestaurant && restaurantSlug) {
      targetRestaurant = await prisma.restaurant.findUnique({
        where: { slug: restaurantSlug },
      });
    }

    if (!targetRestaurant && tableUid) {
      const tableRecord = await prisma.qrManagement.findFirst({
        where: { uid: tableUid },
        include: { restaurant: true },
      });
      if (tableRecord?.restaurant) {
        targetRestaurant = tableRecord.restaurant;
      }
    }

    // Fallback to first existing restaurant in database if ID is missing or invalid
    if (!targetRestaurant) {
      targetRestaurant = await prisma.restaurant.findFirst();
    }

    if (!targetRestaurant) {
      return NextResponse.json(
        { error: "No active restaurant found in database to place order." },
        { status: 404 }
      );
    }

    const validRestaurantId = targetRestaurant.id;

    // 1. Resolve or Create Customer linked to this Restaurant
    let customer = await prisma.customer.findFirst({
      where: { mobileNo: mobileNo.trim() },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          mobileNo: mobileNo.trim(),
          name: name ? name.trim() : "Guest Diner",
          createdFromRestaurantId: validRestaurantId,
          isVerifiedMobileNo: true,
        },
      });
    }

    // 2. Resolve QR Table if provided
    let qrTable = null;
    if (tableUid) {
      qrTable = await prisma.qrManagement.findFirst({
        where: { uid: tableUid, restaurantId: validRestaurantId },
      });

      if (!qrTable) {
        qrTable = await prisma.qrManagement.findFirst({
          where: { uid: tableUid },
        });
      }
    }

    // 3. Calculate Totals and Validate Menu Item IDs
    let totalAmount = 0;
    const formattedItems = [];

    for (const item of items) {
      const price = parseFloat(item.itemPrice || item.price || 0);
      const qty = parseInt(item.quantity || 1, 10);
      const subTotal = price * qty;
      totalAmount += subTotal;

      let validMenuId = item.menuId || item.id || null;
      if (validMenuId) {
        const menuExists = await prisma.menu.findUnique({
          where: { id: validMenuId },
        });
        if (!menuExists) validMenuId = null;
      }

      formattedItems.push({
        menuId: validMenuId,
        itemName: item.itemName || item.name || "Menu Item",
        itemPrice: price,
        variantName: item.variantName || null,
        selectedAddons: item.selectedAddons || (Array.isArray(item.addons) ? item.addons.join(", ") : null),
        quantity: qty,
        subTotal: subTotal,
        specialInstructions: item.specialInstructions || null,
      });
    }

    const taxAmount = totalAmount * 0.05; // 5% GST
    const grandTotal = totalAmount + taxAmount;

    // 4. Check for EXISTING ACTIVE RUNNING ORDER for this Customer at the SAME Restaurant and SAME Table
    const existingActiveOrder = await prisma.customerOrder.findFirst({
      where: {
        customerId: customer.id,
        restaurantId: validRestaurantId,
        qrTableId: qrTable ? qrTable.id : null,
        orderStatus: { in: ["PENDING", "ACCEPTED", "PREPARING"] },
        isDeleted: false,
      },
      include: {
        items: true,
        customer: true,
        qrTable: true,
        restaurant: true,
      },
    });

    let targetOrder = null;
    let isAppended = false;

    if (existingActiveOrder) {
      // APPEND ITEMS TO EXISTING ACTIVE ORDER!
      isAppended = true;
      const newTotalAmount = parseFloat(existingActiveOrder.totalAmount) + totalAmount;
      const newTaxAmount = newTotalAmount * 0.05;
      const newGrandTotal = newTotalAmount + newTaxAmount;

      const combinedNotes = specialNotes
        ? existingActiveOrder.specialNotes
          ? `${existingActiveOrder.specialNotes} | Add-on: ${specialNotes}`
          : specialNotes
        : existingActiveOrder.specialNotes;

      targetOrder = await prisma.customerOrder.update({
        where: { id: existingActiveOrder.id },
        data: {
          totalAmount: newTotalAmount,
          taxAmount: newTaxAmount,
          grandTotal: newGrandTotal,
          specialNotes: combinedNotes,
          updatedAt: new Date(),
          items: {
            create: formattedItems,
          },
        },
        include: {
          items: true,
          customer: true,
          qrTable: true,
          restaurant: true,
        },
      });
    } else {
      // CREATE BRAND NEW ORDER
      const orderNumber = `ES-${Math.floor(1000 + Math.random() * 9000)}`;
      targetOrder = await prisma.customerOrder.create({
        data: {
          orderNumber,
          customerId: customer.id,
          restaurantId: validRestaurantId,
          qrTableId: qrTable ? qrTable.id : null,
          totalAmount: totalAmount,
          taxAmount: taxAmount,
          grandTotal: grandTotal,
          orderStatus: "PENDING",
          paymentStatus: "PENDING",
          paymentMethod: paymentMethod,
          specialNotes: specialNotes || null,
          items: {
            create: formattedItems,
          },
        },
        include: {
          items: true,
          customer: true,
          qrTable: true,
          restaurant: true,
        },
      });
    }

    // 5. Trigger Real-Time SSE Notification to Manager PWA
    orderEvents.emit("new-order", {
      restaurantId: validRestaurantId,
      isAppended,
      order: {
        id: targetOrder.id,
        uid: targetOrder.uid,
        orderNumber: targetOrder.orderNumber,
        tableTitle: qrTable ? qrTable.tableTitle : "Direct Order",
        customerName: customer.name,
        customerMobile: customer.mobileNo,
        grandTotal: targetOrder.grandTotal,
        orderStatus: targetOrder.orderStatus,
        itemCount: targetOrder.items.length,
        createdAt: targetOrder.createdAt,
        items: targetOrder.items,
      },
    });

    return NextResponse.json({
      success: true,
      orderUid: targetOrder.uid,
      orderNumber: targetOrder.orderNumber,
      grandTotal: targetOrder.grandTotal,
      isAppended,
      message: isAppended
        ? "Items added to your active running order!"
        : "Order placed successfully!",
    });
  } catch (error) {
    console.error("Order Creation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to place order" }, { status: 500 });
  }
}
